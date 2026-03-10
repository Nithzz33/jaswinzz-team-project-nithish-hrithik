import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAssets, useDeleteAssets } from "@/hooks/useAssets";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORIES, CONDITIONS } from "@/data/assets";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Download, QrCode, Printer, X, ClipboardList, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { QRCodeSVG } from "qrcode.react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import TableSkeleton from "@/components/TableSkeleton";
import { toast } from "sonner";
import type { DbAsset } from "@/hooks/useAssets";

const statusColor = (s: string) =>
  s === "Verified" ? "default" : s === "Pending" ? "secondary" : "destructive";

const conditionColor = (c: string) => {
  if (c === "New") return "text-success";
  if (c === "Good") return "text-info";
  if (c === "Fair") return "text-warning";
  return "text-destructive";
};

const AUDIT_STATUSES = ["Verified", "Pending", "Discrepancy"];

const exportCSV = (data: DbAsset[]) => {
  const headers = ["Asset ID", "Name", "Category", "Location", "Vendor", "Model", "Serial Number", "Purchase Date", "Condition", "Audit Status", "Last Audit Date"];
  const rows = data.map(a => [a.asset_id, a.name, a.category, a.location, a.vendor, a.model, a.serial_number, a.purchase_date || "", a.condition, a.audit_status, a.last_audit_date || ""]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `asset-register-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("CSV exported successfully!");
};

const AssetRegister = () => {
  const [searchParams] = useSearchParams();
  const { data: assets, isLoading } = useAssets();
  const deleteAssets = useDeleteAssets();
  const { role } = useAuth();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [condFilter, setCondFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [buildingFilter, setBuildingFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [qrAsset, setQrAsset] = useState<DbAsset | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const canDelete = role === "manager" || role === "admin";

  useEffect(() => {
    const cat = searchParams.get("category");
    const q = searchParams.get("search");
    if (cat) setCatFilter(cat);
    if (q) setSearch(q);
  }, [searchParams]);

  const allAssets = assets || [];
  const BUILDINGS = useMemo(() => [...new Set(allAssets.map(a => a.building).filter(Boolean))], [allAssets]);
  const DEPARTMENTS = useMemo(() => [...new Set(allAssets.map(a => a.department).filter(Boolean))], [allAssets]);

  const hasActiveFilters = catFilter !== "all" || condFilter !== "all" || statusFilter !== "all" || buildingFilter !== "all" || deptFilter !== "all" || search !== "";

  const clearFilters = () => {
    setSearch(""); setCatFilter("all"); setCondFilter("all"); setStatusFilter("all"); setBuildingFilter("all"); setDeptFilter("all");
  };

  const filtered = useMemo(() => allAssets.filter(a => {
    const s = search.toLowerCase();
    const matchSearch = !search || a.name.toLowerCase().includes(s) || a.asset_id.toLowerCase().includes(s) || a.serial_number.toLowerCase().includes(s) || a.vendor.toLowerCase().includes(s);
    const matchCat = catFilter === "all" || a.category === catFilter;
    const matchCond = condFilter === "all" || a.condition === condFilter;
    const matchStatus = statusFilter === "all" || a.audit_status === statusFilter;
    const matchBuilding = buildingFilter === "all" || a.building === buildingFilter;
    const matchDept = deptFilter === "all" || a.department === deptFilter;
    return matchSearch && matchCat && matchCond && matchStatus && matchBuilding && matchDept;
  }), [allAssets, search, catFilter, condFilter, statusFilter, buildingFilter, deptFilter]);

  const allSelected = filtered.length > 0 && filtered.every(a => selected.has(a.id));
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(a => a.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const handleDelete = async (ids: string[]) => {
    try {
      await deleteAssets.mutateAsync(ids);
      toast.success(`${ids.length} asset(s) deleted`);
      setSelected(new Set());
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    }
  };

  return (
    <PageShell
      icon={ClipboardList}
      title="Asset Register"
      subtitle={`Master inventory — ${filtered.length} of ${allAssets.length} assets`}
      actions={
        <div className="flex items-center gap-2">
          {canDelete && someSelected && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" /> Delete ({selected.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selected.size} asset(s)?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone. Audit logs referencing these assets will remain.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(Array.from(selected))} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {deleteAssets.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportCSV(filtered)}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      }
      filters={
        <>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, ID, serial, or vendor..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={condFilter} onValueChange={setCondFilter}>
            <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="Condition" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              {CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {AUDIT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={buildingFilter} onValueChange={setBuildingFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="Building" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buildings</SelectItem>
              {BUILDINGS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Depts</SelectItem>
              {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-9 gap-1 text-xs text-muted-foreground" onClick={clearFilters}>
              <X className="h-3 w-3" /> Clear
            </Button>
          )}
        </>
      }
    >
      <div className="data-table-wrapper overflow-auto">
        {isLoading ? (
          <TableSkeleton rows={8} columns={10} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No assets found" description="Try adjusting your filters" />
        ) : (
          <table className="w-full text-sm table-sticky-header table-zebra">
            <thead>
              <tr className="border-b bg-muted/50">
                {canDelete && (
                  <th className="px-3 py-2.5 w-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                  </th>
                )}
                {["Asset ID", "Name", "Category", "Location", "Vendor", "Model / Serial", "Purchased", "Condition", "Status", "QR"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
                {canDelete && <th className="px-3 py-2.5 w-10"></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className={`border-b last:border-0 hover:bg-muted/40 transition-colors ${selected.has(a.id) ? "bg-primary/5" : ""}`}>
                  {canDelete && (
                    <td className="px-3 py-2.5">
                      <Checkbox checked={selected.has(a.id)} onCheckedChange={() => toggleOne(a.id)} aria-label={`Select ${a.name}`} />
                    </td>
                  )}
                  <td className="px-3 py-2.5 font-mono text-xs font-medium">{a.asset_id}</td>
                  <td className="px-3 py-2.5 font-medium text-sm">{a.name}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{a.category}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{a.location}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{a.vendor}</td>
                  <td className="px-3 py-2.5">
                    <div className="text-xs">{a.model}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{a.serial_number}</div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{a.purchase_date || "—"}</td>
                  <td className={`px-3 py-2.5 text-xs font-medium ${conditionColor(a.condition)}`}>{a.condition}</td>
                  <td className="px-3 py-2.5"><Badge variant={statusColor(a.audit_status)} className="text-[10px]">{a.audit_status}</Badge></td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => setQrAsset(a)} className="rounded p-1 hover:bg-muted transition-colors" aria-label={`QR code for ${a.name}`}>
                      <QrCode className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </td>
                  {canDelete && (
                    <td className="px-3 py-2.5">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="rounded p-1 hover:bg-destructive/10 transition-colors" aria-label={`Delete ${a.name}`}>
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{a.name}" ({a.asset_id})?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently remove this asset from the register.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete([a.id])} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={!!qrAsset} onOpenChange={() => setQrAsset(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Asset QR Code</DialogTitle></DialogHeader>
          {qrAsset && (
            <div className="flex flex-col items-center gap-4 py-4">
              <QRCodeSVG value={JSON.stringify({ assetId: qrAsset.asset_id, name: qrAsset.name, serial: qrAsset.serial_number, location: qrAsset.location })} size={200} />
              <div className="text-center">
                <p className="font-mono text-sm font-bold">{qrAsset.asset_id}</p>
                <p className="text-sm">{qrAsset.name}</p>
                <p className="text-xs text-muted-foreground">{qrAsset.location}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default AssetRegister;
