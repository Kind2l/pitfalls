import BackButton from "@Components/BackButton.js";
import { useLoader } from "@Context/LoaderContext";
import { useNotification } from "@Context/NotificationContext.js";
import { useAuth } from "@Context/SocketContext";

import "@Styles/Profile.scss";
import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const Profile = ({ setChoice }) => {
  const { hideLoader, showLoader } = useLoader();
  const { addNotification } = useNotification();
  const [showPassword, setShowPassword] = useState(false);
  const { handleLogout, user } = useAuth();

  const passwordRegex =
    /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;

  // Form for password update
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    formState: { errors: errorsPassword },
    setError: setErrorPassword,
    clearErrors: clearErrorsPassword,
  } = useForm();
  const newPassword = watchPassword("newPassword");

  // Form for account deletion
  const {
    register: registerDelete,
    handleSubmit: handleSubmitDelete,
    formState: { errors: errorsDelete },
    setError: setErrorDelete,
    clearErrors: clearErrorsDelete,
  } = useForm();

  const togglePasswordView = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const onSubmitPassword = async (data) => {
    const { oldPassword, newPassword, passwordRepeat } = data;

    // Vérifier que les mots de passe correspondent
    if (newPassword !== passwordRepeat) {
      setErrorPassword("passwordRepeat", {
        type: "manual",
        message: "Les mots de passe ne correspondent pas.",
      });
      return;
    }

    showLoader();
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_ADDRESS}/update-account`,
        {
          username: user.username,
          oldPassword: oldPassword,
          newPassword: newPassword,
        }
      );

      if (response) {
        hideLoader();
        if (!response.data.success) {
          setErrorPassword("serverError", {
            type: "manual",
            message: response.data.message || "Une erreur est survenue.",
          });
        } else {
          addNotification("Mise à jour réussie !");
        }
      }
    } catch (error) {
      hideLoader();
      setErrorPassword("serverError", {
        type: "manual",
        message:
          error.response?.data?.message ||
          "Une erreur est survenue. Veuillez réessayer.",
      });
    }
  };

  const onSubmitDelete = async (data) => {
    const { deleteAccount } = data;

    if (deleteAccount !== "Supprimer") {
      setErrorDelete("deleteAccount", {
        type: "manual",
        message: 'Veuillez écrire "Supprimer" pour supprimer votre compte.',
      });
      return;
    }

    showLoader();
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_ADDRESS}/delete-account`,
        {
          data: {
            username: user.username,
          },
        }
      );

      if (response) {
        hideLoader();
        if (!response.data.success) {
          setErrorDelete("serverError", {
            type: "manual",
            message: response.data.message || "Une erreur est survenue.",
          });
        } else {
          addNotification("Compte supprimé avec succès !");
          handleLogout();
        }
      }
    } catch (error) {
      hideLoader();
      setErrorDelete("serverError", {
        type: "manual",
        message:
          error.response?.data?.message ||
          "Une erreur est survenue. Veuillez réessayer.",
      });
    }
  };

  return (
    <div className="profile page">
      <div className="page-content">
        <form
          onSubmit={(e) => {
            clearErrorsPassword();
            handleSubmitPassword(onSubmitPassword)(e);
          }}
        >
          <h2 className="page-title">Mon profil</h2>
          <div className="form-input">
            <h3>Ancien mot de passe</h3>
            <input
              type="password"
              placeholder="Ancien mot de passe"
              {...registerPassword("oldPassword", {
                required: "Veuillez entrer votre ancien mot de passe.",
              })}
            />
          </div>
          <h3>Nouveau mot de passe</h3>
          <div className="form-input">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nouveau mot de passe"
              {...registerPassword("newPassword", {
                required: "Aucun mot de passe fourni.",
                minLength: {
                  value: 8,
                  message:
                    "Le mot de passe doit contenir 8 caractères minimum.",
                },
                maxLength: {
                  value: 16,
                  message:
                    "Le mot de passe doit contenir 16 caractères maximum.",
                },
                pattern: {
                  value: passwordRegex,
                  message: "Mot de passe invalide.",
                },
              })}
            />

            {newPassword && (
              <button
                className="password-eye"
                onClick={togglePasswordView}
                type="button"
                tabIndex="-1"
              >
                {showPassword ? (
                  <i className="fa-regular fa-eye"></i>
                ) : (
                  <i className="fa-regular fa-eye-slash"></i>
                )}
              </button>
            )}
            {errorsPassword.newPassword && (
              <p className="form-error">
                {errorsPassword.newPassword?.message}
              </p>
            )}
          </div>
          <div className="form-input">
            <input
              type="password"
              placeholder="Confirmation du mot de passe"
              {...registerPassword("passwordRepeat", {
                required: "Veuillez confirmer votre mot de passe.",
              })}
            />
            {errorsPassword.passwordRepeat && (
              <p className="form-error">
                {errorsPassword.passwordRepeat?.message}
              </p>
            )}
            {newPassword?.length > 0 && (
              <div className="password-requirements">
                <p className={/[A-Z]/.test(newPassword) ? "color-green" : ""}>
                  {/[A-Z]/.test(newPassword) ? "✔" : ""} Une majuscule
                </p>
                <p className={/[a-z]/.test(newPassword) ? "color-green" : ""}>
                  {/[a-z]/.test(newPassword) ? "✔" : ""} Une minuscule
                </p>
                <p className={/\d/.test(newPassword) ? "color-green" : ""}>
                  {/\d/.test(newPassword) ? "✔" : ""} Un chiffre
                </p>
                <p
                  className={/[^\w\d\s]/.test(newPassword) ? "color-green" : ""}
                >
                  {/[^\w\d\s]/.test(newPassword) ? "✔" : ""} Un caractère
                  spécial
                </p>
                <p
                  className={
                    (newPassword.length > 8) & (newPassword.length < 16)
                      ? "color-green"
                      : ""
                  }
                >
                  {(newPassword.length > 8) & (newPassword.length < 16)
                    ? "✔"
                    : ""}{" "}
                  Entre 8 et 16 caractères
                </p>
              </div>
            )}
          </div>

          {errorsPassword.serverError && (
            <p className="form-error">{errorsPassword.serverError?.message}</p>
          )}

          <button className="btn bg-blue cherry-font" type="submit">
            Mettre à jour
          </button>
        </form>
        <form
          onSubmit={(e) => {
            clearErrorsDelete();
            handleSubmitDelete(onSubmitDelete)(e);
          }}
        >
          <h3>Suppression du compte</h3>
          <p>
            Afin de confirmer la suppression de votre compte, veuillez écrire
            "Supprimer" dans le champ ci-dessous :
          </p>
          <div className="form-input">
            <input
              type="text"
              placeholder='Ecrivez "Supprimer"'
              {...registerDelete("deleteAccount", {
                required:
                  'Veuillez écrire "Supprimer" pour supprimer votre compte.',
              })}
            />
            {errorsDelete.deleteAccount && (
              <p className="form-error">
                {errorsDelete.deleteAccount?.message}
              </p>
            )}
          </div>

          {errorsDelete.serverError && (
            <p className="form-error">{errorsDelete.serverError?.message}</p>
          )}

          <button className="btn bg-red cherry-font" type="submit">
            Supprimer
          </button>
        </form>
      </div>

      <BackButton />
    </div>
  );
};

export default Profile;
