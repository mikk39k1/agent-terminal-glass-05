
import { WebContainer } from '@webcontainer/api';
import { useState, useEffect } from 'react';

export function useWebContainer() {
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function bootWebContainer() {
      try {
        // Initialize the WebContainer
        const instance = await WebContainer.boot();
        setWebcontainer(instance);
        
        // Set up a minimal project structure
        await instance.mount({
          'index.js': {
            file: {
              contents: 'console.log("WebContainer ready!");',
            },
          },
          'package.json': {
            file: {
              contents: `
                {
                  "name": "example-project",
                  "type": "module",
                  "dependencies": {}
                }
              `,
            },
          },
        });
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize WebContainer');
      } finally {
        setLoading(false);
      }
    }

    bootWebContainer();
  }, []);

  return { webcontainer, loading, error };
}
