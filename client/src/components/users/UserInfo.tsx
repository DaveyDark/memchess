import { useEffect, useState } from "react";
import { useSocket } from "../SocketProvider";
import UserCard from "./UserCard";

interface PlayerInfo {
  id: string;
  name: string;
  avatar: string;
  avatar_orientation: number;
  avatar_color: string;
  chess_color: string;
}

interface IUserInfo {
  player1: PlayerInfo | undefined;
  player2: PlayerInfo | undefined;
}

const UserInfo = () => {
  const socket = useSocket();
  const [info, setInfo] = useState<IUserInfo>();
  const [turn, setTurn] = useState("");

  useEffect(() => {
    socket!.on("room_joined", () => {
      socket!.emit("player_info");
    });
    socket!.on("player_info", (info) => {
      setInfo(info);
    });
    socket!.on("turn", (turn) => {
      setTurn(turn);
    });

    return () => {
      socket!.off("room_joined");
      socket!.off("player_info");
      socket!.off("turn");
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
