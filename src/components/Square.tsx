import React from 'react';
import { Position } from '../types';
import { Piece as PieceComponent } from './Piece';
import { useGameStore } from '../store/gameStore';

interface SquareProps {
  position: Position;
  isLight: boolean;
}

export const Square: React.FC<SquareProps> = ({ position, isLight }) => {
  const { board, selectedPiece, currentPlayer, selectPiece, movePiece, isValidMove, isCheckmate } = useGameStore();
  const piece = board[position.y][position.x];
  const isSelected = selectedPiece?.x === position.x && selectedPiece?.y === position.y;
  const isValidTarget = selectedPiece && piece?.color === currentPlayer;
  
  const handleClick = () => {
    if (isCheckmate) return;
    
    if (piece && piece.color === currentPlayer) {
      if (!selectedPiece || (selectedPiece.x !== position.x || selectedPiece.y !== position.y)) {
        selectPiece(position);
        return;
      }
      if (isSelected) {
        selectPiece(null);
        return;
      }
    }
    
    if (selectedPiece && !isValidTarget) {
      movePiece(selectedPiece, position);
    }
  };

  const canMoveTo = selectedPiece && !isSelected && 
    board[selectedPiece.y][selectedPiece.x] &&
    isValidMove(selectedPiece, position, board, board[selectedPiece.y][selectedPiece.x]!);

  return (
    <div
      onClick={handleClick}
      className={`
        aspect-square w-full h-full flex items-center justify-center relative
        ${isLight ? 'bg-[#D4A373]' : 'bg-[#8B5E34]'}
        ${isSelected ? 'ring-4 ring-[#4A3728] ring-opacity-90 shadow-lg' : ''}
        transition-colors duration-200
        ${(piece?.color === currentPlayer || canMoveTo) && !isCheckmate ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      {piece && <PieceComponent piece={piece} isSelected={isSelected} />}
      {canMoveTo && !isCheckmate && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/30 to-amber-300/30 rounded-sm" />
          <div className="absolute inset-0 border-2 border-amber-400/50 rounded-sm shadow-[inset_0_0_10px_rgba(251,191,36,0.2)]" />
          <div className="absolute inset-[2px] rounded-sm shadow-[inset_0_0_15px_rgba(251,191,36,0.1)]" />
        </>
      )}
    </div>
  );
};