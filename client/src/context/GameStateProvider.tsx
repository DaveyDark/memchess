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
    const gameOverListener = () => {
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

    const turnListener = () => {
      setGameState("playing");
    };

    const gameResetListener = () => {
      setGameState("ready");
    };

    socket?.on("stalemate", gameOverListener);
    socket?.on("checkmate", gameOverListener);
    socket?.on("timeout", gameOverListener);
    socket?.on("game_over", gameOverListener);
    socket?.on("game_reset", resetListener);
    socket?.on("opponent_disconnected", disconnectListener);
    socket?.on("room_full", roomFullListener);
    socket?.on("turn", turnListener);
    socket?.on("game_reset", gameResetListener);

    return () => {
      socket?.off("stalemate", gameOverListener);
      socket?.off("checkmate", gameOverListener);
      socket?.off("timeout", gameOverListener);
      socket?.off("game_over", gameOverListener);
      socket?.off("game_reset", resetListener);
      socket?.off("opponent_disconnected", disconnectListener);
      socket?.off("room_full", roomFullListener);
      socket?.off("turn", turnListener);
      socket?.off("game_reset", gameResetListener);
    };
  }, [socket]);

  return (
    <GameStateContext.Provider value={{ gameState, setGameState }}>
      {children}
    </GameStateContext.Provider>
  );
};
