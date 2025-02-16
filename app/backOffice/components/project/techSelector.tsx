import { TechIconProps } from '~/backOffice/types/project';

export function TechSelector({ name, icon, repository, isSelected, onSelect }: TechIconProps) {
  return (
    <label
      className="flex flex-col items-center mt-2 md:mt-4 gap-2 cursor-pointer"
      onClick={(e) => {
        if (e.target instanceof HTMLInputElement) {
          return;
        }
        onSelect(name);
      }}
    >
      <input
        type="radio"
        name="url"
        value={repository}
        className="hidden"
        onClick={(e) => e.stopPropagation()}
        checked={isSelected}
        readOnly
      />
      <div
        className={`w-[80px] h-[80px] border border-none rounded-[8px] ${
          isSelected ? 'bg-[#1E1E1E] border-1 border-solid border-[#86F49C]' : 'bg-[#1E1E1E]'
        } flex flex-col items-center relative transition-colors duration-200`}
      >
        <div className="flex items-center justify-center h-[40px] mt-3">
          <img src={icon} alt={name} className="max-h-full" />
        </div>
        <span className="absolute text-xs text-white font-inter font-normal bottom-3 ">{name}</span>
      </div>
    </label>
  );
}
