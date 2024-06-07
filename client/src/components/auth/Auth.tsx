import { Key, User } from "react-feather";
import Header from "../Header";
import { useEffect, useReducer, useState } from "react";
import { useToaster } from "../toasts/ToastProvider";
import AvatarCreator from "./AvatarCreator";
import { AVATAR_COLORS } from "../../constants";
import { IAvatar } from "../../types";
import { useSocket } from "../../context/SocketProvider";
import RoomType from "./RoomType";

interface AuthProps {
  open: boolean;
  roomJoinedCallback: (roomCode: string, roomType: "casual" | "timed") => void;
}

const avatarReducer = (state: IAvatar, action: any) => {
  switch (action.type) {
    case "SET_COLOR":
      return { ...state, color: action.payload };
    case "SET_ROTATION":
      return { ...state, rotation: action.payload };
    case "SET_AVATAR":
      return { ...state, avatar: action.payload };
    case "SET_ALL":
      return { ...action.payload };
    default:
      return state;
  }
};

const Auth = ({ open, roomJoinedCallback }: AuthProps) => {
  const socket = useSocket();
  const toast = useToaster();
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomTime, setRoomTime] = useState(10);
  const [avatar, avatarDispatch] = useReducer<
    (state: IAvatar, action: string) => IAvatar
  >(avatarReducer, {
    color: AVATAR_COLORS[0],
    rotation: 0,
    avatar: "",
  });

  const joinRoom = () => {
    if (username.length === 0) {
      toast({
        content: "Please enter a username",
        duration: 3000,
        type: "error",
      });
      return;
    }
    if (avatar.avatar === "") {
      toast({
        content: "Please enter an avatar",
        duration: 3000,
        type: "error",
      });
    }
    if (roomCode.length === 6) {
      socket!.emit("join_room", {
        room_id: roomCode,
        name: username,
        avatar: avatar.avatar,
        avatar_orientation: avatar.rotation,
        avatar_color: avatar.color,
      });
    } else {
      toast({
        content: "Room code must be 6 characters long",
        duration: 3000,
        type: "error",
      });
    }
  };

  const createRoom = () => {
    if (username.length === 0) {
      toast({
        content: "Please enter a username",
        duration: 3000,
        type: "error",
      });
      return;
    }
    if (avatar.avatar === "") {
      toast({
        content: "Please enter an avatar",
        duration: 3000,
        type: "error",
      });
    }
    socket!.emit("create_room", {
      name: username,
      avatar: avatar.avatar,
      avatar_orientation: avatar.rotation,
      avatar_color: avatar.color,
      time: roomTime * 60,
    });
  };

  useEffect(() => {
    socket?.on(
      "room_joined",
      (roomCode: string, roomType: "casual" | "timed") => {
        roomJoinedCallback(roomCode, roomType);
      },
    );
    socket?.on("join_failed", (reason: string) => {
      toast({
        content: reason,
        duration: 3000,
        type: "error",
      });
    });

    return () => {
      socket?.off("room_joined");
      socket?.off("join_failed");
    };
  }, [socket]);

  if (!open) return null;

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 backdrop-blur z-50">
      <dialog open className="modal md:modal-middle">
        <div className="modal-box min-w-fit">
          <Header />
          <div className="flex justify-around mb-8 mt-12 items-center max-sm:flex-col gap-4">
            <div className="flex flex-col gap-6 items-center">
              <h3 className="text-lg font-semibold text-secondary">
                Type a face!
              </h3>
              <AvatarCreator avatar={avatar} avatarDispatch={avatarDispatch} />
              <label className="input input-bordered flex items-center gap-2">
                <User color="var(--accent)" />
                <input
                  type="text"
                  className="grow"
                  placeholder="Name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>
            </div>
            <div className="divider divider-primary scale-125 divider-horizontal"></div>
            <div className="flex flex-col w-full border border-accent p-4 rounded-md">
              <div className="flex flex-col gap-2">
                <label className="input input-bordered flex items-center gap-2">
                  <Key color="var(--accent)" />
                  <input
                    type="text"
                    className="grow"
                    placeholder="Room Code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    onSubmit={joinRoom}
                  />
                </label>
                <button
                  className="btn btn-primary text-white grow"
                  onClick={joinRoom}
                >
                  Join Room
                </button>
              </div>
              <div className="divider divider-accent my-2 font-light text-primary">
                OR
              </div>
              <div className="flex flex-col gap-2 items-center">
                <RoomType roomTime={roomTime} setRoomTime={setRoomTime} />
                <button
                  className="btn btn-primary w-full text-white grow"
                  onClick={createRoom}
                >
                  Create Room
                </button>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Auth;
