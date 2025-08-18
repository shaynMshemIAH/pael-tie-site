# coe_ingest_api.py
from __future__ import annotations

import os
from typing import Dict, Any, Optional

import requests
from fastapi import FastAPI, Header, HTTPException, Request

# -----------------------------
# Configuration (env)
# -----------------------------
def _pick(*keys: str) -> str:
    for k in keys:
        v = os.getenv(k, "")
        if v and v.strip():
            return v.strip()
    return ""

# Mac (gateway) auth (what Pis must send)
GATEWAY_TOKEN = _pick("GATEWAY_TOKEN", "FIELD_GATE_TOKEN")

# Site forward target (what this gateway uses to reach the site)
SITE_INGEST_URL   = _pick("SITE_INGEST_URL")
SITE_INGEST_TOKEN = _pick("SITE_INGEST_TOKEN", "PAEL_TIE_SITE_INGEST_TOKEN")

SITE_TIMEOUT_S = 8.0  # seconds

# -----------------------------
# Helpers
# -----------------------------
def _auth_ok(authorization: str, x_field_gate_token: str) -> bool:
    """
    Accept either:
      - Authorization: Bearer <token>
      - x-field-gate-token: <token>
    """
    if not GATEWAY_TOKEN:
        # If not configured, reject anything. (safer than allowing open posts)
        return False

    # Bearer path
    if authorization:
        parts = authorization.split(None, 1)
        if len(parts) == 2 and parts[0].lower() == "bearer" and parts[1].strip() == GATEWAY_TOKEN:
            return True

    # Legacy / header token path
    if x_field_gate_token and x_field_gate_token.strip() == GATEWAY_TOKEN:
        return True

    return False


def _normalize_payload(raw: Any) -> Dict[str, Any]:
    """
    Accept either:
      - raw dict  -> returns raw
      - {"payload": {...}} -> returns payload
    """
    if not isinstance(raw, dict):
        raise HTTPException(status_code=400, detail="Request body must be an object")

    if "payload" in raw and isinstance(raw["payload"], dict):
        return raw["payload"]

    return raw


def _require_site_config():
    if not SITE_INGEST_URL or not SITE_INGEST_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="Server misconfigured (SITE_INGEST_URL or SITE_INGEST_TOKEN missing)"
        )


def _forward_to_site(stream: str, payload: Dict[str, Any]) -> requests.Response:
    """
    Forward to central site with Authorization and JSON body:
      { "type": "<stream>", "payload": { ... } }
    """
    _require_site_config()
    headers = {
        "Authorization": f"Bearer {SITE_INGEST_TOKEN}",
        "Content-Type": "application/json",
    }
    body = {"type": stream, "payload": payload}
    return requests.post(SITE_INGEST_URL, headers=headers, json=body, timeout=SITE_TIMEOUT_S)


# -----------------------------
# FastAPI app
# -----------------------------
app = FastAPI(title="COE Ingest API (gateway)")

@app.get("/api/ping")
def ping():
    return {
        "ok": True,
        "ingest_url": SITE_INGEST_URL or "",
        "needs": {
            "gateway_token": bool(GATEWAY_TOKEN),
            "site_ingest_token": bool(SITE_INGEST_TOKEN),
        },
    }

# Preferred: stream-aware route
@app.post("/ingest/{stream}")
async def ingest_stream(
    stream: str,
    request: Request,
    authorization: str = Header(default=""),
    x_field_gate_token: str = Header(default="")
):
    # 1) Auth
    if not _auth_ok(authorization, x_field_gate_token):
        raise HTTPException(status_code=401, detail="Unauthorized")

    # 2) Parse JSON
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Request body must be valid JSON")

    # 3) Normalize
    try:
        payload = _normalize_payload(body)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Malformed payload")

    # 4) Minimal required keys (stream consumers assume these)
    if "timestamp" not in payload or "field_id" not in payload:
        raise HTTPException(status_code=422, detail="Missing required fields 'timestamp' or 'field_id'")

    # 5) Forward to site
    try:
        resp = _forward_to_site(stream, payload)
    except requests.RequestException as e:
        # network/timeout/etc
        raise HTTPException(status_code=502, detail=f"Failed to forward payload: {e}")

    # 6) Surface site error cleanly
    if resp.status_code >= 400:
        try:
            msg = resp.json()
        except Exception:
            msg = {"text": resp.text}
        raise HTTPException(status_code=resp.status_code, detail=msg)

    # 7) Success
    return {"ok": True}

# Back-compat: /ingest (no stream) -> default to "field01"
@app.post("/ingest")
async def ingest_default(
    request: Request,
    authorization: str = Header(default=""),
    x_field_gate_token: str = Header(default="")
):
    return await ingest_stream("field01", request, authorization, x_field_gate_token)
