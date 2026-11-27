"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Countdown } from "@/components/motion";
import { AlertBar, Logo } from "@/components/site";
import type { QuestionView } from "@/lib/questions";
import { LIMITS, validate, type Answer } from "@/lib/validate";

const STEPS: Record<number, { name: string; title: string; intro: string; tone: string; tag: string; tip: string; art: string; alert: string }> = {
  1: { name: "Profil", title: "Qui es-tu ?", intro: "Quelques infos pour comprendre qui joue. Rien ne permet de t’identifier.", tone: "var(--calm)", tag: "prêt ?", tip: "Réponds franchement : une critique nous aide plus qu’un compliment.", art: "clic-course", alert: "La clé tourne · tu as 3 minutes · ne t’arrête pas" },
  2: { name: "Univers", title: "L’univers", intro: "La maison, les jouets, l’ambiance : qu’est-ce qui t’a marqué ?", tone: "var(--accel)", tag: "clac clac !", tip: "Pense aux couleurs, aux lumières et aux personnages.", art: "clic-regard", alert: "Une porte s’ouvre · accélère" },
  3: { name: "Gameplay", title: "Le gameplay", intro: "Commandes, difficulté, manivelle : raconte comment la course s’est passée.", tone: "var(--danger)", tag: "vite !!", tip: "La panique, c’est le cœur du jeu. Dis-nous quand tu l’as sentie.", art: "clic-saut", alert: "Danger · les lumières s’éteignent · clac clac" },
  4: { name: "Ton avis", title: "Ton avis", intro: "Dernière ligne droite avant l’aube.", tone: "var(--panic-red)", tag: "presque !", tip: "Une seule idée précise vaut mieux que dix lignes vagues.", art: "clic-saut", alert: "Panique max · dernière étape · le jour se lève !!" },
};

type Values = Record<string, Answer>;
const DRAFT = "out-brouillon";

export function Quiz({ questions }: { questions: QuestionView[] }) {
  const router = useRouter();
  const steps = useMemo(() => [...new Set(questions.map((q) => q.step))].sort(), [questions]);
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState("");
  const [shake, setShake] = useState(0);
  const restored = useRef(false);

  const step = steps[index];
  const info = STEPS[step] ?? STEPS[4];
  const current = questions.filter((q) => q.step === step);
  const last = index === steps.length - 1;

  // Le brouillon reste dans cet onglet : un rafraîchissement ne fait rien perdre.
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(DRAFT) ?? "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setValues(saved);
    } catch {}
    restored.current = true;
  }, []);
  useEffect(() => {
    if (restored.current) try { sessionStorage.setItem(DRAFT, JSON.stringify(values)); } catch {}
  }, [values]);

  function set(key: string, value: Answer) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => { const rest = { ...e }; delete rest[key]; return rest; });
  }

  function go(next: number) {
    setIndex(next);
    setFailure("");
    scrollTo({ top: 0 });
  }

  function fail(found: Record<string, string>) {
    setErrors(found);
    setShake((n) => n + 1);
    const first = Object.keys(found)[0];
    requestAnimationFrame(() => document.getElementById(`q-${first}`)?.scrollIntoView({ block: "center" }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate(current, values).errors;
    if (last && !consent) found.consent = "Coche la case pour envoyer ton avis.";
    if (Object.keys(found).length) return fail(found);
    if (!last) return go(index + 1);

    setSending(true);
    setFailure("");
    try {
      const res = await fetch("/api/reponses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: values, consent, website }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          const bad = questions.find((q) => data.errors[q.key]);
          if (bad) setIndex(steps.indexOf(bad.step));
          fail(data.errors);
        } else setFailure(data.error ?? "L’envoi a échoué.");
        return;
      }
      try {
        sessionStorage.setItem("out-recap", JSON.stringify(values));
        sessionStorage.removeItem(DRAFT);
      } catch {}
      router.push("/questionnaire/merci");
    } catch {
      setFailure("Connexion perdue. Tes réponses sont gardées : réessaie.");
    } finally {
      setSending(false);
    }
  }

  const missing = Object.keys(errors).length;

  return (
    <div className="quiz" style={{ "--tone": info.tone } as React.CSSProperties}>
      <div className="quiz-top">
        <Logo />
        <span className="label" style={{ color: "var(--lilac)" }}>≈ 3 min</span>
        <Link href="/" className="btn btn-ghost btn-small">Quitter</Link>
      </div>
      <AlertBar key={step}>{info.alert}</AlertBar>
      <main className="quiz-body">
        {index >= 2 && <div className="vignette" />}
        <form className="wrap" onSubmit={submit} noValidate style={{ position: "relative" }}>
          <div className="progress">
            {steps.map((s, i) => (
              <span key={s} className={i < index ? "done" : i === index ? "now" : ""} aria-current={i === index ? "step" : undefined}>
                {i < index ? "✓ " : ""}0{i + 1} · {STEPS[s]?.name}
              </span>
            ))}
          </div>
          <div style={{ marginBottom: 28 }} key={`head-${step}`}>
            <h1 className="big-title">{info.title}</h1>
            <p style={{ marginTop: 12, fontSize: 19 }}>{info.intro}</p>
          </div>
          <div className="quiz-grid">
            <div key={`${step}-${shake}`} className={`quiz-card ${missing ? "shake" : ""}`}>
              {missing > 0 && (
                <p className="error-banner" role="alert">⚠ {missing === 1 ? "Il manque une réponse" : `Il manque ${missing} réponses`} pour continuer. Vite !</p>
              )}
              {current.map((q) => (
                <Question key={q.key} q={q} value={values[q.key]} error={errors[q.key]} onChange={(v) => set(q.key, v)} />
              ))}
              {last && (
                <div id="q-consent">
                  <label className="consent">
                    <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setErrors((x) => { const rest = { ...x }; delete rest.consent; return rest; }); }} />
                    <span>J’accepte que mes réponses anonymes servent à améliorer le jeu. <Link href="/confidentialite" target="_blank" style={{ color: "var(--teal)" }}>Politique de confidentialité →</Link></span>
                  </label>
                  {errors.consent && <p className="error">{errors.consent}</p>}
                </div>
              )}
              <label className="honey" aria-hidden="true">Ne pas remplir<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
              {failure && <p className="error-banner" role="alert">⚠ {failure}</p>}
              <div className="quiz-actions">
                {index > 0 ? <button type="button" className="btn btn-alt" onClick={() => go(index - 1)}>← Retour</button> : <span />}
                <button type="submit" className={`btn ${last ? "btn-big" : ""}`} disabled={sending}>
                  {sending ? "Envoi…" : last ? "Envoyer mon avis" : "Continuer →"}
                </button>
              </div>
            </div>
            <aside className="quiz-side">
              <Countdown key={step} from={Math.max(3, 9 - index * 2)} small />
              <div className="panel" key={`panel-${step}`}>
                <p className="tag">{info.tag}</p>
                <img src={`/img/${info.art}.webp`} alt="" />
                <p>{info.tip}</p>
              </div>
            </aside>
          </div>
        </form>
      </main>
    </div>
  );
}

function Question({ q, value, error, onChange }: { q: QuestionView; value: Answer | undefined; error?: string; onChange: (v: Answer) => void }) {
  const help = q.help ?? (q.required ? null : "Facultatif");
  const isText = q.type === "TEXT_SHORT" || q.type === "TEXT_LONG";

  if (isText) {
    const text = typeof value === "string" ? value : "";
    const max = LIMITS[q.type as "TEXT_SHORT" | "TEXT_LONG"];
    const props = { id: `f-${q.key}`, className: "field", value: text, maxLength: max, placeholder: "Ta réponse…", onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value) };
    return (
      <fieldset id={`q-${q.key}`}>
        <legend><label htmlFor={`f-${q.key}`}>{q.label}</label></legend>
        {q.type === "TEXT_LONG" ? <textarea {...props} /> : <input {...props} />}
        <p className="help">{help} · {text.length}/{max}</p>
        {error && <p className="error">{error}</p>}
      </fieldset>
    );
  }

  return (
    <fieldset id={`q-${q.key}`} aria-invalid={!!error}>
      <legend>{q.label}{q.required ? "" : " "}</legend>
      {help && <p className="help">{help}</p>}
      <Control q={q} value={value} onChange={onChange} />
      {error && <p className="error">{error}</p>}
    </fieldset>
  );
}

function Control({ q, value, onChange }: { q: QuestionView; value: Answer | undefined; onChange: (v: Answer) => void }) {
  if (q.type === "RATING" || q.type === "SCORE10") {
    const numbers = q.type === "RATING" ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return (
      <div className="notes">
        {numbers.map((n) => {
          const lit = typeof value === "number" && (q.type === "RATING" ? n <= value : n === value);
          const color = q.type === "RATING" ? `n${n}` : "n3";
          return (
            <label key={n} className={`choice note ${lit ? `on ${color}` : ""}`}>
              <input type="radio" name={q.key} checked={value === n} onChange={() => onChange(n)} />
              {n}
            </label>
          );
        })}
      </div>
    );
  }

  if (q.type === "SLIDER") {
    const labels = q.options.map((o) => o.label);
    const at = typeof value === "string" ? labels.indexOf(value) : -1;
    const middle = Math.floor((labels.length - 1) / 2);
    const pick = (i: number) => onChange(labels[i]);
    return (
      <div className={`slider ${at < 0 ? "unset" : ""}`}>
        <input type="range" aria-label={q.label} min={0} max={labels.length - 1} step={1} value={at < 0 ? middle : at}
          aria-valuetext={at < 0 ? "Pas encore choisi" : labels[at]}
          onChange={(e) => pick(Number(e.target.value))} onPointerUp={(e) => pick(Number(e.currentTarget.value))} />
        <output key={at}>{at < 0 ? "Fais glisser ou touche le curseur" : labels[at]}</output>
      </div>
    );
  }

  const multi = q.type === "MULTI";
  const picked = Array.isArray(value) ? value : [];
  const toggle = (label: string) => {
    if (!multi) return onChange(label);
    // « Aucun bug » exclut les autres choix, et inversement.
    if (picked.includes(label)) return onChange(picked.filter((l) => l !== label));
    if (label === "Aucun bug") return onChange([label]);
    onChange([...picked.filter((l) => l !== "Aucun bug"), label]);
  };
  const checked = (label: string) => (multi ? picked.includes(label) : value === label);
  const input = (label: string) => (
    <input type={multi ? "checkbox" : "radio"} name={q.key} checked={checked(label)} onChange={() => toggle(label)} />
  );

  if (q.type === "IMAGES") {
    const wide = q.key === "level";
    return (
      <div className="picks" style={{ "--ratio": wide ? "16/10" : "3/4" } as React.CSSProperties}>
        {q.options.map((o) => (
          <label key={o.label} className="choice pick">
            {input(o.label)}
            {o.image && <img src={o.image} alt="" />}
            <span>{checked(o.label) ? "✓ " : ""}{o.label}</span>
          </label>
        ))}
      </div>
    );
  }

  if (q.type === "PANIC") {
    return (
      <div className="picks">
        {q.options.map((o) => (
          <label key={o.label} className={`choice pick panic-pick c-${o.tone ?? "danger"}`}>
            {input(o.label)}
            <em>{o.shout}</em>
            <strong>{checked(o.label) ? "✓ " : ""}{o.label}</strong>
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="chips">
      {q.options.map((o) => (
        <label key={o.label} className="choice chip">{input(o.label)}{o.label}</label>
      ))}
    </div>
  );
}
