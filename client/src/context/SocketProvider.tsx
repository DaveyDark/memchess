import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import io, { Socket } from "socket.io-client";
import { useToaster } from "../components/toasts/ToastProvider";

const SocketContext = createContext<Socket | undefined>(undefined);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const toast = useToaster();

  useEffect(() => {
    const _socket = io(import.meta.env.VITE_SERVER_URL as string);

    _socket.on("connect", () => {
      setSocket(_socket);

      if (import.meta.env.DEV) {
        _socket.onAny((event, ...args) => {
          console.log("Recieved: ", event, args);
        });
        _socket.onAnyOutgoing((event, ...args) => {
          console.log("Emitting: ", event, args);
        });
      }

      _socket.on("disconnect", () => {
        toast({
          type: "error",
          content: "Disconnected from server",
          duration: 5000,
        });
        if (import.meta.env.DEV) {
          _socket.offAny();
          _socket.offAnyOutgoing();
        }
        setSocket(undefined);
      });
    });

    return () => {
      _socket.disconnect();
      setSocket(undefined);
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
