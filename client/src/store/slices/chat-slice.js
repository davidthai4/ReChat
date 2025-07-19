export const createChatSlice = (set, get) => ({
    selectedChatType: undefined,
    selectedChatData: undefined,
    selectedChatMessages: [],
    directMessagesContacts: [],
    isUploading: false,
    isDownloading: false,
    fileUploadProgress: 0,
    fileDownloadProgress: 0,
    channels: [],
    setChannels: (channels) => set({ channels }),
    setIsUploading: (isUploading) => set({ isUploading }),
    setIsDownloading: (isDownloading) => set({ isDownloading }),
    setFileUploadProgress: (fileUploadProgress) => set({ fileUploadProgress }),
    setFileDownloadProgress: (fileDownloadProgress) => set({ fileDownloadProgress }),
    setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
    setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
    setSelectedChatMessages: (selectedChatMessages) => set({ selectedChatMessages }),
    setDirectMessagesContacts: (directMessagesContacts) => set({ directMessagesContacts }),
    addChannel: (channel) => {
        const channels = get().channels;
        set({ channels: [channel, ...channels] });
    },
    closeChat: () =>
        set({ selectedChatType: undefined, selectedChatData: undefined, selectedChatMessages: [] }),
    addMessage: (message) => {
        // console.log("=== ADD MESSAGE DEBUG ===");
        // console.log("Adding message:", message);
        
        const { selectedChatMessages } = get();
        const { selectedChatType } = get();
        
        // console.log("Current messages count:", selectedChatMessages.length);
        // console.log("Selected chat type:", selectedChatType);

        // Handle Mongoose documents (with _doc property) and plain objects
        let messageData = message;
        if (message._doc) {
            messageData = message._doc;
        }

        // Handle both sent messages (with IDs) and received messages (with full objects)
        const processedMessage = {
            ...messageData,
            sender: selectedChatType === "channel" 
                ? messageData.sender 
                : (messageData.sender._id || messageData.sender),
            recipient: selectedChatType === "channel" 
                ? messageData.recipient 
                : (messageData.recipient._id || messageData.recipient),
        };

        // console.log("Processed message:", processedMessage);

        set({
            selectedChatMessages: [...selectedChatMessages, processedMessage],
        });
        
        // console.log("Message added to state");
        // console.log("=== END ADD MESSAGE DEBUG ===");
    },
});