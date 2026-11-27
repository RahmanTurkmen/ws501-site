/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { CountUp } from "@/components/motion";
import { Reviews, stars } from "@/components/reviews";
import { AlertBar, Ticker, Title } from "@/components/site";
import { publicReviews } from "@/lib/public-reviews";
import { getQuestions } from "@/lib/questions";
import { average, loadRows, percent, recommendShare, share, spread } from "@/lib/stats";

export const metadata: Metadata = { title: "Avis des joueurs" };
export const dynamic = "force-dynamic";

const FILTERS = {
  tous: ["Tous", {}],
  borne: ["Borne", { support: "Sur la borne" }],
  "en-ligne": ["En ligne", { support: "En ligne" }],
  "5-etoiles": ["5 étoiles", { rating: 5 }],
} as const;

const TOY_COLORS = ["var(--red)", "var(--blue)", "var(--green)", "var(--orange)"];
const NOTE_COLORS = ["var(--green)", "var(--teal)", "var(--yellow)", "var(--orange)", "var(--red)"];

export default async function ReviewsPage({ searchParams }: PageProps<"/avis">) {
  const params = await searchParams;
  const filter = (typeof params.filtre === "string" && params.filtre in FILTERS ? params.filtre : "tous") as keyof typeof FILTERS;
  const take = Math.min(60, Math.max(6, Number(params.n) || 6));

  const [rows, reviews, questions] = await Promise.all([
    loadRows(), publicReviews(take + 1, FILTERS[filter][1]), getQuestions(),
  ]);
  const toys = questions.find((q) => q.key === "toy")?.options.map((o) => o.label) ?? [];
  const ratings = spread(rows, "rating", [5, 4, 3, 2, 1]);
  const note = average(rows.map((r) => r.rating));
  const reco = recommendShare(rows);
  const danger = share(rows, "panic", "Face au danger");

  return (
    <>
      <AlertBar>Ils ont paniqué · et toi ? Donne vite ton avis</AlertBar>
      <header className="page-head">
        <div className="halftone" style={{ right: 0, top: 0, color: "var(--pink)", scale: "-1 1" }} />
        <div className="wrap">
          <p className="tag">résultats en direct</p>
          <h1>Les avis des joueurs</h1>
          <p className="lead">Les chiffres sont calculés à partir des réponses reçues. Les commentaires apparaissent après relecture par l’équipe.</p>
          <img className="mascot" src="/img/clic-regard.webp" alt="" />
        </div>
      </header>
      <Ticker words={["AVIS EN DIRECT", "CHAQUE RÉPONSE COMPTE"]} tone="pink" />

      <section className="section">
        <div className="wrap">
          <div className="grid" style={{ "--cols": 4, "--cols-m": 2 } as React.CSSProperties}>
            <div className="card stat c-yellow"><strong>{note === null ? "—" : <CountUp value={note} decimals={1} suffix="/5" />}</strong>Note moyenne</div>
            <div className="card stat c-teal"><strong><CountUp value={rows.length} /></strong>Réponses</div>
            <div className="card stat c-pink"><strong>{reco === null ? "—" : <CountUp value={reco * 100} suffix=" %" />}</strong>Le recommandent</div>
            <div className="card stat c-orange"><strong>{rows.length ? percent(danger.share) : "—"}</strong>Ont le plus paniqué face au danger</div>
          </div>
          <div className="grid" style={{ "--cols": 2 } as React.CSSProperties}>
            <div className="card">
              <h3>Répartition des notes</h3>
              <div className="bars">
                {ratings.map((r, i) => (
                  <div className="bar" key={r.label}>
                    <span style={{ all: "unset", color: "var(--yellow)" }}>{stars(Number(r.label))}</span>
                    <span><i style={{ "--w": `${r.share * 100}%`, background: NOTE_COLORS[i] } as React.CSSProperties} /></span>
                    <b>{percent(r.share)}</b>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3>Jouet préféré</h3>
              <div className="bars">
                {spread(rows, "toy", toys).map((r, i) => (
                  <div className="bar" key={r.label}>
                    <span style={{ all: "unset" }}>{r.label}</span>
                    <span><i style={{ "--w": `${r.share * 100}%`, background: TOY_COLORS[i % 4] } as React.CSSProperties} /></span>
                    <b>{percent(r.share)}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Title>Ils en parlent</Title>
          <nav className="filters" aria-label="Filtrer les avis">
            {Object.entries(FILTERS).map(([key, [label]]) => (
              <Link key={key} href={`/avis?filtre=${key}`} scroll={false} className="chip" aria-pressed={key === filter}>{label}</Link>
            ))}
          </nav>
          <Reviews reviews={reviews.slice(0, take)} />
          <div className="filters" style={{ justifyContent: "center" }}>
            {reviews.length > take && <Link href={`/avis?filtre=${filter}&n=${take + 6}`} scroll={false} className="btn btn-alt">Voir plus d’avis</Link>}
            <Link href="/questionnaire" className="btn">Donner mon avis</Link>
          </div>
        </div>
      </section>
    </>
  );
}
