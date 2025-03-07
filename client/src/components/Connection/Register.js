import { useLoader } from "@Context/LoaderContext";
import { useNotification } from "@Context/NotificationContext.js";
import "@Styles/Connection/Register.scss";
import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const Register = ({ setChoice }) => {
  const { hideLoader, showLoader } = useLoader();
  const { addNotification } = useNotification();
  const [showPassword, setShowPassword] = useState(false);
  const usernameRegex =
    /^(?=.{4,20}$)(?![_.-])(?!.*[_.-]{2})[a-zA-Z0-9_-]+([^._-])$/;
  const passwordRegex =
    /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
  const emailRegex = /^((?!\.)[\w\-_.]*[^.])(\w@\w+)(\.\w+(\.\w+)?[^.\W])$/;
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();
  const password = watch("password");

  const togglePasswordView = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data) => {
    const { username, email, password, passwordRepeat } = data;

    // Vérifier que les mots de passe correspondent
    if (password !== passwordRepeat) {
      setError("passwordRepeat", {
        type: "manual",
        message: "Les mots de passe ne correspondent pas.",
      });
      return;
    }

    showLoader();
    try {
      const response = await axios.post(
        process.env.REACT_APP_API_ADDRESS + "/register",
        {
          username,
          email,
          password,
        }
      );

      if (response) {
        hideLoader();
        if (!response.data.success) {
          setError("serverError", {
            type: "manual",
            message: response.data.message || "Une erreur est survenue.",
          });
        } else {
          addNotification("Inscription réussie !");
          setChoice(true);
        }
      }
    } catch (error) {
      hideLoader();
      setError("serverError", {
        type: "manual",
        message:
          error.response?.data?.message ||
          "Une erreur est survenue. Veuillez réessayer.",
      });
    }
  };

  return (
    <div className="register">
      <form
        onSubmit={(e) => {
          clearErrors();
          handleSubmit(onSubmit)(e);
        }}
      >
        <div className="form-input">
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            {...register("username", {
              required: "Aucun nom d'utilisateur fourni.",
              minLength: {
                value: 4,
                message:
                  "Le nom d'utilisateur doit contenir 4 caractères minimum.",
              },
              maxLength: {
                value: 20,
                message:
                  "Le nom d'utilisateur doit contenir 20 caractères maximum.",
              },
              pattern: {
                value: usernameRegex,
                message:
                  "Le nom d'utilisateur contient des caractères non autorisés.",
              },
            })}
          />
          {errors.username && (
            <p className="form-error">{errors.username?.message}</p>
          )}
        </div>

        <div className="form-input">
          <input
            type="text"
            placeholder="Adresse email"
            {...register("email", {
              required: "Aucune adresse email fournie.",
              minLength: {
                value: 9,
                message:
                  "Le nom d'utilisateur doit contenir 20 caractères maximum.",
              },
              maxLength: {
                value: 40,
                message:
                  "Le nom d'utilisateur doit contenir 40 caractères maximum.",
              },
              pattern: {
                value: emailRegex,
                message: "Adresse email invalide.",
              },
            })}
          />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>

        <div className="form-input">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mot de passe"
            {...register("password", {
              required: "Aucun mot de passe fourni.",
              minLength: {
                value: 8,
                message: "Le mot de passe doit contenir 8 caractères minimum.",
              },
              maxLength: {
                value: 16,
                message: "Le mot de passe doit contenir 16 caractères maximum.",
              },
              pattern: {
                value: passwordRegex,
                message: "Mot de passe invalide.",
              },
            })}
          />

          {password && (
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
          {errors.password && (
            <p className="form-error">{errors.password?.message}</p>
          )}
        </div>
        <div className="form-input">
          <input
            type="password"
            placeholder="Confirmation du mot de passe"
            {...register("passwordRepeat", {
              required: "Veuillez confirmer votre mot de passe.",
            })}
          />
          {errors.passwordRepeat && (
            <p className="form-error">{errors.passwordRepeat?.message}</p>
          )}
          {password?.length > 0 && (
            <div className="password-requirements">
              <p className={/[A-Z]/.test(password) ? "color-green" : ""}>
                {/[A-Z]/.test(password) ? "✔" : ""} Une majuscule
              </p>
              <p className={/[a-z]/.test(password) ? "color-green" : ""}>
                {/[a-z]/.test(password) ? "✔" : ""} Une minuscule
              </p>
              <p className={/\d/.test(password) ? "color-green" : ""}>
                {/\d/.test(password) ? "✔" : ""} Un chiffre
              </p>
              <p className={/[^\w\d\s]/.test(password) ? "color-green" : ""}>
                {/[^\w\d\s]/.test(password) ? "✔" : ""} Un caractère spécial
              </p>
              <p
                className={
                  (password.length > 8) & (password.length < 16)
                    ? "color-green"
                    : ""
                }
              >
                {(password.length > 8) & (password.length < 16) ? "✔" : ""}{" "}
                Entre 8 et 16 caractères
              </p>
            </div>
          )}
        </div>

        {errors.serverError && (
          <p className="form-error">{errors.serverError?.message}</p>
        )}

        <button className="btn bg-green cherry-font" type="submit">
          Inscription
        </button>
      </form>
    </div>
  );
};

export default Register;
