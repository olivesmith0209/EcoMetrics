import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import { Layout } from "@/components/layout/layout";
import { EmissionsModal } from "@/components/emissions/emissions-modal";
import { FloatingActionButton } from "@/components/dashboard/floating-action-button";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { SearchIcon, FilterIcon, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStatusClass, formatDate, formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmissionsPage() {
  const [showEmissionsModal, setShowEmissionsModal] = useState(false);
  const [selectedEmission, setSelectedEmission] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // Fetch emissions data
  const { data: emissions, isLoading, isError } = useQuery({
    queryKey: ["/api/emissions", dateRange, scopeFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (dateRange?.from) queryParams.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to) queryParams.append("endDate", dateRange.to.toISOString());
      if (scopeFilter !== "all") queryParams.append("scope", scopeFilter);

      const res = await fetch(`/api/emissions?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch emissions data");
      return res.json();
    },
  });

  // Fetch emission categories
  const { data: categories } = useQuery({
    queryKey: ["/api/emission-categories"],
    queryFn: async () => {
      const res = await fetch("/api/emission-categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // Handle emission edit
  const handleEditEmission = (emission: any) => {
    setSelectedEmission(emission);
    setShowEmissionsModal(true);
  };

  // Filter emissions by search query
  const filteredEmissions = emissions
    ? emissions.filter((emission: any) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          emission.description?.toLowerCase().includes(searchLower) ||
          emission.category?.name.toLowerCase().includes(searchLower) ||
          emission.category?.scope.toLowerCase().includes(searchLower)
        );
      })
    : [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Emissions</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage and track your emissions data
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setSelectedEmission(null);
                setShowEmissionsModal(true);
              }}
              className="bg-primary text-white"
            >
              Add New Emission
            </Button>
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter emissions data by various criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Search
                </label>
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                  <Input
                    placeholder="Search emissions..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Scope</label>
                <Select
                  value={scopeFilter}
                  onValueChange={setScopeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scopes</SelectItem>
                    <SelectItem value="Scope 1">Scope 1</SelectItem>
                    <SelectItem value="Scope 2">Scope 2</SelectItem>
                    <SelectItem value="Scope 3">Scope 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Date Range
                </label>
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Emissions Data</CardTitle>
            <CardDescription>
              {filteredEmissions?.length || 0} emissions found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
              </div>
            ) : isError ? (
              <div className="py-8 text-center">
                <p className="text-red-500">
                  Error loading emissions data. Please try again.
                </p>
              </div>
            ) : filteredEmissions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-neutral-500 dark:text-neutral-400">
                  No emissions data found. Try adjusting your filters or add new
                  emissions.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmissions.map((emission: any) => (
                      <TableRow key={emission.id}>
                        <TableCell>{formatDate(emission.date)}</TableCell>
                        <TableCell>{emission.category.scope}</TableCell>
                        <TableCell>{emission.category.name}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {emission.description || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(emission.amount)} tCO<sub>2</sub>e
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={getStatusClass(
                              emission.verified
                                ? "verified"
                                : "pending"
                            )}
                          >
                            {emission.verified ? "Verified" : "Pending"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEmission(emission)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emissions Modal */}
      <EmissionsModal
        isOpen={showEmissionsModal}
        onClose={() => {
          setShowEmissionsModal(false);
          setSelectedEmission(null);
        }}
        emission={selectedEmission}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => {
          setSelectedEmission(null);
          setShowEmissionsModal(true);
        }}
      />
    </Layout>
  );
}
