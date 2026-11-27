/**
 * Réponses FICTIVES pour voir le back-office rempli en local.
 *   npm run db:demo            ajoute les réponses de démonstration
 *   npm run db:demo -- --clear les supprime
 */
import "dotenv/config";
import { db } from "../src/lib/db";

const pick = <T>(list: T[], i: number) => list[i % list.length];

/** Supprime les réponses de démonstration et retire leurs signalements des compteurs de bugs. */
async function clear() {
  const where = { pseudo: { startsWith: "Démo " } };
  const rows = await db.response.findMany({ where, select: { answers: true, support: true } });
  for (const { answers, support } of rows) {
    for (const title of (answers as { bugs?: string[] }).bugs ?? []) {
      await db.bug.updateMany({ where: { title, support: support ?? "Non précisé" }, data: { count: { decrement: 1 } } });
    }
  }
  await db.bug.deleteMany({ where: { count: { lte: 0 } } });
  await db.response.deleteMany({ where });
}

async function main() {
  if (!process.env.DATABASE_URL?.includes("localhost")) {
    throw new Error("Données de démonstration réservées à la base locale.");
  }
  await clear();
  if (process.argv.includes("--clear")) {
    console.log("Réponses de démonstration supprimées.");
    return;
  }

  const liked = [
    "La jauge de la manivelle qui se vide met vraiment la pression.",
    "Les pièces sont superbes, surtout le couloir.",
    "Le téléphone en manette est une super idée.",
    "Clic est trop drôle quand il tombe en panne.",
    "La lumière qui s’éteint derrière nous, c’est super stressant.",
    "Kwak en rollers, je veux le jouer.",
  ];
  const improve = ["Un tutoriel plus clair pour la manivelle.", "Le chemin se perd un peu dans la cuisine.", "L’aspirateur arrive trop vite.", ""];

  for (let i = 0; i < 24; i++) {
    const rating = pick([5, 4, 4, 5, 3, 5, 4, 2], i);
    const support = pick(["Sur la borne", "Sur la borne", "En ligne"], i);
    const bugs = i % 5 === 0 ? ["Téléphone déconnecté"] : i % 9 === 4 ? ["Ralentissements"] : ["Aucun bug"];
    const answers = {
      age: pick(["18 - 24 ans", "15 - 17 ans", "25 - 34 ans", "18 - 24 ans", "35 ans et +"], i),
      frequency: pick(["Chaque semaine", "Tous les jours", "De temps en temps"], i),
      support,
      pseudo: `Démo ${String(i + 1).padStart(2, "0")}`,
      universe: pick([5, 4, 5, 4, 3], i),
      toy: pick(["Clic", "Clic", "Kwak", "Clic", "Badaboum", "Cosmo"], i),
      level: pick(["Cuisine", "Jardin", "Cuisine", "Bac à jouets", "Couloir"], i),
      ambiance: [pick(["Drôle", "Stressante", "Colorée"], i), pick(["Stressante", "Nostalgique"], i + 1)],
      story: pick(["Oui, tout", "Oui, tout", "En partie", "Oui, tout", "Pas vraiment"], i),
      controls: pick([3, 4, 3, 2, 5], i),
      difficulty: pick(["Parfait", "Parfait", "Dur", "Facile", "Parfait", "Trop dur"], i),
      panic: pick(["Face au danger", "Face au danger", "Ressort presque vide", "Quand ça accélère", "Face au danger"], i),
      crank: pick(["Après un moment", "Oui, tout de suite", "Après un moment", "Non"], i),
      bugs,
      rating,
      liked: pick(liked, i),
      improve: pick(improve, i),
      recommend: Math.min(10, rating * 2 - (i % 3 === 0 ? 1 : 0)),
    };
    await db.response.create({
      data: {
        answers, pseudo: answers.pseudo, age: answers.age, support, rating, recommend: answers.recommend,
        liked: answers.liked, improve: answers.improve || null,
        published: i % 3 === 0, status: i < 4 ? "NEW" : pick(["READ", "TODO", "DONE", "DOING"] as const, i),
        createdAt: new Date(Date.now() - (i % 7) * 86_400_000 - i * 3_600_000),
      },
    });
    for (const title of bugs.filter((b) => b !== "Aucun bug")) {
      await db.bug.upsert({
        where: { title_support: { title, support } },
        update: { count: { increment: 1 } },
        create: { title, support, priority: title === "Téléphone déconnecté" ? "HIGH" : "MEDIUM" },
      });
    }
  }
  console.log("24 réponses de démonstration ajoutées.");
}

main().finally(() => db.$disconnect());
