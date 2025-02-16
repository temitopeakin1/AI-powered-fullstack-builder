import { CheckboxProps } from '~/components/types/componentTypes';

export function Checkbox({ checked, onChange, className = '' }: CheckboxProps) {
  return (
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={`
            appearance-none
            w-5 h-5
            border border-white
            rounded-full
            checked:bg-[#86F49C]
            checked:border-[#86F49C]
            transition-colors
            relative
            ${className}
          `}
      />
      {checked && (
        <svg
          className="absolute top-3 left-[11px] -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-[#010101]"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 3L4.5 8.5L2 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
