#!/usr/bin/env python3
from __future__ import annotations
import sys, json, argparse, time
from dataclasses import dataclass, asdict
from enum import Enum
from math import pi
from typing import List, Tuple, Optional
from quantum_digestion import quantum_digest

SCHEMA_HINT = {
    "required_keys": [
        "field_id",
        "sensors",
        "zrasw_progress",
        "seconds_active_today",
        "i_score_over_25",
        "laws_score"
    ],
    "sensors": {
        "analog_v": "float — MQ voltage (NH3 proxy)",
        "lux": "float — light sensor",
        "temp_object": "float — object temperature (°C)",
        "temp_ambient": "float — ambient temperature (°C)",
        "bearing_deg": "float — compass bearing (0-360°)"
    }
}

SECONDS_PER_DAY = 86400

# ==========================================================
# ============= QUANTUM FEATURE DERIVATION =================
# ==========================================================

def derive_nh3_entropy(payload):
    """NH3 entropy proxy based on MQ voltage"""
    voltage = payload["sensors"].get("analog_v") or 0.0
    return min(max(voltage / 3.3, 0), 1)

def derive_nh4_enthalpy(payload):
    """NH4 enthalpy proxy based on Lux & temperature deltas"""
    lux = payload["sensors"].get("lux") or 0.0
    temp_obj = payload["sensors"].get("temp_object")
    temp_amb = payload["sensors"].get("temp_ambient")
    # Special case for FieldMI1 → treat temperatures as null
    if payload.get("field_id", "").lower() == "fieldmi1":
        temp_obj, temp_amb = 0.0, 0.0
    temp_delta = max((temp_obj or 0) - (temp_amb or 0), 0)
    return min((lux * 0.0001) + (temp_delta / 100), 1)

def derive_sunrise_sunset_phase(payload):
    """Normalized Lux-to-ambient temp ratio"""
    lux = payload["sensors"].get("lux") or 0.0
    temp_amb = payload["sensors"].get("temp_ambient") or 0.0
    if payload.get("field_id", "").lower() == "fieldmi1":
        temp_amb = 1e-5  # avoid div by zero
    return min(lux / (temp_amb + 1e-5), 1)

def derive_naf_sue_phase(payload):
    """Naf-Sue normalized bearing angle"""
    bearing = payload["sensors"].get("bearing_deg") or 0.0
    return round((bearing % 360) / 360.0, 4)

# ==========================================================
# ================== CLASSICAL COMPUTE =====================
# ==========================================================

class Field(str, Enum):
    LDD1 = "LDD1"
    LDD2 = "LDD2"  # Dech-only; Ld(16–29) summation foregone

class CFStatus(str, Enum):
    TRIUMPHANT = "P/0"
    NEUTRAL = "0→?"
    TRAGIC = "-1/-2"

@dataclass
class COEState:
    a: float
    e: float
    i: float
    Ω: float
    ω: float
    ν: float

@dataclass
class Output:
    coe: COEState
    cf: CFStatus
    gyro_vector: Tuple[float,float,float]
    energy_scale: float
    notes: List[str]

def clamp01(x: float) -> float:
    return 0.0 if x < 0.0 else 1.0 if x > 1.0 else x

def law_scaler(laws_score: List[int]) -> tuple[float,float]:
    if len(laws_score) != 25:
        raise ValueError("laws_score must have 25 entries of 0/-1/-2.")
    kept = sum(1 for s in laws_score if s == 0)
    tragic = sum(abs(s) for s in laws_score if s < 0)
    TIH = kept / 25.0
    DH  = tragic / max(1, tragic + kept)
    return TIH, DH

def enforce_scope(field: Field, notes: List[str]) -> Field:
    if field == Field.LDD2:
        notes.append("Ld(16–29) summation foregone; Dech-only path in LdD2.")
    return field

def coe_from_ldd_spec(
    field: Field,
    zrasw_progress: float,
    seconds_active_today: int,
    i_score_over_25: int,
    laws_score: List[int],
    mpa_sunrise_sunset_phase: Optional[float],
    naf_sue_phase: Optional[float],
    nh3_entropy: float = 0.0,
    nh4_enthalpy: float = 0.0,
    vsepr_symmetry: bool = False
) -> Output:
    notes: List[str] = []
    field = enforce_scope(field, notes)
    energy_scale = 2.0 if field == Field.LDD2 else 1.0
    a = clamp01(zrasw_progress)
    notes.append(f"Energy scale = {energy_scale}x; a normalized to shared path.")

    e_base = clamp01(seconds_active_today / SECONDS_PER_DAY)
    e = clamp01(e_base + 0.5*clamp01(nh3_entropy) - 0.3*clamp01(nh4_enthalpy))
    if nh3_entropy: notes.append(f"NH3 entropy +{nh3_entropy:.2f} → e↑")
    if nh4_enthalpy: notes.append(f"NH4 enthalpy +{nh4_enthalpy:.2f} → e↓ & Ω bias")

    TIH, DH = law_scaler(laws_score)
    force_vsepr = (TIH > DH) or vsepr_symmetry or (nh4_enthalpy > 0.6)
    Ω = pi/2 if force_vsepr else float(mpa_sunrise_sunset_phase or 0.0)

    i_map = {-2: 1.0, -1: 0.5, 0: 0.0}
    i = i_map.get(i_score_over_25, 1.0) * (pi if field == Field.LDD1 else 0.0)
    ω = (2*pi * clamp01(zrasw_progress) * (2.0 if field == Field.LDD2 else 1.0)) % (2*pi)
    ν = (naf_sue_phase - ω) % (2*pi) if naf_sue_phase is not None else 0.0

    coe = COEState(a=a, e=e, i=i, Ω=Ω, ω=ω, ν=ν)
    cf = CFStatus.TRIUMPHANT if TIH > 0.9 and e < 0.2 and a >= 0.5 else CFStatus.TRAGIC if DH > TIH and e > 0.5 else CFStatus.NEUTRAL

    lift = max(0.0, TIH - DH) * energy_scale * (1.0 - e)
    dPitch = (+1 if field == Field.LDD2 else -1) * 0.5 * lift
    dYaw = (Ω - (pi/2)) / pi
    dRoll = (i - (0.0 if field==Field.LDD2 else pi)) / pi

    return Output(coe=coe, cf=cf, gyro_vector=(dPitch, dYaw, dRoll),
                  energy_scale=energy_scale, notes=notes)

# ==========================================================
# ============ PRIMARY PAYLOAD HANDLER =====================
# ==========================================================

def handle_payload(payload) -> dict:
    # Derive sensor-driven quantum aggregates
    nh3_entropy = derive_nh3_entropy(payload)
    nh4_enthalpy = derive_nh4_enthalpy(payload)
    mpa_phase = derive_sunrise_sunset_phase(payload)
    naf_sue_phase = derive_naf_sue_phase(payload)

    payload["nh3_entropy"] = nh3_entropy
    payload["nh4_enthalpy"] = nh4_enthalpy
    payload["mpa_sunrise_sunset_phase"] = mpa_phase
    payload["naf_sue_phase"] = naf_sue_phase

    # Quantum digest vector
    sensor_vector = [nh3_entropy, nh4_enthalpy, mpa_phase, naf_sue_phase]
    quantum_features = quantum_digest(sensor_vector)

    return {
        "ts": time.time(),
        "quantum_digest": quantum_features,
        "aggregates": {
            "nh3_entropy": nh3_entropy,
            "nh4_enthalpy": nh4_enthalpy,
            "mpa_sunrise_sunset_phase": mpa_phase,
            "naf_sue_phase": naf_sue_phase
        }
    }

# ==========================================================
# ================ CLI / STDIN SUPPORT =====================
# ==========================================================

def parse_args():
    p = argparse.ArgumentParser(description="COE/BW Mapper (LdD1/LdD2) — JSON I/O")
    p.add_argument("--repl", action="store_true", help="Interactive JSON line input; 'exit' to quit.")
    p.add_argument("--log", type=str, help="Append outputs to a JSONL file.")
    return p.parse_args()

def print_schema_and_example():
    example = {
        "field": "LDD2",
        "zrasw_progress": 0.62,
        "seconds_active_today": 43200,
        "i_score_over_25": 0,
        "laws_score": [0]*25,
        "mpa_sunrise_sunset_phase": 1.3,
        "naf_sue_phase": 2.7,
        "nh3_entropy": 0.35,
        "nh4_enthalpy": 0.6,
        "vsepr_symmetry": True
    }
    print(json.dumps({
        "usage": "echo '<json>' | python coe_bw.py  OR  python coe_bw.py --repl",
        "schema_hint": SCHEMA_HINT,
        "example_input": example
    }, indent=2))

def main():
    args = parse_args()
    if args.repl:
        logf = open(args.log, "a") if args.log else None
        print("{REPL} paste JSON per line; 'exit' to quit.")
        try:
            while True:
                line = input("> ").strip()
                if not line: continue
                if line.lower() in ("exit","quit"): break
                payload = json.loads(line)
                result = handle_payload(payload)
                print(json.dumps(result))
                if logf: logf.write(json.dumps(result)+"\n"); logf.flush()
        finally:
            if logf: logf.close()
        return

    if sys.stdin.isatty():
        print_schema_and_example()
        return

    try:
        payload = json.load(sys.stdin)
        result = handle_payload(payload)
        print(json.dumps(result, indent=2))
    except Exception as e:
        err = {"error": str(e), "schema_hint": SCHEMA_HINT}
        print(json.dumps(err, indent=2), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
