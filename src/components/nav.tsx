"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  ["/", "Accueil"],
  ["/jeu", "Le jeu"],
  ["/avis", "Avis des joueurs"],
] as const;

export function Nav({ logo }: { logo: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      {logo}
      <button type="button" className={`burger ${open ? "open" : ""}`} aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
        <i /><i /><i />
      </button>
      <nav className={open ? "open" : ""} onClick={() => setOpen(false)}>
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>{label}</Link>
        ))}
        <Link href="/questionnaire" className="btn btn-primary">Donner mon avis</Link>
      </nav>
      <span className="stripe" aria-hidden="true"><i /><i /><i /><i /></span>
    </header>
  );
}
