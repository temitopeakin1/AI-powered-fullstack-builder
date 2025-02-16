import { motion } from 'framer-motion';
import React, { memo } from 'react';
import { classNames } from '~/utils/classNames';
import { cubicEasingFn } from '~/utils/easings';
import { genericMemo } from '~/utils/react';

interface SliderOption<T> {
  value: T;
  text: string;
}

export interface SliderOptions<T> {
  left: SliderOption<T>;
  right: SliderOption<T>;
}

interface SliderProps<T> {
  selected: T;
  options: SliderOptions<T>;
  setSelected?: (selected: T) => void;
}

export const Slider = genericMemo(<T,>({ selected, options, setSelected }: SliderProps<T>) => {
  const isLeftSelected = selected === options.left.value;

  return (
    <div className="code-preview-slider flex items-center flex-wrap shrink-0 gap-1 bg-biela-elements-background-depth-1 overflow-hidden rounded-full p-1">
      <SliderButton className="d-flex" selected={isLeftSelected} setSelected={() => setSelected?.(options.left.value)}>
        <img src="/icons/code-simple.svg" alt="Code" />
        {options.left.text}
      </SliderButton>
      <SliderButton selected={!isLeftSelected} setSelected={() => setSelected?.(options.right.value)}>
        <img src="/icons/eye.svg" alt="Eye" />
        {options.right.text}
      </SliderButton>
    </div>
  );
});

interface SliderButtonProps {
  selected: boolean;
  children: string | JSX.Element | Array<JSX.Element | string>;
  setSelected: () => void;
}

const SliderButton = memo(({ selected, children, setSelected }: SliderButtonProps) => {
  return (
    <button
      onClick={setSelected}
      className={classNames(
        'bg-transparent text-sm px-2.5 py-0.5 rounded-full relative',
        selected
          ? 'text-biela-elements-item-contentAccent'
          : 'text-biela-elements-item-contentDefault hover:text-biela-elements-item-contentActive',
      )}
    >
      <span className="relative z-10 font-light" style={{ display: 'flex', gap: '8px' }}>
        {children}
      </span>
      {selected && (
        <motion.span
          layoutId="pill-tab"
          transition={{ duration: 0.2, ease: cubicEasingFn }}
          className="absolute inset-0 z-0 bg-biela-elements-item-backgroundAccent rounded-full"
        ></motion.span>
      )}
    </button>
  );
});
