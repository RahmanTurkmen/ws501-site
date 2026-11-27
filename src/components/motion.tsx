"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

export function isCalm() {
  return (
    typeof document !== "undefined" &&
    (document.documentElement.dataset.calm === "1" || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  );
}

/** Fait surgir son contenu quand il entre dans l'écran. */
export function Reveal({ children, delay = 0, from = "up", className = "" }: {
  children: ReactNode; delay?: number; from?: "up" | "left" | "right" | "pop"; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal reveal-${from} ${seen ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** Compte à rebours de mise en scène : de 9 à 1, puis la clé est remontée. */
export function Countdown({ from = 9, label = "L’aube dans", small = false }: { from?: number; label?: string; small?: boolean }) {
  const [n, setN] = useState(from);
  useEffect(() => {
    const t = setInterval(() => setN((v) => (v <= 1 ? from : v - 1)), 1000);
    return () => clearInterval(t);
  }, [from]);
  return (
    <div className={`chrono ${n <= 3 ? "critical" : ""} ${small ? "small" : ""}`} aria-hidden="true">
      <span className="chrono-tape" />
      <span className="chrono-label">{label}</span>
      <span className="chrono-digits" key={n}>00:0{n}</span>
      <span className="spring"><i style={{ width: `${(n / from) * 100}%` }} /><b style={{ left: `${(n / from) * 100}%` }} /></span>
      <span className="chrono-foot">{n <= 3 ? "Ressort presque vide !" : "Ressort en cours…"}</span>
    </div>
  );
}

/** Jauge en haut de page : le ressort se vide à mesure qu'on descend, et la clé tourne. */
export function ScrollSpring() {
  const bar = useRef<HTMLElement>(null);
  const key = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, scrollY / max) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${1 - p})`;
      if (key.current) {
        key.current.style.left = `${(1 - p) * 100}%`;
        key.current.style.rotate = `${scrollY / 2}deg`;
      }
      document.documentElement.style.setProperty("--panic", p.toFixed(3));
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); };
  }, []);
  return (
    <div className="scroll-spring" aria-hidden="true">
      <i ref={bar} />
      <span ref={key}>⚙</span>
    </div>
  );
}

/** Décale doucement ses enfants selon la souris (attribut data-depth). */
export function Parallax({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const move = (e: PointerEvent) => {
      if (isCalm()) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--mx", ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
        el.style.setProperty("--my", ((e.clientY / innerHeight) * 2 - 1).toFixed(3));
      });
    };
    addEventListener("pointermove", move);
    return () => { removeEventListener("pointermove", move); cancelAnimationFrame(frame); };
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}

const SHOUTS = ["KRRRK !", "CLAC !", "VITE !!", "BOING !", "TIC !"];
const COLORS = ["#ffc81f", "#ff3da8", "#19b5b0", "#ff7a1f", "#fff8ec"];

/** Une onomatopée et des éclats jaillissent à chaque clic sur un bouton. */
export function ClickBursts() {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const target = (e.target as HTMLElement).closest(".btn, .chip, .note, .pick");
      if (!target || isCalm()) return;
      const box = document.createElement("div");
      box.className = "burst";
      box.style.left = `${e.clientX}px`;
      box.style.top = `${e.clientY}px`;
      const word = document.createElement("b");
      word.textContent = SHOUTS[Math.floor(Math.random() * SHOUTS.length)];
      box.append(word);
      for (let i = 0; i < 10; i++) {
        const bit = document.createElement("i");
        const a = (i / 10) * Math.PI * 2;
        bit.style.setProperty("--x", `${Math.cos(a) * (50 + Math.random() * 50)}px`);
        bit.style.setProperty("--y", `${Math.sin(a) * (50 + Math.random() * 50)}px`);
        bit.style.background = COLORS[i % COLORS.length];
        box.append(bit);
      }
      document.body.append(box);
      setTimeout(() => box.remove(), 800);
    };
    addEventListener("pointerdown", onDown);
    return () => removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}

/** Compteur qui grimpe quand il devient visible. */
export function CountUp({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || isCalm()) return;
    let frame = 0;
    let done: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      // Filet de sécurité : le chiffre exact s'affiche même si l'onglet est mis en veille.
      done = setTimeout(() => setV(value), 1300);
      io.disconnect();
      const start = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - start) / 1100);
        setV(value * (1 - Math.pow(1 - p, 3)));
        if (p < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(frame); clearTimeout(done); };
  }, [value]);
  return <span ref={ref}>{v.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

function subscribeCalm(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-calm"] });
  return () => mo.disconnect();
}

/** Coupe secousses, clignotements et mouvements (accessibilité). */
export function CalmToggle() {
  const calm = useSyncExternalStore(subscribeCalm, () => document.documentElement.dataset.calm === "1", () => false);
  return (
    <button
      type="button"
      className="calm-toggle"
      aria-pressed={calm}
      onClick={() => {
        if (calm) delete document.documentElement.dataset.calm;
        else document.documentElement.dataset.calm = "1";
        try { localStorage.setItem("out-calm", calm ? "0" : "1"); } catch {}
      }}
    >
      {calm ? "▶ Relancer les animations" : "❚❚ Réduire les animations"}
    </button>
  );
}
