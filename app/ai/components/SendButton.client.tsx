import { AnimatePresence, cubicBezier, motion } from 'framer-motion';
import ArrowIcon from '~/assets/icons/arrow-right.svg';

interface SendButtonProps {
  show: boolean;
  isStreaming?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onImagesSelected?: (images: File[]) => void;
  type: 'send' | 'cancel';
}

const customEasingFn = cubicBezier(0.4, 0, 0.2, 1);

export const SendButton = ({ show, isStreaming, disabled, onClick, type }: SendButtonProps) => {
  const disabledButton = type === 'send' ? disabled : !isStreaming;

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          className="flex justify-center items-center right-[22px] px-[12px] py-[12px] bg-[#86F49C] hover:brightness-94 transition-theme disabled:opacity-50 disabled:cursor-not-allowed send-btn-chat"
          transition={{ ease: customEasingFn, duration: 0.17 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          disabled={disabledButton}
          onClick={(event) => {
            event.preventDefault();

            if (!disabledButton) {
              onClick?.(event);
            }
          }}
        >
          <div className={'biela-send'}>
            {type === 'send' ? (
              <img className="text-[black]" src={ArrowIcon} alt={''} />
            ) : (
              <motion.img
                src="/icons/logo-biela.svg"
                alt="Rotating Logo"
                animate={{ rotate: [0, 360] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: 'linear',
                }}
              />
            )}
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
