'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTicTacToe, CellValue, Player } from './hooks/useTicTacToe';

// ─── Cell Component ───────────────────────────────────────────────────────────

interface CellProps {
  value: CellValue;
  index: number;
  isWinning: boolean;
  isGameOver: boolean;
  onClick: () => void;
}

function TicTacToeCell({ value, index, isWinning, isGameOver, onClick }: CellProps) {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  const isEmpty = value === null;

  const ariaLabel = `Row ${row} column ${col}, ${
    value ? value : 'empty'
  }`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      role="gridcell"
      aria-label={ariaLabel}
      aria-disabled={!isEmpty || isGameOver}
      tabIndex={isEmpty && !isGameOver ? 0 : -1}
      onClick={isEmpty && !isGameOver ? onClick : undefined}
      onKeyDown={isEmpty && !isGameOver ? handleKeyDown : undefined}
      className={[
        'relative flex items-center justify-center rounded-2xl transition-all duration-200 select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
        isEmpty && !isGameOver
          ? 'cursor-pointer hover:bg-white/10 active:scale-95'
          : 'cursor-default',
        isWinning
          ? value === 'X'
            ? 'bg-[hsl(200,90%,60%)]/20 winning-cell-x'
            : 'bg-[hsl(340,85%,65%)]/20 winning-cell-o'
          : 'bg-white/5',
      ].join(' ')}
      style={{
        aspectRatio: '1',
        border: isWinning
          ? `2px solid ${
              value === 'X' ? 'hsl(200,90%,60%)' : 'hsl(340,85%,65%)'
            }`
          : '2px solid rgba(255,255,255,0.08)',
        boxShadow: isWinning
          ? `0 0 24px ${
              value === 'X'
                ? 'hsla(200,90%,60%,0.5)'
                : 'hsla(340,85%,65%,0.5)'
            }, inset 0 0 12px ${
              value === 'X'
                ? 'hsla(200,90%,60%,0.15)'
                : 'hsla(340,85%,65%,0.15)'
            }`
          : 'none',
      }}
      whileHover={
        isEmpty && !isGameOver ? { scale: 1.04, backgroundColor: 'rgba(255,255,255,0.08)' } : {}
      }
      whileTap={isEmpty && !isGameOver ? { scale: 0.96 } : {}}
    >
      <AnimatePresence mode="wait">
        {value && (
          <motion.span
            key={value}
            initial={{ scale: 0, rotate: -15, opacity: 0 }}
            animate={{
              scale: isWinning ? [1, 1.12, 1] : 1,
              rotate: 0,
              opacity: 1,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 20,
              scale: isWinning
                ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
                : undefined,
            }}
            className="text-4xl sm:text-5xl font-black leading-none"
            style={{
              color:
                value === 'X' ? 'hsl(200,90%,60%)' : 'hsl(340,85%,65%)',
              textShadow: isWinning
                ? `0 0 20px ${
                    value === 'X'
                      ? 'hsla(200,90%,60%,0.8)'
                      : 'hsla(340,85%,65%,0.8)'
                  }`
                : 'none',
            }}
          >
            {value}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Hover ghost mark */}
      {isEmpty && !isGameOver && (
        <span className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-20 transition-opacity duration-200 text-4xl font-black text-white pointer-events-none">
          ·
        </span>
      )}
    </motion.div>
  );
}

// ─── Board Component ──────────────────────────────────────────────────────────

interface BoardProps {
  board: CellValue[];
  winningCells: number[];
  isGameOver: boolean;
  onCellClick: (index: number) => void;
  resetKey: number;
}

function TicTacToeBoard({ board, winningCells, isGameOver, onCellClick, resetKey }: BoardProps) {
  return (
    <motion.div
      key={resetKey}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      role="grid"
      aria-label="Tic-Tac-Toe board"
      className="grid grid-cols-3 gap-3 w-full"
      style={{ maxWidth: 'min(80vw, 400px)' }}
    >
      {board.map((cell, index) => (
        <TicTacToeCell
          key={index}
          value={cell}
          index={index}
          isWinning={winningCells.includes(index)}
          isGameOver={isGameOver}
          onClick={() => onCellClick(index)}
        />
      ))}
    </motion.div>
  );
}

// ─── Status Component ─────────────────────────────────────────────────────────

interface StatusProps {
  winner: Player | null;
  isDraw: boolean;
  currentPlayer: Player;
}

function TicTacToeStatus({ winner, isDraw, currentPlayer }: StatusProps) {
  const statusText = winner
    ? `Player ${winner} wins! 🎉`
    : isDraw
    ? "It's a draw! 🤝"
    : `Player ${currentPlayer}'s turn`;

  const statusColor = winner
    ? winner === 'X'
      ? 'hsl(200,90%,60%)'
      : 'hsl(340,85%,65%)'
    : isDraw
    ? 'hsl(45,90%,65%)'
    : currentPlayer === 'X'
    ? 'hsl(200,90%,60%)'
    : 'hsl(340,85%,65%)';

  return (
    <div aria-live="polite" aria-atomic="true" className="h-14 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={statusText}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="text-xl sm:text-2xl font-black tracking-tight text-center"
          style={{ color: statusColor }}
        >
          {statusText}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Scoreboard Component ─────────────────────────────────────────────────────

interface ScoreboardProps {
  scores: { X: number; O: number; draws: number };
  onReset: () => void;
}

function TicTacToeScoreboard({ scores, onReset }: ScoreboardProps) {
  const items = [
    { label: 'Player X', value: scores.X, color: 'hsl(200,90%,60%)', bg: 'hsla(200,90%,60%,0.1)', border: 'hsla(200,90%,60%,0.3)' },
    { label: 'Draws', value: scores.draws, color: 'hsl(45,90%,65%)', bg: 'hsla(45,90%,65%,0.1)', border: 'hsla(45,90%,65%,0.3)' },
    { label: 'Player O', value: scores.O, color: 'hsl(340,85%,65%)', bg: 'hsla(340,85%,65%,0.1)', border: 'hsla(340,85%,65%,0.3)' },
  ];

  return (
    <div className="w-full" style={{ maxWidth: 'min(80vw, 400px)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-white/40">Scoreboard</span>
        <button
          onClick={onReset}
          className="text-xs font-bold text-white/40 hover:text-white/70 transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-white/10"
        >
          Reset Scores
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <motion.div
            key={item.label}
            className="flex flex-col items-center justify-center py-4 rounded-2xl"
            style={{
              background: item.bg,
              border: `1px solid ${item.border}`,
            }}
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <motion.span
              key={item.value}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="text-3xl font-black tabular-nums"
              style={{ color: item.color }}
            >
              {item.value}
            </motion.span>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: item.color, opacity: 0.7 }}>
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function TicTacToePage() {
  const {
    board,
    currentPlayer,
    winner,
    isDraw,
    winningCells,
    scores,
    isGameOver,
    handleCellClick,
    resetGame,
    resetScores,
  } = useTicTacToe();

  // Track reset count to re-key the board for animation
  const resetCountRef = React.useRef(0);
  const [resetKey, setResetKey] = React.useState(0);

  const handleReset = () => {
    resetCountRef.current += 1;
    setResetKey(resetCountRef.current);
    resetGame();
  };

  const handleResetScores = () => {
    resetCountRef.current += 1;
    setResetKey(resetCountRef.current);
    resetScores();
  };

  return (
    <>
      {/* Scoped styles for winning cell glow animation */}
      <style jsx global>{`
        @keyframes winning-pulse-x {
          0%, 100% { box-shadow: 0 0 16px hsla(200,90%,60%,0.4), inset 0 0 8px hsla(200,90%,60%,0.1); }
          50% { box-shadow: 0 0 32px hsla(200,90%,60%,0.8), inset 0 0 16px hsla(200,90%,60%,0.2); }
        }
        @keyframes winning-pulse-o {
          0%, 100% { box-shadow: 0 0 16px hsla(340,85%,65%,0.4), inset 0 0 8px hsla(340,85%,65%,0.1); }
          50% { box-shadow: 0 0 32px hsla(340,85%,65%,0.8), inset 0 0 16px hsla(340,85%,65%,0.2); }
        }
        .winning-cell-x { animation: winning-pulse-x 1.4s ease-in-out infinite; }
        .winning-cell-o { animation: winning-pulse-o 1.4s ease-in-out infinite; }
      `}</style>

      <main
        className="relative flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] py-12 px-4 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(240,20%,10%) 0%, hsl(260,30%,15%) 100%)',
        }}
      >
        {/* Ambient background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, hsl(200,90%,60%) 0%, transparent 70%)',
              top: '-10%',
              left: '-10%',
            }}
          />
          <div
            className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, hsl(340,85%,65%) 0%, transparent 70%)',
              bottom: '-10%',
              right: '-10%',
            }}
          />
          <div
            className="absolute w-64 h-64 rounded-full opacity-10 blur-2xl"
            style={{
              background: 'radial-gradient(circle, hsl(280,80%,65%) 0%, transparent 70%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center gap-8 w-full"
          style={{ maxWidth: 'min(90vw, 480px)' }}
        >
          {/* Header */}
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-2"
            >
              Tic-Tac-{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, hsl(200,90%,60%), hsl(340,85%,65%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Toe
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/40 text-sm font-medium"
            >
              Classic game, premium experience
            </motion.p>
          </div>

          {/* Scoreboard */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-full"
          >
            <TicTacToeScoreboard scores={scores} onReset={handleResetScores} />
          </motion.div>

          {/* Glass card containing status + board */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full flex flex-col items-center gap-6 p-6 sm:p-8 rounded-3xl"
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
            }}
          >
            {/* Status */}
            <TicTacToeStatus
              winner={winner}
              isDraw={isDraw}
              currentPlayer={currentPlayer}
            />

            {/* Board */}
            <TicTacToeBoard
              board={board}
              winningCells={winningCells}
              isGameOver={isGameOver}
              onCellClick={handleCellClick}
              resetKey={resetKey}
            />

            {/* Action buttons */}
            <div className="flex gap-3 w-full">
              <AnimatePresence>
                {isGameOver && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    onClick={handleReset}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all duration-200 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, hsl(200,90%,60%), hsl(260,80%,65%))',
                      color: '#fff',
                      boxShadow: '0 8px 24px hsla(200,90%,60%,0.3)',
                    }}
                    whileHover={{ scale: 1.03, boxShadow: '0 12px 32px hsla(200,90%,60%,0.4)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Play Again
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.button
                onClick={handleReset}
                className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.6)',
                }}
                whileHover={{
                  background: 'rgba(255,255,255,0.14)',
                  color: 'rgba(255,255,255,0.9)',
                  scale: 1.02,
                }}
                whileTap={{ scale: 0.97 }}
              >
                New Game
              </motion.button>
            </div>
          </motion.div>

          {/* Player legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-6 text-xs font-bold uppercase tracking-widest"
          >
            <span style={{ color: 'hsl(200,90%,60%)' }}>✕ Electric Blue</span>
            <span className="text-white/20">vs</span>
            <span style={{ color: 'hsl(340,85%,65%)' }}>○ Coral Pink</span>
          </motion.div>
        </motion.div>
      </main>
    </>
  );
}
