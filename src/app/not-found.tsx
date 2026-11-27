/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ClickBursts } from "@/components/motion";
import { AlertBar, Logo } from "@/components/site";

export default function NotFound() {
  return (
    <main style={{ position: "relative", minHeight: "100svh" }}>
      <AlertBar>Panne sèche · remonte la clé avant l’aube</AlertBar>
      <div className="thanks">
        <div className="vignette" />
        <div className="wrap">
          <Logo />
          <p className="tag">clic… clic…</p>
          <img src="/img/clic-panne.webp" alt="" style={{ height: 300, animation: "sway 2.6s ease-in-out infinite" }} />
          <h1 className="big-title">404 · Panne sèche</h1>
          <p style={{ fontSize: 20 }}>Cette page s’est arrêtée en route.</p>
          <div className="filters" style={{ justifyContent: "center" }}>
            <Link href="/" className="btn">Retour à l’accueil</Link>
            <Link href="/questionnaire" className="btn btn-alt">Donner mon avis</Link>
          </div>
        </div>
      </div>
      <ClickBursts />
    </main>
  );
}
