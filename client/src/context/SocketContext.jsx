import { createContext, useContext, useEffect, useRef } from "react";
import { useAppStore } from "@/store";
import { io } from "socket.io-client";
import { HOST } from "@/utils/constants";


const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
}

export const SocketProvider = ({ children }) => {
    const socket = useRef(null);
    const { userInfo } = useAppStore();

    useEffect(() => {
        if (userInfo) {
            socket.current = io(HOST, {
                withCredentials: true,
                query: { userID: userInfo.id },
            });
            socket.current.on("connect", () => {
                console.log("Connected to socket server.");
            });

            const handleReceiveMessage = (message) => {
                console.log("Received message:", message);
                const { selectedChatType, selectedChatData } = useAppStore.getState();

                if (selectedChatType !== undefined && (selectedChatData.id === message.sender.id || selectedChatData.id === message.recipient.id)
                ) {
                console.log("message received:", message);
                addMessage(message);

            }
        };

            socket.current.on("receiveMessage", handleReceiveMessage);

            return () => {
                socket.current.disconnect();
            };
        }
    }, [userInfo])
    
    return (
        <SocketContext.Provider value={socket.current}>
            {children}
        </SocketContext.Provider>
    )
}