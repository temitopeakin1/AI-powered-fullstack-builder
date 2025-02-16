import { useState } from 'react';
import { techStacks } from '~/utils/techData';
import { TechSelector } from './techSelector';
import HelpChooseButton from './ChooseButton';

export default function StackSelector() {
  const [selectedTech, setSelectedTech] = useState<string | null>(techStacks?.length > 0 ? techStacks[0]?.name : null);

  const handleTechSelect = (techName: string) => {
    setSelectedTech(techName);
  };

  return (
    <div
      className="w-[456px] h-[234px] border border-[#2E2E2E] rounded-[8px] py-4 px-4 -mt-2 -md:mt-4 relative backdrop-blur-md
"
    >
      <div className="text-center text-white font-inter text-base font-normal pb-2 md:pb-6">Select technologies</div>
      <div className="flex flex-row justify-center gap-2 mt-1">
        {techStacks.map((tech) => (
          <TechSelector
            key={tech.name}
            name={tech.name}
            icon={tech.icon}
            repository={tech.repository}
            isSelected={selectedTech === tech.name}
            onSelect={handleTechSelect}
          />
        ))}
      </div>
      <HelpChooseButton />
    </div>
  );
}
