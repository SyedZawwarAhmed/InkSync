import { API_BASE_URL } from "@/constants/apiBaseUrl";
import React, { createContext, useCallback, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  draw: (data: any) => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(
  undefined
);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = io(API_BASE_URL);

    socket.current.on("connect", () => {
      console.log("Socket connected:", socket.current?.id);
    });

    socket.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.current?.disconnect();
    };
  }, []);

  const draw = useCallback(
    (data: any) => {
      if (socket.current) {
        socket.current.emit("draw", data);
      }
    },
    [socket]
  );

  return (
    <SocketContext.Provider value={{ draw }}>{children}</SocketContext.Provider>
  );
};
