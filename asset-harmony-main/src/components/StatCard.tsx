import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: "primary" | "secondary" | "success" | "warning" | "destructive";
}

const colorMap = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

const StatCard = ({ label, value, icon: Icon, trend, color = "primary" }: StatCardProps) => (
  <div className="stat-card group">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-metric">{value}</p>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[color]} transition-transform group-hover:scale-110`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
    {trend && <p className="mt-2 text-xs font-medium text-muted-foreground">{trend}</p>}
  </div>
);

export default StatCard;