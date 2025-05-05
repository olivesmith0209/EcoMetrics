import { RecentEmission } from "@/types";
import { formatDate, formatNumber, getStatusClass } from "@/lib/utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface RecentEmissionsTableProps {
  emissions: RecentEmission[];
}

export function RecentEmissionsTable({ emissions }: RecentEmissionsTableProps) {
  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Recent Emissions Data</h3>
        <Link href="/emissions">
          <Button variant="link" className="text-primary">View All</Button>
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Category</TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Source</TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Amount</TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emissions.map((emission) => (
              <TableRow key={emission.id}>
                <TableCell className="py-3 whitespace-nowrap text-sm">
                  {formatDate(emission.date)}
                </TableCell>
                <TableCell className="py-3 whitespace-nowrap text-sm">
                  {emission.scope}
                </TableCell>
                <TableCell className="py-3 whitespace-nowrap text-sm">
                  {emission.source}
                </TableCell>
                <TableCell className="py-3 whitespace-nowrap text-sm font-medium">
                  {formatNumber(emission.amount)} tCO<sub>2</sub>e
                </TableCell>
                <TableCell className="py-3 whitespace-nowrap text-right text-sm">
                  <span className={getStatusClass(emission.status)}>
                    {emission.status === 'verified' && 'Verified'}
                    {emission.status === 'pending' && 'Pending'}
                    {emission.status === 'needs_review' && 'Needs Review'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
