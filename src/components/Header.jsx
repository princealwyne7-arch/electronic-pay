import React, { useEffect, useState } from "react";

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center justify-between bg-[#0a0f1a] text-white p-4 border-b border-gray-800">
      {/* Bank Name */}
      <div className="text-xl font-bold">Elite Global Bank</div>

      {/* Live Date & Time */}
      <div className="font-mono text-sm">
        {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
      </div>

      {/* Engine Status (small indicators) */}
      <div className="flex items-center gap-4">
        <div className="text-green-400 text-xs font-bold">SECURITY ACTIVE</div>
        <div className="text-green-400 text-xs font-bold">SYSTEM ACTIVE</div>
        <div className="text-green-400 text-xs font-bold">AI RUNNING</div>
      </div>
    </header>
  );
}
