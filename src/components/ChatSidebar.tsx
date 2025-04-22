
import { useState } from 'react';
import { PlusCircle, ChevronRight } from 'lucide-react';

interface ChatItem {
  id: string;
  title: string;
  date: string;
}

export default function ChatSidebar() {
  // Sample chat history data
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([
    { id: '1', title: 'Docker Compose Setup', date: '2 days ago' },
    { id: '2', title: 'GitHub Actions CI', date: '3 days ago' },
    { id: '3', title: 'Kubernetes Deployment', date: '5 days ago' },
    { id: '4', title: 'AWS Lambda Functions', date: '1 week ago' },
    { id: '5', title: 'Nginx Configuration', date: '2 weeks ago' },
  ]);

  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const handleNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      date: 'Just now'
    };
    setChatHistory([newChat, ...chatHistory]);
    setSelectedChat(newChat.id);
  };

  return (
    <div className="h-full flex flex-col bg-secondary dark:bg-secondary border-r border-border">
      {/* New Chat Button */}
      <div className="p-4">
        <button 
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <PlusCircle size={16} />
          <span>New Chat</span>
        </button>
      </div>
      
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-2">
        <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-2">CHAT HISTORY</h2>
        <ul className="space-y-1">
          {chatHistory.map(chat => (
            <li key={chat.id}>
              <button
                onClick={() => setSelectedChat(chat.id)}
                className={`w-full text-left p-2 rounded-md text-sm flex items-center justify-between group hover:bg-accent/20 transition-colors ${
                  selectedChat === chat.id ? 'bg-accent/20 font-medium' : ''
                }`}
              >
                <div className="truncate flex-1">
                  <span>{chat.title}</span>
                  <p className="text-xs text-muted-foreground">{chat.date}</p>
                </div>
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
