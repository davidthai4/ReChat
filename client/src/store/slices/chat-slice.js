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
    readStatus: JSON.parse(localStorage.getItem('chatReadStatus') || '{}'), // Load from localStorage
    setChannels: (channels) => set({ channels }),
    setIsUploading: (isUploading) => set({ isUploading }),
    setIsDownloading: (isDownloading) => set({ isDownloading }),
    setFileUploadProgress: (fileUploadProgress) => set({ fileUploadProgress }),
    setFileDownloadProgress: (fileDownloadProgress) => set({ fileDownloadProgress }),
    setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
    setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
    setSelectedChatMessages: (selectedChatMessages) => set({ selectedChatMessages }),
    setDirectMessagesContacts: (directMessagesContacts) => set({ directMessagesContacts }),
    markConversationAsRead: (conversationId) => {
        const { readStatus } = get();
        const newReadStatus = { 
            ...readStatus, 
            [conversationId]: new Date().toISOString() 
        };
        set({ readStatus: newReadStatus });
        // Persist to localStorage
        localStorage.setItem('chatReadStatus', JSON.stringify(newReadStatus));
    },
    addChannel: (channel) => {
        const channels = get().channels;
        set({ channels: [channel, ...channels] });
    },
    addContact: (contact) => {
        const { directMessagesContacts, userInfo } = get();
        
        // Don't add yourself to the contacts list
        if (contact._id === userInfo.id) {
            return;
        }
        
        // Check if contact already exists
        const existingContact = directMessagesContacts.find(c => c._id === contact._id);
        if (!existingContact) {
            set({ directMessagesContacts: [contact, ...directMessagesContacts] });
        }
    },
    updateContactLastMessage: (contactId, lastMessage) => {
        const { directMessagesContacts } = get();
        const updatedContacts = directMessagesContacts.map(contact => {
            if (contact._id === contactId) {
                return { 
                    ...contact, 
                    lastMessage: {
                        _id: lastMessage._id,
                        content: lastMessage.content,
                        messageType: lastMessage.messageType,
                        timestamp: lastMessage.timestamp,
                        sender: lastMessage.sender || {
                            _id: lastMessage.sender_id || lastMessage.sender,
                            firstName: lastMessage.sender?.firstName,
                            lastName: lastMessage.sender?.lastName,
                            email: lastMessage.sender?.email,
                        }
                    }
                };
            }
            return contact;
        });
        // Sort by most recent message
        updatedContacts.sort((a, b) => {
            const aTime = a.lastMessage?.timestamp || a.createdAt || 0;
            const bTime = b.lastMessage?.timestamp || b.createdAt || 0;
            return new Date(bTime) - new Date(aTime);
        });
        set({ directMessagesContacts: updatedContacts });
    },
    updateChannelLastMessage: (channelId, lastMessage) => {
        const { channels } = get();
        const updatedChannels = channels.map(channel => {
            if (channel._id === channelId) {
                return { 
                    ...channel, 
                    lastMessage: {
                        _id: lastMessage._id,
                        content: lastMessage.content,
                        messageType: lastMessage.messageType,
                        timestamp: lastMessage.timestamp,
                        sender: lastMessage.sender || {
                            _id: lastMessage.sender_id || lastMessage.sender,
                            firstName: lastMessage.sender?.firstName,
                            lastName: lastMessage.sender?.email,
                            email: lastMessage.sender?.email,
                        }
                    }
                };
            }
            return channel;
        });
        // Sort by most recent message
        updatedChannels.sort((a, b) => {
            const aTime = a.lastMessage?.timestamp || a.createdAt || 0;
            const bTime = b.lastMessage?.timestamp || b.createdAt || 0;
            return new Date(bTime) - new Date(aTime);
        });
        set({ channels: updatedChannels });
    },
    closeChat: () =>
        set({ selectedChatType: undefined, selectedChatData: undefined, selectedChatMessages: [] }),
    addMessage: (message) => {
        // console.log("=== ADD MESSAGE DEBUG ===");
        // console.log("Adding message:", message);
        
        const { selectedChatMessages, selectedChatType, selectedChatData } = get();
        
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

        // Update last message for the current conversation
        if (selectedChatType === "contact" && selectedChatData) {
            get().updateContactLastMessage(selectedChatData._id, processedMessage);
        } else if (selectedChatType === "channel" && selectedChatData) {
            get().updateChannelLastMessage(selectedChatData._id, processedMessage);
        }
        
        // console.log("Message added to state");
        // console.log("=== END ADD MESSAGE DEBUG ===");
    },
    updateMessageReadStatus: (messageId, readBy, readAt) => {
        const { selectedChatMessages } = get();
        const updatedMessages = selectedChatMessages.map(message => {
            if (message._id === messageId) {
                return {
                    ...message,
                    readBy: [...(message.readBy || []), { user: readBy, readAt }]
                };
            }
            return message;
        });
        set({ selectedChatMessages: updatedMessages });
    },
});