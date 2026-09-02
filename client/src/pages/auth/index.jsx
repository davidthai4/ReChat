import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { SIGNUP_ROUTE, LOGIN_ROUTE } from '@/utils/constants';
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";

const Auth = () => {

    const navigate = useNavigate();
    const { setUserInfo } = useAppStore();
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const validateLogin = () => {
      if (!email.length) {
        toast.error("Email is required.");
        return false;
      }
      if (!password.length) {
        toast.error("Password is required.");
        return false;
      }
      return true;
    };      

    const validateSignup = () => {
      if (!email.length) {
        toast.error("Email is required.");
        return false;
      }
      if (!password.length) {
        toast.error("Password is required.");
        return false;
      }
      if(password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return false;
      }
      return true;
    };

    const handleLogin = async () => {
      if (validateLogin()) {
        try {
          const response = await apiClient.post(
            LOGIN_ROUTE, 
            { email, password },
            { withCredentials: true }
          );
          if (response.data.user._id) {
            setUserInfo({ ...response.data.user, id: response.data.user._id });
            if (response.data.user.profileSetup) navigate("/chat")
            else navigate("/profile");
          }
          console.log({ response });
        } catch (error) {
          console.error("Login error:", error);
          if (error.response?.status === 401) {
            toast.error("Invalid email or password");
          } else if (error.response?.status === 404) {
            toast.error("User not found");
          } else {
            toast.error("Login failed. Please try again.");
          }
        }
      }
    };

    const handleSignup = async () => {
      if (validateSignup()) {
        try {
          const response = await apiClient.post(
            SIGNUP_ROUTE,
            { email, password },
            { withCredentials: true }
          );
          if (response.status === 201) {
            setUserInfo({ ...response.data.user, id: response.data.user._id });
            navigate("/profile");
          }
        } catch (error) {
          if (error.response?.status === 409) {
            toast.error("An account with this email already exists.");
          } else {
            toast.error("Signup failed. Please try again.");
          }
        }
      }
    };
  
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2"> 
        <div className="flex flex-col gap-10 items-center justify-center p-8">
                      <div className="flex items-center justify-center flex-col"> 
              <div className="flex items-center justify-center">
                <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
              </div>
              <p className="font-medium text-center">Fill in the details to get started!</p>
            </div>
          <div className="flex items-center justify-center w-full">
            <Tabs defaultValue="login" className="w-3/4">
              <TabsList className="bg-transparent rounded-none w-full">
                <TabsTrigger value="login" className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 border-b-transparent rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 border-b-transparent rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent className="flex flex-col gap-5 mt-7" value="login">
                <Input 
                  placeholder="Email" 
                  type="email" 
                  className="rounded-full p-6"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
                <Input 
                  placeholder="Password" 
                  type="password" 
                  className="rounded-full p-6"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <Button className="rounded-full p-6" onClick={handleLogin}>
                  Login
                </Button>
              </TabsContent>
              <TabsContent className="flex flex-col gap-4" value="signup">
                <Input 
                  placeholder="Email" 
                  type="email" 
                  className="rounded-full p-6"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
                <Input 
                  placeholder="Password" 
                  type="password" 
                  className="rounded-full p-6"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <Input 
                  placeholder="Confirm Password" 
                  type="password" 
                  className="rounded-full p-6"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
                <Button className="rounded-full p-6" onClick={handleSignup}>
                  Sign Up
                </Button>
              </TabsContent>
            </Tabs>
          </div>       
        </div>
        <div className="hidden xl:flex flex-col justify-center items-center rounded-r-3xl overflow-hidden relative bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-800 p-10">
          {/* Background orbs */}
          <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full bg-white opacity-5" />
          <div className="absolute bottom-[-80px] left-[-40px] w-80 h-80 rounded-full bg-purple-300 opacity-10" />
          <div className="absolute top-1/2 left-[-30px] w-40 h-40 rounded-full bg-indigo-300 opacity-10" />

          {/* Chat bubbles illustration */}
          <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xs">
            {/* Bubble 1 */}
            <div className="self-start flex items-end gap-2 animate-[fadeSlideIn_0.6s_ease_both]">
              <div className="w-8 h-8 rounded-full bg-white/20 flex-shrink-0" />
              <div className="bg-white/15 backdrop-blur-sm text-white text-sm px-4 py-3 rounded-2xl rounded-bl-none shadow-lg max-w-[180px]">
                Hey, great to have you here! 👋
              </div>
            </div>

            {/* Bubble 2 */}
            <div className="self-end flex items-end gap-2 animate-[fadeSlideIn_0.8s_ease_both]">
              <div className="bg-white/25 backdrop-blur-sm text-white text-sm px-4 py-3 rounded-2xl rounded-br-none shadow-lg max-w-[180px]">
                Connecting you with your team ✨
              </div>
            </div>

            {/* Bubble 3 */}
            <div className="self-start flex items-end gap-2 animate-[fadeSlideIn_1s_ease_both]">
              <div className="w-8 h-8 rounded-full bg-white/20 flex-shrink-0" />
              <div className="bg-white/15 backdrop-blur-sm text-white text-sm px-4 py-3 rounded-2xl rounded-bl-none shadow-lg max-w-[180px]">
                Fast, real-time messaging ⚡
              </div>
            </div>

            {/* Typing indicator */}
            <div className="self-end flex items-end gap-2 animate-[fadeSlideIn_1.2s_ease_both]">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-2xl rounded-br-none shadow-lg flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-white/80 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-white/80 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-white/80 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="relative z-10 mt-12 text-center animate-[fadeSlideIn_1.4s_ease_both]">
            <p className="text-white/70 text-sm font-medium tracking-widest uppercase">Real-time messaging</p>
            <p className="text-white text-2xl font-bold mt-1">Built for your team</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;