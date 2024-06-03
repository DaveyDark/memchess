import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { HistoryEntry, MatchedTiles } from "../types";
import History from "../components/history/History";
import { useSocket } from "./SocketProvider";

const HistoryContext = createContext<{
  history: HistoryEntry[];
  setHistory: (history: HistoryEntry[]) => void;
}>({
  history: [],
  setHistory: () => {},
});

export const useHistory = () => {
  return useContext(HistoryContext);
};

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const socket = useSocket();

  useEffect(() => {
    const tileFlippedListener = (_: number, tile: string, player: string) => {
      setHistory((hist) => {
        return [
          {
            board: "memory",
            move: tile,
            player,
            type: "flip",
          },
          ...hist,
        ];
      });
    };

    const pieceMovedListener = (
      move: { from: string; to: string; promotion: string },
      piece: string,
      captured: string,
      player: string,
    ) => {
      setHistory((hist) => {
        return [
          {
            board: "chess",
            move: `${move.from} -> ${move.to}`,
            moveDetail: {
              ...move,
              piece,
              capture: captured === "" ? undefined : captured,
            },
            player,
            type: "move",
          },
          ...hist,
        ];
      });
    };

    const gameResetListener = () => {
      setHistory([]);
    };

    const turnListener = (player: string) => {
      setHistory((hist) => {
        return [
          {
            board: "chess",
            move: "",
            player,
            type: "divider",
          },
          ...hist,
        ];
      });
    };

    const tilesMatchedListener = (tiles: MatchedTiles, player: string) => {
      setHistory((hist) => {
        return [
          {
            board: "memory",
            move: tiles.tile,
            player,
            type: "match",
          },
          ...hist,
        ];
      });
    };
    const squareClearedListener = (
      square: string,
      piece: string,
      player: string,
    ) => {
      setHistory((hist) => {
        return [
          {
            board: "chess",
            move: "",
            moveDetail: {
              from: square,
              to: square,
              piece: piece,
              promotion: "",
            },
            player,
            type: "destroy",
          },
          ...hist,
        ];
      });
    };

    socket?.on("tile_flipped", tileFlippedListener);
    socket?.on("piece_moved", pieceMovedListener);
    socket?.on("game_reset", gameResetListener);
    socket?.on("turn", turnListener);
    socket?.on("tiles_matched", tilesMatchedListener);
    socket?.on("square_cleared", squareClearedListener);

    return () => {
      socket?.off("tile_flipped", tileFlippedListener);
      socket?.off("piece_moved", pieceMovedListener);
      socket?.off("game_reset", gameResetListener);
      socket?.off("turn", turnListener);
      socket?.off("tiles_matched", tilesMatchedListener);
      socket?.off("square_cleared", squareClearedListener);
    };
  }, [socket]);

  return (
    <HistoryContext.Provider value={{ history, setHistory }}>
      <div className="drawer">
        <input id="drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">{children}</div>
        <div className="drawer-side">
          <label
            htmlFor="drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <History />
        </div>
      </div>
    </HistoryContext.Provider>
  );
};
