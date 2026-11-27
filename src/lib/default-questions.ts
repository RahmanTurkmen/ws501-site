export type Option = { label: string; image?: string; tone?: string; shout?: string };

type Seed = {
  key: string;
  step: number;
  label: string;
  help?: string;
  type:
    | "SINGLE" | "MULTI" | "RATING" | "SLIDER" | "TEXT_SHORT"
    | "TEXT_LONG" | "IMAGES" | "SCORE10" | "PANIC";
  options?: Option[];
  required?: boolean;
};

const list = (...labels: string[]): Option[] => labels.map((label) => ({ label }));

export const DEFAULT_QUESTIONS: Seed[] = [
  { key: "age", step: 1, label: "Tu as quel âge ?", type: "SINGLE", required: true,
    options: list("Moins de 15 ans", "15 - 17 ans", "18 - 24 ans", "25 - 34 ans", "35 ans et +") },
  { key: "frequency", step: 1, label: "Tu joues souvent aux jeux vidéo ?", type: "SINGLE", required: true,
    options: list("Tous les jours", "Chaque semaine", "De temps en temps", "Presque jamais") },
  { key: "support", step: 1, label: "Où as-tu testé OUT! ?", type: "SINGLE", required: true,
    options: list("Sur la borne", "En ligne", "Pas encore testé") },
  { key: "pseudo", step: 1, label: "Ton pseudo", help: "Facultatif. Il apparaîtra à côté de ton avis.", type: "TEXT_SHORT" },

  { key: "universe", step: 2, label: "L’univers du jeu t’a plu ?", help: "1 = pas du tout · 5 = j’adore", type: "RATING", required: true },
  { key: "toy", step: 2, label: "Quel est ton jouet préféré ?", type: "IMAGES", required: true,
    options: [
      { label: "Clic", image: "/img/clic.webp" },
      { label: "Kwak", image: "/img/kwak.webp" },
      { label: "Cosmo", image: "/img/cosmo.webp" },
      { label: "Banana Agent", image: "/img/banana-agent.webp" },
    ] },
  { key: "level", step: 2, label: "Ton niveau préféré ?", type: "IMAGES", required: true,
    options: [
      { label: "Bac à jouets", image: "/img/niveau-bac.webp" },
      { label: "Couloir", image: "/img/niveau-couloir.webp" },
      { label: "Cuisine", image: "/img/niveau-cuisine.webp" },
      { label: "Jardin", image: "/img/niveau-jardin.webp" },
    ] },
  { key: "ambiance", step: 2, label: "L’ambiance, c’est plutôt…", help: "Plusieurs réponses possibles.", type: "MULTI",
    options: list("Drôle", "Stressante", "Colorée", "Nostalgique", "Enfantine", "Confuse") },
  { key: "story", step: 2, label: "Tu as compris l’histoire ?", type: "SINGLE",
    options: list("Oui, tout", "En partie", "Pas vraiment") },

  { key: "controls", step: 3, label: "Les commandes sont-elles faciles à prendre en main ?", help: "1 = très dures · 5 = très faciles", type: "RATING", required: true },
  { key: "difficulty", step: 3, label: "Et la difficulté ?", type: "SLIDER", required: true,
    options: list("Trop facile", "Facile", "Parfait", "Dur", "Trop dur") },
  { key: "panic", step: 3, label: "Quand as-tu le plus paniqué ?", type: "PANIC", required: true,
    options: [
      { label: "Jamais", tone: "calm", shout: "zzz…" },
      { label: "Quand ça accélère", tone: "accel", shout: "vroum !" },
      { label: "Face au danger", tone: "danger", shout: "clac !" },
      { label: "Ressort presque vide", tone: "panic", shout: "VITE !!" },
    ] },
  { key: "crank", step: 3, label: "La manivelle sur le téléphone, c’était clair ?", type: "SINGLE",
    options: list("Oui, tout de suite", "Après un moment", "Non") },
  { key: "bugs", step: 3, label: "Tu as rencontré un bug ?", help: "Coche tout ce qui t’est arrivé.", type: "MULTI",
    options: list("Jouet bloqué dans le décor", "Téléphone déconnecté", "Ralentissements", "Aucun bug") },
  { key: "bugDetail", step: 3, label: "Décris le bug", help: "Facultatif", type: "TEXT_LONG" },

  { key: "rating", step: 4, label: "Ta note globale", help: "1 = bof · 5 = excellent", type: "RATING", required: true },
  { key: "liked", step: 4, label: "Ce que tu as le plus aimé", help: "Facultatif · 500 caractères max.", type: "TEXT_LONG" },
  { key: "improve", step: 4, label: "Ce qu’il faut améliorer en premier", help: "Facultatif · 500 caractères max.", type: "TEXT_LONG" },
  { key: "recommend", step: 4, label: "Tu conseillerais OUT! à un ami ?", help: "0 = sûrement pas · 10 = sans hésiter", type: "SCORE10", required: true },
];

/** Questions dont l'analyse du back-office dépend : on peut les masquer ou les reformuler, pas les supprimer. */
export const CORE_KEYS = new Set(DEFAULT_QUESTIONS.map((q) => q.key));
