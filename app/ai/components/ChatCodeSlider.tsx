// ChatCodeSlider.tsx
import { motion } from 'framer-motion';
import { memo } from 'react';
import { classNames } from '~/utils/classNames';
import { cubicEasingFn } from '~/utils/easings';
import { genericMemo } from '~/utils/react';
import Comment from '~/assets/icons/comment';
import Code from '~/assets/icons/code';

interface ChatCodeSliderOption<T> {
  value: T;
  text: string;
}

export interface ChatCodeSliderOptions<T> {
  left: ChatCodeSliderOption<T>;
  right: ChatCodeSliderOption<T>;
}

interface ChatCodeSliderProps<T> {
  selected: T;
  options: ChatCodeSliderOptions<T>;
  setChatCodeSelected?: (selected: T) => void;
}

export const ChatCodeSlider = genericMemo(<T,>({
                                                 selected,
                                                 options,
                                                 setChatCodeSelected,
                                               }: ChatCodeSliderProps<T>) => {
  const isLeftSelected = selected === options.left.value;

  return (
    <div className="flex items-center gap-2 border border-[#2E2E2E] rounded-full p-1 overflow-hidden">
      <ChatCodeSliderButton
        variant="chat" // specify that this button is for chat mode
        selected={isLeftSelected}
        setChatCodeSelected={() => setChatCodeSelected?.(options.left.value)}
      >
        <div className="flex items-center gap-2">
          <Comment color={isLeftSelected ? '#010101' : '#800080'} />
          <span className="text-sm font-light">{options.left.text}</span>
        </div>
      </ChatCodeSliderButton>
      <ChatCodeSliderButton
        variant="code"
        selected={!isLeftSelected}
        setChatCodeSelected={() => setChatCodeSelected?.(options.right.value)}
      >
        <div className="flex items-center gap-2">
          <Code color={!isLeftSelected ? '#010101' : '#86F49C'} />
          <span className="text-sm font-light">{options.right.text}</span>
        </div>
      </ChatCodeSliderButton>
    </div>
  );
});

interface ChatCodeSliderButtonProps {
  selected: boolean;
  variant: 'chat' | 'code';
  children: JSX.Element;
  setChatCodeSelected: () => void;
}

const ChatCodeSliderButton = memo(({
                                     selected,
                                     variant,
                                     children,
                                     setChatCodeSelected,
                                   }: ChatCodeSliderButtonProps) => {
  const baseClasses = 'text-sm px-2.5 py-0.5 rounded-full relative';
  // Use purple (#800080) for chat when selected; keep green (#86F49C) for code.
  const selectedClasses =
    variant === 'chat'
      ? 'text-[#010101] bg-[#800080]'
      : 'text-[#010101] bg-[#86F49C]';
  const notSelectedClasses = 'text-biela-elements-item-contentActive bg-transparent';

  return (
    <button
      onClick={setChatCodeSelected}
      className={classNames(
        baseClasses,
        selected ? selectedClasses : notSelectedClasses
      )}
    >
      <span className="relative z-10 flex gap-2">{children}</span>
      {selected && (
        <motion.span
          layoutId="pill-tab-chat-code"
          transition={{ duration: 0.2, ease: cubicEasingFn }}
          className="absolute inset-0 z-0 rounded-full"
          style={{ backgroundColor: variant === 'chat' ? '#800080' : '#86F49C' }}
        ></motion.span>
      )}
    </button>
  );
});
