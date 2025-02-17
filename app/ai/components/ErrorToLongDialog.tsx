import React, { FC, UIEvent } from 'react';
import { Dialog, DialogButton, DialogDescription, DialogRoot, DialogTitle } from './Dialog';

interface ErrorTooLongDialogProps {
  isOpen: boolean;
  onEdit: (event: UIEvent) => void;
  onClose: () => void;
}

const ErrorTooLongDialog: FC<ErrorTooLongDialogProps> = ({ isOpen, onEdit, onClose }) => {
  return (
    <DialogRoot open={isOpen}>
      <Dialog onBackdrop={onClose} onClose={onClose}>
        <DialogTitle>
          Whoa, That’s a Lot of Text!
        </DialogTitle>
        <DialogDescription asChild>
          <div>
            <p>
              Looks like your message is too big to send all at once! Try breaking it into smaller parts and sending them separately.
            </p>
          </div>
        </DialogDescription>
        <div className="px-6 pb-6 bg-bolt-elements-background-depth-2 flex gap-2 footer-modal">
          <DialogButton type="primary" onClick={onEdit}>
            Edit Message
          </DialogButton>
        </div>
      </Dialog>
    </DialogRoot>
  );
};

export default ErrorTooLongDialog;
