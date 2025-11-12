import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { BarChart3, Package, TrendingUp, AlertCircle, Factory, DollarSign } from "lucide-react";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  
  const { data: kpis, isLoading } = trpc.dashboard.kpis.useQuery();
  const { data: announcements } = trpc.communication.announcements.useQuery({ isPinned: true });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Production Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.production")}
              </CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpis?.production.totalProduced.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("dashboard.totalProduced")}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Approved (A):</span>
                  <span className="font-semibold text-green-600">
                    {kpis?.production.totalApproved.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rejected (R):</span>
                  <span className="font-semibold text-red-600">
                    {kpis?.production.totalRejected.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t("dashboard.approvalRate")}:</span>
                  <span className="font-semibold">
                    {kpis?.production.approvalRate.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.quality")}
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpis?.quality.defectRate.toFixed(1) || 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("dashboard.defectRate")}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t("dashboard.rejectionRate")}:</span>
                  <span className="font-semibold text-red-600">
                    {kpis?.quality.rejectionRate.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.sales")}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpis?.sales.totalOrders || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("dashboard.totalOrders")}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Amount:</span>
                  <span className="font-semibold">
                    MMK {kpis?.sales.totalAmount.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Paid:</span>
                  <span className="font-semibold text-green-600">
                    MMK {kpis?.sales.paidAmount.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pending:</span>
                  <span className="font-semibold text-orange-600">
                    MMK {kpis?.sales.pendingAmount.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.inventory")}
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpis?.inventory.lowStockItems || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("dashboard.lowStock")}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Out of Stock:</span>
                  <span className="font-semibold text-red-600">
                    {kpis?.inventory.outOfStockItems || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Value:</span>
                  <span className="font-semibold">
                    MMK {kpis?.inventory.totalValue.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.financial")}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                MMK {kpis?.financial.netIncome.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Net Income
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Revenue:</span>
                  <span className="font-semibold text-green-600">
                    MMK {kpis?.financial.totalRevenue.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Expenses:</span>
                  <span className="font-semibold text-red-600">
                    MMK {kpis?.financial.totalExpenses.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        {announcements && announcements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.announcements")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {announcement.content}
                        </p>
                      </div>
                      {announcement.isPinned && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Pinned
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
