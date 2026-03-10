import { useSales, useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import MetricCard from "@/components/MetricCard";
import SectionCard from "@/components/SectionCard";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Trophy, TrendingUp, DollarSign, Crown, Medal, Award, Receipt } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
      <p className="font-semibold">{label}</p>
      <p className="text-primary font-bold">{Number(payload[0].value).toLocaleString()}</p>
    </div>
  );
};

const SalesDashboard = () => {
  const { data: sales } = useSales();
  const { data: products } = useProducts();
  const { user, profile } = useAuth();

  const bySeller: Record<string, { revenue: number; count: number; name: string }> = {};
  sales?.forEach((s: any) => {
    const id = s.sold_by;
    if (!bySeller[id]) bySeller[id] = { revenue: 0, count: 0, name: SALES_PEOPLE[id] || id };
    bySeller[id].revenue += Number(s.total_price);
    bySeller[id].count += 1;
  });

  const leaderboard = Object.entries(bySeller)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  const myStats = user ? bySeller[user.id] : null;
  const myRank = user ? leaderboard.findIndex(l => l.id === user.id) + 1 : 0;
  const totalRevenue = leaderboard.reduce((sum, l) => sum + l.revenue, 0);
  const totalSalesCount = leaderboard.reduce((sum, l) => sum + l.count, 0);

  const chartData = leaderboard.map(l => ({
    name: l.name.split(" ")[0],
    revenue: l.revenue,
  }));

  const mySales = sales?.filter((s: any) => s.sold_by === user?.id).slice(0, 8) || [];

  return (
    <PageShell
      icon={ShoppingCart}
      title="Sales Dashboard"
      subtitle={`Welcome back, ${profile?.full_name || "Sales Rep"}`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="My Revenue" value={(myStats?.revenue || 0).toLocaleString()} icon={DollarSign} color="primary" trend={`${myStats?.count || 0} transactions`} />
        <MetricCard label="My Rank" value={myRank > 0 ? `#${myRank}` : "—"} icon={Trophy} color={myRank === 1 ? "success" : myRank <= 3 ? "warning" : "secondary"} trend={`of ${leaderboard.length} reps`} />
        <MetricCard label="Team Revenue" value={totalRevenue.toLocaleString()} icon={TrendingUp} color="secondary" trend={`${totalSalesCount} total sales`} />
        <MetricCard label="Products Available" value={products?.filter(p => p.quantity > 0).length || 0} icon={ShoppingCart} color="success" trend={`${products?.filter(p => p.quantity <= p.reorder_point).length || 0} low stock`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Leaderboard */}
        <SectionCard title="Sales Leaderboard" icon={Trophy}>
          {leaderboard.length === 0 ? (
            <EmptyState title="No sales recorded yet" description="Start selling to climb the board" />
          ) : (
            <div className="space-y-1.5">
              {leaderboard.map((seller, i) => {
                const RankIcon = RANK_ICONS[i] || Medal;
                const isMe = seller.id === user?.id;
                return (
                  <div
                    key={seller.id}
                    className={`flex items-center justify-between rounded-lg border px-3.5 py-3 transition-colors ${isMe ? "bg-primary/5 border-primary/15" : "hover:bg-muted/30"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${i === 0 ? "bg-warning/15" : "bg-muted"}`}>
                        {i < 3 ? (
                          <RankIcon className={`h-4 w-4 ${RANK_COLORS[i]}`} />
                        ) : (
                          <span className="text-[10px] font-bold text-muted-foreground">#{i + 1}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold flex items-center gap-1.5">
                          {seller.name}
                          {isMe && <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-bold">You</Badge>}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">{seller.count} sales</p>
                      </div>
                    </div>
                    <p className="text-sm font-extrabold text-primary tabular-nums">{seller.revenue.toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Chart */}
        <SectionCard title="Revenue by Rep">
          {chartData.length === 0 ? (
            <EmptyState title="No data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(216, 12%, 88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 12%, 48%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 12%, 48%)" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="hsl(215, 72%, 44%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {/* My Recent Sales */}
      <SectionCard title="My Recent Sales" icon={Receipt} noPadding>
        {mySales.length === 0 ? (
          <EmptyState icon={Receipt} title="No sales yet" description="Start selling to see your history" />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right pr-5">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mySales.map((s: any) => (
                  <TableRow key={s.id} className="hover:bg-muted/30">
                    <TableCell className="pl-5 text-sm font-medium">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-semibold">{s.products?.name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{s.customer_name || "Walk-in"}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{s.quantity}</TableCell>
                    <TableCell className="text-right pr-5 font-extrabold text-primary tabular-nums">{Number(s.total_price).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
};

export default SalesDashboard;