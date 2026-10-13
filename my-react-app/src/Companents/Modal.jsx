import './Modal.css';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

export default function Modal({ header, open, onClose, onSave, children }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={onSave} className="modal-form">
          <div className="modal-header">
            <h3>{header}</h3>

            <IconButton
              className="close-btn"
              size="small"
              onClick={onClose}
            >
              ×
            </IconButton>
          </div>

          <div className="modal-content">{children}</div>

          <div className="modal-actions">
            <Button
              variant="outlined"
              color="inherit"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button type="submit" variant="contained">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
