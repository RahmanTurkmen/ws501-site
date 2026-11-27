/** Contrôle des réponses, partagé entre le navigateur et le serveur. */
import type { QuestionView } from "./questions";

export type Answer = string | number | string[];
export type Answers = Record<string, Answer>;

export const LIMITS = { TEXT_SHORT: 30, TEXT_LONG: 500 } as const;

export function cleanAnswer(q: QuestionView, value: unknown): Answer | undefined {
  const labels = q.options.map((o) => o.label);
  switch (q.type) {
    case "SINGLE":
    case "IMAGES":
    case "PANIC":
    case "SLIDER":
      return typeof value === "string" && labels.includes(value) ? value : undefined;
    case "MULTI": {
      if (!Array.isArray(value)) return undefined;
      const picked = labels.filter((l) => value.includes(l));
      return picked.length ? picked : undefined;
    }
    case "RATING":
    case "SCORE10": {
      const [min, max] = q.type === "RATING" ? [1, 5] : [0, 10];
      return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max ? value : undefined;
    }
    case "TEXT_SHORT":
    case "TEXT_LONG": {
      if (typeof value !== "string") return undefined;
      return value.trim().slice(0, LIMITS[q.type]) || undefined;
    }
  }
}

export function validate(questions: QuestionView[], input: Record<string, unknown>) {
  const answers: Answers = {};
  const errors: Record<string, string> = {};
  for (const q of questions) {
    const value = cleanAnswer(q, input[q.key]);
    if (value !== undefined) answers[q.key] = value;
    else if (q.required) errors[q.key] = "Réponse obligatoire.";
  }
  return { answers, errors };
}
