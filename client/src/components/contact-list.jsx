import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { HOST } from "@/utils/constants";

const ContactList = ({ contacts, isChannel = false }) => {
    const { selectedChatData, setSelectedChatData, selectedChatType, setSelectedChatType, setSelectedChatMessages } = useAppStore();

    const handleClick = (contact) => {
        if (isChannel) {
            setSelectedChatType("channel");
        } else {
            setSelectedChatType("contact");
            setSelectedChatData(contact);
        }
        if (selectedChatData && selectedChatData._id !== contact._id) {
            setSelectedChatMessages([]);
        }
    };

    return (
        <div className="mt-5">
            {contacts.map((contact) => (
                <div key={contact._id} className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${selectedChatData && (selectedChatData._id === contact._id) 
                    ? "bg-[#8417ff] hover:bg-[#8417ff]" 
                    : "hover:bg-[#f1f1f111]"}`} 
                    onClick={() => handleClick(contact)}
                >
                    <div className="flex gap-5 items-center justify-center text-neutral-300"> 
                        {!isChannel && <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                        {contact.image ? (
                            <AvatarImage
                                src={`${HOST}/${contact.image}`}
                                alt="profile"
                                className="object-cover w-full h-full bg-black"
                            />
                        ) : (
                            <div
                                className={`uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                                    contact.color
                                )}`}
                            >
                                {contact.firstName
                                    ? contact.firstName.split("").shift()
                                    : contact?.email?.charAt(0) || "?"}
                            </div>
                        )}
                    </Avatar>}

                    </div>
                </div> 
            ))}
        </div>
    );
};

export default ContactList;