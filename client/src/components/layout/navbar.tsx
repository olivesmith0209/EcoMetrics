import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/lib/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import { NavbarProps } from "@/types";
import { useState } from "react";
import { Bell, ChevronDown, Menu, Moon, Plus, Search, Sun } from "lucide-react";
import { Link } from "wouter";

export function Navbar({ toggleSidebar }: NavbarProps) {
  const { user, logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useMobile();
  const [notificationsCount, setNotificationsCount] = useState(3);
  
  function handleLogout() {
    logoutMutation.mutate();
  }
  
  // Initials for the avatar
  const initials = user?.firstName && user?.lastName 
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` 
    : user?.username.substring(0, 2).toUpperCase();
  
  return (
    <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center justify-between h-16 px-4 lg:px-6 sticky top-0 z-30">
      {/* Left Side with Logo */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden mr-3 text-neutral-600 dark:text-neutral-300"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-primary-dark dark:text-primary font-bold text-xl">
            <i className="ri-leaf-line mr-1 text-secondary"></i>
            <span>EcoMetrics</span>
          </div>
          <span className="hidden md:inline-flex text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full items-center">
            Beta
          </span>
        </div>
      </div>

      {/* Right Side with Actions */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Search */}
        <div className="hidden md:flex relative">
          <Input
            type="text"
            placeholder="Search..."
            className="bg-neutral-100 dark:bg-neutral-700 border-transparent focus:border-primary pl-8 pr-4 py-1.5 text-sm w-48 lg:w-64"
          />
          <Search className="h-4 w-4 absolute left-2.5 top-2 text-neutral-500" />
        </div>

        {/* Quick Actions */}
        <Button variant="ghost" size="icon" className="text-neutral-600 dark:text-neutral-300">
          <Plus className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="text-neutral-600 dark:text-neutral-300">
            <Bell className="h-5 w-5" />
            {notificationsCount > 0 && (
              <span className="absolute top-1 right-1 bg-destructive text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {notificationsCount}
              </span>
            )}
          </Button>
        </div>

        {/* Dark/Light Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-neutral-600 dark:text-neutral-300"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-1 p-1">
              <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {initials}
              </div>
              {!isMobile && (
                <>
                  <span className="text-sm font-medium ml-2">{user?.firstName || user?.username}</span>
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <Link href="/profile">
              <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
            </Link>
            <Link href="/subscription">
              <DropdownMenuItem className="cursor-pointer">Subscription</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <Link href="/help">
              <DropdownMenuItem className="cursor-pointer">Help & Support</DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
