
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
        // This helps prevent the DataCloneError in unsupported environments
        const isWebContainerSupported = 'serviceWorker' in navigator && 
                                        window.isSecureContext && 
                                        !window.crossOriginIsolated;
        
        if (!isWebContainerSupported) {
          throw new Error('WebContainer is not supported in this environment');
        }
        
        console.log("Attempting to boot WebContainer...");
        
        // Boot with simpler configuration
        const instance = await WebContainer.boot({
          // Use minimal options to avoid cloning issues
          workdirName: 'webcontainer-workspace'
        });
        
        if (!isMounted) return;
        
        console.log("WebContainer booted successfully!");
        setWebcontainer(instance);
        
        // Set up a minimal project structure with simplified content
        await instance.mount({
          'index.js': {
            file: {
              contents: 'console.log("Hello from WebContainer!");',
            },
          },
          'package.json': {
            file: {
              contents: '{"name":"example-project","type":"module","dependencies":{}}',
            },
          },
        });
        
        console.log("WebContainer is ready to use!");
        
        if (!isMounted) return;
        
        setReady(true);
      } catch (err) {
        console.error("Error initializing WebContainer:", err);
        if (!isMounted) return;
        
        // Set error message and enable simulation mode
        setError(err instanceof Error ? err.message : 'Unknown error');
        setSimulationMode(true);
        setReady(true); // Allow terminal to be used in simulation mode
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
