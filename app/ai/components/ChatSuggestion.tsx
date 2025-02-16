import { AnimatePresence, motion } from 'framer-motion';
import { classNames } from '~/utils/classNames';
import FiSrCheck from '~/assets/icons/fiSrCheck';
import FiSrCross from '~/assets/icons/fiSrCross';
import styles from '../styles/BaseChat.module.scss';

interface Props {
  title: string;
  message: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  postMessage: () => void;
  clearAlert: () => void;
}

export default function ChatSuggestion({
  title,
  message,
  primaryButtonText,
  secondaryButtonText,
  postMessage,
  clearAlert,
}: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`rounded-lg relative overflow-hidden py-3`}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={'green-light absolute !top-0 !w-[170px]'}
        />
        <div className="flex items-start">
          <div className="mx-3 flex-1">
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`text-sm font-light text-biela-elements-textPrimary mb-4`}
            >
              {title}
            </motion.h3>
            <div className={'overflow-hidden rounded-lg'}>
              <div className={classNames(styles.wrapperParent)}>
                <div className={'green-light absolute !top-0 !w-[170px]'}></div>
                <div className={'relative z-2'}>
                  <div className={classNames(styles.wrapper)}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className={`mt-2 text-sm text-left text-biela-elements-button-secondary-text`}
                    >
                      <p className={'relative z-2 font-light'}>{message}</p>
                    </motion.div>

                    <motion.div
                      className="mt-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className={classNames('flex gap-3 relative z-2')}>
                        <button
                          onClick={postMessage}
                          className={classNames(
                            `px-3 py-[10px] rounded-lg text-sm font-light`,
                            styles.chatSuggestionPrimaryButton,
                            'hover:bg-biela-elements-button-secondary-backgroundHover',
                            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-biela-elements-button-secondary-background',
                            'text-biela-elements-button-secondary-text',
                            'flex items-center gap-[10px]',
                          )}
                        >
                          <div className={'flex items-center gap-[10px] relative z-2 font-light'}>
                            <FiSrCheck />
                            {primaryButtonText}
                          </div>
                        </button>
                        <button
                          onClick={clearAlert}
                          className={classNames(
                            `px-3 py-[10px] rounded-lg text-sm font-light`,
                            styles.chatSuggestionSecondaryButton,
                            'hover:bg-biela-elements-button-secondary-backgroundHover',
                            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-biela-elements-button-secondary-background',
                            'text-biela-elements-button-secondary-text',
                            'flex items-center gap-[10px]',
                          )}
                        >
                          <div className={'flex items-center gap-[10px] relative z-2 font-light'}>
                            <FiSrCross />
                            {secondaryButtonText}
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
