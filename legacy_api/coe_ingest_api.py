# [DEPRECATED] This file is no longer used in production.
# Retained for historical reference and local testing fallback.
# Production ingest now handled by /api/telemetry/ingest on Vercel.# [DEPRECATED] This file is no longer used in production.
# Retained for historical reference and local testing fallback.
# Production ingest now handled by /api/telemetry/ingest on Vercel.
# coe_ingest_api.py

from __future__ import annotations
from typing import Dict, Any
import requests, os
from fastapi import FastAPI, Header, Request, HTTPException
from dotenv import load_dotenv
load_dotenv()
import os
print(f"🧪 .env loaded FIELD_GATE_TOKEN: {os.getenv('FIELD_GATE_TOKEN')}")
app= FastAPI()
import redis.asyncio as redis
import json
from redis import asyncio as aioredis

# ------------------------
# Configuration
# ------------------------
FIELD_GATE_TOKEN  = os.getenv("FIELD_GATE_TOKEN", "") 
SITE_INGEST_URL   = os.getenv("SITE_INGEST_URL", "")
PAEL_TIE_SITE_INGEST_TOKEN = os.getenv("PAEL_TIE_SITE_INGEST_TOKEN")
if not PAEL_TIE_SITE_INGEST_TOKEN:
    raise RuntimeError("Missing PAEL_TIE_SITE_INGEST_TOKEN in environment")
SITE_INGEST_TOKEN = os.getenv("SITE_INGEST_URL", "")
SITE_TIMEOUT_S    = float(os.getenv("SITE_TIMEOUT_S", "8.0"))

# ------------------------
# Helpers
# ------------------------
def _auth_ok(authorization: str, x_field_gate_token: str) -> bool:
    if not FIELD_GATE_TOKEN:
        return False

    if authorization:
        parts = authorization.split(None, 1)
        if len(parts) == 2 and parts[0].lower() == "bearer" and parts[1].strip() == FIELD_GATE_TOKEN:
            return True

    if x_field_gate_token.strip() == FIELD_GATE_TOKEN:
        return True

    return False

def _normalize_payload(raw: Any) -> Dict[str, Any]:
    if not isinstance(raw, dict):
        raise HTTPException(status_code=400, detail="Request body must be an object")

    if "payload" in raw and isinstance(raw["payload"], dict):
        return raw["payload"]
   
    if "field_id" not in raw and "fieldName" in raw:
        raw["field_id"] = raw["fieldName"]
    if "timestamp" not in raw and "lastUpdated" in raw:
        raw["timestamp"] = raw["lastUpdated"]

    return raw

def _require_site_config():
    if not SITE_INGEST_URL or not SITE_INGEST_TOKEN:
        raise HTTPException(status_code=500, detail="Server misconfigured (SITE_INGEST_URL or SITE_INGEST_TOKEN missing)")

def _forward_to_site(stream: str, payload: Dict[str, Any]) -> requests.Response:
    _require_site_config()
    headers = {
        "Authorization": f"Bearer {SITE_INGEST_TOKEN}",
        "Content-Type": "application/json"
    }
    body = {
        "type": stream,
        "payload": payload
    }
    return requests.post(
        SITE_INGEST_URL,
        headers=headers,
        json=body,
        timeout=SITE_TIMEOUT_S
    )
def get_live_dir(field_id: str):
    return f"/home/{field_id}/{field_id}"

# ------------------------
# FastAPI App
# ------------------------
app = FastAPI(title="COE Ingest API (gateway)")

@app.get("/api/ping")
def ping():
    return {
        "ok": True,
        "ingest_url": SITE_INGEST_URL or "",
        "needs": {
            "token": bool(SITE_INGEST_TOKEN),
            "field_gate_token": bool(FIELD_GATE_TOKEN)
        },
    }

@app.post("/ingest/{stream}")
async def ingest_stream(
    stream: str,
    request: Request,
    authorization: str = Header(default=""),
    x_field_gate_token: str = Header(default="")
):
    if not _auth_ok(authorization, x_field_gate_token):
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Request body must be valid JSON")

    try:
        payload = _normalize_payload(body)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Malformed payload")

    if "timestamp" not in payload or "field_id" not in payload:
        raise HTTPException(status_code=422, detail="Missing required fields 'timestamp' or 'field_id'")

    try:
        resp = _forward_to_site(stream, payload)
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Failed to forward payload: {e}")

    if resp.status_code >= 400:
        try:
            msg = resp.json()
        except Exception:
            msg = {"text": resp.text}
        raise HTTPException(status_code=resp.status_code, detail=msg)

    return {"ok": True}

@app.get("/live/{field_id}")
def serve_latest(field_id: str):
    live_dir = get_live_dir(field_id)
    live_file_path = os.path.join(live_dir, "live", f"{field_id}.json")    
    
    if not os.path.exists(live_file_path):
        raise HTTPException(status_code=404, detail=f"No live data found for {field_id}")

    with open(live_file_path) as f:
        return json.load(f)


@app.get("/telemetry/recent")
def read_recent(request: Request):
    api_key = request.headers.get("x-api-key")
    if api_key != os.getenv("TELEMETRY_READ_API_KEY"):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"msg": "Success"}

@app.post("/telemetry/ingest")
async def ingest_data(
    request: Request,
    x_field_gate_token: str = Header(...)
):
    body = await request.json()
    field_id = body.get("field_id", "unknown")

    print(f"📡 Field ID: {field_id}")
    print(f"🔐 Token: {x_field_gate_token.strip()}")

    if "timestamp" not in body or field_id == "unknown":
        raise HTTPException(status_code=422, detail="Missing 'timestamp' or 'field_id'")

    # Forward to site with field_id in route
    try:
        resp = requests.post(
            f"https://pael-tie-site.vercel.app/api/telemetry/{field_id}",
            json=body
        )
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Forwarding error: {e}")

    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.json())

    # Save locally as well
    live_dir = get_live_dir(field_id)
    live_file_path = os.path.join(live_dir, "live", f"{field_id}.json")
    with open(live_file_path, "w") as f:
        json.dump(body, f)

    return {"msg": "Ingested and forwarded"}

@app.route('/live/<filename>')
def serve_live_json(filename):
    # Assume filename = field_id.json
    field_id = filename.replace(".json", "")
    live_dir = get_live_dir(field_id)
    return send_from_directory(os.path.join(live_dir, "live"), filename)

from fastapi import Request
import os, json, requests
from redis import asyncio as aioredis

UPSTASH_URL = os.getenv("FIELDMI1_KV_KV_REST_API_URL")
UPSTASH_TOKEN = os.getenv("FIELDMI1_KV_KV_REST_API_TOKEN")
REDIS_URL = os.getenv("FIELDMI1_KV_REDIS_URL")

@app.post("/fieldmi1")
async def ingest_fieldmi1(req: Request):
    payload = await req.json()
    redis_key = f"{payload['field_id']}:latest"

    # Send to Upstash via REST API
    redis_body = {
        "operation": "SET",
        "key": redis_key,
        "value": json.dumps(payload)
    }
    headers = {
        "Authorization": f"Bearer {UPSTASH_TOKEN}",
        "Content-Type": "application/json"
    }

    response = requests.post(UPSTASH_URL, json=redis_body, headers=headers)

    # ALSO: Write directly using Redis SDK (optional fallback)
    try:
        redis = aioredis.from_url(REDIS_URL)
        await redis.set(redis_key, json.dumps(payload))
    except Exception as e:
        print("Local Redis set failed:", e)

    return {"status": "forwarded", "success": response.ok}
