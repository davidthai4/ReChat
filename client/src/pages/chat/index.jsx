import { useAppStore } from "@/store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";


const Chat = () => {
  const { userInfo } = useAppStore();
  const navigate = useNavigate();
  useEffect(() => {
    // If no profile is set yet, redirect to profile page
    if (!userInfo.profileSetup) {
      toast('Please set up your profile to continue.');
      navigate("/profile");
    }
  }, [userInfo, navigate]);
  return <div>Chat</div>;
};

export default Chat;