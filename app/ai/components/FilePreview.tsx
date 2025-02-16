import React from 'react';

interface FilePreviewProps {
  files: File[];
  imageDataList: string[];
  onRemove: (index: number) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ files, imageDataList, onRemove }) => {
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-row overflow-x-auto -mt-2">
      {files.map((file, index) => (
        <div key={file.name + file.size} className="mr-2 relative">
          {imageDataList[index] && (
            <div className="relative p-0 mx-6 mt-6">
              <div className="rounded-xl h-16 w-16">
                <img src={imageDataList[index]} alt={file.name} className="h-full w-full rounded-xl object-cover" />
              </div>
              <button
                onClick={() => onRemove(index)}
                className="absolute -top-1 -right-1.5 z-10 bg-gray-200 rounded-full border border-transparent w-5 h-5 shadow-md hover:bg-white transition-colors flex items-center justify-center"
              >
                <div className="i-ph:x w-4 h-4 text-black" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FilePreview;
