import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, Clock, AlertTriangle, ClipboardCheck, ScanSearch, BarChart3, FileCheck, Pencil, Search, X } from "lucide-react";
import { useAssets, useUpdateAuditStatus, type DbAsset } from "@/hooks/useAssets";
import { useAuth } from "@/contexts/AuthContext";
import { sampleAssets, CATEGORIES } from "@/data/assets";
import { motion } from "framer-motion";
import { toast } from "sonner";

const steps = [
  { icon: ScanSearch, title: "1. Physical Scan", desc: "Walk through each location and scan/count every asset using QR codes or manual count." },
  { icon: ClipboardCheck, title: "2. Register Match", desc: "Compare scanned data against the master register to identify matches, missing, and unregistered items." },
  { icon: BarChart3, title: "3. Variance Report", desc: "Generate a variance report listing discrepancies: missing assets, location mismatches, condition changes." },
  { icon: FileCheck, title: "4. Reconciliation", desc: "Investigate and resolve each discrepancy. Update the register with corrections. Mark assets as verified." },
];

const BUILDINGS = [...new Set(sampleAssets.map(a => a.building))];

const AuditWorkflow = () => {
  const { data: dbAssets, isLoading } = useAssets();
  const updateAudit = useUpdateAuditStatus();
  const { role } = useAuth();
  const [editAsset, setEditAsset] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("Verified");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");

  const assets = dbAssets && dbAssets.length > 0
    ? dbAssets
    : sampleAssets.map(a => ({
        id: a.id, asset_id: a.assetId, name: a.name, category: a.category,
        location: a.location, building: a.building, floor: a.floor, room: a.room,
        department: a.department, vendor: a.vendor, model: a.model,
        serial_number: a.serialNumber, purchase_date: a.purchaseDate,
        condition: a.condition, audit_status: a.auditStatus,
        last_audit_date: a.lastAuditDate, last_audited_by: null,
        created_at: "", updated_at: "",
      }));

  const hasFilters = search !== "" || catFilter !== "all" || buildingFilter !== "all";

  const filteredAssets = useMemo(() => assets.filter(a => {
    const s = search.toLowerCase();
    const matchSearch = !search || a.name.toLowerCase().includes(s) || a.asset_id.toLowerCase().includes(s);
    const matchCat = catFilter === "all" || a.category === catFilter;
    const matchBuilding = buildingFilter === "all" || a.building === buildingFilter;
    return matchSearch && matchCat && matchBuilding;
  }), [assets, search, catFilter, buildingFilter]);

  const verified = filteredAssets.filter(a => a.audit_status === "Verified");
  const pending = filteredAssets.filter(a => a.audit_status === "Pending");
  const discrepancy = filteredAssets.filter(a => a.audit_status === "Discrepancy");

  const canEdit = role === "auditor" || role === "manager";

  const handleUpdate = async () => {
    if (!editAsset) return;
    try {
      await updateAudit.mutateAsync({ assetId: editAsset.id, newStatus, notes });
      toast.success("Audit status updated!", { description: `${editAsset.name} marked as ${newStatus}` });
      setEditAsset(null);
      setNotes("");
    } catch (err: any) {
      toast.error("Failed to update", { description: err.message });
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Audit Workflow</h1>
        <p className="text-sm text-muted-foreground">
          {role === "auditor" ? "Update asset verification status" : "Baseline reconciliation and verification process"}
        </p>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <motion.div
            key={step.title}
            variants={item}
            whileHover={{ y: -4, boxShadow: "0 8px 25px -5px rgba(0,0,0,0.1)" }}
            className="rounded-xl border bg-card p-5 transition-shadow"
          >
            <step.icon className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={item} className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search assets..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
          <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="Building" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buildings</SelectItem>
            {BUILDINGS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-9 gap-1 text-xs" onClick={() => { setSearch(""); setCatFilter("all"); setBuildingFilter("all"); }}>
            <X className="h-3 w-3" /> Clear
          </Button>
        )}
      </motion.div>

      <motion.div variants={item} className="grid gap-6 lg:grid-cols-3">
        {[
          { title: "Verified", icon: CheckCircle2, items: verified, color: "text-emerald-600", badge: "default" as const },
          { title: "Pending Verification", icon: Clock, items: pending, color: "text-amber-500", badge: "secondary" as const },
          { title: "Discrepancies", icon: AlertTriangle, items: discrepancy, color: "text-destructive", badge: "destructive" as const },
        ].map(group => (
          <motion.div key={group.title} variants={item} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <group.icon className={`h-5 w-5 ${group.color}`} />
              <h3 className="font-semibold text-sm">{group.title}</h3>
              <Badge variant={group.badge} className="ml-auto text-xs">{group.items.length}</Badge>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {group.items.map(a => (
                <motion.div
                  key={a.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between border rounded-lg px-3 py-2 hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.location}</p>
                    {(a as any).auditor_profile?.full_name || a.last_audit_date ? (
                      <p className="text-xs text-muted-foreground mt-1 leading-tight">
                        Scanned by:{" "}
                        <span className="font-medium text-foreground">
                          {(a as any).auditor_profile?.full_name || "Unknown"}
                        </span>
                        {a.last_audit_date ? <span> · {a.last_audit_date}</span> : null}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs font-mono text-muted-foreground">{a.asset_id}</span>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditAsset(a);
                          setNewStatus("Verified");
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
              {group.items.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No items</p>}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <Dialog open={!!editAsset} onOpenChange={() => setEditAsset(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Audit Status</DialogTitle>
          </DialogHeader>
          {editAsset && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-3">
                <p className="font-medium text-sm">{editAsset.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{editAsset.asset_id}</p>
                <p className="text-xs text-muted-foreground mt-1">{editAsset.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium">New Status</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {["Verified", "Pending", "Discrepancy"].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewStatus(s)}
                      className={`rounded-lg border-2 p-2 text-xs font-medium transition-all ${
                        newStatus === s ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Audit observations..." rows={3} className="mt-1.5" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAsset(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateAudit.isPending}>
              {updateAudit.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AuditWorkflow;