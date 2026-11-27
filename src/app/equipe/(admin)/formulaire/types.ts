import type { QuestionType } from "@/generated/prisma/enums";

export const TYPES: Record<QuestionType, string> = {
  SINGLE: "Choix unique", MULTI: "Choix multiple", RATING: "Note 1-5", SLIDER: "Curseur",
  TEXT_SHORT: "Texte court", TEXT_LONG: "Texte libre", IMAGES: "Images", SCORE10: "Note 0-10", PANIC: "Cartes panique",
};
