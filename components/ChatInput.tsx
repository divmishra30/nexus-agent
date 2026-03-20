'use client';

import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto flex items-center gap-3">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Message Nexus App..."
        className="flex-1 p-3 rounded-md border border-chatgpt-border-default bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-chatgpt-primary resize-none"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        style={{ minHeight: '2.75rem', maxHeight: '10rem' }} // Ensure it's at least one line and expands up to 10rem
      />
      <button
        type="submit"
        className="flex items-center justify-center w-10 h-10 rounded-md bg-chatgpt-primary hover:bg-chatgpt-primary-hover text-white transition-colors duration-200"
        disabled={!input.trim()}
        aria-label="Send message"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </button>
    </form>
  );
}
