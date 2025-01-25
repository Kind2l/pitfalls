import { useAuth } from "../auth/SocketContext";

function WelcomerMessages() {
  const { user } = useAuth();

  const heure = new Date().getHours();
  const phrases = {
    night: [
      `Les vrais joueurs sont encore là, pas vrai ${user.username} ?`,
      `Tard dans la nuit, mais toujours prêt, ${user.username} ?`,
      `Une session nocturne pour briller, ${user.username} !`,
      `C'est à cette heure que les légendes se forment, ${user.username} !`,
      `Pas de repos pour les champions comme vous, ${user.username} !`,
    ],
    day: [
      `Un bon moment pour jouer, qu'en dites-vous ${user.username} ?`,
      `Du soleil et des victoires, ${user.username} !`,
      `C'est une belle journée pour une partie, ${user.username} !`,
      `Des parties et des sourires, bonne chance ${user.username} !`,
      `On commence la journée en force, ${user.username} !`,
    ],
    evening: [
      `Prêt à faire des merveilles ce soir, ${user.username} ?`,
      `Le soir, c'est l'heure des pros, vous en êtes ${user.username} !`,
      `Relax et focus pour la partie du soir, ${user.username} !`,
      `La soirée ne fait que commencer, ${user.username} !`,
      `Finissez la journée en beauté, bonne chance ${user.username} !`,
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
