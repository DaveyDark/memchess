import { IAvatar } from "../../types";
import Avatar from "./Avatar";

interface UserCardProps {
  username: string;
  avatar: IAvatar | undefined;
  turn: boolean;
  reverse?: boolean;
  you?: boolean;
}

const UserCard = ({ username, avatar, turn, reverse, you }: UserCardProps) => {
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
        <Avatar avatar={avatar} turn={turn} />
      </div>
      <div className="flex flex-col h-full justify-center">
        <h2
          className={`font-semibold text-xl ${reverse ? "text-left" : "text-right"}`}
        >
          {username + (you ? " (You)" : "")}
        </h2>
        <p className={`text-primary ${reverse || "text-right"}`}>
          {turn ? "Your Turn" : "Waiting"}
        </p>
      </div>
    </div>
  );
};

export default UserCard;
