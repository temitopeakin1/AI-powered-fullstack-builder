import { AnimatePresence, motion } from 'framer-motion';
import type { ActionAlert } from '~/types/actions';
import { classNames } from '~/utils/classNames';
import styles from '~/ai/styles/BaseChat.module.scss';
import FiSrCross from '~/assets/icons/fiSrCross';
import { useStore } from '@nanostores/react';
import { chatStore, setErrorDetails } from '~/ai/lib/stores/chat';
import WithTooltip from './Tooltip';

interface Props {
  alert: ActionAlert;
  clearAlert: () => void;
  postMessage: (message: string) => void;
}

function reducedMessage(content: string): string {
  const lines = content.split('\n');
  return lines.slice(0, 8).join('\n');
}

export default function ChatAlert({ alert, clearAlert, postMessage }: Props) {
  const { description, content, source } = alert;
  const {errorDetails} =useStore(chatStore)
  const isPreview = source === 'preview';
  const title = isPreview ? 'Preview Error' : 'Terminal Error';
  const message = isPreview
    ? 'We encountered an error while running the preview. Would you like Biela to analyze and help resolve this issue?'
    : 'We encountered an error while running terminal commands. Would you like Biela to analyze and help resolve this issue?';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`rounded-lg relative border border-b-[0px] bg-transparent overflow-hidden border-biela-elements-borderColor bg-biela-elements-background-depth-2 py-[16px] px-[12px]`}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={'green-light absolute !top-0 !w-[170px]'}
        />
        <div className="flex items-start ">
          {/* Content */}
          <div className="flex-1 gap-[16px] flex flex-col">
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`text-sm font-medium text-biela-elements-textPrimary`}
            >
              {title}
            </motion.h3>

            <div className={'overflow-hidden rounded-lg'}>
              <div className={classNames(styles.errorWrapperParent)}>
                <div className={'green-light absolute !top-0 !w-[170px]'}></div>
                <div className={'relative z-2'}>
                  <div className={classNames(styles.errorWrapper, 'flex gap-[10px]')}>
                    {/* Icon */}
                    <motion.div
                      className="flex-shrink-0 transition-all duration-200"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <img src="/info-red.svg" alt="Error" />
                    </motion.div>
                    <motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`text-sm text-left text-biela-elements-button-secondary-text`}
                      >
                        <p className={'relative z-2 font-light'}>{message}</p>
                        {description && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className={`error-details ${errorDetails ? 'show' : 'hide'} w-[-webkit-fill-available] relative z-2 text-xs text-biela-elements-textSecondary p-2 bg-biela-elements-background-depth-3 rounded mt-4 mb-4`}
                          >
                            <p className={'min-h-[32px] max-w-[320px] mx-[auto]'}>Error: {description}</p>
                          </motion.div>
                        )}
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
                <motion.div
                  className="mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className={classNames('flex gap-3 relative z-2 items-center')}>
                    <button
                      onClick={() =>
                        postMessage(
                          `*Fix this ${isPreview ? 'preview' : 'terminal'} error* \n\`\`\`${isPreview ? 'js' : 'sh'}\n${reducedMessage(content)}\n\`\`\`\n`,
                        )
                      }
                      className={classNames(
                        `px-3 py-[10px] rounded-lg text-sm font-light bg-[#181818] border border-[#2E2E2E]`,
                        'hover:bg-biela-elements-button-secondary-backgroundHover',
                        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-biela-elements-button-secondary-background',
                        'text-biela-elements-button-secondary-text',
                        'flex items-center gap-[10px]',
                      )}
                    >
                      <img src="/chat-mode.svg" alt="chat" />
                      <p>
                        Ask <span className={'color-[#86F49C]'}>BIELA</span>
                      </p>
                    </button>
                    <button
                      onClick={clearAlert}
                      className={classNames(
                        `px-3 py-[10px] rounded-lg text-sm font-light bg-[#181818] border border-[#2E2E2E]`,
                        'hover:bg-biela-elements-button-secondary-backgroundHover',
                        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-biela-elements-button-secondary-background',
                        'text-biela-elements-button-secondary-text',
                        'flex items-center gap-[10px]',
                      )}
                    >
                      <div className={'flex items-center gap-[10px] relative z-2 font-light'}>
                        <FiSrCross />
                        Dismiss
                      </div>
                    </button>
                    <WithTooltip tooltip={`${errorDetails ? 'Hide Error Details' : 'Error Details'}`}>
                      <button
                        onClick={()=>{
                          setErrorDetails(!errorDetails)
                        }}
                        className="p-[4px] border rounded-full border-[#2E2E2E] flex items-center"
                        data-state="closed"
                        style={{ backgroundImage: 'linear-gradient(rgb(1, 1, 1) 57.32%, rgb(22, 22, 22) 100%)' }}
                      >
                        <p
                          className={
                            `${errorDetails ? 'i-ph:caret-down' : 'i-ph:caret-up'} min-w-[14px] min-h-[14px] bg-white`
                          }
                        ></p>
                      </button>
                    </WithTooltip>

                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
