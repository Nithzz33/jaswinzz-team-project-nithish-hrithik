import { type LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

const EmptyState = ({ icon: Icon = Inbox, title, description }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 mb-4">
      <Icon className="h-7 w-7 text-muted-foreground/60" />
    </div>
    <p className="text-sm font-semibold text-foreground">{title}</p>
    {description && <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">{description}</p>}
  </div>
);

export default EmptyState;