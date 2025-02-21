import React from 'react';
import CopyIcon from '~/assets/icons/copyIcon.svg';
import { toast } from 'react-toastify';

interface InputInterface<T> {
  disabled?: boolean;
  value: T | string;
  label: string;
  copyValue?: boolean;
  required?: boolean;
}

export default function Input<T>({
  disabled = false,
  value,
  label,
  copyValue = false,
  required = false,
}: InputInterface<T>) {
  const handleCopy = async () => {
    if (typeof value === 'string') {
      await navigator.clipboard.writeText(value).then(() => toast.success('Copied to clipboard'));
    }
  };

  return (
    <div className="flex flex-col space-y-1">
      <label
        htmlFor={label}
        className="text-[12px] text-[#BBB] mb-[4px]"
        style={{
          fontFamily: 'Inter',
        }}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative flex items-center">
        {disabled ? (
          <div
            className="w-full rounded-lg border p-[12px] text-[12px] text-white max-h-[40px]"
            style={{
              background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.05) 0%, rgba(31, 31, 31, 0.80) 51.22%)',
              borderColor: 'rgba(255, 255, 255, 0.19)',
              fontFamily: 'Inter',
            }}
          >
            {String(value)}
          </div>
        ) : (
          <input
            id={label}
            type="text"
            value={String(value)}
            readOnly
            required={required}
            className="w-full rounded-lg border p-[12px] text-[12px] max-h-[40px]"
            style={{
              background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.05) 0%, rgba(31, 31, 31, 0.80) 51.22%)',
              borderColor: 'rgba(255, 255, 255, 0.19)',
              fontFamily: "'Inter', sans-serif",
            }}
          />
        )}
        {copyValue && (
          <button
            type="button"
            onClick={handleCopy}
            className="absolute right-3 flex items-center justify-center rounded bg-transparent"
          >
            <img src={CopyIcon} alt={'Copy'} width={16} height={16} />
          </button>
        )}
      </div>
    </div>
  );
}
