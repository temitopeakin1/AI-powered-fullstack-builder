import { useStore } from '@nanostores/react';
import { memo, useEffect, useRef, useState } from 'react';
import { workbenchStore } from '~/ai/lib/stores/workbench';
import { PortDropdown } from './PortDropdown';
import { ScreenshotSelector } from './ScreenshotSelector';
import { getAppState } from '~/ai/lib/stores/cloud/cloud';
import { IconButton } from '../../../components/common/IconButton';

type ResizeSide = 'left' | 'right' | null;

export const Preview = memo(
  ({
    isDeploying,
    deviceMode,
  }: {
    isDeploying: boolean;
    deviceMode: {
      label: string;
      value: number;
      id: string;
    };
  }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const selectedView = useStore(workbenchStore.currentView);

    const [activePreviewIndex, setActivePreviewIndex] = useState(0);
    const [isPortDropdownOpen, setIsPortDropdownOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const hasSelectedPreview = useRef(false);
    const previews = useStore(workbenchStore.previews);
    const activePreview = previews[activePreviewIndex];

    const [url, setUrl] = useState('');
    const [iframeUrl, setIframeUrl] = useState<string | undefined>();
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const [appState, setAppState] = useState<any>(undefined);

    const resizingState = useRef({
      isResizing: false,
      side: null as ResizeSide,
      startX: 0,
      startWidthPercent: 37.5,
      windowWidth: window.innerWidth,
    });

    useEffect(() => {
      if (selectedView === 'preview') {
        reloadPreview();
      }
    }, [selectedView]);

    const SCALING_FACTOR = 2; // Adjust this value to increase/decrease sensitivity

    useEffect(() => {
      if (!activePreview) {
        setUrl('');
        setIframeUrl(undefined);
        return;
      }

      const { baseUrl } = activePreview;

      // setUrl(baseUrl);
      setIframeUrl(baseUrl);
    }, [activePreview]);

    const fetchAppState = async () => {
      const state = await getAppState();
      setAppState(state);
    };

    useEffect(() => {
      fetchAppState();
    }, []);

    useEffect(() => {
      fetchAppState();
    }, [isDeploying]);

    useEffect(() => {
      setUrl(appState?.cloudApp?.url ? `https://${appState.cloudApp.url}` : '');
    }, [appState]);

    const reloadPreview = () => {
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
    };

    const toggleFullscreen = async () => {
      if (!isFullscreen && containerRef.current) {
        await containerRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    };

    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);

      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
      };
    }, []);

    return (
      <div ref={containerRef} className="w-full h-full flex flex-col relative">
        {isPortDropdownOpen && (
          <div className="z-iframe-overlay w-full h-full absolute" onClick={() => setIsPortDropdownOpen(false)} />
        )}
        <div className="link-area-container">
          <div className="website-link">
            <img src="/icons/globe.svg" alt="URL" />
            <div className="link-copy">
              <input
                title="URL"
                ref={inputRef}
                className="w-full bg-transparent outline-none"
                type="text"
                value={url}
                disabled
              />
            </div>
          </div>
          <div className="right-btn-coding">
            {previews.length > 0 && (
              <PortDropdown
                activePreviewIndex={activePreviewIndex}
                setActivePreviewIndex={setActivePreviewIndex}
                isDropdownOpen={isPortDropdownOpen}
                setHasSelectedPreview={(value) => (hasSelectedPreview.current = value)}
                setIsDropdownOpen={setIsPortDropdownOpen}
                previews={previews}
              />
            )}
            <IconButton icon="refresh" onClick={reloadPreview} title="Reload Preview" className="w-6" />
            {/* <DevicesScreenDropdown onChange={setDeviceMode} /> */}
            <IconButton
              icon="expand"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              className="w-6"
            />
          </div>
        </div>

        <div className="flex-1 border-t border-biela-elements-borderColor flex justify-center items-center overflow-auto">
          <div
            style={{
              width: `${deviceMode?.value ?? 100}%`,
              height: '100%',
              overflow: 'visible',
              background: '#fff',
              position: 'relative',
              display: 'flex',
            }}
            className="transition-width duration-300 ease-in-out"
          >
            {activePreview ? (
              <>
                <iframe
                  ref={iframeRef}
                  title="preview"
                  className="border-none w-full h-full bg-white"
                  src={iframeUrl}
                  allowFullScreen
                />
                <ScreenshotSelector
                  isSelectionMode={isSelectionMode}
                  setIsSelectionMode={setIsSelectionMode}
                  containerRef={iframeRef}
                />
              </>
            ) : (
              <div className="flex w-full h-full justify-center items-center bg-white">No preview available</div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

Preview.displayName = 'Preview';
