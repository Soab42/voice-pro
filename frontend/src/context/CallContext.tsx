import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Call } from "../../lib/api";
import { getSocket } from "../../lib/socket";

interface CallContextType {
  incomingCall: Call | null;
  setIncomingCall: (call: Call | null) => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider = ({ children }: { children: ReactNode }) => {
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);

  // add useEffect to load incoming call
  useEffect(() => {
    const socket = getSocket();
    socket.on("callUpdate", (call: Call) => {
      if (call.status === "RINGING") {
        setIncomingCall(call);
      }
    });
    return () => {
      socket.off("callUpdate");
    };
  }, []);

  return (
    <CallContext.Provider value={{ incomingCall, setIncomingCall }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};
