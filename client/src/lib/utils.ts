import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined, formatStr: string = "MMM dd, yyyy"): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

export function formatNumber(value: number | string | null | undefined, options: Intl.NumberFormatOptions = {}): string {
  if (value === null || value === undefined) return "";
  
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "";
  
  return new Intl.NumberFormat("en-US", options).format(num);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function getIconForCategory(categoryName: string): string {
  const iconMap: Record<string, string> = {
    "Electricity": "ri-flashlight-line",
    "Natural Gas": "ri-fire-line",
    "Fleet Vehicles": "ri-car-line",
    "Heating": "ri-home-heat-line",
    "Business Travel": "ri-flight-takeoff-line",
    "Purchased Goods": "ri-shopping-bag-line",
    "Waste Generated": "ri-delete-bin-line",
    "Employee Commuting": "ri-road-map-line",
    "Other": "ri-more-2-line",
  };
  
  return iconMap[categoryName] || "ri-leaf-line";
}

export function getColorForScope(scope: string): string {
  const colorMap: Record<string, string> = {
    "Scope 1": "text-secondary bg-secondary/10",
    "Scope 2": "text-info bg-info/10",
    "Scope 3": "text-accent bg-accent/10",
  };
  
  return colorMap[scope] || "text-primary bg-primary/10";
}

export function getStatusClass(status: string): string {
  const statusMap: Record<string, string> = {
    "verified": "status-badge status-verified",
    "pending": "status-badge status-pending",
    "needs_review": "status-badge status-review",
  };
  
  return statusMap[status] || "status-badge bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300";
}

export function getSubscriptionRenewalText(endDate: Date | string | null | undefined): string {
  if (!endDate) return "No active subscription";
  
  const end = typeof endDate === "string" ? parseISO(endDate) : endDate;
  const now = new Date();
  
  // Calculate days remaining
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Expired";
  return `Renews in ${diffDays} days`;
}

export function getDateRangeText(startDate: Date | undefined, endDate: Date | undefined): string {
  if (!startDate || !endDate) return "Select date range";
  
  // If same day, just return that date
  if (format(startDate, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd")) {
    return format(startDate, "MMM dd, yyyy");
  }
  
  // If same month and year, combine them
  if (format(startDate, "MMM yyyy") === format(endDate, "MMM yyyy")) {
    return `${format(startDate, "MMM dd")} - ${format(endDate, "dd, yyyy")}`;
  }
  
  // If same year, combine them
  if (format(startDate, "yyyy") === format(endDate, "yyyy")) {
    return `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd, yyyy")}`;
  }
  
  // Different years
  return `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`;
}
