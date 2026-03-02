import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LiveMeters from './components/LiveMeters';
import BankTotals from './components/BankTotals';
import SecurityAlerts from './components/SecurityAlerts';
import TransactionFeed from './components/TransactionFeed';
import AIDecisionPanel from './components/AIDecisionPanel';

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f1a] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header />
        <main className="flex-1 p-4 space-y-4">
          <LiveMeters />
          <BankTotals />
          <SecurityAlerts />
          <TransactionFeed />
          <AIDecisionPanel />
        </main>
      </div>
    </div>
  );
}
