import { motion } from 'framer-motion';
import { classNames } from '~/utils/classNames';
import { cubicEasingFn } from '~/utils/easings';
import { genericMemo } from '~/utils/react';

interface ChatCodeSliderProps<T> {
  selected: T;
  options: T[];
  onChange?: (selected: T) => void;
  renderOption?: (option: T) => JSX.Element;
}

export const Switch = genericMemo(<T,>({ selected, options, onChange, renderOption }: ChatCodeSliderProps<T>) => {
  const isLeftSelected = selected === options[0];

  return (
    <div className="flex items-center gap-2 border border-[#2E2E2E] rounded-full p-1 overflow-hidden">
      <Option selected={isLeftSelected} onClick={() => onChange?.(options[0])}>
        <div className="flex items-center gap-2">
          {renderOption?.(options[0])}
        </div>
      </Option>
      <Option selected={!isLeftSelected} onClick={() => onChange?.(options[1])}>
        <div className="flex items-center gap-2">
          {renderOption?.(options[1])}
        </div>
      </Option>
    </div>
  );
});

type OptionProps = {
  selected: boolean;
  children: JSX.Element;
  onClick: () => void;
};

const Option = ({ selected, children, onClick }: OptionProps) => {
  return (
    <button
      onClick={onClick}
      className={classNames(
        'text-sm px-2.5 py-0.5 rounded-full relative',
        selected ? 'text-[#010101] bg-[#86F49C]' : 'text-[#D5D5D5] bg-transparent',
      )}
    >
      <span className="relative z-10 flex gap-2">{children}</span>
      {selected && (
        <motion.span
          layoutId="pill-tab-chat-code"
          transition={{ duration: 0.2, ease: cubicEasingFn }}
          className="absolute inset-0 z-0 bg-[#86F49C] rounded-full"
        ></motion.span>
      )}
    </button>
  );
};
