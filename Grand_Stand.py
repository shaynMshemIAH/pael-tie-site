# Grand_Stand.py
import requests, json, time, uuid
from datetime import datetime, timezone

BASE = "https://https://pael-tie-site.vercel.app"
TOKEN = "a0d56eb64764a78ee59883fd1416e24fda928b2a1117f6512a0a1ce4b163e878"
H = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def get_field(field):
  r = requests.get(f"{BASE}/api/field/{field}", timeout=5)
  r.raise_for_status()
  return r.json()

def post_interpretation(field, sensorId, title, severity, message, data=None):
  payload = {
    "id": str(uuid.uuid4()),
    "field": field,
    "sensorId": sensorId,
    "title": title,
    "severity": severity,   # 'info'|'warn'|'crit'
    "message": message,
    "ts": datetime.now(timezone.utc).isoformat(),
    "data": data or {}
  }
  r = requests.post(f"{BASE}/api/interpret", headers=H, data=json.dumps(payload), timeout=5)
  if not r.ok:
    raise RuntimeError(f"interpret failed {r.status_code}: {r.text}")

def interpret_field_A():
  data = get_field('A')
  for r in data.get("readings", []):
    if r["type"] == "ammonia_ppm":
      v = r["value"]
      if v > 25:
        post_interpretation('A', r["sensorId"], "NH₃ High", "warn",
                            f"Ammonia elevated: {v} {r['unit']}", {"threshold":25})
      # Example: dome detection using your quantum/COE logic later…

def interpret_field_0():
  data = get_field('0')
  # e.g. oxygen safe/unsafe bands
  for r in data.get("readings", []):
    if r["type"] == "oxygen_pct":
      v = r["value"]
      if v < 19.5:
        post_interpretation('0', r["sensorId"], "O₂ Low", "crit",
                            f"Oxygen below 19.5%: {v}%", {"threshold":19.5})

def main_loop():
  while True:
    try:
      interpret_field_A()
      interpret_field_0()
      # interpret_field_B() ; interpret_field_MI()
    except Exception as e:
      # Log but DO NOT stop—interpretations are best-effort
      print("Grand_Stand error:", e)
    time.sleep(2)  # your cadence

if __name__ == "__main__":
  main_loop()
