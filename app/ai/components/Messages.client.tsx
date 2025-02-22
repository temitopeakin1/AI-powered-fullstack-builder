import type { Message } from 'ai';
import React, { Fragment, useEffect, useState } from 'react';
import { classNames } from '~/utils/classNames';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';
import { useLocation } from '@remix-run/react';
import { toast } from 'react-toastify';
import '../../components/styles/index.scss?url';
import WithTooltip from '~/ai/components/Tooltip';
import userImg from '/images/user.png';
import { Copy } from 'lucide-react';
import copy from 'copy-to-clipboard';
import ScrollToBottom from 'react-scroll-to-bottom';
import ConfirmationDialog, { DialogConfirmationType } from '~/ai/components/ConfirmationDialog';
import { chatStore, setCheckingList, setCleaningProject } from '~/ai/lib/stores/chat';
import { useStore } from '@nanostores/react';

interface MessagesProps {
  id?: string;
  className?: string;
  isStreaming?: boolean;
  messages?: Message[];
  isTyping?: boolean;
}

export const Messages = React.forwardRef<HTMLDivElement, MessagesProps>((props: MessagesProps, ref) => {
  const { id, isStreaming = false, messages = [] } = props;
  const location = useLocation();
  const { checkingList, cleaningProject } = useStore(chatStore);

  const handleRewind = (messageId: string) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('rewindTo', messageId);
    window.location.search = searchParams.toString();
  };

  const [dialogContent, setDialogContent] = useState<{
    type: DialogConfirmationType.ROLLBACK;
    item: { description: string; id: string };
  } | null>(null);

  const handleRewindClick = (event: React.UIEvent, messageId: string) => {
    event.preventDefault();
    setDialogContent({ type: DialogConfirmationType.ROLLBACK, item: { description: 'this message', id: messageId } });
  };

  const closeDialog = () => {
    setDialogContent(null);
  };

  useEffect(() => {
    if (checkingList && !isStreaming) {
      setCheckingList(false);
    }

    if (cleaningProject && !isStreaming) {
      setCleaningProject(false);
    }
  }, [isStreaming]);

  // Iterate over the data array and calculate total tokens
  if (messages.length && !isStreaming) {
    messages.forEach((item) => {
      (item.annotations as Array<{ value: { processed: boolean; totalTokens: number } }>)?.forEach((annotation) => {
        if (!annotation.value?.processed && annotation.value?.totalTokens) {
          annotation.value.processed = true;
        }
      });
    });
  }

  return (
    <div id={id} ref={ref} className={classNames(props.className, 'flex flex-col', 'overflow-y-auto')}>
      <ScrollToBottom initialScrollBehavior={'smooth'} className={'flex-1 flex-messages'}>
        {messages.length > 0
          ? messages.map((message, index) => {
              const { role, content, id: messageId, annotations, data } = message;
              const isUserMessage = role === 'user';
              const isHidden = annotations?.includes('hidden');

              if (isHidden) {
                return <Fragment key={index} />;
              }

              return (
                <div key={index} className={classNames('flex gap-4 w-full rounded-[calc(0.75rem-1px)] bg-chat-biela')}>
                  <div className={`special-bg ${isUserMessage ? 'user-message' : ''}`}>
                    {isUserMessage && !(data as { hideUserImage?: boolean })?.hideUserImage && (
                      <div className="flex items-center justify-center w-[34px] h-[34px] overflow-hidden bg-white text-gray-600 rounded-full shrink-0 self-start">
                        <img
                          className="bg-[#BEDDFF] w-[48px] h-[48px] rounded-full cursor-pointer h-auto"
                          src={userImg}
                          alt="User"
                        />
                      </div>
                    )}
                    <div className="grid grid-col-1 w-full relative">
                      {isUserMessage ? (
                        <UserMessage
                          content={
                            Array.isArray(content)
                              ? content.map((item) =>
                                  item.type === 'text'
                                    ? { ...item, text: item.text.replace('Current Message:\n\n', '') }
                                    : item,
                                )
                              : []
                          }
                        />
                      ) : (
                        <AssistantMessage content={content} annotations={message.annotations} />
                      )}
                      {/* Green light for dynamic pulse */}
                      {!isUserMessage && index === messages.length - 1 && (
                        <div className={classNames('green-light', isStreaming ? 'pulsing' : '', 'absolute')}></div>
                      )}
                    </div>

                    <div className="absolute-config-btn flex items-center gap-2">
                      {messageId && (
                        <WithTooltip tooltip="Copy this message">
                          <button
                            onClick={() => {
                              const MessageContent = Array.isArray(content)
                                ? content
                                    .filter((item) => item.type === 'text')
                                    .map((item) => item.text)
                                    .join('\n\n')
                                : content;

                              const Message = MessageContent.replace(
                                /<div class="__bielaArtifact__"[^>]*><\/div>/g,
                                '',
                              );

                              // When copying user's messages, remove Model, Provider and "Current Message"
                              const FinalMessage = Message.replace(/^[\s\S]*?Current Message:\s*\n\s*\n/, '');

                              const copySuccess = copy(FinalMessage);

                              if (copySuccess) {
                                toast.success('Copied to clipboard');
                              } else {
                                toast.error('Failed to copy to clipboard');
                              }
                            }}
                            key="i-ph:arrow-u-up-left"
                            className={'configuration-btn'}
                          >
                            <Copy size={10} color="#fff" />
                            <span>Copy</span>
                          </button>
                        </WithTooltip>
                      )}
                      {!isUserMessage && messageId && (
                        <WithTooltip tooltip="Revert to this message">
                          <button
                            onClick={(event) => handleRewindClick(event, messageId)}
                            key="i-ph:arrow-u-up-left"
                            className={'configuration-btn'}
                          >
                            <img src="/icons/arrow-left.svg" alt="Rollback" />
                            <span>Rollback</span>
                          </button>
                        </WithTooltip>
                      )}

                      {!isUserMessage && messageId && (
                        <WithTooltip tooltip="Report Issue">
                          <button className={'configuration-btn'}>
                            <img src="/icons/bug.svg" alt="Report Issue" />
                            <span>Report Issue</span>
                          </button>
                        </WithTooltip>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          : null}
        {isStreaming && (
          <div className="text-center w-full text-biela-elements-textSecondary i-svg-spinners:3-dots-fade text-4xl mt-4"></div>
        )}
      </ScrollToBottom>
      <ConfirmationDialog
        isOpen={dialogContent !== null}
        type={dialogContent?.type ?? DialogConfirmationType.ROLLBACK}
        description={dialogContent?.item.description ?? ''}
        onConfirm={() => {
          if (dialogContent?.type === DialogConfirmationType.ROLLBACK) {
            handleRewind(dialogContent.item.id);
          }

          closeDialog();
        }}
        onCancel={closeDialog}
      />
    </div>
  );
});
