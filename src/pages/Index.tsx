import { useState, useEffect, useCallback } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import ChatPanel from '@/components/ChatPanel';
import Terminal, { TerminalRefObject } from '@/components/Terminal';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TerminalInstance {
  id: string;
  ref: React.RefObject<TerminalRefObject> | null;
}

export default function Index() {
  const [terminals, setTerminals] = useState<TerminalInstance[]>([]);
  const [activeTerminal, setActiveTerminal] = useState('1');
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  
  useEffect(() => {
    if (terminals.length === 0) {
      const firstTerminal: TerminalInstance = {
        id: '1',
        ref: null
      };
      setTerminals([firstTerminal]);
    }
  }, []);

  const handleRunCommand = (command: string) => {
    const terminal = terminals.find(t => t.id === activeTerminal);
    if (terminal?.ref?.current) {
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
      ref: null
    };
    setTerminals(prev => [...prev, newTerminal]);
    setActiveTerminal(newId);
  }, [terminals.length]);

  const removeTerminal = useCallback((terminalId: string) => {
    setTerminals(prev => {
      const newTerminals = prev.filter(t => t.id !== terminalId);
      if (activeTerminal === terminalId && newTerminals.length > 0) {
        setActiveTerminal(newTerminals[newTerminals.length - 1].id);
      }
      return newTerminals;
    });
  }, [activeTerminal]);

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
        <ResizablePanel defaultSize={70} minSize={30}>
          <div className="w-full h-full flex flex-col lg:flex-row">
            <div className="hidden lg:block w-[20%] h-full">
              <ChatSidebar onChatSelect={handleChatSelect} />
            </div>
            <div className="w-full lg:w-[80%] h-full border-r border-border">
              <ChatPanel onRunCommand={handleRunCommand} selectedChat={selectedChat} />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="w-full h-full flex flex-col">
            <div className="flex items-center gap-2 p-2 border-b border-border bg-background">
              {terminals.map((term) => (
                <div key={term.id} className="relative group">
                  <Button
                    variant={activeTerminal === term.id ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTerminal(term.id)}
                    className="px-3 py-1 pr-8"
                  >
                    Terminal {term.id}
                  </Button>
                  {terminals.length > 1 && (
                    <button
                      onClick={() => removeTerminal(term.id)}
                      className="absolute top-1/2 right-1 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-destructive"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                </div>
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
            
            <div className="flex-1">
              {terminals.map((term) => (
                <div
                  key={term.id}
                  className={`h-full ${activeTerminal === term.id ? 'block' : 'hidden'}`}
                >
                  <Terminal 
                    ref={(instance) => { 
                      if (term) {
                        term.ref = instance ? { current: instance } : null;
                      }
                    }} 
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
