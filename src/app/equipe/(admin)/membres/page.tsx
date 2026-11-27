import { requireUser, ROLE_NAMES } from "@/lib/auth";
import { db } from "@/lib/db";
import { Head, shortDate } from "../ui";
import { Invite, MemberRow } from "./forms";

const RIGHTS = [
  ["Administrateur", "var(--yellow)", ["Tout voir et exporter", "Modifier le formulaire", "Gérer les membres", "Supprimer des réponses"]],
  ["Modérateur", "var(--teal)", ["Voir les réponses", "Publier ou masquer les avis", "Suivre les bugs", "Exporter"]],
  ["Lecture seule", "#7b2ff7", ["Voir le tableau de bord", "Voir les analyses", "Aucune modification"]],
] as const;

export default async function MembersPage() {
  const me = await requireUser("admin");
  const users = await db.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true, lastSeenAt: true } });
  return (
    <>
      <Head title="Équipe & accès" sub={`${users.length} membre(s)`} />
      <Invite roles={ROLE_NAMES} />
      <div className="stack">
        {users.map((u) => (
          <MemberRow key={u.id} id={u.id} name={u.name} email={u.email} role={u.role} self={u.id === me.id} roles={ROLE_NAMES}
            seen={u.lastSeenAt ? shortDate(u.lastSeenAt) : "jamais"} />
        ))}
      </div>
      <div className="cols" style={{ "--cols": 3 } as React.CSSProperties}>
        {RIGHTS.map(([title, color, list]) => (
          <div className="card" key={title} style={{ boxShadow: `8px 10px 0 ${color}` }}>
            <h3>{title}</h3>
            {list.map((l) => <p key={l}>✓ {l}</p>)}
          </div>
        ))}
      </div>
    </>
  );
}
