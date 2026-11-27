import Link from "next/link";
import { AlertBar, Logo } from "@/components/site";

export default function LostPasswordPage() {
  return (
    <main className="gate">
      <AlertBar>Pas de panique… enfin si</AlertBar>
      <div className="gate-stage">
        <div className="vignette" />
        <div className="gate-card">
          <Logo className="gate-logo" />
          <h1 className="glitch">Mot de passe perdu ?!</h1>
          <p>Demande à un administrateur de l’équipe : dans « Équipe &amp; accès », le bouton « Réinitialiser » te donne un mot de passe provisoire.</p>
          <p className="muted">Aucun e-mail n’est envoyé automatiquement.</p>
          <Link href="/equipe/connexion" className="btn">← Retour à la connexion</Link>
        </div>
      </div>
    </main>
  );
}
