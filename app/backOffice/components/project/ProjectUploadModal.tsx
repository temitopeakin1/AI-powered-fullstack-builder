import { useState } from 'react';
import { Form } from '@remix-run/react';
import CloseButton from '../../../components/common/closeButton';
import AddFilesButton from './AddFilesButton';
import UploadProjectButton from './UploadProjectButton';
import { ProjectUploadProps } from '~/backOffice/types/project';
import type { Message } from 'ai';

export default function ProjectUpload({ closeModal }: ProjectUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files);
  };

  const handleUploadProjectClick = (messages: Message[]) => {};

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-[5px] z-50">
      <div className="w-[488px] h-auto bg-black bg-[linear-gradient(0deg,_rgba(0,_0,_0,_0.048)_0%,_rgba(31,_31,_31,_0.8)_100%)] border border-[#2E2E2E] border-image-slice-1] rounded-[8px] pt-6 px-4 py-3 md:py-6 px-4">
        <div className="flex justify-between items-center -mt-1 -md:mt-2 ">
          <div className="flex flex-col gap-1">
            <span className="font-inter text-lg text-white font-medium leading-relaxed">Upload Project</span>
            <h3 className="text-xs text-[#777777] leading-relaxed">Give a subtitle</h3>
          </div>
          <CloseButton closeModal={closeModal} />
        </div>

        <div className="flex flex-col items-center mt-1 gap-4">
          <Form method="post" action="post" className="flex flex-col gap-3 items-center rounded-[8px] p-3 ">
            <div className="relative w-[456px] h-[73px]">
              <label
                htmlFor="title"
                className="absolute left-4 top-4.5 transform -translate-y-1/2 text-[#777777] text-xs transition-all duration-300 ease-in-out group-focus-within:text-white group-focus-within:top-2 group-focus-within:text-[12px]"
              >
                Select
              </label>
              <input
                type="text"
                name="title"
                id="title"
                placeholder="Give a title"
                className="w-full h-full bg-transparent font-inter text-white placeholder-white bg-[linear-gradient(0deg,_rgba(0,_0,_0,_0.048)_0%,_rgba(31,_31,_31,_0.8)_100%)] border border-[#2E2E2E] border-image-slice-1 backdrop-[blur(50px)] rounded-md focus:outline-none px-4 text-base pt-5 group"
              />
            </div>
          </Form>
        </div>

        <div className="mb-2.5 -mt-.5">
          <AddFilesButton onFileSelect={handleFileSelect} />
        </div>
        <UploadProjectButton handleUploadProjectClick={handleUploadProjectClick} />
      </div>
    </div>
  );
}
