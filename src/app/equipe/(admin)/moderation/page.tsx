import Link from "next/link";
import { stars } from "@/components/reviews";
import { canModerate, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { publishAll, setVisibility } from "../../actions";
import { Confirm } from "../client";
import { Head, shortDate } from "../ui";

const withText: Prisma.ResponseWhereInput = { OR: [{ liked: { not: null } }, { improve: { not: null } }] };
const TABS: Record<string, [string, Prisma.ResponseWhereInput]> = {
  attente: ["En attente", { published: false, hidden: false, ...withText }],
  publies: ["Publiés", { published: true }],
  masques: ["Masqués", { hidden: true }],
};

export default async function ModerationPage({ searchParams }: PageProps<"/equipe/moderation">) {
  const user = await requireUser();
  const params = await searchParams;
  const tab = typeof params.onglet === "string" && params.onglet in TABS ? params.onglet : "attente";
  const [rows, ...counts] = await Promise.all([
    db.response.findMany({ where: TABS[tab][1], orderBy: { createdAt: "desc" }, take: 60 }),
    ...Object.values(TABS).map(([, where]) => db.response.count({ where })),
  ]);

  return (
    <>
      <Head title="Modération des avis" sub={`${counts[0]} avis en attente`}>
        {canModerate(user.role) && tab === "attente" && rows.length > 0 && (
          <form action={publishAll}>
            <Confirm className="btn btn-small" message="Publier tous les avis en attente sans alerte ? Pense à les avoir relus.">Tout publier</Confirm>
          </form>
        )}
      </Head>
      <div className="row">
        {Object.entries(TABS).map(([key, [label]], i) => (
          <Link key={key} href={`/equipe/moderation?onglet=${key}`} className="chip" aria-pressed={key === tab}>{label} · {counts[i]}</Link>
        ))}
      </div>
      <p className="notice">Un avis publié apparaît sur « Avis des joueurs ». Masque tout message blessant ou contenant des données personnelles.</p>
      {!rows.length && <div className="card empty"><h3>Rien à relire ici</h3><p className="muted">La clé est au repos.</p></div>}
      <div className="cols">
        {rows.map((r) => (
          <article className="card" key={r.id}>
            <div className="row between">
              <span className="stars">{stars(r.rating)}</span>
              <span className="label">{shortDate(r.createdAt)}</span>
            </div>
            {r.flag && <p className="error-banner">⚠ {r.flag}</p>}
            {r.liked && <p className="quote">« {r.liked} »</p>}
            {r.improve && <p><span className="label">À améliorer</span><br />{r.improve}</p>}
            <p className="label">{r.pseudo ?? "Anonyme"} · {r.support}</p>
            <div className="row">
              {canModerate(user.role) && (
                <form action={setVisibility} className="row">
                  <input type="hidden" name="id" value={r.id} />
                  {!r.published && <button className="btn btn-small" name="mode" value="publish">Publier</button>}
                  {!r.hidden && <button className="btn btn-alt btn-small" name="mode" value="hide">Masquer</button>}
                </form>
              )}
              <Link href={`/equipe/reponses/${r.id}`} style={{ color: "var(--teal)", fontWeight: 700 }}>Voir la réponse →</Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
