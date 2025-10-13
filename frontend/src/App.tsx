import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { CallCenter } from "./components/CallCenter";
import SingleCall from "./components/SingleCall";
import Dialer from "./components/Dialer";
import Queue from "./components/Queue";
import CallHistory from "./components/CallHistory";
import WebhookInspector from "./components/WebhookInspector";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Register from "./components/Register";
import PublicRoute from "./components/PublicRoute";

import { CallProvider } from "./context/CallContext";

function App() {
  return (
    <CallProvider>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dialer />} />
          <Route path="call/:id" element={<SingleCall />} />
          <Route path="dialer" element={<Dialer />} />
          <Route path="queue" element={<Queue />} />
          <Route path="history" element={<CallHistory />} />
          <Route path="webhook-inspector" element={<WebhookInspector />} />
        </Route>
      </Routes>
    </CallProvider>
  );
}

export default App;
