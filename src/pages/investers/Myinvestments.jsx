import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Download, Eye, RefreshCw, XCircle, X, CheckCircle2, AlertCircle, Clock, Lock, TrendingUp, Send } from "lucide-react";
import { useInvestorData, StatusBadge, formatINR } from "./InvestorDataContext";
import "../../Styles/Investor/MyInvestments.css";

const EXTENSION_OPTIONS = ["3 Months", "6 Months", "12 Months", "36 Months"];

export default function MyInvestments() {
  const navigate = useNavigate();
  const { investments, requestTenureExtension, requestSettlement } = useInvestorData();

  const [activeTab, setActiveTab] = useState("all");

  const [viewModal, setViewModal] = useState(null);

  const [extendModal, setExtendModal] = useState(null);
  const [extensionPeriod, setExtensionPeriod] = useState(EXTENSION_OPTIONS[1]);

  const [preCloseModal, setPreCloseModal] = useState(null);
  const [preCloseReason, setPreCloseReason] = useState("");

  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const pendingInvestments = investments.filter((inv) => inv.status === "Pending Approval");
  const nonPendingInvestments = investments.filter((inv) => inv.status !== "Pending Approval");
  const hasPending = pendingInvestments.length > 0;
  const visibleInvestments = activeTab === "pending" ? pendingInvestments : nonPendingInvestments;

  const handleViewBond = (bondNumber) => {
    navigate(`/investor/bond-certificate/${encodeURIComponent(bondNumber)}`);
  };

  const openViewModal = (inv) => setViewModal(inv);

  const openExtendModal = (inv) => {
    setExtensionPeriod(EXTENSION_OPTIONS[1]);
    setExtendModal(inv);
  };

  const openPreCloseModal = (inv) => {
    setPreCloseReason("");
    setPreCloseModal(inv);
  };

  // const extensionMonths = parseInt(extensionPeriod, 10);

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

  const submitPreCloseRequest = async () => {
    if (!preCloseModal) return;
    const bondNumber = preCloseModal.bond;
    const reason = preCloseReason.trim();
    setPreCloseModal(null);
    try {
      if (typeof requestSettlement === "function") {
        await requestSettlement(bondNumber, reason);
      }
      setToast({
        type: "success",
        message: `Pre-close request for ${bondNumber} sent to admin for approval.`,
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err?.message || `Could not send pre-close request for ${bondNumber}. Please try again.`,
      });
    }
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

      <div className="investments-tab-bar">
        <button
          type="button"
          className={`investments-tab${activeTab === "all" ? " investments-tab--active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Investments
          <span className="investments-tab__badge investments-tab__badge--neutral">{nonPendingInvestments.length}</span>
        </button>
        <button
          type="button"
          className={`investments-tab${activeTab === "pending" ? " investments-tab--active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Investments
          <span className="investments-tab__badge">{pendingInvestments.length}</span>
        </button>
      </div>

      <div className="investor-table-card">
        <div className="investor-table-card__header">
          <div className="investor-table-card__title">
            <TrendingUp size={16} />
            <span>{activeTab === "pending" ? "Pending Investments" : "My Investments"}</span>
          </div>
          <div className="investor-table-card__controls">
            <input className="investor-search-input" placeholder="Search bonds..." />
            <button className="investor-btn investor-btn--outline"><Download size={14} /> Export</button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Investment Id</th>
              <th>Amount</th>
              <th>Rate</th>
              <th>Invested On</th>
              <th>Matures On</th>
              <th>Monthly Int.</th>
              <th>Earned</th>
              <th>UTR</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleInvestments.map((inv) => {
              const isPending = inv.status === "Pending Approval";
              const isActive = inv.status === "Active";
              return (
                <tr key={inv.id}>
                  {isPending ? (
                    <td className="mono pending-bond-cell">Pending...</td>
                  ) : (
                    <td className="mono">{inv.bond}</td>
                  )}
                  <td className="mono">{formatINR(inv.amount)}</td>
                  <td>
                    <span className={`rate-pill${isPending ? " rate-pill--initial" : ""}`}>
                      {inv.rate.includes("(initial)") ? inv.rate : `${inv.rate}${isPending ? " (initial)" : ""}`}
                    </span>
                  </td>
                  <td>{inv.invested}</td>
                  <td>{isPending ? "—" : inv.matures}</td>
                  <td className="mono amount-positive">{formatINR(inv.monthlyInt)}</td>
                  <td className="mono">{formatINR(inv.earned)}</td>
                  <td className="mono utr-cell">{inv.utr || "—"}</td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td className="investor-table-actions">
                    {isPending ? (
                      <span className="pending-actions-lock">
                        <Lock size={12} /> Pending Approval
                      </span>
                    ) : (
                      <>
                        <button type="button" title="View" className="action-btn action-btn--view" onClick={() => openViewModal(inv)}>
                          <Eye size={14} />
                        </button>
                        <button type="button" title="Download Bond" className="action-btn action-btn--bond" onClick={() => handleViewBond(inv.bond)}>
                          <Download size={13} /> Bond
                        </button>
                        {isActive && (
                          <>
                            <button type="button" title="Request Tenure Extension" className="action-btn action-btn--extend" onClick={() => openExtendModal(inv)}>
                              <RefreshCw size={13} /> Extend
                            </button>
                            <button type="button" title="Request Pre-Close" className="action-btn action-btn--preclose" onClick={() => openPreCloseModal(inv)}>
                              <XCircle size={13} /> Pre-Close
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visibleInvestments.length === 0 && (
          <p className="investments-empty-state">No investments in this view yet.</p>
        )}

        <p className="admin-table-footer">
          Showing {visibleInvestments.length === 0 ? 0 : 1}–{visibleInvestments.length} of {visibleInvestments.length} records
        </p>
      </div>

      {viewModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{viewModal.bond}</h3>
              <button className="modal-close-btn" onClick={() => setViewModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="view-detail-row">
                <span>Status</span>
                <StatusBadge status={viewModal.status} />
              </div>
              <div className="view-detail-row">
                <span>Principal Amount</span>
                <span className="mono">{formatINR(viewModal.amount)}</span>
              </div>
              <div className="view-detail-row">
                <span>Interest Rate</span>
                <span className="mono">{viewModal.rate}</span>
              </div>
              <div className="view-detail-row">
                <span>Invested On</span>
                <span className="mono">{viewModal.invested}</span>
              </div>
              <div className="view-detail-row">
                <span>Matures On</span>
                <span className="mono">{viewModal.matures || "—"}</span>
              </div>
              <div className="view-detail-row">
                <span>Monthly Interest</span>
                <span className="mono">{formatINR(viewModal.monthlyInt)}</span>
              </div>
              <div className="view-detail-row">
                <span>Total Earned</span>
                <span className="mono">{formatINR(viewModal.earned)}</span>
              </div>
              {viewModal.utr && (
                <div className="view-detail-row">
                  <span>Payment UTR</span>
                  <span className="mono">{viewModal.utr}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="investor-btn investor-btn--outline" onClick={() => setViewModal(null)}>Close</button>
              <button className="investor-btn investor-btn--primary" onClick={() => handleViewBond(viewModal.bond)}>
                <Download size={14} /> Download Bond
              </button>
            </div>
          </div>
        </div>
      )}

      {extendModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Request Tenure Extension — {extendModal.bond}</h3>
              <button className="modal-close-btn" onClick={() => setExtendModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-intro">
                Select how many months you would like to extend this investment. The request will be sent
                to your branch admin for approval.
              </p>

              <label className="modal-label">Extension Period</label>
              <div className="extend-option-grid">
                {EXTENSION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`extend-option${extensionPeriod === opt ? " extend-option--active" : ""}`}
                    onClick={() => setExtensionPeriod(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="extend-info-box">
                <p>
                  On approval: maturity date will be extended by <strong>{extensionPeriod.toLowerCase()}</strong> and
                  an updated bond certificate will be generated automatically.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="investor-btn investor-btn--outline" onClick={() => setExtendModal(null)}>Cancel</button>
              <button className="investor-btn investor-btn--primary" onClick={submitExtendRequest}>
                <Send size={14} /> Submit Extension Request
              </button>
            </div>
          </div>
        </div>
      )}

      {preCloseModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Request Pre-Close — {preCloseModal.bond}</h3>
              <button className="modal-close-btn" onClick={() => setPreCloseModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="early-closure-notice">
                <p className="early-closure-notice__title">Early Closure Notice</p>
                <p className="early-closure-notice__text">
                  Pre-closing your investment before maturity may attract a penalty. Your request will be
                  reviewed by the admin and moved to the settlement queue.
                </p>
              </div>

              <label className="modal-label">Reason for Pre-Close</label>
              <textarea
                className="modal-textarea"
                placeholder="Briefly state your reason..."
                value={preCloseReason}
                onChange={(e) => setPreCloseReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="modal-footer">
              <button className="investor-btn investor-btn--outline" onClick={() => setPreCloseModal(null)}>Cancel</button>
              <button
                className="investor-btn investor-btn--danger"
                onClick={submitPreCloseRequest}
                disabled={preCloseReason.trim().length === 0}
              >
                <Send size={14} /> Submit Pre-Close Request
              </button>
            </div>
          </div>
        </div>
      )}

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