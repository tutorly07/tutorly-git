
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import Index from "./pages/Index";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import PricingPage from "./pages/Pricing";
import TutorlyDashboard from "./pages/Dashboard";
import SettingsPage from "./pages/Settings";
import ProfilePage from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Protected routes */}
          <Route
            path="/pricing"
            element={
              <ProtectedRoute>
                <PricingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TutorlyDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
