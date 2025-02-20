import { useAuth } from "@Context/SocketContext";

function WelcomerMessages() {
  const { user } = useAuth();

  const heure = new Date().getHours();
  const phrases = {
    night: [
      ["Les vrais joueurs sont encore là, pas vrai", "?"],
      ["Prêt à enchaîner les kilomètres de nuit", "?"],
      ["Une session nocturne", "?"],
      ["C'est à cette heure que les légendes se forment", "!"],
      ["Pas de repos pour les champions", "!"],
    ],
    day: [
      ["Bonne journée", "!"],
      ["Du soleil et des victoires", "!"],
      ["Encore une nouvelle victoire", "?"],
      ["Bonne chance", "!"],
      ["Une petite partie", "?"],
    ],
    evening: [
      ["Prêt à faire des merveilles ce soir", "?"],
      ["Le soir, c'est l'heure des pros", "!"],
      ["Une petite partie", "?"],
      ["La soirée ne fait que commencer", "!"],
      ["Finissez la journée en beauté", "!"],
    ],
  };

  const timeOfDay =
    heure >= 0 && heure < 5
      ? "night"
      : heure >= 5 && heure < 18
      ? "day"
      : "evening";

  const [phrase, symbol] =
    phrases[timeOfDay][Math.floor(Math.random() * phrases[timeOfDay].length)];

  return (
    <p>
      {phrase} <span>{user.username}</span> {symbol}
    </p>
  );
}

export default WelcomerMessages;
