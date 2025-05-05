import { useTheme } from "@/lib/theme-provider";
import { ChartDataPoint } from "@/types";
import { formatDate, formatNumber } from "@/lib/utils";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface EmissionsChartProps {
  data: ChartDataPoint[];
  timeframe: 'monthly' | 'quarterly' | 'yearly';
  onTimeframeChange: (timeframe: 'monthly' | 'quarterly' | 'yearly') => void;
}

export function EmissionsChart({ 
  data,
  timeframe,
  onTimeframeChange 
}: EmissionsChartProps) {
  const { theme } = useTheme();
  
  // Color values based on theme
  const colors = {
    area: theme === 'dark' ? 'rgba(10, 132, 255, 0.2)' : 'rgba(10, 132, 255, 0.1)',
    stroke: theme === 'dark' ? '#0A84FF' : '#0A84FF',
    grid: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    text: theme === 'dark' ? '#AEAEB2' : '#8E8E93',
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-800 p-3 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-md">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-primary font-semibold">
            {formatNumber(payload[0].value)} tCO<sub>2</sub>e
          </p>
        </div>
      );
    }
  
    return null;
  };
  
  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Emissions Over Time</h3>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={timeframe === 'monthly' ? 'secondary' : 'outline'}
            onClick={() => onTimeframeChange('monthly')}
          >
            Monthly
          </Button>
          <Button
            size="sm"
            variant={timeframe === 'quarterly' ? 'secondary' : 'outline'}
            onClick={() => onTimeframeChange('quarterly')}
          >
            Quarterly
          </Button>
          <Button
            size="sm"
            variant={timeframe === 'yearly' ? 'secondary' : 'outline'}
            onClick={() => onTimeframeChange('yearly')}
          >
            Yearly
          </Button>
        </div>
      </div>
      
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.stroke} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors.stroke} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: colors.text, fontSize: 12 }}
              tickLine={{ stroke: colors.grid }}
              axisLine={{ stroke: colors.grid }}
            />
            <YAxis 
              tick={{ fill: colors.text, fontSize: 12 }}
              tickLine={{ stroke: colors.grid }}
              axisLine={{ stroke: colors.grid }}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={colors.stroke} 
              fillOpacity={1}
              fill="url(#colorEmissions)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
