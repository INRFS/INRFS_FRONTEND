import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Download, Clock, Lock } from "lucide-react";
import { useInvestorData, StatusBadge, formatINR } from "./InvestorDataContext";
import "../../Styles/Investor/MyBonds.css";

export default function MyBonds() {
  const navigate = useNavigate();
  const { investments } = useInvestorData();
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");

  const hasPending = investments.some((inv) => inv.status === "Pending Approval");

  const activeBonds = investments.filter((inv) => inv.status === "Active");
  const otherBonds = investments.filter((inv) => inv.status !== "Active");

  const visibleBonds = (activeTab === "active" ? activeBonds : otherBonds).filter((b) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return b.bond?.toLowerCase().includes(q);
  });

  const handleViewBond = (bondNumber) => {
    navigate(`/investor/bond-certificate/${encodeURIComponent(bondNumber)}`);
  };

  return (
    <div className="investor-page">
      <div className="investor-page-actions investor-page-actions--end">
        <button className="investor-btn investor-btn--primary" onClick={() => navigate("/investor/invest-now")}>
          <Plus size={14} /> New Investment
        </button>
      </div>

      {hasPending && (
        <div className="pending-approval-banner">
          <Clock size={18} />
          <p>
            <strong>Pending approval</strong> — Your investment request has been sent to the branch admin.
            Bond certificate will be generated once the admin approves and activates your investment.
          </p>
        </div>
      )}

      <div className="mb-tabs">
        <button
          className={`mb-tab${activeTab === "active" ? " mb-tab--active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active <span className="mb-tab-count">{activeBonds.length}</span>
        </button>
        <button
          className={`mb-tab${activeTab === "other" ? " mb-tab--active" : ""}`}
          onClick={() => setActiveTab("other")}
        >
          Others <span className="mb-tab-count">{otherBonds.length}</span>
        </button>
      </div>

      <div className="investor-table-card">
        <div className="investor-table-card__header">
          <input
            className="investor-search-input"
            placeholder="Search bonds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="investor-btn investor-btn--outline"><Download size={14} /> Export</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Bond Number</th>
              <th>Amount</th>
              <th>Rate</th>
              <th>Invested On</th>
              <th>Matures On</th>
              <th>Monthly Int.</th>
              <th>Earned</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleBonds.length === 0 && (
              <tr>
                <td colSpan={9} className="mb-no-results">
                  {activeTab === "active" ? "No active bonds yet." : "Nothing here."}
                </td>
              </tr>
            )}
            {visibleBonds.map((b) => {
              const isPending = b.status === "Pending Approval";
              return (
                <tr key={b.id}>
                  {isPending ? (
                    <td className="mono pending-bond-cell">Pending...</td>
                  ) : (
                    <td
                      className="mono link"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleViewBond(b.bond)}
                    >
                      {b.bond}
                    </td>
                  )}
                  <td className="mono">{formatINR(b.amount)}</td>
                  <td>
                    <span className={`rate-pill${isPending ? " rate-pill--initial" : ""}`}>
                      {b.rate}{isPending ? " (initial)" : ""}
                    </span>
                  </td>
                  <td>{b.invested}</td>
                  <td>{isPending ? "—" : b.matures}</td>
                  <td className="mono amount-positive">{formatINR(b.monthlyInt)}</td>
                  <td className="mono">{formatINR(b.earned)}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td className="investor-table-actions">
                    {isPending ? (
                      <span className="pending-actions-lock">
                        <Lock size={12} /> Pending Approval
                      </span>
                    ) : (
                      <>
                        <button type="button" title="View" className="icon-btn icon-btn--view" onClick={() => handleViewBond(b.bond)}>
                          <Eye size={14} />
                        </button>
                        <button type="button" title="Download Bond" className="icon-btn icon-btn--settle" onClick={() => handleViewBond(b.bond)}>
                          <Download size={14} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="admin-table-footer">Showing 1–{visibleBonds.length} of {visibleBonds.length} records</p>
      </div>
    </div>
  );
}