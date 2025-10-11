import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, Phone, Delete } from "lucide-react";

const DialerPanel = ({
  dialedNumber,
  handleNumpadClick,
  handleCall,
  handleDelete,
  isCalling,
  error,
}) => (
  <div className="flex flex-col items-center space-y-2 z-10 mx-auto justify-end pb-10 lg:pb-20">
        <Input
      className="text-center !text-3xl h-28 w-full bg-transparent border-none tracking-wider"
      value={dialedNumber}
      readOnly
      placeholder="(123) 456-7890"
    />
    {error && <div className="text-red-500 text-sm my-2">{error}</div>}
    <div className="grid grid-cols-3 w-full gap-4 lg:gap-10">
      <NumpadButton number="1" letters=" " onClick={handleNumpadClick} />
      <NumpadButton number="2" letters="ABC" onClick={handleNumpadClick} />
      <NumpadButton number="3" letters="DEF" onClick={handleNumpadClick} />
      <NumpadButton number="4" letters="GHI" onClick={handleNumpadClick} />
      <NumpadButton number="5" letters="JKL" onClick={handleNumpadClick} />
      <NumpadButton number="6" letters="MNO" onClick={handleNumpadClick} />
      <NumpadButton number="7" letters="PQRS" onClick={handleNumpadClick} />
      <NumpadButton number="8" letters="TUV" onClick={handleNumpadClick} />
      <NumpadButton number="9" letters="WXYZ" onClick={handleNumpadClick} />
      <NumpadButton number="*" letters="" onClick={handleNumpadClick} />
      <NumpadButton number="0" letters="" onClick={handleNumpadClick} />
      <NumpadButton number="#" letters="" onClick={handleNumpadClick} />
    </div>
    <div className="flex items-center justify-between w-full mt-2 px-4 lg:px-16">
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-full w-20 h-20 lg:w-36 lg:h-36 transition-opacity ${
          dialedNumber ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => handleNumpadClick("+")}
      >
        <Plus />
      </Button>
            <Button
        size="lg"
        className="rounded-full w-24 h-24 lg:w-28 lg:h-28 bg-green-500 hover:bg-green-600 text-white"
        onClick={handleCall}
        disabled={!dialedNumber || isCalling}
      >
        <Phone />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-full w-20 h-20 lg:w-36 lg:h-36 transition-opacity ${
          dialedNumber ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleDelete}
        disabled={!dialedNumber}
      >
        <Delete />
      </Button>
    </div>
  </div>
);

export default DialerPanel;

const NumpadButton = ({ number, letters, onClick }) => (
  <Button
    variant="outline"
    className="w-20 h-20 lg:w-28 lg:h-28 rounded-full text-2xl lg:text-4xl flex flex-col bg-white/5 backdrop-blur-sm"
    onClick={() => onClick(number)}
  >
    <div>{number}</div>
    {letters && <div className="text-xs">{letters}</div>}
  </Button>
);
