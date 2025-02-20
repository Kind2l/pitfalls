import { useLoader } from "@Context/LoaderContext";
import { useNotification } from "@Context/NotificationContext.js";
import { useSound } from "@Context/SoundContext";
import emailjs from "@emailjs/browser";
import "@Styles/connection/AndroidProgram.scss";
import React, { useState } from "react";

const JoinAndroidProgram = () => {
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
          "service_c2n0tdk",
          "template_cikhq3e",
          e.target,
          "ZB19mjy1-ZjbwPpVh"
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
      setError("Insérez un nom d'utilisateur.");
    }
  };

  return (
    <div className="android-program">
      <h2>Aidez Pitfalls à arriver sur Android !</h2>
      <p>
        La version Android de Pitfalls est en développement pour smartphones et
        tablettes. Je recherche des testeurs pour l'application.
        <br />
        Pour soutenir le projet, envoyez-moi votre adresse Gmail. Vous serez
        ajouté au programme de test fermé et recevrez un lien pour télécharger
        le jeu.
      </p>
      <form onSubmit={handleSend}>
        <div className="form-input">
          <input
            type="text"
            name="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            minLength={4}
            maxLength={40}
          />
          <div className="domain">@gmail.com</div>
        </div>

        <div className="form-checkbox">
          <label htmlFor="botCheck">Je ne suis pas un robot</label>
          <input id="botCheck" type="checkbox" onClick={() => setIsBot(true)} />
        </div>

        <div className="form-input">
          <button
            className="submit btn bg-blue cherry-font"
            type="submit"
            onClick={() => playEffect("open")}
          >
            JE SOUTIENS
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}
      </form>
    </div>
  );
};

export default JoinAndroidProgram;
