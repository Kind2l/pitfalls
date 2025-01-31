import "@Styles/Notification.scss";
import React, { createContext, useContext, useState } from "react";

// Crée le contexte
const NotificationContext = createContext();

// Fournisseur de contexte
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Ajoute une notification
  const addNotification = (message, image) => {
    const id = Date.now(); // ID unique basé sur le timestamp
    const newNotification = { id, message, image };
    setNotifications((prev) => [...prev, newNotification]);

    // Supprime la notification après 2 secondes
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 2000);
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="notification-container">
        {notifications.map((notif) => (
          <div key={notif.id} className="notification">
            {notif.image && <img src={notif.image} alt="Notification" />}
            <p>{notif.message}</p>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useNotification = () => useContext(NotificationContext);
