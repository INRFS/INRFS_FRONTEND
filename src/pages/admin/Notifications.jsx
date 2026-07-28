import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, DollarSign, Bell, Mail, Check } from "lucide-react";

const initialNotifications = [
  { id: 1, icon: CheckCircle2, tone: "success", title: "Investment Approved", isNew: true, body: "Your investment BND-2025-001 of ₹5,00,000 has been approved.", time: "2 hours ago" },
  { id: 2, icon: ShieldCheck, tone: "info", title: "Bond Generated", isNew: true, body: "Investment Bond BND-2025-001 has been generated. Download now.", time: "2 hours ago" },
  { id: 3, icon: DollarSign, tone: "success", title: "Interest Credited", isNew: false, body: "₹5,000 monthly interest for June 2025 has been credited.", time: "5 days ago" },
  { id: 4, icon: Bell, tone: "warning", title: "Upcoming Maturity", isNew: false, body: "Bond BND-2024-087 matures in 30 days. Plan your renewal.", time: "1 week ago" },
  { id: 5, icon: Mail, tone: "info", title: "Email Confirmation", isNew: false, body: "Email confirmation sent to arjun@email.com for investment.", time: "2 weeks ago" },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((n) => n.isNew).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isNew: false })));
  };

  return (
    <div className="admin-page">
      <div className="admin-page-actions admin-page-actions--between">
        <p className="admin-page-subtitle">{unreadCount} unread notifications</p>
        <button className="admin-btn admin-btn--outline" onClick={markAllRead}>
          <Check size={14} /> Mark All Read
        </button>
      </div>

      <div className="notif-list">
        {notifications.map(({ id, icon: Icon, tone, title, isNew, body, time }) => (
          <div key={id} className={`notif-row${isNew ? " notif-row--unread" : ""}`}>
            <span className={`notif-icon notif-icon--${tone}`}>
              <Icon size={16} />
            </span>
            <div className="notif-body">
              <p className="notif-title">
                {title} {isNew && <span className="notif-badge-new">New</span>}
              </p>
              <p className="notif-text">{body}</p>
              <p className="notif-time">{time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
