import * as RadixDialog from '@radix-ui/react-dialog';
import { motion, type Variants } from 'framer-motion';
import React, { memo, type ReactNode } from 'react';
import { classNames } from '~/utils/classNames';
import { cubicEasingFn } from '~/utils/easings';

export { Close as DialogClose, Root as DialogRoot } from '@radix-ui/react-dialog';

const transition = {
  duration: 0.15,
  ease: cubicEasingFn,
};

export const dialogBackdropVariants = {
  closed: {
    opacity: 0,
    transition,
  },
  open: {
    opacity: 1,
    transition,
  },
} satisfies Variants;

export const dialogVariants = {
  closed: {
    x: '-50%',
    y: '-40%',
    scale: 0.96,
    opacity: 0,
    transition,
  },
  open: {
    x: '-50%',
    y: '-50%',
    scale: 1,
    opacity: 1,
    transition,
  },
} satisfies Variants;

interface DialogButtonProps {
  type: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
  onClick?: (event: React.UIEvent) => void;
  disabled?: boolean;
}

export const DialogButton = memo(({ type, children, onClick, disabled }: DialogButtonProps) => {
  return (
    <button
      disabled={disabled}
      className={classNames(
        'inline-flex items-center justify-center rounded-[500px] px-5 py-5 md:px-6 md:py-4 text-lg text-white leading-none focus:outline-none border border-[#777] md:min-w-[190px] w-full md:w-auto',
        {
          'bg-biela-elements-button-primary-background text-biela-elements-button-primary-text hover:bg-biela-elements-button-primary-backgroundHover':
            type === 'primary',
          'bg-[#030303] hover:bg-biela-elements-button-secondary-backgroundHover': type === 'secondary',
          'bg-[#FF554A] hover:bg-biela-elements-button-danger-backgroundHover border-none': type === 'danger',
        },
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
});

export const DialogTitle = memo(({ className, children, ...props }: RadixDialog.DialogTitleProps) => {
  return (
    <RadixDialog.Title
      className={classNames(
        'px-6 pt-6 pb-3 flex items-center justify-between border-b border-biela-elements-borderColor text-lg font-semibold leading-6 text-biela-elements-textPrimary delete-chat-title',
        className,
      )}
      {...props}
    >
      {children}
    </RadixDialog.Title>
  );
});

export const DialogDescription = memo(({ className, children, ...props }: RadixDialog.DialogDescriptionProps) => {
  return (
    <RadixDialog.Description
      className={classNames('px-6 pb-6 text-biela-elements-textPrimary text-md delete-chat-desc', className)}
      {...props}
    >
      {children}
    </RadixDialog.Description>
  );
});

interface DialogProps {
  children: ReactNode | ReactNode[];
  className?: string;
  onBackdrop?: (event: React.UIEvent) => void;
  onClose?: (event: React.UIEvent) => void;
}

export const Dialog = memo(({ className, children, onBackdrop }: DialogProps) => {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay onClick={onBackdrop} asChild>
        <motion.div
          className="bg-black/50 fixed inset-0 z-max"
          initial="closed"
          animate="open"
          exit="closed"
          variants={dialogBackdropVariants}
        />
      </RadixDialog.Overlay>
      <RadixDialog.Content asChild>
        <motion.div
          className={classNames(
            'fixed top-[50%] left-[50%] z-max max-h-[85vh] w-[90vw] max-w-[600px] translate-x-[-50%] translate-y-[-50%] border border-biela-elements-borderColor rounded-lg bg-biela-elements-background-depth-2 shadow-lg focus:outline-none overflow-hidden modal-delete-chat',
            className,
          )}
          initial="closed"
          animate="open"
          exit="closed"
          variants={dialogVariants}
        >
          {children}
        </motion.div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
});
