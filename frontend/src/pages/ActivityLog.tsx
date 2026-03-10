import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import PageShell from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollText, Search, User, ArrowRight, Calendar } from "lucide-react";
import { format } from "date-fns";
import TableSkeleton from "@/components/TableSkeleton";

interface ActivityEntry {
  id: string;
  asset_id: string;
  auditor_id: string;
  previous_status: string | null;
  new_status: string;
  notes: string | null;
  created_at: string;
  profiles: { full_name: string } | null;
  assets: { name: string; asset_id: string } | null;
}

const statusColor = (status: string) => {
  switch (status) {
    case "Verified":
      return "bg-success/10 text-success border-success/20";
    case "Discrepancy":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "Pending":
      return "bg-warning/10 text-warning border-warning/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const ActivityLog = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [auditorFilter, setAuditorFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["activity_logs"],
    queryFn: async () => {
      const res = await fetch("https://asset-harmony-api.onrender.com/api/activity-logs");

      if (!res.ok) {
        throw new Error("Failed to fetch activity logs");
      }

      const data = await res.json();
      return data as ActivityEntry[];
    },
  });

  const auditors = useMemo(() => {
    if (!logs) return [];
    const names = [
      ...new Set(logs.map((l) => l.profiles?.full_name).filter(Boolean)),
    ] as string[];
    return names.sort();
  }, [logs]);

  const filtered = useMemo(() => {
    if (!logs) return [];

    const now = new Date();

    return logs.filter((log) => {
      const matchesSearch =
        !search ||
        log.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        log.assets?.name?.toLowerCase().includes(search.toLowerCase()) ||
        log.assets?.asset_id?.toLowerCase().includes(search.toLowerCase()) ||
        log.notes?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || log.new_status === statusFilter;

      const matchesAuditor =
        auditorFilter === "all" ||
        log.profiles?.full_name === auditorFilter;

      let matchesDate = true;

      if (dateFilter !== "all") {
        const logDate = new Date(log.created_at);
        const days =
          dateFilter === "7d" ? 7 : dateFilter === "30d" ? 30 : 90;

        matchesDate =
          (now.getTime() - logDate.getTime()) / 86400000 <= days;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesAuditor &&
        matchesDate
      );
    });
  }, [logs, search, statusFilter, auditorFilter, dateFilter]);

  return (
    <PageShell
      title="Activity Log"
      subtitle="Track who did what across audits and asset changes"
      icon={ScrollText}
      filters={
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by auditor, asset, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] h-9">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Verified">Verified</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Discrepancy">Discrepancy</SelectItem>
            </SelectContent>
          </Select>

          <Select value={auditorFilter} onValueChange={setAuditorFilter}>
            <SelectTrigger className="w-full sm:w-[170px] h-9">
              <SelectValue placeholder="All auditors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Auditors</SelectItem>
              {auditors.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[140px] h-9">
              <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ScrollText className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No activity logs found
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Audit actions will appear here
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Auditor</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Status Change</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {format(new Date(log.created_at), "dd MMM yyyy")}
                        </p>
                        <p className="text-muted-foreground">
                          {format(new Date(log.created_at), "hh:mm a")}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-medium">
                        {log.profiles?.full_name || "Unknown"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {log.assets?.name || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.assets?.asset_id || ""}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Badge
                        variant="outline"
                        className={statusColor(log.previous_status || "")}
                      >
                        {log.previous_status || "—"}
                      </Badge>

                      <ArrowRight className="h-3 w-3 text-muted-foreground" />

                      <Badge
                        variant="outline"
                        className={statusColor(log.new_status)}
                      >
                        {log.new_status}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {log.notes || "—"}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </PageShell>
  );
};

export default ActivityLog;