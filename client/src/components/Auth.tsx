import { Key, User } from "react-feather";
import Header from "./Header";
import { useSocket } from "./SocketProvider";
import { useEffect, useState } from "react";
import { useToaster } from "./toasts/ToastProvider";

interface AuthProps {
  open: boolean;
  username: string;
  setUsername: (username: string) => void;
  roomJoinedCallback: (roomCode: string) => void;
}

const Auth = ({
  open,
  username,
  setUsername,
  roomJoinedCallback,
}: AuthProps) => {
  const socket = useSocket();
  const toast = useToaster();
  const [roomCode, setRoomCode] = useState("");

  const joinRoom = () => {
    if (username.length === 0) {
      toast({
        content: "Please enter a username",
        duration: 3000,
        type: "error",
      });
      return;
    }
    if (roomCode.length === 6) {
      socket!.emit("join_room", {
        room_id: roomCode,
        name: username,
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
    socket!.emit("create_room", username);
  };

  useEffect(() => {
    socket?.on("room_joined", (roomCode: string) => {
      roomJoinedCallback(roomCode);
    });
    socket?.on("join_failed", (reason: string) => {
      toast({
        content: reason,
        duration: 3000,
        type: "error",
      });
    });

    return () => {
      socket!.off("room_joined");
      socket!.off("join_failed");
    };
  }, [socket]);

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 backdrop-blur z-50">
      <dialog open={open} className="modal md:modal-middle">
        <div className="modal-box min-w-fit">
          <Header />
          <div className="flex justify-around mb-8 mt-12 items-center max-sm:flex-col gap-4">
            <div className="flex flex-col gap-6 items-center">
              <div className="w-28 h-28 rounded-md bg-primary"></div>
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
              <button
                className="btn btn-primary w-full text-white grow"
                onClick={createRoom}
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Auth;
