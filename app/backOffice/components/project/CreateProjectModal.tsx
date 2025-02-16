import FormProject from '~/backOffice/components/project/formProject';
import CloseButton from '../../../components/common/closeButton';
import { CreateProjectProps } from '~/backOffice/types/project';

export default function CreateProject({ closeModal }: CreateProjectProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="w-[488px] h-[546px] bg-black bg-[linear-gradient(0deg,_rgba(0,_0,_0,_0.048)_0%,_rgba(31,_31,_31,_0.8)_100%)] border border-[#2E2E2E] border-image-slice-1 backdrop-[blur(50px)] rounded-[8px] py-3 md:py-6 px-4 relative">
        <div className="flex justify-between items-center mb-1">
          <div className="flex flex-col gap-1">
            <span className="font-inter text-lg text-white font-medium leading-relaxed">Create a new project</span>
            <h3 className="text-xs text-[#777777] leading-relaxed">Give a subtitle</h3>
          </div>

          <CloseButton closeModal={closeModal} />
        </div>
        <FormProject />
      </div>
    </div>
  );
}
