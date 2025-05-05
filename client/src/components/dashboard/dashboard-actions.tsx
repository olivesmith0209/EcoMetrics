import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download } from 'lucide-react';

interface DashboardActionsProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export function DashboardActions({ 
  dateRange, 
  onDateRangeChange 
}: DashboardActionsProps) {
  const [exportFormat, setExportFormat] = useState<string>('pdf');
  
  // Handle export
  const handleExport = () => {
    console.log(`Exporting in ${exportFormat} format for date range:`, dateRange);
    // In a real app, this would call an API endpoint to generate the export
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        className="min-w-[180px] sm:min-w-[250px]"
      />
      
      <Select
        value={exportFormat}
        onValueChange={setExportFormat}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pdf">PDF</SelectItem>
          <SelectItem value="csv">CSV</SelectItem>
          <SelectItem value="excel">Excel</SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        onClick={handleExport}
        className="bg-primary text-white"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  );
}
