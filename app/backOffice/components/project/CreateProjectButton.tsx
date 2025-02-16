import { CreateProjectButtonProps } from '~/backOffice/types/project';

export default function CreateProjectButton({ onClick }: CreateProjectButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[458px] h-[41px] rounded-[500px] border border-[#2E2E2E] px-6 py-3 gap-[10px] bg-[#86F49C] text-[#010101] text-sm flex items-center justify-center mt-3"
    >
      Create a New Project
    </button>
  );
}
