import { Key } from "react-feather";
import { useToaster } from "../../context/ToastProvider";

interface OverlayProps {
  roomCode: string;
}

const RoomCodeOverlay = ({ roomCode }: OverlayProps) => {
  const toast = useToaster();

  const copyRoomCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      toast({
        type: "success",
        content: "Room code copied to clipboard",
        duration: 3000,
      });
    }
  };

  return (
    <div className="md:absolute left-5 md:top-5">
      <div
        className="lg:tooltip lg:tooltip-bottom lg:tooltip-secondary"
        data-tip="Copy Room Code"
      >
        <div
          className="flex p-2 md:p-4 rounded-xl border border-primary 
            gap-2 cursor-pointer"
          onClick={() => copyRoomCode()}
        >
          <Key color="var(--primary)" />
          <p className="text-primary font-semibold">Room: {roomCode}</p>
        </div>
      </div>
    </div>
  );
};

export default RoomCodeOverlay;
