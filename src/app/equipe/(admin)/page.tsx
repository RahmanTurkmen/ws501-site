import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { average, lastDays, loadRows, numbers, promoterScore, share, spread } from "@/lib/stats";
import { Bars, Empty, Head, period, PeriodFilter, scoreBar, shortDate, Stats, STATUS } from "./ui";

const DIFFICULTY = ["Trop facile", "Facile", "Parfait", "Dur", "Trop dur"];

export default async function Dashboard({ searchParams }: PageProps<"/equipe">) {
  await requireUser();
  const params = await searchParams;
  const { key, since } = period(params.periode);
  const [rows, all, bugs, latest] = await Promise.all([
    loadRows(since),
    loadRows(),
    db.bug.findMany({ where: { status: { not: "DONE" } }, orderBy: { count: "desc" } }),
    db.response.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const days = lastDays(all);
  const max = Math.max(1, ...days.map((d) => d.count));
  const crank = share(rows, "crank", "Oui, tout de suite");

  return (
    <>
      <Head title="Vue d’ensemble" sub={`${all.length} réponse(s) au total`}><PeriodFilter path="/equipe" current={key} /></Head>
      {params.refus && <p className="notice">Ton rôle ne permet pas cette action.</p>}
      {!all.length ? <Empty /> : (
        <>
          <Stats items={[
            [rows.length, "Réponses sur la période"],
            [average(rows.map((r) => r.rating)), "Note globale / 5", { decimals: 1 }],
            [promoterScore(rows), "Score de recommandation (-100 à 100)"],
            [bugs.length, "Bugs ouverts"],
          ]} />
          <div className="cols">
            <div className="card">
              <h3>Réponses par jour</h3>
              <div className="chart">
                {days.map((d, i) => (
                  <div key={i}>
                    {d.count}
                    <i className={d.count === max ? "max" : ""} style={{ height: `${(d.count / max) * 75}%`, animationDelay: `${i * 90}ms` }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3>Difficulté ressentie</h3>
              <Bars items={spread(rows, "difficulty", DIFFICULTY)} />
            </div>
            <div className="card">
              <h3>Notes par critère</h3>
              <Bars items={[
                scoreBar("Note globale", average(rows.map((r) => r.rating)), "var(--green)"),
                scoreBar("Univers", average(numbers(rows, "universe")), "var(--teal)"),
                scoreBar("Commandes", average(numbers(rows, "controls")), "var(--yellow)"),
                { label: "Manivelle claire", share: crank.share, color: "var(--red)" },
              ]} />
            </div>
            <div className="card">
              <h3>Bugs les plus signalés</h3>
              {bugs.length ? (
                <Bars items={bugs.slice(0, 5).map((b) => ({ label: `${b.title} (${b.support})`, share: b.count / bugs[0].count, text: String(b.count), color: "var(--red)" }))} />
              ) : <p className="muted">Aucun bug ouvert.</p>}
              <Link href="/equipe/bugs" style={{ color: "var(--teal)", fontWeight: 700 }}>Suivre les bugs →</Link>
            </div>
          </div>
          <div className="table">
            <table>
              <thead><tr><th>Date</th><th>Pseudo</th><th>Support</th><th>Note</th><th>Commentaire</th><th>Statut</th><th></th></tr></thead>
              <tbody>
                {latest.map((r) => (
                  <tr key={r.id}>
                    <td>{shortDate(r.createdAt)}</td><td>{r.pseudo ?? "Anonyme"}</td><td>{r.support}</td>
                    <td style={{ color: "var(--yellow)", fontWeight: 700 }}>{r.rating ? `${r.rating}/5` : "-"}</td>
                    <td>{(r.liked || r.improve || "-").slice(0, 70)}</td>
                    <td><span className={`status ${r.status}`}>{STATUS[r.status]}</span></td>
                    <td><Link className="more" href={`/equipe/reponses/${r.id}`}>Voir →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
