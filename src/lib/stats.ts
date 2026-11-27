import { db } from "./db";
import type { Answers } from "./validate";

export type Row = { answers: Answers; rating: number | null; recommend: number | null; createdAt: Date };

export async function loadRows(since?: Date): Promise<Row[]> {
  const rows = await db.response.findMany({
    where: since ? { createdAt: { gte: since } } : undefined,
    select: { answers: true, rating: true, recommend: true, createdAt: true },
  });
  return rows.map((r) => ({ ...r, answers: r.answers as Answers }));
}

export function average(values: (number | null | undefined)[]) {
  const v = values.filter((x): x is number => typeof x === "number");
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

export const numbers = (rows: Row[], key: string) =>
  rows.map((r) => r.answers[key]).filter((v): v is number => typeof v === "number");

/** Répartition d'une question : part des personnes ayant choisi chaque valeur. */
export function spread(rows: Row[], key: string, labels: (string | number)[]) {
  const answered = rows.filter((r) => r.answers[key] !== undefined);
  return labels.map((label) => {
    const count = answered.filter((r) => {
      const v = r.answers[key];
      return Array.isArray(v) ? v.includes(String(label)) : v === label;
    }).length;
    return { label: String(label), count, share: answered.length ? count / answered.length : 0 };
  });
}

export function top(rows: Row[], key: string, labels: string[]) {
  const s = spread(rows, key, labels).sort((a, b) => b.count - a.count);
  return s[0]?.count ? s[0] : null;
}

export function share(rows: Row[], key: string, value: string) {
  return spread(rows, key, [value])[0];
}

export function recommendShare(rows: Row[]) {
  const v = rows.map((r) => r.recommend).filter((x): x is number => x !== null);
  return v.length ? v.filter((x) => x >= 7).length / v.length : null;
}

/** Score de recommandation (promoteurs 9-10 moins détracteurs 0-6), de -100 à +100. */
export function promoterScore(rows: Row[]) {
  const v = rows.map((r) => r.recommend).filter((x): x is number => x !== null);
  if (!v.length) return null;
  return Math.round(((v.filter((x) => x >= 9).length - v.filter((x) => x <= 6).length) / v.length) * 100);
}

export const percent = (x: number | null) => (x === null ? "—" : `${Math.round(x * 100)} %`);
export const decimal = (x: number | null) => (x === null ? "—" : x.toLocaleString("fr-FR", { maximumFractionDigits: 1, minimumFractionDigits: 1 }));

/** Nombre de réponses pour chacun des 7 derniers jours (heure de Paris). */
export function lastDays(rows: Row[], count = 7) {
  const options = { timeZone: "Europe/Paris" } as const;
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.now() - (count - 1 - i) * 86_400_000);
    const key = date.toLocaleDateString("fr-FR", options);
    return {
      name: date.toLocaleDateString("fr-FR", { ...options, weekday: "short" }),
      count: rows.filter((r) => r.createdAt.toLocaleDateString("fr-FR", options) === key).length,
    };
  });
}
