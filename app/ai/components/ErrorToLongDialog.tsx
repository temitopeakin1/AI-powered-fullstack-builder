import React, { FC } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { motion, type Variants } from 'framer-motion';
import dizzy from '/icons/dizzy.svg';
import close from '/icons/fi-sr-cross.svg';

interface ErrorTooLongDialogProps {
  isOpen: boolean;
  onEdit: () => void;
  onClose: () => void;
}

const transition = {
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1],
};

const backdropVariants: Variants = {
  closed: {
    opacity: 0,
    transition,
  },
  open: {
    opacity: 1,
    transition,
  },
};

const dialogVariants: Variants = {
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
};

const ErrorTooLongDialog: FC<ErrorTooLongDialogProps> = ({ isOpen, onEdit, onClose }) => {
  return (
    <RadixDialog.Root open={isOpen}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay asChild>
          <motion.div
            className="bg-black/50 fixed inset-0 z-40"
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            onClick={onClose}
          />
        </RadixDialog.Overlay>

        <RadixDialog.Content asChild>
          <motion.div
            onClick={(e) => e.stopPropagation()} // Prevent click events from bubbling to the overlay
            className="fixed too-much-text top-[50%] left-[50%] py-[24px] z-50 max-h-[85vh] w-[90%] xl:w-[847px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-biela-elements-background-depth-2 shadow-lg focus:outline-none overflow-hidden"
            style={{
              borderRadius: '12px',
              background:
                'linear-gradient(0deg, rgba(5, 5, 5, 0.00) 24.45%, rgba(242, 1, 1, 0.10) 76.64%)',
            }}
            initial="closed"
            animate="open"
            exit="closed"
            variants={dialogVariants}
          >


            {/* Decorative ellipse */}
            <div
              style={{
                borderRadius: '847px',
                background: 'linear-gradient(rgb(242, 1, 0) 50.04%, rgb(3, 4, 4) 140.18%)',
                filter: 'blur(9px)',
                width: '94%',
                margin: '0 auto',
                height: '5px',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
              }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute border border-white/25 top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 transition-colors duration-200"
              aria-label="Close dialog"
            >
              <img src={close} alt="" />
            </button>

            <div className="p-6 grid xl:flex items-center gap-8 xl:gap-2">
              <div className="flex justify-center">
                <img src={dizzy} alt="" className="mt-1 w-16 xl:w-8" />
              </div>
              <h2
                className="_textWeight_ybcgn_45 text-white text-[18px] xl:text-[30px] not-italic font-semibold leading-[30px] xl:leading-[56px]"
              >
            <div className="px-6 pb-6 flex items-center gap-2">
              <img src={dizzy} alt=""  className="mt-1"/>
              <h2 className="_textWeight_u905f_45 text-white text-[30px] not-italic font-semibold leading-[56px]">
                Whoa, That's a Lot of Text!
              </h2>
            </div>

            <div className="px-6 pb-6">
              <p className="font-inter font-light text-white text-base xl:text-[20px] not-italic leading-normal">
                Looks like your message is too big to send all at once! Try breaking it into
                smaller parts and sending them separately.
              </p>
            </div>

            <div className="px-6 pb-6 bg-bolt-elements-background-depth-2">
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-[500px] px-5 py-5 md:px-6 md:py-4 text-lg text-white leading-none focus:outline-none border border-[#777] md:min-w-[190px] w-full md:w-auto bg-[#030303] hover:bg-biela-elements-button-secondary-backgroundHover"
                onClick={onEdit}
                className="inline-flex items-center justify-center rounded-[500px] px-5 py-5 md:px-6 md:py-4 text-lg text-white leading-none focus:outline-none border border-[#777] md:min-w-[190px] w-full md:w-auto bg-[#030303] hover:bg-biela-elements-button-secondary-backgroundHover"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

export default ErrorTooLongDialog;
