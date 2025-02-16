import { memo, type ReactNode, useEffect, useMemo, useState } from 'react';
import type { FileMap } from '~/ai/lib/stores/files';
import { classNames } from '~/utils/classNames';
import { createScopedLogger, renderLogger } from '~/utils/logger';
import * as ContextMenu from '@radix-ui/react-context-menu';

const logger = createScopedLogger('FileTree');

const NODE_PADDING_LEFT = 8;
const DEFAULT_HIDDEN_FILES = [/\/node_modules\//, /\/\.next/, /\/\.astro/];

interface Props {
  files?: FileMap;
  selectedFile?: string;
  onFileSelect?: (filePath: string) => void;
  rootFolder?: string;
  hideRoot?: boolean;
  collapsed?: boolean;
  allowFolderSelection?: boolean;
  hiddenFiles?: Array<string | RegExp>;
  unsavedFiles?: Set<string>;
  className?: string;
  onFilesChange?: (files: FileMap) => void;
  taskId?: string;
}

export const FileTree = memo(
  ({
    files = {},
    onFileSelect,
    selectedFile,
    rootFolder,
    hideRoot = false,
    collapsed = false,
    allowFolderSelection = false,
    hiddenFiles,
    className,
    unsavedFiles,
    onFilesChange,
    taskId,
  }: Props) => {
    renderLogger.trace('FileTree');

    const [newFileName, setNewFileName] = useState('');
    const [localFiles, setLocalFiles] = useState<FileMap>(files || {});
    const [activeFolderInput, setActiveFolderInput] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [activeFileInput, setActiveFileInput] = useState<string | null>(null);
    const [activeRenameInput, setActiveRenameInput] = useState<string | null>(null);
    const [newRename, setNewRename] = useState('');

    const computedHiddenFiles = useMemo(() => [...DEFAULT_HIDDEN_FILES, ...(hiddenFiles ?? [])], [hiddenFiles]);

    const fileList = useMemo(() => {
      return buildFileList(localFiles, rootFolder, hideRoot, computedHiddenFiles);
    }, [localFiles, rootFolder, hideRoot, computedHiddenFiles]);

    const [collapsedFolders, setCollapsedFolders] = useState(() => {
      return collapsed
        ? new Set(fileList.filter((item) => item.kind === 'folder').map((item) => item.fullPath))
        : new Set<string>();
    });

    useEffect(() => {
      const savedFiles = localStorage.getItem('fileTreeData');
      const savedTaskId = localStorage.getItem('currentTaskId');

      if (savedTaskId === taskId && savedFiles) {
        setLocalFiles(JSON.parse(savedFiles));
      } else {
        // Reset to initial files for a new task
        setLocalFiles(files);
        localStorage.setItem('currentTaskId', taskId || '');

        try {
          localStorage.setItem('fileTreeData', JSON.stringify(files));
        } catch (error) {
          console.error('Error saving file tree data to localStorage:', error);
        }
      }
    }, [taskId, files]);

    useEffect(() => {
      if (Object.keys(localFiles).length > 0) {
        try {
          localStorage.setItem('fileTreeData', JSON.stringify(localFiles));
        } catch (error) {
          console.error('Error saving file tree data to localStorage:', error);
        }
      }
    }, [localFiles]);

    useEffect(() => {
      if (collapsed) {
        setCollapsedFolders(new Set(fileList.filter((item) => item.kind === 'folder').map((item) => item.fullPath)));
      } else {
        setCollapsedFolders((prevCollapsed) => {
          const newCollapsed = new Set<string>();

          for (const folder of fileList) {
            if (folder.kind === 'folder' && prevCollapsed.has(folder.fullPath)) {
              newCollapsed.add(folder.fullPath);
            }
          }

          return newCollapsed;
        });
      }
    }, [fileList, collapsed]);

    const filteredFileList = useMemo(() => {
      const list = [];

      let lastDepth = Number.MAX_SAFE_INTEGER;

      for (const fileOrFolder of fileList) {
        const depth = fileOrFolder.depth;

        if (lastDepth === depth) {
          lastDepth = Number.MAX_SAFE_INTEGER;
        }

        if (collapsedFolders.has(fileOrFolder.fullPath)) {
          lastDepth = Math.min(lastDepth, depth);
        }

        if (lastDepth < depth) {
          continue;
        }

        list.push(fileOrFolder);
      }

      return list;
    }, [fileList, collapsedFolders]);

    const toggleCollapseState = (fullPath: string) => {
      setCollapsedFolders((prevSet) => {
        const newSet = new Set(prevSet);

        if (newSet.has(fullPath)) {
          newSet.delete(fullPath);
        } else {
          newSet.add(fullPath);
        }

        return newSet;
      });
    };

    // Create a file
    const onNewFile = (parentFolderPath: string) => {
      setActiveFileInput(parentFolderPath);
    };

    const handleCreateFile = (parentFolderPath: string) => {
      if (newFileName.trim() !== '') {
        const newFilePath = `${parentFolderPath}/${newFileName}`;
        const updatedFiles: FileMap = {
          ...localFiles,
          [newFilePath]: {
            /*
             * type: 'file',
             * name: newFileName,
             * fullPath: newFilePath,Lo
             * depth: (files[parentFolderPath]?.depth || 0) + 1,
             */

            type: 'file',
            content: '',
            isBinary: true,
          },
        };

        onFilesChange?.(updatedFiles);
        setNewFileName('');
        setActiveFileInput(null);
        onFileSelect?.(newFilePath);

        setLocalFiles(updatedFiles);
      }
    };

    // create folder
    const onNewFolder = (parentFolderPath: string) => {
      setActiveFolderInput(parentFolderPath);
    };

    const handleCreateFolder = (parentFolderPath: string) => {
      if (newFolderName.trim() !== '') {
        const newFolderPath = `${parentFolderPath}/${newFolderName}`;
        const updatedFiles: FileMap = {
          ...localFiles,
          [newFolderPath]: {
            type: 'folder',
          },
        };

        onFilesChange?.(updatedFiles);
        setNewFolderName('');
        setActiveFolderInput(null);

        setLocalFiles(updatedFiles);
      }
    };

    // Rename file / folder
    const onRename = (fileOrFolder: FileNode | FolderNode) => {
      setActiveRenameInput(fileOrFolder.fullPath);
      setNewRename(fileOrFolder.name);
    };

    const handleRename = (fileOrFolder: FileNode | FolderNode) => {
      if (newRename.trim() === '') {
        return;
      }

      if (newRename === fileOrFolder.name) {
        setActiveRenameInput(null);
        setNewRename('');

        return;
      }

      const parentPath = fileOrFolder.fullPath.substring(0, fileOrFolder.fullPath.lastIndexOf('/'));
      const newPath = `${parentPath}/${newRename}`;

      if (localFiles[newPath]) {
        alert('File or folder with the same name already exists');
      }

      const updatedFiles = { ...localFiles };
      const nodeType = updatedFiles[fileOrFolder.fullPath]?.type;

      if (fileOrFolder.kind === 'folder') {
        const itemsToRename = Object.entries(updatedFiles)
          .filter(([path]) => path === fileOrFolder.fullPath || path.startsWith(fileOrFolder.fullPath + '/'))
          .sort((a, b) => a[0].length - b[0].length);

        itemsToRename.forEach(([oldPath, item]) => {
          const newItemPath = oldPath.replace(fileOrFolder.fullPath, newPath);
          delete updatedFiles[oldPath];
          updatedFiles[newItemPath] = {
            ...item,
            name: oldPath === fileOrFolder.fullPath ? newRename : item.name,
            fullPath: newItemPath,
          };
        });

        // Update collapsed folders state if needed
        setCollapsedFolders((prev) => {
          const newCollapsed = new Set(prev);

          if (newCollapsed.has(fileOrFolder.fullPath)) {
            newCollapsed.delete(fileOrFolder.fullPath);
            newCollapsed.add(newPath);
          }

          return newCollapsed;
        });
      } else {
        delete updatedFiles[fileOrFolder.fullPath];
        updatedFiles[newPath] = {
          type: nodeType,
          name: newRename,
          fullPath: newPath,
          depth: fileOrFolder.depth,
        };
      }

      // Update local state
      setLocalFiles(updatedFiles);

      // Notify parent component
      onFilesChange?.(updatedFiles);

      if (selectedFile === fileOrFolder.fullPath) {
        onFileSelect?.(newPath);
      }

      // Reset rename state
      setActiveRenameInput(null);
      setNewRename('');
    };

    // delete file and folder
    const onDelete = (fileOrFolder: FileNode | FolderNode) => {
      const updatedFiles = { ...localFiles };
      delete updatedFiles[fileOrFolder.fullPath];

      // Delete the folder and its contents recursively
      if (fileOrFolder.kind === 'folder') {
        const pathsToDelete = Object.keys(updatedFiles).filter(
          (path) => path === fileOrFolder.fullPath || path.startsWith(fileOrFolder.fullPath + '/'),
        );

        if (pathsToDelete.length > 0) {
          pathsToDelete.forEach((path) => {
            delete updatedFiles[path];
          });
        }

        setCollapsedFolders((prev) => {
          const newCollapsed = new Set(prev);
          newCollapsed.delete(fileOrFolder.fullPath);

          return newCollapsed;
        });
      } else {
        delete updatedFiles[fileOrFolder.fullPath];
      }

      setLocalFiles(updatedFiles);

      onFilesChange?.(updatedFiles);

      if (
        selectedFile &&
        (selectedFile === fileOrFolder.fullPath || selectedFile.startsWith(fileOrFolder.fullPath + '/'))
      ) {
        onFileSelect?.('');
      }

      // reset active input
      if (activeFileInput === fileOrFolder.fullPath) {
        setActiveFileInput(null);
        setNewFileName('');
      }

      if (activeFolderInput === fileOrFolder.fullPath) {
        setActiveFolderInput(null);
        setNewFolderName('');
      }

      if (activeRenameInput === fileOrFolder.fullPath) {
        setActiveRenameInput(null);
        setNewRename('');
      }
    };

    const onCopyPath = (fileOrFolder: FileNode | FolderNode) => {
      try {
        navigator.clipboard.writeText(fileOrFolder.fullPath);
      } catch (error) {
        logger.error(error);
      }
    };

    const onCopyRelativePath = (fileOrFolder: FileNode | FolderNode) => {
      try {
        navigator.clipboard.writeText(fileOrFolder.fullPath.substring((rootFolder || '').length));
      } catch (error) {
        logger.error(error);
      }
    };

    const renderFileInput = (parentPath: string) => {
      if (activeFileInput !== parentPath) {
        return null;
      }

      return (
        <div className="flex items-center px-2 py-1">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateFile(parentPath);
              } else if (e.key === 'Escape') {
                setActiveFileInput(null);
                setNewFileName('');
              }
            }}
            className="w-full px-2 py-1 text-sm text-biela-elements-item-content-default border border-biela-elements-messages-background outline-none bg-biela-elements-background-depth-2"
            autoFocus
          />
        </div>
      );
    };

    const renderFolderInput = (parentPath: string) => {
      if (activeFolderInput !== parentPath) {
        return null;
      }

      return (
        <div className="flex items-center px-2 py-1">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateFolder(parentPath);
              } else if (e.key === 'Escape') {
                setActiveFolderInput(null);
                setNewFolderName('');
              }
            }}
            className="w-full px-2 py-1 text-sm text-biela-elements-item-content-default border border-biela-elements-messages-background outline-none bg-biela-elements-background-depth-2"
            autoFocus
          />
        </div>
      );
    };

    const renderRenameInput = (fileOrFolder: FileNode | FolderNode) => {
      if (activeRenameInput !== fileOrFolder.fullPath) {
        return null;
      }

      return (
        <div className="flex items-center px-2 py-1">
          <input
            type="text"
            value={newRename}
            onChange={(e) => setNewRename(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleRename(fileOrFolder);
              } else if (e.key === 'Escape') {
                setActiveRenameInput(null);
                setNewRename('');
              }
            }}
            className="w-full px-2 py-1 text-sm text-biela-elements-item-content-default border border-biela-elements-messages-background outline-none bg-biela-elements-background-depth-2"
            autoFocus
          />
        </div>
      );
    };

    return (
      <div className={classNames('text-sm', className, 'overflow-y-auto')}>
        {filteredFileList.map((fileOrFolder) => (
          <div key={fileOrFolder.id}>
            {fileOrFolder.kind === 'file' ? (
              <>
                <File
                  file={fileOrFolder}
                  selected={selectedFile === fileOrFolder.fullPath}
                  unsavedChanges={unsavedFiles?.has(fileOrFolder.fullPath)}
                  onNewFile={() => onNewFile(fileOrFolder.fullPath)}
                  onCopyPath={() => onCopyPath(fileOrFolder)}
                  onCopyRelativePath={() => onCopyRelativePath(fileOrFolder)}
                  onRename={() => onRename(fileOrFolder)}
                  onDelete={() => onDelete(fileOrFolder)}
                  onClick={() => onFileSelect?.(fileOrFolder.fullPath)}
                />
                {activeRenameInput === fileOrFolder.fullPath && renderRenameInput(fileOrFolder)}
              </>
            ) : (
              <>
                <Folder
                  folder={fileOrFolder}
                  selected={allowFolderSelection && selectedFile === fileOrFolder.fullPath}
                  collapsed={collapsedFolders.has(fileOrFolder.fullPath)}
                  onNewFile={() => onNewFile(fileOrFolder.fullPath)}
                  onNewFolder={() => onNewFolder(fileOrFolder.fullPath)}
                  onCopyPath={() => onCopyPath(fileOrFolder)}
                  onCopyRelativePath={() => onCopyRelativePath(fileOrFolder)}
                  onRename={() => onRename(fileOrFolder)}
                  onDelete={() => onDelete(fileOrFolder)}
                  onClick={() => toggleCollapseState(fileOrFolder.fullPath)}
                />
                {activeFileInput === fileOrFolder.fullPath && renderFileInput(fileOrFolder.fullPath)}
                {activeFolderInput === fileOrFolder.fullPath && renderFolderInput(fileOrFolder.fullPath)}
                {activeRenameInput === fileOrFolder.fullPath && renderRenameInput(fileOrFolder)}
              </>
            )}
          </div>
        ))}
      </div>
    );
  },
);

export default FileTree;

interface FolderProps {
  folder: FolderNode;
  collapsed: boolean;
  selected?: boolean;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRename?: () => void;
  onCopyPath: () => void;
  onCopyRelativePath: () => void;
  onDelete?: () => void;
  onClick: () => void;
}

function Folder({
  folder,
  collapsed,
  selected = false,
  onNewFile,
  onNewFolder,
  onDelete,
  onRename,
  onCopyPath,
  onCopyRelativePath,
  onClick,
}: FolderProps) {
  return (
    <FileContextMenu
      onNewFile={onNewFile}
      onNewFolder={onNewFolder}
      onRename={onRename}
      onCopyPath={onCopyPath}
      onCopyRelativePath={onCopyRelativePath}
      onDelete={onDelete}
      isFolder
    >
      <NodeButton
        className={classNames('group', {
          'bg-transparent hover:text-biela-elements-item-contentActive hover:bg-biela-elements-item-backgroundActive':
            !selected,
          'bg-biela-elements-item-backgroundAccent text-biela-elements-item-contentAccent': selected,
        })}
        depth={folder.depth}
        icon={collapsed ? 'right-arrow' : 'down'}
        onClick={onClick}
      >
        {folder.name}
      </NodeButton>
    </FileContextMenu>
  );
}

interface FileProps {
  file: FileNode;
  selected: boolean;
  unsavedChanges?: boolean;
  onNewFile: () => void;
  onRename: () => void;
  onCopyPath: () => void;
  onCopyRelativePath: () => void;
  onDelete: () => void;
  onClick: () => void;
}

function ContextMenuItem({ onSelect, children }: { onSelect?: () => void; children: ReactNode }) {
  return (
    <ContextMenu.Item
      onSelect={onSelect}
      className="flex items-center gap-2 px-2 py-1.5 outline-0 text-sm text-biela-elements-textPrimary cursor-pointer ws-nowrap text-biela-elements-item-contentDefault hover:text-biela-elements-item-contentActive hover:bg-biela-elements-item-backgroundActive rounded-md"
    >
      <span className="size-4 shrink-0"></span>
      <span>{children}</span>
    </ContextMenu.Item>
  );
}

function FileContextMenu({
  onNewFile,
  onNewFolder,
  onRename,
  onCopyPath,
  onCopyRelativePath,
  onDelete,
  children,
  isFolder,
}: {
  onNewFile?: () => void;
  onNewFolder?: () => void;
  onRename?: () => void;
  onCopyPath?: () => void;
  onCopyRelativePath?: () => void;
  onDelete?: () => void;
  children: ReactNode;
  isFolder?: boolean;
}) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          style={{ zIndex: 998 }}
          className="border border-biela-elements-borderColor rounded-md z-context-menu bg-biela-elements-background-depth-1 dark:bg-biela-elements-background-depth-2 data-[state=open]:animate-in animate-duration-100 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-98 w-56"
        >
          <ContextMenu.Group className="p-1 border-b-px border-solid border-bolt-elements-borderColor">
            {isFolder && (
              <>
                <ContextMenuItem onSelect={onNewFile}>New file...</ContextMenuItem>
                <ContextMenuItem onSelect={onNewFolder}>New folder...</ContextMenuItem>
              </>
            )}
            <ContextMenuItem onSelect={onCopyPath}>Copy path</ContextMenuItem>
            <ContextMenuItem onSelect={onCopyRelativePath}>Copy relative path</ContextMenuItem>
            <ContextMenuItem onSelect={onRename}>Rename</ContextMenuItem>
            <ContextMenuItem onSelect={onDelete}>Delete</ContextMenuItem>
          </ContextMenu.Group>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

function File({
  file: { depth, name },
  onClick,
  onNewFile,
  onRename,
  onCopyPath,
  onCopyRelativePath,
  onDelete,
  selected,
  unsavedChanges = false,
}: FileProps) {
  return (
    <FileContextMenu
      onNewFile={onNewFile}
      onRename={onRename}
      onCopyPath={onCopyPath}
      onCopyRelativePath={onCopyRelativePath}
      onDelete={onDelete}
    >
      <NodeButton
        className={classNames('group', {
          'bg-transparent hover:bg-biela-elements-item-backgroundActive text-biela-elements-item-contentDefault':
            !selected,
          'bg-biela-elements-item-backgroundAccent text-biela-elements-item-contentAccent': selected,
        })}
        depth={depth}
        icon="new-file"
        onClick={onClick}
      >
        {name}
        {unsavedChanges && <span className="i-ph:circle-fill scale-68 shrink-0 text-orange-500" />}
      </NodeButton>
    </FileContextMenu>
  );
}

interface ButtonProps {
  depth: number;
  icon?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

function NodeButton({ icon, depth, className, onClick, children }: ButtonProps) {
  return (
    <button
      className={classNames(
        'flex items-center gap-1.5 w-full pr-2 border-2 border-transparent text-faded py-1.5 space-padding-file',
        className,
      )}
      style={{ paddingLeft: `${6 + depth * NODE_PADDING_LEFT}px` }}
      onClick={onClick}
    >
      {icon && (
        <img src={`/icons/${icon}.svg`} alt={icon} className="scale-120 shrink-0" style={{ maxWidth: '13px' }} />
      )}

      <div className="truncate w-full text-left">{children}</div>
    </button>
  );
}

type Node = FileNode | FolderNode;

interface BaseNode {
  id: number;
  depth: number;
  name: string;
  fullPath: string;
}

interface FileNode extends BaseNode {
  kind: 'file';
}

interface FolderNode extends BaseNode {
  kind: 'folder';
}

function buildFileList(
  files: FileMap,
  rootFolder = '/',
  hideRoot: boolean,
  hiddenFiles: Array<string | RegExp>,
): Node[] {
  const folderPaths = new Set<string>();
  const fileList: Node[] = [];

  let defaultDepth = 0;

  if (rootFolder === '/' && !hideRoot) {
    defaultDepth = 1;
    fileList.push({ kind: 'folder', name: '/', depth: 0, id: 0, fullPath: '/' });
  }

  for (const [filePath, dirent] of Object.entries(files)) {
    const segments = filePath.split('/').filter((segment) => segment);
    const fileName = segments.at(-1);

    if (!fileName || isHiddenFile(filePath, fileName, hiddenFiles)) {
      continue;
    }

    let currentPath = '';

    let i = 0;
    let depth = 0;

    while (i < segments.length) {
      const name = segments[i];
      const fullPath = (currentPath += `/${name}`);

      if (!fullPath.startsWith(rootFolder) || (hideRoot && fullPath === rootFolder)) {
        i++;
        continue;
      }

      if (i === segments.length - 1 && dirent?.type === 'file') {
        fileList.push({
          kind: 'file',
          id: fileList.length,
          name,
          fullPath,
          depth: depth + defaultDepth,
        });
      } else if (!folderPaths.has(fullPath)) {
        folderPaths.add(fullPath);

        fileList.push({
          kind: 'folder',
          id: fileList.length,
          name,
          fullPath,
          depth: depth + defaultDepth,
        });
      }

      i++;
      depth++;
    }
  }

  return sortFileList(rootFolder, fileList, hideRoot);
}

function isHiddenFile(filePath: string, fileName: string, hiddenFiles: Array<string | RegExp>) {
  return hiddenFiles.some((pathOrRegex) => {
    if (typeof pathOrRegex === 'string') {
      return fileName === pathOrRegex;
    }

    return pathOrRegex.test(filePath);
  });
}

function sortFileList(rootFolder: string, nodeList: Node[], hideRoot: boolean): Node[] {
  logger.trace('sortFileList');

  const nodeMap = new Map<string, Node>();
  const childrenMap = new Map<string, Node[]>();

  nodeList.sort((a, b) => compareNodes(a, b));

  for (const node of nodeList) {
    nodeMap.set(node.fullPath, node);

    const parentPath = node.fullPath.slice(0, node.fullPath.lastIndexOf('/'));

    if (parentPath !== rootFolder.slice(0, rootFolder.lastIndexOf('/'))) {
      if (!childrenMap.has(parentPath)) {
        childrenMap.set(parentPath, []);
      }

      childrenMap.get(parentPath)?.push(node);
    }
  }

  const sortedList: Node[] = [];

  const depthFirstTraversal = (path: string): void => {
    const node = nodeMap.get(path);

    if (node) {
      sortedList.push(node);
    }

    const children = childrenMap.get(path);

    if (children) {
      for (const child of children) {
        if (child.kind === 'folder') {
          depthFirstTraversal(child.fullPath);
        } else {
          sortedList.push(child);
        }
      }
    }
  };

  if (hideRoot) {
    const rootChildren = childrenMap.get(rootFolder) || [];

    for (const child of rootChildren) {
      depthFirstTraversal(child.fullPath);
    }
  } else {
    depthFirstTraversal(rootFolder);
  }

  return sortedList;
}

function compareNodes(a: Node, b: Node): number {
  if (a.kind !== b.kind) {
    return a.kind === 'folder' ? -1 : 1;
  }

  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
}
