import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch stats: ${res.status} ${res.statusText}`);
      }
      return await res.json();
    },
  });

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex justify-center items-center py-20">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <div className="text-destructive font-semibold">Error loading dashboard data</div>
          <div className="text-muted-foreground text-sm">{error instanceof Error ? error.message : "Please try again."}</div>
          <div className="text-xs text-muted-foreground">Make sure you are logged in as an admin user.</div>
        </div>
      </AdminLayout>
    );
  }

  const stats = data?.stats || {
    totalUsers: 0,
    totalGardeners: 0,
    totalOrders: 0,
    totalBookings: 0,
    totalSales: 0,
  };

  const userGrowth = data?.userGrowth || [];
  const salesPerformance = data?.salesPerformance || [];

  // Fix: Handle empty arrays to prevent Math.max error
  const maxSales = salesPerformance.length > 0 ? Math.max(...salesPerformance, 1) : 1;
  const salesHeights = salesPerformance.length > 0 
    ? salesPerformance.map((sales: number) => Math.round((sales / maxSales) * 100))
    : [];

  const maxUsers = userGrowth.length > 0 ? Math.max(...userGrowth, 1) : 1;
  const userHeights = userGrowth.length > 0
    ? userGrowth.map((users: number) => Math.round((users / maxUsers) * 100))
    : [];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-10">
        <div className="grid md:grid-cols-5 gap-4">
          <Card className="border border-border/60 bg-secondary/20">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Users</div>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="border border-border/60 bg-secondary/20">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Gardeners</div>
              <div className="text-2xl font-bold">{stats.totalGardeners.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="border border-border/60 bg-secondary/20">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Orders</div>
              <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="border border-border/60 bg-secondary/20">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Bookings</div>
              <div className="text-2xl font-bold">{stats.totalBookings.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="border border-border/60 bg-secondary/20">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Sales</div>
              <div className="text-2xl font-bold">Rs {(stats.totalSales / 100).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Overview</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border border-border/60 bg-white">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="text-sm text-muted-foreground">User Growth</div>
                  <div className="text-3xl font-bold">
                    {userGrowth.length > 0 && userGrowth[userGrowth.length - 1] > userGrowth[0]
                      ? `+${Math.round(((userGrowth[userGrowth.length - 1] - userGrowth[0]) / Math.max(userGrowth[0], 1)) * 100)}%`
                      : "0%"}
                  </div>
                  <div className="text-sm text-primary">Last 7 Months</div>
                </div>
                <div className="h-40 grid grid-cols-7 gap-2 items-end">
                  {userHeights.map((height: number, idx: number) => (
                    <div
                      key={idx}
                      className="bg-primary/20 rounded-lg"
                      style={{ height: `${Math.max(height, 5)}px` }}
                      title={`${userGrowth[idx]} users`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border/60 bg-white">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="text-sm text-muted-foreground">Sales Performance</div>
                  <div className="text-3xl font-bold">
                    {salesPerformance.length > 0 && salesPerformance[salesPerformance.length - 1] > salesPerformance[0]
                      ? `+${Math.round(((salesPerformance[salesPerformance.length - 1] - salesPerformance[0]) / Math.max(salesPerformance[0], 1)) * 100)}%`
                      : "0%"}
                  </div>
                  <div className="text-sm text-primary">Last 7 Months</div>
                </div>
                <div className="h-40 grid grid-cols-7 gap-2 items-end">
                  {salesHeights.map((height: number, idx: number) => (
                    <div
                      key={idx}
                      className="bg-primary/20 rounded-lg"
                      style={{ height: `${Math.max(height, 5)}px` }}
                      title={`Rs ${(salesPerformance[idx] / 100).toLocaleString()}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
