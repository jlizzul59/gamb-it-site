# Thermomot

Jeu de mots façon Cémantix, un mot par jour du 1er janvier 2025 au 31 décembre 2027, jouable à n'importe quelle date passée.

- `data/` : dictionnaire, vecteurs de mots compressés et mots du jour (un fichier par mois).
- `config.js` : adresse et clé publique Supabase pour les comptes joueurs. Vide = mode invité seulement.
- `supabase-setup.sql` : création de la table des parties, à lancer une fois dans Supabase.

Comptes : pseudo + mot de passe. Supabase exige une adresse e-mail, le jeu en fabrique une à partir du pseudo
(`pseudo@joueurs.gamb-it-apps.fr`), d'où l'obligation de désactiver « Confirm email » dans Supabase.
