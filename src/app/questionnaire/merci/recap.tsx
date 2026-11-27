"use client";

import { useSyncExternalStore } from "react";

const read = () => { try { return sessionStorage.getItem("out-recap"); } catch { return null; } };

export function Recap() {
  const raw = useSyncExternalStore(() => () => {}, read, () => null);
  if (!raw) return null;
  const v = JSON.parse(raw) as Record<string, unknown>;
  const lines = [
    ["Note globale", v.rating ? `${v.rating} / 5` : null],
    ["Jouet préféré", v.toy],
    ["Niveau préféré", v.level],
    ["Recommandation", typeof v.recommend === "number" ? `${v.recommend} / 10` : null],
  ].filter(([, value]) => value);
  return (
    <div className="card recap">
      <p className="label">Ton récap</p>
      {lines.map(([k, value]) => (
        <div key={String(k)}><span className="muted">{String(k)}</span><strong>{String(value)}</strong></div>
      ))}
    </div>
  );
}
