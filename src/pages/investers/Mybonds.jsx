import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Download } from "lucide-react";
import { useInvestorData, StatusBadge, formatINR } from "./InvestorDataContext";
import "../../Styles/Investor/MyBonds.css";

export default function MyBonds() {
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((b) => (
              <tr key={b.id} className={b.id === investments[0].id ? "row-flash" : ""}>
                <td
                  className="mono link"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleViewBond(b.bond)}
                >
                  {b.bond}
                </td>
                <td className="mono">{formatINR(b.amount)}</td>
                <td><span className="rate-pill">{b.rate}</span></td>
                <td>{b.invested}</td>
                <td>{b.matures}</td>
                <td className="mono amount-positive">{formatINR(b.monthlyInt)}</td>
                <td className="mono">{formatINR(b.earned)}</td>
                <td><StatusBadge status={b.status} /></td>
                <td className="admin-table-actions">
                  <button type="button" title="View" onClick={() => handleViewBond(b.bond)}>
                    <Eye size={14} />
                  </button>
                  <button
                    type="button"
                    title="Bond"
                    className="admin-icon-btn--primary"
                    onClick={() => handleViewBond(b.bond)}
                  >
                    <Download size={14} /> Bond
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="admin-table-footer">Showing 1–{investments.length} of {investments.length} records</p>
      </div>
    </div>
  );
}