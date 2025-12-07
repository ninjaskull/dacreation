import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminSidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, User, Bell, Search, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user, isLoading: userLoading, isAuthenticated, isAdmin } = useAuth();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/admin/login");
    },
  });

  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, userLoading, setLocation]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-semibold text-slate-900 leading-tight">{title}</h1>
              {description && (
                <p className="text-xs text-slate-500">{description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-400 hover:text-slate-600"
              data-testid="button-search"
            >
              <Search className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-400 hover:text-slate-600 relative"
              data-testid="button-notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-8 px-2 hover:bg-slate-100" data-testid="button-user-menu">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-xs font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-xs font-medium text-slate-900 leading-tight">
                      {user.name || user.username}
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight capitalize">{user.role}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs font-normal text-slate-500">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm">
                  <User className="mr-2 h-3.5 w-3.5" />
                  Profile
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem className="text-sm" onClick={() => setLocation('/admin/settings')}>
                    <Settings className="mr-2 h-3.5 w-3.5" />
                    Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => logoutMutation.mutate()}
                  className="text-sm text-red-600 focus:text-red-600"
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
