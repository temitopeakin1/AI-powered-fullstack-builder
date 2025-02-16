import { useState } from 'react';
import WandIcon from '../../../assets/icons/wand-green.svg';
import ChooseTechModal from './ChooseTechModal';

export default function HelpChooseButton() {
  const [isChooseTechOpen, setIsChooseTechOpen] = useState(false);

  const openChooseTechModal = () => {
    setIsChooseTechOpen(true);
  };

  const closeChooseTechModal = () => {
    setIsChooseTechOpen(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={openChooseTechModal}
        className="w-[432px] h-[41px] rounded-[500px] border border-[#777777] px-6 py-3 gap-[8px] bg-transparent text-[#86F49C] text-center text-sm flex items-center justify-center mt-4"
      >
        <img src={WandIcon} alt="Choose" />
        Help me To Choose
      </button>
      {isChooseTechOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <ChooseTechModal closeModal={closeChooseTechModal} />
        </div>
      )}
    </div>
  );
}
