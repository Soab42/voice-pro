import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import React, { useEffect } from "react";
import { getSocket } from "../../lib/socket";
import { useCall } from "../context/CallContext";
import { CallNotification } from "./CallNotification";
import { getCall } from "../../lib/api";

const Layout = () => {
  const { setIncomingCall } = useCall();

  useEffect(() => {
    const socket = getSocket();

    const handleCallUpdate = async (update: any) => {
      console.log('callUpdate event received in Layout.tsx', update);
      if (update.status === 'RINGING') {
        const call = await getCall(update.id);
        setIncomingCall(call);
      }
    };

    socket.on('callUpdate', handleCallUpdate);

    return () => {
      socket.off('callUpdate', handleCallUpdate);
    };
  }, [setIncomingCall]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navigation />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      <CallNotification />
    </div>
  );
};

export default Layout;
