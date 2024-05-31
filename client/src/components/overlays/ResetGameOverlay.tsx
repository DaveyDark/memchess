import { RotateCw } from "react-feather";
import { useSocket } from "../../context/SocketProvider";

const ResetGameOverlay = () => {
  const socket = useSocket();

  const resetGame = () => {
    socket?.emit("reset_game");
  };

  return (
    <div className="md:absolute right-5 md:top-5">
      <div
        className="lg:tooltip lg:tooltip-bottom lg:tooltip-secondary"
        data-tip="Reset Game"
      >
        <div
          className="flex p-2 md:p-4 rounded-xl bg-error
            gap-2 cursor-pointer"
          onClick={() => resetGame()}
        >
          <RotateCw color="white" />
        </div>
      </div>
    </div>
  );
};

export default ResetGameOverlay;
