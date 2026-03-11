import Lottie from "react-lottie";
import { animationDefaultOptions } from "@/lib/utils";

const EmptyChatContainer = () => {
    return (
        <div className="flex-1 bg-[#1c1d25] flex flex-col justify-center items-center duration-1000 transition-all">
            <Lottie 
            isClickToPauseDisabled={true}
            height={200}
            width={200}
            options={animationDefaultOptions}
            />
            <div className= "text-opacity-80 text-white flex flex-col gap-5 items-center mt-10 lg:text-4xl text-3xl transition-all duration-300 text-center">
                <h3>
                    Hi<span className="text-purple-500">!</span> Welcome to
                    <span className="text-purple-500"> Rechat</span>, a Syncronous Chat App<span className="text-purple-500">!</span>
                </h3>
            </div>
        </div>
    );
};

export default EmptyChatContainer;