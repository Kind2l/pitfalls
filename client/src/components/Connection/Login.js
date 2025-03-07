import React, { useState } from "react";
import axios from "axios";
import { useLoader } from "@Context/LoaderContext";
import { useNotification } from "@Context/NotificationContext.js";
import { useAuth } from "@Context/SocketContext";
import "@Styles/Connection/Login.scss";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { handleLogin } = useAuth();
  const { hideLoader, showLoader } = useLoader();
  const { addNotification } = useNotification();
  const [showPassword, setShowPassword] = useState(false);
  const usernameRegex =
    /^(?=.{4,20}$)(?![_.-])(?!.*[_.-]{2})[a-zA-Z0-9_-]+([^._-])$/;
  const passwordRegex =
    /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
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
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const { username, password } = data;

    showLoader();
    try {
      const response = await axios.post(
        process.env.REACT_APP_LOCAL_ADDRESS + "/login",
        {
          username,
          password,
        },
        { withCredentials: true }
      );
      if (response) {
        hideLoader();
        if (response) {
          addNotification("Vous êtes désormais connecté.");
          handleLogin(response);
          navigate("/");
        } else {
          setError("serverError", {
            type: "manual",
            message: response.message,
          });
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
    <>
      <div className="login">
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
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              {...register("password", {
                required: "Aucun mot de passe fourni.",
                minLength: {
                  value: 4,
                  message:
                    "Le mot de passe doit contenir 4 caractères minimum.",
                },
                maxLength: {
                  value: 20,
                  message:
                    "Le mot de passe doit contenir 20 caractères maximum.",
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

          {errors.serverError && (
            <p className="form-error">{errors.serverError?.message}</p>
          )}

          <button className="submit btn bg-green cherry-font" type="submit">
            Connexion
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
