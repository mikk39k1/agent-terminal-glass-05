
import React from 'react';
import CommandBlock from './CommandBlock';

interface MessageBubbleProps {
  isUser: boolean;
  content: string;
  timestamp: string;
  onRunCommand: (command: string) => void;
}

export default function MessageBubble({ isUser, content, timestamp, onRunCommand }: MessageBubbleProps) {
  // Function to detect and extract code blocks
  const renderContent = () => {
    // Simple regex to detect possible shell commands
    // This is a basic implementation - could be enhanced for more complex detection
    const codeBlockRegex = /```(bash|sh)?\s*([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    // Find all code blocks
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before the code block
      if (match.index > lastIndex) {
        parts.push(
          <p key={`text-${lastIndex}`} className="mb-2">
            {content.slice(lastIndex, match.index)}
          </p>
        );
      }
      
      // Add the code block
      const code = match[2].trim();
      if (!isUser) {
        parts.push(
          <CommandBlock key={`code-${match.index}`} command={code} onRun={onRunCommand} />
        );
      } else {
        parts.push(
          <pre key={`code-${match.index}`} className="bg-chat-code p-3 rounded-md my-2 text-sm overflow-x-auto">
            <code>{code}</code>
          </pre>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < content.length) {
      parts.push(
        <p key={`text-${lastIndex}`}>
          {content.slice(lastIndex)}
        </p>
      );
    }
    
    return parts.length > 0 ? parts : <p>{content}</p>;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`max-w-[80%] ${isUser ? 'bg-chat-user' : 'bg-chat-agent'} p-3 rounded-lg shadow-sm`}>
        <div className="text-sm">
          {renderContent()}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {timestamp}
        </div>
      </div>
    </div>
  );
}
