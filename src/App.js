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

        <Route
          path="/investor"
          element={
            <InvestorDataProvider>
              <InvestorLayout />
            </InvestorDataProvider>
          }
        >
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;