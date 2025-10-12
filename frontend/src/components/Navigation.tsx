import {
  Bell,
  Building2,
  LogOut,
  Menu,
  Phone,
  Settings,
  X,
  Users,
  PhoneCall,
  History,
} from "lucide-react";
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

import { UserProfileSection } from "./UserProfileSection";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { id: "callcenter", label: "Call Center", icon: Phone, path: "/" },
    { id: "dialer", label: "Dialer", icon: PhoneCall, path: "/dialer" },
    { id: "queue", label: "Queue", icon: Users, path: "/queue" },
    { id: "history", label: "History", icon: History, path: "/history" },
  ];

  const NavItems = () => (
    <>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Button
            key={item.id}
            variant={isActive ? "secondary" : "ghost"}
            className={`w-full justify-start ${
              isActive
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            asChild
          >
            <Link to={item.path}>
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          </Button>
        );
      })}
    </>
  );

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="inset-y-0 relative h-screen left-0 w-64 bg-white border-r border-gray-200 z-40">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-indigo-600 rounded-lg p-2 mr-3">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl text-gray-900">Voice Pro</h1>
              <p className="text-sm text-gray-500">{user?.company}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <NavItems />
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <UserProfileSection />
        </div>
      </div>
    </>
  );
}
