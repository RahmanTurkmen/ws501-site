import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getQuestions, isFormOpen } from "@/lib/questions";
import { validate, type Answers } from "@/lib/validate";

const PERSONAL = [
  { test: /[\w.+-]+@[\w-]+\.[a-z]{2,}/i, reason: "Adresse e-mail détectée" },
  { test: /(?:\+33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/, reason: "Numéro de téléphone détecté" },
];

const text = (a: Answers, key: string) => (typeof a[key] === "string" ? (a[key] as string) : null);
const num = (a: Answers, key: string) => (typeof a[key] === "number" ? (a[key] as number) : null);

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 20_000) return Response.json({ error: "Réponse trop volumineuse." }, { status: 413 });

  let body: { answers?: Record<string, unknown>; consent?: boolean; website?: string };
  try { body = JSON.parse(raw); } catch { return Response.json({ error: "Requête illisible." }, { status: 400 }); }

  // Champ piège invisible : seuls les robots le remplissent.
  if (body.website) return Response.json({ ok: true }, { status: 201 });
  if (!(await isFormOpen())) return Response.json({ error: "Le questionnaire est fermé." }, { status: 403 });

  const { answers, errors } = validate(await getQuestions(true), body.answers ?? {});
  if (body.consent !== true) errors.consent = "Coche la case pour envoyer ton avis.";
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  const freeText = ["pseudo", "liked", "improve", "bugDetail"].map((k) => text(answers, k) ?? "").join(" ");
  const flag = PERSONAL.find((p) => p.test.test(freeText))?.reason ?? null;
  const support = text(answers, "support");

  await db.response.create({
    data: {
      answers,
      pseudo: text(answers, "pseudo"),
      age: text(answers, "age"),
      support,
      rating: num(answers, "rating"),
      recommend: num(answers, "recommend"),
      liked: text(answers, "liked"),
      improve: text(answers, "improve"),
      flag,
    },
  });

  const bugs = Array.isArray(answers.bugs) ? answers.bugs.filter((b) => b !== "Aucun bug") : [];
  for (const title of bugs) {
    const where = { title_support: { title, support: support ?? "Non précisé" } };
    const existing = await db.bug.findUnique({ where });
    if (!existing) await db.bug.create({ data: { title, support: support ?? "Non précisé" } });
    else {
      // Un bug « corrigé » qui revient repasse « à traiter ».
      await db.bug.update({ where, data: { count: { increment: 1 }, status: existing.status === "DONE" ? "TODO" : existing.status } });
    }
  }

  revalidatePath("/", "layout");
  return Response.json({ ok: true }, { status: 201 });
}
