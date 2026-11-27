import Link from "next/link";
import { Reveal } from "./motion";

export type PublicReview = { id: string; rating: number | null; quote: string; pseudo: string; detail: string };

export const stars = (n: number | null) => (n ? "★".repeat(n) + "☆".repeat(5 - n) : "");

export function Reviews({ reviews }: { reviews: PublicReview[] }) {
  if (!reviews.length) {
    return (
      <div className="card empty">
        <h3>Aucun avis publié pour l’instant</h3>
        <p className="muted">Sois la première personne à remonter la clé.</p>
        <Link href="/questionnaire" className="btn">Donner mon avis</Link>
      </div>
    );
  }
  return (
    <div className="grid">
      {reviews.map((r, i) => (
        <Reveal key={r.id} delay={(i % 3) * 120} from="pop">
          <article className="card review">
            <p className="stars" aria-label={`Note : ${r.rating ?? "non donnée"} sur 5`}>{stars(r.rating)}</p>
            <p className="quote">« {r.quote} »</p>
            <p><strong style={{ color: "var(--teal)" }}>{r.pseudo}</strong></p>
            <p className="label" style={{ color: "var(--lilac)" }}>{r.detail}</p>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
