import { useState } from "react";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { LayoutProps } from "@/types";
import { useMobile } from "@/hooks/use-mobile";

export function Layout({ children }: LayoutProps) {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-neutral-100 dark:bg-neutral-900">
          {children}
        </main>
      </div>
    </div>
  );
}
