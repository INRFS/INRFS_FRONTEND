import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, UploadCloud } from "lucide-react";
import { useInvestorData, formatINR } from "./InvestorDataContext";
import "../../Styles/Investor/InvestNow.css";

const quickAmounts = [100000, 500000, 1000000, 2500000];

const tenureOptions = [
  { months: 6, rate: 11 },
  { months: 12, rate: 12 },
  { months: 24, rate: 12.5 },
  { months: 36, rate: 13 },
];


const UPI_ID = "inrfs@ybl";

export default function InvestNow() {
  const navigate = useNavigate();
  const { addInvestment } = useInvestorData();

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(500000);
  const [tenure, setTenure] = useState(12);
  const [processing, setProcessing] = useState(false);
  const [createdBond, setCreatedBond] = useState(null);

  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotName, setScreenshotName] = useState("");

  const selectedTenure = tenureOptions.find((t) => t.months === tenure);

  const { monthlyInterest, totalInterest, maturityAmount } = useMemo(() => {
    const monthly = Math.round((amount * (selectedTenure.rate / 100)) / 12);
    const total = monthly * tenure;
    return { monthlyInterest: monthly, totalInterest: total, maturityAmount: amount + total };
  }, [amount, tenure, selectedTenure]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      setScreenshotName(file.name);
    }
  };

  const canSubmit = utr.trim().length > 0 && screenshot;

  const handleSubmitInvestment = () => {
    if (!canSubmit) return;
    setProcessing(true);
    setTimeout(() => {
      const inv = addInvestment({ amount, rateValue: selectedTenure.rate, tenure, utr, status: "pending" });
      setCreatedBond(inv);
      setProcessing(false);
      setStep(3);
    }, 900);
  };

  const steps = [
    { num: 1, label: "Investment Details" },
    { num: 2, label: "Payment" },
    { num: 3, label: "Confirmation" },
  ];

  return (
    <div className="investor-page">
      <p className="investor-page-subtitle">Start a new investment and earn competitive returns</p>

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
                    <span className="invest-tenure-card__rate">{t.rate}% p.a.</span>
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

              <label className="invest-field-label" htmlFor="screenshot">
                Upload Payment Screenshot <span className="invest-required">*</span>
              </label>
              <label htmlFor="screenshot" className="invest-upload-box">
                <UploadCloud size={22} />
                <span>{screenshotName || "Click to upload payment screenshot"}</span>
              </label>
              <input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="invest-upload-input-hidden"
              />

              <div className="invest-form-actions">
                <button className="investor-btn investor-btn--outline" onClick={() => setStep(1)}>
                  &lt; Back
                </button>
                <button
                  className="investor-btn investor-btn--primary"
                  onClick={handleSubmitInvestment}
                  disabled={!canSubmit || processing}
                >
                  {processing ? "Submitting..." : "Submit Investment"} &gt;
                </button>
              </div>
            </div>
          )}

          {step === 3 && createdBond && (
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

        <div className="invest-summary-card">
          <p className="investor-section__title">Investment Summary</p>
          <div className="invest-summary-row">
            <span>Principal Amount</span>
            <span className="mono">{formatINR(amount)}</span>
          </div>
          <div className="invest-summary-row">
            <span>Annual Interest Rate</span>
            <span className="mono">{selectedTenure.rate}% per annum</span>
          </div>
          <div className="invest-summary-row">
            <span>Tenure</span>
            <span className="mono">{tenure} months</span>
          </div>
          <div className="invest-summary-row">
            <span>Monthly Interest</span>
            <span className="mono">{formatINR(monthlyInterest)}</span>
          </div>
          <div className="invest-summary-row">
            <span>Total Interest</span>
            <span className="mono">{formatINR(totalInterest)}</span>
          </div>
          <div className="invest-summary-row invest-summary-row--total">
            <span>Maturity Amount</span>
            <span className="mono">{formatINR(maturityAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}