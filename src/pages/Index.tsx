
import { useState, useEffect, useCallback, useRef } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import ChatPanel from '@/components/ChatPanel';
import Terminal, { TerminalRefObject } from '@/components/Terminal';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TerminalInstance {
  id: string;
  ref: React.RefObject<TerminalRefObject>;
}

export default function Index() {
  const [terminals, setTerminals] = useState<TerminalInstance[]>([]);
  const [activeTerminal, setActiveTerminal] = useState('1');
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  
  // Initialize the first terminal on component mount
  useEffect(() => {
    if (terminals.length === 0) {
      // Create the first terminal
      const firstTerminal: TerminalInstance = {
        id: '1',
        ref: useRef(null)
      };
      setTerminals([firstTerminal]);
    }
  }, []);

  const handleRunCommand = (command: string) => {
    const terminal = terminals.find(t => t.id === activeTerminal);
    if (terminal?.ref.current) {
      terminal.ref.current.executeCommand(command);
    }
  };

  const handleChatSelect = (chatId: string | null) => {
    setSelectedChat(chatId);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const addNewTerminal = useCallback(() => {
    const newId = (terminals.length + 1).toString();
    const newTerminal: TerminalInstance = {
      id: newId,
      ref: useRef(null)
    };
    setTerminals(prev => [...prev, newTerminal]);
    setActiveTerminal(newId);
  }, [terminals.length]);

  // Add keyboard shortcut to close sidebar with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSidebar) {
        setShowSidebar(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSidebar]);

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile Sidebar - Slide in from left on mobile only */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden ${
        showSidebar ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <ChatSidebar onChatSelect={handleChatSelect} />
        <button 
          onClick={toggleSidebar}
          className="absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2 bg-secondary p-2 rounded-r-md shadow-md"
          aria-label="Toggle Sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={showSidebar ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <ResizablePanelGroup direction="horizontal">
        {/* Main Content */}
        <ResizablePanel defaultSize={70} minSize={30}>
          <div className="w-full h-full flex flex-col lg:flex-row">
            {/* Sidebar (20% of left column) - Desktop only */}
            <div className="hidden lg:block w-[20%] h-full">
              <ChatSidebar onChatSelect={handleChatSelect} />
            </div>

            {/* Chat Panel (80% of left column or full width on mobile) */}
            <div className="w-full lg:w-[80%] h-full border-r border-border">
              <ChatPanel onRunCommand={handleRunCommand} selectedChat={selectedChat} />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Column - Terminal (30% on desktop, 50% height on mobile) */}
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="w-full h-full flex flex-col">
            {/* Terminal tabs */}
            <div className="flex items-center gap-2 p-2 border-b border-border bg-background">
              {terminals.map((term) => (
                <Button
                  key={term.id}
                  variant={activeTerminal === term.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTerminal(term.id)}
                  className="px-3 py-1"
                >
                  Terminal {term.id}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={addNewTerminal}
                className="px-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Active terminal */}
            <div className="flex-1">
              {terminals.map((term) => (
                <div
                  key={term.id}
                  className={`h-full ${activeTerminal === term.id ? 'block' : 'hidden'}`}
                >
                  <Terminal 
                    ref={term.ref} 
                  />
                </div>
              ))}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
