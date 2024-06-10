import { useEffect } from "react";
import { AVATAR_COLORS, AVATAR_PRESETS } from "../../constants";
import { RotateCcw, RotateCw, Shuffle } from "react-feather";
import { IAvatar } from "../../types";

const RotationClasses = ["rotate-0", "rotate-90", "rotate-180", "-rotate-90"];

interface AvatarCreatorProps {
  avatar: IAvatar;
  avatarDispatch: (action: any) => void;
}

const AvatarCreator = ({ avatar, avatarDispatch }: AvatarCreatorProps) => {
  const rotate = (reverse: boolean) => {
    if (reverse) {
      avatarDispatch({
        type: "SET_ROTATION",
        payload: (avatar.rotation + 3) % 4,
      });
    } else {
      avatarDispatch({
        type: "SET_ROTATION",
        payload: (avatar.rotation + 1) % 4,
      });
    }
  };

  const randomize = () => {
    const randomIdx = Math.floor(Math.random() * AVATAR_PRESETS.length);
    const preset = AVATAR_PRESETS[randomIdx];
    avatarDispatch({ type: "SET_ALL", payload: preset });
  };

  useEffect(() => {
    if (avatar.avatar === "") randomize();
  }, []);

  return (
    <div className="flex items-center justify-around w-full">
      <div className="grid grid-cols-2 grid-rows-2 gap-2">
        {AVATAR_COLORS.slice(0, 4).map((c, i) => (
          <div
            className={`min-w-8 min-h-8 aspect-square ${c}
              ${avatar.color === c && "border-2 border-primary"}`}
            key={i}
            onClick={() => avatarDispatch({ type: "SET_COLOR", payload: c })}
          ></div>
        ))}
      </div>
      <div
        className={`w-24 h-24 rounded-lg border border-primary ${avatar.color} relative`}
      >
        <input
          className={`w-full h-full font-mono bg-transparent rounded-lg outline-none text-4xl 
          text-center ${RotationClasses[avatar.rotation]}`}
          value={avatar.avatar}
          onChange={(e) =>
            avatarDispatch({ type: "SET_AVATAR", payload: e.target.value })
          }
          maxLength={3}
        />
        <button
          className="aspect-square rounded-full bg-primary absolute -top-2 -right-2 w-6 p-1"
          onClick={() => rotate(false)}
        >
          <RotateCw className="w-full h-full" color="white" />
        </button>
        <button
          className="aspect-square rounded-full bg-primary absolute -top-2 -left-2 w-6 p-1"
          onClick={() => rotate(true)}
        >
          <RotateCcw className="w-full h-full" color="white" />
        </button>
        <button
          className="aspect-square rounded-full bg-primary absolute -top-2 left-0 right-0 mx-auto w-6 p-1"
          onClick={randomize}
        >
          <Shuffle className="w-full h-full" color="white" />
        </button>
      </div>
      <div className="grid grid-cols-2 grid-rows-2 gap-2">
        {AVATAR_COLORS.slice(4, 8).map((c, i) => (
          <div
            className={`min-w-8 min-h-8 aspect-square ${c}
              ${avatar.color === c && "border-2 border-primary"}`}
            key={i}
            onClick={() => avatarDispatch({ type: "SET_COLOR", payload: c })}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default AvatarCreator;
