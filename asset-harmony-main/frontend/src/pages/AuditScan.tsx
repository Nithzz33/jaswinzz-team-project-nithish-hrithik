import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, Search, QrCode, ArrowRight, RotateCcw } from "lucide-react";
import { sampleAssets } from "@/data/assets";
import { useAssets, useUpdateAuditStatus } from "@/hooks/useAssets";
import QrScanner from "@/components/QrScanner";
import PhotoCapture from "@/components/PhotoCapture";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type Step = "scan" | "review" | "done";

const AuditScan = () => {
  const { data: dbAssets } = useAssets();
  const updateAudit = useUpdateAuditStatus();

  const assets = useMemo(() => {
    if (dbAssets && dbAssets.length > 0) return dbAssets;
    return sampleAssets.map(a => ({
      id: a.id, asset_id: a.assetId, name: a.name, category: a.category,
      location: a.location, building: a.building, floor: a.floor, room: a.room,
      department: a.department, vendor: a.vendor, model: a.model,
      serial_number: a.serialNumber, purchase_date: a.purchaseDate,
      condition: a.condition, audit_status: a.auditStatus,
      last_audit_date: a.lastAuditDate, last_audited_by: null,
      created_at: "", updated_at: "",
    }));
  }, [dbAssets]);

  const [step, setStep] = useState<Step>("scan");
  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState("");
  const [foundAsset, setFoundAsset] = useState<typeof assets[0] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [newStatus, setNewStatus] = useState("Verified");
  const [newCondition, setNewCondition] = useState("Good");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [auditedCount, setAuditedCount] = useState(0);

  const lookupAsset = (query: string) => {
    const q = query.trim().toUpperCase();
    const match = assets.find(
      a => a.asset_id.toUpperCase() === q || a.serial_number?.toUpperCase() === q
    );
    if (match) {
      setFoundAsset(match);
      setNotFound(false);
      setNewCondition(match.condition);
      setStep("review");
    } else {
      setNotFound(true);
      setFoundAsset(null);
    }
  };

  const handleScan = (text: string) => {
    setManualId(text);
    lookupAsset(text);
  };

  const handleManualSearch = () => {
    if (manualId.trim()) lookupAsset(manualId);
  };

  const handleSubmitAudit = async () => {
    if (!foundAsset) return;
    try {
      await updateAudit.mutateAsync({
        assetId: foundAsset.id,
        newStatus,
        notes: `${notes}${photos.length > 0 ? ` [${photos.length} photo(s) attached]` : ""}`,
      });
      toast.success("Asset audited!", { description: `${foundAsset.name} → ${newStatus}` });
    } catch {
      // Fallback for dummy mode
      toast.success("Asset audited! (demo)", { description: `${foundAsset.name} → ${newStatus}` });
    }
    setAuditedCount(c => c + 1);
    setStep("done");
  };

  const resetScan = () => {
    setStep("scan");
    setFoundAsset(null);
    setNotFound(false);
    setManualId("");
    setNotes("");
    setPhotos([]);
    setNewStatus("Verified");
    setNewCondition("Good");
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scan & Audit</h1>
        <p className="text-sm text-muted-foreground">
          Scan QR codes, photograph assets, and update their status
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {["scan", "review", "done"].map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`h-2 flex-1 rounded-full transition-colors ${
              (step === "scan" && i === 0) || (step === "review" && i <= 1) || step === "done"
                ? "bg-primary"
                : "bg-muted"
            }`} />
          </div>
        ))}
        <Badge variant="secondary" className="text-xs ml-2">{auditedCount} audited</Badge>
      </div>

      <AnimatePresence mode="wait">
        {step === "scan" && (
          <motion.div
            key="scan"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <QrCode className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-sm">Step 1: Identify Asset</h2>
              </div>

              <QrScanner
                scanning={scanning}
                onToggle={() => setScanning(!scanning)}
                onScan={handleScan}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or type manually</span>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Enter Asset ID (e.g. AST-00001)"
                    className="pl-9"
                    value={manualId}
                    onChange={e => { setManualId(e.target.value); setNotFound(false); }}
                    onKeyDown={e => e.key === "Enter" && handleManualSearch()}
                  />
                </div>
                <Button onClick={handleManualSearch} className="gap-1">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {notFound && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
                >
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <p className="text-xs text-destructive">
                    No asset found for "<span className="font-mono">{manualId}</span>". Check the ID and try again.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {step === "review" && foundAsset && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Asset info card */}
            <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
              <h2 className="font-semibold text-sm text-primary">Asset Found</h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-muted p-2.5">
                  <span className="text-muted-foreground">Asset ID</span>
                  <p className="font-mono font-medium">{foundAsset.asset_id}</p>
                </div>
                <div className="rounded-lg bg-muted p-2.5">
                  <span className="text-muted-foreground">Category</span>
                  <p className="font-medium">{foundAsset.category}</p>
                </div>
                <div className="col-span-2 rounded-lg bg-muted p-2.5">
                  <span className="text-muted-foreground">Name</span>
                  <p className="font-medium">{foundAsset.name}</p>
                </div>
                <div className="col-span-2 rounded-lg bg-muted p-2.5">
                  <span className="text-muted-foreground">Location</span>
                  <p className="font-medium">{foundAsset.location}</p>
                </div>
                <div className="rounded-lg bg-muted p-2.5">
                  <span className="text-muted-foreground">Current Condition</span>
                  <p className="font-medium">{foundAsset.condition}</p>
                </div>
                <div className="rounded-lg bg-muted p-2.5">
                  <span className="text-muted-foreground">Current Status</span>
                  <Badge variant={foundAsset.audit_status === "Verified" ? "default" : foundAsset.audit_status === "Pending" ? "secondary" : "destructive"} className="mt-0.5 text-xs">
                    {foundAsset.audit_status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Photo capture */}
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <PhotoCapture
                photos={photos}
                onAddPhoto={(url) => setPhotos(p => [...p, url])}
                onRemovePhoto={(i) => setPhotos(p => p.filter((_, idx) => idx !== i))}
              />
            </div>

            {/* Status update */}
            <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
              <h2 className="font-semibold text-sm">Step 3: Update Status</h2>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Audit Status</label>
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
                <label className="text-xs font-medium text-muted-foreground">Condition</label>
                <Select value={newCondition} onValueChange={setNewCondition}>
                  <SelectTrigger className="mt-1.5 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["New", "Good", "Fair", "Poor", "Decommissioned"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Notes</label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Observations, damage notes, location mismatch..."
                  rows={2}
                  className="mt-1.5"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={resetScan}>Back</Button>
                <Button className="flex-1 gap-2" onClick={handleSubmitAudit} disabled={updateAudit.isPending}>
                  <CheckCircle2 className="h-4 w-4" />
                  {updateAudit.isPending ? "Saving..." : "Submit Audit"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border bg-card p-8 text-center shadow-sm space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
            </motion.div>
            <h2 className="text-lg font-bold">Audit Submitted!</h2>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{foundAsset?.name}</span> has been marked as{" "}
              <Badge variant={newStatus === "Verified" ? "default" : newStatus === "Pending" ? "secondary" : "destructive"} className="text-xs">
                {newStatus}
              </Badge>
              {photos.length > 0 && ` with ${photos.length} photo(s)`}
            </p>
            <Button onClick={resetScan} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Scan Next Asset
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuditScan;
