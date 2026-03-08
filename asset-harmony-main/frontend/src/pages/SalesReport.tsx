import { useSales, useLowStockProducts, useCreateReorderRequest, useReorderRequests } from "@/hooks/useProducts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, AlertTriangle, TrendingUp, Package, Send, Crown, Medal, Award } from "lucide-react";
import PageShell from "@/components/PageShell";
import SectionCard from "@/components/SectionCard";
import EmptyState from "@/components/EmptyState";
import MetricCard from "@/components/MetricCard";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(215, 72%, 44%)", "hsl(174, 52%, 40%)", "hsl(36, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(280, 52%, 48%)"];

const SALES_PEOPLE: Record<string, string> = {
  "d0000000-0000-0000-0000-000000000001": "Priya (Sales)",
  "d0000000-0000-0000-0000-000000000002": "Ravi (Sales)",
  "a0000000-0000-0000-0000-000000000001": "Dev Admin",
  "b0000000-0000-0000-0000-000000000001": "Hrithik (Manager)",
};

const RANK_ICONS = [Crown, Medal, Award];
const RANK_COLORS = ["text-warning", "text-muted-foreground", "text-warning"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-elevated text-xs">
      <p className="font-semibold">{label || payload[0].name}</p>
      <p className="text-primary font-bold">{Number(payload[0].value).toLocaleString()}</p>
    </div>
  );
};

const SalesReport = () => {
  const { data: sales } = useSales();
  const { data: lowStock } = useLowStockProducts();
  const { data: reorderRequests } = useReorderRequests();
  const createReorder = useCreateReorderRequest();
  const { toast } = useToast();

  const totalRevenue = sales?.reduce((sum: number, s: any) => sum + Number(s.total_price), 0) || 0;
  const totalSales = sales?.length || 0;
  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  const bySeller: Record<string, { revenue: number; count: number; name: string }> = {};
  sales?.forEach((s: any) => {
    const id = s.sold_by;
    if (!bySeller[id]) bySeller[id] = { revenue: 0, count: 0, name: SALES_PEOPLE[id] || id };
    bySeller[id].revenue += Number(s.total_price);
    bySeller[id].count += 1;
  });
  const topSellers = Object.entries(bySeller)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  const byCategory: Record<string, number> = {};
  sales?.forEach((s: any) => {
    const cat = s.products?.category || "Unknown";
    byCategory[cat] = (byCategory[cat] || 0) + Number(s.total_price);
  });
  const categoryData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

  const dailySales: Record<string, number> = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    dailySales[d.toLocaleDateString("en-US", { weekday: "short" })] = 0;
  }
  sales?.forEach((s: any) => {
    const d = new Date(s.created_at).toLocaleDateString("en-US", { weekday: "short" });
    if (d in dailySales) dailySales[d] += Number(s.total_price);
  });
  const dailyData = Object.entries(dailySales).map(([day, revenue]) => ({ day, revenue }));

  const handleReorder = async (productId: string, name: string) => {
    try {
      await createReorder.mutateAsync({ productId, quantity: 50, notes: `Auto-reorder for ${name}` });
      toast({ title: "Reorder request sent", description: `Request for ${name} created` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <PageShell icon={BarChart3} title="Sales Report" subtitle="Revenue analytics and restock management">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Total Revenue" value={totalRevenue.toLocaleString()} icon={TrendingUp} color="primary" trendDirection="up" trend="All time" />
        <MetricCard label="Total Sales" value={totalSales} icon={BarChart3} color="secondary" trend={`${topSellers.length} sales people`} />
        <MetricCard label="Avg Order Value" value={avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} icon={Package} color="success" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Daily Revenue (7 days)" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(216, 12%, 88%)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215, 12%, 48%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 12%, 48%)" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="hsl(215, 72%, 44%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title="Revenue by Category">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={78} dataKey="value" paddingAngle={2} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Top Sellers */}
      <SectionCard title="Top Sales People" icon={Crown} iconColor="text-warning">
        {topSellers.length === 0 ? (
          <EmptyState title="No sales data yet" />
        ) : (
          <div className="space-y-1.5">
            {topSellers.map((seller, i) => {
              const RankIcon = RANK_ICONS[i] || Medal;
              const share = totalRevenue > 0 ? ((seller.revenue / totalRevenue) * 100).toFixed(1) : "0";
              return (
                <div
                  key={seller.id}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${i === 0 ? "bg-warning/5 border-warning/15" : "hover:bg-muted/30"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${i === 0 ? "bg-warning/15" : "bg-muted"}`}>
                      {i < 3 ? <RankIcon className={`h-4 w-4 ${RANK_COLORS[i]}`} /> : <span className="text-[10px] font-bold text-muted-foreground">#{i + 1}</span>}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{seller.name}</p>
                      <p className="text-xs text-muted-foreground font-medium">{seller.count} sales · {share}% share</p>
                    </div>
                  </div>
                  <p className="text-sm font-extrabold text-primary tabular-nums">{seller.revenue.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Low Stock */}
      <SectionCard title="Low Stock Alert" icon={AlertTriangle} iconColor="text-destructive" noPadding>
        {!lowStock?.length ? (
          <EmptyState icon={Package} title="All products are well-stocked" />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Reorder Pt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStock.map(p => (
                  <TableRow key={p.id} className="hover:bg-muted/30">
                    <TableCell className="pl-5 font-semibold">{p.name}</TableCell>
                    <TableCell className="text-mono text-muted-foreground">{p.sku}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold">{p.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{p.reorder_point}</TableCell>
                    <TableCell>
                      <Badge variant={p.quantity === 0 ? "destructive" : "secondary"} className="text-[10px] font-semibold">
                        {p.quantity === 0 ? "Out of Stock" : "Low Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-5">
                      <Button size="sm" variant="outline" className="gap-1 h-7 text-xs font-semibold" onClick={() => handleReorder(p.id, p.name)} disabled={createReorder.isPending}>
                        <Send className="h-3 w-3" /> Reorder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      {/* Reorder Requests */}
      {reorderRequests && reorderRequests.length > 0 && (
        <SectionCard title="Recent Reorder Requests" icon={Package} iconColor="text-secondary" noPadding>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reorderRequests.map((r: any) => (
                  <TableRow key={r.id} className="hover:bg-muted/30">
                    <TableCell className="pl-5 text-sm whitespace-nowrap font-medium">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-semibold">{r.products?.name}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold">{r.requested_quantity}</TableCell>
                    <TableCell><Badge variant={r.status === "pending" ? "secondary" : "default"} className="text-[10px] font-semibold capitalize">{r.status}</Badge></TableCell>
                    <TableCell className="pr-5 text-muted-foreground text-sm max-w-xs truncate">{r.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}
    </PageShell>
  );
};

export default SalesReport;