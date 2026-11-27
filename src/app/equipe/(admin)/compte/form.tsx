"use client";

import { useActionState } from "react";
import { changePassword } from "../../actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, {});
  return (
    <form action={action} className="card" style={{ maxWidth: 480 }}>
      <h3>Changer de mot de passe</h3>
      <label className="block">Mot de passe actuel<input className="field" type="password" name="current" autoComplete="current-password" required /></label>
      <label className="block">Nouveau mot de passe (10 caractères minimum)<input className="field" type="password" name="next" autoComplete="new-password" minLength={10} required /></label>
      {state.error && <p className="error-banner" role="alert">⚠ {state.error}</p>}
      {state.message && <p className="notice" role="status">✓ {state.message}</p>}
      <div><button className="btn btn-small" disabled={pending}>Enregistrer</button></div>
    </form>
  );
}
