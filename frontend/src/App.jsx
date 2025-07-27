import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from './pages/Login';
import Register from './pages/Register';
import Welcome from "./pages/Welcome";
import EmailVerification from "./pages/EmailVerification";
import ProtectedRoute from './components/ProtectedRoute';

import Profile from "./pages/forms/Profile";

import AdminLayout from "./AdminLayout";
import ResidentLayout from "./ResidentLayout";
import StaffLayout from "./layout/StaffLayout";
import TreasurerLayout from "./layout/TreasurerLayout";

import * as AdminPages from './pages/admin';
import * as ResidentPages from './pages/residents';
import RequestAssets from './pages/residents/modules/Assets/RequestAssets';
import StatusAssetRequests from './pages/residents/modules/Assets/StatusAssetRequests';
import AssetsManagement from './pages/admin/modules/Assets/AssetsManagement';
import BlotterRequest from './pages/admin/modules/Blotter/BlotterRequest';
import NewComplaint from './pages/admin/modules/Blotter/NewComplaint';
import StaffManagement from './pages/admin/modules/Barangay Officials/StaffManagement';
import OfficialsManagement from './pages/admin/modules/Barangay Officials/OfficialsManagement';

// --- Admin Routes ---
const adminRoutes = [
  { path: "dashboard", element: <AdminPages.AdminDashboard /> },
  { path: "documentsRecords", element: <AdminPages.DocumentsRecords /> },
  { path: "residentsRecords", element: <AdminPages.ResidentsRecords /> },
  { path: "householdRecords", element: <AdminPages.HouseholdRecords /> },
  { path: "blotterRecords", element: <AdminPages.BlotterRecords /> },
  { path: "financialTracking", element: <AdminPages.FinancialTracking /> },
  { path: "barangayOfficials", element: <AdminPages.BarangayOfficials /> },
  { path: "communicationAnnouncement", element: <AdminPages.CommunicationAnnouncement /> },
  { path: "disasterEmergency", element: <AdminPages.DisasterEmergency /> },
  { path: "inventoryAssets", element: <AdminPages.InventoryAssets /> },
  { path: "projectManagement", element: <AdminPages.ProjectManagement /> },
  { path: "socialServices", element: <AdminPages.SocialServices /> },
];

// --- Resident Routes ---
const residentRoutes = [
  { path: "dashboard", element: <ResidentPages.Dashboard /> },
  { path: "blotterAppointment", element: <ResidentPages.BlotterAppointment /> },
  { path: "organizationalChart", element: <ResidentPages.OrganizationalChart /> },
  { path: "projects", element: <ResidentPages.Projects /> },
  { path: "addFeedback", element: <ResidentPages.AddFeedback /> },
  { path: "requestAssets", element: <RequestAssets /> },
  { path: "requestDocuments", element: <ResidentPages.RequestDocuments /> },
  { path: "brgyClearance", element: <ResidentPages.BrgyClearance /> },
  { path: "brgyBusinessPermit", element: <ResidentPages.BrgyBusinessPermit /> },
  { path: "brgyIndigency", element: <ResidentPages.BrgyIndigency /> },
  { path: "brgyResidency", element: <ResidentPages.BrgyResidency /> },
  { path: "statusassetrequests", element: <StatusAssetRequests/> },
  { path: "charterList", element: <ResidentPages.CharterList/> },
  { path: "generateBlotter", element: <ResidentPages.GenerateBlotter/> },
  { path: "statusBlotterRequests", element: <ResidentPages.StatusBlotterRequests/> },
  { path: "statusDocumentRequests", element: <ResidentPages.StatusDocumentRequests/> },


];

// --- Treasurer Routes (reusing AdminPages) ---
const treasurerRoutes = [
  { path: "dashboard", element: <AdminPages.AdminDashboard /> },
  { path: "documentsRecords", element: <AdminPages.DocumentsRecords /> },
  { path: "residentsRecords", element: <AdminPages.ResidentsRecords /> },
  { path: "householdRecords", element: <AdminPages.HouseholdRecords /> },
  { path: "blotterRecords", element: <AdminPages.BlotterRecords /> },
  { path: "financialTracking", element: <AdminPages.FinancialTracking /> },
  { path: "barangayOfficials", element: <AdminPages.BarangayOfficials /> },
  { path: "communicationAnnouncement", element: <AdminPages.CommunicationAnnouncement /> },
  { path: "disasterEmergency", element: <AdminPages.DisasterEmergency /> },
  { path: "inventoryAssets", element: <AdminPages.InventoryAssets /> },
  { path: "projectManagement", element: <AdminPages.ProjectManagement /> },
  { path: "socialServices", element: <AdminPages.SocialServices /> },
];

// --- Staff Routes (also using AdminPages) ---
const staffRoutes = [
  { path: "dashboard", element: <AdminPages.AdminDashboard /> },
  { path: "blotterAppointment", element: <AdminPages.BlotterRecords /> },
  { path: "organizationalChart", element: <AdminPages.BarangayOfficials /> },
  { path: "projects", element: <AdminPages.ProjectManagement /> },
  { path: "requestAssets", element: <AdminPages.InventoryAssets /> },
  { path: "requestDocuments", element: <AdminPages.DocumentsRecords /> },
];

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/email/verify" element={<EmailVerification />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {adminRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
        <Route
          path="/admin/assets-management"
          element={
            <ProtectedRoute role="admin">
              <AssetsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/modules/Blotter/BlotterRequest"
          element={
            <ProtectedRoute role="admin">
              <BlotterRequest />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/modules/Blotter/NewComplaint" element={<NewComplaint />} />
        <Route
          path="/admin/staff-management"
          element={
            <ProtectedRoute role="admin">
              <StaffManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/officials-management"
          element={
            <ProtectedRoute role="admin">
              <OfficialsManagement />
            </ProtectedRoute>
          }
        />

        {/* Resident Routes */}
        <Route
          path="/residents"
          element={
            <ProtectedRoute role="residents">
              <ResidentLayout />
            </ProtectedRoute>
          }
        >
          {residentRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
        {/* Add direct routes for officials and staff */}
        <Route
          path="/residents/officials"
          element={
            <ProtectedRoute role="residents">
              <ResidentPages.Officials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/residents/staff"
          element={
            <ProtectedRoute role="residents">
              <ResidentPages.Staff />
            </ProtectedRoute>
          }
        />

        {/* Staff Routes */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute role="staff">
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          {staffRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>

        {/* Treasurer Routes */}
        <Route
          path="/treasurer"
          element={
            <ProtectedRoute role="treasurer">
              <TreasurerLayout />
            </ProtectedRoute>
          }
        >
          {treasurerRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
