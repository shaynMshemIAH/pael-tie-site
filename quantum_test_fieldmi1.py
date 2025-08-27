#!/usr/bin/env python3
import requests, json, sys
from coe_bw import coe_quantum_entrypoint

# --- Config ---
SITE_BASE = "https://pael-tie-site.vercel.app/api/telemetry"
FIELD = "fieldmi1"

def fetch_latest_fieldmi1():
    """Fetch the most recent FieldMI1 telemetry sample from Vercel."""
    url = f"{SITE_BASE}/{FIELD}"
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json()
        samples = data.get("samples", [])
        if not samples:
            print(f"[ERR] No samples available for {FIELD}.")
            sys.exit(1)
        return samples[-1]
    except Exception as e:
        print(f"[ERR] Failed to fetch telemetry for {FIELD}: {e}")
        sys.exit(1)

def push_quantum_result(result):
    """Push the processed quantum result back to Vercel."""
    url = f"{SITE_BASE}/quantum_push"
    try:
        r = requests.post(url, json={
            "field": FIELD,
            "quantum_result": result
        }, timeout=10)
        r.raise_for_status()
        print(f"[OK] Quantum results pushed successfully → {url}")
        return r.json()
    except Exception as e:
        print(f"[ERR] Failed to push quantum results: {e}")
        sys.exit(1)

def main():
    print(f"[Quantum Test] Fetching latest {FIELD} telemetry...")
    sample = fetch_latest_fieldmi1()
    payload = sample.get("sensors", {})
    payload["field"] = "LDD1"  # Default mapping for MI1

    print("[Quantum Test] Processing FieldMI1 data via COE + CUDA-Q...")
    processed = coe_quantum_entrypoint(payload)

    print("[Quantum Test] Pushing quantum result back to Vercel...")
    response = push_quantum_result(processed)

    print("\n===== Quantum Test Completed =====")
    print(json.dumps({
        "input_sample": sample,
        "quantum_result": processed,
        "server_response": response
    }, indent=2))

if __name__ == "__main__":
    main()
