import React, { useState, useRef } from "react";
import { Plus, Eye, Zap, RefreshCw, Download, X, Printer, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { StatusBadge, formatINR } from "../../shared/Shared";
import "../../Styles/Admin/investments.css";
const initialInvestments = [
  { bondNumber: "BND-2025-001", investor: "Arjun Sharma", investorId: "INV001", pan: "ABCDE1234F", mobile: "9876543210", amount: 500000, rate: 12, invested: "15 Jan 2025", matures: "15 Jan 2026", status: "Active" },
  { bondNumber: "BND-2025-002", investor: "Rahul Kumar", investorId: "INV003", pan: "BCDEF2345G", mobile: "9876543212", amount: 875000, rate: 13, invested: "18 Jan 2025", matures: "18 Jul 2025", status: "Matured" },
  { bondNumber: "BND-2025-003", investor: "Neha Gupta", investorId: "INV006", pan: "CDEFG3456H", mobile: "9876543215", amount: 600000, rate: 11.5, invested: "22 Jan 2025", matures: "22 Jan 2026", status: "Active" },
  { bondNumber: "BND-2025-004", investor: "Priya Patel", investorId: "INV002", pan: "DEFGH4567I", mobile: "9876543211", amount: 250000, rate: 12, invested: "25 Jan 2025", matures: "25 Jul 2025", status: "Pending" },
  { bondNumber: "BND-2025-005", investor: "Vikram Singh", investorId: "INV005", pan: "EFGHI5678J", mobile: "9876543214", amount: 325000, rate: 12.5, invested: "28 Jan 2025", matures: "28 Jan 2026", status: "Active" },
];

const STATUS_OPTIONS = ["Active", "Pending", "Matured"];

const emptyForm = {
  investor: "",
  investorId: "",
  pan: "",
  mobile: "",
  amount: "",
  rate: "",
  invested: "",
  matures: "",
  status: "Pending",
};

function nextBondNumber(list) {
  const year = new Date().getFullYear();
  const max = list.reduce((acc, inv) => {
    const num = parseInt(inv.bondNumber.split("-").pop(), 10);
    return Number.isNaN(num) ? acc : Math.max(acc, num);
  }, 0);
  return `BND-${year}-${String(max + 1).padStart(3, "0")}`;
}

function formatDateDisplay(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
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
                <div className="bond-cert-field-label">INVESTOR ID</div>
                <div className="bond-cert-field-value">{investment.investorId}</div>
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
      investor: form.investor.trim(),
      investorId: form.investorId.trim() || "—",
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
          <div className="admin-form-row">
            <label>Investor Name</label>
            <input type="text" value={form.investor} onChange={handleChange("investor")} placeholder="e.g. Arjun Sharma" />
            {errors.investor && <span className="admin-form-error">{errors.investor}</span>}
          </div>

          <div className="admin-form-row-split">
            <div className="admin-form-row">
              <label>Investor ID</label>
              <input type="text" value={form.investorId} onChange={handleChange("investorId")} placeholder="e.g. INV007" />
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

export default function Investments() {
  const [investments, setInvestments] = useState(initialInvestments);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [bondInvestment, setBondInvestment] = useState(null);

  const filteredInvestments = investments.filter((inv) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      inv.bondNumber.toLowerCase().includes(q) ||
      inv.investor.toLowerCase().includes(q) ||
      inv.investorId.toLowerCase().includes(q)
    );
  });

  const handleAddInvestment = (newInvestment) => {
    setInvestments((prev) => [newInvestment, ...prev]);
    setShowAddModal(false);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-actions">
        <input
          className="admin-search-input"
          placeholder="Search bonds..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="admin-btn admin-btn--primary" onClick={() => setShowAddModal(true)}>
          <Plus size={14} /> Add Investment
        </button>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-card__header">
          <button className="admin-btn admin-btn--outline"><Download size={14} /> Export</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Bond Number</th>
              <th>Investor</th>
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
                <td colSpan={8} className="admin-no-results">No bonds match your search.</td>
              </tr>
            )}
            {filteredInvestments.map((inv) => (
              <tr key={inv.bondNumber}>
                <td className="mono link">{inv.bondNumber}</td>
                <td>{inv.investor}</td>
                <td className="mono">{formatINR(inv.amount)}</td>
                <td><span className="rate-pill">{inv.rate}%</span></td>
                <td>{inv.invested}</td>
                <td>{inv.matures}</td>
                <td><StatusBadge status={inv.status} /></td>
                <td className="admin-table-actions">
                  <button title="View"><Eye size={14} /></button>
                  <button title="Bond" className="admin-icon-btn--primary" onClick={() => setBondInvestment(inv)}>
                    <Zap size={14} /> Bond
                  </button>
                  <button title="Renew" className="admin-icon-btn--accent"><RefreshCw size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="admin-table-footer">
          Showing {filteredInvestments.length === 0 ? 0 : 1}-{filteredInvestments.length} of {investments.length} records
        </p>
      </div>

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
    </div>
  );
}