
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
      <pre className="p-4 bg-chat-code text-black font-mono overflow-x-auto text-sm rounded-md">
        <code>{command}</code>
      </pre>
      
      <button 
        onClick={() => onRun(command)}
        className={`absolute right-2 top-2 bg-black text-white px-3 py-1 rounded-md flex items-center gap-1 text-xs font-semibol`}
      >
        <Play size={14} />
        Run
      </button>
    </div>
  );
}
