# menus-api

Serveur des comptes du site de menus (https://gamb-it-apps.fr/menus/) :
comptes, groupes partagés et sauvegarde des semainiers, favoris et notes.

- Node.js, une seule dépendance : `pg`.
- Tables préfixées `menus_`, créées automatiquement au démarrage : elles cohabitent sans risque avec les tables existantes de la base.
- Mots de passe hachés (scrypt), sessions par jeton (180 jours), limitation des tentatives.

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | URL de la base Postgres (External Database URL sur Render) |
| `ALLOWED_ORIGINS` | Sites autorisés à appeler le serveur, séparés par des virgules |

## Ce qui est partagé dans un groupe

Le semainier (toutes les semaines) et les favoris. Les notes, les goûts et les réglages restent personnels.
