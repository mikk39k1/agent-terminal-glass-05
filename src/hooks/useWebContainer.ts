
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
        if (!window.crossOriginIsolated) {
          console.log("Environment is not cross-origin isolated, WebContainer requires COOP/COEP headers.");
          throw new Error('Cross-Origin Isolation required for WebContainer');
        }
        
        console.log("Attempting to boot WebContainer...");
        
        let instance: WebContainer;
        try {
          instance = await WebContainer.boot();
        } catch (bootError) {
          console.error("WebContainer boot error:", bootError);
          throw new Error(bootError instanceof Error ? bootError.message : 'WebContainer boot failed');
        }
        
        if (!isMounted) return;
        
        console.log("WebContainer booted successfully!");
        setWebcontainer(instance);
        
        // Set up initial files
        await instance.mount({
          'index.js': {
            file: {
              contents: 'console.log("WebContainer is ready!");',
            },
          },
          'package.json': {
            file: {
              contents: JSON.stringify({
                name: "webcontainer-project",
                type: "module",
                scripts: {
                  start: "node index.js"
                },
                dependencies: {}
              }, null, 2),
            },
          },
        });
        
        console.log("Initial files mounted successfully");
        
        if (!isMounted) return;
        
        setReady(true);
        console.log("WebContainer is ready to use!");
      } catch (err) {
        console.error("Error initializing WebContainer:", err);
        if (!isMounted) return;
        
        setError(err instanceof Error ? err.message : 'Unknown error');
        setSimulationMode(true);
        setReady(true);
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
