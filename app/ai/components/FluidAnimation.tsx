import { useEffect, useRef, useState } from 'react';

export function FluidAnimation() {
  const canvasRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // First load dat.gui
    let cleanup = () => {};

    const loadDependencies = async () => {
      try {
        const dat = await import('dat.gui');
        // Only set dat on window after import
        if (typeof window !== 'undefined') {
          window.dat = dat;

          // Now load the script
          const script = document.createElement('script');
          script.src = '/fluid-animation.js';
          script.onload = () => setScriptLoaded(true);
          document.body.appendChild(script);

          cleanup = () => {
            document.body.removeChild(script);
          };
        }
      } catch (error) {
        console.error('Error loading dependencies:', error);
      }
    };

    loadDependencies();

    return () => {
      cleanup();
    };
  }, []);

  return <canvas ref={canvasRef} />;
}
