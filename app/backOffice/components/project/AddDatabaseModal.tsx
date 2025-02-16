import DbSelector from '~/backOffice/components/project/dbSelector';
import CreateProjectButton from './CreateProjectButton';
import CloseButton from '../../../components/common/closeButton';
import { AddDatabaseProps } from '~/backOffice/types/project';

export default function AddDatabase({ closeModal }: AddDatabaseProps) {
  return (
    <div className="fixed inset-0  bg-black flex items-center justify-center z-70">
      <div className="w-[488px] h-[404px] bg-black bg-[linear-gradient(0deg,_rgba(0,_0,_0,_0.048)_0%,_rgba(31,_31,_31,_0.8)_100%)] border border-[#2E2E2E] border-image-slice-1 backdrop-[blur(50px)] rounded-[8px] py-3 md:py-6 px-4 relative backdrop-blur-50">
        <div className="flex justify-between items-center -mt-1 -md:mt-2 ">
          <div className="flex flex-col gap-1">
            <span className="font-inter text-lg text-white font-medium leading-relaxed">Add Database</span>
            <h3 className="font-inter text-xs font-normal text-[#777777] leading-relaxed">Give a subtitle</h3>
          </div>

          <CloseButton closeModal={closeModal} />
        </div>
        <DbSelector />
        <CreateProjectButton />
      </div>
    </div>
  );
}
