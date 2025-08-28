#!/usr/bin/env python3
import os, json, time, math, sys, traceback
from datetime import datetime
import os, urllib.parse
import redis

def build_redis():
    url = os.getenv("REDIS_URL", "").strip()
    if not url:
        # last-resort fallback (local dev only)
        return redis.Redis(host="127.0.0.1", port=6379, decode_responses=True)
    parsed = urllib.parse.urlparse(url)
    use_ssl = parsed.scheme == "rediss"
    return redis.from_url(url, decode_responses=True, ssl=use_ssl)

r = build_redis()

# ----------------------------
# Configuration
# ----------------------------
REDIS_URL = os.getenv("REDIS_URL", "")
FIELDS = ["fielda1", "field01", "fieldb1", "fieldmi1"]
LUX_NIGHT = float(os.getenv("PLT_LUX_NIGHT", "50"))   # threshold to consider "night"
INTERVAL_SEC = float(os.getenv("PLT_INTERVAL_SEC", "1.0"))

# ----------------------------
# Redis
# ----------------------------
r = redis.Redis.from_url(REDIS_URL, decode_responses=True)

def rget_json(key: str):
    raw = r.get(key)
    if not raw:
        return None
    try:
        return json.loads(raw)
    except Exception:
        return None

def rset_json(key: str, obj):
    r.set(key, json.dumps(obj))

# ----------------------------
# Helpers (PLT/COE/BW)
# ----------------------------
def night_flag(lux: float) -> bool:
    return lux < LUX_NIGHT

def node_angle_Omega(bearing_deg: float) -> float:
    # fold 0..360 → 0..180 to treat opposite headings symmetrically
    return abs((bearing_deg % 360.0))
    # If you prefer 0..180: return abs((bearing_deg % 180.0))

def ninety_proximity(angle_deg: float) -> float:
    # closeness to 90°: 1.0 = perfect, 0 = far
    return max(0.0, 1.0 - abs((angle_deg % 180.0) - 90.0)/90.0)

def coherence_from_mags(mx, my, mz) -> float:
    # crude coherence proxy by magnitude (cap at 1.0)
    mnorm = math.sqrt(mx*mx + my*my + mz*mz)
    return min(1.0, mnorm / 100.0)

def tih_over_dh(lux, ambient_temp, object_temp) -> str:
    # simple dominance model: bright/cool nights → TIH; hot/unstable → DH
    delta_t = abs(object_temp - ambient_temp)
    score = (max(0.0, 200.0 - lux)/200.0) + (max(0.0, 5.0 - delta_t)/5.0)
    return "TIH > DH" if score >= 1.0 else "DH dominant"

def mpa_read(field_id: str) -> float:
    raw = r.get(f"mpa:{field_id}")
    try:
        return float(raw) if raw is not None else 0.0
    except Exception:
        return 0.0

def mpa_write(field_id: str, val: float):
    r.set(f"mpa:{field_id}", f"{val:.6f}")

def mpa_update(prev: float, is_night: bool, harmful: bool) -> float:
    # build potential by day; reduce if harmful (e.g., destructive impulse)
    mpa = prev
    if not is_night:
        mpa = min(1.0, mpa + 0.01)
    if harmful:
        mpa = max(0.0, mpa - 0.05)
    return mpa

def argument_omega(mpa: float, harmful_flag: bool) -> float:
    # closeness to 90° improves with higher mpa; harm skews away
    center = 90.0
    skew = -30.0 if harmful_flag else 0.0
    arg = center + skew + (1.0 - mpa)*20.0
    return max(0.0, min(180.0, arg))

def true_anomaly_progress(zrasw_score: float) -> float:
    return max(0.0, min(1.0, zrasw_score))

def plt_score(ninety_node, ninety_arg, coherence, mpa, is_night) -> float:
    base = 0.35*ninety_node + 0.25*ninety_arg + 0.25*coherence + 0.15*mpa
    return min(1.0, base + (0.05 if is_night else 0.0))

def hemisphere_label(plt, node_deg) -> str:
    return "N≥S" if (plt >= 0.55 and ninety_proximity(node_deg) >= 0.5) else "S≤N"

# ----------------------------
# Enrichment
# ----------------------------
def get_sensors(packet: dict) -> dict:
    """
    Accepts either { sensors: {...} } or a flat packet.
    Returns a uniform dict of sensor values (floats/bools).
    """
    if not packet:
        return {}
    if isinstance(packet.get("sensors"), dict):
        s = packet["sensors"]
    else:
        s = packet

    def f(name, default=0.0):
        v = s.get(name, default)
        try:
            return float(v)
        except Exception:
            return default

    sensors = {
        "lux": f("lux", 0.0),
        "ambient_temp": f("ambient_temp", s.get("temp_ambient", 0.0)),
        "object_temp":  f("object_temp",  s.get("temp_object", 0.0)),
        "mag_x": f("mag_x", 0.0),
        "mag_y": f("mag_y", 0.0),
        "mag_z": f("mag_z", 0.0),
        "bearing_deg": f("bearing_deg", 0.0),
        "analog_v": f("analog_v", 0.0),
    }
    # boolean-ish
    lt = s.get("laser_triggered", False)
    sensors["laser_triggered"] = bool(lt) if isinstance(lt, bool) else str(lt).lower()=="true"
    return sensors

def enrich_field(field_id: str, raw_packet: dict) -> dict:
    sensors = get_sensors(raw_packet)

    lux = sensors["lux"]
    amb = sensors["ambient_temp"]
    obj = sensors["object_temp"]
    mx, my, mz = sensors["mag_x"], sensors["mag_y"], sensors["mag_z"]
    bearing = sensors["bearing_deg"]
    laser = sensors["laser_triggered"]

    is_night = night_flag(lux)

    # persistent .mpa per field
    mpa_prev = mpa_read(field_id)
    mpa_now  = mpa_update(mpa_prev, is_night, laser)
    mpa_write(field_id, mpa_now)

    # angles & proximity to 90°
    omega_node = node_angle_Omega(bearing)        # Ω
    near90_node = ninety_proximity(omega_node)

    harmful = laser
    omega_arg = argument_omega(mpa_now, harmful)  # ω
    near90_arg = ninety_proximity(omega_arg)

    # stability / readiness
    coherence = coherence_from_mags(mx, my, mz)
    tih_dh_txt = tih_over_dh(lux, amb, obj)

    # ZraSW proxy & progress (ν)
    zrasw_score = (coherence + near90_node + near90_arg)/3.0
    nu = true_anomaly_progress(zrasw_score)

    # PLT master score & hemisphere
    plt = plt_score(near90_node, near90_arg, coherence, mpa_now, is_night)
    hemi = hemisphere_label(plt, omega_node)

    leaf_plt = "locked" if (plt >= 0.7 and near90_node >= 0.6 and near90_arg >= 0.6 and nu >= 0.6) else "pending"

    # Construct enriched packet (preserve original)
    enriched = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "field_id": field_id,
        "sensors": sensors,              # keep normalized sensors
        "plt_orbit": {
            "plt_score": round(plt, 3),
            "hemisphere": hemi,               # "N≥S" | "S≤N"
            "tih_dh": tih_dh_txt,             # "TIH > DH" | "DH dominant"
            "node_deg": round(omega_node, 2),
            "arg_deg":  round(omega_arg, 2),
            "near_90_node": round(near90_node, 3),
            "near_90_arg":  round(near90_arg, 3),
            ".mpa": round(mpa_now, 3),
            "true_anomaly_nu": round(nu, 3),
            "leaf_plt": leaf_plt,
            "is_night": is_night
        }
    }

    # If an existing structure has other sections, merge them in
    if isinstance(raw_packet, dict):
        # don’t clobber; preserve known top-level props
        for k in ("quantum_digestion", "coe_elements", "ldd_phase", "aggregates"):
            if k in raw_packet and k not in enriched:
                enriched[k] = raw_packet[k]

    return enriched

# ----------------------------
# Main Loop
# ----------------------------
def run():
    print(f"[COE] Gatekeeper active → Redis:{REDIS_URL}  interval={INTERVAL_SEC}s  night@lux<{LUX_NIGHT}")
    while True:
        try:
            updated = 0
            for fid in FIELDS:
                raw = rget_json(fid)
                enriched = enrich_field(fid, raw or {})
                rset_json(fid, enriched)
                updated += 1
            print(f"[OK] Enriched & cached {updated} fields @ {datetime.utcnow().strftime('%H:%M:%S')}")
        except KeyboardInterrupt:
            print("\n[COE] Shutting down gracefully.")
            sys.exit(0)
        except Exception as e:
            print("[ERR] COE loop failure:", e)
            traceback.print_exc()
            time.sleep(1.0)
        time.sleep(INTERVAL_SEC)

if __name__ == "__main__":
    run()
