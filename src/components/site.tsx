import Link from "next/link";
import type { ReactNode } from "react";
import { CalmToggle } from "./motion";

export function Logo({ className = "", href = "/" }: { className?: string; href?: string | null }) {
  // eslint-disable-next-line @next/next/no-img-element
  const img = <img src="/img/logo.svg" alt="OUT!" width={520} height={274} />;
  return href ? (
    <Link href={href} className={`logo ${className}`}>{img}</Link>
  ) : (
    <span className={`logo ${className}`}>{img}</span>
  );
}

export function AlertBar({ children }: { children: ReactNode }) {
  return (
    <div className="alert-bar" role="presentation">
      <span className="hazard" />
      <p>⚠ {children} ⚠</p>
      <span className="hazard" />
    </div>
  );
}

export function Ticker({ words, tone = "yellow", reverse = false }: { words: string[]; tone?: "yellow" | "teal" | "red" | "pink"; reverse?: boolean }) {
  const line = words.join("  ★  ") + "  ★  ";
  return (
    <div className={`ticker ticker-${tone} ${reverse ? "reverse" : ""}`} aria-hidden="true">
      <div><span>{line.repeat(3)}</span><span>{line.repeat(3)}</span></div>
    </div>
  );
}

export function Title({ num, children }: { num?: string; children: ReactNode }) {
  return (
    <h2 className="section-title">
      {num && <span>{num}</span>}
      <em>{children}</em>
    </h2>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="stripe" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="wrap footer-grid">
        <div>
          <Logo />
          <p>Un jouet à clé, une maison géante, une course avant l’aube. Ton avis aide à finir le jeu.</p>
        </div>
        <nav aria-label="Le site">
          <h3>Le site</h3>
          <Link href="/">Accueil</Link>
          <Link href="/jeu">Le jeu</Link>
          <Link href="/questionnaire">Donner mon avis</Link>
          <Link href="/avis">Avis des joueurs</Link>
        </nav>
        <nav aria-label="Informations">
          <h3>Infos</h3>
          <Link href="/confidentialite">Confidentialité</Link>
          <Link href="/equipe/connexion">Espace équipe</Link>
          <CalmToggle />
        </nav>
      </div>
      <p className="wrap footer-legal">OUT! · SAÉ WS501D · BUT MMI TROYES · 2026</p>
    </footer>
  );
}
