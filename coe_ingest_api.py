# coe_ingest_api.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse, PlainTextResponse
import os, json, time, asyncio, httpx
from collections import deque
from pathlib import Path

app = FastAPI(title="COE Ingest API")

# Comma-separated lists. Each URL must have a matching token (same index).
A1_FORWARD_URLS   = [u.strip() for u in os.getenv("A1_FORWARD_URLS", "https://pael-tie-site.vercel.app/api/telemetry/fielda1").split(",") if u.strip()]
A1_FORWARD_TOKENS = [t.strip() for t in os.getenv("A1_FORWARD_TOKENS", "244f7321ea07f293224c7abc9656ff70e3af424592259efcba6cf053e99c3030").split(",") if t.strip()]
B1_FORWARD_URLS   = [u.strip() for u in os.getenv("B1_FORWARD_URLS", "https://pael-tie-site.vercel.app/api/telemetry/fieldb1").split(",") if u.strip()]
B1_FORWARD_TOKENS = [t.strip() for t in os.getenv("B1_FORWARD_TOKENS", "a8af4a544934b6b2f6a1d1ff4013adcfcfe11611ef81bc4bd747be0441406694").split(",") if t.strip()]
SITE_TIMEOUT_S    = float(os.getenv("SITE_TIMEOUT", "8.0"))

# ----- Storage -----
BUF_MAX = int(os.getenv("COE_BUF_MAX", "2000"))
INBOX = Path(os.getenv("COE_INBOX", str(Path.home() / "coe_inbox")))
INBOX.mkdir(parents=True, exist_ok=True)
RECENT = deque(maxlen=BUF_MAX)

# ----- Keys -----
COE_KEYS = {k.strip() for k in os.getenv("COE_API_KEYS", "").split(",") if k.strip()}
k1 = os.getenv("COE_API_KEY", "").strip()
if k1: COE_KEYS.add(k1)

B1_KEYS = {k.strip() for k in os.getenv("FIELD_GATE_KEYS", "").split(",") if k.strip()}
k2 = os.getenv("FIELD_GATE_TOKEN", "").strip()
if k2: B1_KEYS.add(k2)

# ----- Forward (B1) -----
SITE_INGEST_URL   = os.getenv("PAEL_TIE_SITE_INGEST_URL", "https://pael-tie-site.vercel.app/api/telemetry/fieldb1").strip()  # e.g. https://pael-tie-site.vercel.app/api/telemetry/fieldb1
SITE_INGEST_TOKEN = os.getenv("PAEL_TIE_SITE_INGEST_TOKEN", "a0d56eb64764a78ee59883fd1416e24fda928b2a1117f6512a0a1ce4b163e878").strip()
SITE_TIMEOUT_S    = float(os.getenv("PAEL_TIE_SITE_TIMEOUT", "8.0"))

# ----- Helpers -----
def _hmap(headers: dict):  # case-insensitive lookup
    return {k.lower(): v for k, v in headers.items() if isinstance(v, str)}

def _stamp(payload: dict) -> dict:
    p = dict(payload)
    p["gateway_received_ts"] = int(time.time())
    return p

def _store(p: dict):
    day = time.strftime("%Y%m%d")
    (INBOX / f"{day}.ndjson").open("a").write(json.dumps(p) + "\n")
    RECENT.append(p)

def _auth_ok(h: dict, valid: set[str], alt_header: str | None = None) -> bool:
    if not valid: return False
    cands = []
    if "authorization" in h and h["authorization"].startswith("Bearer "):
        cands.append(h["authorization"].split(" ", 1)[1].strip())
    if "x-api-key" in h:
        cands.append(h["x-api-key"].strip())
    if alt_header and alt_header in h:
        cands.append(h[alt_header].strip())
    return any(c in valid for c in cands)

def _pairs(urls, toks):
    # zip longest: ignore extras if counts differ
    n = min(len(urls), len(toks))
    return [(urls[i], toks[i]) for i in range(n)]

async def _forward_many(pairs, payload):
    if not pairs: return
    async with httpx.AsyncClient(timeout=SITE_TIMEOUT_S) as client:
        tasks = []
        for url, tok in pairs:
            tasks.append(client.post(
                url,
                headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"},
                json=payload,
            ))
        try:
            await asyncio.gather(*tasks, return_exceptions=True)
        except Exception:
            pass

async def _forward_b1(p: dict):
    if not SITE_INGEST_URL or not SITE_INGEST_TOKEN:
        return
    try:
        async with httpx.AsyncClient(timeout=SITE_TIMEOUT_S) as client:
            await client.post(
                SITE_INGEST_URL,
                headers={"Authorization": f"Bearer {SITE_INGEST_TOKEN}", "Content-Type": "application/json"},
                json=p,
            )
    except Exception:
        # best-effort; don't break ingest
        pass

# ----- Routes -----
@app.get("/health", response_class=PlainTextResponse)
async def health(): return "ingest alive\n"

@app.get("/healthz")
async def healthz(): return {"ok": True, "ts": int(time.time())}

# A1 (COE) — /ingest
@app.post("/ingest", response_class=PlainTextResponse)
async def ingest_a1(request: Request):
    h = _hmap(request.headers)
    if not _auth_ok(h, COE_KEYS):vraise HTTPException(status_code=401, detail="bad key")
    p = _stamp(await request.json()); _store(p)
    asyncio.create_task(_forward_many(_pairs(A1_FORWARD_URLS, A1_FORWARD_TOKENS), p))
    return "ok\n"

# B1 (FieldB1) — /ingest/fieldb1
@app.post("/ingest/fieldb1", response_class=PlainTextResponse)
async def ingest_b1(request: Request):
    h = _hmap(request.headers)
    if not _auth_ok(h, B1_KEYS, alt_header="x-field-gate-token"): raise HTTPException(status_code=401, detail="bad key")
    p = _stamp(await request.json()); _store(p)
    asyncio.create_task(_forward_many(_pairs(B1_FORWARD_URLS, B1_FORWARD_TOKENS), p))
    return "ok\n"

@app.get("/recent")
async def recent(n: int = 50):
    n = max(1, min(n, BUF_MAX))
    return {"count": len(RECENT), "items": list(RECENT)[-n:]}

@app.get("/summary")
async def summary():
    if not RECENT: return {"count": 0}
    last = RECENT[-1]
    return {
        "count": len(RECENT),
        "most_recent": {
            "field": last.get("field"),
            "timestamp": last.get("timestamp_iso") or last.get("ts") or last.get("time"),
            "sensors": last.get("sensors"),
            "labels": last.get("labels"),
            "nonlinear_time": last.get("nonlinear_time"),
            "gateway_received_ts": last.get("gateway_received_ts"),
        },
    }
