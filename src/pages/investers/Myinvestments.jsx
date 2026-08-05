import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Download, Eye, RefreshCw, Activity, X, CheckCircle2, AlertCircle, Clock, Lock, TrendingUp } from "lucide-react";
import { useInvestorData, StatusBadge, formatINR } from "./InvestorDataContext";
import "../../Styles/Investor/MyInvestments.css";

const EXTENSION_OPTIONS = ["3 Months", "6 Months", "9 Months", "12 Months", "24 Months", "36 Months"];

export default function MyInvestments() {
  const navigate = useNavigate();
  const { investments, requestTenureExtension, requestSettlement } = useInvestorData();

  const [extendModal, setExtendModal] = useState(null);
  const [extensionPeriod, setExtensionPeriod] = useState(EXTENSION_OPTIONS[1]);

  const [settlementModal, setSettlementModal] = useState(null);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const hasPending = investments.some((inv) => inv.status === "Pending Approval");

  const handleViewBond = (bondNumber) => {
    navigate(`/investor/bond-certificate/${encodeURIComponent(bondNumber)}`);
  };

  const openExtendModal = (inv) => {
    setExtensionPeriod(EXTENSION_OPTIONS[1]);
    setExtendModal(inv);
  };

  const openSettlementModal = (inv) => {
    setSettlementModal(inv);
  };

  const submitExtendRequest = async () => {
    if (!extendModal) return;
    const bondNumber = extendModal.bond;
    const period = extensionPeriod;
    setExtendModal(null);
    try {
      if (typeof requestTenureExtension === "function") {
        await requestTenureExtension(bondNumber, period);
      }
      setToast({
        type: "success",
        message: `Tenure extension request for ${bondNumber} (${period}) sent to admin for approval.`,
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err?.message || `Could not send tenure extension request for ${bondNumber}. Please try again.`,
      });
    }
  };

  const submitSettlementRequest = async () => {
    if (!settlementModal) return;
    const bondNumber = settlementModal.bond;
    setSettlementModal(null);
    try {
      if (typeof requestSettlement === "function") {
        await requestSettlement(bondNumber);
      }
      setToast({
        type: "success",
        message: `Settlement request for ${bondNumber} sent to admin for approval.`,
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err?.message || `Could not send settlement request for ${bondNumber}. Please try again.`,
      });
    }
  };

  const getSettlementBreakdown = (inv) => {
    const principal = inv.amount;
    const interest = inv.interestEarned ?? inv.earned ?? 0;
    const penalty = inv.earlyPenalty ?? 0;
    const net = principal + interest - penalty;
    return { principal, interest, penalty, net };
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

      <div className="investor-table-card">
        <div className="investor-table-card__header">
          <div className="investor-table-card__title">
            <TrendingUp size={16} />
            <span>My Investments</span>
          </div>
          <div className="investor-table-card__controls">
            <input className="investor-search-input" placeholder="Search bonds..." />
            <button className="investor-btn investor-btn--outline"><Download size={14} /> Export</button>
          </div>
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
            {investments.map((inv) => {
              const isPending = inv.status === "Pending Approval";
              return (
                <tr key={inv.id}>
                  {isPending ? (
                    <td className="mono pending-bond-cell">Pending...</td>
                  ) : (
                    <td
                      className="mono link"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleViewBond(inv.bond)}
                    >
                      {inv.bond}
                    </td>
                  )}
                  <td className="mono">{formatINR(inv.amount)}</td>
                  <td>
                    <span className={`rate-pill${isPending ? " rate-pill--initial" : ""}`}>
                      {inv.rate}{isPending ? " (initial)" : ""}
                    </span>
                  </td>
                  <td>{inv.invested}</td>
                  <td>{isPending ? "—" : inv.matures}</td>
                  <td className="mono amount-positive">{formatINR(inv.monthlyInt)}</td>
                  <td className="mono">{formatINR(inv.earned)}</td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td className="investor-table-actions">
                    {isPending ? (
                      <span className="pending-actions-lock">
                        <Lock size={12} /> Pending Approval
                      </span>
                    ) : (
                      <>
                        <button type="button" title="View" className="icon-btn icon-btn--view" onClick={() => handleViewBond(inv.bond)}>
                          <Eye size={14} />
                        </button>
                        <button type="button" title="Request Tenure Extension" className="icon-btn icon-btn--extend" onClick={() => openExtendModal(inv)}>
                          <RefreshCw size={14} />
                        </button>
                        <button type="button" title="Request Settlement" className="icon-btn icon-btn--settle" onClick={() => openSettlementModal(inv)}>
                          <Activity size={14} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="admin-table-footer">Showing 1–{investments.length} of {investments.length} records</p>
      </div>

      {extendModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Extend Tenure — {extendModal.bond}</h3>
              <button className="modal-close-btn" onClick={() => setExtendModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <label className="modal-label">Extension Period</label>
              <select
                className="modal-select"
                value={extensionPeriod}
                onChange={(e) => setExtensionPeriod(e.target.value)}
              >
                {EXTENSION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button className="investor-btn investor-btn--outline" onClick={() => setExtendModal(null)}>Cancel</button>
              <button className="investor-btn investor-btn--warning" onClick={submitExtendRequest}>Send Request</button>
            </div>
          </div>
        </div>
      )}

      {settlementModal && (() => {
        const { principal, interest, penalty, net } = getSettlementBreakdown(settlementModal);
        return (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-header">
                <h3>Settlement — {settlementModal.bond}</h3>
                <button className="modal-close-btn" onClick={() => setSettlementModal(null)}>
                  <X size={16} />
                </button>
              </div>
              <div className="modal-body">
                <div className="settlement-row">
                  <span>Principal</span>
                  <span className="mono">{formatINR(principal)}</span>
                </div>
                <div className="settlement-row">
                  <span>Interest Earned</span>
                  <span className="mono">{formatINR(interest)}</span>
                </div>
                <div className="settlement-row">
                  <span>Early Penalty</span>
                  <span className="mono amount-negative">-{formatINR(penalty)}</span>
                </div>
                <div className="settlement-row settlement-row--total">
                  <span>Net Amount</span>
                  <span className="mono">{formatINR(net)}</span>
                </div>
              </div>
              <div className="modal-footer">
                <button className="investor-btn investor-btn--outline" onClick={() => setSettlementModal(null)}>Cancel</button>
                <button className="investor-btn investor-btn--success" onClick={submitSettlementRequest}>Send Request</button>
              </div>
            </div>
          </div>
        );
      })()}

      {toast && (
        <div className={`request-toast request-toast--${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
          <button className="request-toast__close" onClick={() => setToast(null)}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}