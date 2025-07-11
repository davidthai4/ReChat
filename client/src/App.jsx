import React from 'react';
import { Button } from '@/components/ui/button';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Auth from './pages/auth';
import Chat from './pages/chat';
import Profile from './pages/profile';
import { useAppStore } from './store';

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
