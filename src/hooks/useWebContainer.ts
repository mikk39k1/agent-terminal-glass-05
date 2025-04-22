
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
        
        // Set up a minimal project structure
        try {
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
        } catch (mountError) {
          console.error("Failed to mount files:", mountError);
          throw new Error('Failed to mount files in WebContainer');
        }
        
        // Create a basic package.json if one doesn't exist
        try {
          const packageJsonProcess = await instance.spawn('node', ['-e', `
            const fs = require('fs');
            if (!fs.existsSync('package.json')) {
              fs.writeFileSync('package.json', JSON.stringify({
                name: "webcontainer-project",
                type: "module",
                dependencies: {}
              }, null, 2));
              console.log("Created package.json");
            } else {
              console.log("package.json already exists");
            }
          `]);
          
          await packageJsonProcess.exit;
          console.log("Package.json check completed.");
        } catch (pkgError) {
          console.warn("Could not verify package.json:", pkgError);
          // Continue even if this fails
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
