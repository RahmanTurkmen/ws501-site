import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { CORE_KEYS } from "@/lib/default-questions";
import { getQuestions } from "@/lib/questions";
import { deleteQuestion } from "../../../actions";
import { Confirm } from "../../client";
import { Head } from "../../ui";
import { Editor } from "./editor";

export default async function QuestionPage({ params, searchParams }: PageProps<"/equipe/formulaire/[id]">) {
  await requireUser("admin");
  const { id } = await params;
  const isNew = id === "nouvelle";
  const question = isNew ? null : (await getQuestions()).find((q) => q.id === id);
  if (!isNew && !question) notFound();
  const step = Number((await searchParams).etape) || question?.step || 1;
  const core = !!question && CORE_KEYS.has(question.key);
  return (
    <>
      <Head title={isNew ? "Nouvelle question" : "Modifier la question"} sub={`Étape ${step}`}>
        <Link href="/equipe/formulaire" className="btn btn-alt btn-small">Annuler</Link>
        {question && !core && (
          <form action={deleteQuestion}>
            <input type="hidden" name="id" value={question.id} />
            <Confirm className="btn btn-red btn-small" message="Supprimer cette question ?">Supprimer</Confirm>
          </form>
        )}
      </Head>
      {core && <p className="notice">Question d’origine : son type est verrouillé car les analyses en dépendent. Tu peux la reformuler ou la masquer. Renommer une réponse sépare les anciennes statistiques des nouvelles.</p>}
      <Editor question={question ?? null} step={step} core={core} />
    </>
  );
}
