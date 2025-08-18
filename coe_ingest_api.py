# coe_ingest_api.py
# Gateway/forwarder:  Pi  -> (this Mac) -> pael-tie-site

from __future__ import annotations

import os
import time
import socket
from typing import Any, Dict, Tuple

from fastapi import FastAPI, Request, HTTPException, Header
from fastapi.responses import JSONResponse, PlainTextResponse
from fastapi.routing import APIRoute
import httpx

APP_NAME = "COE Ingest API"
app = FastAPI(title=APP_NAME)

# -----------------------------------------------------------------------------
# Environment (no secrets hard-coded — set these in your shell)
# -----------------------------------------------------------------------------
# Token the Pis must present to THIS gateway (Mac).
GATEWAY_TOKEN = os.getenv("GATEWAY_TOKEN", "6f826aa051dbb40aaec194e88be08a9ff9a7622bbf6672d6872ea8677b2f065a").strip()

# Where the gateway forwards data (your site) and the token to use there.
SITE_INGEST_URL   = os.getenv("SITE_INGEST_URL", "https://pael-tie-site.vercel.app/api/telemetry/ingest").strip()
SITE_INGEST_TOKEN = (
    os.getenv("SITE_INGEST_TOKEN", "a0d56eb64764a78ee59883fd1416e24fda928b2a1117f6512a0a1ce4b163e878") or
    os.getenv("PAEL_TIE_SITE_INGEST_TOKEN", "a0d56eb64764a78ee59883fd1416e24fda928b2a1117f6512a0a1ce4b163e878")
).strip()

# HTTP timeout (seconds) for forwarding to the site
SITE_TIMEOUT_S = float(os.getenv("SITE_TIMEOUT", "8.0"))

HOSTNAME = socket.gethostname()


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def _now_ts() -> int:
    return int(time.time())


def _auth_ok(authorization: str, x_field_gate_token: str) -> bool:
    """
    Accept either:
      Authorization: Bearer <GATEWAY_TOKEN>
      -OR-
      x-field-gate-token: <GATEWAY_TOKEN>
    If GATEWAY_TOKEN is empty, auth is effectively disabled.
    """
    if not GATEWAY_TOKEN:
        return True
    if authorization == f"Bearer {GATEWAY_TOKEN}":
        return True
    if x_field_gate_token == GATEWAY_TOKEN:
        return True
    return False


def _normalize_payload(raw: Any) -> Dict[str, Any]:
    """
    Accept either:
      {"payload": {...}} -> {...}
      {...}              -> {...}
    """
    if isinstance(raw, dict) and "payload" in raw and isinstance(raw["payload"], dict):
        return raw["payload"]
    if isinstance(raw, dict):
        return raw
    return {"value": raw}


async def _forward_to_site(stream: str, payload: Dict[str, Any]) -> Tuple[int, str]:
    """
    Forward the normalized payload to your site ingest.
    Adds minimal envelope that your site expects.
    Returns (status_code, response_text)
    """
    if not SITE_INGEST_URL or not SITE_INGEST_TOKEN:
        raise HTTPException(status_code=500, detail="SITE_INGEST_URL or SITE_INGEST_TOKEN not set")

    # Compatibility: some backends accept Authorization, some X-INGEST-TOKEN.
    headers = {
        "Authorization": f"Bearer {SITE_INGEST_TOKEN}",
        "X-INGEST-TOKEN": SITE_INGEST_TOKEN,
        "Content-Type": "application/json",
    }

    body = {
        "type": stream,
        "gateway": HOSTNAME,
        "recv_ts": _now_ts(),
        "payload": payload,
    }

    async with httpx.AsyncClient(timeout=SITE_TIMEOUT_S) as client:
        try:
            resp = await client.post(SITE_INGEST_URL, headers=headers, json=body)
            return resp.status_code, resp.text
        except httpx.RequestError as e:
            # Network/timeout error -> surface clearly
            return 599, f"forward error: {e!s}"


def _route_specs() -> list[dict]:
    specs = []
    for r in app.routes:
        if isinstance(r, APIRoute):
            specs.append({"path": r.path, "methods": list(r.methods)})
    specs.sort(key=lambda x: x["path"])
    return specs


# -----------------------------------------------------------------------------
# Diagnostics
# -----------------------------------------------------------------------------
@app.get("/api/ping", response_class=PlainTextResponse)
async def ping() -> str:
    return "pong"


@app.get("/routes")
async def routes():
    return {"routes": _route_specs()}


# -----------------------------------------------------------------------------
# Ingest endpoints
# -----------------------------------------------------------------------------
@app.post("/ingest")
async def ingest_default(
    request: Request,
    authorization: str = Header(default=""),
    x_field_gate_token: str = Header(default=""),
):
    if not _auth_ok(authorization, x_field_gate_token):
        raise HTTPException(status_code=401, detail="bad key")

    raw = await request.json()
    payload = _normalize_payload(raw)

    # If the payload declares its own stream, use it; else call it "default"
    stream = payload.get("field_id") or payload.get("stream") or "default"

    status, text = await _forward_to_site(stream, payload)

    return JSONResponse(
        {
            "ok": 200 <= status < 300,
            "stream": stream,
            "forward_status": status,
            "forward_body": text[:512],  # clip for safety
        },
        status_code=200 if 200 <= status < 300 else 502,
    )


@app.post("/ingest/{stream}")
async def ingest_stream(
    stream: str,
    request: Request,
    authorization: str = Header(default=""),
    x_field_gate_token: str = Header(default=""),
):
    if not _auth_ok(authorization, x_field_gate_token):
        raise HTTPException(status_code=401, detail="bad key")

    raw = await request.json()
    payload = _normalize_payload(raw)

    status, text = await _forward_to_site(stream, payload)

    return JSONResponse(
        {
            "ok": 200 <= status < 300,
            "stream": stream,
            "forward_status": status,
            "forward_body": text[:512],
        },
        status_code=200 if 200 <= status < 300 else 502,
    )
