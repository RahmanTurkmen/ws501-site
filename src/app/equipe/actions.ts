"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, requireUser, startSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CORE_KEYS, type Option } from "@/lib/default-questions";
import { hashPassword, temporaryPassword, verifyPassword } from "@/lib/password";
import { BugStatus, Priority, QuestionType, ResponseStatus, Role } from "@/generated/prisma/enums";

const str = (form: FormData, key: string, max = 200) => String(form.get(key) ?? "").trim().slice(0, max);
const pickEnum = <T extends Record<string, string>>(source: T, value: string) =>
  Object.values(source).includes(value) ? (value as T[keyof T]) : undefined;
const refresh = () => revalidatePath("/", "layout");

export type FormState = { error?: string; message?: string; secret?: string };

/* ───── connexion ───── */
// Haché une fois pour que la réponse prenne le même temps avec un e-mail inconnu.
const DECOY = hashPassword("compte-inexistant");

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = str(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "").slice(0, 200);
  const user = await db.user.findUnique({ where: { email } });
  const valid = verifyPassword(password, user?.passwordHash ?? DECOY);

  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    return { error: "Trop d’essais. Réessaie dans quelques minutes." };
  }
  if (!user || !valid) {
    if (user) {
      const failed = user.failedLogins + 1;
      await db.user.update({
        where: { id: user.id },
        data: failed >= 5 ? { failedLogins: 0, lockedUntil: new Date(Date.now() + 10 * 60_000) } : { failedLogins: failed },
      });
    }
    return { error: "Adresse ou mot de passe incorrect." };
  }
  await db.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null, lastSeenAt: new Date() } });
  await startSession(user.id);
  redirect("/equipe");
}

export async function logout() {
  await endSession();
  redirect("/equipe/connexion");
}

/* ───── réponses ───── */
export async function updateResponse(form: FormData) {
  await requireUser("moderate");
  await db.response.update({
    where: { id: str(form, "id") },
    data: {
      status: pickEnum(ResponseStatus, str(form, "status")),
      assignee: str(form, "assignee") || null,
      note: str(form, "note", 1000) || null,
    },
  });
  refresh();
}

export async function setVisibility(form: FormData) {
  await requireUser("moderate");
  const mode = str(form, "mode");
  await db.response.update({
    where: { id: str(form, "id") },
    data: { published: mode === "publish", hidden: mode === "hide" },
  });
  refresh();
}

/** Publie les avis en attente qui ne contiennent aucune donnée personnelle détectée. */
export async function publishAll() {
  await requireUser("moderate");
  await db.response.updateMany({
    where: { published: false, hidden: false, flag: null, OR: [{ liked: { not: null } }, { improve: { not: null } }] },
    data: { published: true },
  });
  refresh();
}

export async function bulkResponses(form: FormData) {
  const op = str(form, "op");
  await requireUser(op === "delete" ? "admin" : "moderate");
  const ids = form.getAll("ids").map(String).slice(0, 100);
  if (op === "delete") await db.response.deleteMany({ where: { id: { in: ids } } });
  if (op === "read") await db.response.updateMany({ where: { id: { in: ids } }, data: { status: "READ" } });
  refresh();
}

export async function deleteResponse(form: FormData) {
  await requireUser("admin");
  await db.response.delete({ where: { id: str(form, "id") } });
  refresh();
  redirect("/equipe/reponses");
}

/* ───── bugs ───── */
export async function updateBug(form: FormData) {
  await requireUser("moderate");
  await db.bug.update({
    where: { id: str(form, "id") },
    data: { status: pickEnum(BugStatus, str(form, "status")), priority: pickEnum(Priority, str(form, "priority")) },
  });
  refresh();
}

export async function addBug(form: FormData) {
  await requireUser("moderate");
  const title = str(form, "title", 120);
  if (!title) return;
  const support = str(form, "support", 40) || "Non précisé";
  await db.bug.upsert({
    where: { title_support: { title, support } },
    update: { count: { increment: 1 }, status: "TODO" },
    create: { title, support, priority: pickEnum(Priority, str(form, "priority")) ?? "MEDIUM" },
  });
  refresh();
}

export async function deleteBug(form: FormData) {
  await requireUser("admin");
  await db.bug.delete({ where: { id: str(form, "id") } });
  refresh();
}

/* ───── formulaire ───── */
export async function toggleForm() {
  await requireUser("admin");
  const current = await db.setting.findUnique({ where: { key: "formOpen" } });
  const value = current?.value === "false" ? "true" : "false";
  await db.setting.upsert({ where: { key: "formOpen" }, update: { value }, create: { key: "formOpen", value } });
  refresh();
}

export async function toggleQuestion(form: FormData) {
  await requireUser("admin");
  const q = await db.question.findUniqueOrThrow({ where: { id: str(form, "id") } });
  await db.question.update({ where: { id: q.id }, data: { active: !q.active } });
  refresh();
}

export async function moveQuestion(form: FormData) {
  await requireUser("admin");
  const q = await db.question.findUniqueOrThrow({ where: { id: str(form, "id") } });
  const list = await db.question.findMany({ where: { step: q.step }, orderBy: { position: "asc" } });
  const from = list.findIndex((x) => x.id === q.id);
  const to = from + (str(form, "dir") === "up" ? -1 : 1);
  if (to < 0 || to >= list.length) return;
  await db.$transaction([
    db.question.update({ where: { id: q.id }, data: { position: list[to].position } }),
    db.question.update({ where: { id: list[to].id }, data: { position: q.position } }),
  ]);
  refresh();
}

const NEEDS_OPTIONS: string[] = ["SINGLE", "MULTI", "SLIDER", "IMAGES", "PANIC"];

export async function saveQuestion(_: FormState, form: FormData): Promise<FormState> {
  await requireUser("admin");
  const id = str(form, "id");
  const existing = id ? await db.question.findUnique({ where: { id } }) : null;
  const core = !!existing && CORE_KEYS.has(existing.key);
  // Le type d'une question d'origine est verrouillé : les analyses en dépendent.
  const type = core ? existing.type : pickEnum(QuestionType, str(form, "type"));
  const label = str(form, "label", 140);
  if (!label || !type) return { error: "L’intitulé et le type sont obligatoires." };
  if (!existing && (type === "IMAGES" || type === "PANIC")) return { error: "Ce type n’est pas disponible pour une nouvelle question." };

  const previous = (existing?.options ?? []) as Option[];
  const labels = [...new Set(String(form.get("options") ?? "").split("\n").map((l) => l.trim().slice(0, 60)).filter(Boolean))];
  if (NEEDS_OPTIONS.includes(type) && labels.length < 2) return { error: "Il faut au moins deux réponses, une par ligne." };
  if ((type === "IMAGES" || type === "PANIC") && labels.length !== previous.length) {
    return { error: `Cette question doit garder ${previous.length} réponses (chacune a son visuel).` };
  }
  const options = NEEDS_OPTIONS.includes(type)
    ? labels.map((l, i) => ({ ...(previous.find((o) => o.label === l) ?? (type === "IMAGES" || type === "PANIC" ? previous[i] : {})), label: l }))
    : [];

  const step = Math.min(4, Math.max(1, Number(form.get("step")) || 1));
  const data = { label, type, step, options, help: str(form, "help") || null, required: form.has("required"), active: form.has("active") };
  if (existing) await db.question.update({ where: { id: existing.id }, data });
  else {
    const last = await db.question.aggregate({ _max: { position: true } });
    await db.question.create({ data: { ...data, key: `q_${randomBytes(5).toString("hex")}`, position: (last._max.position ?? 0) + 1 } });
  }
  refresh();
  redirect("/equipe/formulaire");
}

export async function deleteQuestion(form: FormData) {
  await requireUser("admin");
  const q = await db.question.findUniqueOrThrow({ where: { id: str(form, "id") } });
  if (!CORE_KEYS.has(q.key)) await db.question.delete({ where: { id: q.id } });
  refresh();
  redirect("/equipe/formulaire");
}

/* ───── membres ───── */
export async function inviteMember(_: FormState, form: FormData): Promise<FormState> {
  await requireUser("admin");
  const email = str(form, "email").toLowerCase();
  const name = str(form, "name", 60);
  const role = pickEnum(Role, str(form, "role")) ?? "MODERATOR";
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return { error: "Nom et adresse e-mail valides obligatoires." };
  if (await db.user.findUnique({ where: { email } })) return { error: "Ce membre existe déjà." };
  const password = temporaryPassword();
  await db.user.create({ data: { name, email, role, passwordHash: hashPassword(password) } });
  refresh();
  return { message: `Compte créé pour ${email}. Transmets ce mot de passe provisoire, il ne sera plus affiché :`, secret: password };
}

export async function manageMember(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireUser("admin");
  const target = await db.user.findUnique({ where: { id: str(form, "id") } });
  if (!target) return { error: "Membre introuvable." };
  if (target.id === me.id) return { error: "Utilise « Mon compte » pour modifier ton propre accès." };
  const op = str(form, "op");
  if (op === "remove") {
    await db.user.delete({ where: { id: target.id } });
    refresh();
    return { message: `${target.name} n’a plus accès.` };
  }
  if (op === "reset") {
    const password = temporaryPassword();
    await db.user.update({ where: { id: target.id }, data: { passwordHash: hashPassword(password), failedLogins: 0, lockedUntil: null } });
    await db.session.deleteMany({ where: { userId: target.id } });
    return { message: `Nouveau mot de passe provisoire pour ${target.email} :`, secret: password };
  }
  const role = pickEnum(Role, str(form, "role"));
  if (role) await db.user.update({ where: { id: target.id }, data: { role } });
  refresh();
  return { message: "Rôle mis à jour." };
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const me = await requireUser();
  const user = await db.user.findUniqueOrThrow({ where: { id: me.id } });
  const next = String(form.get("next") ?? "").slice(0, 200);
  if (!verifyPassword(String(form.get("current") ?? ""), user.passwordHash)) return { error: "Mot de passe actuel incorrect." };
  if (next.length < 10) return { error: "10 caractères minimum." };
  await db.user.update({ where: { id: me.id }, data: { passwordHash: hashPassword(next) } });
  await db.session.deleteMany({ where: { userId: me.id } });
  await startSession(me.id);
  return { message: "Mot de passe changé." };
}
