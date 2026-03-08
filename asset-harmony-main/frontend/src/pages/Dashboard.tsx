import SalesDashboard from "@/pages/SalesDashboard";
import AuditorDashboard from "@/pages/AuditorDashboard";
import { Package, Monitor, CheckCircle2, AlertTriangle, Clock, MapPin, TrendingUp, Activity } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import SectionCard from "@/components/SectionCard";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { CATEGORIES } from "@/data/assets";
import { Badge } from "@/components/ui/badge";
import { useAssets, useAuditLogs } from "@/hooks/useAssets";
import { useAuth } from "@/contexts/AuthContext";
import { sampleAssets } from "@/data/assets";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const CHART_COLORS = [
  "hsl(215, 72%, 44%)",
  "hsl(174, 52%, 40%)",
  "hsl(36, 92%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(160, 60%, 36%)",
  "hsl(280, 52%, 48%)",
  "hsl(200, 70%, 50%)",
];

const STATUS_COLORS = ["hsl(160, 60%, 36%)", "hsl(36, 92%, 50%)", "hsl(0, 72%, 51%)"];

const Dashboard = () => {
  const { data: assets } = useAssets();
  const { data: logs } = useAuditLogs();
  const { profile, role } = useAuth();

  if (role === "sales") return <SalesDashboard />;
  if (role === "auditor") return <AuditorDashboard />;

  const displayAssets = assets && assets.length > 0 ? assets : sampleAssets.map(a => ({
    ...a, asset_id: a.assetId, serial_number: a.serialNumber, purchase_date: a.purchaseDate,
    audit_status: a.auditStatus, last_audit_date: a.lastAuditDate, last_audited_by: null,
    created_at: "", updated_at: "",
  }));

  const total = displayAssets.length;
  const verified = displayAssets.filter(a => a.audit_status === "Verified").length;
  const pending = displayAssets.filter(a => a.audit_status === "Pending").length;
  const discrepancies = displayAssets.filter(a => a.audit_status === "Discrepancy").length;
  const auditRate = total > 0 ? Math.round((verified / total) * 100) : 0;

  const byCategory = CATEGORIES.map(cat => ({
    name: cat.length > 12 ? cat.slice(0, 12) + "..." : cat,
    count: displayAssets.filter(a => a.category === cat).length,
  })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

  const byCondition = ["New", "Good", "Fair", "Poor", "Decommissioned"].map(c => ({
    name: c,
    value: displayAssets.filter(a => a.condition === c).length,
  })).filter(c => c.value > 0);

  const byStatus = [
    { name: "Verified", value: verified },
    { name: "Pending", value: pending },
    { name: "Discrepancy", value: discrepancies },
  ].filter(s => s.value > 0);

  const recentAssets = [...displayAssets].sort((a, b) => (b.purchase_date || "").localeCompare(a.purchase_date || "")).slice(0, 5);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-card px-3 py-2 shadow-elevated text-xs">
        <p className="font-semibold">{label || payload[0].name}</p>
        <p className="text-muted-foreground">{payload[0].value} assets</p>
      </div>
    );
  };

  return (
    <PageShell
      title={`Welcome back, ${profile?.full_name || "User"}`}
      subtitle="Operations overview and asset health"
    >
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Assets" value={total} icon={Package} color="primary" trend="Across all locations" />
        <MetricCard label="Verified" value={verified} icon={CheckCircle2} color="success" trend={`${auditRate}% audit completion`} trendDirection="up" />
        <MetricCard label="Pending Audit" value={pending} icon={Clock} color="warning" trend="Awaiting verification" />
        <MetricCard label="Discrepancies" value={discrepancies} icon={AlertTriangle} color="destructive" trend="Requires attention" trendDirection={discrepancies > 0 ? "down" : "neutral"} />
      </div>

      {/* Audit Progress */}
      <SectionCard title="Audit Progress" icon={TrendingUp}>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out"
              style={{ width: `${auditRate}%` }}
            />
          </div>
          <span className="text-lg font-extrabold text-primary tabular-nums">{auditRate}%</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> {verified} verified</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> {pending} pending</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> {discrepancies} flagged</span>
        </div>
      </SectionCard>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Assets by Category">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byCategory} layout="vertical" margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(216, 12%, 88%)" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "hsl(215, 12%, 48%)" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 12%, 48%)" }} width={75} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="hsl(215, 72%, 44%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Condition Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byCondition} cx="50%" cy="50%" innerRadius={45} outerRadius={78} dataKey="value" paddingAngle={2} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {byCondition.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Audit Status">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={78} dataKey="value" paddingAngle={2} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                {byStatus.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Recent Assets & Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Recently Added" icon={Monitor} className="lg:col-span-2">
          <div className="space-y-1">
            {recentAssets.map((asset, i) => (
              <div
                key={asset.id || i}
                className="flex items-center justify-between rounded-lg border px-3 py-2.5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8 shrink-0">
                    <Monitor className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{asset.name}</p>
                    <p className="text-mono text-muted-foreground">{asset.asset_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <Badge variant={asset.audit_status === "Verified" ? "default" : asset.audit_status === "Pending" ? "secondary" : "destructive"} className="text-[10px]">
                    {asset.audit_status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground hidden sm:flex items-center gap-0.5 font-medium">
                    <MapPin className="h-2.5 w-2.5" /> {asset.building}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-4">
          {logs && logs.length > 0 && (
            <SectionCard title="Recent Activity" icon={Activity} iconColor="text-secondary">
              <div className="space-y-2.5">
                {logs.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="text-xs border-l-2 border-secondary/30 pl-3 py-1">
                    <p className="font-semibold">{log.new_status}</p>
                    <p className="text-muted-foreground">{(log.profiles as any)?.full_name || "Unknown"} · {new Date(log.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          <SectionCard title="Quick Stats">
            <div className="space-y-3">
              {[
                { label: "Buildings", value: new Set(displayAssets.map(a => a.building)).size },
                { label: "Departments", value: new Set(displayAssets.map(a => a.department)).size },
                { label: "Vendors", value: new Set(displayAssets.map(a => a.vendor)).size },
                { label: "Categories", value: new Set(displayAssets.map(a => a.category)).size },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">{s.label}</span>
                  <span className="font-bold tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </PageShell>
  );
};

export default Dashboard;