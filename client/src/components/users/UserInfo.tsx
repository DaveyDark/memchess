import { useEffect, useRef, useState } from "react";
import UserCard from "./UserCard";
import { useSocket } from "../../context/SocketProvider";
import { IUserInfo } from "../../types";
import { useGameState } from "../../context/GameStateProvider";

interface UserInfoProps {
  roomType: "casual" | "timed";
}

const UserInfo = ({ roomType }: UserInfoProps) => {
  const socket = useSocket();
  const [info, setInfo] = useState<IUserInfo>();
  const [turn, setTurn] = useState("");
  const [p1Time, setP1Time] = useState(0);
  const [p2Time, setP2Time] = useState(0);
  const { gameState } = useGameState();
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const roomJoinedListener = () => {
      socket!.emit("player_info");
      socket!.emit("get_player_times");
    };

    const playerTimesListener = (...times: number[]) => {
      if (roomType === "casual") return;
      setP1Time(times[0]);
      setP2Time(times[1]);
    };

    const playerInfoListener = (newInfo: IUserInfo) => {
      setInfo(newInfo);
    };
    const turnListener = (turn: string, times: number[]) => {
      setTurn(turn);
      if (roomType === "casual") return;
      setP1Time(times[0]);
      setP2Time(times[1]);
    };
    const resetListener = () => {
      setTurn("");
      socket!.emit("get_player_times");
    };
    const disconnectListener = () => {
      socket!.emit("player_info");
    };

    socket?.on("room_joined", roomJoinedListener);
    socket?.on("player_info", playerInfoListener);
    socket?.on("turn", turnListener);
    socket?.on("game_reset", resetListener);
    socket?.on("opponent_disconnected", disconnectListener);
    socket?.on("player_times", playerTimesListener);

    return () => {
      socket?.off("room_joined", roomJoinedListener);
      socket?.off("player_info", playerInfoListener);
      socket?.off("turn", turnListener);
      socket?.off("game_reset", resetListener);
      socket?.off("opponent_disconnected", disconnectListener);
      socket?.off("player_times", playerTimesListener);
    };
  }, [socket, roomType]);

  useEffect(() => {
    if (!info?.player1 && !info?.player2) socket?.emit("player_info");
  }, [info]);

  useEffect(() => {
    if (roomType === "casual") return;
    if (!info?.player1 || !info?.player2) return;
    if (gameState !== "playing") {
      if (countdownRef.current) clearInterval(countdownRef.current);
    } else {
      countdownRef.current = setInterval(() => {
        if (turn === info?.player1?.id) {
          setP1Time((prev) => prev - 1);
        } else if (turn === info?.player2?.id) {
          setP2Time((prev) => prev - 1);
        }
      }, 1000);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [gameState, turn, roomType, info]);

  useEffect(() => {
    if (roomType === "casual") return;
    if (gameState !== "playing") return;
    if (p1Time <= 0 || p2Time <= 0) {
      clearInterval(countdownRef.current!);
      socket?.emit("timeout");
    }
  }, [p1Time, p2Time, roomType]);

  return (
    <div className="border w-full p-4 rounded-lg border-primary">
      <UserCard
        username={info?.player1?.name || ""}
        you={socket?.id === info?.player1?.id}
        avatar={
          info?.player1 && {
            color: info.player1.avatar_color,
            rotation: info.player1.avatar_orientation,
            avatar: info.player1.avatar,
          }
        }
        time={roomType === "timed" ? p1Time : undefined}
        connected={info?.player1?.connected}
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
        you={socket?.id === info?.player2?.id}
        turn={turn == info?.player2?.id}
        time={roomType === "timed" ? p2Time : undefined}
        connected={info?.player2?.connected}
        reverse
      />
    </div>
  );
};

export default UserInfo;
