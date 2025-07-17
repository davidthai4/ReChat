import { useAppStore } from "@/store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ContactsContainer from "./contacts-container";
import EmptyChatContainer from "./empty-chat-container";
import ChatsContainer from "./components/chats-container";

const Chat = () => {
  const { userInfo, selectedChatType } = useAppStore();
  const navigate = useNavigate();
  useEffect(() => {
    // If no profile is set yet, redirect to profile page
    if (!userInfo.profileSetup) {
      toast('Please set up your profile to continue.');
      navigate("/profile");
    }
  }, [userInfo, navigate]);

  return (
  <div className="flex h-[100vh] text-white overflow-hidden">
    <ContactsContainer />
    {
      selectedChatType === undefined ? (
      <EmptyChatContainer />
    ) : (
    <ChatsContainer />
    )}
  </div>
  );
};

export default Chat;