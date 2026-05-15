import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Tic-Tac-Toe — Nexus Agent',
  description: 'Play a premium glassmorphism Tic-Tac-Toe game with score tracking.',
};

export default function TicTacToeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
