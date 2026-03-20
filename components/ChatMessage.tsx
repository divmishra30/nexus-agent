import React from 'react';

interface ChatMessageProps {
  message: { id: string; text: string; sender: 'user' | 'assistant'; timestamp: string; };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const avatarBg = isUser ? 'bg-[var(--chatgpt-primary)]' : 'bg-[var(--chatgpt-bg-tertiary)]';
  const messageBg = isUser ? 'bg-[var(--chatgpt-bg-primary)]' : 'bg-[var(--chatgpt-bg-secondary)]';
  const textColor = isUser ? 'text-[var(--chatgpt-text-default)]' : 'text-[var(--chatgpt-text-default)]';

  return (
    <div className={`flex gap-[var(--spacing-4)] p-[var(--spacing-6)] sm:p-[var(--spacing-8)] ${messageBg}`}>
      <div className={`w-[var(--spacing-8)] h-[var(--spacing-8)] rounded-md flex items-center justify-center text-white text-[var(--font-size-lg)] font-[var(--font-weight-bold)] ${avatarBg}`}>
        {isUser ? 'U' : 'AI'}
      </div>
      <div className="flex-1">
        <div className={`font-[var(--font-weight-semibold)] text-[var(--font-size-sm)] mb-[var(--spacing-1)] ${textColor}`}>
          {isUser ? 'You' : 'ChatGPT'}
        </div>
        <p className={`text-[var(--font-size-base)] leading-relaxed ${textColor}`}>
          {message.text}
        </p>
        <span className="text-[var(--font-size-xs)] text-[var(--chatgpt-text-muted)] mt-[var(--spacing-1)] block">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
}
