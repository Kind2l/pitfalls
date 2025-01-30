import React from "react";

const NotificationPopup = ({ notification, notificationIsVisible }) => {
  return (
    <div
      className={`notification-popup ${notificationIsVisible ? "show" : ""} ${
        notification?.type || ""
      }`}
    >
      {notification?.content && (
        <span className="notification-popup__content">
          {notification.content}
        </span>
      )}
    </div>
  );
};

export default NotificationPopup;
