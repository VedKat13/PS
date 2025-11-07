import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, UserCircle, Calendar, ListTodo, Settings, Menu, Search, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  // Fetch current user data
  const { data: userData } = useQuery({
    queryKey: ['user', currentUser?.email],
    queryFn: () => api.users.getByEmail(currentUser?.email || ''),
    enabled: !!currentUser?.email,
  });

  const userId = userData?.userid || userData?.userId || userData?.id;

  // Fetch friendships to count pending requests
  const { data: friendships = [] } = useQuery({
    queryKey: ['friendships', userId],
    queryFn: () => api.friendships.getByUser(userId?.toString()),
    enabled: !!userId,
  });

  // Fetch groups to count recent additions
  const { data: userGroups = [] } = useQuery({
    queryKey: ['groups', 'user', userId],
    queryFn: () => api.groups.getUserGroups(userId?.toString()),
    enabled: !!userId,
  });

  // Count pending friend requests where current user is receiver
  const pendingRequests = friendships.filter(
    (f: any) => 
      (f.userId2 === userId || f.user2Id === userId) && 
      f.status === 'pending'
  );

  // Count recent group additions (last 7 days, not admin)
  const recentGroups = userGroups.filter((g: any) => {
    const joinedDate = new Date(g.joinedAt || g.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return joinedDate > sevenDaysAgo && g.userRole !== 'admin';
  });

  // Check if notifications have been viewed
  const getUnviewedCount = () => {
    if (!userId) return 0;
    
    const viewedKey = `notifications_viewed_${userId}`;
    const viewedData = localStorage.getItem(viewedKey);
    
    if (!viewedData) {
      return pendingRequests.length + recentGroups.length;
    }
    
    try {
      const viewed = JSON.parse(viewedData);
      
      // Count unviewed friend requests
      const unviewedRequests = pendingRequests.filter((r: any) => 
        !viewed.friendRequests?.includes(r.friendshipId || r.friendshipid)
      ).length;
      
      // Count unviewed group additions
      const unviewedGroups = recentGroups.filter((g: any) => 
        !viewed.groupAdditions?.includes(g.groupId || g.groupid)
      ).length;
      
      return unviewedRequests + unviewedGroups;
    } catch {
      return pendingRequests.length + recentGroups.length;
    }
  };

  const notificationCount = getUnviewedCount();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return currentUser?.email?.charAt(0).toUpperCase() || "U";
  };
  
  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: UserCircle, label: "Groups", path: "/groups" },
    { icon: Calendar, label: "Events", path: "/events" },
    { icon: ListTodo, label: "Applications", path: "/applications" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link key={item.path} to={item.path}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start gap-2"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <SheetHeader>
                    <SheetTitle>Navigation</SheetTitle>
                    <SheetDescription>
                      Navigate through different sections of PeerSync
                    </SheetDescription>
                  </SheetHeader>
                  <nav className="flex flex-col gap-2 mt-8">
                    <NavLinks />
                  </nav>
                </SheetContent>
              </Sheet>
              
              <Link to="/home" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="font-bold text-primary-foreground">PS</span>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  PeerSync
                </span>
              </Link>
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search peers, events, groups..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => navigate("/notifications")}
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
                )}
              </Button>
              
              {/* User Menu */}
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 h-10">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.photoURL || undefined} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline-block font-medium">
                        {currentUser.displayName || currentUser.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {currentUser.displayName || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {currentUser.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <UserCircle className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="default" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <nav className="sticky top-24 flex flex-col gap-2 p-4 rounded-lg border bg-card shadow-sm">
              <NavLinks />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
