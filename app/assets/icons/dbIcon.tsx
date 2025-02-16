interface DbIconProps {
  name: string;
  icon: string;
  isSelected: boolean;
  onSelect: (name: string) => void;
}

export function DbIcon({ name, icon, isSelected, onSelect }: DbIconProps) {
  return (
    <div className={`flex flex-col items-center mt-2 md:mt-4 gap-2 cursor-pointer`} onClick={() => onSelect(name)}>
      <div
        className={`w-[212px] h-[80px] border border-none rounded-[8px] ${
          isSelected ? 'bg-[#1E1E1E] border-1 border-solid border-[#86F49C]' : 'bg-[#1E1E1E]'
        } flex flex-col items-center relative transition-colors duration-200`}
      >
        <div className="flex items-center justify-center h-[40px] mt-3">
          <img src={icon} alt={name} className="max-h-full" />
        </div>
        <span className="absolute text-xs text-white font-inter font-normal bottom-3 ">{name}</span>
      </div>
    </div>
  );
}
