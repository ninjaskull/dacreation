import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, TrendingDown, IndianRupee, Calendar, Users, BarChart3, PartyPopper, Building2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportData {
  summary: {
    totalRevenue: number;
    previousRevenue: number;
    revenueGrowth: number;
    totalEvents: number;
    completedEvents: number;
    upcomingEvents: number;
    totalClients: number;
    newClients: number;
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
    previousConversionRate: number;
  };
  revenueByEventType: {
    type: string;
    amount: number;
    percentage: number;
  }[];
  leadSources: {
    source: string;
    count: number;
    percentage: number;
  }[];
  monthlyRevenue: {
    month: string;
    amount: number;
  }[];
  topClients: {
    id: string;
    name: string;
    totalSpent: number;
    eventsCount: number;
  }[];
  topVendors: {
    id: string;
    name: string;
    category: string;
    rating: number;
    eventsCompleted: number;
  }[];
}

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

const getDateRange = (period: string) => {
  const now = new Date();
  let dateFrom: Date;
  
  switch (period) {
    case 'this-week':
      dateFrom = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'this-month':
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'this-quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      dateFrom = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case 'this-year':
      dateFrom = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  return { dateFrom: dateFrom.toISOString(), dateTo: new Date().toISOString() };
};

const typeColors: Record<string, string> = {
  wedding: 'bg-pink-500',
  corporate: 'bg-blue-500',
  social: 'bg-green-500',
  destination: 'bg-amber-500',
  birthday: 'bg-purple-500',
  anniversary: 'bg-rose-500',
  other: 'bg-gray-500'
};

const sourceColors: Record<string, { bg: string; text: string }> = {
  website: { bg: 'bg-blue-100', text: 'text-blue-600' },
  referral: { bg: 'bg-green-100', text: 'text-green-600' },
  social_media: { bg: 'bg-purple-100', text: 'text-purple-600' },
  event: { bg: 'bg-amber-100', text: 'text-amber-600' },
  other: { bg: 'bg-gray-100', text: 'text-gray-600' }
};

export default function ReportsPage() {
  const [period, setPeriod] = useState("this-month");
  const { toast } = useToast();

  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ["/api/reports", period],
    queryFn: async () => {
      const { dateFrom, dateTo } = getDateRange(period);
      const response = await fetch(`/api/reports?dateFrom=${dateFrom}&dateTo=${dateTo}`);
      if (!response.ok) throw new Error("Failed to fetch reports");
      return response.json();
    },
  });

  const handleExport = () => {
    toast({ title: "Generating report...", description: "Your report will be downloaded shortly." });
  };

  const summary = reportData?.summary || {
    totalRevenue: 0,
    previousRevenue: 0,
    revenueGrowth: 0,
    totalEvents: 0,
    completedEvents: 0,
    upcomingEvents: 0,
    totalClients: 0,
    newClients: 0,
    totalLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    previousConversionRate: 0,
  };

  const revenueByType = reportData?.revenueByEventType || [];
  const leadSources = reportData?.leadSources || [];
  const monthlyRevenue = reportData?.monthlyRevenue || [];
  const topClients = reportData?.topClients || [];
  const topVendors = reportData?.topVendors || [];

  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map(m => m.amount), 1);

  return (
    <AdminLayout title="Reports" description="Analytics and performance insights">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Business Analytics</h2>
            <p className="text-muted-foreground">Track performance and make data-driven decisions</p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]" data-testid="select-period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="this-quarter">This Quarter</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport} data-testid="button-export-report">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-revenue">{formatCurrency(summary.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    {summary.revenueGrowth >= 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-500">+{summary.revenueGrowth.toFixed(1)}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3 text-red-500" />
                        <span className="text-red-500">{summary.revenueGrowth.toFixed(1)}%</span>
                      </>
                    )} vs previous period
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Events Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-completed-events">{summary.completedEvents}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.upcomingEvents} upcoming
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    New Clients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-new-clients">{summary.newClients}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.totalClients} total clients
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-amber-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Conversion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-conversion-rate">{summary.conversionRate.toFixed(0)}%</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    {summary.conversionRate >= summary.previousConversionRate ? (
                      <>
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-500">
                          +{(summary.conversionRate - summary.previousConversionRate).toFixed(0)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3 text-red-500" />
                        <span className="text-red-500">
                          {(summary.conversionRate - summary.previousConversionRate).toFixed(0)}%
                        </span>
                      </>
                    )} vs previous
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PartyPopper className="w-5 h-5" />
                    Revenue by Event Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {revenueByType.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <p>No event data available for this period</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {revenueByType.map((item) => (
                        <div key={item.type}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium capitalize">{item.type}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(item.amount)} ({item.percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${typeColors[item.type] || 'bg-gray-500'}`} 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Lead Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leadSources.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <p>No lead data available for this period</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {leadSources.map((source) => {
                        const colors = sourceColors[source.source] || sourceColors.other;
                        return (
                          <div key={source.source} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center`}>
                                <span className={`${colors.text} text-sm font-medium`}>
                                  {source.source.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium capitalize">{source.source.replace('_', ' ')}</p>
                                <p className="text-sm text-muted-foreground">{source.count} leads</p>
                              </div>
                            </div>
                            <span className="font-semibold">{source.percentage.toFixed(0)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Top Clients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topClients.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-8 h-8 mx-auto mb-2" />
                      <p>No client data available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topClients.map((client, index) => (
                        <div key={client.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{client.name}</p>
                              <p className="text-sm text-muted-foreground">{client.eventsCount} events</p>
                            </div>
                          </div>
                          <span className="font-semibold text-green-600">{formatCurrency(client.totalSpent)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Top Vendors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topVendors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building2 className="w-8 h-8 mx-auto mb-2" />
                      <p>No vendor data available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topVendors.map((vendor, index) => (
                        <div key={vendor.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{vendor.name}</p>
                              <p className="text-sm text-muted-foreground capitalize">{vendor.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-amber-600">{vendor.rating?.toFixed(1) || 'N/A'}</span>
                            <p className="text-sm text-muted-foreground">{vendor.eventsCompleted} events</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyRevenue.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                    <p>No revenue data available for this period</p>
                  </div>
                ) : (
                  <div className="h-64 flex items-end justify-between gap-2 pt-4">
                    {monthlyRevenue.map((item, i) => {
                      const heightPercentage = (item.amount / maxMonthlyRevenue) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex flex-col items-center">
                            <span className="text-xs text-muted-foreground mb-1">
                              {formatCurrency(item.amount)}
                            </span>
                            <div 
                              className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                              style={{ height: `${Math.max(heightPercentage, 5)}%`, minHeight: '8px' }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground">{item.month}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
