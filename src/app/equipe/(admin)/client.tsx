"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

/** Bouton d'envoi qui demande confirmation avant une action irréversible. */
export function Confirm({ message, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { message: string }) {
  return (
    <button type="submit" {...props} onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}

export function Save({ children, className = "btn btn-small" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={className} disabled={pending}>{pending ? "…" : children}</button>;
}

/** Liste déroulante qui enregistre dès qu'on change de valeur. */
export function AutoSelect({ name, value, options, label }: { name: string; value: string; options: Record<string, string>; label: string }) {
  return (
    <select className="select" name={name} defaultValue={value} aria-label={label} onChange={(e) => e.target.form?.requestSubmit()}>
      {Object.entries(options).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
    </select>
  );
}

export function CopyLink() {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="btn btn-small" onClick={async () => {
      await navigator.clipboard.writeText(`${location.origin}/questionnaire`);
      setDone(true);
    }}>
      {done ? "✓ Lien copié" : "Copier le lien du questionnaire"}
    </button>
  );
}
