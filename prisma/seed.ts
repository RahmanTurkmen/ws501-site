import "dotenv/config";
import { db } from "../src/lib/db";
import { DEFAULT_QUESTIONS } from "../src/lib/default-questions";
import { hashPassword } from "../src/lib/password";

async function main() {
  // Les questions déjà modifiées dans le back-office ne sont jamais écrasées.
  for (const [position, q] of DEFAULT_QUESTIONS.entries()) {
    await db.question.upsert({
      where: { key: q.key },
      update: {},
      create: { ...q, position, options: q.options ?? [], required: q.required ?? false },
    });
  }

  // Met à niveau le « jouet préféré » d'une base existante : Banana Agent ajouté, Badaboum retiré.
  // Les anciennes réponses « Badaboum » restent en base ; seul le choix disparaît du formulaire.
  const toy = await db.question.findUnique({ where: { key: "toy" } });
  const options = Array.isArray(toy?.options) ? (toy.options as { label: string; image?: string }[]) : null;
  if (toy && options) {
    const next = options.filter((o) => o.label !== "Badaboum");
    if (!next.some((o) => o.label === "Banana Agent")) next.push({ label: "Banana Agent", image: "/img/banana-agent.webp" });
    if (JSON.stringify(next) !== JSON.stringify(options)) {
      await db.question.update({ where: { key: "toy" }, data: { options: next } });
      console.log("Jouet préféré mis à jour.");
    }
  }

  await db.setting.upsert({ where: { key: "formOpen" }, update: {}, create: { key: "formOpen", value: "true" } });

  if ((await db.user.count()) === 0) {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password || password.length < 10) {
      console.warn("Aucun administrateur créé : renseigne ADMIN_EMAIL et ADMIN_PASSWORD (10 caractères minimum).");
    } else {
      await db.user.create({
        data: { name: "Admin", email, passwordHash: hashPassword(password), role: "ADMIN" },
      });
      console.log("Compte administrateur créé.");
    }
  }
  console.log("Base prête.");
}

main().finally(() => db.$disconnect());
