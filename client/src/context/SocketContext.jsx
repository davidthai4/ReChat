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
    const { userInfo, addMessage } = useAppStore();

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
                // console.log("=== RECEIVED MESSAGE DEBUG ===");
                // console.log("Full message:", message);
                // console.log("Message sender:", message.sender);
                // console.log("Message recipient:", message.recipient);
                
                const { selectedChatType, selectedChatData } = useAppStore.getState();
                // console.log("Selected chat type:", selectedChatType);
                // console.log("Selected chat data:", selectedChatData);
                
                // Extract the actual ID strings
                const senderId = message.sender._id || message.sender.id || message.sender;
                const recipientId = message.recipient._id || message.recipient.id || message.recipient;
                const currentChatId = selectedChatData?._id || selectedChatData?.id;
                
                // console.log("Sender ID:", senderId);
                // console.log("Recipient ID:", recipientId);
                // console.log("Current chat ID:", currentChatId);
                
                const isForCurrentChat = selectedChatType !== undefined && 
                    (currentChatId === senderId || currentChatId === recipientId);
                
                // console.log("Is for current chat:", isForCurrentChat);
                
                if (isForCurrentChat) {
                    // console.log("Adding received message to chat:", message);
                    addMessage(message);
                } else {
                    // console.log("Message not for current chat, ignoring");
                }
                // console.log("=== END DEBUG ===");
            };

            const handleReceiveChannelMessage = (message) => {
                // console.log("=== RECEIVED CHANNEL MESSAGE DEBUG ===");
                // console.log("Received channel message:", message);
                const { selectedChatType, selectedChatData, addMessage } = useAppStore.getState();
                // console.log("Selected chat type:", selectedChatType);
                // console.log("Selected chat data:", selectedChatData);
                // console.log("Message channel ID:", message.channelId);
                // console.log("Selected chat data ID:", selectedChatData?._id);
                // console.log("Are IDs equal?", selectedChatData?._id === message.channelId);

                if (
                    selectedChatType === "channel" &&
                    selectedChatData?._id === message.channelId
                ) {
                    // console.log("Adding channel message to chat");
                    addMessage(message);
                } else {
                    // console.log("Channel message not for current chat, ignoring");
                    // console.log("Selected chat type is:", selectedChatType);
                    // console.log("Expected: channel, got:", selectedChatType);
                }
                // console.log("=== END CHANNEL MESSAGE DEBUG ===");
            };

            socket.current.on("receiveMessage", handleReceiveMessage);
            socket.current.on("receive-channel-message", handleReceiveChannelMessage);

            return () => {
                socket.current.disconnect();
            };
        }
    }, [userInfo, addMessage]);
    
    return (
        <SocketContext.Provider value={socket.current}>
            {children}
        </SocketContext.Provider>
    )
}