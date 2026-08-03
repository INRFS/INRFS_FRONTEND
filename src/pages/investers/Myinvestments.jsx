import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Download } from "lucide-react";
import { useInvestorData, StatusBadge, formatINR } from "./InvestorDataContext";
import "../../Styles/Investor/MyInvestments.css";

export default function MyInvestments() {
  const navigate = useNavigate();
  const { investments } = useInvestorData();

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

      <div className="investor-table-card">
        <div className="investor-table-card__header">
          <input className="investor-search-input" placeholder="Search bonds..." />
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
              {/* <th>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {investments.map((inv) => (
              <tr key={inv.id}>
                <td
                  className="mono link"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleViewBond(inv.bond)}
                >
                  {inv.bond}
                </td>
                <td className="mono">{formatINR(inv.amount)}</td>
                <td><span className="rate-pill">{inv.rate}</span></td>
                <td>{inv.invested}</td>
                <td>{inv.matures}</td>
                <td className="mono amount-positive">{formatINR(inv.monthlyInt)}</td>
                <td className="mono">{formatINR(inv.earned)}</td>
                <td><StatusBadge status={inv.status} /></td>
                {/* <td className="admin-table-actions">
                  <button type="button" title="View" onClick={() => handleViewBond(inv.bond)}>
                    <Eye size={14} />
                  </button>
                  <button
                    type="button"
                    title="Bond"
                    className="admin-icon-btn--primary"
                    onClick={() => handleViewBond(inv.bond)}
                  >
                    <Download size={14} /> Bond
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="admin-table-footer">Showing 1–{investments.length} of {investments.length} records</p>
      </div>
    </div>
  );
}