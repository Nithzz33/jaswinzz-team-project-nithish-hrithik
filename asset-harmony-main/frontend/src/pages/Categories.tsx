import { useAssets } from "@/hooks/useAssets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Armchair, Zap, Package, Tv, Building2, MapPin, Music } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const catIcons: Record<string, typeof Monitor> = {
  "IT Equipment": Monitor,
  "Office Furniture": Armchair,
  "Appliances": Zap,
  "Consumables": Package,
  "AV Equipment": Tv,
  "Party Decorations": Package,
  "Catering Equipment": Package,
  "AV & Entertainment": Music,
};

const Categories = () => {
  const navigate = useNavigate();
  const { data: dbAssets, isLoading } = useAssets();

  const assets = dbAssets || [];

  const categories = useMemo(() => {
    const cats = [...new Set(assets.map(a => a.category))].sort();
    return cats;
  }, [assets]);

  const locations = useMemo(() => {
    const buildingMap: Record<string, { building: string; floors: Set<string> }> = {};
    assets.forEach(a => {
      if (!buildingMap[a.building]) buildingMap[a.building] = { building: a.building, floors: new Set() };
      if (a.floor) buildingMap[a.building].floors.add(a.floor);
    });
    return Object.values(buildingMap).map(b => ({
      building: b.building,
      floors: [...b.floors].sort(),
    }));
  }, [assets]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categories & Locations</h1>
        <p className="text-sm text-muted-foreground">Asset classification hierarchy</p>
      </div>

      <Tabs defaultValue="category">
        <TabsList>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="location">By Location</TabsTrigger>
        </TabsList>

        <TabsContent value="category" className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(cat => {
            const Icon = catIcons[cat] || Package;
            const catAssets = assets.filter(a => a.category === cat);
            return (
              <div key={cat} className="rounded-lg border bg-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{cat}</h3>
                    <p className="text-xs text-muted-foreground">{catAssets.length} assets</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {catAssets.slice(0, 4).map(a => (
                    <div key={a.id} onClick={() => navigate(`/register?search=${encodeURIComponent(a.asset_id)}`)} className="flex justify-between text-xs border rounded px-2.5 py-1.5 cursor-pointer hover:bg-accent transition-colors">
                      <span className="truncate">{a.name}</span>
                      <span className="font-mono text-muted-foreground ml-2">{a.asset_id}</span>
                    </div>
                  ))}
                  {catAssets.length > 4 && <p onClick={() => navigate(`/register?category=${encodeURIComponent(cat)}`)} className="text-xs text-muted-foreground text-center pt-1 cursor-pointer hover:text-foreground transition-colors">+{catAssets.length - 4} more</p>}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="location" className="mt-4 space-y-4">
          {locations.map(loc => {
            const locAssets = assets.filter(a => a.building === loc.building);
            return (
              <div key={loc.building} className="rounded-lg border bg-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{loc.building}</h3>
                  <span className="text-xs text-muted-foreground ml-auto">{locAssets.length} assets</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {loc.floors.map(floor => {
                    const floorAssets = locAssets.filter(a => a.floor === floor);
                    return (
                      <div key={floor} className="rounded border p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium">{floor}</span>
                          <span className="text-xs text-muted-foreground">({floorAssets.length})</span>
                        </div>
                        {floorAssets.length > 0 ? (
                          <div className="space-y-1">
                            {floorAssets.slice(0, 6).map(a => (
                              <p key={a.id} onClick={() => navigate(`/register?search=${encodeURIComponent(a.asset_id)}`)} className="text-xs text-muted-foreground truncate cursor-pointer hover:text-foreground transition-colors">• {a.name}</p>
                            ))}
                            {floorAssets.length > 6 && (
                              <p className="text-xs text-muted-foreground italic">+{floorAssets.length - 6} more</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No assets</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Categories;
