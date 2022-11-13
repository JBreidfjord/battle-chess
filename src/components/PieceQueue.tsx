import bishop from "../assets/pieces/black_bishop.png";
import king from "../assets/pieces/black_king.png";
import knight from "../assets/pieces/black_knight.png";
import pawn from "../assets/pieces/black_pawn.png";
import queen from "../assets/pieces/black_queen.png";
import rook from "../assets/pieces/black_rook.png";

const pieceImageMap: Record<number, string> = {
  1: pawn,
  2: knight,
  3: bishop,
  4: rook,
  5: queen,
  6: king,
};

interface PieceQueueProps {
  queue: number[];
  size: number;
}

export default function PieceQueue({ queue, size }: PieceQueueProps) {
  return (
    <div className="piece-queue">
      {queue.reverse().map((piece, i) => {
        return <img key={i} src={pieceImageMap[piece]} alt="piece" width={size} height={size} />;
      })}
    </div>
  );
}
