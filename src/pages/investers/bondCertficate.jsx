import React, { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Printer, Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useInvestorData, formatINR } from "./InvestorDataContext";
import "../../Styles/Investor/BondCertificate.css";

function amountInWords(num) {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const twoDigits = (n) => (n < 20 ? a[n] : `${b[Math.floor(n / 10)]} ${a[n % 10]}`.trim());

  const threeDigits = (n) =>
    n > 99 ? `${a[Math.floor(n / 100)]} Hundred ${twoDigits(n % 100)}`.trim() : twoDigits(n);

  if (num === 0) return "Zero Rupees Only";

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const rest = num % 1000;

  let words = "";
  if (crore) words += `${threeDigits(crore)} Crore `;
  if (lakh) words += `${threeDigits(lakh)} Lakh `;
  if (thousand) words += `${threeDigits(thousand)} Thousand `;
  if (rest) words += `${threeDigits(rest)}`;

  return `${words.trim()} Rupees Only`;
}

function QrPlaceholder() {
  const seed = [
    1, 1, 0, 1, 1, 1, 0,
    1, 0, 1, 0, 1, 0, 1,
    0, 1, 1, 1, 0, 1, 1,
    1, 0, 0, 1, 0, 0, 1,
    1, 1, 0, 1, 1, 1, 0,
    0, 0, 1, 0, 1, 0, 1,
    1, 1, 1, 0, 1, 1, 0,
  ];
  return (
    <div className="bond-qr">
      {seed.map((v, i) => (
        <span key={i} className={v ? "bond-qr__cell bond-qr__cell--on" : "bond-qr__cell"} />
      ))}
    </div>
  );
}

export default function BondCertificate() {
  const { bondId } = useParams();
  const navigate = useNavigate();
  const { investments } = useInvestorData();
  const certRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const decodedBondId = decodeURIComponent(bondId || "");

  const investment = investments.find(
    (inv) => inv.bond === decodedBondId || String(inv.id) === decodedBondId
  );

  const handlePrint = () => window.print();

  const handleDownloadPdf = async () => {
    if (!certRef.current || downloading) return;
    setDownloading(true);
    try {
      const node = certRef.current;

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      // A4 in points: 595.28 x 841.89
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

      const fileName = `Bond-Certificate-${investment?.bond || "INRFS"}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Could not generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (!investment) {
    return (
      <div className="investor-page">
        <p>Bond not found.</p>
        <button className="investor-btn investor-btn--outline" onClick={() => navigate(-1)}>
          <ChevronLeft size={14} /> Back
        </button>
      </div>
    );
  }

  const investorName = investment.investorName || "Arjun Sharma";
  const investorId = investment.investorId || "INV001";
  const pan = investment.pan || "ABCDE1234F";
  const mobile = investment.mobile || "+91 98765 43210";

  return (
    <div className="investor-page bond-certificate-page">
      <div className="bond-cert-topbar">
        <button className="bond-cert-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={15} /> Back
        </button>
        <h2 className="bond-cert-title">Bond Certificate</h2>

        <div className="bond-cert-topbar__actions">
          <button className="investor-btn investor-btn--outline" onClick={handlePrint}>
            <Printer size={14} /> Print Bond
          </button>
          <button
            className="investor-btn investor-btn--primary"
            onClick={handleDownloadPdf}
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 size={14} className="spin" />
            ) : (
              <Download size={14} />
            )}
            {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      <div className="bond-cert-wrap">
        <div className="bond-cert-card" ref={certRef}>
         <div
  className="bond-cert-header"
  style={{ display: "block", textAlign: "center", width: "100%" }}
>
  <div
    style={{
      display: "inline-flex",
      flexDirection: "row",
      alignItems: "flex-start",
      textAlign: "left",
      gap: "10px",
      marginBottom: "16px",
    }}
  >
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "26px",
        height: "26px",
        minWidth: "26px",
        maxWidth: "26px",
        flexShrink: 0,
        borderRadius: "7px",
        background: "#2f5cf0",
        color: "#fff",
        fontWeight: 800,
        fontSize: "10.5px",
        marginTop: "1px",
      }}
    >
      IN
    </span>
    <div style={{ flex: "1 1 auto" }}>
      <p
        style={{
          fontSize: "13px",
          fontWeight: 800,
          color: "#0f1729",
          margin: 0,
          lineHeight: 1.3,
          whiteSpace: "nowrap",
        }}
      >
        INRFS
      </p>
      <p
        style={{
          fontSize: "8.5px",
          color: "#94a3b8",
          margin: 0,
          lineHeight: 1.4,
          maxWidth: "220px",
        }}
      >
        Investor Management &amp; Investment Portal
      </p>
    </div>
  </div>
  <h1 className="bond-cert-heading" style={{ display: "block", width: "100%" }}>
    INVESTMENT BOND CERTIFICATE
  </h1>
  <p className="bond-cert-tagline" style={{ display: "block", width: "100%" }}>
    FIXED INCOME INVESTMENT — GOVERNMENT COMPLIANT
  </p>
  <span
    className="bond-cert-number"
    style={{ display: "inline-block", marginTop: "8px" }}
  >
    {investment.bond}
  </span>
</div>

          <div className="bond-cert-amount-box">
            <p className="bond-cert-amount-label">INVESTED PRINCIPAL AMOUNT</p>
            <p className="bond-cert-amount-value">{formatINR(investment.amount)}</p>
            <p className="bond-cert-amount-words">{amountInWords(investment.amount)}</p>
          </div>

          <div className="bond-cert-grid">
            <div>
              <p className="bond-cert-field-label">INVESTOR NAME</p>
              <p className="bond-cert-field-value">{investorName}</p>
            </div>
            <div>
              <p className="bond-cert-field-label">INVESTOR ID</p>
              <p className="bond-cert-field-value mono">{investorId}</p>
            </div>

            <div>
              <p className="bond-cert-field-label">PAN NUMBER</p>
              <p className="bond-cert-field-value mono">{pan}</p>
            </div>
            <div>
              <p className="bond-cert-field-label">MOBILE</p>
              <p className="bond-cert-field-value mono">{mobile}</p>
            </div>

            <div>
              <p className="bond-cert-field-label">INVESTMENT DATE</p>
              <p className="bond-cert-field-value">{investment.invested}</p>
            </div>
            <div>
              <p className="bond-cert-field-label">MATURITY DATE</p>
              <p className="bond-cert-field-value">{investment.matures}</p>
            </div>

            <div>
              <p className="bond-cert-field-label">INTEREST RATE</p>
              <p className="bond-cert-field-value">{investment.rate} per annum</p>
            </div>
            <div>
              <p className="bond-cert-field-label">MONTHLY INTEREST</p>
              <p className="bond-cert-field-value">{formatINR(investment.monthlyInt)}</p>
            </div>

            <div>
              <p className="bond-cert-field-label">TOTAL INTEREST</p>
              <p className="bond-cert-field-value">
                {formatINR(investment.earned)} ({investment.tenure || "12"} months)
              </p>
            </div>
            <div>
              <p className="bond-cert-field-label">MATURITY AMOUNT</p>
              <p className="bond-cert-field-value">
                {formatINR(investment.amount + (investment.earned || 0))}
              </p>
            </div>
          </div>

          <div className="bond-cert-qr-wrap">
            <QrPlaceholder />
            <p className="bond-cert-qr-label">QR Verification Code</p>
            <p className="bond-cert-qr-link">verify.inrfs.in/{investment.bond}</p>
          </div>

          <div className="bond-cert-note">
            This bond certifies that the above named investor has deposited the stated principal amount with
            INRFS Investment Portal. The investment carries a fixed rate of interest as stated above, payable
            monthly. This bond is non-transferable and subject to INRFS terms and conditions.
          </div>

          <div className="bond-cert-sign">
            <div className="bond-cert-sign-line">
              <span />
              <p>Investor Signature</p>
            </div>
            <div className="bond-cert-seal">
              <span>INRFS</span>
              <span>SEAL</span>
            </div>
            <div className="bond-cert-sign-line">
              <span />
              <p>Authorised Signatory</p>
            </div>
          </div>

          <p className="bond-cert-footer">
            INRFS Investment Portal | CIN: U65900MH2020PTC123456 | SEBI Reg: INZ345678901
            <br />
            Verify at: verify.inrfs.in/{investment.bond}
          </p>
        </div>

        <div className="bond-cert-actions">
          <button className="investor-btn investor-btn--outline" onClick={() => navigate(-1)}>
            <ChevronLeft size={14} /> Close Preview
          </button>
          <button className="investor-btn investor-btn--outline" onClick={handlePrint}>
            <Printer size={14} /> Print Bond
          </button>
          <button
            className="investor-btn investor-btn--primary"
            onClick={handleDownloadPdf}
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 size={14} className="spin" />
            ) : (
              <Download size={14} />
            )}
            {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}