// can be deleted

import { useState } from 'react';
import UploadImage from '../../../assets/icons/upload-white.svg';
import { AddFilesButtonProps } from '~/backOffice/types/project';

export default function AddFilesButton({ onFileSelect }: AddFilesButtonProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.multiple = true;
    // input.webkitdirectory = true;

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const newFiles = Array.from(files);
        setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
        onFileSelect(files);
      }
    };

    input.click();
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
    onFileSelect(new FileList());
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={handleFileUpload}
        className="w-[456px] h-[41px] rounded-[500px] border border-[#777777] px-6 py-3 gap-[8px] bg-transparent text-white text-center text-sm flex items-center justify-center mt-4"
      >
        <img src={UploadImage} alt="Add" />
        Add Files
      </button>

      {selectedFiles.length > 0 && (
        <div
          className="w-full flex flex-row flex-wrap justify-start items-start
         text-sm text-white"
        >
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex justify-between space-x-1 p-2 m-2 rounded-full bg-[#777777]">
              <span className="text-white text-sm">{file.name}</span>
              <button type="button" onClick={() => handleRemoveFile(file)} className="text-white bg-transparent">
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
