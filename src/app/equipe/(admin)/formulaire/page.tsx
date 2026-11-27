import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getQuestions, isFormOpen } from "@/lib/questions";
import { moveQuestion, toggleForm, toggleQuestion } from "../../actions";
import { CopyLink } from "../client";
import { Head } from "../ui";
import { TYPES } from "./types";

const STEP_NAMES = ["01 · Profil", "02 · Univers", "03 · Gameplay", "04 · Ton avis"];
const TONES = ["var(--calm)", "var(--accel)", "var(--danger)", "var(--panic-red)"];

export default async function FormSettingsPage() {
  await requireUser("admin");
  const [questions, open] = await Promise.all([getQuestions(), isFormOpen()]);
  return (
    <>
      <Head title="Réglages du formulaire" sub={`${questions.filter((q) => q.active).length} questions affichées`}>
        <CopyLink />
        <Link href="/questionnaire" target="_blank" className="btn btn-alt btn-small">Aperçu</Link>
      </Head>
      <form action={toggleForm} className="card">
        <div className="row between">
          <strong>{open ? "Questionnaire ouvert au public" : "Questionnaire fermé"}</strong>
          <button className={`switch ${open ? "on" : ""}`} role="switch" aria-checked={open} aria-label="Questionnaire ouvert"><i /></button>
        </div>
      </form>
      {STEP_NAMES.map((name, i) => (
        <div className="card" key={name} style={{ boxShadow: `8px 10px 0 ${TONES[i]}` }}>
          <h3>{name}</h3>
          {questions.filter((q) => q.step === i + 1).map((q) => (
            <div className={`question-row ${q.active ? "" : "off"}`} key={q.id}>
              <form action={moveQuestion} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <input type="hidden" name="id" value={q.id} />
                <button className="arrow" name="dir" value="up" aria-label="Monter">▲</button>
                <button className="arrow" name="dir" value="down" aria-label="Descendre">▼</button>
              </form>
              <div><strong>{q.label}</strong><br /><Link href={`/equipe/formulaire/${q.id}`} style={{ color: "var(--teal)", fontWeight: 700, fontSize: 14 }}>Modifier →</Link></div>
              <span className="status">{TYPES[q.type]}{q.required ? " · obligatoire" : ""}</span>
              <form action={toggleQuestion}>
                <input type="hidden" name="id" value={q.id} />
                <button className={`switch ${q.active ? "on" : ""}`} role="switch" aria-checked={q.active} aria-label={`Afficher « ${q.label} »`}><i /></button>
              </form>
            </div>
          ))}
          <div><Link href={`/equipe/formulaire/nouvelle?etape=${i + 1}`} className="btn btn-ghost btn-small">+ Ajouter une question</Link></div>
        </div>
      ))}
    </>
  );
}
