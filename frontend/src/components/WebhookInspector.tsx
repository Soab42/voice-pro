import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import {
  listWebhookRequests,
  deleteWebhookRequest,
  clearAllWebhookRequests,
  WebhookRequest as ApiWebhookRequest,
  PaginatedWebhookRequests,
} from "../../lib/api";
import {
  Trash2,
  Copy,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { getSocket } from "../../lib/socket";

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
};

const formatJson = (jsonString: string) => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonString;
  }
};

const WebhookInspector = () => {
  const [webhookData, setWebhookData] =
    useState<PaginatedWebhookRequests | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] =
    useState<ApiWebhookRequest | null>(null);
  const [limit] = useState(10);
  const [liveRequests, setLiveRequests] = useState<ApiWebhookRequest[]>([]);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [newRequestCount, setNewRequestCount] = useState(0);

  const fetchWebhookRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listWebhookRequests(currentPage, limit);
      setWebhookData(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load webhook requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhookRequests();
  }, [currentPage, limit]);

  // Set up real-time socket listeners
  useEffect(() => {
    const socket = getSocket();

    const handleWebhookReceived = (data: any) => {
      console.log("New webhook received:", data);

      // Create a new webhook request object from the socket data
      const newRequest: ApiWebhookRequest = {
        id: data.id,
        method: data.method,
        url: data.url,
        headers: JSON.stringify(data.headers),
        body: JSON.stringify(data.body),
        sourceIp: data.sourceIp,
        userAgent: data.userAgent,
        timestamp: data.timestamp,
        processed: false,
        error: undefined,
      };

      // Add to live requests and update UI
      setLiveRequests((prev) => [newRequest, ...prev.slice(0, 9)]); // Keep only latest 10

      // Increment new request counter
      setNewRequestCount((prev) => prev + 1);

      // Also add to the main webhook data if we're on the first page
      if (currentPage === 1 && webhookData) {
        setWebhookData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            webhookRequests: [
              newRequest,
              ...prev.webhookRequests.slice(0, limit - 1),
            ],
          };
        });
      }
    };

    const handleWebhookProcessed = (data: any) => {
      console.log("Webhook processed:", data);

      // Update the request status in live requests
      setLiveRequests((prev) =>
        prev.map((req) =>
          req.id === data.id ? { ...req, processed: true } : req
        )
      );

      // Update in main webhook data
      setWebhookData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          webhookRequests: prev.webhookRequests.map((req) =>
            req.id === data.id ? { ...req, processed: true } : req
          ),
        };
      });

      // Update selected request if it's the one that was processed
      if (selectedRequest?.id === data.id) {
        setSelectedRequest((prev) =>
          prev ? { ...prev, processed: true } : prev
        );
      }
    };

    const handleWebhookError = (data: any) => {
      console.log("Webhook error:", data);

      // Update the request status in live requests
      setLiveRequests((prev) =>
        prev.map((req) =>
          req.id === data.id
            ? { ...req, processed: true, error: data.error }
            : req
        )
      );

      // Update in main webhook data
      setWebhookData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          webhookRequests: prev.webhookRequests.map((req) =>
            req.id === data.id
              ? { ...req, processed: true, error: data.error }
              : req
          ),
        };
      });

      // Update selected request if it's the one that had an error
      if (selectedRequest?.id === data.id) {
        setSelectedRequest((prev) =>
          prev ? { ...prev, processed: true, error: data.error } : prev
        );
      }
    };

    const handleConnect = () => {
      console.log("Socket connected for webhook inspection");
      setIsLiveConnected(true);
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected for webhook inspection");
      setIsLiveConnected(false);
    };

    // Set up event listeners
    socket.on("webhookReceived", handleWebhookReceived);
    socket.on("webhookProcessed", handleWebhookProcessed);
    socket.on("webhookError", handleWebhookError);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Check initial connection status
    setIsLiveConnected(socket.connected);

    // Cleanup function
    return () => {
      socket.off("webhookReceived", handleWebhookReceived);
      socket.off("webhookProcessed", handleWebhookProcessed);
      socket.off("webhookError", handleWebhookError);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [currentPage, webhookData, selectedRequest, limit]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      await deleteWebhookRequest(id);
      await fetchWebhookRequests();
      if (selectedRequest?.id === id) {
        setSelectedRequest(null);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to delete webhook request");
    }
  };

  const handleClearAll = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all webhook requests? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await clearAllWebhookRequests();
      await fetchWebhookRequests();
      setSelectedRequest(null);
    } catch (e: any) {
      setError(e?.message || "Failed to clear webhook requests");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadRequest = (request: ApiWebhookRequest) => {
    const data = {
      method: request.method,
      url: request.url,
      headers: JSON.parse(request.headers),
      body: JSON.parse(request.body),
      timestamp: request.timestamp,
      sourceIp: request.sourceIp,
      userAgent: request.userAgent,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webhook-${request.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const webhookRequests = webhookData?.webhookRequests || [];
  const pagination = webhookData?.pagination;

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              Webhook Inspector
              <div className="flex items-center gap-2">
                {isLiveConnected ? (
                  <Badge className="bg-green-100 text-green-700">
                    <Wifi className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700">
                    <WifiOff className="w-3 h-3 mr-1" />
                    Offline
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchWebhookRequests}
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={webhookRequests.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Monitor and inspect incoming webhook requests from Telnyx in
            real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Live Recent Requests */}
          {liveRequests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                Recent Live Requests
                <Badge className="bg-blue-100 text-blue-700">
                  {liveRequests.length}
                </Badge>
                {newRequestCount > 0 && (
                  <Badge className="bg-green-100 text-green-700 animate-pulse">
                    +{newRequestCount} new
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewRequestCount(0)}
                  className="ml-2"
                >
                  Clear
                </Button>
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {liveRequests.map((request, index) => (
                  <div
                    key={request.id}
                    className={`p-2 border rounded cursor-pointer transition-colors ${
                      selectedRequest?.id === request.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    } ${
                      index === 0 && newRequestCount > 0
                        ? "ring-2 ring-green-200"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedRequest(request);
                      if (index === 0 && newRequestCount > 0) {
                        setNewRequestCount(0); // Reset counter when user clicks the new request
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            request.method === "POST" ? "default" : "secondary"
                          }
                        >
                          {request.method}
                        </Badge>
                        <span className="text-sm font-medium truncate max-w-xs">
                          {request.url}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.processed ? (
                          request.error ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )
                        ) : (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        )}
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(request.timestamp)}
                        </span>
                      </div>
                    </div>
                    {request.error && (
                      <div className="text-xs text-red-600 mt-1">
                        Error: {request.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Requests</h3>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : webhookRequests.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No webhook requests received yet
                </div>
              ) : (
                <div className="space-y-3 h-[calc(60vh)] overflow-y-auto">
                  {webhookRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedRequest?.id === request.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant={
                            request.method === "POST" ? "default" : "secondary"
                          }
                        >
                          {request.method}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {request.processed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(request.timestamp)}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {request.url}
                      </div>
                      {request.sourceIp && (
                        <div className="text-xs text-gray-500 mt-1">
                          {request.sourceIp}
                        </div>
                      )}
                      {request.error && (
                        <div className="text-xs text-red-600 mt-1">
                          Error: {request.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            pagination.hasPrev &&
                            handlePageChange(currentPage - 1)
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
                            pagination.hasNext &&
                            handlePageChange(currentPage + 1)
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
                    Showing {webhookRequests.length} requests of{" "}
                    {pagination.totalCount} total
                  </div>
                </div>
              )}
            </div>

            {/* Request Details */}
            <div className="">
              {selectedRequest ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Request Details</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(
                              {
                                method: selectedRequest.method,
                                url: selectedRequest.url,
                                headers: JSON.parse(selectedRequest.headers),
                                body: JSON.parse(selectedRequest.body),
                              },
                              null,
                              2
                            )
                          )
                        }
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadRequest(selectedRequest)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRequest(selectedRequest.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="headers">Headers</TabsTrigger>
                      <TabsTrigger value="body">Body</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-4">
                      <div className="space-y-3 h-[calc(60vh)]">
                        <div>
                          <label className="text-sm font-medium">Method</label>
                          <div className="mt-1">
                            <Badge
                              variant={
                                selectedRequest.method === "POST"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {selectedRequest.method}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">URL</label>
                          <div className="mt-1 p-2 bg-gray-50 rounded text-sm break-all">
                            {selectedRequest.url}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Timestamp
                          </label>
                          <div className="mt-1 text-sm text-gray-600">
                            {formatTimestamp(selectedRequest.timestamp)}
                          </div>
                        </div>
                        {selectedRequest.sourceIp && (
                          <div>
                            <label className="text-sm font-medium">
                              Source IP
                            </label>
                            <div className="mt-1 text-sm text-gray-600">
                              {selectedRequest.sourceIp}
                            </div>
                          </div>
                        )}
                        {selectedRequest.userAgent && (
                          <div>
                            <label className="text-sm font-medium">
                              User Agent
                            </label>
                            <div className="mt-1 text-sm text-gray-600 break-all">
                              {selectedRequest.userAgent}
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium">Status</label>
                          <div className="mt-1">
                            {selectedRequest.processed ? (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Processed
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-700">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Processing
                              </Badge>
                            )}
                          </div>
                        </div>
                        {selectedRequest.error && (
                          <div>
                            <label className="text-sm font-medium">Error</label>
                            <div className="mt-1 text-sm text-red-600">
                              {selectedRequest.error}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="headers" className="mt-4">
                      <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto h-[calc(60vh)]">
                        {formatJson(selectedRequest.headers)}
                      </pre>
                    </TabsContent>

                    <TabsContent value="body" className="mt-4">
                      <pre className="bg-gray-50  p-4 rounded text-sm overflow-auto h-[calc(60vh)]">
                        {formatJson(selectedRequest.body)}
                      </pre>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Select a webhook request to view details
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookInspector;
