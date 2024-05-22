interface UserCardProps {
  username: string;
  reverse?: boolean;
}

const UserCard = ({ username, reverse }: UserCardProps) => {
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
      className={`flex w-full justify-between ${reverse && "flex-row-reverse"}`}
    >
      <div className="avatar">
        <div className="w-16 rounded-lg border border-primary">
          <img src="https://picsum.photos/200/300" />
        </div>
      </div>
      <div>
        <h2 className="font-semibold">{username}</h2>
        <span className="countdown font-mono font-light text-2xl">
          <span style={{ "--value": 10 }}></span>:
          <span style={{ "--value": 0 }}></span>
        </span>
      </div>
    </div>
  );
};

export default UserCard;
