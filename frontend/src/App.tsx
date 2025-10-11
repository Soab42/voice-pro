import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { CallCenter } from "./components/CallCenter";
import SingleCall from "./components/SingleCall";
import Dialer from "./components/Dialer";
import Queue from "./components/Queue";
import CallHistory from "./components/CallHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CallCenter />} />
        <Route path="call/:id" element={<SingleCall />} />
        <Route path="dialer" element={<Dialer />} />
        <Route path="queue" element={<Queue />} />
        <Route path="history" element={<CallHistory />} />
      </Route>
    </Routes>
  );
}

export default App;
