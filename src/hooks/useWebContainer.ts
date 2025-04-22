
import { WebContainer } from '@webcontainer/api';
import { useState, useEffect } from 'react';

export function useWebContainer() {
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    async function bootWebContainer() {
      try {
        // Initialize the WebContainer
        console.log("Attempting to boot WebContainer...");
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
                name: "example-project",
                type: "module",
                dependencies: {}
              }, null, 2),
            },
          },
        });
        
        // Install basic dependencies
        const installProcess = await instance.spawn('npm', ['init', '-y']);
        const installExitCode = await installProcess.exit;
        
        if (installExitCode !== 0) {
          throw new Error(`Installation failed with exit code ${installExitCode}`);
        }
        
        if (!isMounted) return;
        
        setReady(true);
        console.log("WebContainer is fully ready!");
      } catch (err) {
        console.error("WebContainer boot error:", err);
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to initialize WebContainer');
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

  return { webcontainer, loading, error, ready };
}
