import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useWebContainer } from '@/hooks/useWebContainer';
import { useToast } from '@/hooks/use-toast';

interface TerminalProps {
  className?: string;
}

export interface TerminalRefObject {
  executeCommand: (cmd: string) => void;
}

const Terminal = forwardRef<TerminalRefObject, TerminalProps>(({ className = '' }, ref) => {
  const [output, setOutput] = useState<string[]>([
    '> WebContainer Terminal v1.0.0',
    '> Initializing environment...',
    '> '
  ]);
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalOutputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { webcontainer, loading, error, ready, simulationMode } = useWebContainer();

  useEffect(() => {
    if (error) {
      if (simulationMode) {
        setOutput(prev => [
          ...prev, 
          `WebContainer initialization failed: ${error}`, 
          'Running in simulation mode. Commands are simulated and not executed in a real environment.',
          '> '
        ]);
        toast({
          title: "Simulation Mode Activated",
          description: "WebContainer could not initialize. Running in simulation mode.",
        });
      }
    } else if (!loading && ready) {
      if (simulationMode) {
        setOutput(prev => [
          ...prev, 
          'WebContainer not available. Running in simulation mode.',
          'Note: Commands are simulated and not executed in a real environment.',
          '> '
        ]);
      } else if (webcontainer) {
        setOutput(prev => [...prev, 'WebContainer is ready! You can run Node.js and npm commands.', '> ']);
      }
    }
  }, [loading, error, ready, webcontainer, simulationMode, toast]);

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
    
    if (webcontainer && ready && !simulationMode) {
      try {
        const process = await webcontainer.spawn('sh', ['-c', cmd]);
        
        process.output.pipeTo(
          new WritableStream({
            write(chunk) {
              setOutput(prev => [...prev, chunk]);
            }
          })
        );
        
        const exitCode = await process.exit;
        setOutput(prev => [...prev, `Process exited with code ${exitCode}`, '> ']);
      } catch (err) {
        console.error("Command execution error:", err);
        setOutput(prev => [...prev, `Error: ${err instanceof Error ? err.message : 'Unknown error'}`, '> ']);
      }
    } else {
      simulateCommand(cmd);
    }
  };

  const simulateCommand = (cmd: string) => {
    setTimeout(() => {
      let commandOutput: string[] = [];
      
      if (cmd.startsWith('help')) {
        commandOutput = [
          '| Available Commands in Simulation Mode:',
          '|',
          '| ls, cd        - File system navigation',
          '| git           - Git version control operations',
          '| docker        - Container operations',
          '| kubectl       - Kubernetes commands',
          '| node, npm     - JavaScript runtime and package manager',
          '| python, pip   - Python runtime and package manager',
          '| clear         - Clear the terminal screen',
          '|',
          '| Note: All commands are simulated. No real operations are performed.'
        ];
      } else if (cmd.includes('ls')) {
        commandOutput = ['app.js', 'package.json', 'node_modules/', 'README.md', '.env', 'src/'];
      } else if (cmd.includes('cd')) {
        commandOutput = [`Changed directory to ${cmd.split(' ')[1] || '~'}`];
      } else if (cmd.includes('docker')) {
        if (cmd.includes('ps')) {
          commandOutput = [
            'CONTAINER ID   IMAGE          COMMAND        CREATED       STATUS       PORTS                    NAMES',
            'a1b2c3d4e5f6   nginx:latest   "/docker-..."  2 hours ago   Up 2 hours   0.0.0.0:8080->80/tcp     web-server',
            '1a2b3c4d5e6f   mongo:latest   "docker-..."   3 hours ago   Up 3 hours   0.0.0.0:27017->27017/tcp mongodb'
          ];
        } else if (cmd.includes('build')) {
          commandOutput = [
            '[Simulated Docker Build]',
            'Step 1/10 : FROM node:18-alpine',
            ' ---> 9c6ca3b1ac50',
            'Step 2/10 : WORKDIR /app',
            ' ---> Using cache',
            ' ---> 3f9c45be7c6a',
            '...',
            'Successfully built 3f9c45be7c6a',
            'Successfully tagged my-app:latest'
          ];
        } else {
          commandOutput = ['[Simulated Docker command]', `Executed: ${cmd}`];
        }
      } else if (cmd.includes('git')) {
        if (cmd === 'git status') {
          commandOutput = ['On branch main', 'Your branch is up to date with \'origin/main\'.', 'nothing to commit, working tree clean'];
        } else if (cmd.includes('commit')) {
          commandOutput = ['[Simulated Git]', '[main a1b2c3d] ' + (cmd.includes('-m') ? cmd.split('-m')[1].trim().replace(/^['"](.*)['"]$/, '$1') : 'Commit message'), '3 files changed, 45 insertions(+), 10 deletions(-)'];
        } else {
          commandOutput = ['[Simulated Git command]', `Executed: ${cmd}`];
        }
      } else if (cmd.includes('kubectl')) {
        if (cmd.includes('get pods')) {
          commandOutput = ['NAME                     READY   STATUS    RESTARTS   AGE', 
            'api-deployment-5d4b9f    1/1     Running   0          7d',
            'db-statefulset-0          1/1     Running   0          7d',
            'redis-deployment-8f7c6c   1/1     Running   0          7d'];
        } else if (cmd.includes('apply')) {
          commandOutput = ['[Simulated Kubernetes]', `deployment.apps/${cmd.includes('deployment') ? 'api-deployment' : 'config'} configured`];
        } else {
          commandOutput = ['[Simulated Kubernetes command]', `Executed: ${cmd}`];
        }
      } else if (cmd.startsWith('node ')) {
        const scriptName = cmd.split(' ')[1];
        if (scriptName) {
          commandOutput = ['[Simulated Node.js execution]', `Running script: ${scriptName}`, 'Hello from simulated Node.js!', 'Server listening on port 3000'];
        } else {
          commandOutput = ['[Simulated Node.js REPL]', '> console.log("Hello, world!")', 'Hello, world!', 'undefined', '> '];
        }
      } else if (cmd.startsWith('npm ')) {
        if (cmd.includes('install') || cmd.includes('i ')) {
          const packageName = cmd.split('install ')[1] || cmd.split('i ')[1] || '';
          commandOutput = [
            '[Simulated NPM execution]',
            `> ${cmd}`,
            '',
            packageName ? `+ ${packageName}@1.0.0` : 'added 123 packages in 2.5s',
            '25 packages are looking for funding',
            '  run `npm fund` for details'
          ];
        } else if (cmd.includes('run')) {
          const scriptName = cmd.split('run ')[1] || 'start';
          commandOutput = [
            '[Simulated NPM execution]',
            `> ${cmd}`,
            '',
            `> project@1.0.0 ${scriptName}`,
            '> node index.js',
            '',
            scriptName === 'dev' ? 'Server running in development mode' : 'Server running at http://localhost:3000',
            'Ready for connections'
          ];
        } else if (cmd.includes('init')) {
          commandOutput = [
            '[Simulated NPM execution]',
            'This utility will walk you through creating a package.json file.',
            'It only covers the most common items, and tries to guess sensible defaults.',
            '',
            'package name: (webcontainer-project)',
            'version: (1.0.0)',
            'description:',
            'entry point: (index.js)',
            '...',
            'Is this OK? (yes)',
            '',
            'package.json created successfully'
          ];
        } else {
          commandOutput = ['[Simulated NPM execution]', `> ${cmd}`, '', '+ package@1.0.0', 'added 1 package in 0.5s'];
        }
      } else if (cmd.startsWith('python ') || cmd === 'python') {
        commandOutput = ['[Simulated Python execution]', 'Python 3.11.0', '>>> print("Hello, World!")', 'Hello, World!'];
      } else if (cmd.startsWith('pip ')) {
        commandOutput = ['[Simulated Pip execution]', 'Successfully installed requested packages'];
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
