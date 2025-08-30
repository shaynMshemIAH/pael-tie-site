export type TraversalKind = "sameLdd" | "crossLdd";
export type TierKey = "bye1800" | "bye5785" | "bye43200" | "bye86400" | "cdpd";

export interface ByeTier {
  key: TierKey;
  label: string;
  sequences: number;
  traversal: TraversalKind;
  description: string;
}

export const BYE_TIERS: Record<TierKey, ByeTier> = {
  bye1800: {
    key: "bye1800",
    label: "Bye1800 — Compassion",
    sequences: 1800,
    traversal: "sameLdd",
    description: "Same‑LdD • up to 3× daily • sunrise/sunset rhythm",
  },
  bye5785: {
    key: "bye5785",
    label: "Bye5785 — Classic",
    sequences: 5785,
    traversal: "sameLdd",
    description: "Same‑LdD warmup • pennies per sequence",
  },
  bye43200: {
    key: "bye43200",
    label: "Bye43200 — Half‑Day (LdD2)",
    sequences: 43200,
    traversal: "crossLdd",
    description: "Naf‑Sue reanimation • TIH>DH grave‑dome lifted",
  },
  bye86400: {
    key: "bye86400",
    label: "Bye86400 — Full‑Day (LdD2+)",
    sequences: 86400,
    traversal: "crossLdd",
    description: "Extended traversal • infrastructure grade",
  },
  cdpd: {
    key: "cdpd",
    label: "CDPD — Industrial",
    sequences: 0,
    traversal: "crossLdd",
    description: "Contract‑scale • escrow • billions‑ready",
  },
};

