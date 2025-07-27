import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Lightbulb, FileText, Package, CalendarDays,
  Network, UserSquare, ClipboardList
} from 'lucide-react';

const Sidebares = () => {
  const location = useLocation();

  const menuItems = [
    { title: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/residents/dashboard" },
    { title: "Projects", icon: <Lightbulb size={18} />, path: "/residents/projects" },
    { title: "Request Documents", icon: <FileText size={18} />, path: "/residents/requestDocuments" },
    { title: "Document Status", icon: <ClipboardList size={18} />, path: "/residents/statusDocumentRequests" },
    { title: "Request Assets", icon: <Package size={18} />, path: "/residents/requestAssets" },
    { title: "Blotter Appointment", icon: <CalendarDays size={18} />, path: "/residents/blotterAppointment" },
    { title: "Organizational Chart", icon: <Network size={18} />, path: "/residents/organizationalChart" },
  ];

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-gradient-to-b from-green-900 to-green-800 shadow-2xl border-r border-green-700">
      <div className="flex flex-col h-full px-4 py-6 text-white space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-green-800">
        
        {/* Logo or Brand Title */}
        <div className="flex items-center justify-center gap-3">
          <UserSquare className="text-lime-300 w-7 h-7" />
          <h2 className="text-2xl font-extrabold tracking-wide text-lime-100">Resident Panel</h2>
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
                        ? "bg-green-700 text-white font-semibold shadow-inner border-l-4 border-lime-300"
                        : "hover:bg-green-700 hover:text-white text-green-100"
                      }`}
                  >
                    <span className="text-white group-hover:scale-110 transition-transform">{item.icon}</span>
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

export default Sidebares;
