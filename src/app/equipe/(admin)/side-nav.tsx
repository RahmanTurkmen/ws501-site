"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SideNav({ counts, isAdmin }: { counts: { responses: number; pending: number; bugs: number }; isAdmin: boolean }) {
  const path = usePathname();
  const items: [string, string, number?, string?][] = [
    ["/equipe", "Vue d’ensemble"],
    ["/equipe/reponses", "Réponses", counts.responses],
    ["/equipe/moderation", "Modération", counts.pending],
    ["/equipe/univers", "Univers & DA"],
    ["/equipe/gameplay", "Gameplay"],
    ["/equipe/bugs", "Bugs signalés", counts.bugs, "red"],
    ["/equipe/exports", "Exports"],
    ...(isAdmin ? ([["/equipe/formulaire", "Formulaire"], ["/equipe/membres", "Équipe & accès"]] as [string, string][]) : []),
    ["/equipe/compte", "Mon compte"],
  ];
  return (
    <nav aria-label="Espace équipe">
      {items.map(([href, label, count, tone]) => {
        const active = href === "/equipe" ? path === href : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}>
            {label}
            {!!count && <span className={`pill ${tone ?? ""}`}>{count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
