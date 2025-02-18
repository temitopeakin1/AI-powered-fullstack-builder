import React, { useState, useEffect, useRef } from 'react';
import type { Message } from 'ai';
import { toast } from 'react-toastify';
import { isBinaryFile, MAX_FILES, shouldIncludeFile } from '~/utils/fileUtils';
import { createChatFromFolder } from '~/utils/folderImport';
import { logStore } from '~/ai/lib/stores/logs'; // Assuming logStore is imported from this location


// interface ImportFolderButtonProps {
//   projectName?: string;
// }

// export const ImportFolderButton: React.FC<ImportFolderButtonProps> = ({ projectName }) => {
//   console.log("PROJECT NAME:", projectName); // Should log "Hello World"

//   return <div>{projectName}</div>;
// };

interface ImportFolderButtonProps {
  className?: string;
  importChat?: (description: string, messages: Message[]) => Promise<void>;
  // getProjectName: () => string;
  projectNameRef?: string;
}

export const ImportFolderButton: React.FC<ImportFolderButtonProps> = ({ className, importChat, projectNameRef }) => {
  const [isLoading, setIsLoading] = useState(false);

  // const projectNameRef = getProjectName();

  // console.log("PROJECT NAME UPDATED:", getProjectName());
  console.log("PROJECT NAME : " + projectNameRef)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const allFiles = Array.from(e.target.files || []);

    const filteredFiles = allFiles.filter((file) => {
      const path = file.webkitRelativePath.split('/').slice(1).join('/');
      const include = shouldIncludeFile(path);

      return include;
    });

    if (filteredFiles.length === 0) {
      const error = new Error('No valid files found');
      logStore.logError('File import failed - no valid files', error, { folderName: 'Unknown Folder' });
      toast.error('No files found in the selected folder');

      return;
    }

    if (filteredFiles.length > MAX_FILES) {
      const error = new Error(`Too many files: ${filteredFiles.length}`);
      logStore.logError('File import failed - too many files', error, {
        fileCount: filteredFiles.length,
        maxFiles: MAX_FILES,
      });
      toast.error(
        `This folder contains ${filteredFiles.length.toLocaleString()} files. This product is not yet optimized for very large projects. Please select a folder with fewer than ${MAX_FILES.toLocaleString()} files.`,
      );

      return;
    }

    const folderName = filteredFiles[0]?.webkitRelativePath.split('/')[0] || 'Unknown Folder';
    setIsLoading(true);

    const loadingToast = toast.loading(`Importing ${folderName}...`);

    try {
      const fileChecks = await Promise.all(
        filteredFiles.map(async (file) => ({
          file,
          isBinary: await isBinaryFile(file),
        })),
      );

      const textFiles = fileChecks.filter((f) => !f.isBinary).map((f) => f.file);
      const binaryFilePaths = fileChecks
        .filter((f) => f.isBinary)
        .map((f) => f.file.webkitRelativePath.split('/').slice(1).join('/'));

      if (textFiles.length === 0) {
        const error = new Error('No text files found');
        logStore.logError('File import failed - no text files', error, { folderName });
        toast.error('No text files found in the selected folder');

        return;
      }

      if (binaryFilePaths.length > 0) {
        logStore.logWarning(`Skipping binary files during import`, {
          folderName,
          binaryCount: binaryFilePaths.length,
        });
        toast.info(`Skipping ${binaryFilePaths.length} binary files`);
      }

      const messages = await createChatFromFolder(textFiles, binaryFilePaths, folderName);

      if (importChat) {
        console.log("IMPORT CHAT")
        let projectDescription = folderName;
        if( projectNameRef != ""){
          projectDescription = projectNameRef || "";
        }
        console.log("IMPORT - PROJECT NAME ", projectNameRef);

        console.log("PROJECT DESC " + projectDescription)
        
        await importChat(projectDescription, [...messages]);
      }

      logStore.logSystem('Folder imported successfully', {
        folderName,
        textFileCount: textFiles.length,
        binaryFileCount: binaryFilePaths.length,
      });
    } catch (error) {
      logStore.logError('Failed to import folder', error, { folderName });
      console.error('Failed to import folder:', error);
      toast.error('Failed to import folder');
    } finally {
      setIsLoading(false);
      toast.dismiss(loadingToast);
      e.target.value = ''; // Reset file input
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        id="folder-import"
        className="hidden"
        webkitdirectory=""
        directory=""
        onChange={handleFileChange}
        {...({} as any)}
      />
      <button
        onClick={() => {
          // const input = document.getElementById('folder-import');
          inputRef.current?.click();
        }}
        className={className}
        disabled={isLoading}
      >
        <div className="i-ph:upload-simple" />
        {isLoading ? 'Importing...' : 'Import Folder'}
        {projectNameRef}
      </button>
    </>
  );
};