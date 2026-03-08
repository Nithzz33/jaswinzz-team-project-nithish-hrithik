import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, PackageCheck, PackageX, AlertTriangle } from "lucide-react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

const StockCheck = () => {
  const { data: products, isLoading } = useProducts();
  const [search, setSearch] = useState("");

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <PageShell
      icon={PackageCheck}
      title="Stock Availability"
      subtitle="Check if items are available for customers"
      filters={
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-10" placeholder="Search by product name, SKU, or category..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
        </div>
      }
    >
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={PackageCheck} title={search ? "No products match your search" : "No products in warehouse"} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => (
            <div
              key={p.id}
              className={`rounded-lg border p-4 transition-shadow hover:shadow-md ${
                p.quantity === 0 ? "bg-destructive/5 border-destructive/15" :
                p.quantity <= p.reorder_point ? "bg-warning/5 border-warning/15" :
                "bg-card"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{p.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                </div>
                {p.quantity === 0 ? (
                  <PackageX className="h-4 w-4 text-destructive shrink-0" aria-label="Out of stock" />
                ) : p.quantity <= p.reorder_point ? (
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0" aria-label="Low stock" />
                ) : (
                  <PackageCheck className="h-4 w-4 text-primary shrink-0" aria-label="In stock" />
                )}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold tabular-nums">{p.quantity}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">units available</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium tabular-nums">₹{p.price.toLocaleString()}</p>
                  <Badge variant={p.quantity === 0 ? "destructive" : p.quantity <= p.reorder_point ? "secondary" : "default"} className="text-[10px] mt-1">
                    {p.quantity === 0 ? "Out of Stock" : p.quantity <= p.reorder_point ? "Low Stock" : "Available"}
                  </Badge>
                </div>
              </div>
              {p.location && <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><span>📍</span> {p.location}</p>}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default StockCheck;
