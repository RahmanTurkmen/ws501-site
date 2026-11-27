/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { CountUp } from "@/components/motion";
import { decimal } from "@/lib/stats";
import type { BugStatus, Priority, ResponseStatus } from "@/generated/prisma/enums";

export const STATUS: Record<ResponseStatus, string> = { NEW: "Nouveau", TODO: "À traiter", DOING: "En cours", DONE: "Traité", READ: "Lu" };
export const BUG_STATUS: Record<BugStatus, string> = { TODO: "À traiter", DOING: "En cours", DONE: "Corrigé" };
export const PRIORITY: Record<Priority, string> = { HIGH: "Haute", MEDIUM: "Moyenne", LOW: "Basse" };

export const shortDate = (d: Date) =>
  d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });

export function Head({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <header className="head">
      <div><h1>{title}</h1>{sub && <p className="label">{sub}</p>}</div>
      {children && <div className="row">{children}</div>}
    </header>
  );
}

export function Stats({ items }: { items: [string | number | null, string, { decimals?: number; suffix?: string }?][] }) {
  const tones = ["c-yellow", "c-teal", "c-pink", "c-orange"];
  return (
    <div className="cols" style={{ "--cols": 4 } as React.CSSProperties}>
      {items.map(([value, label, format], i) => (
        <div key={label} className={`card stat ${tones[i % 4]}`}>
          <strong style={typeof value === "string" && value.length > 6 ? { fontSize: 26 } : undefined}>
            {value === null ? "-" : typeof value === "number" ? <CountUp value={value} {...format} /> : value}
          </strong>
          {label}
        </div>
      ))}
    </div>
  );
}

export type BarItem = { label: string; share: number; text?: string; color?: string };

export function Bars({ items }: { items: BarItem[] }) {
  const palette = ["var(--green)", "var(--teal)", "var(--yellow)", "var(--orange)", "var(--red)"];
  return (
    <div className="bars">
      {items.map((b, i) => (
        <div className="bar" key={b.label}>
          <span style={{ all: "unset" }}>{b.label}</span>
          <span><i style={{ "--w": `${Math.min(1, b.share) * 100}%`, background: b.color ?? palette[i % 5] } as React.CSSProperties} /></span>
          <b>{b.text ?? `${Math.round(b.share * 100)} %`}</b>
        </div>
      ))}
    </div>
  );
}

export const scoreBar = (label: string, value: number | null, color: string): BarItem =>
  ({ label, color, share: (value ?? 0) / 5, text: decimal(value) });

export const PERIODS = { "7": "7 jours", "30": "30 jours", tout: "Tout" } as const;

export function period(value: unknown) {
  const key = (typeof value === "string" && value in PERIODS ? value : "tout") as keyof typeof PERIODS;
  return { key, since: key === "tout" ? undefined : new Date(Date.now() - Number(key) * 86_400_000) };
}

export function PeriodFilter({ path, current }: { path: string; current: string }) {
  return (
    <>
      {Object.entries(PERIODS).map(([k, label]) => (
        <Link key={k} href={`${path}?periode=${k}`} className="chip" aria-pressed={k === current}>{label}</Link>
      ))}
      <Link href="/equipe/exports" className="btn btn-small">Exporter</Link>
    </>
  );
}

export function Empty({ title = "Aucune réponse pour l’instant" }: { title?: string }) {
  return (
    <div className="card empty" style={{ padding: "50px 30px" }}>
      <p className="tag">clic… clic…</p>
      <img src="/img/clic-panne.webp" alt="" style={{ height: 240, animation: "sway 2.6s ease-in-out infinite" }} />
      <h2 style={{ color: "var(--yellow)" }}>{title}</h2>
      <p>Partage le lien du questionnaire aux testeurs pour remonter la clé.</p>
      <Link href="/questionnaire" className="btn" target="_blank">Voir le questionnaire</Link>
    </div>
  );
}
