import { useEffect, useState } from "react";
import { useSocket } from "../SocketProvider";
import UserCard from "./UserCard";

const UserInfo = () => {
  const socket = useSocket();
  const [username1, setUsername1] = useState("");
  const [username2, setUsername2] = useState("");

  useEffect(() => {
    socket!.on("room_joined", () => {
      socket!.emit("player_info");
    });
    socket!.on("player_info", (info) => {
      setUsername1(info.player1);
      setUsername2(info.player2);
    });

    return () => {
      socket!.off("room_joined");
      socket!.off("player_info");
    };
  }, []);

  return (
    <div className="border w-full p-4 rounded-lg border-primary">
      <UserCard username={username1} />
      <div className="divider divider-accent">VS</div>
      <UserCard username={username2} reverse />
    </div>
  );
};

export default UserInfo;
