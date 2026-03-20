'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatWindow, { Message } from '@/components/ChatWindow';
import { v4 as uuidv4 } from 'uuid';

export default function ChatGPTPage() {
  const [messages, setMessages] = useState<Message[]>([]);

  // Dummy handler for new chat
  const handleNewChat = useCallback(() => {
    setMessages([]);
    // In a real app, this would create a new chat session
    console.log('New chat initiated');
  }, []);

  // Dummy handler for sending messages
  const handleSendMessage = useCallback((text: string) => {
    if (text.trim() === '') return;

    const newUserMessage: Message = {
      id: uuidv4(),
      text,
      sender: 'user',
      timestamp: new Date().toLocaleString(),
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: uuidv4(),
        text: `Echo: ${text}`, // Simple echo response
        sender: 'assistant',
        timestamp: new Date().toLocaleString(),
      };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
    }, 1000);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar onNewChat={handleNewChat} />
      <div className="flex-1 ml-64 rounded-md overflow-hidden">{/* Added rounded-md and overflow-hidden here */} 
        <ChatWindow messages={messages} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
