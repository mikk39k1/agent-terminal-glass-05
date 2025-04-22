
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useWebContainer } from '@/hooks/useWebContainer';

interface TerminalProps {
  className?: string;
}

export interface TerminalRefObject {
  executeCommand: (cmd: string) => void;
}

const Terminal = forwardRef<TerminalRefObject, TerminalProps>(({ className = '' }, ref) => {
  const [output, setOutput] = useState<string[]>([
    '> DevOps Agent Terminal v1.0.0',
    '> WebContainer initializing...',
    '> Type or run commands to interact with your environment',
    '> '
  ]);
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalOutputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { webcontainer, loading, error, ready, simulationMode } = useWebContainer();

  useEffect(() => {
    if (error) {
      setOutput(prev => [...prev, `Error initializing WebContainer: ${error}`, '> ']);
      console.error("WebContainer error:", error);
    } else if (!loading && ready) {
      if (simulationMode) {
        setOutput(prev => [...prev, 'WebContainer not available. Running in simulation mode.', '> ']);
      } else if (webcontainer) {
        setOutput(prev => [...prev, 'WebContainer is ready! You can run Node.js commands.', '> ']);
      }
    }
  }, [loading, error, ready, webcontainer, simulationMode]);

  useEffect(() => {
    if (terminalOutputRef.current) {
      terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
    }
  }, [output]);

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;
    
    setOutput(prev => [...prev, `$ ${cmd}`]);
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    
    if (cmd === 'clear') {
      setOutput(['> ']);
      return;
    }
    
    // If WebContainer is available and ready, try to use it
    if (webcontainer && ready && !simulationMode) {
      try {
        if (cmd.startsWith('node ') || cmd === 'node') {
          console.log("Executing Node command:", cmd);
          const cmdParts = cmd.split(' ');
          const process = await webcontainer.spawn('node', cmdParts.slice(1));
          
          let processOutput = '';
          process.output.pipeTo(
            new WritableStream({
              write(chunk) {
                processOutput += chunk;
                setOutput(prev => [...prev, chunk]);
              }
            })
          );
          
          const exitCode = await process.exit;
          if (processOutput.trim() === '') {
            setOutput(prev => [...prev, `Command completed with exit code ${exitCode}`, '> ']);
          } else {
            setOutput(prev => [...prev, `Process exited with code ${exitCode}`, '> ']);
          }
        } else if (cmd.startsWith('npm ')) {
          console.log("Executing NPM command:", cmd);
          const cmdParts = cmd.split(' ');
          const process = await webcontainer.spawn('npm', cmdParts.slice(1));
          
          process.output.pipeTo(
            new WritableStream({
              write(chunk) {
                setOutput(prev => [...prev, chunk]);
              }
            })
          );
          
          const exitCode = await process.exit;
          setOutput(prev => [...prev, `Process exited with code ${exitCode}`, '> ']);
        } else {
          // Fallback to simulation for unsupported commands
          simulateCommand(cmd);
        }
      } catch (err) {
        console.error("Command execution error:", err);
        setOutput(prev => [...prev, `Error: ${err instanceof Error ? err.message : 'Unknown error'}`, '> ']);
      }
    } else {
      // Run in simulation mode
      simulateCommand(cmd);
    }
  };

  const simulateCommand = (cmd: string) => {
    setTimeout(() => {
      let commandOutput: string[] = [];
      
      if (cmd.includes('ls')) {
        commandOutput = ['app.js', 'package.json', 'node_modules/', 'README.md'];
      } else if (cmd.includes('docker')) {
        commandOutput = [
          'CONTAINER ID   IMAGE          COMMAND        CREATED       STATUS       PORTS                    NAMES',
          'a1b2c3d4e5f6   nginx:latest   "/docker-..."  2 hours ago   Up 2 hours   0.0.0.0:8080->80/tcp     web-server',
          '1a2b3c4d5e6f   mongo:latest   "docker-..."   3 hours ago   Up 3 hours   0.0.0.0:27017->27017/tcp mongodb'
        ];
      } else if (cmd.includes('git')) {
        commandOutput = ['On branch main', 'Your branch is up to date with \'origin/main\'.', 'nothing to commit, working tree clean'];
      } else if (cmd.includes('kubectl')) {
        commandOutput = ['NAME                     READY   STATUS    RESTARTS   AGE', 
          'api-deployment-5d4b9f    1/1     Running   0          7d',
          'db-statefulset-0          1/1     Running   0          7d',
          'redis-deployment-8f7c6c   1/1     Running   0          7d'];
      } else if (cmd.startsWith('node ')) {
        commandOutput = ['[Simulated Node.js execution]', `Executed: ${cmd}`, 'Hello from simulated Node.js!'];
      } else if (cmd.startsWith('npm ')) {
        commandOutput = ['[Simulated NPM execution]', `> ${cmd}`, '', '+ package@1.0.0', 'added 1 package in 0.5s'];
      } else {
        commandOutput = [`Simulated: ${cmd}`, 'Command executed in simulation mode.'];
      }
      
      setOutput(prev => [...prev, ...commandOutput, '> ']);
    }, 300);
  };

  useImperativeHandle(ref, () => ({
    executeCommand
  }));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && command.trim()) {
      executeCommand(command.trim());
      setCommand('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between p-3 border-b border-terminal-border">
        <h2 className="font-medium">
          Terminal {simulationMode ? '(Simulation Mode)' : ready ? '(Ready)' : '(Initializing...)'}
        </h2>
      </div>
      
      <div 
        ref={terminalOutputRef}
        className="flex-1 bg-terminal p-4 font-mono text-sm text-terminal-text overflow-y-auto terminal-shadow"
      >
        {output.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap mb-1">
            {line}
            {index === output.length - 1 && (
              <input
                ref={inputRef}
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none w-full ml-2"
                autoFocus
                aria-label="Terminal input"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

Terminal.displayName = "Terminal";

export default Terminal;
