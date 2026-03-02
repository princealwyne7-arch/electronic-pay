import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, CreditCard, ShieldAlert, 
  Globe, Zap, Cpu, Activity, Database, Bell, Settings,
  ArrowUpRight, ArrowDownLeft, ShieldCheck, ZapOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [data, setData] = useState({
    tps: 38,
    money: 2438920440,
    alerts: 3,
    cpu: 43,
    memory: 62
  });

  // Simulated Real-time Data Stream
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        tps: Math.floor(Math.random() * (45 - 30) + 30),
        money: prev.money + Math.floor(Math.random() * 5000),
        cpu: Math.floor(Math.random() * (48 - 41) + 41)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = (msg) => alert(`AI Command: ${msg} initiated.`);

  return (
    <div className="flex h-screen bg-[#020408] text-gray-100 font-sans overflow-hidden">
      {/* Sidebar (A) */}
      <aside className="w-[240px] border-r border-cyan-900/30 bg-[#0A0E14] p-4 flex flex-col gap-6">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Database size={18} className="text-black" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tighter uppercase leading-none">AI Command</h1>
            <span className="text-[10px] text-cyan-500 font-mono">GLOBAL DIGITAL BANK</span>
          </div>
        </div>
        
        <nav className="space-y-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" active />
          <NavItem icon={Users} label="Clients" />
          <NavItem icon={CreditCard} label="Accounts" />
          <NavItem icon={ArrowUpRight} label="Transfers" />
          <NavItem icon={ShieldCheck} label="Vault" />
          <NavItem icon={Globe} label="World Map" />
        </nav>

        <div className="mt-auto border-t border-gray-800 pt-4">
          <div className="text-[10px] text-gray-500 mb-2 px-2 uppercase font-bold">System Health</div>
          <HealthRing label="CPU" percent={data.cpu} color="text-cyan-400" />
          <HealthRing label="Memory" percent={data.memory} color="text-yellow-400" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Header Status Bar */}
        <header className="flex justify-between items-center bg-[#0A0E14] border border-cyan-900/20 p-3 rounded-lg">
          <div className="flex gap-6 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> SYSTEM: ACTIVE</span>
            <span className="flex items-center gap-1 text-red-500">● SECURITY: HIGH</span>
            <span className="flex items-center gap-1 text-purple-400">● AI: RUNNING</span>
          </div>
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
            25 FEB 2026 | 14:32:18 (EAT)
          </div>
        </header>

        {/* Live Meters (B) */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Users Online" value="1,284" icon={Users} color="cyan" />
          <StatCard label="Transactions/Sec" value={`${data.tps} TPS`} icon={Zap} color="cyan" />
          <StatCard label="Active Transfers" value="142" icon={ArrowUpRight} color="yellow" />
          <StatCard label="Fraud Alerts" value={data.alerts} icon={ShieldAlert} color="red" />
        </div>

        {/* Central Hub: Money (C) & Security (D) */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 bg-[#0A0E14] border border-cyan-900/20 p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Database size={120}/></div>
            <h3 className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2 font-bold">Total Bank Money</h3>
            <div className="text-4xl font-bold tracking-tight text-white mb-6">
              <span className="text-cyan-500 text-2xl mr-2">KES</span>
              {data.money.toLocaleString()}
            </div>
            <div className="grid grid-cols-4 gap-4">
              <MiniStat label="Available" value="1.90B" color="text-green-400" />
              <MiniStat label="Reserved" value="200M" color="text-yellow-500" />
              <MiniStat label="Frozen" value="80M" color="text-red-500" />
              <MiniStat label="Moving" value="258.92M" color="text-cyan-400" />
            </div>
          </div>

          <div className="col-span-4 bg-[#0A0E14] border border-red-900/20 p-4 rounded-xl">
            <h3 className="text-red-500 text-[10px] font-bold uppercase mb-4 flex items-center gap-2">
              <ShieldAlert size={14}/> Security Alerts
            </h3>
            <div className="space-y-3">
              <AlertItem level="HIGH" user="John Doe" msg="Suspicious Login" />
              <AlertItem level="MED" user="Client 0722" msg="Multiple PIN Attempts" />
              <AlertItem level="LOW" user="Mary W" msg="New Device Login" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleAction('Investigation')} className="flex-1 py-1.5 text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded hover:bg-yellow-500 hover:text-black transition-all">INVESTIGATE</button>
              <button onClick={() => handleAction('Block')} className="flex-1 py-1.5 text-[10px] font-bold bg-red-600/20 text-red-500 border border-red-500/20 rounded hover:bg-red-600 hover:text-white transition-all">BLOCK</button>
            </div>
          </div>
        </div>

        {/* Bottom Tier: Transaction Stream (E) & AI Panel (G) */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7 bg-[#0A0E14] border border-gray-800 p-4 rounded-xl overflow-hidden">
            <h3 className="text-[10px] text-gray-500 uppercase font-bold mb-3 tracking-widest">Live Transaction Stream</h3>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800 text-left">
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <TransactionRow user="John K" type="Transfer" amount="5,000" status="SUCCESS" />
                <TransactionRow user="Mary W" type="Deposit" amount="2,000" status="SUCCESS" />
                <TransactionRow user="David O" type="Withdraw" amount="15,000" status="FAILED" />
              </tbody>
            </table>
          </div>

          <div className="col-span-5 bg-gradient-to-br from-[#0A0E14] to-cyan-950/20 border border-cyan-500/20 p-4 rounded-xl relative">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-full border-2 border-cyan-500 border-dashed animate-[spin_10s_linear_infinite] p-1">
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=bankai" className="rounded-full" alt="AI"/>
              </div>
              <div className="flex-1">
                <h4 className="text-cyan-400 text-[10px] font-bold uppercase mb-1 tracking-tighter">AI Decision Panel</h4>
                <p className="text-[10px] text-gray-400 italic mb-3 leading-relaxed">"Fraud risk rising in mobile transfers. Recommended: Increase auth layer."</p>
                <div className="flex gap-2">
                  <button onClick={() => handleAction('System Fix')} className="px-4 py-1.5 bg-cyan-500 text-black font-bold text-[9px] rounded uppercase shadow-[0_0_10px_rgba(6,182,212,0.4)]">Apply Fix</button>
                  <button className="px-4 py-1.5 border border-gray-700 text-gray-400 text-[9px] rounded uppercase">Analyze</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-components
const NavItem = ({ icon: Icon, label, active }) => (
  <div className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${active ? 'bg-cyan-500/10 text-cyan-400 border-r-2 border-cyan-500' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
    <Icon size={18} />
    <span className="text-[13px] font-medium">{label}</span>
  </div>
);

const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    cyan: 'border-cyan-500 text-cyan-400',
    yellow: 'border-yellow-500 text-yellow-400',
    red: 'border-red-500 text-red-400'
  };
  return (
    <div className={`bg-[#0A0E14] border-t-2 ${colors[color]} p-4 rounded-lg shadow-xl`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-500 text-[9px] uppercase font-bold tracking-wider">{label}</span>
        <Icon size={14} className="opacity-40" />
      </div>
      <div className="text-xl font-bold tracking-tight text-white">{value}</div>
    </div>
  );
};

const MiniStat = ({ label, value, color }) => (
  <div className="bg-black/30 p-2 border border-gray-800 rounded">
    <div className="text-[8px] text-gray-500 uppercase font-bold mb-1">{label}</div>
    <div className={`text-[11px] font-bold ${color}`}>KES ${value}</div>
  </div>
);

const AlertItem = ({ level, user, msg }) => (
  <div className="flex items-center justify-between text-[10px] py-1 border-b border-gray-800/50">
    <div>
      <span className={`font-bold ${level === 'HIGH' ? 'text-red-500' : 'text-yellow-500'}`}>${level}: </span>
      <span className="text-gray-300">${msg}</span>
    </div>
    <span className="text-gray-500 italic">${user}</span>
  </div>
);

const TransactionRow = ({ user, type, amount, status }) => (
  <tr className="border-b border-gray-900 hover:bg-white/5 transition-colors">
    <td className="py-2.5 font-medium">${user}</td>
    <td className={`py-2.5 ${type === 'Withdraw' ? 'text-red-400' : 'text-cyan-400'}`}>${type}</td>
    <td className="py-2.5 text-white font-mono">KES ${amount}</td>
    <td className="py-2.5">
      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${status === 'SUCCESS' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
        ${status}
      </span>
    </td>
  </tr>
);

const HealthRing = ({ label, percent, color }) => (
  <div className="mb-3 px-2">
    <div className="flex justify-between text-[9px] mb-1">
      <span className="text-gray-500">{label}</span>
      <span className={color}>${percent}%</span>
    </div>
    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
      <div className={`h-full ${color.replace('text', 'bg')} transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);

export default Dashboard;
