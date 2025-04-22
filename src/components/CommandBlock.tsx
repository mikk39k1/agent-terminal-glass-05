
import { useState } from 'react';
import { Play } from 'lucide-react';

interface CommandBlockProps {
  command: string;
  onRun: (command: string) => void;
}

export default function CommandBlock({ command, onRun }: CommandBlockProps) {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <div 
      className="relative group rounded-md overflow-hidden my-2"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <pre className="p-4 bg-chat-code text-terminal-text font-mono overflow-x-auto text-sm rounded-md">
        <code>{command}</code>
      </pre>
      
      <button 
        onClick={() => onRun(command)}
        className={`absolute right-2 top-2 bg-terminal-text text-black px-3 py-1 rounded-md flex items-center gap-1 text-xs font-semibold transition-opacity ${
          isHovering ? 'opacity-100' : 'opacity-0'
        } hover:bg-chat-run/90`}
      >
        <Play size={14} />
        Run
      </button>
    </div>
  );
}
