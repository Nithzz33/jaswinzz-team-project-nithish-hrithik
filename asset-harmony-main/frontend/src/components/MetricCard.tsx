import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  color?: "primary" | "secondary" | "success" | "warning" | "destructive";
}

const iconBgMap = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

const trendColorMap = {
  up: "text-success",
  down: "text-destructive",
  neutral: "text-muted-foreground",
};

const TrendIcon = ({ direction }: { direction?: "up" | "down" | "neutral" }) => {
  if (direction === "up") return <TrendingUp className="h-3 w-3" />;
  if (direction === "down") return <TrendingDown className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
};

const MetricCard = ({ label, value, icon: Icon, trend, trendDirection, color = "primary" }: MetricCardProps) => (
  <div className="stat-card group">
    <div className="flex items-start justify-between">
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-metric">{value}</p>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBgMap[color]} transition-transform group-hover:scale-110`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
    {trend && (
      <div className={`mt-2.5 flex items-center gap-1 text-xs font-medium ${trendDirection ? trendColorMap[trendDirection] : "text-muted-foreground"}`}>
        {trendDirection && <TrendIcon direction={trendDirection} />}
        {trend}
      </div>
    )}
  </div>
);

export default MetricCard;