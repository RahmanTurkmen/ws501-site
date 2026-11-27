import Link from "next/link";
import { stars } from "@/components/reviews";
import { canModerate, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { bulkResponses } from "../../actions";
import { Confirm } from "../client";
import { Empty, Head, shortDate, STATUS } from "../ui";

const FILTERS: Record<string, [string, Prisma.ResponseWhereInput]> = {
  toutes: ["Toutes", {}],
  nouvelles: ["Nouvelles", { status: "NEW" }],
  "a-traiter": ["À traiter", { status: "TODO" }],
  borne: ["Borne", { support: "Sur la borne" }],
  "en-ligne": ["En ligne", { support: "En ligne" }],
};
const SIZE = 15;

export default async function ResponsesPage({ searchParams }: PageProps<"/equipe/reponses">) {
  const user = await requireUser();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const filter = typeof params.filtre === "string" && params.filtre in FILTERS ? params.filtre : "toutes";
  const where: Prisma.ResponseWhereInput = {
    ...FILTERS[filter][1],
    ...(q ? { OR: (["pseudo", "liked", "improve"] as const).map((k) => ({ [k]: { contains: q, mode: "insensitive" as const } })) } : {}),
  };
  const [total, all] = await Promise.all([db.response.count({ where }), db.response.count()]);
  const pages = Math.max(1, Math.ceil(total / SIZE));
  const page = Math.min(pages, Math.max(1, Number(params.page) || 1));
  const rows = await db.response.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * SIZE, take: SIZE });
  const link = (over: Record<string, string | number>) =>
    `/equipe/reponses?${new URLSearchParams({ filtre: filter, q, page: "1", ...Object.fromEntries(Object.entries(over).map(([k, v]) => [k, String(v)])) })}`;

  return (
    <>
      <Head title="Réponses" sub={`${total} résultat(s) sur ${all}`}><Link href="/equipe/exports" className="btn btn-small">Exporter</Link></Head>
      <div className="row">
        <form className="row" style={{ flex: 1 }}>
          <input className="field search" type="search" name="q" defaultValue={q} placeholder="Rechercher un mot, un pseudo…" aria-label="Rechercher" />
          <input type="hidden" name="filtre" value={filter} />
        </form>
        {Object.entries(FILTERS).map(([key, [label]]) => (
          <Link key={key} href={link({ filtre: key })} className="chip" aria-pressed={key === filter}>{label}</Link>
        ))}
      </div>
      {!all ? <Empty /> : !rows.length ? <p className="notice">Aucune réponse ne correspond à cette recherche.</p> : (
        <form action={bulkResponses} className="stack">
          {canModerate(user.role) && (
            <div className="bulk">
              <span>Avec les réponses cochées :</span>
              <div className="row">
                <button className="btn btn-alt btn-small" name="op" value="read">Marquer comme lues</button>
                {user.role === "ADMIN" && <Confirm className="btn btn-red btn-small" name="op" value="delete" message="Supprimer définitivement les réponses cochées ?">Supprimer</Confirm>}
              </div>
            </div>
          )}
          <div className="table">
            <table>
              <thead><tr><th><span className="sr-only">Choisir</span></th><th>Date</th><th>Pseudo</th><th>Âge</th><th>Support</th><th>Note</th><th>Commentaire</th><th>Statut</th><th></th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><input type="checkbox" name="ids" value={r.id} aria-label={`Choisir la réponse de ${r.pseudo ?? "Anonyme"}`} /></td>
                    <td>{shortDate(r.createdAt)}</td><td>{r.pseudo ?? "Anonyme"}</td><td>{r.age}</td><td>{r.support}</td>
                    <td style={{ color: "var(--yellow)", whiteSpace: "nowrap" }}>{stars(r.rating)}</td>
                    <td>{r.flag && "⚠ "}{(r.liked || r.improve || "-").slice(0, 60)}</td>
                    <td><span className={`status ${r.status}`}>{STATUS[r.status]}</span></td>
                    <td><Link className="more" href={`/equipe/reponses/${r.id}`}>Voir →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </form>
      )}
      {pages > 1 && (
        <nav className="row between" aria-label="Pagination">
          {page > 1 ? <Link className="btn btn-alt btn-small" href={link({ page: page - 1 })}>← Précédentes</Link> : <span />}
          <span className="label">Page {page} / {pages}</span>
          {page < pages ? <Link className="btn btn-alt btn-small" href={link({ page: page + 1 })}>Suivantes →</Link> : <span />}
        </nav>
      )}
    </>
  );
}
