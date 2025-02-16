import { useState } from 'react';
import { DbIcon } from '~/assets/icons/dbIcon';
import { databaseTypes } from '../../types/dbData';
import HelpChooseButton from './ChooseButton';

export default function DbSelector() {
  const [selectedDb, setSelectedDb] = useState<string | null>(null);

  const handleDbSelect = (dbName: string) => {
    setSelectedDb((prev) => (prev === dbName ? null : dbName));
  };

  return (
    <div
      className=" w-[456px] h-[234px] bg-[linear-gradient(0deg,_rgba(0,_0,_0,_0.048)_0%,_rgba(31,_31,_31,_0.8)_100%)] border border-[#2E2E2E] border-image-slice-1 backdrop-[blur(50px)] rounded-[8px] pt-6 px-4 relative backdrop-blur-50 mt-3
"
    >
      <div className="flex items-center justify-center text-white font-inter text-base font-normal -mt-3">
        Select database
      </div>
      <div className="flex items-center justify-center text-xs text-[#777777] leading-relaxed mb-2">
        You can only choose 1
      </div>
      <div className="flex flex-row items-center justify-center gap-2">
        {databaseTypes.map((database) => (
          <DbIcon
            key={database.name}
            name={database.name}
            icon={database.icon}
            isSelected={selectedDb === database.name}
            onSelect={handleDbSelect}
          />
        ))}
      </div>
      <HelpChooseButton />
    </div>
  );
}
