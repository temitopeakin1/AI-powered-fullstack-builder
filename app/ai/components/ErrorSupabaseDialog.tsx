import React, { FC } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { motion, type Variants } from 'framer-motion';
import danger from '/icons/danger.svg';
import close from '/icons/fi-sr-cross.svg';

interface ErrorSupabaseDialogProps {
  isOpen: boolean;
  onEdit: () => void;
  onClose: () => void;
  isLoading: boolean;
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


const ErrorSupabaseDialog: FC<ErrorSupabaseDialogProps> = ({ isOpen, onEdit, onClose, isLoading }) => {

  return (
    <RadixDialog.Root open={isOpen}>
      <RadixDialog.Portal>
        {/* Overlay */}
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

        {/* Dialog Content */}
        <RadixDialog.Content asChild>
          <motion.div
            onClick={(e) => e.stopPropagation()}
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
            {/* Decorative Ellipse */}
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

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute border border-white/25 top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 transition-colors duration-200"
              aria-label="Close dialog"
            >
              <img src={close} alt="Close" />
            </button>

            <div className="p-6 grid xl:flex items-center gap-8 xl:gap-2">
              <div className="flex justify-center">
                <img src={danger} alt="Error Icon" className="mt-1 w-16 xl:w-8" />
              </div>
              <h2
                className="_textWeight_ybcgn_45 text-white text-[18px] xl:text-[30px] not-italic font-semibold leading-[30px] xl:leading-[56px]">
                Oops!
              </h2>
            </div>

            <div className="px-6 pb-3">
              <p className="font-inter font-light text-white text-base xl:text-[20px] not-italic leading-normal">
                Your limit has been reached. Please delete some projects or increase your limit in Supabase.
              </p>
            </div>

            <div className="px-6 pb-8">
              <p className="font-inter font-thin text-white text-[16px] text-[#D5D5D5] xl:text-base not-italic leading-normal">
                Go to <a href="https://supabase.com/dashboard/projects" className="text-[#86F49C] " target="_blank">https://supabase.com/dashboard/projects</a>, click on the project, Project Settings, scroll to the bottom, and click Delete. Then try again to connect.
              </p>
            </div>

            <div className="px-6 bg-bolt-elements-background-depth-2">
              <button
                onClick={onEdit}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-[500px] px-5 py-5 md:px-6 md:py-4 text-lg text-white leading-none focus:outline-none border border-[#777] md:min-w-[190px] w-full md:w-auto bg-[#030303] hover:bg-biela-elements-button-secondary-backgroundHover"
              >
                {isLoading ? 'Retrying...' : 'Retry Connection'}
              </button>

            </div>
          </motion.div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

export default ErrorSupabaseDialog;
