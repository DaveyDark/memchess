import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import io, { Socket } from "socket.io-client";

const SocketContext = createContext<Socket | undefined>(undefined);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);

  useEffect(() => {
    const _socket = io("https://memchess-server.shuttleapp.rs");
    // const _socket = io("127.0.0.1:8000");

    _socket.on("connect", () => {
      console.debug(`Socket connected with id: ${_socket.id}`);
      setSocket(_socket);

      _socket.onAny((event: string, ...args: any[]) => {
        console.debug(`Received event: ${event}`);
        console.debug(args);
      });

      _socket.onAnyOutgoing((event: string, ...args: any[]) => {
        console.debug(`Emitting event: ${event}`);
        console.debug(args);
      });

      _socket.on("disconnect", () => {
        _socket.offAny();
        _socket.offAnyOutgoing();
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
