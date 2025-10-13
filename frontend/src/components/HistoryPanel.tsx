import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Call, listCallHistory } from "../../lib/api";

const HistoryPanel = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMoreCalls = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setError(null);

    try {
      const data = await listCallHistory(currentPage, 20);
      setCalls((prev) => [...prev, ...data.calls]);
      setCurrentPage((prev) => prev + 1);
      setHasMore(data.pagination.hasNext);
    } catch (e: any) {
      setError(e?.message || "Failed to load more calls");
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, loadingMore, hasMore]);

  useEffect(() => {
    let mounted = true;
    // Initial load
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setCurrentPage(1);
        setCalls([]);
        setHasMore(true);
        const data = await listCallHistory(1, 20);
        if (!mounted) return;
        setCalls(data.calls);
        setCurrentPage(2);
        setHasMore(data.pagination.hasNext);
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

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMoreCalls();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore, loading, loadMoreCalls]);

  const dataToShow = useMemo<Call[]>(() => {
    return calls;
  }, [calls]);

  return (
    <Card className="h-full bg-neutral-50/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Recent Calls</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {loading && dataToShow.length === 0 && (
            <div className="text-sm text-gray-500">Loading...</div>
          )}
          {dataToShow.map((call: Call) => (
            <div
              key={call.id}
              className="flex items-center justify-between p-3 border rounded-lg mb-2"
            >
              <div className="flex-1 flex justify-between items-center">
                <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      call.direction === "outbound"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {call.direction === "outbound" ? "Outbound" : "Inbound"}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      call.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {call.status}
                  </span>
                </div>

                <p className="font-medium text-sm">
                  {call.direction === "outbound"
                    ? `To: ${call.customerNumber}`
                    : `From: ${call.customerNumber}`}
                </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(call.startedAt).toLocaleString()}
                  </div>
                  {call.endedAt && (
                    <div className="text-xs text-gray-400 mt-1">
                      Duration:{" "}
                      {Math.floor(
                        (new Date(call.endedAt).getTime() -
                          new Date(call.startedAt).getTime()) /
                          1000
                      )}
                      s
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loadingMore && (
            <div className="text-sm text-gray-500 text-center py-4">
              Loading more...
            </div>
          )}
          {!hasMore && dataToShow.length > 0 && (
            <div className="text-sm text-gray-500 text-center py-4">
              No more calls to load
            </div>
          )}
          <div ref={observerTarget} className="h-4" />
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryPanel;
