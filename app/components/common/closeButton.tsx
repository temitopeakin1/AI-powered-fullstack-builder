import { CloseButtonProps } from '~/components/types/componentTypes';
import React from 'react';

const CloseButton: React.FC<CloseButtonProps> = ({ closeModal }) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        closeModal();
      }}
      className="w-[48px] h-[48px] flex items-center justify-center bg-transparent border border-[#2E2E2E] rounded-full cursor-pointer"
    >
      <button className="flex items-center justify-center bg-transparent">
        <img src="/close.svg" alt="Close" />
      </button>
    </div>
  );
};

export default CloseButton;
