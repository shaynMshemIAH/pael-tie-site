#!/usr/bin/env python3
import requests, time, json
from coe_bw import handle_payload
from quantum_digestion import quantum_digest

SITE_BASE = "https://pael-tie-site.vercel.app/api/telemetry"
FIELDS = ["fielda1", "field01", "fieldb1", "fieldmi1"]

def fetch_latest_samples(field):
    url = f"{SITE_BASE}/{field}"
    r = requests.get(url, timeout=10)
    if r.status_code == 200:
        data = r.json()
        return data.get("samples", [])
    return []

def process_sample(sample):
    try:
        # Run COE classical mapping
        payload = sample["sensors"]
        payload["field"] = "LDD1"  # default for now, can map by ID later
        coe_result = handle_payload(payload)

        # Extract normalized sensor vector for CUDA-Q
        vector = [
            payload.get("nh3_entropy", 0.0),
            payload.get("nh4_enthalpy", 0.0),
            payload.get("mpa_sunrise_sunset_phase", 0.0),
            payload.get("naf_sue_phase", 0.0),
        ]
        quantum_result = quantum_digest(vector)

        return {
            "ts": sample.get("ts"),
            "field": payload["field"],
            "coe_bw": coe_result,
            "quantum_digest": quantum_result
        }
    except Exception as e:
        return {"error": str(e)}

def push_quantum_result(field, result):
    url = f"{SITE_BASE}/quantum_push"
    r = requests.post(url, json={
        "field": field,
        "quantum_result": result
    })
    return r.status_code

def main():
    while True:
        for field in FIELDS:
            samples = fetch_latest_samples(field)
            if not samples:
                continue
            latest = samples[-1]
            processed = process_sample(latest)
            push_quantum_result(field, processed)
        time.sleep(5)  # poll every 5 sec

if __name__ == "__main__":
    main()
