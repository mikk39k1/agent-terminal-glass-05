
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
        // Initialize the WebContainer with simpler configuration
        console.log("Attempting to boot WebContainer...");
        
        // Boot with no additional options
        const instance = await WebContainer.boot();
        
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
        
        // Simple initialization instead of npm init
        console.log("WebContainer is ready to use!");
        
        if (!isMounted) return;
        
        setReady(true);
      } catch (err) {
        console.error("WebContainer boot error:", err);
        if (!isMounted) return;
        
        // Provide a fallback experience
        setError(err instanceof Error ? err.message : 'Failed to initialize WebContainer');
        // Even on error, we can still provide a simulated terminal experience
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

  return { webcontainer, loading, error, ready };
}
