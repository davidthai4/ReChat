import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Auth from './pages/auth';
import Chat from './pages/chat';
import Profile from './pages/profile';
import { useAppStore } from './store';
import { apiClient } from './lib/api-client';
import { GET_USER_INFO } from './utils/constants';
import { useState } from 'react';

// Security Guard: Only lets logged-in users through
const PrivateRoute = ({ children }) => {
 const { userInfo } = useAppStore(); 
 const isAuthenticated = !!userInfo; // Convert to boolean (!! trick)
 // If logged in, show the page; if not, redirect to login
 return isAuthenticated ? children : <Navigate to="/auth" />;
};

// Reverse Guard: Only lets logged-out users through
const AuthRoute = ({ children }) => {
 const { userInfo } = useAppStore();
 const isAuthenticated = !!userInfo; // Convert to boolean
 // If NOT logged in, show auth page; if logged in, go to chat
 return !isAuthenticated ? children : <Navigate to="/chat"/>;
};

const App = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await apiClient.get(GET_USER_INFO, {
          withCredentials: true
        });
        if (response.status === 200 && response.data._id) {
          // If user data is successfully fetched, update the store
          setUserInfo({ ...response.data, id: response.data._id });
        } else {
          setUserInfo(undefined); // If no user data, reset to undefined
        }
        console.log({ response });
      } catch (error) {
        setUserInfo(undefined); // If error, reset user info
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };
    if (!userInfo) {
      getUserData();
    } else {
      setLoading(false);
    }
  },[userInfo, setUserInfo]);

  if (loading) {
    return <div>Loading...</div>; // Show loading state while fetching user data
  }

  return (
   <BrowserRouter> {/* Enables routing for the entire app */}
     <Routes> {/* Container for all route definitions */}
       
       {/* Login/Signup page - only accessible when NOT logged in */}
       <Route 
         path="/auth" 
         element={
           <AuthRoute> {/* Wrapper checks: are you logged out? */}
             <Auth /> {/* If yes, show login page */}
           </AuthRoute>
         } 
       />
       
       {/* Chat page - only accessible when logged in */}
       <Route 
         path="/chat" 
         element={
           <PrivateRoute> {/* Wrapper checks: are you logged in? */}
             <Chat /> {/* If yes, show chat page */}
           </PrivateRoute>
         } 
       />
       
       {/* Profile page - only accessible when logged in */}
       <Route 
         path="/profile" 
         element={
           <PrivateRoute> {/* Same guard as chat */}
             <Profile /> {/* If logged in, show profile */}
           </PrivateRoute>
         } 
       />
       
       {/* Catch-all route: any other URL goes to login */}
       <Route path="*" element={<Navigate to="/auth" />} />
     </Routes>
   </BrowserRouter>
 );
};

export default App;
