import React from "react";
import { CheckCircle2, Award, Bell, Mail, Check } from "lucide-react";
import { useInvestorData } from "./InvestorDataContext";
import "../../Styles/Investor/Notifications.css";

const iconByType = { success: CheckCircle2, info: Award, warning: Bell, mail: Mail };

export default function Notifications() {
  const { notifications, markAllNotificationsRead } = useInvestorData();
  const unreadCount = notifications.filter((n) => n.isNew).length;

  return (
    <div className="investor-page">
      <div className="investor-page-actions investor-page-actions--between">
        <p className="investor-page-subtitle">{unreadCount} unread notifications</p>
        <button className="investor-btn investor-btn--outline" onClick={markAllNotificationsRead}>
          <Check size={14} /> Mark All Read
        </button>
      </div>

      <div className="notif-list">
        {notifications.map(({ id, type, title, isNew, body, time }) => {
          const Icon = iconByType[type] || Bell;
          return (
            <div key={id} className={`notif-row${isNew ? " notif-row--unread" : ""}`}>
              <span className={`notif-icon notif-icon--${type}`}>
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
          );
        })}
      </div>
    </div>
  );
}
