import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowLeftRight,
  Landmark,
  Wallet,
  ListOrdered,
  Brain,
  ShieldCheck,
  BarChart3,
  Globe,
  Bot,
  Settings,
  Activity
} from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Clients', icon: <Users size={18} /> },
    { name: 'Accounts', icon: <CreditCard size={18} /> },
    { name: 'Transfers', icon: <ArrowLeftRight size={18} /> },
    { name: 'Vaults', icon: <Landmark size={18} /> },
    { name: 'Digital Assets', icon: <Wallet size={18} /> },
    { name: 'Transactions', icon: <ListOrdered size={18} /> },
    { name: 'AI Center', icon: <Brain size={18} /> },
    { name: 'Security', icon: <ShieldCheck size={18} /> },
    { name: 'Reports', icon: <BarChart3 size={18} /> },
    { name: 'World Map', icon: <Globe size={18} /> },
    { name: 'Automation', icon: <Bot size={18} /> },
    { name: 'Settings', icon: <Settings size={18} /> },
    { name: 'System Health', icon: <Activity size={18} /> },
  ];

  return (
    <div className={`bg-[#0a0f1a] text-white flex flex-col h-screen ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300`}>
      
      <div className="p-4 font-bold text-lg border-b border-gray-700">
        Elite Global Bank
      </div>

      <ul className="flex-1 p-2 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-3 p-2 rounded hover:bg-[#111827] cursor-pointer transition"
          >
            {item.icon}
            {!collapsed && <span>{item.name}</span>}
          </li>
        ))}
      </ul>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded transition"
        >
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>

    </div>
  );
}
