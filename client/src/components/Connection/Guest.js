import { useLoader } from "@Context/LoaderContext";
import { useNotification } from "@Context/NotificationContext.js";
import { useAuth } from "@Context/SocketContext";
import "@Styles/Connection/Guest.scss";
import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const Guest = () => {
  const { handleGuestLogin } = useAuth();
  const { hideLoader, showLoader } = useLoader();
  const { addNotification } = useNotification();
  const usernameRegex =
    /^(?=.{2,14}$)(?![_.-])(?!.*[_.-]{2})[a-zA-Z0-9_-]+([^._-])$/;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const { username } = data;

    showLoader();
    try {
      const response = await axios.post(
        process.env.REACT_APP_LOCAL_ADDRESS + "/guest-login",
        {
          username,
        },
        { withCredentials: true }
      );
      if (response) {
        hideLoader();
        if (response) {
          addNotification("Vous êtes désormais connecté.");
          handleGuestLogin(response);
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
      <div className="guest">
        <h2>Jouer en tant qu’invité</h2>
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
                  value: 2,
                  message:
                    "Le nom d'utilisateur doit contenir 4 caractères minimum.",
                },
                maxLength: {
                  value: 14,
                  message:
                    "Le nom d'utilisateur doit contenir 14 caractères maximum.",
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
            {errors.serverError && (
              <p className="form-error">{errors.serverError?.message}</p>
            )}
          </div>

          <button className="btn bg-blue cherry-font" type="submit">
            Jouer
          </button>
        </form>
      </div>
    </>
  );
};

export default Guest;
