import { useTheme } from "@/lib/theme-provider";
import { EmissionsByCategory } from "@/types";
import { formatNumber } from "@/lib/utils";
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

interface PieChartProps {
  data: EmissionsByCategory[];
}

export function PieChart({ data }: PieChartProps) {
  const { theme } = useTheme();
  
  // Prepare colors for chart
  const COLORS = ['#0A84FF', '#30D158', '#FF9F0A', '#64D2FF', '#FF453A'];
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-neutral-800 p-3 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-md">
          <p className="text-sm font-medium">{data.categoryName}</p>
          <p className="text-sm text-primary font-semibold">
            {formatNumber(data.value)} tCO<sub>2</sub>e ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="h-full">
      <h3 className="font-semibold mb-4">Emissions by Category</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              nameKey="categoryName"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-sm mr-2"
                style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
              ></div>
              <span>{item.categoryName}</span>
            </div>
            <span className="font-medium">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
