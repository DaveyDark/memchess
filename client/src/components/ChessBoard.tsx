import { Chessboard } from "react-chessboard";
import { useEffect, useState } from "react";
import { Square, Piece } from "react-chessboard/dist/chessboard/types";
import { Chess } from "chess.js";
import { useSocket } from "../context/SocketProvider";
import { useGameState } from "../context/GameStateProvider";

const ChessBoard = () => {
  const socket = useSocket();
  const { gameState } = useGameState();
  const [boardLock, setBoardLock] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [game, setGame] = useState(new Chess());

  useEffect(() => {
    const turnListener = (player: string) => {
      setBoardLock(player !== socket!.id);
    };

    const pieceMovedListener = (data: { from: Square; to: Square }) => {
      setGame((prev) => {
        const gameCopy = new Chess(prev.fen());
        gameCopy.move({
          ...data,
          promotion: "q",
        });
        return gameCopy;
      });
    };

    const resetGameListener = () => {
      setGame(new Chess());
    };

    socket!.on("turn", turnListener);
    socket!.on("piece_moved", pieceMovedListener);
    socket!.on("game_reset", resetGameListener);

    return () => {
      socket!.off("turn", turnListener);
      socket!.off("piece_moved", pieceMovedListener);
      socket!.off("game_reset", resetGameListener);
    };
  }, []);

  useEffect(() => {
    if (gameState === "waiting") {
      setWaiting(true);
    } else {
      setWaiting(false);
    }
  }, [gameState]);

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
      {waiting && (
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
