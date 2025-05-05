import { SummaryCardProps } from "@/types";
import { cn, formatNumber } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function SummaryCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  change,
  changeDirection,
}: SummaryCardProps) {
  // Format value if it's a number
  const formattedValue = typeof value === 'number' 
    ? formatNumber(value) 
    : value;
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1">{formattedValue}</p>
          </div>
          <div className={cn("p-2 rounded-full", iconBgColor)}>
            <i className={cn(icon, "text-xl", iconColor)}></i>
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <span className={cn(
            "font-medium flex items-center",
            changeDirection === 'up' ? 'text-destructive' : 'text-success'
          )}>
            <i className={changeDirection === 'up' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}></i> 
            {change}%
          </span>
          <span className="text-neutral-500 dark:text-neutral-400 ml-1">from previous period</span>
        </div>
      </CardContent>
    </Card>
  );
}
