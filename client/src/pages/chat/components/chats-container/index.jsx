import ChatHeader from "./components/chat-header";
import MessageBar from "./components/message-bar";
import MessageContainer from "./components/message-container";

const ChatsContainer = () => {
    return (
        <div className="flex-1 h-[100vh] min-w-0 bg-[#1c1d25] flex flex-col">
        <ChatHeader />
        <MessageContainer />
        <MessageBar />
        </div>
    );
};

export default ChatsContainer;