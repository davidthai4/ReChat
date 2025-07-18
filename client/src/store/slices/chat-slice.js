export const createChatSlice = (set, get) => ({
    selectedChatType: undefined,
    selectedChatData: undefined,
    selectedChatMessages: [],
    setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
    setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
    setSelectedChatMessages: (selectedChatMessages) => set({ selectedChatMessages }),
    closeChat: () =>
        set({ selectedChatType: undefined, selectedChatData: undefined, selectedChatMessages: [] }),
    addMessage: (message) => {
        // console.log("=== ADD MESSAGE DEBUG ===");
        // console.log("Adding message:", message);
        
        const { selectedChatMessages } = get();
        const { selectedChatType } = get();
        
        // console.log("Current messages count:", selectedChatMessages.length);
        // console.log("Selected chat type:", selectedChatType);

        // Handle both sent messages (with IDs) and received messages (with full objects)
        const processedMessage = {
            ...message,
            sender: selectedChatType === "channel" 
                ? message.sender 
                : (message.sender._id || message.sender),
            recipient: selectedChatType === "channel" 
                ? message.recipient 
                : (message.recipient._id || message.recipient),
        };

        // console.log("Processed message:", processedMessage);

        set({
            selectedChatMessages: [...selectedChatMessages, processedMessage],
        });
        
        // console.log("Message added to state");
        // console.log("=== END ADD MESSAGE DEBUG ===");
    },
});