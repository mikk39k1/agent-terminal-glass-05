
import { useState, useRef, useEffect } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import ChatPanel from '@/components/ChatPanel';
import Terminal, { TerminalRefObject } from '@/components/Terminal';

export default function Index() {
  const terminalRef = useRef<TerminalRefObject>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  
  const handleRunCommand = (command: string) => {
    if (terminalRef.current) {
      // Actually execute the command in the terminal
      terminalRef.current.executeCommand(command);
    }
  };
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
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
        <ChatSidebar />
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

      {/* Main Content */}
      <div className="w-full lg:w-[70%] h-1/2 lg:h-full flex flex-col lg:flex-row">
        {/* Sidebar (20% of left column) - Desktop only */}
        <div className="hidden lg:block w-[20%] h-full">
          <ChatSidebar />
        </div>
        
        {/* Chat Panel (80% of left column or full width on mobile) */}
        <div className="w-full lg:w-[80%] h-full border-r border-border">
          <ChatPanel onRunCommand={handleRunCommand} />
        </div>
      </div>
      
      {/* Right Column - Terminal (30% on desktop, 50% height on mobile) */}
      <div className="w-full lg:w-[30%] h-1/2 lg:h-full">
        <Terminal ref={terminalRef} />
      </div>
    </div>
  );
}
