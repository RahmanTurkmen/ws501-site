import { db } from "./db";
import type { Option } from "./default-questions";
import type { QuestionType } from "@/generated/prisma/enums";

export type QuestionView = {
  id: string; key: string; step: number; position: number; label: string; help: string | null;
  type: QuestionType; options: Option[]; required: boolean; active: boolean;
};

export async function getQuestions(activeOnly = false): Promise<QuestionView[]> {
  const rows = await db.question.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: [{ step: "asc" }, { position: "asc" }],
  });
  return rows.map((q) => ({ ...q, options: (q.options ?? []) as Option[] }));
}

export async function isFormOpen() {
  const s = await db.setting.findUnique({ where: { key: "formOpen" } });
  return s?.value !== "false";
}
