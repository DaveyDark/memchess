import { Chessboard } from "react-chessboard";
import { useEffect, useState } from "react";
import {
  Square,
  Piece,
  PromotionPieceOption,
} from "react-chessboard/dist/chessboard/types";
import { Chess } from "chess.js";
import { useSocket } from "../context/SocketProvider";
import { useGameState } from "../context/GameStateProvider";
import { useToaster } from "./toasts/ToastProvider";
import { PIECE_MAP, fireConfettiOptions } from "../constants";
import confetti from "canvas-confetti";
import { Clock } from "react-feather";

const ChessBoard = () => {
  const socket = useSocket();
  const { gameState } = useGameState();
  const [boardLock, setBoardLock] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [game, setGame] = useState(new Chess());
  const [selectMode, setSelectMode] = useState("");
  const [squareHighlight, setSquareHighlight] = useState<Square[]>([]);
  const [lastPosition, setLastPosition] = useState<string>(game.fen());
  const [check, setCheck] = useState<string>("x");
  const toast = useToaster();

  const handleConfetti = (sq: Square) => {
    const tile = document.querySelector(`div[data-square="${sq}"]`);
    if (!tile) return;
    const rect = tile.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2 + 10;

    confetti({
      ...fireConfettiOptions,
      origin: {
        x: x / window.innerWidth,
        y: y / window.innerHeight,
      },
    });
  };

  useEffect(() => {
    const chessBoardListener = (fen: string) => {
      setGame(new Chess(fen));
      setSelectMode("");
      setSquareHighlight([]);
    };

    const turnListener = (player: string) => {
      setBoardLock(player !== socket!.id);
    };

    const pieceMovedListener = (data: { from: Square; to: Square }) => {
      setLastPosition(game.fen());
      setGame((prev) => {
        try {
          const gameCopy = new Chess(prev.fen());
          gameCopy.move({
            ...data,
            promotion: "q",
          });
          return gameCopy;
        } catch (e) {
          return prev;
        }
      });
    };

    const resetGameListener = () => {
      setGame(new Chess());
      setBoardLock(false);
      setSelectMode("");
      setSquareHighlight([]);
    };

    const selectPieceListener = (piece: string) => {
      // Check for wildcards
      if (piece === "x") {
        toast({
          content: "Please select any piece(except king)",
          duration: 3000,
          type: "success",
        });
        setSelectMode("x");
        return;
      }
      toast({
        // @ts-ignore
        content: `Please select a ${PIECE_MAP[piece.toLowerCase()]}`,
        duration: 3000,
        type: "success",
      });
      setSelectMode(piece);
    };

    const squareClearedListener = (square: Square) => {
      setGame((prev) => {
        let gameCopy = new Chess(prev.fen());
        gameCopy.remove(square);
        return gameCopy;
      });
      setSelectMode("");
      handleConfetti(square);
    };

    const clearFailedListener = () => {
      toast({
        content: "Can't remove that piece!",
        duration: 3000,
        type: "error",
      });
    };

    socket?.on("turn", turnListener);
    socket?.on("piece_moved", pieceMovedListener);
    socket?.on("game_reset", resetGameListener);
    socket?.on("select_piece", selectPieceListener);
    socket?.on("square_cleared", squareClearedListener);
    socket?.on("clear_failed", clearFailedListener);
    socket?.on("chess_board", chessBoardListener);

    return () => {
      socket?.off("turn", turnListener);
      socket?.off("piece_moved", pieceMovedListener);
      socket?.off("game_reset", resetGameListener);
      socket?.off("select_piece", selectPieceListener);
      socket?.off("square_cleared", squareClearedListener);
      socket?.off("clear_failed", clearFailedListener);
      socket?.off("chess_board", chessBoardListener);
    };
  }, [socket]);

  useEffect(() => {
    // Set Check if there is a check
    if (game.isCheck()) {
      const checkSq = game
        .board()
        .flat()
        .find((sq) => sq?.type === "k" && sq?.color === game.turn())?.square;
      if (!checkSq) return;
      setCheck(checkSq);
    } else {
      setCheck("x");
    }
  }, [game]);

  useEffect(() => {
    const revertMoveListener = () => {
      setGame(new Chess(lastPosition));

      socket?.on("illegal_move", revertMoveListener);
      socket?.on("invalid_move", revertMoveListener);
      socket?.on("illegal_fen", revertMoveListener);

      return () => {
        socket?.off("illegal_move", revertMoveListener);
        socket?.off("invalid_move", revertMoveListener);
        socket?.off("illegal_fen", revertMoveListener);
      };
    };
  }, [socket, lastPosition]);

  useEffect(() => {
    if (gameState === "waiting") {
      setWaiting(true);
    } else if (gameState === "ready") {
      socket?.emit("get_chess_board");
      setWaiting(false);
      setBoardLock(false);
    } else if (gameState === "playing") {
      socket?.emit("get_chess_board");
      setWaiting(false);
    }
  }, [gameState]);

  useEffect(() => {
    if (selectMode === "") {
      setSquareHighlight([]);
      return;
    }
    if (selectMode === "x") {
      setSquareHighlight(
        game
          .board()
          .flat()
          .filter((sq) => {
            if (sq?.type === "k") return false;
            return true;
          })
          .map((sq) => sq?.square as Square),
      );
      return;
    }
    const pieceType = selectMode.charAt(1).toLowerCase();
    const pieceColor = selectMode.charAt(0).toLowerCase();
    const squares = game
      .board()
      .flat()
      .filter((sq) => {
        if (sq?.type === pieceType && sq?.color === pieceColor) return true;
      })
      .map((sq) => sq?.square as Square);
    setSquareHighlight(squares);
  }, [selectMode, game]);

  const handleMove = (
    from: Square,
    to: Square,
    promotion: string = "",
  ): boolean => {
    const gameCopy = new Chess(game.fen());

    try {
      gameCopy.move({
        from: from,
        to: to,
        promotion,
      });
    } catch (e) {
      // illegal move
      return false;
    }
    setGame(gameCopy);

    return true;
  };

  const movePiece = (from: Square, to: Square) => {
    const legal = handleMove(from, to);
    if (!legal) return false;
    socket!.emit("move_piece", { from, to, promotion: "" });
    setSelectMode("");
    return true;
  };

  const promotePiece = (
    piece?: PromotionPieceOption,
    promoteFromSquare?: Square,
    promoteToSquare?: Square,
  ) => {
    const from = promoteFromSquare;
    const to = promoteToSquare;
    if (!from || !to || !piece) return false;
    const promotion = piece?.charAt(1).toLowerCase();
    const legal = handleMove(from, to, promotion);
    if (!legal) return false;
    socket!.emit("move_piece", { from, to, promotion });
    return true;
  };

  const isMovable = ({ piece }: { piece: Piece; sourceSquare: Square }) => {
    return piece.charAt(0) === game.turn().toLowerCase();
  };

  const selectPiece = (piece: Piece, square: Square) => {
    if (selectMode === "") return;
    if (selectMode === "x") {
      if (piece.toLowerCase() === "k") return;
      socket!.emit("clear_square", square);
      socket!.emit("match_piece", piece.toLowerCase());
      return;
    }
    if (piece.toUpperCase() == selectMode.substring(0, 2).toUpperCase()) {
      socket!.emit("clear_square", square);
    }
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
          customSquareStyles={squareHighlight.reduce(
            (acc, cur) => ({
              ...acc,
              [cur]: { backgroundColor: "#FF5861" },
            }),
            {
              [check]: { backgroundColor: "#FF5861" },
            },
          )}
          clearPremovesOnRightClick
          arePiecesDraggable={!boardLock}
          onPieceDrop={movePiece}
          onPromotionPieceSelect={promotePiece}
          onPieceClick={selectPiece}
          isDraggablePiece={isMovable}
          position={game.fen()}
        />

        {waiting || (
          <label
            className="absolute -top-4 -right-4 bg-primary text-white btn btn-circle"
            htmlFor="drawer"
          >
            <Clock color="white" />
          </label>
        )}
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
