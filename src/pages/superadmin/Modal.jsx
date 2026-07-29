import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import "../../Styles/SuperAdmin/Modal.css";

export default function Modal({ title, children, footer, onClose }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    // Lock background scroll while the modal is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const modal = (
    <div
      className="sa-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="sa-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sa-modal-header">
          <h2>{title}</h2>
          <button type="button" className="sa-modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="sa-modal-body">{children}</div>

        {footer && <div className="sa-modal-footer">{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}