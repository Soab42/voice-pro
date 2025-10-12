import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Phone, Delete, Clock, Plus } from "lucide-react";
import Directory from "./Directory";
import { createOutboundCall } from "../../lib/api";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import DialerPanel from "./DialerPanel";
import HistoryPanel from "./HistoryPanel";

const Dialer = () => {
  const [dialedNumber, setDialedNumber] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleNumpadClick = (number) => {
    setDialedNumber((prev) => prev + number);
  };

  const handleDelete = () => {
    setDialedNumber((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setDialedNumber("");
  };

    const handleCall = async () => {
    if (!dialedNumber || isCalling) return;

    const numberToCall = dialedNumber.startsWith("+")
      ? dialedNumber
      : `+${dialedNumber}`;

    try {
      setIsCalling(true);
      setError(null);
      const { id: callId } = await createOutboundCall(numberToCall);
      // Navigate to the call screen with the new call ID
      navigate(`/call/${callId}`);
    } catch (e: any) {
      setError(e?.message || "Failed to start call");
    } finally {
      setIsCalling(false);
    }
  };

  const handleSelectContact = (contact) => {
    setDialedNumber(contact.number);
  };

  return (
    <div className="h-full w-full">
      {/* <div className='fixed left-0 right-0 top-0 bg-gradient-to-br from-pink-100 to-emerald-300 h-full'/> */}

      {/* Desktop Layout */}
      <div className="  grid grid-cols-3 gap-4 w-full h-full">
        <div className="z-10">
          <HistoryPanel />
        </div>
        <DialerPanel
          dialedNumber={dialedNumber}
          handleNumpadClick={handleNumpadClick}
          handleCall={handleCall}
          handleDelete={handleDelete}
          handleClear={handleClear}
          isCalling={isCalling}
          error={error}
        />
        <div className="z-10">
          <Directory onSelectContact={handleSelectContact} />
        </div>
      </div>

      {/* Mobile Layout */}
      {/* <div className="block lg:hidden p-4 z-10">
        <Tabs defaultValue="dialer" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="dialer">Dialer</TabsTrigger>
            <TabsTrigger value="directory">Directory</TabsTrigger>
          </TabsList>
          <TabsContent value="dialer">
            <DialerPanel dialedNumber={dialedNumber} handleNumpadClick={handleNumpadClick} handleCall={handleCall} handleDelete={handleDelete} />
          </TabsContent>
          <TabsContent value="history">
            <HistoryPanel />
          </TabsContent>
          <TabsContent value="directory">
            <Directory onSelectContact={handleSelectContact} />
          </TabsContent>
        </Tabs>
      </div> */}
    </div>
  );
};

export default Dialer;
