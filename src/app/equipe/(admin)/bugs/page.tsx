import { canModerate, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { addBug, deleteBug, updateBug } from "../../actions";
import { AutoSelect, Confirm, Save } from "../client";
import { BUG_STATUS, Head, PRIORITY } from "../ui";

const COLUMNS = [["TODO", "var(--orange)"], ["DOING", "var(--yellow)"], ["DONE", "var(--green)"]] as const;

export default async function BugsPage() {
  const user = await requireUser();
  const bugs = await db.bug.findMany({ orderBy: [{ priority: "asc" }, { count: "desc" }] });
  return (
    <>
      <Head title="Bugs signalés" sub={`${bugs.length} bug(s) suivi(s)`} />
      {canModerate(user.role) && (
        <form action={addBug} className="card">
          <h3>Ajouter un bug</h3>
          <div className="row">
            <input className="field" name="title" required maxLength={120} placeholder="Décris le bug" aria-label="Titre du bug" style={{ flex: 1, minWidth: 220, width: "auto" }} />
            <select className="select" name="support" aria-label="Support"><option>Sur la borne</option><option>En ligne</option><option>Non précisé</option></select>
            <select className="select" name="priority" defaultValue="MEDIUM" aria-label="Priorité">{Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>Priorité {v.toLowerCase()}</option>)}</select>
            <Save>Ajouter</Save>
          </div>
        </form>
      )}
      <div className="kanban">
        {COLUMNS.map(([status, color]) => {
          const list = bugs.filter((b) => b.status === status);
          return (
            <section key={status}>
              <h2 style={{ background: color }}>{BUG_STATUS[status]} · {list.length}</h2>
              {!list.length && <p className="muted">Rien ici.</p>}
              {list.map((b) => (
                <article className="card" key={b.id}>
                  <div><span className={`status ${b.priority}`}>Priorité {PRIORITY[b.priority].toLowerCase()}</span></div>
                  <strong>{b.title}</strong>
                  <p className="muted">{b.support} · {b.count} signalement(s)</p>
                  {canModerate(user.role) && (
                    <form action={updateBug} className="row" key={`${b.status}-${b.priority}`}>
                      <input type="hidden" name="id" value={b.id} />
                      <AutoSelect name="status" value={b.status} options={BUG_STATUS} label="Statut" />
                      <AutoSelect name="priority" value={b.priority} options={PRIORITY} label="Priorité" />
                    </form>
                  )}
                  {user.role === "ADMIN" && (
                    <form action={deleteBug}>
                      <input type="hidden" name="id" value={b.id} />
                      <Confirm className="btn btn-ghost btn-small" message="Supprimer ce bug du suivi ?">Supprimer</Confirm>
                    </form>
                  )}
                </article>
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}
