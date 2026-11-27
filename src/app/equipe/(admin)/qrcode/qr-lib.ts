import QRCode from "qrcode";

export type DotStyle = "carre" | "rond" | "bulle";
export type QrOptions = { dots: DotStyle; fg: string; bg: string; logo: boolean; badge: string };

const INK = "#14101f";
const PINK = "#ff3da8";
const MARGIN = 3;
// Demi-axes du badge central, en part de la largeur du code (niveau de correction H : jusqu'à 30 % récupérable).
const RX = 0.19;
const RY = 0.145;

let logoUri: Promise<string> | null = null;
/** Le logo est intégré en data-URI pour que l'export PNG ne dépende d'aucune requête. */
export function loadLogo() {
  logoUri ??= fetch("/img/logo.svg")
    .then((r) => r.text())
    .then((t) => "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(t))));
  return logoUri;
}

const n = (v: number) => +v.toFixed(3);

function starPoints(cx: number, cy: number, rx: number, ry: number, spikes = 22, depth = 0.86, rot = -5) {
  const pts: string[] = [];
  const a0 = (rot * Math.PI) / 180;
  for (let i = 0; i < spikes * 2; i++) {
    const k = i % 2 === 0 ? 1 : depth;
    const a = (Math.PI * i) / spikes;
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
    pts.push(`${n(cx + x * Math.cos(a0) - y * Math.sin(a0))},${n(cy + x * Math.sin(a0) + y * Math.cos(a0))}`);
  }
  return pts.join(" ");
}

/** Construit le SVG complet (viewBox en « modules »). */
export function buildSvg(text: string, o: QrOptions, logo: string): string {
  const qr = QRCode.create(text || " ", { errorCorrectionLevel: "H" });
  const size = qr.modules.size;
  const data = qr.modules.data;
  const total = size + MARGIN * 2;
  const c = total / 2;
  const rx = size * RX, ry = size * RY;
  const hidden = (x: number, y: number) =>
    o.logo && ((x + 0.5 - c) / rx) ** 2 + ((y + 0.5 - c) / ry) ** 2 <= 1.25;
  const inFinder = (r: number, col: number) =>
    (r < 7 && col < 7) || (r < 7 && col >= size - 7) || (r >= size - 7 && col < 7);

  let body = "";
  for (let r = 0; r < size; r++) {
    for (let col = 0; col < size; col++) {
      if (!data[r * size + col] || inFinder(r, col)) continue;
      const x = col + MARGIN, y = r + MARGIN;
      if (hidden(x, y)) continue;
      if (o.dots === "carre") body += `<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`;
      else if (o.dots === "rond") body += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.46"/>`;
      else body += `<rect x="${x + 0.06}" y="${y + 0.06}" width="0.88" height="0.88" rx="0.32"/>`;
    }
  }

  // Repères : anneau 7×7 + cœur 3×3.
  const rr = 0; // repères volontairement carrés : arrondis, ils ne sont plus reconnus par certains lecteurs
  let finders = "";
  for (const [fr, fc] of [[0, 0], [0, size - 7], [size - 7, 0]]) {
    const x = fc + MARGIN, y = fr + MARGIN;
    finders += `<path fill-rule="evenodd" d="M${x + rr},${y}h${7 - 2 * rr}a${rr},${rr} 0 0 1 ${rr},${rr}v${7 - 2 * rr}a${rr},${rr} 0 0 1 -${rr},${rr}h-${7 - 2 * rr}a${rr},${rr} 0 0 1 -${rr},-${rr}v-${7 - 2 * rr}a${rr},${rr} 0 0 1 ${rr},-${rr}z M${x + 1},${y + 1}h5v5h-5z"/>`;
    finders += `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" />`;
  }

  let center = "";
  if (o.logo) {
    const lw = rx * 2 * 0.84, lh = (lw * 274) / 520;
    center =
      `<polygon points="${starPoints(c + 0.45, c + 0.55, rx, ry)}" fill="${PINK}" stroke="${INK}" stroke-width="0.35" stroke-linejoin="round"/>` +
      `<polygon points="${starPoints(c, c, rx, ry)}" fill="${o.badge}" stroke="${INK}" stroke-width="0.35" stroke-linejoin="round"/>` +
      `<image href="${logo}" x="${n(c - lw / 2)}" y="${n(c - lh / 2)}" width="${n(lw)}" height="${n(lh)}"/>`;
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="geometricPrecision">` +
    `<rect width="${total}" height="${total}" fill="${o.bg}"/>` +
    `<g fill="${o.fg}">${body}${finders}</g>${center}</svg>`
  );
}

export function svgToPngBlob(svg: string, px: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = px;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, px, px);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("png"))), "image/png");
    };
    img.onerror = () => reject(new Error("svg"));
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

export function slug(text: string, i: number) {
  const s = text.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 40).toLowerCase();
  return `${String(i + 1).padStart(3, "0")}-${s || "qr"}`;
}

export function download(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ZIP minimal (sans compression) : évite une dépendance pour « tout télécharger ».
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) { let c = i; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[i] = c >>> 0; }
  return t;
})();
const crc32 = (b: Uint8Array) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };

export function zip(files: { name: string; data: Uint8Array }[]): Blob {
  const enc = new TextEncoder();
  const parts: BlobPart[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name), crc = crc32(f.data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true);
    h.setUint32(14, crc, true); h.setUint32(18, f.data.length, true); h.setUint32(22, f.data.length, true); h.setUint16(26, name.length, true);
    parts.push(h.buffer, name as BlobPart, f.data as BlobPart);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
    c.setUint32(16, crc, true); c.setUint32(20, f.data.length, true); c.setUint32(24, f.data.length, true); c.setUint16(28, name.length, true); c.setUint32(42, offset, true);
    central.push(new Uint8Array(c.buffer), name);
    offset += 30 + name.length + f.data.length;
  }
  const csize = central.reduce((s, a) => s + a.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, csize, true); end.setUint32(16, offset, true);
  return new Blob([...parts, ...(central as BlobPart[]), end.buffer], { type: "application/zip" });
}
