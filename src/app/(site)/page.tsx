/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Countdown, CountUp, Parallax, Reveal } from "@/components/motion";
import { CharacterViewer } from "@/components/character-viewer";
import { Reviews } from "@/components/reviews";
import { AlertBar, Logo, Ticker, Title } from "@/components/site";
import { publicReviews } from "@/lib/public-reviews";
import { average, loadRows, recommendShare, top } from "@/lib/stats";

export const dynamic = "force-dynamic";

const STEPS = [
  ["1", "Tu joues", "Teste OUT! sur la borne ou en ligne. Une manche suffit pour donner un avis.", "c-red", "-2deg"],
  ["2", "Tu réponds", "4 petites étapes : ton profil, l’univers, le gameplay et ton ressenti.", "c-yellow", "1.6deg"],
  ["3", "On améliore", "L’équipe lit chaque réponse et ajuste le jeu avant la version finale.", "c-teal", "-1.4deg"],
] as const;

const LEVELS = [
  ["bac", "1 · Le bac à jouets", "Tutoriel · lampe chaude et LED"],
  ["couloir", "2 · Le couloir", "Lune bleue, lumières qui s’éteignent"],
  ["cuisine", "3 · La cuisine", "L’aspirateur-robot rôde"],
  ["jardin", "4 · Le jardin", "Aube rose et or, panique max"],
] as const;

// Noms du questionnaire (src/lib/default-questions.ts) : sert uniquement au « jouet préféré ».
const TOY_NAMES = ["Clic", "Kwak", "Badaboum", "Cosmo"];

const RUN = { clip: "NormalRun", label: "Course" };
const CHARACTERS = [
  { id: "clic", src: "/models/clic.glb", name: "Clic", text: "Le jouet à clé : nerveux, insolent, il court avant l’aube.", tone: "c-red", rim: "#ff3b3b", poster: "/img/clic.webp",
    anims: [{ clip: "Idle", label: "Repos" }, RUN, { clip: "Jump", label: "Saut" }, { clip: "Slide", label: "Glisse" }, { clip: "PanickedLookBack", label: "Panique" }] },
  { id: "duckbot", src: "/models/duckbot.glb", name: "DuckBot", text: "Le canard mécanique, frimeur et toujours en rollers.", tone: "c-blue", rim: "#19e6ff", poster: "/img/kwak.webp",
    anims: [{ clip: "Idle", label: "Repos" }, RUN, { clip: "Jump", label: "Saut" }, { clip: "Grapple", label: "Grappin" }, { clip: "Cry", label: "Pleurs" }] },
  { id: "bananaagent", src: "/models/bananaagent.glb", name: "BananaAgent", text: "L’agent très spécial : costume, nœud papillon, lunettes noires.", tone: "c-yellow", rim: "#ffc81f",
    anims: [{ clip: "Idle", label: "Repos" }, RUN, { clip: "Jump", label: "Saut" }, { clip: "Slide", label: "Glisse" }, { clip: "PanickedLookBack", label: "Panique" }] },
  { id: "cosmo", src: undefined, name: "Cosmo", text: "L’astronaute, trop sûr de lui. Modèle 3D bientôt disponible.", tone: "c-orange", rim: "#ff7a1f", poster: "/img/cosmo.webp", anims: [] },
] as const;

const FAQ = [
  ["Faut-il avoir joué pour répondre ?", "C’est mieux : une manche sur la borne pendant les journées de test ou avec la version en ligne suffit."],
  ["Combien de temps ça prend ?", "Environ 3 minutes, en 4 petites étapes."],
  ["Mes réponses sont-elles anonymes ?", "Aucun e-mail ni nom réel n’est demandé, et le pseudo est facultatif."],
  ["Que faites-vous de mes réponses ?", "Elles servent uniquement à améliorer le jeu OUT!."],
];

export default async function Home() {
  const [rows, reviews] = await Promise.all([loadRows(), publicReviews(3)]);
  const note = average(rows.map((r) => r.rating));
  const reco = recommendShare(rows);
  const toy = top(rows, "toy", TOY_NAMES);

  return (
    <>
      <AlertBar>Alerte · le jour se lève · les pas se rapprochent · vite !!</AlertBar>

      <Parallax className="hero">
        <div className="hero-bg"><img src="/img/hero.webp" alt="" fetchPriority="high" /></div>
        <div className="vignette" />
        <span className="ono ono-1" aria-hidden="true">KRRRK !</span>
        <span className="ono ono-2" aria-hidden="true">CLAC CLAC</span>
        <span className="ono ono-3" aria-hidden="true">VITE !!</span>
        <div className="wrap hero-content">
          <p className="tag">avant l’aube…</p>
          <Logo className="hero-logo" href={null} />
          <h1 className="glitch">Vite ! Le jour<br />se lève !</h1>
          <p style={{ fontSize: 20 }}>Les lumières s’éteignent, la main descend, le ressort de Clic est presque vide. Tu as joué ? Dis-nous vite ce qui t’a fait paniquer.</p>
          <div className="hero-actions">
            <Link href="/questionnaire" className="btn btn-big">Vite, donner mon avis</Link>
            <Link href="/jeu" className="btn btn-alt">Découvrir le jeu</Link>
          </div>
          <p className="label" style={{ color: "var(--yellow)" }}>≈ 3 min · anonyme · sans compte</p>
        </div>
        <div className="hero-chrono"><Countdown /></div>
        <div className="runner" aria-hidden="true"><img src="/img/clic-course.webp" alt="" /></div>
      </Parallax>

      <Ticker words={["VITE !!", "LE JOUR SE LÈVE", "REMONTE LA CLÉ", "DONNE TON AVIS"]} />

      <section className="section">
        <div className="halftone" style={{ right: -80, top: 30, color: "#7b2ff7", scale: "-1 1" }} />
        <div className="wrap">
          <Title num="01">Comment ça marche</Title>
          <div className="grid">
            {STEPS.map(([n, title, text, tone, r], i) => (
              <Reveal key={n} delay={i * 160} from="pop">
                <div className={`card step-card ${tone}`} style={{ "--r": r } as React.CSSProperties}>
                  <b>{n}</b><h3>{title}</h3><p>{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-ink">
        <div className="wrap">
          <Title num="02">Une maison à traverser</Title>
          <p className="lead">Un niveau, une pièce, une lumière. Derrière Clic, les lumières s’éteignent et les pas se rapprochent.</p>
          <div className="grid" style={{ "--cols": 4, "--cols-m": 2 } as React.CSSProperties}>
            {LEVELS.map(([id, title, text], i) => (
              <Reveal key={id} delay={i * 130}>
                <Link href="/jeu" className="card poster">
                  <img src={`/img/niveau-${id}.webp`} alt={title} loading="lazy" />
                  <div><h3>{title}</h3><p className="muted">{text}</p></div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="halftone" style={{ left: 0, top: 0, color: "var(--teal)" }} />
        <div className="wrap">
          <Title num="03">Quatre persos, une course</Title>
          <p className="lead">Glisse pour les faire tourner, change leur animation : ils sortent tout droit du jeu.</p>
          <div className="grid" style={{ "--cols": 4, "--cols-m": 1 } as React.CSSProperties}>
            {CHARACTERS.map((c, i) => (
              <Reveal key={c.id} delay={i * 130} from={i < 2 ? "left" : "right"}>
                <div className="card poster char-card">
                  <CharacterViewer src={c.src} name={c.name} anims={[...c.anims]} rim={c.rim} poster={"poster" in c ? c.poster : undefined} />
                  <div className={c.tone}><h3>{c.name}</h3><p>{c.text}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-ink">
        <div className="wrap">
          <Title num="04">Ce que disent les testeurs</Title>
          <div className="grid" style={{ "--cols": 4, "--cols-m": 2 } as React.CSSProperties}>
            <div className="card stat c-yellow"><strong>{note === null ? "—" : <CountUp value={note} decimals={1} suffix="/5" />}</strong>Note moyenne</div>
            <div className="card stat c-teal"><strong><CountUp value={rows.length} /></strong>Réponses reçues</div>
            <div className="card stat c-pink"><strong>{reco === null ? "—" : <CountUp value={reco * 100} suffix=" %" />}</strong>Recommandent le jeu</div>
            <div className="card stat c-orange"><strong style={{ fontSize: toy && toy.label.length > 6 ? 30 : undefined }}>{toy?.label ?? "—"}</strong>Jouet préféré</div>
          </div>
          <Reviews reviews={reviews} />
          <div><Link href="/avis" className="btn btn-alt">Voir tous les avis</Link></div>
        </div>
      </section>

      <section className="section">
        <div className="wrap faq">
          <Title num="05">Questions fréquentes</Title>
          <div>
            {FAQ.map(([q, a], i) => (
              <details key={q} name="faq" open={i === 0}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Ticker words={["CLAC CLAC", "ON T’ÉCOUTE", "3 MINUTES CHRONO"]} tone="teal" reverse />
      <AlertBar>La main descend · le carton se referme · Clic n’a plus le temps</AlertBar>
      <section className="final">
        <div className="wrap">
          <div className="copy">
            <p className="tag">vite !!</p>
            <h2 className="glitch">Trop tard dans 3, 2, 1…</h2>
            <p style={{ fontSize: 20 }}>3 minutes suffisent. Ton avis peut changer la suite de la course.</p>
            <Link href="/questionnaire" className="btn btn-big">Donner mon avis</Link>
          </div>
          <Reveal from="right">
            <figure><img src="/img/panique-duckbot.webp" alt="DuckBot plonge en avant, une main géante descend derrière lui : VITE !!" loading="lazy" /></figure>
          </Reveal>
        </div>
      </section>
    </>
  );
}
