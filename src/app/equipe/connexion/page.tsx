/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { redirect } from "next/navigation";
import { Countdown, Parallax } from "@/components/motion";
import { AlertBar, Logo, Ticker } from "@/components/site";
import { currentUser } from "@/lib/auth";
import { LoginForm } from "./form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await currentUser()) redirect("/equipe");
  return (
    <main className="gate">
      <AlertBar>Zone réservée · l’aube approche · identifie-toi vite</AlertBar>
      <Parallax className="gate-stage">
        <div className="vignette" />
        <div className="halftone" style={{ left: 0, top: 40, color: "#7b2ff7" }} />
        <div className="halftone" style={{ right: 0, bottom: 100, color: "var(--pink)", scale: "-1 1" }} />
        <div className="gate-chrono"><Countdown small /></div>
        <img className="gate-clic left" src="/img/clic-regard.webp" alt="" />
        <img className="gate-clic right" src="/img/clic-course.webp" alt="" />
        <span className="ono ono-3" aria-hidden="true">VITE !!</span>
        <span className="ono gate-clac" aria-hidden="true">CLAC CLAC</span>
        <span className="ono gate-krk" aria-hidden="true">KRRRK !</span>
        <div className="gate-card">
          <Logo className="gate-logo" />
          <h1 className="glitch">Accès équipe vite !</h1>
          <p className="muted">Alerte : de nouveaux avis tombent. Connecte-toi avant que le carton se referme.</p>
          <LoginForm />
          <Link href="/equipe/mot-de-passe" style={{ color: "var(--yellow)", fontWeight: 700 }}>Mot de passe oublié ?</Link>
          <Link href="/" style={{ color: "var(--teal)", fontWeight: 700 }}>← Retour au site</Link>
        </div>
      </Parallax>
      <Ticker words={["ACCÈS RÉSERVÉ", "DANGER", "L’ÉQUIPE SEULEMENT"]} />
    </main>
  );
}
