# cudaq_service.py
import os
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
import cudaq

API_KEY = os.getenv("COE_API_KEY", "2c343b09de84f80482550c06f20da56183bb638945ca9240d55bb6fcb7884ade")

app = FastAPI()

class RunReq(BaseModel):
    theta: float = 0.7
    shots: int = 1000

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/run")
def run(req: RunReq, authorization: str = Header(default="")):
    if API_KEY and authorization != f"Bearer {API_KEY}":
        raise HTTPException(status_code=401, detail="bad key")

    @cudaq.kernel
    def circuit(theta: float):
        q = cudaq.qubit()
        rx(theta, q)
        mz(q)

    counts = cudaq.sample(circuit, req.theta, shots_count=req.shots)
    p1 = counts.get('1', 0) / sum(counts.values()) if counts else 0.0
    return {"ok": True, "counts": counts, "p1": p1}
