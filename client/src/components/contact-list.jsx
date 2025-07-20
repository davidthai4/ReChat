import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { HOST } from "@/utils/constants";
import moment from "moment";

const ContactList = ({ contacts, isChannel = false }) => {
    const { selectedChatData, setSelectedChatData, selectedChatType, setSelectedChatType, setSelectedChatMessages, addContact, userInfo } = useAppStore();

    const handleClick = (contact) => {
        if (isChannel) {
            setSelectedChatType("channel");
            setSelectedChatData(contact);
        } else {
            setSelectedChatType("contact");
            setSelectedChatData(contact);
            // Only add contact if it's not already in the list
            const { directMessagesContacts } = useAppStore.getState();
            const existingContact = directMessagesContacts.find(c => c._id === contact._id);
            if (!existingContact) {
                addContact(contact);
            }
        }
        if (selectedChatData && selectedChatData._id !== contact._id) {
            setSelectedChatMessages([]);
        }
    };

    const getLastMessagePreview = (contact) => {
        if (contact.lastMessage) {
            let preview = "";
            
            // Add sender information
            if (contact.lastMessage.sender) {
                if (contact.lastMessage.sender._id === userInfo.id) {
                    preview = "You: ";
                } else if (isChannel) {
                    // For channels, show sender's first name or email
                    const senderName = contact.lastMessage.sender.firstName || contact.lastMessage.sender.email;
                    preview = `${senderName}: `;
                }
                // For DMs from others, no prefix needed
            }
            
            // Add message content
            if (contact.lastMessage.content) {
                preview += contact.lastMessage.content.length > 30 ? contact.lastMessage.content.substring(0, 30) + "..." : contact.lastMessage.content;
            } else if (contact.lastMessage.messageType === "file") {
                preview += "File sent";
            }
            
            return preview;
        }
        return "No messages yet";
    };

    const getLastMessageTime = (contact) => {
        if (contact.lastMessage?.timestamp) {
            return moment(contact.lastMessage.timestamp).fromNow();
        }
        return "";
    };

    return (
        <div className="mt-5">
            {contacts.map((contact) => (
                <div key={contact._id} className={`pl-10 py-3 transition-all duration-300 cursor-pointer ${selectedChatData && (selectedChatData._id === contact._id) 
                    ? "bg-[#8417ff] hover:bg-[#8417ff]" 
                    : "hover:bg-[#f1f1f111]"}`} 
                    onClick={() => handleClick(contact)}
                >
                    <div className="flex gap-5 items-center justify-between text-neutral-300"> 
                        <div className="flex gap-5 items-center">
                            {!isChannel && <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                            {contact.image ? (
                                <AvatarImage
                                    src={`${HOST}/${contact.image}`}
                                    alt="profile"
                                    className="object-cover w-full h-full bg-black"
                                />
                            ) : (
                                <div
                                    className={`${selectedChatData && (selectedChatData._id === contact._id) 
                                        ? "bg-[#ffffff22] border border-white/70" 
                                        : getColor(contact.color)}
                                        uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full $`}
                                >
                                    {contact.firstName
                                        ? contact.firstName.split("").shift()
                                        : contact?.email?.charAt(0) || "?"}
                                </div>
                            )}
                        </Avatar>}
                        {
                            isChannel && <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">#</div>
                        }
                        <div className="flex flex-col">
                            <span className="font-medium">
                                {isChannel ? contact.name : `${contact.firstName} ${contact.lastName}`}
                            </span>
                            <span className="text-sm text-neutral-400">
                                {getLastMessagePreview(contact)}
                            </span>
                        </div>
                        </div>
                        <div className="text-xs text-neutral-400">
                            {getLastMessageTime(contact)}
                        </div>
                    </div>
                </div> 
            ))}
        </div>
    );
};

export default ContactList;