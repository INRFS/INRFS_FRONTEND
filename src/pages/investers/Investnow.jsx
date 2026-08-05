import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle, ClipboardCheck, ShieldCheck, FileCheck2 } from "lucide-react";
import { useInvestorData, formatINR } from "./InvestorDataContext";
import "../../Styles/Investor/InvestNow.css";

const quickAmounts = [100000, 500000, 1000000, 2500000];

const tenureOptions = [
  { months: 3 },
  { months: 6 },
  { months: 12 },
  { months: 24 },
  { months: 36 },
];

const INITIAL_RATE = 3;

const UPI_ID = "inrfs@ybl";

const workflowSteps = [
  {
    icon: ClipboardCheck,
    title: "Submit Request",
    desc: "Investor submits with payment proof",
  },
  {
    icon: ShieldCheck,
    title: "Admin Review",
    desc: "Branch admin reviews & sets final rate",
  },
  {
    icon: CheckCircle2,
    title: "Approval",
    desc: "Admin approves → status becomes Active",
  },
  {
    icon: FileCheck2,
    title: "Bond Generated",
    desc: "Digital bond certificate is issued",
  },
];

export default function InvestNow() {
  const navigate = useNavigate();
  const { addInvestment } = useInvestorData();

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(500000);
  const [tenure, setTenure] = useState(12);
  const [processing, setProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdBond, setCreatedBond] = useState(null);

  const [utr, setUtr] = useState("");

  const { monthlyInterest, totalInterest, maturityAmount } = useMemo(() => {
    const monthly = Math.round((amount * (INITIAL_RATE / 100)));
    const total = monthly * tenure;
    return {
      monthlyInterest: monthly,
      totalInterest: total,
      maturityAmount: amount + total,
    };
  }, [amount, tenure]);

  const canSubmit = utr.trim().length > 0;

  const handleSubmitInvestment = () => {
    if (!canSubmit) return;
    setProcessing(true);
    setTimeout(() => {
      const inv = addInvestment({ amount, rateValue: INITIAL_RATE, tenure, utr, status: "pending" });
      setCreatedBond(inv);
      setProcessing(false);
      setSubmitted(true);
    }, 900);
  };

  const steps = [
    { num: 1, label: "Investment Details" },
    { num: 2, label: "Payment" },
    { num: 3, label: "Confirmation" },
  ];

  return (
    <div className="investor-page">
      <p className="investor-page-subtitle">
        Start a new investment. The initial rate is {INITIAL_RATE}% per month, subject to admin approval.
      </p>

      <div className="invest-layout">
        <div className="invest-form-card">
          <div className="invest-stepper">
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className={`invest-step${step >= s.num ? " invest-step--active" : ""}`}>
                  <span className="invest-step__num">
                    {step > s.num ? <CheckCircle2 size={16} /> : s.num}
                  </span>
                  <span className="invest-step__label">{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className="invest-step__connector" />}
              </React.Fragment>
            ))}
          </div>

          {step === 1 && (
            <>
              <div className="invest-rate-banner">
                <AlertTriangle size={18} />
                <p>
                  <strong>Initial interest rate: {INITIAL_RATE}% per month.</strong> Your branch admin will
                  review and may adjust the rate before final approval. Your investment becomes active only
                  after admin approval.
                </p>
              </div>

              <label className="invest-field-label" htmlFor="amount">
                Investment Amount (₹) <span className="invest-required">*</span>
              </label>
              <div className="invest-amount-input">
                <span>₹</span>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                />
              </div>

              <div className="invest-quick-amounts">
                {quickAmounts.map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`invest-chip${amount === val ? " invest-chip--active" : ""}`}
                    onClick={() => setAmount(val)}
                  >
                    {formatINR(val)}
                  </button>
                ))}
              </div>

              <p className="invest-field-label">Investment Tenure</p>
              <div className="invest-tenure-grid">
                {tenureOptions.map((t) => (
                  <button
                    key={t.months}
                    type="button"
                    className={`invest-tenure-card${tenure === t.months ? " invest-tenure-card--active" : ""}`}
                    onClick={() => setTenure(t.months)}
                  >
                    <span className="invest-tenure-card__months">{t.months}</span>
                    <span className="invest-tenure-card__unit">Months</span>
                  </button>
                ))}
              </div>

              <div className="invest-form-actions">
                <button className="investor-btn investor-btn--outline" onClick={() => navigate("/investor/dashboard")}>
                  &lt; Cancel
                </button>
                <button
                  className="investor-btn investor-btn--primary"
                  disabled={amount <= 0}
                  onClick={() => setStep(2)}
                >
                  Continue to Payment &gt;
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="invest-payment-step">
              <div className="invest-upi-box">
                <p className="invest-upi-title">Pay via UPI</p>
                <p className="invest-upi-id">UPI ID: {UPI_ID}</p>
                <p className="invest-upi-amount">{formatINR(amount)}</p>
              </div>

              <label className="invest-field-label" htmlFor="utr">
                Transaction Reference Number <span className="invest-required">*</span>
              </label>
              <div className="invest-amount-input">
                <input
                  id="utr"
                  type="text"
                  placeholder="Enter UTR / Transaction ID"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                />
              </div>

              <div className="invest-form-actions">
                <button className="investor-btn investor-btn--outline" onClick={() => setStep(1)}>
                  &lt; Back
                </button>
                <button
                  className="investor-btn investor-btn--primary"
                  onClick={() => setStep(3)}
                  disabled={!canSubmit}
                >
                  Continue to Review &gt;
                </button>
              </div>
            </div>
          )}

          {step === 3 && !submitted && (
            <div className="invest-review-step">
              <p className="invest-review-heading">Review Your Investment</p>

              <div className="invest-review-card">
                <div className="invest-review-row">
                  <span>Principal Amount</span>
                  <span className="mono">{formatINR(amount)}</span>
                </div>
                <div className="invest-review-row">
                  <span>Initial Rate</span>
                  <span className="mono">{INITIAL_RATE}% per month</span>
                </div>
                <div className="invest-review-row">
                  <span>Tenure</span>
                  <span className="mono">{tenure} months</span>
                </div>
                <div className="invest-review-row">
                  <span>Expected Monthly Interest</span>
                  <span className="mono">{formatINR(monthlyInterest)}</span>
                </div>
                <div className="invest-review-row invest-review-row--last">
                  <span>Transaction Ref</span>
                  <span className="mono">{utr || "—"}</span>
                </div>
              </div>

              <div className="invest-review-note">
                After you submit, your branch admin will review this request. They may adjust the interest
                rate. Your investment will be <strong>activated</strong> and a bond certificate generated only
                after admin approval.
              </div>

              <div className="invest-form-actions">
                <button className="investor-btn investor-btn--outline" onClick={() => setStep(2)}>
                  &lt; Back
                </button>
                <button
                  className="investor-btn investor-btn--primary"
                  onClick={handleSubmitInvestment}
                  disabled={processing}
                >
                  {processing ? "Submitting..." : "Submit Investment Request"} &gt;
                </button>
              </div>
            </div>
          )}

          {step === 3 && submitted && createdBond && (
            <div className="invest-confirmation-step">
              <span className="invest-confirmation-icon">
                <CheckCircle2 size={40} />
              </span>
              <p className="invest-confirmation-title">Investment Submitted!</p>
              <p className="invest-confirmation-sub">
                Your investment is pending admin verification. You'll be notified once approved.
              </p>
              <div className="invest-form-actions invest-form-actions--center">
                <button className="investor-btn investor-btn--primary" onClick={() => navigate("/investor/dashboard")}>
                  Go to Dashboard
                </button>
                <button className="investor-btn investor-btn--outline" onClick={() => navigate("/investor/my-investments")}>
                  View Investments
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="invest-side-col">
          <div className="invest-summary-card">
            <p className="investor-section__title">Investment Summary</p>
            <div className="invest-summary-row">
              <span>Principal</span>
              <span className="mono">{formatINR(amount)}</span>
            </div>
            <div className="invest-summary-row">
              <span>Initial Rate</span>
              <span className="mono">{INITIAL_RATE}% per month</span>
            </div>
            <div className="invest-summary-row">
              <span>Tenure</span>
              <span className="mono">{tenure} months</span>
            </div>
            <div className="invest-summary-row">
              <span>Expected Monthly</span>
              <span className="mono">{formatINR(monthlyInterest)}</span>
            </div>
            <div className="invest-summary-row">
              <span>Total Interest (est.)</span>
              <span className="mono">{formatINR(totalInterest)}</span>
            </div>
            <div className="invest-summary-row invest-summary-row--total">
              <span>Maturity Amount (est.)</span>
              <span className="mono">{formatINR(maturityAmount)}</span>
            </div>
          </div>

          <div className="invest-workflow-card">
            <p className="invest-workflow-title">Investment Workflow</p>
            {workflowSteps.map((w, i) => (
              <div className="invest-workflow-row" key={w.title}>
                <span className="invest-workflow-num">{i + 1}</span>
                <div>
                  <p className="invest-workflow-row__title">{w.title}</p>
                  <p className="invest-workflow-row__desc">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}