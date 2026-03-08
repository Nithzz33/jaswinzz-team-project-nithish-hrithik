import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Package, LogIn, AlertCircle, Shield, BarChart3, ScanSearch, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import warehouseBg from "@/assets/warehouse-bg.jpg";

const DEMO_ACCOUNTS = [
  { label: "Admin", desc: "Full system access", email: "admin@assettrack.com", pw: "admin123", icon: Shield, color: "bg-primary/10 text-primary border-primary/20" },
  { label: "Manager", desc: "Inventory & reports", email: "manager@assettrack.com", pw: "manager123", icon: BarChart3, color: "bg-secondary/10 text-secondary border-secondary/20" },
  { label: "Auditor", desc: "Asset verification", email: "auditor@assettrack.com", pw: "auditor123", icon: ScanSearch, color: "bg-info/10 text-info border-info/20" },
  { label: "Sales", desc: "POS & stock check", email: "sales@assettrack.com", pw: "sales123", icon: ShoppingCart, color: "bg-success/10 text-success border-success/20" },
];

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await login(email, password);
    if (res.error) setError(res.error);
    setLoading(false);
  };

  const fillDemo = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setError("");
  };

  return (
    <div className="relative flex min-h-screen items-center px-4 sm:px-8 lg:px-36">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${warehouseBg})` }}
      />
      <div className="absolute inset-0 bg-foreground/60" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-[400px] space-y-6"
      >
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-elevated">
            <Package className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-display text-white">AssetTrack</h1>
            <p className="text-caption mt-1 text-white/70">Inventory management made simpler</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border bg-card p-7 shadow-card">
          <h2 className="text-title text-base mb-5">Sign in to continue</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter your password"
                required
                minLength={6}
                autoComplete="current-password"
                className="h-10"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/8 border border-destructive/15 px-3 py-2.5 text-sm text-destructive font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2"><LogIn className="h-4 w-4" /> Sign In</span>
              )}
            </Button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-muted-foreground text-center uppercase tracking-wider">Quick access</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(d => (
              <button
                key={d.label}
                type="button"
                onClick={() => fillDemo(d.email, d.pw)}
                className={`rounded-xl border px-3.5 py-3 text-left transition-all duration-150 hover:shadow-card hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-card`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-md ${d.color}`}>
                    <d.icon className="h-3 w-3" />
                  </div>
                  <p className="text-xs font-bold text-foreground">{d.label}</p>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;