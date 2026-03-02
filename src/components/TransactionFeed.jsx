import React, { useState, useEffect } from 'react';

export default function TransactionFeed() {
  const [transactions, setTransactions] = useState([
    { user: 'John K', type: 'Transfer', amount: 'KES 5,000', status: 'SUCCESS' },
    { user: 'Mary W', type: 'Deposit', amount: 'KES 2,000', status: 'SUCCESS' },
    { user: 'David O', type: 'Withdraw', amount: 'KES 15,000', status: 'FAILED' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions(prev => {
        const newTx = {
          user: 'Client ' + Math.floor(Math.random() * 1000),
          type: ['Transfer','Deposit','Withdraw'][Math.floor(Math.random()*3)],
          amount: 'KES ' + (1000 + Math.floor(Math.random()*50000)),
          status: ['SUCCESS','FAILED'][Math.floor(Math.random()*2)],
        };
        return [newTx, ...prev.slice(0,4)];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0f172a] p-4 m-4 rounded shadow text-white overflow-x-auto">
      <h2 className="text-xl font-bold mb-2">Live Transaction Stream</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-700">
            <th>User</th><th>Type</th><th>Amount</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t,i) => (
            <tr key={i} className="border-b border-gray-700">
              <td>{t.user}</td>
              <td>{t.type}</td>
              <td>{t.amount}</td>
              <td>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
