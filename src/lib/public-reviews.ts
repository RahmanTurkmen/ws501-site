import { db } from "./db";
import type { PublicReview } from "@/components/reviews";
import type { Prisma } from "@/generated/prisma/client";

/** Seuls la note, un commentaire et le pseudo d'un avis publié sortent de la base. */
export async function publicReviews(take: number, where: Prisma.ResponseWhereInput = {}): Promise<PublicReview[]> {
  const rows = await db.response.findMany({
    where: { published: true, hidden: false, ...where },
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, rating: true, liked: true, improve: true, pseudo: true, age: true, support: true },
  });
  return rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    quote: r.liked || r.improve || "",
    pseudo: r.pseudo || "Anonyme",
    detail: [r.age, r.support].filter(Boolean).join(" · "),
  }));
}
