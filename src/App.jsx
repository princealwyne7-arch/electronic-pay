import React from "react";
import Sidebar from "./components/Sidebar";
import MainDashboard from "./components/MainDashboard";

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a]">
      <Sidebar />
      <MainDashboard />
    </div>
  );
}
