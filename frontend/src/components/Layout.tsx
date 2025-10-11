import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import React from "react";

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navigation />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
