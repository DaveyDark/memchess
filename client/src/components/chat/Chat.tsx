import ChatBubble from "./ChatBubble";
import { IChat } from "../../types";

interface ChatProps {
  chats: IChat[];
}

const Chat = ({ chats }: ChatProps) => {
  if (chats.length === 0)
    return (
      <div className="chat-container py-4 min-w-full w-min h-[30vh] text-sm flex flex-col items-center justify-center">
        <p className="font-semibold text-xl text-accent text-center">
          No Chats Yet
        </p>
      </div>
    );

  return (
    <div className="chat-container overflow-y-scroll py-4 min-w-full w-min h-[30vh] text-sm">
      {chats.map((chat, index) => (
        <ChatBubble key={index} text={chat.text} side={chat.side} />
      ))}
    </div>
  );
};

export default Chat;
