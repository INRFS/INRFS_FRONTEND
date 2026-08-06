import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle, ClipboardCheck, ShieldCheck, FileCheck2, Landmark } from "lucide-react";
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

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

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
  const [ setCreatedBond] = useState(null);

  const [utr, setUtr] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [payoutBankName, setPayoutBankName] = useState("");

  const banks = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Punjab National Bank",
    "Canara Bank",
    "Union Bank",
  ];

  const { monthlyInterest, totalInterest, maturityAmount } = useMemo(() => {
    const monthly = Math.round((amount * (INITIAL_RATE / 100)));
    const total = monthly * tenure;
    return {
      monthlyInterest: monthly,
      totalInterest: total,
      maturityAmount: amount + total,
    };
  }, [amount, tenure]);

  const ifscValid = IFSC_REGEX.test(ifscCode.trim().toUpperCase());
  const accountNumbersMatch =
    accountNumber.trim().length >= 6 && accountNumber.trim() === confirmAccountNumber.trim();

  const bankDetailsValid =
    accountHolderName.trim().length > 0 &&
    accountNumbersMatch &&
    ifscValid &&
    payoutBankName.trim().length > 0;

  const canContinueFromPayment =
    !!paymentMethod &&
    (paymentMethod !== "netbanking" || !!selectedBank) &&
    utr.trim().length > 0 &&
    bankDetailsValid;

  const canSubmit = utr.trim().length > 0 && bankDetailsValid;

  const handleSubmitInvestment = () => {
    if (!canSubmit) return;
    setProcessing(true);
    setTimeout(() => {
      const inv = addInvestment({
        amount,
        rateValue: INITIAL_RATE,
        tenure,
        utr,
        status: "pending",
        payoutBankDetails: {
          accountHolderName: accountHolderName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          bankName: payoutBankName.trim(),
        },
      });
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

  const paymentMethodLabel =
    paymentMethod === "upi" ? "UPI" : paymentMethod === "netbanking" ? "Net Banking" : "-";

  if (submitted) {
    return (
      <div className="investor-page">
        <div className="invest-form-card">
          <div className="invest-confirmation-step">
            <CheckCircle2 size={48} className="invest-confirmation-icon" />
            <p className="invest-confirmation-title">Investment Request Submitted</p>
            <p className="invest-confirmation-sub">
              Your request for {formatINR(amount)} has been submitted and is pending admin review.
              You'll be notified once it's approved and your bond is generated.
            </p>
          </div>

          <div className="invest-review-card">
            <div className="invest-review-row">
              <span>Reference / UTR</span>
              <span>{utr}</span>
            </div>
            <div className="invest-review-row">
              <span>Principal</span>
              <span>{formatINR(amount)}</span>
            </div>
            <div className="invest-review-row">
              <span>Tenure</span>
              <span>{tenure} months</span>
            </div>
            <div className="invest-review-row">
              <span>Payout Account</span>
              <span>{accountHolderName} · {payoutBankName}</span>
            </div>
            <div className="invest-review-row invest-review-row--last">
              <span>Status</span>
              <span>Pending Approval</span>
            </div>
          </div>

          <div className="invest-form-actions invest-form-actions--center">
            <button
              className="investor-btn investor-btn--outline"
              onClick={() => navigate("/investor/my-investments")}
            >
              View My Investments
            </button>
            <button
              className="investor-btn investor-btn--primary"
              onClick={() => navigate("/investor/dashboard")}
            >
              Go to Dashboard &gt;
            </button>
          </div>
        </div>
      </div>
    );
  }

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

              <label className="invest-field-label invest-field-label--top">
                Select Payment Method
              </label>

              <div className="payment-method-grid">

                <label className={`payment-card ${paymentMethod === "upi" ? "active" : ""}`}>
                  <input
                    type="radio"
                    value="upi"
                    checked={paymentMethod === "upi"}
                    onChange={() => {
                      setPaymentMethod("upi");
                      setSelectedBank("");
                    }}
                  />
                  UPI
                </label>

                <label className={`payment-card ${paymentMethod === "netbanking" ? "active" : ""}`}>
                  <input
                    type="radio"
                    value="netbanking"
                    checked={paymentMethod === "netbanking"}
                    onChange={() => setPaymentMethod("netbanking")}
                  />
                  Net Banking
                </label>

              </div>

              {paymentMethod === "upi" && (
                <div className="invest-upi-box">
                  <p className="invest-upi-title">Pay via UPI</p>
                  <p className="invest-upi-id">UPI ID: {UPI_ID}</p>
                  <p className="invest-upi-amount">{formatINR(amount)}</p>
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <>
                  <label className="invest-field-label">
                    Select Bank to Pay From
                  </label>

                  <select
                    className="invest-select"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                  >
                    <option value="">Choose Bank</option>

                    {banks.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>

                  {selectedBank && (
                    <div className="invest-upi-box">
                      <p><strong>Account Name:</strong> INRFS Pvt Ltd</p>
                      <p><strong>Bank:</strong> {selectedBank}</p>
                      <p><strong>Account No:</strong> 123456789012</p>
                      <p><strong>IFSC:</strong> INRF0001234</p>
                      <p><strong>Amount:</strong> {formatINR(amount)}</p>
                    </div>
                  )}
                </>
              )}

              {paymentMethod && (
                <>
                  <label className="invest-field-label">
                    Transaction Reference Number
                    <span className="invest-required">*</span>
                  </label>

                  <div className="invest-amount-input">
                    <input
                      type="text"
                      placeholder="Enter Transaction ID / UTR"
                      value={utr}
                      onChange={(e) => setUtr(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="invest-payout-card">
                <div className="invest-payout-card__header">
                  <span className="invest-payout-card__icon">
                    <Landmark size={16} />
                  </span>
                  <div>
                    <p className="invest-payout-card__title">
                      Payout Account Details <span className="invest-required">*</span>
                    </p>
                    <p className="invest-payout-card__hint">
                      Interest &amp; maturity amount will be credited here. Different from the bank you pay from above.
                    </p>
                  </div>
                </div>

                <div className="invest-bank-grid">
                  <div className="invest-bank-field">
                    <label className="invest-field-label">
                      Account Holder Name <span className="invest-required">*</span>
                    </label>
                    <div className="invest-amount-input">
                      <input
                        type="text"
                        placeholder="As per bank records"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="invest-bank-field">
                    <label className="invest-field-label">
                      Payout Bank <span className="invest-required">*</span>
                    </label>
                    <select
                      className="invest-select invest-select--nomargin"
                      value={payoutBankName}
                      onChange={(e) => setPayoutBankName(e.target.value)}
                    >
                      <option value="">Choose Bank</option>
                      {banks.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="invest-bank-field">
                    <label className="invest-field-label">
                      Account Number <span className="invest-required">*</span>
                    </label>
                    <div className="invest-amount-input">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter account number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))}
                      />
                    </div>
                  </div>

                  <div className="invest-bank-field">
                    <label className="invest-field-label">
                      Confirm Account Number <span className="invest-required">*</span>
                    </label>
                    <div className="invest-amount-input">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Re-enter account number"
                        value={confirmAccountNumber}
                        onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/[^0-9]/g, ""))}
                      />
                    </div>
                    {confirmAccountNumber.length > 0 && !accountNumbersMatch && (
                      <p className="invest-field-error">Account numbers do not match</p>
                    )}
                  </div>

                  <div className="invest-bank-field invest-bank-field--full">
                    <label className="invest-field-label">
                      IFSC Code <span className="invest-required">*</span>
                    </label>
                    <div className="invest-amount-input">
                      <input
                        type="text"
                        placeholder="e.g. HDFC0001234"
                        value={ifscCode}
                        maxLength={11}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      />
                    </div>
                    {ifscCode.length > 0 && !ifscValid && (
                      <p className="invest-field-error">Enter a valid 11-character IFSC code</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="invest-form-actions">

                <button
                  className="investor-btn investor-btn--outline"
                  onClick={() => setStep(1)}
                >
                  &lt; Back
                </button>

                <button
                  className="investor-btn investor-btn--primary"
                  onClick={() => setStep(3)}
                  disabled={!canContinueFromPayment}
                >
                  Continue to Review &gt;
                </button>

              </div>

            </div>
          )}

          {step === 3 && (
            <div className="invest-review-stepwrap">
              <p className="invest-review-heading">Review Investment Details</p>

              <div className="invest-review-card">
                <div className="invest-review-row">
                  <span>Principal Amount</span>
                  <span>{formatINR(amount)}</span>
                </div>
                <div className="invest-review-row">
                  <span>Tenure</span>
                  <span>{tenure} months</span>
                </div>
                <div className="invest-review-row">
                  <span>Initial Rate</span>
                  <span>{INITIAL_RATE}% per month</span>
                </div>
                <div className="invest-review-row">
                  <span>Expected Monthly Interest</span>
                  <span>{formatINR(monthlyInterest)}</span>
                </div>
                <div className="invest-review-row">
                  <span>Total Interest (est.)</span>
                  <span>{formatINR(totalInterest)}</span>
                </div>
                <div className="invest-review-row">
                  <span>Payment Method</span>
                  <span>{paymentMethodLabel}</span>
                </div>
                {paymentMethod === "netbanking" && (
                  <div className="invest-review-row">
                    <span>Bank Paid From</span>
                    <span>{selectedBank}</span>
                  </div>
                )}
                <div className="invest-review-row invest-review-row--last">
                  <span>Transaction Ref / UTR</span>
                  <span>{utr}</span>
                </div>
              </div>

              <p className="invest-review-heading invest-review-heading--spaced">Payout Account Details</p>
              <div className="invest-review-card">
                <div className="invest-review-row">
                  <span>Account Holder Name</span>
                  <span>{accountHolderName}</span>
                </div>
                <div className="invest-review-row">
                  <span>Payout Bank</span>
                  <span>{payoutBankName}</span>
                </div>
                <div className="invest-review-row">
                  <span>Account Number</span>
                  <span>{accountNumber}</span>
                </div>
                <div className="invest-review-row invest-review-row--last">
                  <span>IFSC Code</span>
                  <span>{ifscCode}</span>
                </div>
              </div>

              <div className="invest-review-note">
                <strong>Please review carefully.</strong> Once submitted, your request will be sent to your
                branch admin for review and approval, and the rate may be adjusted at that stage. Payouts
                will be made only to the account listed above.
              </div>

              <div className="invest-form-actions">
                <button
                  className="investor-btn investor-btn--outline"
                  onClick={() => setStep(2)}
                  disabled={processing}
                >
                  &lt; Back
                </button>

                <button
                  className="investor-btn investor-btn--primary"
                  onClick={handleSubmitInvestment}
                  disabled={!canSubmit || processing}
                >
                  {processing ? "Submitting..." : "Submit Investment >"}
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