import { AddDatabaseButtonProps } from '~/backOffice/types/project';

export default function AddDatabaseButton({ openModal }: AddDatabaseButtonProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={openModal}
        className="w-[456px] h-[41px] rounded-[500px] border border-[#777777] px-6 py-3 gap-[8px] bg-transparent text-white text-center text-sm flex items-center justify-center mt-1.5 md:mt-1.6"
      >
        <img src="/icons/pluswhite.svg" alt="Add" />
        Add Database
      </button>
    </div>
  );
}
