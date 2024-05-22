interface ChatBubbleProps {
  text: string;
  side?: "left" | "right";
}

const ChatBubble = ({ side, text }: ChatBubbleProps) => {
  return (
    <div className={`chat ${side === "left" ? "chat-start" : "chat-end"}`}>
      <div className="chat-bubble chat-bubble-primary text-white">{text}</div>
    </div>
  );
};

export default ChatBubble;
