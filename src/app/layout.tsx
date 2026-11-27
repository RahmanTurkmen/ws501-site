import type { Metadata, Viewport } from "next";
import { Archivo, Bungee, Permanent_Marker, Space_Mono } from "next/font/google";
import "./globals.css";

const bungee = Bungee({ weight: "400", subsets: ["latin"], variable: "--f-title" });
const archivo = Archivo({ subsets: ["latin"], variable: "--f-text" });
const mono = Space_Mono({ weight: "700", subsets: ["latin"], variable: "--f-mono" });
const marker = Permanent_Marker({ weight: "400", subsets: ["latin"], variable: "--f-tag" });

export const metadata: Metadata = {
  title: { default: "OUT! — Donne ton avis", template: "%s · OUT!" },
  description: "OUT!, la course d’un jouet à clé avant l’aube. Teste le jeu et dis-nous ce qui t’a fait paniquer.",
  icons: { icon: "/img/logo.svg" },
};

export const viewport: Viewport = { themeColor: "#14101f" };

/** Appliqué avant l'affichage pour que le mode calme ne clignote pas au chargement. */
const calmScript = `try{if(localStorage.getItem("out-calm")==="1")document.documentElement.dataset.calm="1"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${bungee.variable} ${archivo.variable} ${mono.variable} ${marker.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: calmScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
