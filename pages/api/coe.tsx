import React from "react";

interface CoePayload {
  field: string;
  zrasw_progress: number;
  seconds_active_today: number;
  i_score_over_25: number;
  laws_score: number[];
  mpa_sunrise_sunset_phase?: number;
  naf_sue_phase?: number;
  nh3_entropy?: number;
  nh4_enthalpy?: number;
  vsepr_symmetry?: boolean;
}

interface Props {
  data: CoePayload[];
}

const CoeComponent: React.FC<Props> = ({ data }) => {
  return (
    <div style={{ marginTop: "2rem", backgroundColor: "#1f1f2e", padding: "1rem", borderRadius: "8px" }}>
      <h3>⚛ COE BW Energy Scaling</h3>
      {data.map((entry, idx) => (
        <div
          key={idx}
          style={{
            padding: "12px",
            marginBottom: "1rem",
            backgroundColor: "#2a2a3d",
            borderRadius: "6px",
            borderLeft: "4px solid #6ec1e4",
          }}
        >
          <p><strong>Field:</strong> {entry.field}</p>
          <p><strong>ZraSW Progress:</strong> {entry.zrasw_progress}</p>
          <p><strong>Seconds Active Today:</strong> {entry.seconds_active_today}</p>
          <p><strong>I Score / 25:</strong> {entry.i_score_over_25}</p>
          <p><strong>NH₃ Entropy:</strong> {entry.nh3_entropy ?? "n/a"}</p>
          <p><strong>NH₄ Enthalpy:</strong> {entry.nh4_enthalpy ?? "n/a"}</p>
          <p><strong>VSEPR Symmetry:</strong> {entry.vsepr_symmetry ? "Yes" : "No"}</p>
        </div>
      ))}
    </div>
  );
};

export default CoeComponent;
