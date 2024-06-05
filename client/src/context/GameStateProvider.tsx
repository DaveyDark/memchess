import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { GameState } from "../types";
import { useSocket } from "./SocketProvider";

const GameStateContext = createContext<{
  gameState: GameState;
  setGameState: (gameState: GameState) => void;
}>({
  gameState: "waiting",
  setGameState: () => {},
});

export const useGameState = () => {
  return useContext(GameStateContext);
};

export const GameStateProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>("waiting");
  const socket = useSocket();

  useEffect(() => {
    const mateListener = () => {
      setGameState("over");
    };

    const resetListener = () => {
      if (gameState === "waiting") return;
      setGameState("ready");
    };

    const disconnectListener = () => {
      setGameState("waiting");
    };

    const roomFullListener = (state: string) => {
      if (state === "Playing") setGameState("playing");
      else setGameState("ready");
    };

    socket?.on("stalemate", mateListener);
    socket?.on("checkmate", mateListener);
    socket?.on("game_reset", resetListener);
    socket?.on("opponent_disconnected", disconnectListener);
    socket?.on("room_full", roomFullListener);

    return () => {
      socket?.off("stalemate", mateListener);
      socket?.off("checkmate", mateListener);
      socket?.off("game_reset", resetListener);
      socket?.off("opponent_disconnected", disconnectListener);
      socket?.off("room_full", roomFullListener);
    };
  }, [socket]);

  return (
    <GameStateContext.Provider value={{ gameState, setGameState }}>
      {children}
    </GameStateContext.Provider>
  );
};
