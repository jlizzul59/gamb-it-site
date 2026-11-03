// Réglages Supabase pour les comptes joueurs de Thermomot.
// Tant que ces deux valeurs sont vides, le jeu marche en mode invité :
// l'historique reste sur l'appareil et le bouton « Se connecter » est masqué.
// La clé « anon public » est faite pour être visible dans une page web :
// ce sont les règles d'accès de la base qui protègent les données.
window.THERMOMOT_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: ""
};
