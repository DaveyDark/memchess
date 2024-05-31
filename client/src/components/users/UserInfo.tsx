import { useEffect, useState } from "react";
import UserCard from "./UserCard";
import { useSocket } from "../../context/SocketProvider";
import { useGameState } from "../../context/GameStateProvider";
import { IUserInfo } from "../../types";

const UserInfo = () => {
  const socket = useSocket();
  const { gameState, setGameState } = useGameState();
  const [info, setInfo] = useState<IUserInfo>();
  const [turn, setTurn] = useState("");

  useEffect(() => {
    const roomJoinedListener = () => {
      socket!.emit("player_info");
    };
    const playerInfoListener = (info: IUserInfo) => {
      setInfo(info);
      if (info.player1 && info.player2 && gameState === "waiting") {
        setGameState("ready");
      }
    };
    const turnListener = (turn: string) => {
      setTurn(turn);
    };
    const resetListener = () => {
      setTurn("");
    };
    const disconnectListener = () => {
      socket!.emit("player_info");
    };

    socket!.on("room_joined", roomJoinedListener);
    socket!.on("player_info", playerInfoListener);
    socket!.on("turn", turnListener);
    socket!.on("game_reset", resetListener);
    socket!.on("opponent_disconnected", disconnectListener);

    return () => {
      socket!.off("room_joined", roomJoinedListener);
      socket!.off("player_info", playerInfoListener);
      socket!.off("turn", turnListener);
      socket!.off("game_reset", resetListener);
      socket!.off("opponent_disconnected", disconnectListener);
    };
  }, []);

  return (
    <div className="border w-full p-4 rounded-lg border-primary">
      <UserCard
        username={info?.player1?.name || ""}
        avatar={
          info?.player1 && {
            color: info.player1.avatar_color,
            rotation: info.player1.avatar_orientation,
            avatar: info.player1.avatar,
          }
        }
        turn={turn == info?.player1?.id}
      />
      <div className="divider divider-accent">VS</div>
      <UserCard
        username={info?.player2?.name || ""}
        avatar={
          info?.player2 && {
            color: info.player2.avatar_color,
            rotation: info.player2.avatar_orientation,
            avatar: info.player2.avatar,
          }
        }
        turn={turn == info?.player2?.id}
        reverse
      />
    </div>
  );
};

export default UserInfo;
