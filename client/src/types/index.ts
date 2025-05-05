import { User, Emission, EmissionCategory, Company, Report } from "@shared/schema";

export interface SidebarItem {
  name: string;
  icon: string;
  path: string;
}

export interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  change: number;
  changeDirection: 'up' | 'down';
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface EmissionsByCategory {
  categoryName: string;
  value: number;
  percentage: number;
  color: string;
}

export interface EmissionSummary {
  total: number;
  scope1: number;
  scope2: number;
  scope3: number;
  byCategory: EmissionsByCategory[];
}

export interface RecentEmission {
  id: number;
  date: string;
  scope: string;
  source: string;
  amount: number;
  status: 'verified' | 'pending' | 'needs_review';
}

export interface Recommendation {
  id: number;
  title: string;
  description: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  learnMoreUrl: string;
}

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
}

export interface EmissionFormData {
  scope: string;
  categoryId: number;
  description: string;
  amount: number;
  date: Date;
  documentUrl?: string;
  verified: boolean;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface NavbarProps {
  toggleSidebar: () => void;
}

export interface DashboardData {
  summaryCards: SummaryCardProps[];
  emissionsByMonth: ChartDataPoint[];
  emissionsByCategory: EmissionsByCategory[];
  recentEmissions: RecentEmission[];
  recommendations: Recommendation[];
}
