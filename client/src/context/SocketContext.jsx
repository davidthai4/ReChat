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
                const { selectedChatType, selectedChatData, addMessage, addContact, updateContactLastMessage, userInfo } = useAppStore.getState();
                
                // Add recipient to contacts if it's a new conversation (not yourself)
                if (message.recipient && message.recipient._id && message.recipient._id !== userInfo.id) {
                    addContact(message.recipient);
                }

                // Determine which contact this message is for
                const messageContactId = message.sender._id === userInfo.id ? message.recipient._id : message.sender._id;

                if (
                    selectedChatType === "contact" &&
                    selectedChatData?._id === messageContactId
                ) {
                    addMessage(message);
                } else {
                    // Update last message for the conversation even if not currently selected
                    updateContactLastMessage(messageContactId, message);
                }
            };

            const handleReceiveChannelMessage = (message) => {
                // console.log("=== RECEIVED CHANNEL MESSAGE DEBUG ===");
                // console.log("Received channel message:", message);
                const { selectedChatType, selectedChatData, addMessage, updateChannelLastMessage } = useAppStore.getState();
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
                    // Update last message for the channel even if not currently selected
                    if (message.channelId) {
                        updateChannelLastMessage(message.channelId, message);
                    }
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