'use client';

import React from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export default function ChatWindow({ messages, onSendMessage }: ChatWindowProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-pink-500 text-white">
      {/* Chat Header */}
      <div className="sticky top-0 z-10 p-4 border-b border-chatgpt-border-default text-center font-semibold">
        New Chat
      </div>

      {/* Message Display Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar-chatgpt" style={{ scrollBehavior: 'smooth' }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-2xl font-bold mb-4">How can I help you today?</p>
            <p>Start a conversation by typing below.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="sticky bottom-0 pt-4 pb-8 sm:pb-12 border-t border-chatgpt-border-default">
        <ChatInput onSendMessage={onSendMessage} />
      </div>

      <style jsx global>{`
        .custom-scrollbar-chatgpt::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar-chatgpt::-webkit-scrollbar-track {
          background: #EC4899; /* Tailwind pink-500 hex */
        }
        .custom-scrollbar-chatgpt::-webkit-scrollbar-thumb {
          background-color: var(--chatgpt-border-default);
          border-radius: 4px;
          border: 2px solid #EC4899; /* Border color matches new background */
        }
      `}</style>
    </div>
  );
}
