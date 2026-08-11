import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage/Homepage";
import Login from "./pages/login/Login";
import Register from "./pages/login/Register";

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import InvestorManagement from "./pages/admin/InvestorManagement";
import KycApprovals from "./pages/admin/KycApprovals";
import Investments from "./pages/admin/Investments";
import MonthlyInterest from "./pages/admin/MonthlyInterest";
import Settlement from "./pages/admin/Settlement";
import Reports from "./pages/admin/Reports";
// import Notifications from "./pages/admin/Notifications";
import Profile from "./pages/admin/Profile";
import Settings from "./pages/admin/Settings";

// Investor pages
import { InvestorDataProvider } from "./pages/investers/InvestorDataContext";
import InvestorLayout from "./pages/investers/Investerlayout";
import InvestorDashboard from "./pages/investers/Dashboard";
import InvestNow from "./pages/investers/Investnow";
import MyBonds from "./pages/investers/Mybonds";
import MyInvestments from "./pages/investers/Myinvestments";
// import InvestorNotifications from "./pages/investers/Notifications";
import InvestorProfile from "./pages/investers/Profile";
// import InvestorSettings from "./pages/investers/Settings";
import BondCertificate from "./pages/investers/bondCertficate";

// Super Admin pages
import SuperAdminLayout from "./pages/superadmin/superadmin_layout";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
// import SuperAdminComingSoon from "./pages/superadmin/SuperAdminComingSoon";
import SuperAdminInvestorManagement from "./pages/superadmin/InvestorManagement";
import BranchManagement from "./pages/superadmin/branch_management";
import AdminManagement from "./pages/superadmin/admin_management";
import UserManagement from "./pages/superadmin/user_management";
import RolesPermissions from "./pages/superadmin/RolesPermissions";
import AuditLogs from "./pages/superadmin/AuditLogs";
import SystemSettings from "./pages/superadmin/SystemSettings";
import Notifications from "./pages/superadmin/Notifications";
import InvestmentManagement from "./pages/superadmin/InvestmentManagement";
import Payments from "./pages/superadmin/Payments";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="investors" element={<InvestorManagement />} />
          <Route path="kyc-approvals" element={<KycApprovals />} />
          <Route path="investments" element={<Investments />} />
          <Route path="monthly-interest" element={<MonthlyInterest />} />
          <Route path="settlement" element={<Settlement />} />
          <Route path="reports" element={<Reports />} />
          {/* <Route path="notifications" element={<Notifications />} /> */}
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/investor" element={ <InvestorDataProvider> <InvestorLayout /> </InvestorDataProvider>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<InvestorDashboard />} />
           <Route path="bond-certificate/:bondId" element={<BondCertificate />} />
          <Route path="invest-now" element={<InvestNow />} />
          <Route path="my-bonds" element={<MyBonds />} />
          <Route path="my-investments" element={<MyInvestments />} />
          {/* <Route path="notifications" element={<InvestorNotifications />} /> */}
          <Route path="profile" element={<InvestorProfile />} />
          {/* <Route path="settings" element={<InvestorSettings />} /> */}
        </Route>

        <Route path="/superadmin" element={<SuperAdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="investors" element={<SuperAdminInvestorManagement />} />
          <Route path="investments" element={<InvestmentManagement title="Investment Management" />} />
          <Route path="payments" element={<Payments title="Payments" />} />
          <Route path="branches" element={<BranchManagement title="Branch Management" />} />
          <Route path="admins" element={<AdminManagement title="Admin Management" />} />
          <Route path="users" element={<UserManagement title="User Management" />} />
          <Route path="roles" element={<RolesPermissions title="Roles & Permissions" />} />
          <Route path="audit-logs" element={<AuditLogs title="Audit Logs" />} />
          <Route path="reports" element={<Reports title="Reports" />} />
          <Route path="system-settings" element={<SystemSettings title="System Settings" />} />
          <Route path="notifications" element={<Notifications title="Notifications" />} />
          <Route path="profile" element={<Profile title="Profile" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;