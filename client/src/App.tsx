import UserInfo from "./components/users/UserInfo";
import ChessBoard from "./components/ChessBoard";
import Header from "./components/Header";
import MemoryBoard from "./components/MemoryBoard";
import ChatBox from "./components/chat/ChatBox";
import Auth from "./components/Auth";
import { useEffect, useState } from "react";
import { useSocket } from "./components/SocketProvider";
import Loader from "./components/Loader";
import Overlay from "./components/Overlay";

function App() {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    setTimeout(() => {
      setIsConnected(socket !== undefined);
    }, 500);
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
      {roomCode === "" && (
        <Auth
          open
          username={username}
          setUsername={setUsername}
          roomJoinedCallback={setRoomCode}
        />
      )}
      <Overlay roomCode={roomCode} />
      <Header />
      <div className="flex flex-col md:flex-row justify-center p-6 gap-8 my-auto h-fit rounded-lg w-full shadow-xl">
        {isLoaded && <ChessBoard />}
        <div className="flex flex-col min-w-[25vw] flex-[0.5] justify-between gap-4 items-center">
          <UserInfo />
          <ChatBox />
        </div>
        <MemoryBoard />
      </div>
    </main>
  );
}

export default App;
