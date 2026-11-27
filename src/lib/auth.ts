import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "./db";
import type { Role } from "@/generated/prisma/enums";

const COOKIE = "out_session";
const DAYS = 7;
const digest = (token: string) => createHash("sha256").update(token).digest("hex");

export async function startSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + DAYS * 86_400_000);
  await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await db.session.create({ data: { id: digest(token), userId, expiresAt } });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: digest(token) } });
  jar.delete(COOKIE);
}

export const currentUser = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: digest(token) },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });
  return session && session.expiresAt > new Date() ? session.user : null;
});

export const ROLE_NAMES: Record<Role, string> = { ADMIN: "Administrateur", MODERATOR: "Modérateur", VIEWER: "Lecture seule" };
export const canModerate = (role: Role) => role !== "VIEWER";

/** À appeler dans chaque page et chaque action de l'espace équipe. */
export async function requireUser(level: "view" | "moderate" | "admin" = "view") {
  const user = await currentUser();
  if (!user) redirect("/equipe/connexion");
  if ((level === "admin" && user.role !== "ADMIN") || (level === "moderate" && !canModerate(user.role))) {
    redirect("/equipe?refus=1");
  }
  return user;
}
