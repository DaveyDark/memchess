import { IAvatar } from "../../types";
import Avatar from "./Avatar";

interface UserCardProps {
  username: string;
  avatar: IAvatar | undefined;
  turn: boolean;
  reverse?: boolean;
}

const UserCard = ({ username, avatar, turn, reverse }: UserCardProps) => {
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
      className={`flex w-full justify-between ${reverse && "flex-row-reverse"} items-center`}
    >
      <div>
        <Avatar avatar={avatar} turn={turn} />
      </div>
      <div>
        <h2 className={`font-semibold ${reverse ? "text-left" : "text-right"}`}>
          {username}
        </h2>
        <span className="countdown font-mono font-light text-2xl">
          <span style={{ "--value": 10 }}></span>:
          <span style={{ "--value": 0 }}></span>
        </span>
      </div>
    </div>
  );
};

export default UserCard;
