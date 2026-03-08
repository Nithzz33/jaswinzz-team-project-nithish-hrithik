import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

const TableSkeleton = ({ rows = 5, columns = 5 }: TableSkeletonProps) => (
  <div className="space-y-0 p-1">
    {/* Header skeleton */}
    <div className="flex gap-4 px-3 py-3 border-b">
      {Array.from({ length: columns }).map((_, j) => (
        <Skeleton key={`h-${j}`} className="h-3 flex-1 bg-muted/60" />
      ))}
    </div>
    {/* Row skeletons */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 px-3 py-3.5 border-b last:border-0">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton
            key={j}
            className="h-3.5 flex-1"
            style={{ opacity: 1 - i * 0.12 }}
          />
        ))}
      </div>
    ))}
  </div>
);

export default TableSkeleton;