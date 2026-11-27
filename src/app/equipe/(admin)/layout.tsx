import { Logo } from "@/components/site";
import { requireUser, ROLE_NAMES } from "@/lib/auth";
import { db } from "@/lib/db";
import { logout } from "../actions";
import { SideNav } from "./side-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [responses, pending, bugs] = await Promise.all([
    db.response.count(),
    db.response.count({ where: { published: false, hidden: false, OR: [{ liked: { not: null } }, { improve: { not: null } }] } }),
    db.bug.count({ where: { status: { not: "DONE" } } }),
  ]);
  return (
    <div className="admin">
      <aside className="side">
        <Logo href="/equipe" />
        <p className="label pink">Espace équipe</p>
        <SideNav counts={{ responses, pending, bugs }} isAdmin={user.role === "ADMIN"} />
        <div className="me">
          <strong>{user.name}</strong>
          <span className="muted">{ROLE_NAMES[user.role]}</span>
        </div>
        <form action={logout}><button type="submit">Se déconnecter</button></form>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
