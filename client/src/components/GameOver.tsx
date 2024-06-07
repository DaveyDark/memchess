import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { IUserInfo } from "../types";
import Header from "./Header";
import Avatar from "./users/Avatar";
import { RotateCw } from "react-feather";
import confetti from "canvas-confetti";
import { gameOverConfettiOptions } from "../constants";

const GameOver = ({ open }: { open: boolean }) => {
  const socket = useSocket();
  const [playerInfo, setPlayerInfo] = useState<IUserInfo>();
  const [result, setResult] = useState("");

  useEffect(() => {
    const checkmateListener = (info: IUserInfo) => {
      setPlayerInfo(info);
      setResult("Checkmate");
    };

    const stalemateListener = (info: IUserInfo) => {
      setPlayerInfo(info);
      setResult("Stalemate");
    };

    const timeoutListener = (info: IUserInfo) => {
      setPlayerInfo(info);
      setResult("Timeout");
    };

    socket?.on("checkmate", checkmateListener);
    socket?.on("stalemate", stalemateListener);
    socket?.on("timeout", timeoutListener);

    return () => {
      socket?.off("checkmate", checkmateListener);
      socket?.off("stalemate", stalemateListener);
      socket?.off("timeout", timeoutListener);
    };
  }, [socket]);

  const handleReset = () => {
    socket?.emit("reset_game");
  };

  const handleConfetti = () => {
    let duration = 10000;
    let animationEnd = Date.now() + duration;

    const randomRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(function () {
      let timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      confetti({
        ...gameOverConfettiOptions,
        origin: {
          x: randomRange(0.1, 0.3),
          y: randomRange(0.1, 0.8),
        },
      });
      confetti({
        ...gameOverConfettiOptions,
        origin: {
          x: randomRange(0.7, 0.9),
          y: randomRange(0.1, 0.8),
        },
      });
    }, 250);
  };

  useEffect(() => {
    if (open) handleConfetti();
  }, [open]);

  if (!open) return null;

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 backdrop-blur z-50">
      <dialog open className="modal md:modal-middle">
        <div className="modal-box min-w-fit">
          <Header />
          <div className="my-8 flex flex-col w-full items-center justify-center gap-8">
            <div>
              <h1 className="text-center text-lg font-semibold text-primary">
                Game Over
              </h1>
              <h2 className="text-center font-bold text-4xl text-secondary">
                {result}!
              </h2>
            </div>
            <div className="flex border-accent border rounded-lg pb-6 px-8 gap-4 pt-8">
              <div
                className={`flex flex-col gap-2 relative ${result !== "Stalemate" && "scale-125"}`}
              >
                {result !== "Stalemate" && (
                  <p className="absolute -top-2 left-0 right-0 mx-auto w-fit bg-primary text-white z-10 text-xs p-0.5 rounded">
                    Winner
                  </p>
                )}
                <Avatar
                  avatar={
                    playerInfo?.player1 && {
                      color: playerInfo.player1.avatar_color,
                      rotation: playerInfo.player1.avatar_orientation,
                      avatar: playerInfo.player1.avatar,
                    }
                  }
                />
                <p className="text-center">
                  {playerInfo?.player1 && playerInfo?.player1.name}
                </p>
              </div>
              <div className="divider divider-horizontal divider-accent">
                VS
              </div>
              <div
                className={`flex flex-col gap-2 ${result !== "Stalemate" && "opacity-75"}`}
              >
                <Avatar
                  avatar={
                    playerInfo?.player2 && {
                      color: playerInfo.player2.avatar_color,
                      rotation: playerInfo.player2.avatar_orientation,
                      avatar: playerInfo.player2.avatar,
                    }
                  }
                />
                <p className="text-center">
                  {playerInfo?.player2 && playerInfo?.player2.name}
                </p>
              </div>
            </div>
            <button
              className="btn btn-primary text-white"
              onClick={() => handleReset()}
            >
              <RotateCw color="white" />
              Play Again
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default GameOver;
