import UserInfo from "./components/users/UserInfo";
import ChessBoard from "./components/ChessBoard";
import Header from "./components/Header";
import MemoryBoard from "./components/MemoryBoard";
import ChatBox from "./components/chat/ChatBox";
import Auth from "./components/Auth";
import { useEffect, useState } from "react";
import { useSocket } from "./context/SocketProvider";
import Loader from "./components/Loader";
import RoomCodeOverlay from "./components/overlays/RoomCodeOverlay";
import { useGameState } from "./context/GameStateProvider";
import GameOver from "./components/GameOver";
import ResetGameOverlay from "./components/overlays/ResetGameOverlay";

function App() {
  const [roomCode, setRoomCode] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { gameState } = useGameState();
  const socket = useSocket();

  useEffect(() => {
    const connectTimeout = setTimeout(() => {
      setIsConnected(socket !== undefined);
    }, 500);

    return () => clearTimeout(connectTimeout);
  }, [socket]);

  useEffect(() => {
    const onPageLoad = () => {
      setIsLoaded(true);
    };

    if (document.readyState === "complete") {
      onPageLoad();
    } else {
      window.addEventListener("load", onPageLoad, false);
      return () => window.removeEventListener("load", onPageLoad);
    }
  }, []);

  if (!isConnected) {
    return <Loader />;
  }

  return (
    <main className="font-quicksand w-screen h-screen flex flex-col items-center p-4 gap-5">
      <Auth open={roomCode === ""} roomJoinedCallback={setRoomCode} />
      <Header />
      <RoomCodeOverlay roomCode={roomCode} />
      <ResetGameOverlay />
      <GameOver open={gameState === "over"} />
      <div className="flex flex-col md:flex-row justify-center p-6 gap-8 my-auto h-fit rounded-lg w-full shadow-xl">
        {isLoaded && <ChessBoard />}
        <div className="flex flex-col min-w-[25vw] flex-[0.5] justify-between gap-4 items-center max-w-xs">
          <UserInfo />
          <ChatBox />
        </div>
        <MemoryBoard />
      </div>
    </main>
  );
}

export default App;
