import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Confidentialité" };

const BLOCKS = [
  ["Ce que nous collectons", "Tes réponses au questionnaire, ta tranche d’âge et, si tu le souhaites, un pseudo. Aucun e-mail ni nom réel n’est demandé."],
  ["Pourquoi", "Uniquement pour améliorer le jeu OUT! dans le cadre de la SAÉ du BUT MMI."],
  ["Ce qui est publié", "Après relecture par l’équipe : ta note, un commentaire, ton pseudo, ta tranche d’âge et le support de test. Les statistiques sont globales."],
  ["Qui y a accès", "Les membres de l’équipe du jeu et les enseignants référents, avec un compte protégé par mot de passe."],
  ["Combien de temps", "[Durée de conservation à définir par l’équipe]."],
  ["Tes droits", "Tu peux demander la suppression de ta réponse en écrivant à [adresse de contact à définir]."],
  ["Mineurs", "Si tu as moins de 15 ans, demande l’accord d’un parent avant de répondre."],
  ["Cookies", "Le site public ne pose aucun cookie de suivi. Un cookie de connexion est utilisé uniquement dans l’espace équipe."],
];

export default function PrivacyPage() {
  return (
    <section className="section">
      <div className="wrap prose">
        <h1 className="big-title">Confidentialité</h1>
        <p className="label" style={{ color: "var(--pink)" }}>Version de travail à valider avant la mise en ligne</p>
        {BLOCKS.map(([title, text]) => (
          <div key={title}><h2>{title}</h2><p>{text}</p></div>
        ))}
        <div><Link href="/" className="btn btn-alt">Retour à l’accueil</Link></div>
      </div>
    </section>
  );
}
