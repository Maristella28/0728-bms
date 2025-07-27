// TreasurerLayout.jsx
import React from 'react';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";


const TreasurerLayout = () => (
  <div className="app-container" style={{ display: 'flex' }}>
    <Sidebar role="treasurer" />
    <div className="main-content" style={{ flex: 1 }}>
      <Navbar />
      <div className="content" style={{ padding: '1rem' }}>
        <Outlet />
      </div>
    </div>
  </div>
);

export default TreasurerLayout;
