import Link from "next/link";
import { notFound } from "next/navigation";
import { canModerate, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getQuestions } from "@/lib/questions";
import type { Answers } from "@/lib/validate";
import { deleteResponse, setVisibility, updateResponse } from "../../../actions";
import { Confirm, Save } from "../../client";
import { Head, shortDate, STATUS } from "../../ui";

const STEP_NAMES = ["01 · Profil", "02 · Univers", "03 · Gameplay", "04 · Avis"];

export default async function ResponsePage({ params }: PageProps<"/equipe/reponses/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const [r, questions] = await Promise.all([db.response.findUnique({ where: { id } }), getQuestions()]);
  if (!r) notFound();
  const answers = r.answers as Answers;
  const [previous, next] = await Promise.all([
    db.response.findFirst({ where: { createdAt: { gt: r.createdAt } }, orderBy: { createdAt: "asc" }, select: { id: true } }),
    db.response.findFirst({ where: { createdAt: { lt: r.createdAt } }, orderBy: { createdAt: "desc" }, select: { id: true } }),
  ]);
  const state = r.published ? "Publié sur le site" : r.hidden ? "Masqué" : "En attente";

  return (
    <>
      <Head title={`Réponse de ${r.pseudo ?? "Anonyme"}`} sub={`${shortDate(r.createdAt)} · ${r.support ?? ""} · ${r.age ?? ""}`}>
        <Link href="/equipe/reponses" className="btn btn-alt btn-small">← Retour à la liste</Link>
        {user.role === "ADMIN" && (
          <form action={deleteResponse}>
            <input type="hidden" name="id" value={r.id} />
            <Confirm className="btn btn-red btn-small" message="Supprimer définitivement cette réponse ? Elle disparaîtra des statistiques.">Supprimer</Confirm>
          </form>
        )}
      </Head>
      {r.flag && <p className="error-banner">⚠ {r.flag} : à vérifier avant toute publication.</p>}
      <div className="cols">
        <div className="stack">
          {STEP_NAMES.map((name, i) => {
            const list = questions.filter((q) => q.step === i + 1 && answers[q.key] !== undefined);
            if (!list.length) return null;
            return (
              <div className="card" key={name}>
                <h3>{name}</h3>
                {list.map((q) => {
                  const v = answers[q.key];
                  return (
                    <div className="line" key={q.key}>
                      <span>{q.label}</span>
                      <strong>{Array.isArray(v) ? v.join(", ") : q.type === "RATING" ? `${v} / 5` : q.type === "SCORE10" ? `${v} / 10` : v}</strong>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="stack">
          <form action={updateResponse} className="card">
            <h3>Suivi</h3>
            <input type="hidden" name="id" value={r.id} />
            <fieldset disabled={!canModerate(user.role)}>
              <label className="block">Statut
                <select className="field" name="status" defaultValue={r.status} key={r.status}>
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
              <label className="block">Assigné à<input className="field" name="assignee" defaultValue={r.assignee ?? ""} placeholder="Équipe gameplay" /></label>
              <label className="block">Note interne<textarea className="field" name="note" defaultValue={r.note ?? ""} placeholder="Visible par l’équipe seulement" /></label>
              {canModerate(user.role) && <div><Save>Enregistrer</Save></div>}
            </fieldset>
          </form>
          <div className="card">
            <h3>Publication</h3>
            <p><strong>{state}</strong></p>
            <p className="muted">Seuls la note, un commentaire, le pseudo, l’âge et le support sont publiés.</p>
            {canModerate(user.role) && (r.liked || r.improve ? (
              <form action={setVisibility} className="row">
                <input type="hidden" name="id" value={r.id} />
                {!r.published && <button className="btn btn-small" name="mode" value="publish">Publier l’avis</button>}
                {!r.hidden && <button className="btn btn-alt btn-small" name="mode" value="hide">Masquer</button>}
              </form>
            ) : <p className="muted">Aucun commentaire à publier.</p>)}
          </div>
          <div className="row between">
            {previous ? <Link className="btn btn-alt btn-small" href={`/equipe/reponses/${previous.id}`}>← Plus récente</Link> : <span />}
            {next ? <Link className="btn btn-alt btn-small" href={`/equipe/reponses/${next.id}`}>Plus ancienne →</Link> : <span />}
          </div>
        </div>
      </div>
    </>
  );
}
