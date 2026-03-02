import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function AIDecisionPanel() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Fraud risk rising in mobile transfers. Recommended: Increase auth layer.');

  const handleApply = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); alert('Fix Applied!'); }, 2000);
  };

  const handleAnalyze = () => {
    alert('Analysis Complete: No anomalies found.');
  };

  return (
    <div className="bg-[#0f172a] p-4 m-4 rounded shadow text-white">
      <h2 className="text-xl font-bold mb-2">AI Decision Panel</h2>
      <p className="mb-4">{message}</p>
      <div className="flex gap-4">
        <button onClick={handleApply} className="bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-500 flex items-center gap-2">
          {loading && <Loader2 className="animate-spin" />}
          Apply Fix
        </button>
        <button onClick={handleAnalyze} className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-500">Analyze</button>
      </div>
    </div>
  );
}
