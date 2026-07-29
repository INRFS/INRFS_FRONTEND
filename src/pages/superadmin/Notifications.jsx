import React, { useState } from "react";
import "../../Styles/SuperAdmin/Notifications.css";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "approved",
    icon: "✓",
    title: "Investment Approved",
    isNew: true,
    message: "Your investment BND-2025-001 of ₹5,00,000 has been approved.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "bond",
    icon: "🏅",
    title: "Bond Generated",
    isNew: true,
    message: "Investment Bond BND-2025-001 has been generated. Download now.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "interest",
    icon: "$",
    title: "Interest Credited",
    isNew: false,
    message: "₹5,000 monthly interest for June 2025 has been credited.",
    time: "5 days ago",
    read: false,
  },
  {
    id: 4,
    type: "maturity",
    icon: "🔔",
    title: "Upcoming Maturity",
    isNew: false,
    message: "Bond BND-2024-087 matures in 30 days. Plan your renewal.",
    time: "1 week ago",
    read: true,
  },
  {
    id: 5,
    type: "email",
    icon: "✉",
    title: "Email Confirmation",
    isNew: false,
    message: "Email confirmation sent to arjun@email.com for investment.",
    time: "2 weeks ago",
    read: true,
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    // TODO: call API to mark all as read
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isNew: false })));
  };

  const handleMarkOneRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, isNew: false } : n))
    );
  };

  return (
    <div className="notif-page">
      <div className="notif-page__header">
        <div>
          <h1 className="notif-page__title">Notifications</h1>
          <p className="notif-page__subtitle">{unreadCount} unread notifications</p>
        </div>
        <button className="notif-mark-btn" onClick={handleMarkAllRead}>
          ✓ Mark All Read
        </button>
      </div>

      <div className="notif-card">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`notif-item ${!n.read ? "notif-item--unread" : ""}`}
            onClick={() => handleMarkOneRead(n.id)}
          >
            <div className={`notif-icon notif-icon--${n.type}`}>{n.icon}</div>
            <div className="notif-content">
              <div className="notif-content__header">
                <span className="notif-content__title">{n.title}</span>
                {n.isNew && <span className="notif-badge">New</span>}
              </div>
              <p className="notif-content__message">{n.message}</p>
              <span className="notif-content__time">{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}