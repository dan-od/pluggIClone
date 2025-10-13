import React from "react";
import WelcomePage from "./pages/WelcomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import PassportPage from "./pages/PassportPage";
import PostPage from "./pages/PostPage";
import FindPage from "./pages/FindPage";
import Navbar from "./components/Navbar"; // import Navbar
import ChatPage from "./pages/ChatPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Navbar /> {/* Logo will be visible on all pages */}
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/passport" element={<PassportPage />} />
        <Route path="/post" element={<PostPage />} />
        <Route path="/find" element={<FindPage />} />
        <Route path="/chat/:receiverUsername" element={<ChatPage />} />

        
        
      </Routes>
    </Router>
  );
}

export default App;
