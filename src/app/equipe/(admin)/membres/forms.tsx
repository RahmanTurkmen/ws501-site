"use client";

import { useActionState } from "react";
import { inviteMember, manageMember, type FormState } from "../../actions";

function Feedback({ state }: { state: FormState }) {
  if (state.error) return <p className="error-banner" role="alert">⚠ {state.error}</p>;
  if (!state.message) return null;
  return <div className="notice" role="status"><p>{state.message}</p>{state.secret && <code className="secret">{state.secret}</code>}</div>;
}

export function Invite({ roles }: { roles: Record<string, string> }) {
  const [state, action, pending] = useActionState(inviteMember, {});
  return (
    <form action={action} className="card">
      <h3>Inviter un membre</h3>
      <div className="row">
        <input className="field" name="name" placeholder="Prénom" aria-label="Prénom" required style={{ width: 200 }} />
        <input className="field" name="email" type="email" placeholder="prenom.nom@exemple.fr" aria-label="Adresse e-mail" required style={{ width: 300, maxWidth: "100%" }} />
        <select className="select" name="role" defaultValue="MODERATOR" aria-label="Rôle">{Object.entries(roles).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <button className="btn btn-small" disabled={pending}>{pending ? "…" : "Créer le compte"}</button>
      </div>
      <Feedback state={state} />
    </form>
  );
}

export function MemberRow({ id, name, email, role, seen, self, roles }: { id: string; name: string; email: string; role: string; seen: string; self: boolean; roles: Record<string, string> }) {
  const [state, action, pending] = useActionState(manageMember, {});
  return (
    <form action={action} className="card">
      <input type="hidden" name="id" value={id} />
      <div className="row between">
        <div><strong>{name}</strong> {self && <span className="status DOING">Toi</span>}<br /><span className="muted">{email} · dernière visite : {seen}</span></div>
        {self ? <span className="status">{roles[role]}</span> : (
          <div className="row">
            <select className="select" name="role" defaultValue={role} key={role} aria-label={`Rôle de ${name}`}>{Object.entries(roles).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <button className="btn btn-small" name="op" value="role" disabled={pending}>Appliquer</button>
            <button className="btn btn-alt btn-small" name="op" value="reset" disabled={pending}>Réinitialiser</button>
            <button className="btn btn-red btn-small" name="op" value="remove" disabled={pending}
              onClick={(e) => { if (!window.confirm(`Retirer l’accès de ${name} ?`)) e.preventDefault(); }}>Retirer</button>
          </div>
        )}
      </div>
      <Feedback state={state} />
    </form>
  );
}
