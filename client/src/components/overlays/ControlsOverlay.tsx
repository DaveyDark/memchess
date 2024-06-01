import { RotateCw, Share } from "react-feather";
import { useSocket } from "../../context/SocketProvider";
import { useGameState } from "../../context/GameStateProvider";
import { Dispatch, SetStateAction } from "react";

const ControlsOverlay = ({
  setRoomCode,
}: {
  setRoomCode: Dispatch<SetStateAction<string>>;
}) => {
  const socket = useSocket();
  const { setGameState } = useGameState();

  const resetGame = () => {
    socket?.emit("reset_game");
  };

  const leaveRoom = () => {
    setRoomCode("");
    setGameState("waiting");
    socket?.emit("leave_room");
  };

  return (
    <div className="md:absolute right-5 md:top-5 flex gap-2">
      <div
        className="lg:tooltip lg:tooltip-bottom lg:tooltip-secondary"
        data-tip="Reset Game"
      >
        <div
          className="flex p-2 md:p-4 rounded-xl bg-primary
            gap-2 cursor-pointer"
          onClick={() => resetGame()}
        >
          <RotateCw color="white" />
        </div>
      </div>
      <div
        className="lg:tooltip lg:tooltip-bottom lg:tooltip-secondary"
        data-tip="Leave Room"
      >
        <div
          className="flex p-2 md:p-4 rounded-xl bg-primary
            gap-2 cursor-pointer"
          onClick={() => leaveRoom()}
        >
          <Share className="rotate-90" color="white" />
        </div>
      </div>
    </div>
  );
};

export default ControlsOverlay;
