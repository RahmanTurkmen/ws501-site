/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { Countdown, Reveal } from "@/components/motion";
import { AlertBar, Ticker, Title } from "@/components/site";

export const metadata: Metadata = { title: "Le jeu" };

const STORY = [
  ["Le jouet oublié", "Clic est un jouet à clé. L’enfant qui l’aimait a grandi, l’a customisé, puis l’a laissé au fond du bac.", "var(--teal)"],
  ["Le déclencheur", "Ce soir, les parents trient la chambre. La clé de Clic se met à tourner toute seule, par panique pure.", "var(--yellow)"],
  ["La course", "Le bac à jouets, le couloir, la cuisine, le jardin. Les lumières s’éteignent derrière lui.", "var(--orange)"],
  ["La fin", "Atteindre la fenêtre de la chambre juste avant le lever du jour.", "var(--red)"],
];

const LEVELS = [
  ["Calme", "La maison dort. Cadre droit, clé lente.", "c-calm"],
  ["Accélération", "Une porte s’ouvre. Traits de vitesse, cadre penché.", "c-accel"],
  ["Danger", "Les lumières s’éteignent. « CLAC CLAC ».", "c-danger"],
  ["Panique max", "La main descend, le ressort est presque vide.", "c-panic"],
];

const PAD = [
  ["Bouger", "Joystick à gauche.", "var(--red)"],
  ["Saut · Grappin · Glisse", "Trois gros boutons sous le pouce droit.", "var(--teal)"],
  ["La manivelle", "Glisse le pouce de haut en bas pour remonter Clic. Vide : très lent. Surcharge : déréglé.", "var(--yellow)"],
];

const SHOTS = [
  ["course", "La course", "Clic détale sur le parquet, Kwak sur ses talons."],
  ["porte", "La porte entrouverte", "Le couloir, et Banana Agent qui file devant."],
  ["lune", "Clair de lune", "Une halte sur le bureau, face à la fenêtre."],
  ["sous_le_lit", "Sous le lit", "Clic se cache les mains sur la tête."],
  ["panique", "Panique", "Plus un seul endroit où se poser."],
  ["poursuite", "La poursuite", "Vue de haut : quelqu’un est sur leurs traces."],
  ["ombres", "Les ombres", "Deux yeux rouges dans le noir."],
  ["duo", "Le trio", "Clic, Kwak et Banana Agent, prêts à courir."],
  ["grande_chambre", "La grande chambre", "Le terrain de jeu, vu d’en bas."],
] as const;

export default function GamePage() {
  return (
    <>
      <AlertBar>La maison s’éteint · les pas se rapprochent · cours Clic</AlertBar>
      <header className="page-head">
        <div className="halftone" style={{ right: 0, top: 0, color: "#7b2ff7", scale: "-1 1" }} />
        <div className="wrap">
          <p className="tag">TV + téléphone</p>
          <h1>Une course contre l’aube</h1>
          <p className="lead" style={{ color: "var(--cream)" }}>Un jouet mécanique à remontoir, oublié au fond d’une chambre, se réveille un soir de grand tri. Il doit traverser toute la maison avant que son ressort ne s’arrête, et avant de finir dans le carton des dons.</p>
          <img className="mascot" src="/img/clic-saut.webp" alt="" />
        </div>
      </header>
      <Ticker words={["COURS CLIC", "LA MAISON S’ÉTEINT", "LES PAS SE RAPPROCHENT"]} tone="red" />

      <section className="section">
        <div className="wrap">
          <Title num="01">L’histoire</Title>
          <div className="split">
            <Reveal from="left"><img className="framed" src="/img/histoire.webp" alt="Planche de bande dessinée racontant le réveil de Clic" /></Reveal>
            <div className="stack">
              {STORY.map(([title, text, color], i) => (
                <Reveal key={title} delay={i * 140} from="right">
                  <div className="card"><h3 style={{ color }}>{title}</h3><p>{text}</p></div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-ink">
        <div className="vignette" />
        <div className="wrap">
          <Title num="02">La panique monte</Title>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 24, alignItems: "center" }}>
            <p className="lead">Quatre paliers : la lumière, le cadre et le son changent avec l’urgence.</p>
            <Countdown small />
          </div>
          <Reveal from="pop"><img className="framed" src="/img/panique.webp" alt="Les quatre paliers de panique : calme, accélération, danger, panique maximale" /></Reveal>
          <div className="grid" style={{ "--cols": 4, "--cols-m": 2 } as React.CSSProperties}>
            {LEVELS.map(([title, text, tone], i) => (
              <Reveal key={title} delay={i * 220}>
                <div className={`card ${tone}`} style={{ animation: i === 3 ? "shake-slow 1.6s infinite" : undefined }}><h3>{title}</h3><p>{text}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Title num="03">Ton téléphone, la manette</Title>
          <p className="lead">Le grand écran porte l’action, le smartphone est le cœur de Clic.</p>
          <div className="split">
            <Reveal from="left"><img className="framed" src="/img/manette.webp" alt="La manette sur téléphone : joystick, saut, grappin, glisse et manivelle" /></Reveal>
            <div className="stack">
              {PAD.map(([title, text, color], i) => (
                <Reveal key={title} delay={i * 140} from="right">
                  <div className="card"><h3 style={{ color }}>{title}</h3><p>{text}</p></div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Title num="04">Dans la chambre</Title>
          <p className="lead">Des images tirées du jeu : la chambre, la nuit, et trois jouets qui courent.</p>
          <Reveal from="pop"><img className="framed" src="/img/jeu/banniere.webp" alt="Clic, Kwak et Banana Agent courent à travers la chambre, la nuit" loading="lazy" /></Reveal>
          <div className="grid" style={{ "--cols": 3, "--cols-m": 2 } as React.CSSProperties}>
            {SHOTS.map(([id, title, text], i) => (
              <Reveal key={id} delay={(i % 3) * 120} from="pop">
                <figure className="card poster shot" style={{ "--ratio": "5/7" } as React.CSSProperties}>
                  <img src={`/img/jeu/${id}.webp`} alt={`${title} : ${text}`} loading="lazy" />
                  <figcaption><h3>{title}</h3><p className="muted">{text}</p></figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-ink" style={{ textAlign: "center" }}>
        <div className="wrap" style={{ alignItems: "center" }}>
          <h2 className="big-title">Tu as joué ? Raconte.</h2>
          <Link href="/questionnaire" className="btn btn-big">Donner mon avis</Link>
        </div>
      </section>
    </>
  );
}
