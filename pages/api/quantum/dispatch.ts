// pages/api/quantum/dispatch.ts
import axios from "axios";

export default async function handler(req, res) {
  try {
    // Forward incoming telemetry payload directly to Jupyter GPU Docker
    const response = await axios.post(
      "http://<JUP_DOCKER_IP>:8888/quantum/coe_bw",
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );

    return res.status(200).json(response.data);
  } catch (err) {
    console.error("[DISPATCH ERROR]", err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
