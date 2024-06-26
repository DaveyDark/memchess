import { IAvatar } from "../../types";
import Avatar from "./Avatar";

interface UserCardProps {
  username: string;
  avatar: IAvatar | undefined;
  turn: boolean;
  reverse?: boolean;
  you?: boolean;
  time?: number;
  connected?: boolean;
}

const UserCard = ({
  username,
  avatar,
  turn,
  reverse,
  you,
  time,
  connected,
}: UserCardProps) => {
  if (!username)
    return (
      <div className="flex w-full justify-between text-center py-4">
        <p className="w-fit mx-auto italic text-primary">
          Waiting for player to join...
        </p>
      </div>
    );

  return (
    <div
      className={`flex w-full justify-between ${reverse && "flex-row-reverse"} items-center px-2`}
    >
      <div>
        <Avatar avatar={avatar} turn={turn} connected={connected} />
      </div>
      <div className="flex flex-col h-full justify-center">
        <h2
          className={`font-semibold text-xl ${reverse ? "text-left" : "text-right"}`}
        >
          {username + (you ? " (You)" : "")}
        </h2>
        {time !== undefined ? (
          <span
            className={`countdown font-mono text-2xl ${time < 60 && "text-error"}`}
          >
            <span
              style={
                // @ts-ignore
                { "--value": Math.floor(time / 60) }
              }
            ></span>
            :
            <span
              style={
                // @ts-ignore
                { "--value": time % 60 }
              }
            ></span>
          </span>
        ) : (
          <p className={`text-primary ${reverse || "text-right"}`}>
            {connected ? (turn ? "Your Turn" : "Waiting") : "Disconnected"}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserCard;
