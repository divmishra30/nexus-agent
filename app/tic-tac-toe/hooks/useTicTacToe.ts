'use client';

import { useState, useCallback, useEffect } from 'react';

export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type BoardState = CellValue[];

export interface GameScore {
  X: number;
  O: number;
  draws: number;
}

export interface GameState {
  board: BoardState;
  currentPlayer: Player;
  winner: Player | null;
  isDraw: boolean;
  winningCells: number[];
  scores: GameScore;
  isGameOver: boolean;
}

export interface GameActions {
  handleCellClick: (index: number) => void;
  resetGame: () => void;
  resetScores: () => void;
}

const WINNING_COMBINATIONS = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // middle column
  [2, 5, 8], // right column
  [0, 4, 8], // diagonal top-left to bottom-right
  [2, 4, 6], // diagonal top-right to bottom-left
];

export function calculateWinner(squares: BoardState): { winner: Player; cells: number[] } | null {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a] as Player, cells: [a, b, c] };
    }
  }
  return null;
}

const INITIAL_BOARD: BoardState = Array(9).fill(null);
const INITIAL_SCORES: GameScore = { X: 0, O: 0, draws: 0 };
const SCORES_STORAGE_KEY = 'nexus-ttt-scores';

export function useTicTacToe(): GameState & GameActions {
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [scores, setScores] = useState<GameScore>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(SCORES_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return INITIAL_SCORES;
  });

  // Persist scores to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(scores));
    }
  }, [scores]);

  const handleCellClick = useCallback(
    (index: number) => {
      if (winner || isDraw || board[index] !== null) return;

      const newBoard = [...board];
      newBoard[index] = currentPlayer;
      setBoard(newBoard);

      const result = calculateWinner(newBoard);
      if (result) {
        setWinner(result.winner);
        setWinningCells(result.cells);
        setScores((prev) => ({
          ...prev,
          [result.winner]: prev[result.winner] + 1,
        }));
      } else if (newBoard.every((cell) => cell !== null)) {
        setIsDraw(true);
        setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
      } else {
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      }
    },
    [board, currentPlayer, winner, isDraw]
  );

  const resetGame = useCallback(() => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer('X');
    setWinner(null);
    setIsDraw(false);
    setWinningCells([]);
  }, []);

  const resetScores = useCallback(() => {
    setScores(INITIAL_SCORES);
    resetGame();
  }, [resetGame]);

  const isGameOver = winner !== null || isDraw;

  return {
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
  };
}
