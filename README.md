# OUT! - site de recueil des avis

Site public, questionnaire et espace équipe du jeu OUT!.

- **Front et back** : Next.js 16 (React 19). Le back tourne en Node, dans le même projet.
- **Base de données** : PostgreSQL avec [Prisma](https://www.prisma.io/).
- **Hébergement prévu** : Vercel.

## Lancer le site sur son ordinateur

Il faut Node 22 ou plus récent.

La première fois :

```bash
npm install
```

Copier `.env.example` en `.env` s'il n'existe pas, puis le remplir (voir « Base locale » plus bas).

À chaque session, démarrer la base :

```bash
npm run db:start
```

Créer les tables, les questions et le compte administrateur (la première fois, ou après une mise à jour de la base) :

```bash
npm run db:setup
```

Lancer le site :

```bash
npm run dev
```

- Site : <http://localhost:3000>
- Espace équipe : <http://localhost:3000/equipe/connexion> (identifiants : `ADMIN_EMAIL` et `ADMIN_PASSWORD` du fichier `.env`)

Arrêter la base : `npm run db:stop`.

### Base locale

`npm run db:start` lance une base Postgres locale, sans compte à créer. La commande `npx prisma dev ls` affiche ses adresses : reporter dans `DATABASE_URL` l'adresse « TCP », qui commence par `postgres://`. `SHADOW_DATABASE_URL` peut rester vide : elle ne sert qu'à créer de nouvelles migrations.

### Données de démonstration

Pour voir l'espace équipe rempli avec 24 réponses **fictives** (base locale uniquement) :

```bash
npm run db:demo
```

Pour les retirer :

```bash
npm run db:demo -- --clear
```

## Mettre en ligne sur Vercel

La base locale reste sur ton ordinateur : en ligne, il en faut une autre. Elle démarre vide, sans les réponses de démonstration.

### 1. Créer la base en ligne

Sur [console.prisma.io](https://console.prisma.io), créer un projet « Prisma Postgres » (région Europe), puis copier l'adresse de connexion directe, celle qui commence par `postgres://`. Une adresse `prisma+postgres://` ne fonctionne pas avec ce projet.

### 2. Relier le projet à Vercel

Dans le dossier du projet :

```bash
npx vercel login
```

```bash
npx vercel link
```

### 3. Ajouter les variables

Dans Vercel : projet → **Settings** → **Environment Variables**, pour l'environnement **Production** :

| Nom | Valeur |
| --- | --- |
| `DATABASE_URL` | l'adresse `postgres://` de la base en ligne |
| `ADMIN_EMAIL` | l'adresse du premier administrateur |
| `ADMIN_PASSWORD` | un nouveau mot de passe, 10 caractères minimum |

Ne pas recopier le mot de passe local, et ne jamais publier le fichier `.env`.

### 4. Publier

```bash
npx vercel --prod
```

Vercel exécute le script `vercel-build` : il crée les tables, ajoute les questions et le compte administrateur, puis construit le site. Relancer la même commande après chaque modification.

### 5. Après la première mise en ligne

1. Se connecter sur `/equipe/connexion`.
2. Changer le mot de passe dans **Mon compte**.
3. Supprimer la variable `ADMIN_PASSWORD` sur Vercel : elle ne sert qu'à créer le premier compte.
4. Envoyer un avis de test, vérifier qu'il arrive, puis le supprimer.

Les déploiements de prévisualisation (`npx vercel` sans `--prod`) échouent tant que `DATABASE_URL` n'existe pas pour l'environnement Preview. Si tu l'ajoutes, utilise une base séparée.

## À compléter avant d'ouvrir au public

- La page **Confidentialité** contient deux mentions à remplir par l'équipe : durée de conservation et adresse de contact (`src/app/(site)/confidentialite/page.tsx`).

## Limites actuelles

- La seule protection contre les robots est un champ piège : pas de limite d'envois par personne.
- Aucun e-mail n'est envoyé. Un mot de passe oublié se réinitialise depuis **Équipe & accès**, par un administrateur.
- L'export se fait en CSV (lisible par Excel) ou en JSON.
