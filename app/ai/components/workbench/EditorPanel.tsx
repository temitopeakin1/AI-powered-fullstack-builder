import { useStore } from '@nanostores/react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import {
  CodeMirrorEditor,
  type EditorSettings,
  type OnChangeCallback as OnEditorChange,
  type OnScrollCallback as OnEditorScroll,
} from '../../components/CodeMirrorEditor';
import { PanelHeader } from '~/ai/components/PanelHeader';
import { PanelHeaderButton } from '~/ai/components/PanelHeaderButton';
import { WORK_DIR } from '~/utils/constants';
import { renderLogger } from '~/utils/logger';
import { isMobile } from '~/utils/mobile';
import { FileBreadcrumb } from './FileBreadcrumb';
import { FileTree } from './FileTree';
import { DEFAULT_TERMINAL_SIZE, TerminalTabs } from './terminal/TerminalTabs';
import { workbenchStore } from '~/ai/lib/stores/workbench';
import { IconButton } from '~/components/common/IconButton';
import { toast } from 'react-toastify';
import { chatStore } from '~/ai/lib/stores/chat';

const DEFAULT_EDITOR_SIZE = 100 - DEFAULT_TERMINAL_SIZE;

const editorSettings: EditorSettings = { tabSize: 2 };

export const EditorPanel = memo(() => {
  renderLogger.trace('EditorPanel');

  const showTerminal = useStore(workbenchStore.showTerminal);
  const unsavedFiles = useStore(workbenchStore.unsavedFiles);
  const editorDocument = useStore(workbenchStore.currentDocument);
  const selectedFile = useStore(workbenchStore.selectedFile);
  const { isStreaming } = chatStore.get();

  const lastSelectedFileRef = useRef<string | undefined>();
  const [editable, setEditable] = useState<boolean>(!isStreaming && editorDocument !== undefined);

  const activeFileSegments = useMemo(() => {
    if (!editorDocument) {
      return undefined;
    }

    return editorDocument.filePath.split('/');
  }, [editorDocument]);

  const onEditorChange = useCallback<OnEditorChange>(
    (update) => {
      if (isStreaming) {
        return;
      }

      workbenchStore.setCurrentDocumentContent(update.content);
    },
    [isStreaming],
  );

  const onEditorScroll = useCallback<OnEditorScroll>(
    (position) => {
      workbenchStore.setCurrentDocumentScrollPosition(position);
    },
    [isStreaming],
  );

  const onFileSelect = useCallback(
    (filePath: string | undefined) => {
      if (isStreaming) {
        return;
      }

      workbenchStore.setSelectedFile(filePath);
    },
    [isStreaming],
  );

  const onFileSave = useCallback(() => {
    if (isStreaming) {
      return;
    }

    workbenchStore.saveCurrentDocument().catch(() => {
      toast.error('Failed to update file content');
    });
  }, [isStreaming]);

  const onFileReset = useCallback(() => {
    if (isStreaming) {
      return;
    }

    workbenchStore.resetCurrentDocument();
  }, [isStreaming]);

  const activeFileUnsaved = useMemo(
    () => editorDocument !== undefined && unsavedFiles?.has(editorDocument.filePath),
    [editorDocument, unsavedFiles],
  );

  useEffect(() => {
    if (isStreaming) {
      lastSelectedFileRef.current = selectedFile;
    }
  }, [isStreaming, selectedFile]);

  useEffect(() => {
    setEditable(!isStreaming && editorDocument !== undefined);
  }, [isStreaming, editorDocument]);

  const handleFileSelect = useCallback(
    (filePath: string | undefined) => {
      if (isStreaming && filePath !== lastSelectedFileRef.current) {
        return;
      }

      if (!isStreaming) {
        const scrollers = document.querySelectorAll('.cm-scroller');
        scrollers.forEach((scroller) => {
          scroller.scrollTop = 0;
        });
      }

      onFileSelect?.(filePath);
    },
    [isStreaming, onFileSelect],
  );

  return (
    <PanelGroup direction="vertical">
      <Panel defaultSize={showTerminal ? DEFAULT_EDITOR_SIZE : 100} minSize={20}>
        <PanelGroup direction="horizontal">
          <Panel defaultSize={20} minSize={10} collapsible>
            <div className="flex flex-col border-r border-biela-elements-borderColor h-full editor-fonts">
              <PanelHeader>
                <IconButton icon={'new-file'} size="sm" title="Files" />
                Files
              </PanelHeader>
              <FileTree
                className="h-full"
                hideRoot
                rootFolder={WORK_DIR}
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
              />
            </div>
          </Panel>
          <PanelResizeHandle />
          <Panel className="flex flex-col" defaultSize={80} minSize={20}>
            <PanelHeader className="overflow-x-auto">
              {activeFileSegments?.length && (
                <div className="flex items-center flex-1 text-sm">
                  <FileBreadcrumb pathSegments={activeFileSegments} onFileSelect={onFileSelect} />
                  {activeFileUnsaved && (
                    <div className="flex gap-1 ml-auto -mr-1.5">
                      <PanelHeaderButton onClick={onFileSave}>
                        <div className="i-ph:floppy-disk-duotone" />
                        Save
                      </PanelHeaderButton>
                      <PanelHeaderButton onClick={onFileReset}>
                        <div className="i-ph:clock-counter-clockwise-duotone" />
                        Reset
                      </PanelHeaderButton>
                    </div>
                  )}
                </div>
              )}
            </PanelHeader>
            <div className="h-full flex-1 overflow-hidden">
              <CodeMirrorEditor
                editable={editable}
                settings={editorSettings}
                doc={editorDocument}
                autoFocusOnDocumentChange={!isMobile()}
                onScroll={onEditorScroll}
                onChange={onEditorChange}
                onSave={onFileSave}
              />
            </div>
          </Panel>
        </PanelGroup>
      </Panel>
      <PanelResizeHandle />
      <TerminalTabs />
    </PanelGroup>
  );
});
