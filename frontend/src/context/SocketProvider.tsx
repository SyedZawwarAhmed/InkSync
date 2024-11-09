import { API_BASE_URL } from "@/constants/apiBaseUrl";
import { useLinesStore } from "@/store/lines";
import React, { createContext, useCallback, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  draw: (data: LineType[] | RectType[]) => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(
  undefined
);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socket = useRef<Socket | null>(null);
  // const lines = useLinesStore((state) => state.lines);
  const setLines = useLinesStore((state) => state.setLines);

  useEffect(() => {
    socket.current = io(API_BASE_URL);

    socket.current.on("connect", () => {
      console.log("Socket connected:", socket.current?.id);
    });

    socket.current.on("draw", (data: LineType[]) => {
      console.log("Drawing:", data);
      setLines(data);
    });

    socket.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draw = useCallback(
    (data: LineType[] | RectType[]) => {
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
