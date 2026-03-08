import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

interface SectionCardProps {
  title?: string;
  icon?: LucideIcon;
  iconColor?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

const SectionCard = ({ title, icon: Icon, iconColor = "text-primary", actions, children, className = "", noPadding }: SectionCardProps) => (
  <div className={`section-card ${noPadding ? "!p-0" : ""} ${className}`}>
    {(title || actions) && (
      <div className={`flex items-center justify-between ${noPadding ? "px-5 pt-5" : ""} mb-4`}>
        {title && (
          <h2 className="section-title">
            {Icon && <Icon className={`h-4 w-4 ${iconColor}`} />}
            {title}
          </h2>
        )}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    )}
    {children}
  </div>
);

export default SectionCard;