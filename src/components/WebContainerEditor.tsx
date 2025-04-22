
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';
import { getWebContainerInstance } from '@/lib/web-container';
import { useToast } from '@/hooks/use-toast';

const initialCode = [
  `console.log("Hello from WebContainer!");`,
  `const message = "The environment is ready!";`,
  `console.log(message);`,
].join('\n');

export function WebContainerEditor() {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  async function handleEvaluateCode() {
    setIsRunning(true);
    setOutput([]);

    try {
      const webContainer = await getWebContainerInstance();

      await webContainer.mount({
        'index.js': {
          file: {
            contents: code,
          },
        },
        'package.json': {
          file: {
            contents: JSON.stringify({
              name: "webcontainer-project",
              type: "module",
              scripts: {
                start: "node index.js"
              }
            }, null, 2),
          },
        },
      });

      setOutput(prev => [...prev, '📦 Setting up environment...']);

      const start = await webContainer.spawn('node', ['index.js']);

      start.output.pipeTo(
        new WritableStream({
          write(data) {
            setOutput(prev => [...prev, data]);
          },
        })
      );

      await start.exit;
      
    } catch (error) {
      console.error('Execution error:', error);
      toast({
        title: "Execution Error",
        description: error instanceof Error ? error.message : "Failed to execute code",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative min-h-[200px] w-full rounded-md border bg-muted p-4">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="min-h-[180px] w-full resize-none bg-transparent font-mono text-sm outline-none"
          placeholder="Enter your code here..."
          spellCheck={false}
        />
      </div>

      <div className="flex items-center justify-between">
        <Button
          onClick={handleEvaluateCode}
          disabled={isRunning}
          className="gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Code
            </>
          )}
        </Button>
      </div>

      <div className="min-h-[100px] w-full rounded-md border bg-muted p-4">
        <div className="font-mono text-sm">
          {output.length > 0 ? (
            output.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap">
                {line}
              </div>
            ))
          ) : (
            <div className="text-muted-foreground">
              Output will appear here...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
