import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { EmissionsChart } from "@/components/dashboard/emissions-chart";
import { PieChart } from "@/components/dashboard/pie-chart";
import { RecentEmissionsTable } from "@/components/dashboard/recent-emissions-table";
import { Recommendations } from "@/components/dashboard/recommendations";
import { DashboardActions } from "@/components/dashboard/dashboard-actions";
import { EmissionsModal } from "@/components/emissions/emissions-modal";
import { FloatingActionButton } from "@/components/dashboard/floating-action-button";
import { DateRange, ChartDataPoint, EmissionsByCategory, RecentEmission, Recommendation } from "@/types";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [showEmissionsModal, setShowEmissionsModal] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(subMonths(new Date(), 5)),
    to: endOfMonth(new Date())
  });
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Fetch emissions summary
  const { data: emissionsSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['/api/emissions/summary', dateRange],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (dateRange.from) queryParams.append('startDate', dateRange.from.toISOString());
      if (dateRange.to) queryParams.append('endDate', dateRange.to.toISOString());
      
      const res = await fetch(`/api/emissions/summary?${queryParams}`);
      if (!res.ok) throw new Error('Failed to fetch emissions summary');
      return res.json();
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });

  // Fetch recent emissions
  const { data: recentEmissions, isLoading: isLoadingEmissions } = useQuery({
    queryKey: ['/api/emissions'],
    queryFn: async () => {
      const res = await fetch('/api/emissions');
      if (!res.ok) throw new Error('Failed to fetch emissions');
      return res.json();
    },
  });

  // Sample chart data (would come from API in a real application)
  const getEmissionsByMonth = (): ChartDataPoint[] => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      months.push({
        name: format(month, 'MMM yyyy'),
        value: emissionsSummary?.total ? (emissionsSummary.total / 6) * (0.8 + Math.random() * 0.4) : 0
      });
    }
    
    return months;
  };

  // Prepare emissions by category for pie chart
  const getEmissionsByCategory = (): EmissionsByCategory[] => {
    if (!emissionsSummary?.byCategory) return [];
    
    const colors = ['#0A84FF', '#30D158', '#FF9F0A', '#64D2FF', '#FF453A'];
    
    return emissionsSummary.byCategory.map((category: any, index: number) => ({
      categoryName: category.name,
      value: parseFloat(category.amount),
      percentage: parseFloat(category.percentage),
      color: colors[index % colors.length]
    }));
  };

  // Prepare recent emissions for table
  const getRecentEmissions = (): RecentEmission[] => {
    if (!recentEmissions) return [];
    
    return recentEmissions.slice(0, 5).map((emission: any) => ({
      id: emission.id,
      date: emission.date,
      scope: emission.category.scope,
      source: emission.category.name,
      amount: parseFloat(emission.amount),
      status: emission.verified ? 'verified' : 'pending'
    }));
  };

  // AI recommendations (would come from API in a real application)
  const recommendations: Recommendation[] = [
    {
      id: 1,
      title: "Optimize Electricity Usage",
      description: "Your electricity usage is 15% higher than industry average. Consider installing energy-efficient lighting.",
      icon: "ri-lightbulb-flash-line",
      iconBgColor: "bg-primary/10",
      iconColor: "text-primary",
      learnMoreUrl: "/recommendations/1"
    },
    {
      id: 2,
      title: "Fleet Optimization",
      description: "Transitioning 20% of your fleet to electric vehicles could reduce emissions by 12%.",
      icon: "ri-car-line",
      iconBgColor: "bg-secondary/10",
      iconColor: "text-secondary",
      learnMoreUrl: "/recommendations/2"
    },
    {
      id: 3,
      title: "Supply Chain Improvement",
      description: "Your Scope 3 emissions from purchased goods could be reduced by working with vendors with better sustainability practices.",
      icon: "ri-recycle-line",
      iconBgColor: "bg-accent/10",
      iconColor: "text-accent",
      learnMoreUrl: "/recommendations/3"
    }
  ];

  // Summary Cards data
  const summaryCards = [
    {
      title: "Total Emissions",
      value: isLoadingSummary ? "Loading..." : `${emissionsSummary?.total?.toFixed(1) || "0"} tCO₂e`,
      icon: "ri-leaf-line",
      iconBgColor: "bg-primary/10",
      iconColor: "text-primary",
      change: 12.3,
      changeDirection: 'up' as const
    },
    {
      title: "Scope 1 Emissions",
      value: isLoadingSummary ? "Loading..." : `${emissionsSummary?.scope1?.toFixed(1) || "0"} tCO₂e`,
      icon: "ri-gas-station-line",
      iconBgColor: "bg-secondary/10",
      iconColor: "text-secondary",
      change: 3.1,
      changeDirection: 'down' as const
    },
    {
      title: "Scope 2 Emissions",
      value: isLoadingSummary ? "Loading..." : `${emissionsSummary?.scope2?.toFixed(1) || "0"} tCO₂e`,
      icon: "ri-flashlight-line",
      iconBgColor: "bg-info/10",
      iconColor: "text-info",
      change: 8.5,
      changeDirection: 'up' as const
    },
    {
      title: "Scope 3 Emissions",
      value: isLoadingSummary ? "Loading..." : `${emissionsSummary?.scope3?.toFixed(1) || "0"} tCO₂e`,
      icon: "ri-flight-takeoff-line",
      iconBgColor: "bg-accent/10",
      iconColor: "text-accent",
      change: 5.2,
      changeDirection: 'down' as const
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              View and analyze your carbon emission data
            </p>
          </div>
          
          <DashboardActions dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, index) => (
            <SummaryCard key={index} {...card} />
          ))}
        </div>

        {/* Charts and Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Emissions Over Time Chart */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 lg:col-span-2">
            {isLoadingSummary ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-48" />
                </div>
                <Skeleton className="h-72 w-full" />
              </div>
            ) : (
              <EmissionsChart 
                data={getEmissionsByMonth()} 
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
              />
            )}
          </div>

          {/* Emissions by Category */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
            {isLoadingSummary ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-64 w-full" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <PieChart data={getEmissionsByCategory()} />
            )}
          </div>
        </div>
        
        {/* Emissions Data and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Emissions Data */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 lg:col-span-2">
            {isLoadingEmissions ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            ) : (
              <RecentEmissionsTable emissions={getRecentEmissions()} />
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
            <Recommendations recommendations={recommendations} />
          </div>
        </div>
      </div>

      {/* Emissions Data Input Modal */}
      <EmissionsModal
        isOpen={showEmissionsModal}
        onClose={() => setShowEmissionsModal(false)}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setShowEmissionsModal(true)} />
    </Layout>
  );
}
