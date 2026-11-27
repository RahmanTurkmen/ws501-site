import { canModerate, currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getQuestions } from "@/lib/questions";
import type { Answers } from "@/lib/validate";

/** Empêche un tableur d'exécuter une réponse commençant comme une formule. */
function cell(value: unknown) {
  let text = Array.isArray(value) ? value.join(", ") : value === undefined || value === null ? "" : String(value);
  if (typeof value !== "number" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) return new Response("Connexion requise.", { status: 401 });
  if (!canModerate(user.role)) return new Response("Accès refusé.", { status: 403 });

  const params = new URL(request.url).searchParams;
  const format = params.get("format") === "json" ? "json" : "csv";
  const days = Number(params.get("periode")) || 0;
  const steps = new Set(params.getAll("etape").map(Number));
  const anonymous = params.get("anonyme") === "1";
  const notes = params.get("notes") === "1";

  const questions = (await getQuestions()).filter((q) => steps.has(q.step) && !(anonymous && q.key === "pseudo"));
  const responses = await db.response.findMany({
    where: days ? { createdAt: { gte: new Date(Date.now() - days * 86_400_000) } } : undefined,
    orderBy: { createdAt: "asc" },
  });

  const records = responses.map((r) => {
    const answers = r.answers as Answers;
    return {
      date: r.createdAt.toISOString(),
      ...Object.fromEntries(questions.map((q) => [q.key, answers[q.key] ?? null])),
      ...(notes ? { statut: r.status, assigne: r.assignee, note_interne: r.note } : {}),
    } as Record<string, unknown>;
  });

  const filename = `out_reponses_${new Date().toISOString().slice(0, 10)}.${format}`;
  let body: string;
  if (format === "json") {
    body = JSON.stringify(records, null, 2);
  } else {
    const keys = ["date", ...questions.map((q) => q.key), ...(notes ? ["statut", "assigne", "note_interne"] : [])];
    const titles = keys.map((k) => questions.find((q) => q.key === k)?.label ?? k);
    // Point-virgule et BOM : le fichier s'ouvre directement dans Excel en français.
    body = "﻿" + [titles, ...records.map((r) => keys.map((k) => r[k]))].map((row) => row.map(cell).join(";")).join("\r\n");
  }

  await db.exportLog.create({ data: { filename, format, rows: records.length, query: params.toString(), author: user.name } });

  return new Response(body, {
    headers: {
      "Content-Type": format === "json" ? "application/json; charset=utf-8" : "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
