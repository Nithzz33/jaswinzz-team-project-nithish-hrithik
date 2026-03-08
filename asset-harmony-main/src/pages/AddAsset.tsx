import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, CONDITIONS, LOCATIONS, DEPARTMENTS, generateAssetId } from "@/data/assets";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Tag } from "lucide-react";

const AddAsset = () => {
  const { toast } = useToast();
  const [generatedId] = useState(generateAssetId);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "" as string, building: "", floor: "", room: "", department: "",
    vendor: "", model: "", serialNumber: "", condition: "" as string, unitCost: "",
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.building) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Asset Registered", description: `${generatedId} – ${form.name} has been added to the register.` });
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="rounded-lg border bg-card p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <Tag className="h-6 w-6 text-success" />
          </div>
          <h2 className="text-xl font-bold">Asset Registered Successfully</h2>
          <QRCodeSVG value={JSON.stringify({ assetId: generatedId, name: form.name, serial: form.serialNumber })} size={180} />
          <p className="font-mono text-lg font-bold">{generatedId}</p>
          <p className="text-sm text-muted-foreground">Print this QR code and attach it to the asset.</p>
          <Button onClick={() => { setSubmitted(false); setForm({ name: "", category: "", building: "", floor: "", room: "", department: "", vendor: "", model: "", serialNumber: "", condition: "", unitCost: "" }); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Register Another Asset
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Asset</h1>
        <p className="text-sm text-muted-foreground">Register a new asset with auto-generated ID and QR code</p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="mb-6 flex items-center gap-3 rounded-md bg-muted px-4 py-3">
          <Tag className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Auto-generated Asset ID</p>
            <p className="font-mono text-lg font-bold">{generatedId}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Asset Name *</Label>
            <Input value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Dell Latitude 5540 Laptop" />
          </div>

          <div>
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={v => update("category", v)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <Label>Condition</Label>
            <Select value={form.condition} onValueChange={v => update("condition", v)}>
              <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
              <SelectContent>{CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <Label>Building *</Label>
            <Select value={form.building} onValueChange={v => update("building", v)}>
              <SelectTrigger><SelectValue placeholder="Select building" /></SelectTrigger>
              <SelectContent>{LOCATIONS.map(l => <SelectItem key={l.building} value={l.building}>{l.building}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <Label>Floor</Label>
            <Input value={form.floor} onChange={e => update("floor", e.target.value)} placeholder="e.g. Floor 2" />
          </div>

          <div>
            <Label>Room</Label>
            <Input value={form.room} onChange={e => update("room", e.target.value)} placeholder="e.g. Room 205" />
          </div>

          <div>
            <Label>Department</Label>
            <Select value={form.department} onValueChange={v => update("department", v)}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <Label>Vendor</Label>
            <Input value={form.vendor} onChange={e => update("vendor", e.target.value)} placeholder="e.g. Dell Technologies" />
          </div>

          <div>
            <Label>Model</Label>
            <Input value={form.model} onChange={e => update("model", e.target.value)} placeholder="e.g. Latitude 5540" />
          </div>

          <div>
            <Label>Serial Number</Label>
            <Input value={form.serialNumber} onChange={e => update("serialNumber", e.target.value)} placeholder="e.g. DL5540-X9K2M" className="font-mono" />
          </div>

          <div>
            <Label>Unit Cost (₹)</Label>
            <Input type="number" value={form.unitCost} onChange={e => update("unitCost", e.target.value)} placeholder="e.g. 45000" />
          </div>



          <div className="sm:col-span-2 pt-2">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Register Asset & Generate QR
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAsset;
