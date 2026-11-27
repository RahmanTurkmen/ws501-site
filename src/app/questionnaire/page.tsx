import type { Metadata } from "next";
import Link from "next/link";
import { ClickBursts } from "@/components/motion";
import { Logo } from "@/components/site";
import { getQuestions, isFormOpen } from "@/lib/questions";
import { Quiz } from "./quiz";

export const metadata: Metadata = { title: "Questionnaire" };
export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const [questions, open] = await Promise.all([getQuestions(true), isFormOpen()]);
  if (!open || !questions.length) {
    return (
      <main className="thanks">
        <div className="wrap">
          <Logo />
          <h1 className="big-title">Le questionnaire est fermé</h1>
          <p>La clé est au repos pour le moment. Reviens bientôt !</p>
          <Link href="/" className="btn">Retour à l’accueil</Link>
        </div>
      </main>
    );
  }
  return (
    <>
      <Quiz questions={questions} />
      <ClickBursts />
    </>
  );
}
