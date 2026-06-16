import { useEffect, useCallback } from "react";
import "./Modal.css";

export default function LinuxModal({ certificate, onClose }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  if (!certificate) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const resolveFile = (path) =>
    path ? `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}` : null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-window" role="dialog" aria-modal="true" aria-label={certificate.name}>
        <div className="modal-titlebar">
          <div className="modal-titlebar-dots">
            <button
              className="modal-dot modal-dot-close"
              onClick={onClose}
              aria-label="Cerrar"
            />
            <span className="modal-dot modal-dot-minimize" />
            <span className="modal-dot modal-dot-maximize" />
          </div>
          <span className="modal-title">
            📄 {certificate.name} — {certificate.issuer}
          </span>
        </div>

        <div className="modal-content">
          {certificate.type === "pdf" ? (
            <iframe
              src={`${resolveFile(certificate.certificateFile)}#view=FitH&toolbar=0`}
              title={certificate.name}
              className="modal-pdf"
            />
          ) : certificate.type === "image" ? (
            <img
              src={resolveFile(certificate.certificateFile)}
              alt={certificate.name}
              className="modal-image"
            />
          ) : (
            <div className="modal-empty">
              <p>Certificado no disponible aún.</p>
            </div>
          )}
        </div>

        <div className="modal-statusbar">
          <span>{certificate.certificateFile || "Sin archivo"}</span>
          <span>{certificate.date}</span>
        </div>
      </div>
    </div>
  );
}
