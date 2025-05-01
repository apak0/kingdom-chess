import React from "react";
import { Position } from "../types";
import { Piece as PieceComponent } from "./Piece";
import { useGameStore } from "../store/gameStore";

interface SquareProps {
  position: Position;
  isLight: boolean;
}

export const Square: React.FC<SquareProps> = ({ position, isLight }) => {
  const {
    board,
    selectedPiece,
    currentPlayer,
    selectPiece,
    movePiece,
    isValidMove,
    isCheckmate,
    isMultiplayer,
    playerColor,
    isGameStarted,
  } = useGameStore();
  const piece = board[position.y][position.x];

  // Seçilen konumu karşılaştırma
  const isSelected =
    selectedPiece &&
    selectedPiece.position.x === position.x &&
    selectedPiece.position.y === position.y;

  // Geçerli hedef kontrolü
  const isValidTarget = selectedPiece && !isSelected;

  const handleClick = () => {
    // Oyun bittiyse işlem yapma
    if (isCheckmate) return;

    // Çoklu oyuncu modunda, oyun başlamadıysa işlem yapma
    if (isMultiplayer && !isGameStarted) return;

    if (isMultiplayer) {
      // Multiplayer modunda, sadece kendi rengimizde olan taşları seçebiliriz
      if (piece && piece.color === playerColor) {
        selectPiece(position);
        return;
      }

      // Eğer zaten bir taş seçiliyse ve geçerli bir hedefse hamle yap
      if (selectedPiece && isValidTarget) {
        movePiece(selectedPiece.position, position);
        return;
      }
    } else {
      // Tek oyuncu modunda, sadece beyaz taşları seçebiliriz (AI siyah taşları kontrol eder)
      if (piece && piece.color === currentPlayer) {
        selectPiece(position);
        return;
      }

      // Eğer zaten bir taş seçiliyse ve geçerli bir hedefse hamle yap
      if (selectedPiece && isValidTarget) {
        movePiece(selectedPiece.position, position);
        return;
      }
    }
  };

  // Seçilen taşın gidebileceği bir konum mu?
  const canMoveTo =
    selectedPiece &&
    !isSelected &&
    isValidMove(selectedPiece.position, position);

  // İmleç görünümünü belirleme
  const getPointerStyle = () => {
    if (isCheckmate) return "cursor-default";

    if (isMultiplayer) {
      // Çok oyunculu modda oyun başlamadıysa işaretçiyi devre dışı bırak
      if (!isGameStarted) return "cursor-default";

      // Kendi rengimizdeki taşlar veya hamle yapılabilecek yerler için pointer
      if (piece?.color === playerColor || canMoveTo) return "cursor-pointer";

      return "cursor-default";
    } else {
      // Tek oyuncu modunda sırası gelen oyuncunun taşları ve hamle yapılabilecek yerler için pointer
      if (piece?.color === currentPlayer || canMoveTo) return "cursor-pointer";

      return "cursor-default";
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        aspect-square w-full h-full flex items-center justify-center relative
        ${isLight ? "bg-[#D4A373]" : "bg-[#8B5E34]"}
        ${isSelected ? "ring-4 ring-[#4A3728] ring-opacity-90 shadow-lg" : ""}
        transition-colors duration-200
        ${getPointerStyle()}
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
