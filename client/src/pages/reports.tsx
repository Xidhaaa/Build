import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileDown, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface DailyReport {
  date: string;
  totalPasses: number;
  passNumbers: string[];
  totalRevenue: string;
  passByType: {
    [key: string]: {
      count: number;
      revenue: string;
    };
  };
}

export default function Reports() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: dailyReport, isLoading } = useQuery({
    queryKey: ["/api/reports/daily", selectedDate],
    enabled: !!selectedDate,
  });

  const downloadReport = () => {
    if (!dailyReport) return;

    const report = dailyReport as DailyReport;
    const csvContent = [
      "Daily Port Pass Report",
      `Date: ${format(new Date(selectedDate), 'MMMM dd, yyyy')}`,
      "",
      "Summary:",
      `Total Passes Issued: ${report.totalPasses}`,
      `Total Revenue: MVR ${report.totalRevenue}`,
      "",
      "Pass Details by Type:",
      ...Object.entries(report.passByType).map(([type, details]) => 
        `${type}: ${details.count} passes, MVR ${details.revenue}`
      ),
      "",
      "Pass Numbers:",
      ...report.passNumbers.map((num, index) => `${index + 1}. ${num}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `port-pass-report-${selectedDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const report = dailyReport as DailyReport;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate and download daily pass reports
          </p>
        </div>
        <Calendar className="h-8 w-8 text-blue-600" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Report Date</CardTitle>
          <CardDescription>
            Choose a date to generate the daily summary report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="date">Report Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              onClick={downloadReport}
              disabled={!report || isLoading}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">Loading report data...</div>
          </CardContent>
        </Card>
      )}

      {report && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Passes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.totalPasses}</div>
              <p className="text-xs text-muted-foreground">
                Issued on {format(new Date(selectedDate), 'MMM dd, yyyy')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">MVR {report.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">
                Total collected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Types</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(report.passByType).length}</div>
              <p className="text-xs text-muted-foreground">
                Different types issued
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {report && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pass Types Breakdown</CardTitle>
              <CardDescription>Revenue and count by pass type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(report.passByType).map(([type, details]) => (
                  <div key={type} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{type}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{details.count} passes</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">MVR {details.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pass Numbers</CardTitle>
              <CardDescription>All pass numbers issued on this date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {report.passNumbers.map((passNumber, index) => (
                    <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm font-mono">
                      {passNumber}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {report && report.totalPasses === 0 && !isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              No passes were issued on {format(new Date(selectedDate), 'MMMM dd, yyyy')}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}