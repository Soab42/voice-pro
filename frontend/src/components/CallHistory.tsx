import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  listCallHistory,
  Call as ApiCall,
  PaginatedCallHistory,
} from "../../lib/api";

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const CallHistory = () => {
  const [callHistory, setCallHistory] = useState<PaginatedCallHistory | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listCallHistory(currentPage, limit);
        if (mounted) setCallHistory(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load call history");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [currentPage, limit]);

  const durationSeconds = (c: ApiCall) => {
    const start = new Date(c.answeredAt || c.startedAt).getTime();
    const end = new Date(c.endedAt || Date.now()).getTime();
    const diff = Math.max(0, Math.floor((end - start) / 1000));
    return Number.isFinite(diff) ? diff : 0;
  };

  const statusClass = (s: ApiCall["status"]) => {
    if (s === "COMPLETED") return "bg-green-100 text-green-700";
    if (s === "NO_ANSWER" || s === "FAILED") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const calls = callHistory?.calls || [];
  const pagination = callHistory?.pagination;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
          <CardDescription>Detailed log of all calls.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Direction</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>Loading...</TableCell>
                </TableRow>
              ) : (
                calls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell>
                      <Badge
                        variant={
                          call.direction?.toLowerCase() === "inbound"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {call.direction}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {call.direction?.toLowerCase() === "inbound"
                        ? call.customerNumber
                        : "Agent"}
                    </TableCell>
                    <TableCell>
                      {call.direction?.toLowerCase() === "inbound"
                        ? "Agent"
                        : call.customerNumber}
                    </TableCell>
                    <TableCell>
                      {formatDuration(durationSeconds(call))}
                    </TableCell>
                    <TableCell>
                      {new Date(call.startedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClass(call.status)}>
                        {call.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${(call.cost || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        pagination.hasPrev && handlePageChange(currentPage - 1)
                      }
                      className={
                        !pagination.hasPrev
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        pagination.hasNext && handlePageChange(currentPage + 1)
                      }
                      className={
                        !pagination.hasNext
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <div className="mt-2 text-sm text-gray-600 text-center">
                Showing {calls.length} calls of {pagination.totalCount} total
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CallHistory;
