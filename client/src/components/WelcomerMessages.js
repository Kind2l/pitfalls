import { useAuth } from "../auth/SocketContext";

function WelcomerMessages() {
  const { user } = useAuth();

  const heure = new Date().getHours();
  const phrases = {
    night: [
      `On joue tard le soir, ${user.username} ?`,
      `Encore en forme à cette heure, ${user.username} ?`,
      `Les meilleurs joueurs sont nocturnes, n'est-ce pas ${user.username} ?`,
      `On enchaîne les parties nocturnes, ${user.username} !`,
      `Amusez-vous bien, ${user.username} !`,
    ],
    day: [
      `Bonjour ${user.username}, prêt pour une partie ?`,
      `Amusez-vous bien, ${user.username} !`,
      `Bonne journée, ${user.username} !`,
      `Une petite partie, ${user.username} ?`,
      `Bonne chance pour la prochaine partie, ${user.username} !`,
    ],
    evening: [
      `Bonsoir ${user.username}, prêt à gagner ?`,
      `Rien de tel qu'une partie pour finir la journée, ${user.username} !`,
      `Une partie du soir pour se détendre, ${user.username} ?`,
      `On termine la journée en beauté, ${user.username} ?`,
      `Bonne soirée ${user.username} !`,
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
