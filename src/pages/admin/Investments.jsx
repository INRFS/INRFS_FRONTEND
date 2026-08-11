import React, { useState, useRef } from "react";
import { Plus, Eye, Zap, RefreshCw, Download, X, Printer, Loader2, CheckCircle2, Clock, Pencil, Calendar } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { StatusBadge, formatINR } from "../../shared/Shared";
import "../../Styles/Admin/investments.css";

const initialInvestments = [
  { bondNumber: "BND-2025-001", investorId: "INR-001", investor: "Arjun Sharma", investmentId: "INV001", pan: "ABCDE1234F", mobile: "9876543210", amount: 500000, rate: 12, invested: "15 Jan 2025", matures: "15 Jan 2026", status: "Active" },
  { bondNumber: "BND-2025-002", investorId: "INR-002", investor: "Rahul Kumar", investmentId: "INV003", pan: "BCDEF2345G", mobile: "9876543212", amount: 875000, rate: 13, invested: "18 Jan 2025", matures: "18 Jul 2025", status: "Matured" },
  { bondNumber: "BND-2025-003", investorId: "INR-003", investor: "Neha Gupta", investmentId: "INV006", pan: "CDEFG3456H", mobile: "9876543215", amount: 600000, rate: 11.5, invested: "22 Jan 2025", matures: "22 Jan 2026", status: "Active" },
  {
    bondNumber: null,
    investorId: "INR-004",
    investor: "Priya Patel",
    investmentId: null,
    pan: "—",
    mobile: "9876543211",
    branch: "Delhi North",
    amount: 250000,
    tenureMonths: 12,
    initialRate: 3,
    rate: 3,
    submittedOn: "22 Jul 2025, 10:30 AM",
    txnRef: "UTR887654321",
    invested: "22 Jul 2025",
    matures: null,
    status: "Pending",
  },
  {
    bondNumber: null,
    investorId: "INR-005",
    investor: "Vikram Singh",
    investmentId: null,
    pan: "—",
    mobile: "9876543214",
    branch: "Mumbai HQ",
    amount: 325000,
    tenureMonths: 6,
    initialRate: 3,
    rate: 3,
    submittedOn: "21 Jul 2025, 3:15 PM",
    txnRef: "UTR776543210",
    invested: "21 Jul 2025",
    matures: null,
    status: "Pending",
  },
];

const initialTenureRequests = [
  {
    requestId: "TER-001",
    bondNumber: "BND-2025-001",
    investorId: "INR-001",
    investor: "Arjun Sharma",
    currentRate: 12,
    currentMatures: "15 Jan 2026",
    requestedMonths: 6,
    requestedRate: 12,
    reason: "Would like to continue investment for another 6 months at the same rate.",
    submittedOn: "05 Aug 2025, 11:20 AM",
    status: "Pending",
  },
  {
    requestId: "TER-002",
    bondNumber: "BND-2025-003",
    investorId: "INR-003",
    investor: "Neha Gupta",
    currentRate: 11.5,
    currentMatures: "22 Jan 2026",
    requestedMonths: 12,
    requestedRate: 11.5,
    reason: "Requesting a full 12-month extension on maturity.",
    submittedOn: "04 Aug 2025, 4:05 PM",
    status: "Pending",
  },
];

const STATUS_OPTIONS = ["Active", "Pending", "Matured"];
const emptyForm = {
  investorId: "",
  investor: "",
  investmentId: "",
  pan: "",
  mobile: "",
  amount: "",
  rate: "",
  invested: "",
  matures: "",
  status: "Pending",
};

function nextInvestorId(list) {
  const max = list.reduce((acc, inv) => {
    if (!inv.investorId) return acc;
    const num = parseInt(inv.investorId.replace(/\D/g, ""), 10);
    return Number.isNaN(num) ? acc : Math.max(acc, num);
  }, 0);
  return `INR-${String(max + 1).padStart(3, "0")}`;
}

function nextBondNumber(list) {
  const year = new Date().getFullYear();
  const max = list.reduce((acc, inv) => {
    if (!inv.bondNumber) return acc;
    const num = parseInt(inv.bondNumber.split("-").pop(), 10);
    return Number.isNaN(num) ? acc : Math.max(acc, num);
  }, 0);
  return `BND-${year}-${String(max + 1).padStart(3, "0")}`;
}

function nextInvestmentId(list) {
  const max = list.reduce((acc, inv) => {
    if (!inv.investmentId) return acc;
    const num = parseInt(inv.investmentId.replace(/\D/g, ""), 10);
    return Number.isNaN(num) ? acc : Math.max(acc, num);
  }, 0);
  return `INV${String(max + 1).padStart(3, "0")}`;
}

function formatDateDisplay(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function parseDisplayDate(displayStr) {
  const parsed = new Date(displayStr);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return new Date();
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + Number(months));
  return d;
}

function monthsBetween(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 12;
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(months, 1);
}

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigitWords(n) {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${TENS[t]}${o ? " " + ONES[o] : ""}`;
}

function threeDigitWords(n) {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return `${h ? ONES[h] + " Hundred" : ""}${h && rest ? " " : ""}${rest ? twoDigitWords(rest) : ""}`;
}

function amountInWords(amount) {
  const n = Math.round(amount);
  if (n === 0) return "Zero Rupees Only";
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = n % 1000;

  const parts = [];
  if (crore) parts.push(`${threeDigitWords(crore)} Crore`);
  if (lakh) parts.push(`${threeDigitWords(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigitWords(thousand)} Thousand`);
  if (hundred) parts.push(threeDigitWords(hundred));

  return `${parts.join(" ")} Rupees Only`;
}

function BondCertificate({ investment, onClose }) {
  const durationMonths = monthsBetween(investment.invested, investment.matures);
  const totalInterest = Math.round((investment.amount * investment.rate * durationMonths) / (100 * 12));
  const monthlyInterest = Math.round((investment.amount * investment.rate) / (100 * 12));
  const maturityAmount = investment.amount + totalInterest;

  const printableRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!printableRef.current || downloading) return;
    setDownloading(true);
    try {
      const node = printableRef.current;

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Bond-Certificate-${investment.bondNumber}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Could not generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bond-modal-overlay" onClick={onClose}>
      <div className="bond-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bond-modal-toolbar">
          <button className="admin-btn admin-btn--outline" onClick={onClose}>
            <X size={14} /> Close Preview
          </button>
          <div className="bond-modal-toolbar-right">
            <button className="admin-btn admin-btn--outline" onClick={() => window.print()}>
              <Printer size={14} /> Print Bond
            </button>
            <button
              className="admin-btn admin-btn--primary"
              onClick={handleDownloadPdf}
              disabled={downloading}
            >
              {downloading ? <Loader2 size={14} className="spin" /> : <Download size={14} />}
              {downloading ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>

        <div className="bond-certificate-printable" ref={printableRef}>
          <div className="bond-certificate">
            <div className="bond-cert-header">
              <div className="bond-cert-logo">IN</div>
              <div>
                <div className="bond-cert-brand">INRFS</div>
                <div className="bond-cert-brand-sub">Investor Management &amp; Investment Portal</div>
              </div>
            </div>

            <h2 className="bond-cert-title">INVESTMENT BOND CERTIFICATE</h2>
            <div className="bond-cert-subtitle">FIXED INCOME INVESTMENT — GOVERNMENT COMPLIANT</div>
            <div className="bond-cert-number">{investment.bondNumber}</div>

            <div className="bond-cert-principal">
              <div className="bond-cert-principal-label">INVESTED PRINCIPAL AMOUNT</div>
              <div className="bond-cert-principal-amount">{formatINR(investment.amount)}</div>
              <div className="bond-cert-principal-words">{amountInWords(investment.amount)}</div>
            </div>

            <div className="bond-cert-grid">
              <div>
                <div className="bond-cert-field-label">INVESTOR NAME</div>
                <div className="bond-cert-field-value">{investment.investor}</div>
              </div>
              <div>
                <div className="bond-cert-field-label">INVESTMENT ID</div>
                <div className="bond-cert-field-value">{investment.investmentId}</div>
              </div>
              <div>
                <div className="bond-cert-field-label">PAN NUMBER</div>
                <div className="bond-cert-field-value">{investment.pan}</div>
              </div>
              <div>
                <div className="bond-cert-field-label">MOBILE</div>
                <div className="bond-cert-field-value">+91 {investment.mobile}</div>
              </div>
              <div>
                <div className="bond-cert-field-label">INVESTMENT DATE</div>
                <div className="bond-cert-field-value">{formatDateDisplay(investment.invested)}</div>
              </div>
              <div>
                <div className="bond-cert-field-label">MATURITY DATE</div>
                <div className="bond-cert-field-value">{formatDateDisplay(investment.matures)}</div>
              </div>
              <div>
                <div className="bond-cert-field-label">INTEREST RATE</div>
                <div className="bond-cert-field-value">{investment.rate}% per annum</div>
              </div>
              <div>
                <div className="bond-cert-field-label">MONTHLY INTEREST</div>
                <div className="bond-cert-field-value">{formatINR(monthlyInterest)}</div>
              </div>
              <div>
                <div className="bond-cert-field-label">TOTAL INTEREST</div>
                <div className="bond-cert-field-value">
                  {formatINR(totalInterest)} ({durationMonths} months)
                </div>
              </div>
              <div>
                <div className="bond-cert-field-label">MATURITY AMOUNT</div>
                <div className="bond-cert-field-value">{formatINR(maturityAmount)}</div>
              </div>
            </div>

            <div className="bond-cert-qr">
              <div className="bond-cert-qr-box" />
              <div className="bond-cert-qr-label">QR Verification Code</div>
              <div className="bond-cert-qr-link">verify.inrfs.in/{investment.bondNumber}</div>
            </div>

            <p className="bond-cert-legal">
              This bond certifies that the above named investor has deposited the stated principal
              amount with INRFS Investment Portal. The investment carries a fixed rate of interest as
              stated above, payable monthly. This bond is non-transferable and subject to INRFS terms
              and conditions.
            </p>

            <div className="bond-cert-signatures">
              <div className="bond-cert-signature">
                <div className="bond-cert-signature-line" />
                <div>Investor Signature</div>
              </div>
              <div className="bond-cert-seal">SEAL</div>
              <div className="bond-cert-signature">
                <div className="bond-cert-signature-line" />
                <div>Authorized Signatory</div>
              </div>
            </div>

            <div className="bond-cert-footer">
              INRFS Investment Portal | CIN: U65999KA2020PTC123456 | SEBI Reg: INZ123456789
              <br />
              Verify at: verify.inrfs.in/{investment.bondNumber}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddInvestmentModal({ existing, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.investor.trim()) errs.investor = "Investor name is required";
    if (!form.amount || Number(form.amount) <= 0) errs.amount = "Enter a valid amount";
    if (!form.rate || Number(form.rate) <= 0) errs.rate = "Enter a valid interest rate";
    if (!form.invested) errs.invested = "Investment date is required";
    if (!form.matures) errs.matures = "Maturity date is required";
    if (form.mobile && !/^\d{10}$/.test(form.mobile.trim())) errs.mobile = "Enter a 10-digit mobile number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      bondNumber: nextBondNumber(existing),
      investorId: form.investorId.trim() || nextInvestorId(existing),
      investor: form.investor.trim(),
      investmentId: form.investmentId.trim() || nextInvestmentId(existing),
      pan: form.pan.trim() || "—",
      mobile: form.mobile.trim() || "—",
      amount: Number(form.amount),
      rate: Number(form.rate),
      invested: formatDateDisplay(form.invested),
      matures: formatDateDisplay(form.matures),
      status: form.status,
    });
  };

  return (
    <div className="bond-modal-overlay" onClick={onClose}>
      <div className="admin-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-form-modal-header">
          <h2>Add Investment</h2>
          <button className="admin-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form-modal-body">
          <div className="admin-form-row-split">
            <div className="admin-form-row">
              <label>Investor ID (leave blank to auto-generate)</label>
              <input type="text" value={form.investorId} onChange={handleChange("investorId")} placeholder="e.g. INR-006" />
            </div>
            <div className="admin-form-row">
              <label>Investor Name</label>
              <input type="text" value={form.investor} onChange={handleChange("investor")} placeholder="e.g. Arjun Sharma" />
              {errors.investor && <span className="admin-form-error">{errors.investor}</span>}
            </div>
          </div>

          <div className="admin-form-row-split">
            <div className="admin-form-row">
              <label>Investment ID (leave blank to auto-generate)</label>
              <input type="text" value={form.investmentId} onChange={handleChange("investmentId")} placeholder="e.g. INV007" />
            </div>
            <div className="admin-form-row">
              <label>PAN Number</label>
              <input type="text" value={form.pan} onChange={handleChange("pan")} placeholder="e.g. ABCDE1234F" />
            </div>
          </div>

          <div className="admin-form-row">
            <label>Mobile</label>
            <input type="text" value={form.mobile} onChange={handleChange("mobile")} placeholder="10-digit mobile number" />
            {errors.mobile && <span className="admin-form-error">{errors.mobile}</span>}
          </div>

          <div className="admin-form-row-split">
            <div className="admin-form-row">
              <label>Investment Amount (₹)</label>
              <input type="number" value={form.amount} onChange={handleChange("amount")} placeholder="e.g. 500000" />
              {errors.amount && <span className="admin-form-error">{errors.amount}</span>}
            </div>
            <div className="admin-form-row">
              <label>Interest Rate (% p.a.)</label>
              <input type="number" step="0.1" value={form.rate} onChange={handleChange("rate")} placeholder="e.g. 12" />
              {errors.rate && <span className="admin-form-error">{errors.rate}</span>}
            </div>
          </div>

          <div className="admin-form-row-split">
            <div className="admin-form-row">
              <label>Investment Date</label>
              <input type="date" value={form.invested} onChange={handleChange("invested")} />
              {errors.invested && <span className="admin-form-error">{errors.invested}</span>}
            </div>
            <div className="admin-form-row">
              <label>Maturity Date</label>
              <input type="date" value={form.matures} onChange={handleChange("matures")} />
              {errors.matures && <span className="admin-form-error">{errors.matures}</span>}
            </div>
          </div>

          <div className="admin-form-row">
            <label>Status</label>
            <select value={form.status} onChange={handleChange("status")}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="admin-form-modal-actions">
            <button type="button" className="admin-btn admin-btn--outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn--primary">
              Add Investment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewInvestmentModal({ investment, onClose }) {
  return (
    <div className="bond-modal-overlay" onClick={onClose}>
      <div className="admin-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-form-modal-header">
          <h2>Investment Details</h2>
          <button className="admin-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="admin-form-modal-body">
          <div className="admin-form-row">
            <label>Bond Number</label>
            <span className="mono">{investment.bondNumber}</span>
          </div>
          <div className="admin-form-row-split">
            <div className="admin-form-row">
              <label>Investor ID</label>
              <span className="mono">{investment.investorId}</span>
            </div>
            <div className="admin-form-row">
              <label>Investor Name</label>
              <span>{investment.investor}</span>
            </div>
          </div>
          <div className="admin-form-row-split">
            <div className="admin-form-row">
              <label>Investment ID</label>
              <span className="mono">{investment.investmentId}</span>
            </div>
            <div className="admin-form-row">
              <label>PAN Number</label>
              <span className="mono">{investment.pan}</span>
            </div>
          </div>
          <div className="admin-form-row">
            <label>Mobile</label>
            <span>+91 {investment.mobile}</span>
          </div>
          <div className="admin-form-row-split">
            <div className="admin-form-row">
              <label>Investment Amount</label>
              <span className="mono">{formatINR(investment.amount)}</span>
            </div>
            <div className="admin-form-row">
              <label>Interest Rate</label>
              <span>{investment.rate}% p.a.</span>
            </div>
          </div>
          <div className="admin-form-row-split">
            <div className="admin-form-row">
              <label>Investment Date</label>
              <span>{investment.invested}</span>
            </div>
            <div className="admin-form-row">
              <label>Maturity Date</label>
              <span>{investment.matures}</span>
            </div>
          </div>
          <div className="admin-form-row">
            <label>Status</label>
            <span><StatusBadge status={investment.status} /></span>
          </div>

          <div className="admin-form-modal-actions">
            <button type="button" className="admin-btn admin-btn--outline" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RenewTenureModal({ investment, onClose, onApprove }) {
  const [extraMonths, setExtraMonths] = useState(3);
  const [newRate, setNewRate] = useState(investment.rate);
  const [remarks, setRemarks] = useState("");

  const currentMaturity = parseDisplayDate(investment.matures);
  const newMaturity = addMonths(currentMaturity, extraMonths);

  const handleSubmit = (e) => {
    e.preventDefault();
    onApprove({
      bondNumber: investment.bondNumber,
      newMatures: formatDateDisplay(newMaturity.toISOString()),
      newRate: Number(newRate),
      remarks: remarks.trim(),
    });
  };

  return (
    <div className="bond-modal-overlay" onClick={onClose}>
      <div className="admin-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-form-modal-header">
          <h2>Renew / Increase Tenure</h2>
          <button className="admin-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form-modal-body">
          <div className="admin-form-row">
            <label>Investor</label>
            <span>{investment.investor} <span className="mono">({investment.investmentId})</span></span>
          </div>

          <div className="admin-form-row-split">
            <div className="admin-form-row">
              <label>Current Tenure Ends</label>
              <span>{investment.matures}</span>
            </div>
            <div className="admin-form-row">
              <label>Current Rate</label>
              <span>{investment.rate}% p.a.</span>
            </div>
          </div>

          <div className="admin-form-row-split">
            <div className="admin-form-row">
              <label>Extend By (months)</label>
              <input
                type="number"
                min="1"
                value={extraMonths}
                onChange={(e) => setExtraMonths(e.target.value)}
              />
            </div>
            <div className="admin-form-row">
              <label>New Rate (% p.a.)</label>
              <input
                type="number"
                step="0.1"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <label>New Maturity Date</label>
            <span className="mono">{formatDateDisplay(newMaturity.toISOString())}</span>
          </div>

          <div className="admin-form-row">
            <label>Remarks (optional)</label>
            <textarea
              className="kyc-remarks"
              placeholder="Add remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="admin-form-modal-actions">
            <button type="button" className="admin-btn admin-btn--outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn--approve">
              <CheckCircle2 size={14} /> Review &amp; Approve
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReviewApproveModal({ investment, existing, onClose, onApprove, onReject }) {
  const [rate, setRate] = useState(investment.initialRate ?? 3);
  const [investmentId, setInvestmentId] = useState(() => nextInvestmentId(existing));
  const monthlyInterest = Math.round((investment.amount * Number(rate || 0)) / 100);
  const quickRates = [2, 2.5, 3, 3.5, 4];

  return (
    <div className="bond-modal-overlay" onClick={onClose}>
      <div className="im-review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-form-modal-header">
          <h2>Review &amp; Approve Investment</h2>
          <button className="admin-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="im-review-body">
          <div className="im-review-details">
            <p className="im-review-details__title">Investment Details</p>
            <div className="im-review-grid">
              <div>
                <span className="im-review-label">Investor ID</span>
                <span className="im-review-value mono">{investment.investorId}</span>
              </div>
              <div>
                <span className="im-review-label">Investor</span>
                <span className="im-review-value">{investment.investor}</span>
              </div>
              <div>
                <span className="im-review-label">Investment ID</span>
                <input
                  type="text"
                  className="im-review-id-input"
                  value={investmentId}
                  onChange={(e) => setInvestmentId(e.target.value)}
                  placeholder="e.g. INV007"
                />
              </div>
              <div>
                <span className="im-review-label">Branch</span>
                <span className="im-review-value">{investment.branch}</span>
              </div>
              <div>
                <span className="im-review-label">Amount</span>
                <span className="im-review-value">{formatINR(investment.amount)}</span>
              </div>
              <div>
                <span className="im-review-label">Tenure</span>
                <span className="im-review-value">{investment.tenureMonths} months</span>
              </div>
              <div>
                <span className="im-review-label">Transaction Ref</span>
                <span className="im-review-value mono">{investment.txnRef}</span>
              </div>
            </div>
          </div>

          <div className="im-rate-box">
            <p className="im-rate-box__title">Set Final Interest Rate</p>
            <p className="im-rate-box__hint">
              Investor submitted at {investment.initialRate}% per month. You can adjust the rate before approving.
            </p>

            <div className="im-rate-input-row">
              <div className="im-rate-input-field">
                <label>Interest Rate (% per month)</label>
                <input
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>
              <div className="im-rate-preview">
                <span>Monthly Interest</span>
                <strong>{formatINR(monthlyInterest)}</strong>
              </div>
            </div>

            <div className="im-rate-quick-row">
              {quickRates.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`im-rate-quick-btn${Number(rate) === r ? " im-rate-quick-btn--active" : ""}`}
                  onClick={() => setRate(r)}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          <div className="im-info-box">
            Approving will: <strong>assign investment ID {investmentId || "(auto)"}, activate the investment, assign a bond number,</strong> and{" "}
            <strong>generate the digital bond certificate at {rate}% per month.</strong> The investor
            will be notified automatically.
          </div>
        </div>

        <div className="admin-form-modal-actions im-review-actions">
          <button className="admin-btn admin-btn--outline" onClick={onClose}>
            Cancel
          </button>
          <button className="admin-btn admin-btn--reject-solid" onClick={() => onReject(investment.txnRef)}>
            <X size={14} /> Reject
          </button>
          <button
            className="admin-btn admin-btn--approve"
            onClick={() => onApprove(investment.txnRef, rate, investmentId)}
          >
            <CheckCircle2 size={14} /> Approve &amp; Generate Bond
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectConfirmModal({ investment, onClose, onConfirm }) {
  return (
    <div className="bond-modal-overlay" onClick={onClose}>
      <div className="admin-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-form-modal-header">
          <h2>Reject Investment Request</h2>
          <button className="admin-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="admin-form-modal-body">
          <p className="im-confirm-text">
            Are you sure you want to reject the investment request from{" "}
            <strong>{investment.investor}</strong> for{" "}
            <strong>{formatINR(investment.amount)}</strong>? This cannot be undone.
          </p>

          <div className="admin-form-modal-actions">
            <button className="admin-btn admin-btn--outline" onClick={onClose}>
              Cancel
            </button>
            <button
              className="admin-btn admin-btn--reject-solid"
              onClick={() => onConfirm(investment.txnRef)}
            >
              <X size={14} /> Confirm Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewTenureRequestModal({ request, onClose, onApprove, onReject }) {
  const [months, setMonths] = useState(request.requestedMonths);
  const [rate, setRate] = useState(request.requestedRate ?? request.currentRate);
  const [remarks, setRemarks] = useState("");

  const currentMaturity = parseDisplayDate(request.currentMatures);
  const newMaturity = addMonths(currentMaturity, months);

  return (
    <div className="bond-modal-overlay" onClick={onClose}>
      <div className="im-review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-form-modal-header">
          <h2>Review Tenure Extend Request</h2>
          <button className="admin-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="im-review-body">
          <div className="im-review-details">
            <p className="im-review-details__title">Request Details</p>
            <div className="im-review-grid">
              <div>
                <span className="im-review-label">Investor ID</span>
                <span className="im-review-value mono">{request.investorId}</span>
              </div>
              <div>
                <span className="im-review-label">Investor</span>
                <span className="im-review-value">{request.investor}</span>
              </div>
              <div>
                <span className="im-review-label">Bond Number</span>
                <span className="im-review-value mono">{request.bondNumber}</span>
              </div>
              <div>
                <span className="im-review-label">Current Maturity</span>
                <span className="im-review-value">{request.currentMatures}</span>
              </div>
              <div>
                <span className="im-review-label">Current Rate</span>
                <span className="im-review-value">{request.currentRate}% p.a.</span>
              </div>
              <div>
                <span className="im-review-label">Requested Extension</span>
                <span className="im-review-value">{request.requestedMonths} months</span>
              </div>
              <div>
                <span className="im-review-label">Submitted On</span>
                <span className="im-review-value">{request.submittedOn}</span>
              </div>
            </div>
            {request.reason && (
              <p className="im-confirm-text" style={{ marginTop: 12 }}>
                <strong>Investor's note:</strong> {request.reason}
              </p>
            )}
          </div>

          <div className="im-rate-box">
            <p className="im-rate-box__title">Confirm Extension Terms</p>
            <p className="im-rate-box__hint">
              Adjust the extension length or rate before approving. Rejecting will notify the investor
              their request was not accepted.
            </p>

            <div className="im-rate-input-row">
              <div className="im-rate-input-field">
                <label>Extend By (months)</label>
                <input
                  type="number"
                  min="1"
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                />
              </div>
              <div className="im-rate-input-field">
                <label>New Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-row">
              <label>New Maturity Date</label>
              <span className="mono">{formatDateDisplay(newMaturity.toISOString())}</span>
            </div>

            <div className="admin-form-row">
              <label>Remarks (optional)</label>
              <textarea
                className="kyc-remarks"
                placeholder="Add remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          <div className="im-info-box">
            Approving will extend bond <strong>{request.bondNumber}</strong> to{" "}
            <strong>{formatDateDisplay(newMaturity.toISOString())}</strong> at{" "}
            <strong>{rate}% p.a.</strong> The investor will be notified automatically.
          </div>
        </div>

        <div className="admin-form-modal-actions im-review-actions">
          <button className="admin-btn admin-btn--outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="admin-btn admin-btn--reject-solid"
            onClick={() => onReject(request.requestId)}
          >
            <X size={14} /> Reject
          </button>
          <button
            className="admin-btn admin-btn--approve"
            onClick={() =>
              onApprove(request.requestId, {
                newMonths: Number(months),
                newRate: Number(rate),
                remarks: remarks.trim(),
              })
            }
          >
            <CheckCircle2 size={14} /> Approve Extension
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectTenureRequestModal({ request, onClose, onConfirm }) {
  return (
    <div className="bond-modal-overlay" onClick={onClose}>
      <div className="admin-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-form-modal-header">
          <h2>Reject Tenure Extend Request</h2>
          <button className="admin-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="admin-form-modal-body">
          <p className="im-confirm-text">
            Are you sure you want to reject the tenure extension request from{" "}
            <strong>{request.investor}</strong> for bond{" "}
            <strong>{request.bondNumber}</strong>? This cannot be undone.
          </p>

          <div className="admin-form-modal-actions">
            <button className="admin-btn admin-btn--outline" onClick={onClose}>
              Cancel
            </button>
            <button
              className="admin-btn admin-btn--reject-solid"
              onClick={() => onConfirm(request.requestId)}
            >
              <X size={14} /> Confirm Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Investments() {
  const [investments, setInvestments] = useState(initialInvestments);
  const [tenureRequests, setTenureRequests] = useState(initialTenureRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [showAddModal, setShowAddModal] = useState(false);
  const [bondInvestment, setBondInvestment] = useState(null);
  const [viewInvestment, setViewInvestment] = useState(null);
  const [renewInvestment, setRenewInvestment] = useState(null);
  const [reviewInvestment, setReviewInvestment] = useState(null);
  const [rejectInvestment, setRejectInvestment] = useState(null);
  const [reviewTenureRequest, setReviewTenureRequest] = useState(null);
  const [rejectTenureRequest, setRejectTenureRequest] = useState(null);

  const pendingInvestments = investments.filter((inv) => inv.status === "Pending");
  const pendingTenureRequests = tenureRequests.filter((r) => r.status === "Pending");

  const filteredInvestments = investments.filter((inv) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (inv.bondNumber || "").toLowerCase().includes(q) ||
      (inv.investorId || "").toLowerCase().includes(q) ||
      inv.investor.toLowerCase().includes(q) ||
      (inv.investmentId || "").toLowerCase().includes(q)
    );
  });

  const handleAddInvestment = (newInvestment) => {
    setInvestments((prev) => [newInvestment, ...prev]);
    setShowAddModal(false);
  };

  const handleApproveRenewal = ({ bondNumber, newMatures, newRate, remarks }) => {
    setInvestments((prev) =>
      prev.map((inv) =>
        inv.bondNumber === bondNumber
          ? { ...inv, matures: newMatures, rate: newRate, status: "Active" }
          : inv
      )
    );
    setRenewInvestment(null);
  };

  // Investment ID and Bond Number are BOTH generated here, only on approval.
  // investmentIdOverride lets the reviewer edit the auto-generated ID before confirming.
  const handleApproveInvestment = (txnRef, monthlyRatePercent, investmentIdOverride) => {
    setInvestments((prev) => {
      const bondNumber = nextBondNumber(prev);
      const investmentId = (investmentIdOverride || "").trim() || nextInvestmentId(prev);
      const investedDate = new Date();
      return prev.map((inv) => {
        if (inv.txnRef !== txnRef) return inv;
        const annualRate = Number(monthlyRatePercent) * 12;
        const maturityDate = addMonths(investedDate, inv.tenureMonths || 12);
        return {
          ...inv,
          investmentId,
          bondNumber,
          rate: annualRate,
          invested: formatDateDisplay(investedDate.toISOString()),
          matures: formatDateDisplay(maturityDate.toISOString()),
          status: "Active",
        };
      });
    });
    setReviewInvestment(null);
  };

  const handleRejectInvestment = (txnRef) => {
    setInvestments((prev) =>
      prev.map((inv) => (inv.txnRef === txnRef ? { ...inv, status: "Rejected" } : inv))
    );
    setReviewInvestment(null);
    setRejectInvestment(null);
  };

  const handleApproveTenureRequest = (requestId, { newMonths, newRate, remarks }) => {
    const request = tenureRequests.find((r) => r.requestId === requestId);
    if (!request) return;

    const currentMaturity = parseDisplayDate(request.currentMatures);
    const newMaturity = addMonths(currentMaturity, newMonths);
    const newMaturesDisplay = formatDateDisplay(newMaturity.toISOString());

    setInvestments((prev) =>
      prev.map((inv) =>
        inv.bondNumber === request.bondNumber
          ? { ...inv, matures: newMaturesDisplay, rate: newRate, status: "Active" }
          : inv
      )
    );

    setTenureRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId
          ? { ...r, status: "Approved", currentMatures: newMaturesDisplay, currentRate: newRate }
          : r
      )
    );

    setReviewTenureRequest(null);
  };

  const handleRejectTenureRequest = (requestId) => {
    setTenureRequests((prev) =>
      prev.map((r) => (r.requestId === requestId ? { ...r, status: "Rejected" } : r))
    );
    setReviewTenureRequest(null);
    setRejectTenureRequest(null);
  };

  return (
    <div className="admin-page">
      <div className="im-page-header">
        <div>
          <h1>Investment Management</h1>
          <p>Review pending requests and manage active investments</p>
        </div>
        <div className="im-page-header-actions">
          <span className="im-pending-pill">{pendingInvestments.length} Pending Approval</span>
          <button className="admin-btn admin-btn--primary" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add Investment
          </button>
        </div>
      </div>

      <div className="im-tabs">
        <button
          className={`im-tab${activeTab === "pending" ? " im-tab--active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Approval <span className="im-tab-count">{pendingInvestments.length}</span>
        </button>
        <button
          className={`im-tab${activeTab === "tenure" ? " im-tab--active" : ""}`}
          onClick={() => setActiveTab("tenure")}
        >
          Tenure Extend Requests <span className="im-tab-count">{pendingTenureRequests.length}</span>
        </button>
        <button
          className={`im-tab${activeTab === "all" ? " im-tab--active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Investments
        </button>
      </div>

      {activeTab === "pending" && (
        <div className="admin-table-card">
          <table className="data-table im-pending-table">
            <thead>
              <tr>
                <th>Investor ID</th>
                <th>Investor</th>
                <th>Investment ID</th>
                <th>Branch</th>
                <th>Amount</th>
                <th>Tenure</th>
                <th>Initial Rate</th>
                <th>Submitted On</th>
                <th>Txn Ref</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingInvestments.length === 0 && (
                <tr>
                  <td colSpan={10} className="admin-no-results">
                    No pending investment requests.
                  </td>
                </tr>
              )}
              {pendingInvestments.map((inv) => (
                <tr key={inv.txnRef}>
                  <td className="mono">{inv.investorId}</td>
                  <td className="im-investor-name">{inv.investor}</td>
                  <td><span className="im-muted">Pending</span></td>
                  <td>{inv.branch}</td>
                  <td className="mono">{formatINR(inv.amount)}</td>
                  <td>{inv.tenureMonths} months</td>
                  <td><span className="im-rate-pill">{inv.initialRate}% p.m.</span></td>
                  <td className="im-muted">{inv.submittedOn}</td>
                  <td className="mono">{inv.txnRef}</td>
                  <td>
                    <div className="im-actions">
                      <button className="im-approve-btn" onClick={() => setReviewInvestment(inv)}>
                        <Pencil size={12} /> Review &amp; Approve
                      </button>
                      <button
                        className="im-reject-btn"
                        title="Reject"
                        onClick={() => setRejectInvestment(inv)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "tenure" && (
        <div className="admin-table-card">
          <table className="data-table im-pending-table">
            <thead>
              <tr>
                <th>Investor ID</th>
                <th>Investor</th>
                <th>Bond Number</th>
                <th>Current Maturity</th>
                <th>Current Rate</th>
                <th>Requested Extension</th>
                <th>Submitted On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenureRequests.length === 0 && (
                <tr>
                  <td colSpan={9} className="admin-no-results">
                    No tenure extension requests.
                  </td>
                </tr>
              )}
              {tenureRequests.map((req) => (
                <tr key={req.requestId}>
                  <td className="mono">{req.investorId}</td>
                  <td className="im-investor-name">{req.investor}</td>
                  <td className="mono link">{req.bondNumber}</td>
                  <td>{req.currentMatures}</td>
                  <td><span className="im-rate-pill">{req.currentRate}% p.a.</span></td>
                  <td>
                    <span className="im-rate-pill">
                      <Calendar size={11} style={{ marginRight: 4 }} />
                      +{req.requestedMonths} months
                    </span>
                  </td>
                  <td className="im-muted">{req.submittedOn}</td>
                  <td><StatusBadge status={req.status} /></td>
                  <td>
                    {req.status === "Pending" ? (
                      <div className="im-actions">
                        <button className="im-approve-btn" onClick={() => setReviewTenureRequest(req)}>
                          <Pencil size={12} /> Review &amp; Approve
                        </button>
                        <button
                          className="im-reject-btn"
                          title="Reject"
                          onClick={() => setRejectTenureRequest(req)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="im-muted">
                        {req.status === "Approved" ? "Extension applied" : "Request closed"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "all" && (
        <div className="admin-table-card">
          <div className="admin-table-card__header">
            <input
              className="admin-search-input"
              placeholder="Search bonds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="admin-btn admin-btn--outline"><Download size={14} /> Export</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Bond Number</th>
                <th>Investor ID</th>
                <th>Investor</th>
                <th>Investment ID</th>
                <th>Amount</th>
                <th>Rate</th>
                <th>Invested</th>
                <th>Matures</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvestments.length === 0 && (
                <tr>
                  <td colSpan={10} className="admin-no-results">No bonds match your search.</td>
                </tr>
              )}
              {filteredInvestments.map((inv) => (
                <tr key={inv.txnRef || inv.investmentId}>
                  <td className="mono link">{inv.bondNumber || "—"}</td>
                  <td className="mono">{inv.investorId || "—"}</td>
                  <td>{inv.investor}</td>
                  <td className="mono">{inv.investmentId || "—"}</td>
                  <td className="mono">{formatINR(inv.amount)}</td>
                  <td><span className="rate-pill">{inv.rate}%</span></td>
                  <td>{inv.invested}</td>
                  <td>{inv.matures || "—"}</td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td className="admin-table-actions">
                    {inv.status === "Pending" ? (
                      <span className="admin-pending-note">
                        <Clock size={12} /> Awaiting Approval
                      </span>
                    ) : (
                      <>
                        <button title="View" onClick={() => setViewInvestment(inv)}>
                          <Eye size={14} />
                        </button>
                        <button title="Bond" className="admin-icon-btn--primary" onClick={() => setBondInvestment(inv)}>
                          <Zap size={14} /> Bond
                        </button>
                        <button title="Renew / Increase Tenure" className="admin-icon-btn--accent" onClick={() => setRenewInvestment(inv)}>
                          <RefreshCw size={14} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="admin-table-footer">
            Showing {filteredInvestments.length === 0 ? 0 : 1}-{filteredInvestments.length} of {investments.length} records
          </p>
        </div>
      )}

      {showAddModal && (
        <AddInvestmentModal
          existing={investments}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddInvestment}
        />
      )}

      {bondInvestment && (
        <BondCertificate investment={bondInvestment} onClose={() => setBondInvestment(null)} />
      )}

      {viewInvestment && (
        <ViewInvestmentModal investment={viewInvestment} onClose={() => setViewInvestment(null)} />
      )}

      {renewInvestment && (
        <RenewTenureModal
          investment={renewInvestment}
          onClose={() => setRenewInvestment(null)}
          onApprove={handleApproveRenewal}
        />
      )}

      {reviewInvestment && (
        <ReviewApproveModal
          investment={reviewInvestment}
          existing={investments}
          onClose={() => setReviewInvestment(null)}
          onApprove={handleApproveInvestment}
          onReject={handleRejectInvestment}
        />
      )}

      {rejectInvestment && (
        <RejectConfirmModal
          investment={rejectInvestment}
          onClose={() => setRejectInvestment(null)}
          onConfirm={handleRejectInvestment}
        />
      )}

      {reviewTenureRequest && (
        <ReviewTenureRequestModal
          request={reviewTenureRequest}
          onClose={() => setReviewTenureRequest(null)}
          onApprove={handleApproveTenureRequest}
          onReject={handleRejectTenureRequest}
        />
      )}

      {rejectTenureRequest && (
        <RejectTenureRequestModal
          request={rejectTenureRequest}
          onClose={() => setRejectTenureRequest(null)}
          onConfirm={handleRejectTenureRequest}
        />
      )}
    </div>
  );
}