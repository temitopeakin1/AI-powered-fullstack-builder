import { FC, UIEvent } from 'react';
import { Dialog, DialogButton, DialogDescription, DialogRoot, DialogTitle } from './Dialog';
import { capitalize } from 'lodash';

export enum DialogConfirmationType {
  DELETE = 'delete',
  DUPLICATE = 'duplicate',
  DOWNLOAD = 'download',
  EXPORT = 'export',
  FORK = 'form',
  ROLLBACK = 'rollback',
  SAVE = 'save',
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  type: DialogConfirmationType;
  description: string;
  onConfirm: (event: UIEvent) => Promise<void> | void;
  onCancel: () => void;
}

const ConfirmationDialog: FC<ConfirmationDialogProps> = ({ isOpen, type, description, onConfirm, onCancel }) => {
  const chatTypes = [DialogConfirmationType.FORK, DialogConfirmationType.DELETE, DialogConfirmationType.SAVE];

  return (
    <DialogRoot open={isOpen}>
      <Dialog onBackdrop={onCancel} onClose={onCancel}>
        <DialogTitle>
          {capitalize(type)} {chatTypes.includes(type) ? 'Chat' : 'Message'}
        </DialogTitle>
        <DialogDescription asChild>
          <div>
            <p>
              You are about to {type} <strong>{description}</strong>.
            </p>
            <p className="mt-4"> Are you sure you want to {type} this chat?</p>
          </div>
        </DialogDescription>
        <div className="px-6 pb-6 bg-bolt-elements-background-depth-2 flex gap-2 footer-modal">
          <DialogButton type="secondary" onClick={onCancel}>
            Cancel
          </DialogButton>
          <DialogButton type="danger" onClick={onConfirm}>
            {capitalize(type)}
          </DialogButton>
        </div>
      </Dialog>
    </DialogRoot>
  );
};

export default ConfirmationDialog;
