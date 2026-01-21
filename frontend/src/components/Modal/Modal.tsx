import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./Modal.css";

/**
 * Modal component
 * - Reusable, accessible modal using a portal to `document.body`.
 * - Esc key closes the modal.
 * - Backdrop click closes the modal (configurable).
 * - Prevents background scroll while open.
 *
 * Notes:
 * - Keep component focused on rendering only; styling and tokens live in CSS.
 * - Do not inline styles; use CSS variables defined in `src/styles/variables.css`.
 */

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  closeOnBackdropClick?: boolean;
  className?: string;
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  closeOnBackdropClick = true,
  className = "",
}) => {
  useEffect(() => {
    if (!isOpen) return;
    // Handle Escape key to close modal
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // Prevent background scrolling while modal is open.
    // On iOS Safari `overflow: hidden` alone doesn't stop rubber-banding, so
    // we lock the body with `position: fixed` at the current scrollY and
    // restore it on cleanup. Also preserve previous inline styles.
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    // Cleanup: remove listener and restore scroll behaviour and position
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      // restore the scroll position that was at the time of opening
      window.scrollTo(0, scrollY);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdrop = (e: React.MouseEvent) => {
    if (!closeOnBackdropClick) return;
    if (e.target === e.currentTarget) onClose();
  };

  return ReactDOM.createPortal(
    <div className="rp-modal-overlay" onMouseDown={handleBackdrop} role="presentation">
      <div
        className={`rp-modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "rp-modal-title" : undefined}
      >
        <div className="rp-modal-header">
          {title && (
            <h3 id="rp-modal-title" className="rp-modal-title">
              {title}
            </h3>
          )}
          <button className="rp-modal-close" aria-label="Close modal" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="rp-modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
