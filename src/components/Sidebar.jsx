import React, { useState } from 'react';
import { LayoutDashboard, Users, CreditCard, Bank, Globe, Cpu, ShieldCheck } from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Clients', icon: <Users size={18} /> },
    { name: 'Accounts', icon: <CreditCard size={18} /> },
    { name: 'Transfers', icon: <Bank size={18} /> },
    { name: 'Vault', icon: <ShieldCheck size={18} /> },
    { name: 'World Map', icon: <Globe size={18} /> },
    { name: 'System Health', icon: <Cpu size={18} /> },
  ];

  return (
    <div className={`bg-[#0a0f1a] text-white flex flex-col h-screen transition-all ${collapsed ? 'w-20' : 'w-60'}`}>
      <div className="p-4 font-bold text-lg border-b border-gray-800 cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? 'AI' : 'AI COMMAND CENTER'}
      </div>
      <nav className="flex-1 mt-4">
        {menuItems.map(item => (
          <div key={item.name} className="flex items-center gap-3 p-3 hover:bg-[#112244] cursor-pointer">
            {item.icon}
            {!collapsed && <span>{item.name}</span>}
          </div>
        ))}
      </nav>
    </div>
  );
}
