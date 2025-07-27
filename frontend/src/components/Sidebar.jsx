import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard, Users, FileText, Home, Book,
  DollarSign, UserCog, Megaphone, Handshake, AlertTriangle,
  Boxes, Projector
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const iconSize = 18;

  const adminItems = [
    { title: "Dashboard", icon: <LayoutDashboard size={iconSize} />, path: "/admin/dashboard" },
    { title: "Residents Records", icon: <Users size={iconSize} />, path: "/admin/residentsRecords" },
    { title: "Document Records", icon: <FileText size={iconSize} />, path: "/admin/documentsRecords" },
    { title: "Household Records", icon: <Home size={iconSize} />, path: "/admin/householdRecords" },
    { title: "Blotter Scheduling Records", icon: <Book size={iconSize} />, path: "/admin/blotterRecords" },
    { title: "Financial Tracking", icon: <DollarSign size={iconSize} />, path: "/admin/financialTracking" },
    { title: "Barangay Official & Staff", icon: <UserCog size={iconSize} />, path: "/admin/barangayOfficials" },
    { title: "Communication & Announcement", icon: <Megaphone size={iconSize} />, path: "/admin/communicationAnnouncement" },
    { title: "Social Services", icon: <Handshake size={iconSize} />, path: "/admin/socialServices" },
    { title: "Disaster & Emergency", icon: <AlertTriangle size={iconSize} />, path: "/admin/disasterEmergency" },
    { title: "Project Management", icon: <Projector size={iconSize} />, path: "/admin/projectManagement" },
    { title: "Inventory Assets", icon: <Boxes size={iconSize} />, path: "/admin/inventoryAssets" },
  ];

  const staffItems = [
    { title: "Dashboard", icon: <LayoutDashboard size={iconSize} />, path: "/staff/dashboard" },
    { title: "Residents Records", icon: <Users size={iconSize} />, path: "/staff/residentsRecords" },
    { title: "Document Records", icon: <FileText size={iconSize} />, path: "/staff/documentsRecords" },
    { title: "Household Records", icon: <Home size={iconSize} />, path: "/staff/householdRecords" },
    { title: "Barangay Official & Staff", icon: <UserCog size={iconSize} />, path: "/staff/barangayOfficials" },
    { title: "Communication & Announcement", icon: <Megaphone size={iconSize} />, path: "/staff/communicationAnnouncement" },
    { title: "Social Services", icon: <Handshake size={iconSize} />, path: "/staff/socialServices" },
    { title: "Disaster & Emergency", icon: <AlertTriangle size={iconSize} />, path: "/staff/disasterEmergency" },
    { title: "Project Management", icon: <Projector size={iconSize} />, path: "/staff/projectManagement" },
    { title: "Inventory Assets", icon: <Boxes size={iconSize} />, path: "/staff/inventoryAssets" },
  ];

  const treasurerItems = [
    { title: "Dashboard", icon: <LayoutDashboard size={iconSize} />, path: "/treasurer/dashboard" },
    { title: "Financial Tracking", icon: <DollarSign size={iconSize} />, path: "/treasurer/financialTracking" },
  ];

  const defaultItems = [
    { title: "Dashboard", icon: <LayoutDashboard size={iconSize} />, path: "/" },
  ];

  let menuItems = defaultItems;
  if (user?.role === "admin") menuItems = adminItems;
  else if (user?.role === "staff") menuItems = staffItems;
  else if (user?.role === "treasurer") menuItems = treasurerItems;

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-gradient-to-b from-green-900 to-green-800 shadow-2xl border-r border-green-700">
      <div className="flex flex-col h-full px-4 py-6 overflow-y-auto text-white space-y-6 scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-green-800">

        {/* Header */}
        <div className="flex items-center justify-center gap-3">
          <Megaphone className="text-lime-300 w-7 h-7" />
          <h2 className="text-2xl font-extrabold tracking-wide text-lime-100">
            {user?.role?.toUpperCase() || "PANEL"}
          </h2>
        </div>

        <hr className="border-green-700" />

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-1">
            {menuItems.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={idx}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group
                      ${isActive
                        ? "bg-green-700 text-white font-semibold border-l-4 border-lime-300"
                        : "hover:bg-green-700 hover:text-white text-green-100"
                      }`}
                  >
                    <span className="group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="truncate text-sm tracking-wide">{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="text-sm text-green-300 text-center pt-6 border-t border-green-700">
          <p>&copy; 2025 Barangay System</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
