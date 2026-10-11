import './Modal.css';

export default function Modal({ header, open, onClose, onSave, children }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={onSave} className="modal-form">
          <div className="modal-header">
            <h3>{header}</h3>

            <button
              type="button"
              className="close-btn"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className="modal-content">{children}</div>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="submit-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
