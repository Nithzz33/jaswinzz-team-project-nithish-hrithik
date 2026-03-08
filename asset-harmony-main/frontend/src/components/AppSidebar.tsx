import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, PlusCircle, FolderTree, ScanSearch, BarChart3, Package, LogOut, User, ShoppingCart, Camera, PackageCheck, Receipt, TrendingUp, Menu, X, ChevronRight, ScrollText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "manager", "auditor", "sales"], group: "Overview" },
  { to: "/inventory-dashboard", icon: TrendingUp, label: "Inventory Dashboard", roles: ["admin", "manager"], group: "Inventory" },
  { to: "/products", icon: Package, label: "Products", roles: ["admin", "manager"], group: "Inventory" },
  { to: "/stock-check", icon: PackageCheck, label: "Stock Check", roles: ["admin", "manager", "sales"], group: "Inventory" },
  { to: "/sales", icon: ShoppingCart, label: "Sales", roles: ["admin", "manager", "sales"], group: "Commerce" },
  { to: "/sales-report", icon: TrendingUp, label: "Sales Report", roles: ["admin", "manager"], group: "Commerce" },
  { to: "/register", icon: ClipboardList, label: "Asset Register", roles: ["admin", "manager", "auditor"], group: "Assets" },
  { to: "/add-asset", icon: PlusCircle, label: "Add Asset", roles: ["admin", "manager"], group: "Assets" },
  { to: "/categories", icon: FolderTree, label: "Categories", roles: ["admin", "manager", "auditor"], group: "Assets" },
  { to: "/audit", icon: ScanSearch, label: "Audit Workflow", roles: ["admin", "manager", "auditor"], group: "Audit" },
  { to: "/audit/scan", icon: Camera, label: "Scan & Audit", roles: ["admin", "manager", "auditor"], group: "Audit" },
  { to: "/reports", icon: BarChart3, label: "Reports", roles: ["admin", "manager"], group: "Analytics" },
  { to: "/reorder", icon: Receipt, label: "Reorder Items", roles: ["admin", "manager"], group: "Assets" },
  { to: "/activity-log", icon: ScrollText, label: "Activity Log", roles: ["admin", "manager", "auditor"], group: "Analytics" },
];

const AppSidebar = () => {
  const location = useLocation();
  const { profile, role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = navItems.filter(item => !role || item.roles.includes(role));
  
  // Group items
  const groups: Record<string, typeof navItems> = {};
  visibleItems.forEach(item => {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  });

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary/15 shrink-0">
          <Package className="h-4.5 w-4.5 text-sidebar-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-white tracking-tight">AssetTrack</h1>
          <p className="text-[10px] text-sidebar-foreground/40 font-medium">Operations Hub</p>
        </div>
        <button
          className="ml-auto lg:hidden text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-sidebar-foreground/30">{group}</p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
                      active
                        ? "bg-sidebar-primary/15 text-sidebar-primary shadow-sm"
                        : "text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-sidebar-primary" : ""}`} />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight className="h-3 w-3 opacity-50" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User area */}
      <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sidebar-primary/25 to-sidebar-primary/10 shrink-0">
            <User className="h-3.5 w-3.5 text-sidebar-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{profile?.full_name || "User"}</p>
            <p className="text-[10px] text-sidebar-foreground/40 capitalize font-medium">{role || "—"}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/45 hover:text-sidebar-foreground hover:bg-sidebar-accent h-8 text-xs font-medium"
          onClick={logout}
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-3.5 left-3.5 z-50 lg:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-card border shadow-card"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col bg-sidebar transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default AppSidebar;