import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { ReportForm } from "@/components/reports/report-form";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, FileText, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch reports
  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/reports"],
    queryFn: async () => {
      const res = await fetch("/api/reports");
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
  });

  // Fetch report templates
  const templates = [
    {
      id: 1,
      name: "Annual Carbon Footprint",
      description: "Complete annual report of all scope emissions",
      type: "annual",
    },
    {
      id: 2,
      name: "CSRD Compliance Report",
      description: "EU Corporate Sustainability Reporting Directive compliance report",
      type: "compliance",
    },
    {
      id: 3,
      name: "GHG Protocol Report",
      description: "Report following the Greenhouse Gas Protocol standards",
      type: "compliance",
    },
    {
      id: 4,
      name: "Quarterly Summary",
      description: "Three-month summary of emissions data",
      type: "quarterly",
    },
    {
      id: 5,
      name: "Emission Reduction Progress",
      description: "Track progress toward reduction targets",
      type: "progress",
    },
    {
      id: 6,
      name: "Custom Report",
      description: "Start with a blank template",
      type: "custom",
    },
  ];

  // Filter reports based on active tab
  const filteredReports = reports
    ? reports.filter((report: any) =>
        activeTab === "all" ? true : report.type === activeTab
      )
    : [];

  // Handle view report
  const handleViewReport = (report: any) => {
    // In a real app, this would navigate to a report details page
    console.log("View report:", report);
  };

  // Handle create report from template
  const handleCreateFromTemplate = (template: any) => {
    setSelectedReport({ template });
    setShowReportModal(true);
  };

  // Get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "completed":
        return <Badge className="bg-success text-white">Completed</Badge>;
      case "pending":
        return <Badge className="bg-warning text-white">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Generate and manage your carbon emission reports
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setSelectedReport(null);
                setShowReportModal(true);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Report
            </Button>
          </div>
        </div>

        {/* Templates Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Report Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {template.description}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleCreateFromTemplate(template)}
                  >
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Reports</h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Reports</TabsTrigger>
              <TabsTrigger value="annual">Annual</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {activeTab === "all" ? "All Reports" : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Reports`}
                  </CardTitle>
                  <CardDescription>
                    {filteredReports?.length || 0} reports found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      {Array(3)
                        .fill(0)
                        .map((_, index) => (
                          <Skeleton key={index} className="h-12 w-full" />
                        ))}
                    </div>
                  ) : !filteredReports || filteredReports.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Reports Yet</h3>
                      <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                        Create your first report to get started
                      </p>
                      <Button
                        onClick={() => {
                          setSelectedReport(null);
                          setShowReportModal(true);
                        }}
                      >
                        Create New Report
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date Range</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredReports.map((report: any) => (
                            <TableRow key={report.id}>
                              <TableCell className="font-medium">
                                {report.name}
                              </TableCell>
                              <TableCell className="capitalize">
                                {report.type}
                              </TableCell>
                              <TableCell>
                                {formatDate(report.startDate)} - {formatDate(report.endDate)}
                              </TableCell>
                              <TableCell>{formatDate(report.createdAt)}</TableCell>
                              <TableCell>
                                {getStatusBadge(report.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewReport(report)}
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create/Edit Report Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedReport ? "Edit Report" : "Create New Report"}
            </DialogTitle>
            <DialogDescription>
              {selectedReport?.template
                ? `Create a new report based on the ${selectedReport.template.name} template`
                : "Fill in the details to create a custom report"}
            </DialogDescription>
          </DialogHeader>
          <ReportForm
            initialData={selectedReport}
            onSuccess={() => setShowReportModal(false)}
            onCancel={() => setShowReportModal(false)}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
