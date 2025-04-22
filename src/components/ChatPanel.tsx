
import { useState, useRef, useEffect } from 'react';
import { Send, Github } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ThemeToggle from './ThemeToggle';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatPanelProps {
  onRunCommand: (command: string) => void;
}

export default function ChatPanel({ onRunCommand }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your DevOps agent. How can I help you today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate agent response (in a real app, this would be an API call)
    setTimeout(() => {
      let responseContent: string;
      
      // Simple response logic based on user input
      if (input.toLowerCase().includes('docker')) {
        responseContent = "It looks like you're working with Docker. Here's a command to check your running containers:\n\n```bash\ndocker ps\n```\n\nOr would you like to see how to create a new container?";
      } else if (input.toLowerCase().includes('git')) {
        responseContent = "For Git operations, you can check your current status with:\n\n```bash\ngit status\n```\n\nOr view your commit history:\n\n```bash\ngit log --oneline\n```";
      } else if (input.toLowerCase().includes('kubernetes') || input.toLowerCase().includes('k8s')) {
        responseContent = "For Kubernetes, you can check your running pods with:\n\n```bash\nkubectl get pods\n```\n\nOr get more detailed information about a specific pod:\n\n```bash\nkubectl describe pod [pod-name]\n```";
      } else {
        responseContent = "I can help you with various DevOps tasks like Docker, Kubernetes, CI/CD pipelines, and more. What specific task are you working on?";
      }
      
      const agentMessage: Message = {
        id: Date.now().toString(),
        content: responseContent,
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, agentMessage]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConnectGithub = () => {
    alert('GitHub integration would open a modal here for OAuth authentication.');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl font-semibold">DevOps Agent</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleConnectGithub}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
          >
            <Github size={16} />
            Connect GitHub
          </button>
          <ThemeToggle />
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(message => (
          <MessageBubble 
            key={message.id}
            isUser={message.isUser}
            content={message.content}
            timestamp={message.timestamp}
            onRunCommand={onRunCommand}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 bg-background rounded-md border border-input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 p-3 bg-transparent resize-none focus:outline-none min-h-[2.5rem] max-h-[10rem]"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="p-3 text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
