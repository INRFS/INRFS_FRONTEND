import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  ShieldCheck,
  FileCheck2,
  Landmark,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  calculateInvestment,
  createInvestment,
  getInvestmentTenures,
} from "../../services/investment_service";
import "../../Styles/Investor/InvestNow.css";

const formatINR = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(number);
};

const workflowSteps = [
  {
    icon: ClipboardCheck,
    title: "Submit Request",
    desc: "Investor submits investment request",
  },
  {
    icon: ShieldCheck,
    title: "Admin Review",
    desc: "Branch admin reviews & sets final rate",
  },
  {
    icon: CheckCircle2,
    title: "Approval",
    desc: "Admin approves and investment becomes Active",
  },
  {
    icon: FileCheck2,
    title: "Bond Generated",
    desc: "Digital bond certificate is issued",
  },
];

export default function InvestNow() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [amount, setAmount] = useState(500000);
  const [tenures, setTenures] = useState([]);
  const [tenureId, setTenureId] = useState("");

  const [calculation, setCalculation] = useState(null);

  const [loadingTenures, setLoadingTenures] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [createdInvestment, setCreatedInvestment] =
    useState(null);

  const [utr, setUtr] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [showBankPopup, setShowBankPopup] =
    useState(false);

  const [selectedBank, setSelectedBank] = useState("");

  // const [showPaymentNotice, setShowPaymentNotice] =
  //   useState(false);

  useEffect(() => {
    loadTenures();
  }, []);

  useEffect(() => {
    if (!amount || !tenureId) {
      setCalculation(null);
      return;
    }

    const timer = setTimeout(() => {
      loadCalculation();
    }, 400);

    return () => clearTimeout(timer);
  }, [amount, tenureId]);

  const loadTenures = async () => {
    try {
      setLoadingTenures(true);
      setError("");

      const data = await getInvestmentTenures();

      const list = Array.isArray(data)
        ? data
        : data?.data || [];

      setTenures(list);

      if (list.length > 0) {
        setTenureId(
          String(
            list.find(
              (item) =>
                Number(item.tenure_months) === 12
            )?.id || list[0].id
          )
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to load investment tenure."
      );
    } finally {
      setLoadingTenures(false);
    }
  };

  const loadCalculation = async () => {
    if (!amount || Number(amount) <= 0 || !tenureId) {
      return;
    }

    try {
      setCalculating(true);
      setError("");

      const data = await calculateInvestment(
        amount,
        tenureId
      );

      setCalculation(data);
    } catch (err) {
      setCalculation(null);

      setError(
        err.message ||
          "Unable to calculate investment."
      );
    } finally {
      setCalculating(false);
    }
  };

  const selectedTenure = useMemo(() => {
    return tenures.find(
      (item) =>
        String(item.id) === String(tenureId)
    );
  }, [tenures, tenureId]);

  const tenureMonths = Number(
    calculation?.tenure_months ||
      selectedTenure?.tenure_months ||
      0
  );

  const interestRate = Number(
    calculation?.interest_rate || 0
  );

  const monthlyInterest = Number(
    calculation?.expected_monthly_interest || 0
  );

  const totalInterest = Number(
    calculation?.expected_interest_amount || 0
  );

  const maturityAmount = Number(
    calculation?.maturity_amount || 0
  );

  const maturityDate =
    calculation?.maturity_date || "";

  const paymentMethodLabel =
    paymentMethod === "upi"
      ? "UPI"
      : paymentMethod === "netbanking"
      ? "Net Banking"
      : "-";

  const canContinueFromStepOne =
    Number(amount) > 0 &&
    !!tenureId &&
    !!calculation &&
    !calculating;

  const canContinueFromPayment =
    !!paymentMethod &&
    utr.trim().length > 0 &&
    (paymentMethod !== "netbanking" ||
      !!selectedBank);

  const handleAmountChange = (event) => {
    const value = event.target.value;

    if (value === "") {
      setAmount("");
      setCalculation(null);
      return;
    }

    const numericValue = Number(value);

    if (numericValue >= 0) {
      setAmount(numericValue);
    }
  };

  const handleTenureChange = (id) => {
    setTenureId(String(id));
    setError("");
  };

  const handleContinueToPayment = async () => {
    if (!canContinueFromStepOne) {
      return;
    }

    try {
      setError("");

      if (!calculation) {
        await loadCalculation();
      }

      setShowBankPopup(true);
    } catch (err) {
      setError(
        err.message ||
          "Unable to continue."
      );
    }
  };

  const handleUpdateBankDetails = () => {
    sessionStorage.setItem(
      "investNowState",
      JSON.stringify({
        amount,
        tenureId,
        step: 2,
        paymentMethod,
        selectedBank,
        utr,
      })
    );

    navigate("/investor/profile", {
      state: {
        returnTo: "/investor/invest-now",
      },
    });
  };

  const handleSubmitInvestment = async () => {
    if (!canContinueFromPayment) {
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const investment =
        await createInvestment(
          amount,
          tenureId
        );

      setCreatedInvestment(investment);
      setSubmitted(true);
    } catch (err) {
      setError(
        err.message ||
          "Unable to submit investment."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleBackToStepOne = () => {
    setStep(1);
    setError("");
  };

  if (submitted) {
    return (
      <div className="investor-page">
        <div className="invest-form-card">
          <div className="invest-confirmation-step">
            <CheckCircle2
              size={48}
              className="invest-confirmation-icon"
            />

            <p className="invest-confirmation-title">
              Investment Request Submitted
            </p>

            <p className="invest-confirmation-sub">
              Your request for{" "}
              {formatINR(amount)} has been
              submitted and is pending admin
              review. You will be notified once
              it is approved.
            </p>
          </div>

          <div className="invest-review-card">
            <div className="invest-review-row">
              <span>Investment ID</span>
              <span>
                {createdInvestment
                  ?.investment_id || "-"}
              </span>
            </div>

            <div className="invest-review-row">
              <span>Principal</span>
              <span>
                {formatINR(amount)}
              </span>
            </div>

            <div className="invest-review-row">
              <span>Interest Rate</span>
              <span>
                {interestRate}% per month
              </span>
            </div>

            <div className="invest-review-row">
              <span>Tenure</span>
              <span>
                {tenureMonths} months
              </span>
            </div>

            <div className="invest-review-row">
              <span>Total Interest</span>
              <span>
                {formatINR(totalInterest)}
              </span>
            </div>

            <div className="invest-review-row">
              <span>Maturity Amount</span>
              <span>
                {formatINR(maturityAmount)}
              </span>
            </div>

            <div className="invest-review-row">
              <span>Reference / UTR</span>
              <span>
                {utr || "-"}
              </span>
            </div>

            <div className="invest-review-row invest-review-row--last">
              <span>Status</span>
              <span>
                Pending Approval
              </span>
            </div>
          </div>

          <div className="invest-form-actions invest-form-actions--center">
            <button
              type="button"
              className="investor-btn investor-btn--outline"
              onClick={() =>
                navigate(
                  "/investor/my-investments"
                )
              }
            >
              View My Investments
            </button>

            <button
              type="button"
              className="investor-btn investor-btn--primary"
              onClick={() =>
                navigate(
                  "/investor/dashboard"
                )
              }
            >
              Go to Dashboard
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="investor-page">

      {error && (
        <div className="invest-error">
          {error}
        </div>
      )}

      <div className="invest-layout">
        <div className="invest-form-card">
          <div className="invest-stepper">
            {[
              {
                num: 1,
                label: "Investment Details",
              },
              {
                num: 2,
                label: "Payment",
              },
              {
                num: 3,
                label: "Confirmation",
              },
            ].map((item, index) => (
              <React.Fragment
                key={item.num}
              >
                <div
                  className={`invest-step${
                    step >= item.num
                      ? " invest-step--active"
                      : ""
                  }`}
                >
                  <span className="invest-step__num">
                    {step > item.num ? (
                      <CheckCircle2
                        size={16}
                      />
                    ) : (
                      item.num
                    )}
                  </span>

                  <span className="invest-step__label">
                    {item.label}
                  </span>
                </div>

                {index < 2 && (
                  <div className="invest-step__connector" />
                )}
              </React.Fragment>
            ))}
          </div>

          {step === 1 && (
            <>
              <div className="invest-rate-banner">
                <AlertTriangle size={18} />

                <p>
                  <strong>
                    Current interest rate:{" "}
                    {calculating
                      ? "Calculating..."
                      : `${interestRate}% per month.`}
                  </strong>{" "}
                  The final rate may be adjusted
                  by your branch admin before
                  approval. Your investment becomes
                  active only after approval.
                </p>
              </div>

              <label
                className="invest-field-label"
                htmlFor="amount"
              >
                Investment Amount (₹)
                <span className="invest-required">
                  *
                </span>
              </label>

              <div className="invest-amount-input">
                <span>₹</span>

                <input
                  id="amount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={
                    handleAmountChange
                  }
                  placeholder="Enter investment amount"
                />
              </div>

              <p className="invest-field-hint">
                Enter the amount you want to
                invest.
              </p>

              <p className="invest-field-label">
                Investment Tenure
                <span className="invest-required">
                  *
                </span>
              </p>

              {loadingTenures ? (
                <div className="invest-loading">
                  Loading investment tenures...
                </div>
              ) : tenures.length === 0 ? (
                <div className="invest-empty">
                  No investment tenure is
                  available.
                </div>
              ) : (
                <div className="invest-tenure-grid">
                  {tenures.map((tenure) => {
                    const months =
                      tenure.tenure_months;

                    return (
                      <button
                        key={tenure.id}
                        type="button"
                        className={`invest-tenure-card${
                          String(
                            tenureId
                          ) ===
                          String(
                            tenure.id
                          )
                            ? " invest-tenure-card--active"
                            : ""
                        }`}
                        onClick={() =>
                          handleTenureChange(
                            tenure.id
                          )
                        }
                      >
                        <span className="invest-tenure-card__months">
                          {months}
                        </span>

                        <span className="invest-tenure-card__unit">
                          Months
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {calculation && (
                <div className="invest-calculation-box">
                  <div>
                    <span>
                      Interest Rate
                    </span>
                    <strong>
                      {interestRate}%
                    </strong>
                  </div>

                  <div>
                    <span>
                      Expected Monthly
                    </span>
                    <strong>
                      {formatINR(
                        monthlyInterest
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Total Interest
                    </span>
                    <strong>
                      {formatINR(
                        totalInterest
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Maturity Amount
                    </span>
                    <strong>
                      {formatINR(
                        maturityAmount
                      )}
                    </strong>
                  </div>
                </div>
              )}

              <div className="invest-form-actions">
                <button
                  type="button"
                  className="investor-btn investor-btn--outline"
                  onClick={() =>
                    navigate(
                      "/investor/dashboard"
                    )
                  }
                >
                  <ChevronLeft
                    size={16}
                  />
                  Cancel
                </button>

                <button
                  type="button"
                  className="investor-btn investor-btn--primary"
                  disabled={
                    !canContinueFromStepOne
                  }
                  onClick={
                    handleContinueToPayment
                  }
                >
                  Continue to Payment
                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="invest-payment-step">
              <label className="invest-field-label invest-field-label--top">
                Select Payment Method
                <span className="invest-required">
                  *
                </span>
              </label>

              <div className="payment-method-grid">
                <label
                  className={`payment-card ${
                    paymentMethod === "upi"
                      ? "active"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    value="upi"
                    checked={
                      paymentMethod ===
                      "upi"
                    }
                    onChange={() => {
                      setPaymentMethod(
                        "upi"
                      );
                      setSelectedBank("");
                    }}
                  />

                  <span>UPI</span>
                </label>

                <label
                  className={`payment-card ${
                    paymentMethod ===
                    "netbanking"
                      ? "active"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    value="netbanking"
                    checked={
                      paymentMethod ===
                      "netbanking"
                    }
                    onChange={() =>
                      setPaymentMethod(
                        "netbanking"
                      )
                    }
                  />

                  <span>
                    Net Banking
                  </span>
                </label>
              </div>

              <div className="invest-payment-info">
                <Landmark size={20} />

                <div>
                  <strong>
                    Payment instructions
                  </strong>

                  <p>
                    Complete the payment using
                    your selected payment method
                    and enter the transaction
                    reference number below.
                  </p>

                  <p>
                    Amount to pay:{" "}
                    <strong>
                      {formatINR(amount)}
                    </strong>
                  </p>
                </div>
              </div>

              {paymentMethod ===
                "netbanking" && (
                <>
                  <label className="invest-field-label">
                    Select Bank
                    <span className="invest-required">
                      *
                    </span>
                  </label>

                  <select
                    className="invest-select"
                    value={selectedBank}
                    onChange={(e) =>
                      setSelectedBank(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Choose Bank
                    </option>
                    <option value="State Bank of India">
                      State Bank of India
                    </option>
                    <option value="HDFC Bank">
                      HDFC Bank
                    </option>
                    <option value="ICICI Bank">
                      ICICI Bank
                    </option>
                    <option value="Axis Bank">
                      Axis Bank
                    </option>
                  </select>
                </>
              )}

              <label className="invest-field-label">
                Transaction Reference Number
                <span className="invest-required">
                  *
                </span>
              </label>

              <div className="invest-amount-input">
                <input
                  type="text"
                  placeholder="Enter Transaction ID / UTR"
                  value={utr}
                  onChange={(e) =>
                    setUtr(e.target.value)
                  }
                />
              </div>

              <div className="invest-form-actions">
                <button
                  type="button"
                  className="investor-btn investor-btn--outline"
                  onClick={
                    handleBackToStepOne
                  }
                >
                  <ChevronLeft
                    size={16}
                  />
                  Back
                </button>

                <button
                  type="button"
                  className="investor-btn investor-btn--primary"
                  disabled={
                    !canContinueFromPayment
                  }
                  onClick={() =>
                    setStep(3)
                  }
                >
                  Continue to Review
                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="invest-review-stepwrap">
              <p className="invest-review-heading">
                Review Investment Details
              </p>

              <div className="invest-review-card">
                <div className="invest-review-row">
                  <span>
                    Principal Amount
                  </span>
                  <span>
                    {formatINR(amount)}
                  </span>
                </div>

                <div className="invest-review-row">
                  <span>
                    Tenure
                  </span>
                  <span>
                    {tenureMonths} months
                  </span>
                </div>

                <div className="invest-review-row">
                  <span>
                    Interest Rate
                  </span>
                  <span>
                    {interestRate}% per month
                  </span>
                </div>

                <div className="invest-review-row">
                  <span>
                    Expected Monthly Interest
                  </span>
                  <span>
                    {formatINR(
                      monthlyInterest
                    )}
                  </span>
                </div>

                <div className="invest-review-row">
                  <span>
                    Total Interest
                  </span>
                  <span>
                    {formatINR(
                      totalInterest
                    )}
                  </span>
                </div>

                <div className="invest-review-row">
                  <span>
                    Maturity Amount
                  </span>
                  <span>
                    {formatINR(
                      maturityAmount
                    )}
                  </span>
                </div>

                {maturityDate && (
                  <div className="invest-review-row">
                    <span>
                      Maturity Date
                    </span>
                    <span>
                      {maturityDate}
                    </span>
                  </div>
                )}

                <div className="invest-review-row">
                  <span>
                    Payment Method
                  </span>
                  <span>
                    {paymentMethodLabel}
                  </span>
                </div>

                {selectedBank && (
                  <div className="invest-review-row">
                    <span>
                      Bank
                    </span>
                    <span>
                      {selectedBank}
                    </span>
                  </div>
                )}

                <div className="invest-review-row invest-review-row--last">
                  <span>
                    Transaction Ref / UTR
                  </span>
                  <span>
                    {utr}
                  </span>
                </div>
              </div>

              <div className="invest-review-note">
                <strong>
                  Please review carefully.
                </strong>{" "}
                Your investment request will be
                submitted to your branch admin.
                The final interest rate may be
                adjusted during approval.
              </div>

              {error && (
                <div className="invest-error">
                  {error}
                </div>
              )}

              <div className="invest-form-actions">
                <button
                  type="button"
                  className="investor-btn investor-btn--outline"
                  onClick={() =>
                    setStep(2)
                  }
                  disabled={processing}
                >
                  <ChevronLeft
                    size={16}
                  />
                  Back
                </button>

                <button
                  type="button"
                  className="investor-btn investor-btn--primary"
                  onClick={
                    handleSubmitInvestment
                  }
                  disabled={
                    !canContinueFromPayment ||
                    processing
                  }
                >
                  {processing ? (
                    "Submitting..."
                  ) : (
                    <>
                      Submit Investment
                      <ChevronRight
                        size={16}
                      />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="invest-side-col">
          <div className="invest-summary-card">
            <p className="investor-section__title">
              Investment Summary
            </p>

            <div className="invest-summary-row">
              <span>
                Principal
              </span>
              <span className="mono">
                {formatINR(amount)}
              </span>
            </div>

            <div className="invest-summary-row">
              <span>
                Interest Rate
              </span>
              <span className="mono">
                {calculating
                  ? "..."
                  : `${interestRate}% per month`}
              </span>
            </div>

            <div className="invest-summary-row">
              <span>
                Tenure
              </span>
              <span className="mono">
                {tenureMonths} months
              </span>
            </div>

            <div className="invest-summary-row">
              <span>
                Expected Monthly
              </span>
              <span className="mono">
                {formatINR(
                  monthlyInterest
                )}
              </span>
            </div>

            <div className="invest-summary-row">
              <span>
                Total Interest
              </span>
              <span className="mono">
                {formatINR(
                  totalInterest
                )}
              </span>
            </div>

            <div className="invest-summary-row invest-summary-row--total">
              <span>
                Maturity Amount
              </span>
              <span className="mono">
                {formatINR(
                  maturityAmount
                )}
              </span>
            </div>

            {maturityDate && (
              <div className="invest-summary-row">
                <span>
                  Maturity Date
                </span>
                <span className="mono">
                  {maturityDate}
                </span>
              </div>
            )}
          </div>

          <div className="invest-workflow-card">
            <p className="invest-workflow-title">
              Investment Workflow
            </p>

            {workflowSteps.map(
              (item, index) => {
                // const Icon = item.icon;

                return (
                  <div
                    className="invest-workflow-row"
                    key={item.title}
                  >
                    <span className="invest-workflow-num">
                      {index + 1}
                    </span>

                    <div>
                      <p className="invest-workflow-row__title">
                        {item.title}
                      </p>

                      <p className="invest-workflow-row__desc">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {showBankPopup && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowBankPopup(false)
          }
        >
          <div
            className="modal-box"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() =>
                setShowBankPopup(false)
              }
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <Landmark size={28} />

            <p className="modal-title">
              Confirm Your Bank Details
            </p>

            <p className="modal-desc">
              Your interest and maturity amount
              will be credited to the bank account
              on your profile. Please make sure
              your bank details are up to date
              before proceeding.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="investor-btn investor-btn--outline"
                onClick={
                  handleUpdateBankDetails
                }
              >
                Update Bank Details
              </button>

              <button
                type="button"
                className="investor-btn investor-btn--primary"
                onClick={() => {
                  setShowBankPopup(false);
                  setStep(2);
                }}
              >
                Continue
                <ChevronRight
                  size={16}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}