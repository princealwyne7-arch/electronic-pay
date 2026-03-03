import React from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowLeftRight,
  Vault,
  Coins,
  Receipt,
  Cpu,
  ShieldCheck,
  FileText,
  Globe,
  Bot,
  Settings,
  Activity,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Sidebar({ collapsed, setCollapsed }) {
  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Clients", icon: <Users size={20} /> },
    { name: "Accounts", icon: <CreditCard size={20} /> },
    { name: "Transfers", icon: <ArrowLeftRight size={20} /> },
    { name: "Vaults", icon: <Vault size={20} /> },
    { name: "Digital Assets", icon: <Coins size={20} /> },
    { name: "Transactions", icon: <Receipt size={20} /> },
    { name: "AI Center", icon: <Cpu size={20} /> },
    { name: "Security", icon: <ShieldCheck size={20} /> },
    { name: "Reports", icon: <FileText size={20} /> },
    { name: "World Map", icon: <Globe size={20} /> },
    { name: "Automation", icon: <Bot size={20} /> },
    { name: "Settings", icon: <Settings size={20} /> },
    { name: "System Health", icon: <Activity size={20} /> },
  ];

  return (
    <div
      className={`bg-[#0a0f1a] border-r border-gray-800 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Collapse Button */}
      <div className="flex justify-end p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu */}
      <div className="space-y-2 px-2">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#111827] cursor-pointer transition"
          >
            {item.icon}
            {!collapsed && <span>{item.name}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
