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

LIVE_DIR = os.path.join(os.path.expanduser("~"), "FieldA1")

# ------------------------
# Configuration
# ------------------------
FIELD_GATE_TOKEN  = os.getenv("FIELD_GATE_TOKEN", "gfdlgudfg3458SDGd9uodRdfgujdkld45908DGjgDTOGUdgjodij3452930SDFcJ") 
SITE_INGEST_URL   = os.getenv("SITE_INGEST_URL", "https://pael-tie-site.vercel.app/api/telemetry/ingest")
PAEL_TIE_SITE_INGEST_TOKEN = os.getenv("PAEL_TIE_SITE_INGEST_TOKEN", "a0d56eb64764a78ee59883fd1416e24fda928b2a1117f6512a0a1ce4b163e878")
SITE_INGEST_TOKEN = os.getenv("SITE_INGEST_URL", "a0d56eb64764a78ee59883fd1416e24fda928b2a1117f6512a0a1ce4b163e878")
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

@app.post("/ingest")
async def ingest_data(
    request: Request, 
    x_field_gate_token: str = Header(...),

):
    print(f"🔐 Incoming token: {x_field_gate_token.strip()}")
    body = await request.json()
    return {"ok": True} 

@app.post("/ingest")
async def ingest_data(
    request: Request,
    x_field_gate_token: str = Header(...),
):
    body = await request.json()
    field_id = body.get("field_id", "unknown")

    print(f"🔐 Token: {x_field_gate_token.strip()}")
    print(f"📡 Field ID: {field_id}")

    return await ingest_stream(field_id, request, "", x_field_gate_token)

@app.get("/live/{field_id}")
def serve_latest(field_id: str):
    live_file_path = f"/home/{field_id}/live/{field_id}.json"
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

@app.route('/live/<filename>')
def serve_live_json(filename):
    return send_from_directory(LIVE_DIR, filename)
