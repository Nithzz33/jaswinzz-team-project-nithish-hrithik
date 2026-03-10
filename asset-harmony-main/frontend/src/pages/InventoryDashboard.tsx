import { useProducts, useSales } from "@/hooks/useProducts";
import PageShell from "@/components/PageShell";
import MetricCard from "@/components/MetricCard";
import SectionCard from "@/components/SectionCard";
import EmptyState from "@/components/EmptyState";
import { Package, AlertTriangle, TrendingUp, IndianRupee, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "hsl(215, 72%, 44%)",
  "hsl(174, 52%, 40%)",
  "hsl(36, 92%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(280, 52%, 48%)",
];

const InventoryDashboard = () => {

  const { data: products = [] } = useProducts();
  const { data: sales = [] } = useSales();

  /* -------------------------
      KPI CALCULATIONS
  ------------------------- */

  const totalProducts = products.length;

  const totalStockValue = products.reduce(
    (sum: number, p: any) => sum + p.price * p.quantity,
    0
  );

  const lowStock = products.filter(
    (p: any) => p.quantity <= p.reorder_point
  );

  const outOfStock = products.filter(
    (p: any) => p.quantity === 0
  );

  /* -------------------------
      CATEGORY DISTRIBUTION
  ------------------------- */

  const categoryMap: Record<string, number> = {};

  products.forEach((p: any) => {
    const cat = p.category || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  /* -------------------------
      TOP SELLING PRODUCTS
  ------------------------- */

  const salesMap: Record<string, number> = {};

  sales.forEach((s: any) => {
    const name = s.products?.name || "Unknown";
    salesMap[name] = (salesMap[name] || 0) + s.quantity;
  });

  const topSelling = Object.entries(salesMap)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  /* -------------------------
      DAILY REVENUE
  ------------------------- */

  const revenueMap: Record<string, number> = {};

  sales.forEach((s: any) => {
    const date = new Date(s.created_at).toLocaleDateString();
    revenueMap[date] =
      (revenueMap[date] || 0) + Number(s.total_price);
  });

  const revenueData = Object.entries(revenueMap).map(
    ([date, revenue]) => ({
      date,
      revenue,
    })
  );

  /* -------------------------
      RECENT PRODUCTS
  ------------------------- */

  const recentProducts = [...products]
    .sort((a: any, b: any) =>
      (b.created_at || "").localeCompare(a.created_at || "")
    )
    .slice(0, 5);

  /* -------------------------
      TOOLTIP
  ------------------------- */

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow">
        <p className="font-semibold">{payload[0].name}</p>
        <p>{payload[0].value}</p>
      </div>
    );
  };

  return (
    <PageShell
      title="Inventory Dashboard"
      subtitle="Product inventory overview"
      icon={Package}
    >

      {/* KPI CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <MetricCard
          label="Total Products"
          value={totalProducts}
          icon={Package}
          color="primary"
        />

        <MetricCard
          label="Stock Value"
          value={`₹ ${totalStockValue.toLocaleString()}`}
          icon={IndianRupee}
          color="secondary"
        />

        <MetricCard
          label="Low Stock"
          value={lowStock.length}
          icon={AlertTriangle}
          color="warning"
        />

        <MetricCard
          label="Out of Stock"
          value={outOfStock.length}
          icon={AlertTriangle}
          color="destructive"
        />

      </div>

      {/* CHARTS */}

      <div className="grid gap-4 lg:grid-cols-3">

        {/* CATEGORY PIE */}

        <SectionCard title="Products by Category">

          <ResponsiveContainer width="100%" height={220}>

            <PieChart>

              <Pie
                data={categoryData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={3}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip content={<CustomTooltip />} />

            </PieChart>

          </ResponsiveContainer>

        </SectionCard>

        {/* DAILY REVENUE */}

        <SectionCard title="Daily Revenue" icon={TrendingUp}>

          {revenueData.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No sales yet"
              description="Revenue chart will appear after sales"
            />
          ) : (

            <ResponsiveContainer width="100%" height={220}>

              <BarChart data={revenueData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="revenue"
                  fill="hsl(215,72%,44%)"
                  radius={[4,4,0,0]}
                />

              </BarChart>

            </ResponsiveContainer>

          )}

        </SectionCard>

        {/* TOP SELLING */}

        <SectionCard title="Top Selling Products">

          {topSelling.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No sales recorded"
              description="Top selling products will appear here"
            />
          ) : (

            <Table>

              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">
                    Units Sold
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>

                {topSelling.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell className="text-right">
                      {p.qty}
                    </TableCell>
                  </TableRow>
                ))}

              </TableBody>

            </Table>

          )}

        </SectionCard>

      </div>

      {/* LOW STOCK TABLE */}

      <SectionCard title="Low Stock Alerts" icon={AlertTriangle}>

        {lowStock.length === 0 ? (

          <EmptyState
            icon={AlertTriangle}
            title="Stock levels healthy"
            description="No products need restocking"
          />

        ) : (

          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Reorder</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>

              {lowStock.map((p: any) => (

                <TableRow key={p.id}>

                  <TableCell>{p.name}</TableCell>

                  <TableCell>
                    <Badge variant="secondary">
                      {p.category}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    {p.quantity}
                  </TableCell>

                  <TableCell className="text-right">
                    {p.reorder_point}
                  </TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        )}

      </SectionCard>

      {/* RECENT PRODUCTS */}

      <SectionCard title="Recently Added Products">

        <div className="space-y-2">

          {recentProducts.map((p: any) => (

            <div
              key={p.id}
              className="flex justify-between border rounded-lg px-3 py-2"
            >

              <div>
                <p className="font-semibold text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.category}
                </p>
              </div>

              <Badge>
                {p.quantity} units
              </Badge>

            </div>

          ))}

        </div>

      </SectionCard>

    </PageShell>
  );
};

export default InventoryDashboard;