import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import Numbers from "./Numbers";
import {
  Bot,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  PhoneCall,
  Star,
  TrendingUp,
} from "lucide-react";
import { getCalls, Call } from "../../lib/api";
import { getSocket } from "../../lib/socket";

export function CallCenter() {
  const navigate = useNavigate();
  const [incomingCalls, setIncomingCalls] = useState<Call[]>([]);
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);

  const callStats = [
    {
      title: "Calls Today",
      value: "23",
      change: "+5",
      icon: Phone,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Avg Call Duration",
      value: "4m 32s",
      change: "-30s",
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Resolution Rate",
      value: "89%",
      change: "+3%",
      icon: CheckCircle2,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Customer Satisfaction",
      value: "4.7/5",
      change: "+0.2",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  const loadCalls = async () => {
    try {
      const calls = await getCalls();
      console.log("calls", calls);

      setIncomingCalls(calls.filter((c) => c.status === "RINGING"));
      setRecentCalls(calls.filter((c) => c.status === "COMPLETED"));
    } catch (error) {
      console.error("Failed to load calls", error);
    }
  };

  useEffect(() => {
    loadCalls();

    const socket = getSocket();
    const handleCallUpdate = (update: any) => {
      console.log("callUpdate event received in CallCenter.tsx", update);
      loadCalls();
    };

    socket.on("callUpdate", handleCallUpdate);

    return () => {
      socket.off("callUpdate", handleCallUpdate);
    };
  }, []);

  const handleAnswerCall = (call: Call) => {
    navigate(`/call/${call.id}`, { state: { call } });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Call Center</h1>
          <p className="text-gray-600">
            Manage customer calls with AI-powered assistance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate("/dialer")}>
            <Phone className="mr-2 h-4 w-4" />
            Make Call
          </Button>
          <Button>
            <PhoneCall className="mr-2 h-4 w-4" />
            Answer Queue
          </Button>
        </div>
      </div>

      {/* Call Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {callStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {stat.change} from yesterday
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Call Queue</TabsTrigger>
          <TabsTrigger value="recent">Recent Calls</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="numbers">Numbers</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incoming Calls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Incoming Calls
                  <Badge variant="destructive">{incomingCalls.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Customers waiting to be served
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {incomingCalls.map((call) => (
                  <div
                    key={call.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm mb-1">{call.customerName}</h4>
                        <p className="text-xs text-gray-600 mb-1">
                          {call.customerNumber}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{call.accountType}</Badge>
                          <Badge
                            className={
                              call.priority === "High"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {call.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-red-600">
                          Wait: {call.waitTime}
                        </p>
                        <p className="text-xs text-gray-500">{call.issue}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAnswerCall(call)}
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Answer
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Assistant Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="mr-2 h-5 w-5 text-purple-600" />
                  AI Call Assistant
                </CardTitle>
                <CardDescription>
                  Real-time assistance for better customer service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="text-sm text-purple-900 mb-2">Features</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Real-time script suggestions</li>
                    <li>• Customer history insights</li>
                    <li>• Auto-form filling</li>
                    <li>• Sentiment analysis</li>
                    <li>• Smart escalation rules</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm text-blue-900 mb-2">
                    Today's AI Insights
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 15% faster call resolution</li>
                    <li>• 89% customer satisfaction</li>
                    <li>• 3 upsells identified</li>
                  </ul>
                </div>

                <Button className="w-full">
                  <Bot className="mr-2 h-4 w-4" />
                  Enable AI Assistant
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Calls</CardTitle>
              <CardDescription>Your call history and outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCalls.map((call) => (
                  <div
                    key={call.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-sm">{call.customerName}</h4>
                          <Badge variant="secondary">{call.type}</Badge>
                          <Badge
                            className={
                              call.outcome === "Resolved"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {call.outcome}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {call.notes}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {call.duration}
                          </span>
                          <span>{call.timestamp}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < call.rating
                                  ? "text-yellow-500 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <Button variant="outline" size="sm">
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Call Volume Trends</CardTitle>
                <CardDescription>
                  Daily call volume and patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Call analytics chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Agent performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Handle Time</span>
                    <span className="text-sm">4m 32s</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "75%" }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">First Call Resolution</span>
                    <span className="text-sm">89%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "89%" }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Customer Satisfaction</span>
                    <span className="text-sm">4.7/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{ width: "94%" }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Center Settings</CardTitle>
              <CardDescription>
                Configure your call center preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3>AI Assistant Settings</h3>
                <div className="space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      Enable real-time suggestions
                    </span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-fill customer data</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sentiment analysis alerts</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </div>

              <div>
                <h3>Call Routing</h3>
                <div className="space-y-3 mt-3">
                  <div>
                    <Label htmlFor="queue-timeout">
                      Queue timeout (minutes)
                    </Label>
                    <Input
                      id="queue-timeout"
                      type="number"
                      defaultValue="5"
                      className="w-24"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Automatic call distribution</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </div>

              <div>
                <h3>Recording & Compliance</h3>
                <div className="space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Record all calls</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quality monitoring</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="numbers">
          <Numbers />
        </TabsContent>
      </Tabs>
    </div>
  );
}
