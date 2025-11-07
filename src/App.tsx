import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import Groups from "./pages/Groups";
import GroupDetails from "./pages/GroupDetails";
import Events from "./pages/Events";
import Applications from "./pages/Applications";
import Settings from "./pages/Settings";
import CreateEvent from "./pages/CreateEvent";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle root redirect based on auth state
const RootRedirect = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return currentUser ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Root Route - Smart redirect based on auth state */}
              <Route path="/" element={<RootRedirect />} />
              
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route path="/home" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
              <Route path="/profile/:userId" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
              <Route path="/friends" element={<ProtectedRoute><Layout><Friends /></Layout></ProtectedRoute>} />
              <Route path="/groups" element={<ProtectedRoute><Layout><Groups /></Layout></ProtectedRoute>} />
              <Route path="/groups/:id" element={<ProtectedRoute><Layout><GroupDetails /></Layout></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><Layout><Events /></Layout></ProtectedRoute>} />
              <Route path="/events/create" element={<ProtectedRoute><Layout><CreateEvent /></Layout></ProtectedRoute>} />
              <Route path="/applications" element={<ProtectedRoute><Layout><Applications /></Layout></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
