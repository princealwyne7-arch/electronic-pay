import React from 'react';
import SecurityDashboard from './src/components/AI_Center/SecurityDashboard';
import './App.css'; // Assuming you have a global CSS file

const App = () => {
  return (
    <div className="App">
      {/* This positions the new AI Security Hub within your application */}
      <SecurityDashboard />
      
      {/* You can add other components here */}
    </div>
  );
};

export default App;
