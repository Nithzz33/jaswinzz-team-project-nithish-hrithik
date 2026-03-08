import { useState, useMemo } from "react";
import { useAssets } from "@/hooks/useAssets";
import { useCreateAssetReorder, useAssetReorderRequests } from "@/hooks/useAssetReorders";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Search, ShoppingCart, AlertTriangle, Package, Receipt, ShieldCheck, XCircle, Clock, IndianRupee, Printer } from "lucide-react";
import { printReceipt } from "@/lib/printReceipt";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import TableSkeleton from "@/components/TableSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formatCurrency = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const Reorder = () => {
  const { data: assets, isLoading } = useAssets();
  const { data: reorderRequests } = useAssetReorderRequests();
  const createReorder = useCreateAssetReorder();

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [costDialog, setCostDialog] = useState(false);
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const reorderableAssets = useMemo(() => {
    if (!assets) return [];
    return assets.filter(
      (a) =>
        a.condition === "Poor" ||
        a.condition === "Fair" ||
        a.condition === "Decommissioned" ||
        a.audit_status === "Discrepancy"
    );
  }, [assets]);

  const filtered = useMemo(() => {
    return reorderableAssets.filter((a) => {
      const matchSearch =
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.asset_id.toLowerCase().includes(search.toLowerCase()) ||
        a.vendor.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === "all" || a.category === catFilter;
      const matchCondition = conditionFilter === "all" || a.condition === conditionFilter;
      return matchSearch && matchCat && matchCondition;
    });
  }, [reorderableAssets, search, catFilter, conditionFilter]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((i) => i.id)));
  };

  const selectedItems = filtered.filter((i) => selected.has(i.id));

  const conditionBadge = (condition: string) => {
    switch (condition) {
      case "Decommissioned":
      case "Poor":
        return "destructive" as const;
      case "Fair":
        return "secondary" as const;
      default:
        return "default" as const;
    }
  };

  const openCostDialog = () => {
    setNotes("");
    setCostDialog(true);
  };

  const totalEstimatedCost = selectedItems.reduce((sum, i) => sum + (i.purchase_price || 0), 0);

  const handleSubmitReorder = async () => {
    const requests = selectedItems.map((item) => ({
      asset_id: item.id,
      estimated_cost: item.purchase_price || 0,
      notes,
    }));

    if (requests.some((r) => r.estimated_cost <= 0)) {
      toast.error("Some selected assets have no cost set. Please update them first.");
      return;
    }

    setProcessing(true);
    try {
      const rows = await createReorder.mutateAsync(requests);
      setCostDialog(false);
      setSelected(new Set());
      toast.success(`${rows.length} reorder request(s) submitted`);
    } catch (e: any) {
      toast.error("Failed to submit reorder", { description: e.message });
    } finally {
      setProcessing(false);
    }
  };

  const recentRequests = useMemo(() => {
    if (!reorderRequests || !assets) return [];
    return reorderRequests.slice(0, 20).map((r) => ({
      ...r,
      asset: assets.find((a) => a.id === r.asset_id),
    }));
  }, [reorderRequests, assets]);

  const activeCategories = useMemo(() => {
    return [...new Set(reorderableAssets.map((a) => a.category))].sort();
  }, [reorderableAssets]);

  const statusIcon = (status: string) => {
    switch (status) {
      case "auto_approved":
      case "approved":
        return <ShieldCheck className="h-3.5 w-3.5 text-primary" />;
      case "rejected":
        return <XCircle className="h-3.5 w-3.5 text-destructive" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "auto_approved":
      case "approved":
        return (
          <Badge variant="default" className="text-[10px] gap-1">
            {statusIcon(status)} Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="text-[10px] gap-1">
            {statusIcon(status)} Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[10px] gap-1">
            {statusIcon(status)} Pending
          </Badge>
        );
    }
  };

  return (
    <PageShell
      icon={Receipt}
      title="Reorder Items"
      subtitle="Assets needing replacement"
      actions={
        <Button variant="outline" size="sm" className="gap-1.5" disabled={selected.size === 0} onClick={openCostDialog}>
          <ShoppingCart className="h-3.5 w-3.5" /> Submit Reorder ({selected.size})
        </Button>
      }
      filters={
        <>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or vendor..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {activeCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
              <SelectItem value="Poor">Poor</SelectItem>
              <SelectItem value="Decommissioned">Decommissioned</SelectItem>
            </SelectContent>
          </Select>
        </>
      }
    >
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assets">Assets to Reorder</TabsTrigger>
          <TabsTrigger value="history">Order History</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-3">
          {selected.size > 0 && (
            <div className="flex items-center gap-3 rounded-md border bg-primary/5 px-4 py-2.5 text-sm">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <span className="font-medium">{selected.size} asset(s) selected for reorder</span>
            </div>
          )}

          <div className="data-table-wrapper overflow-auto">
            {isLoading ? (
              <TableSkeleton rows={8} columns={7} />
            ) : filtered.length === 0 ? (
              <EmptyState icon={Package} title="No assets need reordering" />
            ) : (
              <table className="w-full text-sm table-sticky-header table-zebra">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2.5 text-left">
                      <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={selectAll} />
                    </th>
                    {["Asset ID", "Name", "Category", "Vendor", "Model", "Condition", "Audit Status", "Location"].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((asset) => {
                    const isSelected = selected.has(asset.id);
                    return (
                      <tr key={asset.id} className={`border-b last:border-0 transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-muted/40"}`}>
                        <td className="px-3 py-2.5">
                          <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(asset.id)} />
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs">{asset.asset_id}</td>
                        <td className="px-3 py-2.5 font-medium">{asset.name}</td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{asset.category}</td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{asset.vendor || "—"}</td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{asset.model || "—"}</td>
                        <td className="px-3 py-2.5">
                          <Badge variant={conditionBadge(asset.condition)} className="text-[10px] gap-0.5">
                            {(asset.condition === "Poor" || asset.condition === "Decommissioned") && <AlertTriangle className="h-2.5 w-2.5" />}
                            {asset.condition}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge
                            variant={
                              asset.audit_status === "Discrepancy"
                                ? "destructive"
                                : asset.audit_status === "Pending"
                                  ? "secondary"
                                  : "default"
                            }
                            className="text-[10px]"
                          >
                            {asset.audit_status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">
                          {asset.building} – {asset.room}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          {recentRequests.length === 0 ? (
            <EmptyState icon={Receipt} title="No reorder requests yet" />
          ) : (
            <div className="data-table-wrapper overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {["Asset", "Vendor", "Cost", "Status", "Date", ""].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.map((req) => (
                    <tr key={req.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="px-3 py-2.5 font-medium">{req.asset?.name || "Unknown"}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{req.asset?.vendor || "—"}</td>
                      <td className="px-3 py-2.5 font-mono text-xs">{formatCurrency(req.estimated_cost)}</td>
                      <td className="px-3 py-2.5">{statusBadge(req.status)}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</td>
                      <td className="px-3 py-2.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() =>
                            printReceipt({
                              id: req.id,
                              assetName: req.asset?.name || "Unknown",
                              assetId: req.asset?.asset_id || "—",
                              vendor: req.asset?.vendor || "",
                              category: req.asset?.category || "",
                              location: req.asset ? `${req.asset.building} – ${req.asset.room}` : "",
                              cost: req.estimated_cost,
                              status: req.status,
                              date: new Date(req.created_at).toLocaleDateString(),
                              notes: req.notes,
                            })
                          }
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={costDialog} onOpenChange={setCostDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4" /> Confirm Reorder
            </DialogTitle>
            <DialogDescription>Review the items and costs before submitting.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {selectedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.asset_id} · {item.vendor || "No vendor"}
                  </p>
                </div>
                <span className="font-mono text-sm font-semibold whitespace-nowrap">
                  {item.purchase_price > 0
                    ? formatCurrency(item.purchase_price)
                    : <span className="text-destructive">No cost set</span>}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Reason for reorder..."
              className="text-sm"
            />
          </div>
          <div className="rounded-md border px-4 py-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Cost:</span>
              <span className="font-bold">{formatCurrency(totalEstimatedCost)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCostDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReorder} disabled={processing || totalEstimatedCost <= 0}>
              {processing ? "Submitting..." : "Submit Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default Reorder;

