import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Factory, TrendingUp, DollarSign, AlertTriangle, Package, Users } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const { data: kpis, isLoading } = trpc.dashboard.getKPIs.useQuery({ month: selectedMonth });
  const { data: alerts } = trpc.dashboard.getAlerts.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-40"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const productionRate = kpis?.production.totalProduced 
    ? ((kpis.production.totalApproved / kpis.production.totalProduced) * 100).toFixed(1)
    : "0";

  const collectionRate = kpis?.sales.totalRevenue
    ? ((kpis.sales.totalPaid / kpis.sales.totalRevenue) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome to Yangon Tyre Business Management System</p>
        </div>
        <div className="flex gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Production Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Production</CardTitle>
            <Factory className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.production.totalProduced?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {productionRate}% approval rate
            </p>
            <div className="mt-2 text-xs">
              <span className="text-green-600">✓ {kpis?.production.totalApproved?.toLocaleString() || 0} approved</span>
              <span className="text-red-600 ml-2">✗ {kpis?.production.totalRejected?.toLocaleString() || 0} rejected</span>
            </div>
          </CardContent>
        </Card>

        {/* Sales Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.sales.totalOrders?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              Total orders this month
            </p>
            <div className="mt-2 text-xs">
              <span className="text-gray-600">Revenue: MMK {((kpis?.sales.totalRevenue || 0) / 100).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Collection</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">MMK {((kpis?.sales.totalPaid || 0) / 100).toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {collectionRate}% collection rate
            </p>
            <div className="mt-2 text-xs text-gray-600">
              Outstanding: MMK {(((kpis?.sales.totalRevenue || 0) - (kpis?.sales.totalPaid || 0)) / 100).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Alerts Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              Requires attention
            </p>
            <div className="mt-2 text-xs">
              <span className="text-orange-600">
                {kpis?.alerts?.lowStockMaterials || 0} low stock materials
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {alerts && alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      alert.severity === 'critical' ? 'text-red-600' :
                      alert.severity === 'high' ? 'text-orange-600' :
                      alert.severity === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No active alerts</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Factory className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">Production Efficiency</span>
                </div>
                <span className="font-semibold">{productionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Sales Growth</span>
                </div>
                <span className="font-semibold">-</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm">Collection Rate</span>
                </div>
                <span className="font-semibold">{collectionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  <span className="text-sm">Low Stock Items</span>
                </div>
                <span className="font-semibold">{((kpis?.alerts?.lowStockMaterials || 0) + (kpis?.alerts?.lowStockGoods || 0))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

