import { CustomPieces } from "react-chessboard";
import bB from "./assets/pieces/black_bishop.png";
import bK from "./assets/pieces/black_king.png";
import bN from "./assets/pieces/black_knight.png";
import bP from "./assets/pieces/black_pawn.png";
import bQ from "./assets/pieces/black_queen.png";
import bR from "./assets/pieces/black_rook.png";
import wB from "./assets/pieces/white_bishop.png";
import wK from "./assets/pieces/white_king.png";
import wN from "./assets/pieces/white_knight.png";
import wP from "./assets/pieces/white_pawn.png";
import wQ from "./assets/pieces/white_queen.png";
import wR from "./assets/pieces/white_rook.png";

export const stringToInt = (str: string): number => {
  return str.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
};

const pieces = [
  ["wN", wN],
  ["wB", wB],
  ["wR", wR],
  ["wQ", wQ],
  ["wK", wK],
  ["wP", wP],
  ["bN", bN],
  ["bB", bB],
  ["bR", bR],
  ["bQ", bQ],
  ["bK", bK],
  ["bP", bP],
];

export const customPieces = () => {
  const pieceImages: CustomPieces = {};
  pieces.forEach((piece) => {
    const [name, image] = piece;
    (pieceImages as any)[name] = ({ squareWidth }: { squareWidth: number }) => (
      <div
        style={{
          width: squareWidth,
          height: squareWidth,
          backgroundImage: `url(${image})`,
          backgroundSize: "90%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      />
    );
  });
  return pieceImages;
};
