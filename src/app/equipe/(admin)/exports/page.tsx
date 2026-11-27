import { canModerate, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CopyLink } from "../client";
import { Head, shortDate } from "../ui";

export default async function ExportsPage() {
  const user = await requireUser();
  const history = await db.exportLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 });
  const allowed = canModerate(user.role);
  return (
    <>
      <Head title="Exports" sub="Télécharger les réponses"><CopyLink /></Head>
      <div className="cols">
        {allowed ? (
          <form className="card" action="/api/export" method="get">
            <h3>Nouvel export</h3>
            <span className="label">Format</span>
            <div className="row">
              <label className="choice chip"><input type="radio" name="format" value="csv" defaultChecked />CSV (Excel)</label>
              <label className="choice chip"><input type="radio" name="format" value="json" />JSON</label>
            </div>
            <span className="label">Période</span>
            <div className="row">
              {[["7", "7 jours"], ["30", "30 jours"], ["tout", "Tout"]].map(([v, l]) => (
                <label key={v} className="choice chip"><input type="radio" name="periode" value={v} defaultChecked={v === "tout"} />{l}</label>
              ))}
            </div>
            <span className="label">Champs à inclure</span>
            {[["1", "Profil", true], ["2", "Univers et DA", true], ["3", "Gameplay et bugs", true], ["4", "Avis libres", true]].map(([v, l, on]) => (
              <label key={String(v)} className="inline"><input type="checkbox" name="etape" value={String(v)} defaultChecked={Boolean(on)} />{l}</label>
            ))}
            <label className="inline"><input type="checkbox" name="notes" value="1" />Notes internes</label>
            <label className="inline"><input type="checkbox" name="anonyme" value="1" defaultChecked />Retirer les pseudos</label>
            <div><button type="submit" className="btn">Générer l’export</button></div>
          </form>
        ) : <p className="notice">Ton rôle ne permet pas d’exporter.</p>}
        <div className="stack">
          <h3>Historique</h3>
          {history.length ? (
            <div className="table">
              <table>
                <thead><tr><th>Date</th><th>Fichier</th><th>Lignes</th><th>Par</th><th></th></tr></thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td>{shortDate(h.createdAt)}</td><td>{h.filename}</td><td>{h.rows}</td><td>{h.author}</td>
                      <td>{allowed && <a className="more" href={`/api/export?${h.query}`}>Regénérer ↓</a>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="muted">Aucun export pour l’instant.</p>}
          <p className="notice"><strong>Données personnelles.</strong> Un export reste confidentiel : partage-le uniquement avec l’équipe et supprime-le après analyse.</p>
        </div>
      </div>
    </>
  );
}
