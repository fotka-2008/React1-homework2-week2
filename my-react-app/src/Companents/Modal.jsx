import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

export default function Modal({ header, open, onClose, onSave, children }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={onSave}>
        <DialogTitle>{header}</DialogTitle>

        <DialogContent>{children}</DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
