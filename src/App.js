import React from 'react';
import SecurityDashboard from './components/AI_Center/SecurityDashboard';
import { ShieldAlert, Cpu, Database } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans">
      {/* Top Navigation Bar */}
      <nav className="border-b border-white/10 p-4 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Cpu className="text-blue-500" />
            <span className="font-bold tracking-tighter text-xl">NEURAL_OS v2.0</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <span className="hover:text-blue-400 cursor-pointer">Network Status: Online</span>
            <span className="hover:text-blue-400 cursor-pointer text-green-500">System Secure</span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Stats/Design Elements */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-blue-400 text-xs font-bold uppercase mb-4 tracking-widest">Active Modules</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm italic"><Database size={16}/> Data Stream 01 - Active</li>
              <li className="flex items-center gap-3 text-sm italic"><ShieldAlert size={16}/> Security Mesh - Engaged</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Our New Security Dashboard */}
        <div className="lg:col-span-8">
          <SecurityDashboard />
        </div>
      </main>
    </div>
  );
}

export default App;
