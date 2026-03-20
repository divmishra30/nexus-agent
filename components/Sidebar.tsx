'use client';

import Link from 'next/link';
import React from 'react';

interface SidebarProps {
  onNewChat: () => void;
}

export default function Sidebar({ onNewChat }: SidebarProps) {
  const chatHistory = [
    { id: '1', title: 'Conversation about AI' },
    { id: '2', title: 'Brainstorming Next.js features' },
    { id: '3', title: 'Recipe for chocolate cake' },
    { id: '4', title: 'Quantum physics explained' },
    { id: '5', title: 'Next.js project setup' },
    { id: '6', title: 'Tailwind CSS tips' },
    { id: '7', title: 'JavaScript async/await' },
    { id: '8', title: 'Favorite sci-fi books' },
    { id: '9', title: 'History of the internet' },
    { id: '10', title: 'Gardening advice for beginners' },
    { id: '11', title: 'Morning workout routine' },
    { id: '12', title: 'Latest tech news summary' },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-[var(--chatgpt-bg-secondary)] text-[var(--chatgpt-text-default)] flex flex-col z-40">
      {/* New Chat Button */}
      <div className="p-[var(--spacing-4)] border-b border-[var(--chatgpt-border-default)]">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-[var(--spacing-2)] px-[var(--spacing-4)] py-[var(--spacing-3)] rounded-[var(--radius-md)] bg-[var(--chatgpt-primary)] hover:bg-[var(--chatgpt-primary-hover)] text-white font-[var(--font-weight-semibold)] transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto mt-[var(--spacing-2)]">
        <nav>
          <ul className="space-y-[var(--spacing-2)] p-[var(--spacing-4)]">
            {chatHistory.map((chat) => (
              <li key={chat.id}>
                <Link
                  href={`/chatgpt/${chat.id}`}
                  className="flex items-center gap-[var(--spacing-2)] px-[var(--spacing-3)] py-[var(--spacing-2)] rounded-[var(--radius-sm)] text-[var(--font-size-sm)] text-[var(--chatgpt-text-default)] hover:bg-[var(--chatgpt-bg-tertiary)] transition-colors duration-200 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[var(--chatgpt-text-muted)] group-hover:text-[var(--chatgpt-text-default)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.583 1.185 2.871 2.812 2.936v.201c-.139 1.637 1.05 3.107 2.657 3.107H19.5a3.75 3.75 0 0 0 3.75-3.75V12.75a3.75 3.75 0 0 0-3.75-3.75H9.866c-.677 0-1.345-.027-2.002-.075L4.921 8.751C3.37 8.62 2.25 10.038 2.25 12.76Z" />
                  </svg>
                  <span className="truncate">{chat.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* User Settings/Account Options */}
      <div className="p-[var(--spacing-4)] border-t border-[var(--chatgpt-border-default)]">
        <ul className="space-y-[var(--spacing-2)]">
          <li>
            <button className="w-full flex items-center gap-[var(--spacing-2)] px-[var(--spacing-3)] py-[var(--spacing-2)] rounded-[var(--radius-sm)] text-[var(--font-size-sm)] text-[var(--chatgpt-text-default)] hover:bg-[var(--chatgpt-bg-tertiary)] transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              My Account
            </button>
          </li>
          <li>
            <button className="w-full flex items-center gap-[var(--spacing-2)] px-[var(--spacing-3)] py-[var(--spacing-2)] rounded-[var(--radius-sm)] text-[var(--font-size-sm)] text-[var(--chatgpt-text-default)] hover:bg-[var(--chatgpt-bg-tertiary)] transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              Log out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
