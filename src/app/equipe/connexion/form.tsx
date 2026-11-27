"use client";

import { useActionState, useState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  const [email, setEmail] = useState("");
  const [tries, setTries] = useState(0);
  return (
    <form action={action} className="gate-form" onSubmit={() => setTries((n) => n + 1)}>
      <label>Adresse e-mail<input className="field" type="email" name="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Mot de passe<input className="field" type="password" name="password" autoComplete="current-password" required /></label>
      {state.error && !pending && <p key={tries} className="error-banner" role="alert">⚠ {state.error}</p>}
      <button type="submit" className="btn btn-big" disabled={pending}>{pending ? "Vérification…" : "Entrer, vite !"}</button>
    </form>
  );
}
