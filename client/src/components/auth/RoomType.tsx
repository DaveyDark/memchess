import { useState } from "react";
import { Moon, Watch } from "react-feather";

interface RoomTypeProps {
  roomTime: number;
  setRoomTime: (time: number) => void;
}

const RoomType = ({ roomTime, setRoomTime }: RoomTypeProps) => {
  const [roomType, setRoomType] = useState<"casual" | "timed">("casual");

  return (
    <div className="w-full">
      <div
        role="tablist"
        className={`tabs tabs-boxed shadow bg-secondary ${roomType === "timed" ? "rounded-b-none" : "rounded-b-lg"} 
                    w-full transition-all duration-100 ease-in-out`}
      >
        <a
          role="tab"
          className={`tab ${roomType === "casual" && "tab-active"}`}
          onClick={() => setRoomType("casual")}
        >
          <Moon color="white" />
          <p className="ml-1 text-white font-semibold">Casual</p>
        </a>
        <a
          role="tab"
          className={`tab ${roomType === "timed" && "tab-active"}`}
          onClick={() => setRoomType("timed")}
        >
          <Watch color="white" />
          <p className="ml-0.5 text-white font-semibold">Timed</p>
        </a>
      </div>

      <div
        role="tablist"
        className={`tabs tabs-boxed bg-secondary rounded-t-none 
                    ${roomType === "timed" ? "h-12 p-2" : "h-0 p-0"} overflow-hidden 
                    w-full transition-all duration-500 ease-in-out`}
      >
        <a
          role="tab"
          className={`tab ${roomTime === 10 && "tab-active"}`}
          onClick={() => setRoomTime(10)}
        >
          <p className="font-semibold text-white">10m</p>
        </a>
        <a
          role="tab"
          className={`tab ${roomTime === 15 && "tab-active"}`}
          onClick={() => setRoomTime(15)}
        >
          <p className="font-semibold text-white">15m</p>
        </a>
        <a
          role="tab"
          className={`tab ${roomTime === 20 && "tab-active"}`}
          onClick={() => setRoomTime(20)}
        >
          <p className="font-semibold text-white">20m</p>
        </a>
        <a
          role="tab"
          className={`tab ${roomTime === 30 && "tab-active"}`}
          onClick={() => setRoomTime(30)}
        >
          <p className="font-semibold text-white">30m</p>
        </a>
      </div>
    </div>
  );
};

export default RoomType;
