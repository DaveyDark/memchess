import { Chessboard } from "react-chessboard";
import { useSocket } from "./SocketProvider";
import { useEffect, useState } from "react";
import { Square, Piece } from "react-chessboard/dist/chessboard/types";
import { Chess } from "chess.js";

const ChessBoard = () => {
  const socket = useSocket();
  const [boardLock, setBoardLock] = useState(false);
  const [game, setGame] = useState(new Chess());

  useEffect(() => {
    socket!.on("turn", (player: string) => {
      setBoardLock(player !== socket!.id);
    });
    socket!.on("piece_moved", (data: { from: Square; to: Square }) => {
      setGame((prev) => {
        const gameCopy = new Chess(prev.fen());
        gameCopy.move({
          ...data,
          promotion: "q",
        });
        return gameCopy;
      });
    });
    socket!.on(
      "checkmate",
      (data: {
        winner: string;
        winner_name: string;
        loser: string;
        loser_name: string;
      }) => {
        alert(`Checkmate! ${data.winner_name} wins!`);
      },
    );
    socket!.on("stalemate", () => {
      alert("Stalemate! The game is a draw!");
    });

    return () => {
      socket!.off("turn");
      socket!.off("piece_moved");
      socket!.off("checkmate");
    };
  }, []);

  const handleMove = (from: Square, to: Square): boolean => {
    const gameCopy = new Chess(game.fen());

    try {
      gameCopy.move({
        from: from,
        to: to,
        promotion: "q",
      });
    } catch (e) {
      // illegal move
      alert(game.fen());
      return false;
    }

    setGame(gameCopy);
    return true;
  };

  const movePiece = (from: Square, to: Square) => {
    const legal = handleMove(from, to);
    if (!legal) return false;
    socket!.emit("move_piece", { from, to });
    return true;
  };

  const isMovable = ({ piece }: { piece: Piece; sourceSquare: Square }) => {
    return piece.charAt(0) === game.turn().toLowerCase();
  };

  return (
    <div className="my-auto p-3 bg-secondary rounded-md shadow-md w-full flex-1 relative">
      <div
        className={`w-full grow h-full aspect-square border-4
          ${game.turn() === "w" ? "border-white" : "border-black"}`}
      >
        <Chessboard
          id="chessboard"
          customLightSquareStyle={{ backgroundColor: "#d0e9dd" }}
          customDarkSquareStyle={{ backgroundColor: "#51958f" }}
          arePiecesDraggable={!boardLock}
          onPieceDrop={movePiece}
          isDraggablePiece={isMovable}
          position={game.fen()}
        />
      </div>
      {boardLock && (
        <div
          className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-25 
          flex items-center justify-center flex-col gap-4"
        >
          <span className="loading loading-ring loading-lg text-white"></span>
          <p className="text-white text-2xl font-semibold">
            Waiting for opponent...
          </p>
        </div>
      )}
    </div>
  );
};

export default ChessBoard;
