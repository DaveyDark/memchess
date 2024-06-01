import { IAvatar } from "../../types";

const RotationClasses = ["rotate-0", "rotate-90", "rotate-180", "-rotate-90"];

interface AvatarProps {
  avatar: IAvatar | undefined;
  turn?: boolean;
}

const Avatar = ({ avatar, turn }: AvatarProps) => {
  if (!avatar) return null;

  return (
    <div
      className={`w-16 h-16 rounded-lg border-2 border-primary ${avatar.color} relative`}
    >
      <input
        className={`w-full h-full font-mono bg-transparent rounded-lg outline-none text-2xl 
          text-center ${RotationClasses[avatar.rotation]}`}
        disabled
        value={avatar.avatar}
        maxLength={3}
      />
      {turn && (
        <div
          className="aspect-square rounded-full bg-primary absolute 
          border-2 border-white z-10
          -top-1.5 -right-1.5 w-4 p-1"
        ></div>
      )}
    </div>
  );
};

export default Avatar;
