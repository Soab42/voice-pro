import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock } from "lucide-react";
import { CallRecord } from "../data/history";
import { useEffect, useMemo, useState } from "react";
import { listCallHistory, Call as ApiCall } from "../../lib/api";

const HistoryPanel = () => {
  const [fetched, setFetched] = useState<CallRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    // If no history was provided via props, fetch from API
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listCallHistory();
        if (!mounted) return;
        const mapped: CallRecord[] = data.map((c: ApiCall) => {
          const direction = (c.direction || "").toLowerCase() as
            | "inbound"
            | "outbound";
          const from = direction === "inbound" ? c.customerNumber : "Agent";
          const to = direction === "inbound" ? "Agent" : c.customerNumber;
          const start = new Date(c.answeredAt || c.startedAt).getTime();
          const end = new Date(c.endedAt || Date.now()).getTime();
          const duration = Math.max(0, Math.floor((end - start) / 1000));
          const status: CallRecord["status"] =
            c.status === "COMPLETED" ? "completed" : "missed";
          return {
            id: c.id,
            direction,
            from,
            to,
            duration,
            date: c.startedAt,
            cost: 0,
            status,
          };
        });
        setFetched(mapped);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load call history");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const dataToShow = useMemo<CallRecord[]>(() => {
    return fetched || [];
  }, [fetched]);

  return (
    <Card className="h-full bg-neutral-50/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Recent Calls</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
        <div className="space-y-4">
          {loading && dataToShow.length === 0 && (
            <div className="text-sm text-gray-500">Loading...</div>
          )}
          {dataToShow.map((call: CallRecord) => (
            <div key={call.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {call.direction === "outbound" ? call.to : call.from}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(call.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <Badge
                variant={
                  call.status === "completed" ? "default" : "destructive"
                }
              >
                {call.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryPanel;
