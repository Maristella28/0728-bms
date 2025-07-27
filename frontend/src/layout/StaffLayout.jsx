// StaffLayout.jsx
import React from 'react';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const StaffLayout = () => {
  return (
    <>
      <Navbar />
      <Sidebar role="staff" />
      <main className="bg-gray-100 min-h-screen ml-64 pt-20 p-6">
        <Outlet />
      </main>
    </>
  );
};

export default StaffLayout;
