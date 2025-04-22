
import { WebContainer } from '@webcontainer/api';
import { useState, useEffect } from 'react';

export function useWebContainer() {
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    async function bootWebContainer() {
      try {
        // Check if we're in an environment that supports WebContainer
        if (!window.crossOriginIsolated) {
          console.log("Environment is not cross-origin isolated, WebContainer requires COOP/COEP headers.");
          throw new Error('Cross-Origin Isolation required for WebContainer');
        }
        
        console.log("Attempting to boot WebContainer...");
        
        // Boot WebContainer following the documentation
        const instance = await WebContainer.boot();
        
        if (!isMounted) return;
        
        console.log("WebContainer booted successfully!");
        setWebcontainer(instance);
        
        // Set up a minimal project structure
        await instance.mount({
          'index.js': {
            file: {
              contents: 'console.log("Hello from WebContainer!");',
            },
          },
          'package.json': {
            file: {
              contents: JSON.stringify({
                name: "webcontainer-project",
                type: "module",
                dependencies: {}
              }, null, 2),
            },
          },
        });
        
        console.log("Files mounted in WebContainer.");
        
        // Initialize a basic npm project
        try {
          const initProcess = await instance.spawn('npm', ['init', '-y']);
          await initProcess.exit;
          console.log("npm init completed.");
        } catch (initError) {
          console.warn("Could not run npm init:", initError);
          // Continue even if npm init fails
        }
        
        if (!isMounted) return;
        
        setReady(true);
        console.log("WebContainer is ready to use!");
      } catch (err) {
        console.error("Error initializing WebContainer:", err);
        if (!isMounted) return;
        
        // Set error message and enable simulation mode
        setError(err instanceof Error ? err.message : 'Unknown error');
        setSimulationMode(true);
        setReady(true); // Allow terminal to be used in simulation mode
        console.log("Falling back to simulation mode due to WebContainer error.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    bootWebContainer();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return { webcontainer, loading, error, ready, simulationMode };
}
