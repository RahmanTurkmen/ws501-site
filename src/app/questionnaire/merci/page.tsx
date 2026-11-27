/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { ClickBursts } from "@/components/motion";
import { AlertBar, Logo } from "@/components/site";
import { Recap } from "./recap";

export const metadata: Metadata = { title: "Merci" };

const COLORS = ["#ff3b3b", "#ffc81f", "#19b5b0", "#ff3da8", "#ff7a1f", "#2f7bff"];

export default function ThanksPage() {
  return (
    <main className="thanks">
      {Array.from({ length: 60 }, (_, i) => (
        <span key={i} className="confetti" aria-hidden="true"
          style={{ left: `${(i * 37) % 100}%`, background: COLORS[i % COLORS.length], animationDuration: `${2.6 + (i % 7) * 0.45}s`, animationDelay: `${-(i % 11) * 0.5}s` }} />
      ))}
      <div className="wrap">
        <Logo />
        <AlertBar>Clé remontée à bloc</AlertBar>
        <div className="thanks-art"><img src="/img/clic-saut.webp" alt="" /></div>
        <p className="tag">KRRRK !</p>
        <h1 className="big-title">Merci, ton avis est parti</h1>
        <p style={{ fontSize: 20 }}>La clé de Clic est remontée. L’équipe lit toutes les réponses avant la prochaine version.</p>
        <Recap />
        <div className="filters" style={{ justifyContent: "center" }}>
          <Link href="/avis" className="btn">Voir les avis</Link>
          <Link href="/" className="btn btn-alt">Retour à l’accueil</Link>
        </div>
      </div>
      <ClickBursts />
    </main>
  );
}
