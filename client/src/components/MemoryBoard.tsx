import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useGameState } from "../context/GameStateProvider";
import ChessPiece from "./ChessPiece";
import {
  defaultMemoryBoard,
  fireConfettiOptions,
  goldenConfettiOptions,
  matchConfettiOptions,
} from "../constants";
import confetti from "canvas-confetti";
import { MatchedTiles } from "../types";

type Tile = { value: string; flipped: boolean }[];

const MemoryBoard = () => {
  const [tiles, setTiles] = useState<Tile>(defaultMemoryBoard);
  const [flips, setFlips] = useState<number[]>([]);
  const [boardLock, setBoardLock] = useState<boolean>(true);
  const [waiting, setWaiting] = useState<boolean>(true);
  const socket = useSocket();
  const { gameState } = useGameState();

  const flipTile = (i: number) => {
    if (boardLock) return;
    if (flips.length === 2) return;
    if (flips.includes(i)) return;
    socket?.emit("flip_tile", i);
    setFlips([...flips, i]);
    if (flips.length === 1) {
      setTimeout(() => {
        socket?.emit("match_tiles");
      }, 1000);
    }
  };

  const handleConfetti = (i: number, options = matchConfettiOptions) => {
    const tile = document.getElementById(`tile-${i}`);
    if (!tile) return;
    const rect = tile.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    confetti({
      ...options,
      origin: {
        x: x / window.innerWidth,
        y: y / window.innerHeight,
      },
    });
  };

  useEffect(() => {
    const memoryBoardListener = (board: any) => {
      setTiles(() =>
        board.board.map((tile: string) => ({ value: tile, flipped: false })),
      );
    };

    const flipTileListener = (i: number) => {
      setTiles((previousTiles) => {
        if (previousTiles[i].value === "x")
          handleConfetti(i, goldenConfettiOptions);

        return previousTiles.map((tile, index) => {
          if (index === i) {
            return { ...tile, flipped: true };
          }
          return tile;
        });
      });
    };

    const unflipTilesListener = (..._tiles: number[]) => {
      setTiles((previousTiles) => {
        return previousTiles.map((tile, index) => {
          if (_tiles.includes(index)) {
            return { ...tile, flipped: false };
          }
          return tile;
        });
      });
    };

    const matchTilesListener = (_tiles: MatchedTiles) => {
      let matches = _tiles.matches;
      setTiles((previousTiles) => {
        matches.forEach((i) => {
          if (previousTiles[i].value === "x")
            handleConfetti(i, goldenConfettiOptions);
          else handleConfetti(i);
        });
        return previousTiles.map((tile, index) => {
          if (matches.includes(index)) {
            return { ...tile, value: "" };
          }
          return tile;
        });
      });
    };

    const turnListener = (player: string) => {
      if (player !== socket?.id) {
        setBoardLock(true);
        setFlips([]);
      } else {
        setBoardLock(false);
      }
    };

    const removeTilesListener = (...targets: number[]) => {
      setTiles((previousTiles) => {
        return previousTiles.map((tile, index) => {
          if (targets.includes(index)) {
            handleConfetti(index, fireConfettiOptions);
            return { ...tile, value: "" };
          }
          return tile;
        });
      });
    };

    const resetListener = () => {
      setFlips([]);
      setBoardLock(false);
    };

    const upgradeTileListener = (
      ...tiles: { value: string; index: number }[]
    ) => {
      // Set the value of the tiles to the new value
      setTiles((previousTiles) => {
        return previousTiles.map((tile, index) => {
          if (tiles.some((t) => t.index === index)) {
            return {
              ...tile,
              value: tiles.find((t) => t.index === index)!.value,
            };
          }
          return tile;
        });
      });
    };

    const disconnectListener = () => {
      setBoardLock(true);
      setWaiting(true);
    };

    const pieceMovedListener = () => {
      setFlips([]);
      // Unflip all tiles
      setTiles((previousTiles) => {
        return previousTiles.map((tile) => {
          return { ...tile, flipped: false };
        });
      });
    };

    socket?.on("memory_board", memoryBoardListener);
    socket?.on("tile_flipped", flipTileListener);
    socket?.on("unflip_tiles", unflipTilesListener);
    socket?.on("tiles_matched", matchTilesListener);
    socket?.on("turn", turnListener);
    socket?.on("game_reset", resetListener);
    socket?.on("remove_tiles", removeTilesListener);
    socket?.on("upgrade_tile", upgradeTileListener);
    socket?.on("opponent_disconnected", disconnectListener);
    socket?.on("piece_moved", pieceMovedListener);

    return () => {
      socket?.off("memory_board", memoryBoardListener);
      socket?.off("tile_flipped", flipTileListener);
      socket?.off("unflip_tiles", unflipTilesListener);
      socket?.off("tiles_matched", matchTilesListener);
      socket?.off("turn", turnListener);
      socket?.off("game_reset", resetListener);
      socket?.off("remove_tiles", removeTilesListener);
      socket?.off("upgrade_tile", upgradeTileListener);
      socket?.off("opponent_disconnected", disconnectListener);
      socket?.off("piece_moved", pieceMovedListener);
    };
  }, [socket]);

  useEffect(() => {
    if (gameState === "ready") {
      socket?.emit("get_memory_board");
      setWaiting(false);
      setBoardLock(false);
    } else if (gameState === "waiting") {
      setWaiting(true);
    }
  }, [gameState]);

  return (
    <div
      className={`bg-secondary rounded-md grid grid-rows-8 grid-cols-8 p-4 gap-2 
      my-auto flex-1 relative border-4 ${flips.length <= 1 ? "border-primary" : "border-secondary"}`}
    >
      {tiles.map((tile, i) => (
        <div
          className={`card min-w-4 aspect-square text-xl ${tile.flipped && "card-flipped"} ${tile.value === "" && "invisible"}`}
          onClick={() => flipTile(i)}
          id={`tile-${i}`}
          key={i}
        >
          <div className="card-front">{import.meta.env.DEV && tile.value}</div>
          <div className="card-back">
            <ChessPiece piece={tile.value.toUpperCase()} />
          </div>
        </div>
      ))}
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

export default MemoryBoard;
