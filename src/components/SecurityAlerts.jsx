import React from 'react';

const alerts = [
  { level: 'HIGH', message: 'Suspicious Login: John Doe' },
  { level: 'MED', message: 'Multiple PIN Attempts: Client 0722' },
  { level: 'LOW', message: 'New Device Login: Mary W' },
];

export default function SecurityAlerts() {
  return (
    <div className="bg-[#0f172a] p-4 m-4 rounded shadow text-white">
      <h2 className="text-xl font-bold mb-2">Security Alerts</h2>
      <ul>
        {alerts.map((a, idx) => (
          <li key={idx} className={`p-2 my-2 rounded ${a.level === 'HIGH' ? 'bg-red-600' : a.level === 'MED' ? 'bg-yellow-500' : 'bg-green-500'} flex justify-between`}>
            <span>{a.message}</span>
            <div className="flex gap-2">
              <button className="bg-gray-800 px-2 rounded hover:bg-gray-700">Investigate</button>
              <button className="bg-gray-800 px-2 rounded hover:bg-gray-700">Block</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
