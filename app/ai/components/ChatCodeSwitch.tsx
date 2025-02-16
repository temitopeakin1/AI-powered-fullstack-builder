import { useStore } from '@nanostores/react';
import { memo } from 'react';
import { chatStore, setChatMode } from '~/ai/lib/stores/chat';
import { ChatCodeSlider, type ChatCodeSliderOptions } from '~/ai/components/ChatCodeSlider';

const modeOptions: ChatCodeSliderOptions<'chat' | 'code'> = {
  left: {
    value: 'chat',
    text: 'Chat',
  },
  right: {
    value: 'code',
    text: 'Code',
  },
};

export const ChatCodeSwitch = memo(() => {
  const mode = useStore(chatStore).mode;

  return <ChatCodeSlider selected={mode} options={modeOptions} setChatCodeSelected={(mode) => setChatMode(mode)} />;
});
