"use client";

import { startTransition, useActionState, useState } from "react";
import type { QuestionView } from "@/lib/questions";
import type { QuestionType } from "@/generated/prisma/enums";
import { saveQuestion } from "../../../actions";
import { TYPES } from "../types";

export function Editor({ question, step, core }: { question: QuestionView | null; step: number; core: boolean }) {
  const [state, action, pending] = useActionState(saveQuestion, {});
  const [label, setLabel] = useState(question?.label ?? "");
  const [help, setHelp] = useState(question?.help ?? "");
  const [type, setType] = useState<QuestionType>(question?.type ?? "SINGLE");
  const [options, setOptions] = useState(question?.options.map((o) => o.label).join("\n") ?? "Oui\nNon");
  const [stepValue, setStep] = useState(step);
  const [required, setRequired] = useState(question?.required ?? false);
  const [active, setActive] = useState(question?.active ?? true);
  const hasOptions = ["SINGLE", "MULTI", "SLIDER", "IMAGES", "PANIC"].includes(type);
  const lines = options.split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <div className="cols">
      <form className="card" onSubmit={(e) => { e.preventDefault(); const data = new FormData(e.currentTarget); startTransition(() => action(data)); }}>
        <input type="hidden" name="id" value={question?.id ?? ""} />
        <label className="block">Intitulé<input className="field" name="label" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={140} required /></label>
        <label className="block">Texte d’aide<input className="field" name="help" value={help} onChange={(e) => setHelp(e.target.value)} maxLength={200} /></label>
        <label className="block">Type de réponse
          <select className="field" name="type" value={type} disabled={core} onChange={(e) => setType(e.target.value as QuestionType)}>
            {Object.entries(TYPES).filter(([k]) => core || !["IMAGES", "PANIC"].includes(k)).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="block">Étape
          <select className="field" name="step" value={stepValue} onChange={(e) => setStep(Number(e.target.value))}>
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>Étape {n}</option>)}
          </select>
        </label>
        {hasOptions && (
          <label className="block">Réponses proposées (une par ligne)
            <textarea className="field" name="options" rows={6} value={options} onChange={(e) => setOptions(e.target.value)} />
          </label>
        )}
        <label className="inline"><input type="checkbox" name="required" checked={required} onChange={(e) => setRequired(e.target.checked)} />Réponse obligatoire</label>
        <label className="inline"><input type="checkbox" name="active" checked={active} onChange={(e) => setActive(e.target.checked)} />Question affichée</label>
        {state.error && !pending && <p className="error-banner" role="alert">⚠ {state.error}</p>}
        <div><button type="submit" className="btn" disabled={pending}>{pending ? "…" : "Enregistrer la question"}</button></div>
      </form>
      <div className="card">
        <h3>Aperçu joueur</h3>
        <div className="quiz-card" style={{ "--tone": "var(--teal)", gap: 14, padding: 22 } as React.CSSProperties}>
          <p className="label">Étape {stepValue} / 4</p>
          <h3>{label || "Ta question ?"}</h3>
          {help && <p className="help">{help}</p>}
          {hasOptions && <div className="chips">{lines.map((l, i) => <span className="chip" key={i}>{l}</span>)}</div>}
          {(type === "RATING" || type === "SCORE10") && <div className="notes">{Array.from({ length: type === "RATING" ? 5 : 11 }, (_, i) => <span className="note" key={i}>{type === "RATING" ? i + 1 : i}</span>)}</div>}
          {(type === "TEXT_SHORT" || type === "TEXT_LONG") && <span className="field muted">Ta réponse…</span>}
        </div>
        <p className="muted">L’aperçu se met à jour pendant la saisie.</p>
      </div>
    </div>
  );
}
