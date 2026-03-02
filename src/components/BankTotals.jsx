import React from 'react';

export default function BankTotals() {
  const totals = {
    available: 'KES 1.90B',
    reserved: 'KES 200M',
    frozen: 'KES 80M',
    moving: 'KES 258.92M',
    total: 'KES 2,439,007,913',
  };

  return (
    <div className="bg-[#0f172a] p-4 m-4 rounded shadow text-white">
      <h2 className="text-xl font-bold mb-2">Total Bank Money: {totals.total}</h2>
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(totals).map(([key, value]) => (
          <div key={key} className="bg-[#112244] p-4 rounded text-center">
            <p className="text-gray-300">{key.toUpperCase()}</p>
            <p className="text-lg font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
