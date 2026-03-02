import React, { useState, useEffect } from 'react';

export default function LiveMeters() {
  const [data, setData] = useState({ users: 1284, tps: 42, activeTransfers: 142, fraud: 3 });

  useEffect(() => {
    const interval = setInterval(() => {
      setData({
        users: 1000 + Math.floor(Math.random() * 500),
        tps: 30 + Math.floor(Math.random() * 20),
        activeTransfers: 100 + Math.floor(Math.random() * 50),
        fraud: Math.floor(Math.random() * 5),
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { label: 'Users Online', value: data.users },
    { label: 'Transactions/sec', value: data.tps },
    { label: 'Active Transfers', value: data.activeTransfers },
    { label: 'Fraud Alerts', value: data.fraud },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {cards.map(c => (
        <div key={c.label} className="bg-[#112244] p-4 rounded shadow hover:shadow-lg transition">
          <h3 className="text-gray-300">{c.label}</h3>
          <p className="text-2xl font-bold">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
