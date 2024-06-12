import { ChevronRight } from "react-feather";
import Chat from "./Chat";
import { useEffect, useRef, useState } from "react";
import { IChat } from "../../types";
import { useSocket } from "../../context/SocketProvider";
import { useSFX } from "../../context/SFXProvider";

const ChatBox = () => {
  const [chats, setChats] = useState<IChat[]>([]);
  const chatInput = useRef<HTMLInputElement>(null);
  const socket = useSocket();
  const sfx = useSFX();

  useEffect(() => {
    const chatListener = ({
      chat,
      author,
    }: {
      chat: string;
      author: string;
    }) => {
      let _chat: IChat = {
        text: chat,
        side: author === socket!.id ? "right" : "left",
      };
      // Limit chat to 50 messages
      setChats((prevChats) => {
        if (prevChats.length >= 50) {
          prevChats.shift();
        }
        return [...prevChats, _chat];
      });
      sfx.play("alert");
    };

    socket?.on("chat", chatListener);
    return () => {
      socket?.off("chat", chatListener);
    };
  }, [socket]);

  useEffect(() => {
    const chatContainer = document.querySelector(".chat-container");
    if (!chatContainer) return;
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, [chats]);

  const sendChat = () => {
    let chat = chatInput.current!.value;
    if (chat.trim() === "") return;
    socket!.emit("chat", chat);
    chatInput.current!.value = "";
  };

  return (
    <div className="w-full bg-secondary rounded-md p-4 flex flex-col">
      <Chat chats={chats} />
      <div className="flex w-full gap-2">
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered border-primary bg-secondary 
          focus:border-accent text-white w-full"
          onKeyDown={(e) => e.key === "Enter" && sendChat()}
          ref={chatInput}
        />
        <button className="btn btn-square btn-primary" onClick={sendChat}>
          <ChevronRight color="white" />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
