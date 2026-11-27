"use client";

import { useEffect, useMemo, useState } from "react";
import { buildSvg, download, loadLogo, slug, svgToPngBlob, zip, type DotStyle } from "./qr-lib";

const PREVIEW_MAX = 60;
const SIZES = [512, 1024, 2048, 4096];

export function QrGenerator({ defaultUrl }: { defaultUrl: string }) {
  const [text, setText] = useState(defaultUrl);
  const [dots, setDots] = useState<DotStyle>("bulle");
  const [fg, setFg] = useState("#14101f");
  const [bg, setBg] = useState("#ffffff");
  const [badge, setBadge] = useState("#fff6e4");
  const [logoOn, setLogoOn] = useState(true);
  const [px, setPx] = useState(1024);
  const [logo, setLogo] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => { void loadLogo().then(setLogo); }, []);

  const lines = useMemo(() => text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean), [text]);
  const opts = useMemo(() => ({ dots, fg, bg, logo: logoOn, badge }), [dots, fg, bg, logoOn, badge]);
  const shown = lines.slice(0, PREVIEW_MAX);
  const svgs = useMemo(() => (logo ? shown.map((l) => buildSvg(l, opts, logo)) : []), [shown, opts, logo]);

  // Contraste : un code trop pâle ou inversé ne se scanne pas.
  const lum = (h: string) => { const v = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const lowContrast = lum(bg) - lum(fg) < 0.35;

  async function one(i: number, kind: "png" | "svg") {
    const svg = buildSvg(lines[i], opts, logo);
    download(kind === "svg" ? new Blob([svg], { type: "image/svg+xml" }) : await svgToPngBlob(svg, px), `${slug(lines[i], i)}.${kind}`);
  }

  async function all(kind: "png" | "svg") {
    setBusy(`0 / ${lines.length}`);
    const files: { name: string; data: Uint8Array }[] = [];
    for (let i = 0; i < lines.length; i++) {
      const svg = buildSvg(lines[i], opts, logo);
      const blob = kind === "svg" ? new Blob([svg]) : await svgToPngBlob(svg, px);
      files.push({ name: `${slug(lines[i], i)}.${kind}`, data: new Uint8Array(await blob.arrayBuffer()) });
      if (i % 5 === 0) { setBusy(`${i + 1} / ${lines.length}`); await new Promise((r) => setTimeout(r)); }
    }
    download(zip(files), `qr-out-${kind}.zip`);
    setBusy("");
  }

  return (
    <div className="cols">
      <div className="card">
        <h3>Contenu</h3>
        <label className="block">
          <span className="label">Un lien ou un texte par ligne : un code par ligne</span>
          <textarea className="field" rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="https://…" spellCheck={false} />
        </label>
        <p className="muted">{lines.length} code{lines.length > 1 ? "s" : ""} · aucune limite, tout est calculé dans ton navigateur.</p>

        <span className="label">Forme des points</span>
        <div className="row">
          {([["bulle", "Bulles"], ["rond", "Ronds"], ["carre", "Carrés"]] as const).map(([v, l]) => (
            <label key={v} className="choice chip"><input type="radio" name="dots" checked={dots === v} onChange={() => setDots(v)} />{l}</label>
          ))}
        </div>

        <span className="label">Couleurs</span>
        <div className="row">
          <label className="inline">Points <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} /></label>
          <label className="inline">Fond <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} /></label>
          <label className="inline">Badge <input type="color" value={badge} onChange={(e) => setBadge(e.target.value)} /></label>
        </div>
        {lowContrast && <p className="notice">Contraste faible : points foncés sur fond clair, sinon le code ne se scanne pas.</p>}

        <label className="inline"><input type="checkbox" checked={logoOn} onChange={(e) => setLogoOn(e.target.checked)} />Badge OUT! au centre</label>

        <span className="label">Taille du PNG</span>
        <div className="row">
          {SIZES.map((s) => (
            <label key={s} className="choice chip"><input type="radio" name="px" checked={px === s} onChange={() => setPx(s)} />{s} px</label>
          ))}
        </div>

        <div className="row">
          <button type="button" className="btn" disabled={!lines.length || !logo || !!busy} onClick={() => (lines.length === 1 ? one(0, "png") : all("png"))}>
            {busy ? `Génération ${busy}` : lines.length > 1 ? `Tout en ZIP (PNG)` : "Télécharger en PNG"}
          </button>
          <button type="button" className="btn" disabled={!lines.length || !logo || !!busy} onClick={() => (lines.length === 1 ? one(0, "svg") : all("svg"))}>
            {lines.length > 1 ? "Tout en ZIP (SVG)" : "SVG"}
          </button>
        </div>
      </div>

      <div className="stack">
        <h3>Aperçu</h3>
        {!lines.length && <p className="notice">Colle un lien à gauche pour générer un code.</p>}
        <div className="qr-grid">
          {svgs.map((svg, i) => (
            <figure key={i} className="qr-item">
              <div className="qr-art" dangerouslySetInnerHTML={{ __html: svg }} />
              <figcaption title={shown[i]}>{shown[i]}</figcaption>
              <div className="row">
                <button type="button" className="chip" onClick={() => one(i, "png")}>PNG</button>
                <button type="button" className="chip" onClick={() => one(i, "svg")}>SVG</button>
              </div>
            </figure>
          ))}
        </div>
        {lines.length > PREVIEW_MAX && <p className="muted">Aperçu des {PREVIEW_MAX} premiers : le ZIP contient les {lines.length} codes.</p>}
      </div>
    </div>
  );
}
