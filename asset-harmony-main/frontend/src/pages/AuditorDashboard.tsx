import { useAssets, useAuditLogs } from "@/hooks/useAssets";
import { useAuth } from "@/contexts/AuthContext";
import StatCard from "@/components/StatCard";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Clock, AlertTriangle, CheckCircle2, ScanLine, MapPin, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { sampleAssets } from "@/data/assets";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS: Record<string, string> = {
  Verified: "hsl(152, 52%, 38%)",
  Pending: "hsl(38, 88%, 48%)",
  Discrepancy: "hsl(0, 68%, 48%)",
};

const AuditorDashboard = () => {
  const { data: assets } = useAssets();
  const { data: logs } = useAuditLogs();
  const { profile, user } = useAuth();
  const navigate = useNavigate();

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

  const myLogs = logs?.filter((l: any) => l.auditor_id === user?.id) || [];
  const myVerified = myLogs.filter((l: any) => l.new_status === "Verified").length;
  const myDiscrepancies = myLogs.filter((l: any) => l.new_status === "Discrepancy").length;

  const pendingAssets = displayAssets
    .filter(a => a.audit_status === "Pending" || a.audit_status === "Discrepancy")
    .slice(0, 8);

  const statusData = [
    { name: "Verified", value: verified },
    { name: "Pending", value: pending },
    { name: "Discrepancy", value: discrepancies },
  ].filter(s => s.value > 0);

  const recentLogs = logs?.slice(0, 6) || [];

  return (
    <PageShell
      icon={ClipboardCheck}
      title="Auditor Dashboard"
      subtitle={`Welcome, ${profile?.full_name || "Auditor"} — ${pending} assets awaiting verification`}
      actions={
        <Button size="sm" onClick={() => navigate("/audit-scan")} className="gap-1.5">
          <ScanLine className="h-4 w-4" /> Start Scanning
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending Audits" value={pending} icon={Clock} color="warning" trend={`${discrepancies} discrepancies`} />
        <StatCard label="Verified by Me" value={myVerified} icon={CheckCircle2} color="success" trend={`${myLogs.length} total scans`} />
        <StatCard label="Discrepancies Found" value={myDiscrepancies} icon={AlertTriangle} color="destructive" trend="Flagged for review" />
        <StatCard label="Audit Progress" value={`${auditRate}%`} icon={ClipboardCheck} color="primary" trend={`${verified} of ${total} verified`} />
      </div>

      {/* Progress Bar */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Overall Audit Progress</h2>
          <span className="text-lg font-bold text-primary">{auditRate}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${auditRate}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-success" /> {verified} verified</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-warning" /> {pending} pending</span>
          <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-destructive" /> {discrepancies} discrepancies</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Pending Queue */}
        <div className="lg:col-span-2 section-card">
          <h2 className="section-title mb-4 flex items-center gap-1.5">
            <ScanLine className="h-3.5 w-3.5 text-primary" /> Assets to Audit
          </h2>
          {pendingAssets.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="All assets have been audited!" />
          ) : (
            <div className="space-y-1.5">
              {pendingAssets.map((asset, i) => (
                <div
                  key={asset.id || i}
                  className="flex items-center justify-between rounded-md border px-3 py-2.5 hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => navigate("/audit-scan")}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-md shrink-0 ${
                      asset.audit_status === "Discrepancy" ? "bg-destructive/10" : "bg-warning/10"
                    }`}>
                      {asset.audit_status === "Discrepancy" ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-warning" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{asset.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{asset.asset_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={asset.audit_status === "Discrepancy" ? "destructive" : "secondary"} className="text-[10px]">
                      {asset.audit_status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground hidden sm:flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5" /> {asset.building || asset.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="section-card">
            <h2 className="section-title mb-4">Audit Status</h2>
            {statusData.length === 0 ? (
              <EmptyState title="No data" />
            ) : (
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                    {statusData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="section-card">
            <h2 className="section-title mb-3 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-secondary" /> Recent Activity
            </h2>
            {recentLogs.length === 0 ? (
              <EmptyState title="No audit activity yet" />
            ) : (
              <div className="space-y-2">
                {recentLogs.map((log: any) => (
                  <div key={log.id} className="text-xs border-l-2 border-secondary/30 pl-2.5 py-0.5">
                    <p className="font-medium flex items-center gap-1">
                      {log.new_status === "Verified" && <CheckCircle2 className="h-3 w-3 text-success" />}
                      {log.new_status === "Discrepancy" && <AlertTriangle className="h-3 w-3 text-destructive" />}
                      {log.new_status}
                    </p>
                    <p className="text-muted-foreground">
                      {(log.profiles as any)?.full_name || "Unknown"} &middot; {new Date(log.created_at).toLocaleDateString()}
                    </p>
                    {log.notes && <p className="text-muted-foreground italic mt-0.5">"{log.notes}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default AuditorDashboard;
