import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { SidebarItem } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [location] = useLocation();
  const { user } = useAuth();
  const isMobile = useMobile();
  const { t } = useLanguage();
  
  // Get active subscription
  const { data: subscription } = useQuery<any>({
    queryKey: ["/api/subscription"],
    enabled: !!user?.companyId,
  });
  
  const planName = subscription?.plan?.name || "Basic";
  const renewalDays = 27; // This would come from the subscription in a real app
  
  // Close sidebar on mobile when location changes
  useEffect(() => {
    if (isMobile && isOpen) {
      onClose();
    }
  }, [location, isMobile, isOpen, onClose]);
  
  // Navigation items
  const mainNavItems: SidebarItem[] = [
    { name: t('nav.dashboard'), icon: "ri-dashboard-line", path: "/" },
    { name: t('nav.reports'), icon: "ri-file-chart-line", path: "/reports" },
    { name: t('nav.emissions'), icon: "ri-leaf-line", path: "/emissions" },
    { name: t('nav.predictions'), icon: "ri-rocket-line", path: "/predictions" },
  ];
  
  const dataNavItems: SidebarItem[] = [
    { name: t('nav.dataUpload'), icon: "ri-upload-cloud-line", path: "/upload" },
    { name: t('nav.integrations'), icon: "ri-plug-line", path: "/integrations" },
    { name: t('nav.history'), icon: "ri-history-line", path: "/history" },
  ];
  
  const supportNavItems: SidebarItem[] = [
    { name: "Support Center", icon: "ri-customer-service-line", path: "/support" },
    { name: "Help Articles", icon: "ri-book-open-line", path: "/help" },
  ];
  
  const settingsNavItems: SidebarItem[] = [
    { name: t('nav.profile'), icon: "ri-user-settings-line", path: "/profile" },
    { name: t('nav.company'), icon: "ri-building-line", path: "/company" },
    { name: t('nav.subscription'), icon: "ri-vip-crown-line", path: "/subscription" },
    { name: t('nav.teamMembers'), icon: "ri-team-line", path: "/team" },
  ];
  
  // Render a navigation section
  const renderNavSection = (title: string, items: SidebarItem[]) => (
    <div className="mt-6 space-y-1">
      <p className="text-xs uppercase font-semibold text-neutral-500 dark:text-neutral-400 mb-2 px-3">{title}</p>
      {items.map((item) => {
        const isActive = location === item.path;
        return (
          <Link 
            key={item.path}
            href={item.path}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              isActive 
                ? "text-primary bg-primary/10" 
                : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            <i className={cn(item.icon, "mr-3 text-lg")}></i>
            {item.name}
          </Link>
        )
      })}
    </div>
  );
  
  // If the sidebar should be hidden (mobile and closed), don't render
  if (isMobile && !isOpen) {
    return null;
  }
  
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-neutral-950/50 z-10 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside 
        className={cn(
          "w-64 shrink-0 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex flex-col h-screen overflow-y-auto fixed top-0 pt-16 z-20",
          isMobile && !isOpen ? "-translate-x-full" : "",
          "transform transition-transform duration-300"
        )}
      >
        {/* Navigation Sections */}
        <nav className="px-3 py-4 flex-1">
          {renderNavSection(t('nav.sections.main'), mainNavItems)}
          {renderNavSection(t('nav.sections.data'), dataNavItems)}
          {renderNavSection("Support", supportNavItems)}
          {renderNavSection(t('nav.sections.settings'), settingsNavItems)}
        </nav>
        
        {/* Subscription Status */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="subscription-badge">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="ri-vip-crown-fill text-accent text-xl"></i>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">{planName} {t('subscription.plan')}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t('subscription.renewsIn', { days: renewalDays })}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <a href="/subscription" className="text-xs text-primary font-medium hover:text-primary-dark">
                {t('subscription.upgradeText')} →
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
