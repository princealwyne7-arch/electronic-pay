import React, { useState } from 'react';
import { Shield, Brain, Activity } from 'lucide-react';
import { playAlert } from './SoundController';

const SecurityDashboard = () => {
  const [alerts, setAlerts] = useState([]);

  const triggerAlert = (msg, soundIndex) => {
    setAlerts(prev => [{ id: Date.now(), msg }, ...prev].slice(0, 5));
    playAlert(soundIndex);
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl border border-blue-500/30">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="text-blue-400" /> AI Security Hub
        </h2>
        <Brain className="text-purple-400 animate-pulse" />
      </div>

      <div className="space-y-4">
        <div className="bg-black/40 p-4 rounded-lg h-32 overflow-y-auto border border-white/5">
          {alerts.map(a => (
            <div key={a.id} className="text-xs text-red-400 font-mono mb-1">
              > [DETECTION] {a.msg}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => triggerAlert("Neural Link Established", 4)} className="bg-blue-600 p-2 rounded text-sm">Sync AI</button>
          <button onClick={() => triggerAlert("Breach Detected", 5)} className="bg-red-600 p-2 rounded text-sm">Test Threat</button>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
