import { sampleAssets, CATEGORIES } from "@/data/assets";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAssets } from "@/hooks/useAssets";

const COLORS = ["hsl(210,60%,28%)", "hsl(174,55%,42%)", "hsl(38,92%,50%)", "hsl(0,72%,51%)", "hsl(142,60%,40%)", "hsl(270,50%,50%)", "hsl(200,70%,50%)", "hsl(330,60%,50%)"];

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

const Reports = () => {
  const { data: dbAssets } = useAssets();

  // Use DB assets, fallback to sample data
  const assets = dbAssets && dbAssets.length > 0
    ? dbAssets.map(a => ({
        id: a.id,
        assetId: a.asset_id,
        name: a.name,
        category: a.category,
        location: a.location,
        building: a.building,
        condition: a.condition,
        auditStatus: a.audit_status,
        lastAuditDate: a.last_audit_date || "",
      }))
    : sampleAssets;

  const exportReport = (type: string) => {
    const headers = ["Asset ID", "Name", "Category", "Location", "Condition", "Audit Status", "Last Audit Date"];
    const rows = assets.map(a => [a.assetId, a.name, a.category, a.location, a.condition, a.auditStatus, a.lastAuditDate]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${type} report exported!`);
  };

  const byCategory = CATEGORIES.map(cat => ({
    name: cat.replace("Equipment", "Eq.").replace("Decorations", "Decor.").replace("Entertainment", "Ent."),
    count: assets.filter(a => a.category === cat).length,
  })).filter(c => c.count > 0);

  const byCondition = ["New", "Good", "Fair", "Poor"].map(c => ({
    name: c,
    value: assets.filter(a => a.condition === c).length,
  })).filter(c => c.value > 0);

  const byStatus = [
    { name: "Verified", value: assets.filter(a => a.auditStatus === "Verified").length },
    { name: "Pending", value: assets.filter(a => a.auditStatus === "Pending").length },
    { name: "Discrepancy", value: assets.filter(a => a.auditStatus === "Discrepancy").length },
  ];

  const byBuilding = [...new Set(assets.map(a => a.building))].map(b => ({
    name: b.replace(" Building", ""),
    assets: assets.filter(a => a.building === b).length,
    verified: assets.filter(a => a.building === b && a.auditStatus === "Verified").length,
    pending: assets.filter(a => a.building === b && a.auditStatus === "Pending").length,
  }));

  const totalAssets = assets.length;
  const verifiedCount = assets.filter(a => a.auditStatus === "Verified").length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Asset inventory insights and variance reporting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => exportReport("full-inventory")}>
            <Download className="h-4 w-4" /> Export All
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <motion.div variants={item} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-3xl font-bold text-primary">{totalAssets}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Assets</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{verifiedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Verified</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-3xl font-bold text-amber-500">{byStatus[1].value}</p>
          <p className="text-xs text-muted-foreground mt-1">Pending</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-3xl font-bold">{totalAssets > 0 ? Math.round((verifiedCount / totalAssets) * 100) : 0}%</p>
          <p className="text-xs text-muted-foreground mt-1">Reconciliation Rate</p>
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="location">By Location</TabsTrigger>
          <TabsTrigger value="variance">Variance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Assets by Category</h3>
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => exportReport("category")}>
                  <Download className="h-3 w-3" /> CSV
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(210,60%,28%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="font-semibold mb-4">Condition Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={byCondition} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {byCondition.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="location" className="space-y-6">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="font-semibold mb-4">Assets by Building</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byBuilding}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="verified" fill="hsl(142,60%,40%)" name="Verified" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="hsl(38,92%,50%)" name="Pending" radius={[4, 4, 0, 0]} />
                <Bar dataKey="assets" fill="hsl(210,60%,28%)" name="Total" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="variance" className="space-y-6">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="font-semibold mb-4">Audit Status Summary</h3>
            <div className="flex gap-8 items-center justify-center py-4">
              {byStatus.map((s, i) => (
                <div key={s.name} className="text-center">
                  <div className="text-3xl font-bold" style={{ color: COLORS[i] }}>{s.value}</div>
                  <p className="text-sm text-muted-foreground mt-1">{s.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Discrepancy Details</h3>
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => exportReport("discrepancy")}>
                <Download className="h-3 w-3" /> Export
              </Button>
            </div>
            <div className="rounded-lg border overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Asset ID</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Location</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.filter(a => a.auditStatus === "Discrepancy").map(a => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="px-4 py-2 font-mono text-xs">{a.assetId}</td>
                      <td className="px-4 py-2">{a.name}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{a.location}</td>
                      <td className="px-4 py-2 text-xs">{a.condition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded bg-muted p-4">
              <h4 className="text-sm font-semibold mb-2">Variance Report Notes</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• {assets.filter(a => a.auditStatus === "Discrepancy").length} assets flagged with discrepancies</li>
                <li>• {assets.filter(a => a.auditStatus === "Pending").length} assets pending re-verification</li>
                <li>• Overall reconciliation rate: {totalAssets > 0 ? Math.round(verifiedCount / totalAssets * 100) : 0}%</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Reports;
