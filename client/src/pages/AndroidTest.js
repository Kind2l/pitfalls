import BackButton from "@Components/BackButton";
import Header from "@Components/Header";
import { useLoader } from "@Context/LoaderContext";
import { useNotification } from "@Context/NotificationContext.js";
import { useSound } from "@Context/SoundContext";
import emailjs from "@emailjs/browser";

import "@Styles/AndroidTest.scss";
import React, { useState } from "react";

const AndroidTest = () => {
  const { hideLoader, showLoader } = useLoader();
  const { addNotification } = useNotification();
  const { playEffect } = useSound();

  const [email, setEmail] = useState("");
  const [isBot, setIsBot] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    if (!email) return "Aucune adresse.";
    if (email.length < 4) return "Minimum 4 caractères.";
    if (email.length > 40) return "Maximum 40 caractères.";

    const emailRegex = /^[a-zA-Z0-9-_]+$/;
    if (!emailRegex.test(email)) {
      return "L'email contient des caractères non autorisés.";
    }

    return false;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");

    if (isBot) {
      return;
    }

    if (email.trim()) {
      const validationError = validateEmail(email);
      if (validationError) {
        setError(validationError);
        return;
      }

      showLoader();
      emailjs
        .sendForm(
          process.env.REACT_APP_EMAILJS_SERVICE_ID,
          process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
          e.target,
          process.env.REACT_APP_EMAILJS_PUBLIC_KEY
        )
        .then(
          (response) => {
            hideLoader();
            addNotification("C'est envoyé. Merci de soutenir Pitfalls !");
          },
          (error) => {
            hideLoader();
            setError("Impossible d'envoyer votre adresse email");
            console.log(error);
          }
        );
    } else {
      setError("Renseignez votre adresse email.");
    }
  };

  return (
    <>
      <Header />
      <div className="android-test">
        <div className="android-test-content">
          <h2>Aidez Pitfalls à arriver sur Android !</h2>
          <p>
            La version Android de Pitfalls est en cours de développement pour
            smartphones et tablettes. Nous recherchons encore 4 testeurs.
          </p>
          <p>
            Soutenez le projet dès maintenant et recevez des récompenses
            exclusives dans les prochaines mises à jour du jeu !
          </p>
          <form onSubmit={handleSend}>
            <div className="form-input">
              <input
                type="text"
                name="email"
                placeholder="Votre adresse email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                minLength={4}
                maxLength={40}
              />
              <div className="domain">@gmail.com</div>
            </div>
            <p className="disclaimer">
              Votre adresse sera utilisée uniquement dans le cadre du programme
              de test de Pitfalls.
            </p>

            <div className="form-checkbox">
              <label htmlFor="botCheck">Je ne suis pas un robot</label>
              <input
                id="botCheck"
                type="checkbox"
                onClick={() => setIsBot(true)}
              />
            </div>

            <div className="form-input">
              <button
                className="submit btn bg-blue cherry-font"
                type="submit"
                onClick={() => playEffect("open")}
              >
                SOUTENIR LE JEU
              </button>
            </div>

            {error && <div className="form-error">{error}</div>}
          </form>
          <BackButton />
        </div>
      </div>
    </>
  );
};

export default AndroidTest;
