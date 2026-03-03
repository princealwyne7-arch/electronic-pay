import React from "react";
import { ShieldCheck, Cpu, Database, Activity } from "lucide-react";

export default function MainDashboard() {
  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#0f172a] text-white p-6 space-y-10">

      {/* ================= CONNECTION BAR ================= */}
      <div className="h-[300px] bg-[#111827] rounded-xl p-6 grid grid-cols-5 gap-6">
        {[
          { label: "Security Engine", icon: <ShieldCheck size={20} />, status: "ACTIVE" },
          { label: "System Engine", icon: <Cpu size={20} />, status: "ACTIVE" },
          { label: "AI Engine", icon: <Activity size={20} />, status: "ACTIVE" },
          { label: "DB Connection", icon: <Database size={20} />, status: "CONNECTED" },
          { label: "Live State", icon: <Activity size={20} />, status: "ONLINE" },
        ].map((item, i) => (
          <div key={i} className="bg-[#0b1220] rounded-lg p-4 flex flex-col justify-between border border-green-500/20">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {item.icon}
              {item.label}
            </div>
            <div className="text-green-400 font-bold">{item.status}</div>
          </div>
        ))}
      </div>

      {/* ================= REAL-TIME METRICS ================= */}
      <div className="grid grid-cols-5 gap-6 h-[300px]">
        {[
          "Users Online",
          "Transactions/sec",
          "Active Transfers",
          "Fraud Alerts",
          "Security Alerts"
        ].map((label, i) => (
          <div key={i} className="bg-[#111827] rounded-xl p-6 border border-blue-500/20 flex flex-col justify-between">
            <div className="text-gray-400">{label}</div>
            <div className="text-3xl font-bold">{Math.floor(Math.random() * 5000)}</div>
          </div>
        ))}
      </div>

      {/* ================= TOTAL BANK MONEY ================= */}
      <div className="bg-[#111827] rounded-xl p-6 text-center border border-yellow-500/20">
        <div className="text-gray-400">Total Bank Holdings</div>
        <div className="text-4xl font-bold text-yellow-400 mt-2">$ 48,750,000,000</div>
      </div>

      {/* ================= FINANCIAL BREAKDOWN ================= */}
      <div className="grid grid-cols-4 gap-6">
        {["Available Money", "Reserved Money", "Frozen Money", "Moving Money"].map((label, i) => (
          <div key={i} className="bg-[#111827] rounded-xl p-6 border border-purple-500/20">
            <div className="text-gray-400">{label}</div>
            <div className="text-2xl font-bold mt-2">$ {Math.floor(Math.random() * 100000000)}</div>
          </div>
        ))}
      </div>

      {/* ================= WAVE SEPARATOR ================= */}
      <div className="h-16 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 animate-pulse rounded-xl"></div>

      {/* ================= LIVE USERS STREAM ================= */}
      <div className="bg-[#111827] rounded-xl p-6">
        <div className="text-lg font-semibold mb-4">Live Users Stream</div>
        <table className="w-full text-sm">
          <thead className="text-gray-400 border-b border-gray-700">
            <tr>
              <th className="text-left py-2">Time</th>
              <th className="text-left">User</th>
              <th className="text-left">Type</th>
              <th className="text-left">Amount</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-800">
              <td className="py-2">14:35</td>
              <td>Alex T</td>
              <td>Deposit</td>
              <td>$20,000</td>
              <td className="text-green-400">SUCCESS</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================= AI DECISION PANEL ================= */}
      <div className="bg-[#111827] rounded-xl p-6 flex justify-between items-center">
        <div className="space-y-4">
          <div className="text-lg font-semibold">AI Decision Panel</div>
          <div className="flex gap-4">
            <button className="bg-blue-600 px-4 py-2 rounded">AI Suggestion</button>
            <button className="bg-green-600 px-4 py-2 rounded">Apply Fix</button>
            <button className="bg-purple-600 px-4 py-2 rounded">Analyze</button>
            <button className="bg-red-600 px-4 py-2 rounded">Ignore</button>
          </div>
        </div>
        <div className="w-32 h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full animate-spin"></div>
      </div>

      {/* ================= SYSTEM LOGS ================= */}
      <div className="bg-[#111827] rounded-xl p-6">
        <div className="text-lg font-semibold mb-4">System Logs & Updates</div>
        <table className="w-full text-sm">
          <thead className="text-gray-400 border-b border-gray-700">
            <tr>
              <th className="text-left py-2">Time</th>
              <th className="text-left">Event</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2">14:40</td>
              <td>Security scan completed</td>
              <td className="text-green-400">OK</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================= ENCRYPTED MOVING BANK NAME ================= */}
      <div className="text-center text-lg font-mono tracking-widest text-blue-400 animate-pulse">
        🔐 ELITE GLOBAL BANK — AI POWERED ENCRYPTED CORE ACTIVE
      </div>

    </div>
  );
}
