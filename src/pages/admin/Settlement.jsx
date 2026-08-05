import React, { useMemo, useState } from "react";
import { formatINR } from "../../shared/Shared";
import { CheckCircle2, X, AlertTriangle, Lock } from "lucide-react";
import "../../Styles/Admin/Settlement.css";

const bonds = [
  { bondNumber: "BND-2025-001", investor: "Arjun Sharma", principal: 500000, rate: 12, monthsActive: 6 },
  { bondNumber: "BND-2025-003", investor: "Neha Gupta", principal: 600000, rate: 11.5, monthsActive: 4 },
  { bondNumber: "BND-2025-005", investor: "Vikram Singh", principal: 325000, rate: 12.5, monthsActive: 8 },
];

export default function Settlement() {
  const [selectedBond, setSelectedBond] = useState(bonds[0].bondNumber);
  const [settlementDate, setSettlementDate] = useState("2025-07-22");
  const [settledBonds, setSettledBonds] = useState(new Set());
  const [showConfirm, setShowConfirm] = useState(false);

  const bond = bonds.find((b) => b.bondNumber === selectedBond);
  const isSettled = settledBonds.has(selectedBond);

  const { interestEarned, penalty, netSettlement } = useMemo(() => {
    const interest = Math.round((bond.principal * (bond.rate / 100) * bond.monthsActive) / 12);
    const penaltyAmount = Math.round(bond.principal * 0.02);
    return {
      interestEarned: interest,
      penalty: penaltyAmount,
      netSettlement: bond.principal + interest - penaltyAmount,
    };
  }, [bond]);

  const openConfirm = () => {
    if (isSettled) return;
    setShowConfirm(true);
  };

  const closeConfirm = () => {
    setShowConfirm(false);
  };

  const confirmApprove = () => {
    setSettledBonds((prev) => new Set(prev).add(selectedBond));
    setShowConfirm(false);
  };

  return (
    <div className="admin-page settlement-layout">
      <div className="settlement-calculator-card">
        <p className="admin-section__title">Settlement Calculator</p>

        <div className="settlement-form-row">
          <div className="settlement-field">
            <label>Bond Number</label>
            <select value={selectedBond} onChange={(e) => setSelectedBond(e.target.value)}>
              {bonds.map((b) => (
                <option key={b.bondNumber} value={b.bondNumber}>
                  {b.bondNumber} — {b.investor}{settledBonds.has(b.bondNumber) ? " (Settled)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="settlement-field">
            <label>Settlement Date</label>
            <input type="date" value={settlementDate} onChange={(e) => setSettlementDate(e.target.value)} />
          </div>
        </div>

        <div className="settlement-breakdown">
          <div className="settlement-row">
            <span>Principal</span>
            <span className="mono">{formatINR(bond.principal)}</span>
          </div>
          <div className="settlement-row">
            <span>Interest Earned ({bond.monthsActive}m)</span>
            <span className="mono amount-positive">{formatINR(interestEarned)}</span>
          </div>
          <div className="settlement-row">
            <span>Penalty (2%)</span>
            <span className="mono amount-negative">-{formatINR(penalty)}</span>
          </div>
          <div className="settlement-row settlement-row--total">
            <span>Net Settlement</span>
            <span className="mono amount-positive">{formatINR(netSettlement)}</span>
          </div>
        </div>

        <div className="settlement-actions">
          {isSettled ? (
            <span className="settlement-settled-badge">
              <Lock size={14} /> Settlement Approved
            </span>
          ) : (
            <button className="admin-btn admin-btn--success" onClick={openConfirm}>
              Approve Settlement
            </button>
          )}
        </div>
      </div>

      <div className="settlement-details-card">
        <p className="admin-section__title">Bond Details</p>
        <div className="settlement-detail-row">
          <span>Bond</span>
          <span className="mono">{bond.bondNumber}</span>
        </div>
        <div className="settlement-detail-row">
          <span>Investor</span>
          <span>{bond.investor}</span>
        </div>
        <div className="settlement-detail-row">
          <span>Principal</span>
          <span className="mono">{formatINR(bond.principal)}</span>
        </div>
        <div className="settlement-detail-row">
          <span>Rate</span>
          <span className="mono">{bond.rate}% p.a.</span>
        </div>
        <div className="settlement-detail-row">
          <span>Months Active</span>
          <span className="mono">{bond.monthsActive}</span>
        </div>
      </div>

      {showConfirm && (
        <div className="settlement-modal-overlay" onClick={closeConfirm}>
          <div className="settlement-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="settlement-modal-header">
              <div className="settlement-modal-header__title">
                <AlertTriangle size={18} />
                <h3>Approve Settlement</h3>
              </div>
              <button className="settlement-modal-close-btn" onClick={closeConfirm}>
                <X size={16} />
              </button>
            </div>
            <div className="settlement-modal-body">
              <p>
                Approve settlement of <strong>{formatINR(netSettlement)}</strong> for{" "}
                <strong>{bond.investor}</strong> on bond <strong>{bond.bondNumber}</strong>,
                effective {settlementDate}? This cannot be undone.
              </p>
            </div>
            <div className="settlement-modal-footer">
              <button className="admin-btn admin-btn--outline" onClick={closeConfirm}>
                Cancel
              </button>
              <button className="admin-btn admin-btn--success" onClick={confirmApprove}>
                <CheckCircle2 size={14} /> Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}