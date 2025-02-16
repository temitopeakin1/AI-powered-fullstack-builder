import { useStore } from '@nanostores/react';
import useViewport from '~/ai/lib/hooks';
import { chatStore } from '~/ai/lib/stores/chat';
import { workbenchStore } from '~/ai/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { ButtonProps } from '~/components/types/componentTypes';

export function HeaderActionButtons({}: {}) {
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  const { showChat } = useStore(chatStore);
  const isSmallViewport = useViewport(1024);
  const canHideChat = showWorkbench || !showChat;

  return (
    <div className="flex items-center">
      <div className="flex border border-biela-elements-borderColor rounded-md overflow-hidden ml-4">
        <Button
          active={showChat}
          disabled={!canHideChat || isSmallViewport}
          onClick={() => {
            if (canHideChat) {
              chatStore.setKey('showChat', !showChat);
            }
          }}
        >
          <div className="i-biela:chat text-sm" />
        </Button>
        <div className="w-[1px] bg-biela-elements-borderColor" />

        <Button
          active={showWorkbench}
          onClick={() => {
            if (showWorkbench && !showChat) {
              chatStore.setKey('showChat', true);
            }

            workbenchStore.showWorkbench.set(!showWorkbench);
          }}
        >
          <div className="i-ph:code-bold" />
        </Button>
      </div>
    </div>
  );
}

function Button({ active = false, disabled = false, children, onClick }: ButtonProps) {
  return (
    <button
      className={classNames('flex items-center p-1.5', {
        'bg-biela-elements-item-backgroundDefault hover:bg-biela-elements-item-backgroundActive text-biela-elements-textTertiary hover:text-biela-elements-textPrimary':
          !active && !disabled,
        'bg-biela-elements-item-backgroundAccent text-biela-elements-item-contentAccent': active && !disabled,
        'bg-biela-elements-item-backgroundDefault text-alpha-gray-20 dark:text-alpha-white-20 cursor-not-allowed':
          disabled,
      })}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
