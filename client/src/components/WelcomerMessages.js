import { useAuth } from "@Auth/SocketContext";

function WelcomerMessages() {
  const { user } = useAuth();

  const heure = new Date().getHours();
  const phrases = {
    night: [
      `Les vrais joueurs sont encore là, pas vrai ${user.username} ?`,
      `Prêt à enchainer les Kilomètres de nuit, ${user.username} ?`,
      `Une session nocturne ${user.username} ?`,
      `C'est à cette heure que les légendes se forment, ${user.username} !`,
      `Pas de repos pour les champions ${user.username} !`,
    ],
    day: [
      `Bonne journée ${user.username} !`,
      `Du soleil et des victoires, ${user.username} !`,
      `Encore une nouvelle victoire ${user.username} ?`,
      `Bonne chance ${user.username} !`,
      `Une petite partie ${user.username} ?`,
    ],
    evening: [
      `Prêt à faire des merveilles ce soir, ${user.username} ?`,
      `Le soir, c'est l'heure des pros ${user.username} !`,
      `Une petite partie ${user.username} ?`,
      `La soirée ne fait que commencer, ${user.username} !`,
      `Finissez la journée en beauté ${user.username} !`,
    ],
  };

  if (heure >= 0 && heure < 5) {
    return phrases.night[Math.floor(Math.random() * phrases.night.length)];
  } else if (heure >= 5 && heure < 18) {
    return phrases.day[Math.floor(Math.random() * phrases.day.length)];
  } else {
    return phrases.evening[Math.floor(Math.random() * phrases.evening.length)];
  }
}

export default WelcomerMessages;
