import { useSound } from "@Context/SoundContext";
import { useEffect, useState } from "react";

function CardStack({ numberOfCards }) {
  const [message, setMessage] = useState(null);
  const [visible, setVisible] = useState(false);
  const { playEffect } = useSound();

  useEffect(() => {
    if (message) {
      playEffect("time");
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setMessage(null), 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (!numberOfCards) return;

    let newMessage = null;
    if (numberOfCards > 50 || numberOfCards < 10) {
      return;
    }

    if (numberOfCards === 80) {
      newMessage = "Il reste 80 cartes !";
    } else if (numberOfCards === 50) {
      newMessage = "Il reste 20 cartes !";
    } else if (numberOfCards === 20) {
      newMessage = "Il reste 20 cartes !";
    } else if (numberOfCards === 10) {
      newMessage = "Plus que 10 cartes !";
    }

    if (newMessage) {
      setMessage(newMessage);
      setVisible(true);
    }
  }, [numberOfCards]);

  if (!visible) return null;

  return (
    <div className="card-stack">
      <div className="card-stack__count cherry-font">{message}</div>
    </div>
  );
}

export default CardStack;
