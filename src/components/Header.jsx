import React, { useEffect, useState } from 'react';

export default function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#0f172a] text-white flex justify-between items-center p-4 shadow-md">
      <div>
        <span className="mr-4">SYSTEM: ACTIVE</span>
        <span className="mr-4">SECURITY: HIGH</span>
        <span>AI: RUNNING</span>
      </div>
      <div>{time.toLocaleString()}</div>
    </header>
  );
}
