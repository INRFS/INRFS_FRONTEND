import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Download,
  Loader2,
  Printer,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import {
  getMyInvestmentBond,
} from "../../services/investment_service";

import "../../Styles/Investor/BondCertificate.css";


const formatINR = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};


const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const getInvestmentIdFromParams = (params) => {
  return (
    params?.investmentId ??
    params?.id ??
    params?.investment_id ??
    params?.bondId ??
    null
  );
};


export default function BondCertificate() {
  const navigate = useNavigate();
  const params = useParams();

  const investmentId =
    getInvestmentIdFromParams(params);

  const printableRef = useRef(null);

  const [bond, setBond] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    let mounted = true;

    const loadBond = async () => {
      try {
        setLoading(true);
        setError("");

        if (!investmentId) {
          throw new Error(
            "Investment ID is missing."
          );
        }

        const response =
          await getMyInvestmentBond(
            investmentId
          );

        if (!mounted) {
          return;
        }

        const bondData =
          response?.data ?? response;

        if (!bondData) {
          throw new Error(
            "Bond certificate not found."
          );
        }

        setBond(bondData);
      } catch (err) {
        if (mounted) {
          setBond(null);
          setError(
            err?.message ||
            "Unable to load bond certificate."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBond();

    return () => {
      mounted = false;
    };
  }, [investmentId]);


  const handleDownload = async () => {
    if (
      !printableRef.current ||
      downloading ||
      !bond
    ) {
      return;
    }

    try {
      setDownloading(true);
      setError("");

      const canvas =
        await html2canvas(
          printableRef.current,
          {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#fffdf7",
            logging: false,
          }
        );

      const image =
        canvas.toDataURL("image/png", 1.0);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const imageWidth = 252;
      const imageHeight =
        (canvas.height * imageWidth) /
        canvas.width;

      const x =
        (pageWidth - imageWidth) / 2;

      const y =
        (pageHeight - imageHeight) / 2;

      pdf.addImage(
        image,
        "PNG",
        x,
        y,
        imageWidth,
        imageHeight
      );

      pdf.save(
        `Bond-Certificate-${
          bond.bond_number ||
          bond.bond_id ||
          investmentId
        }.pdf`
      );
    } catch (err) {
      console.error(
        "Bond PDF error:",
        err
      );

      setError(
        "Could not generate the PDF certificate."
      );
    } finally {
      setDownloading(false);
    }
  };


  const handlePrint = () => {
    window.print();
  };


  const handleBack = () => {
    navigate(
      "/investor/my-investments"
    );
  };


  if (loading) {
    return (
      <div className="bond-certificate-page">
        <div className="bond-certificate-loading">
          <Loader2
            className="bond-certificate-loading-icon"
            size={18}
          />
          <span>
            Loading bond certificate...
          </span>
        </div>
      </div>
    );
  }


  if (error || !bond) {
    return (
      <div className="bond-certificate-page">
        <div className="bond-certificate-error-card">
          <div className="bond-certificate-error">
            {error ||
              "Bond certificate not found."}
          </div>

          <button
            type="button"
            className="bond-certificate-btn"
            onClick={handleBack}
          >
            <ArrowLeft size={13} />
            Back to My Investments
          </button>
        </div>
      </div>
    );
  }


  const bondNumber =
    bond.bond_number ||
    bond.bond_id ||
    "—";

  const amount =
    bond.investment_amount ??
    bond.amount ??
    0;

  const rate =
    bond.interest_rate ??
    bond.rate ??
    0;

  const investorName =
    bond.investor_name ||
    bond.full_name ||
    "Investor";

  const investmentCode =
    bond.investment_code ||
    bond.investment_id ||
    investmentId;

  const investorId =
    bond.investor_registration_id ||
    bond.investor_id ||
    "—";

  const monthlyInterest =
    bond.monthly_interest ??
    bond.expected_monthly_interest ??
    null;

  const totalInterest =
    bond.total_interest ??
    bond.expected_interest_amount ??
    null;

  const tenureMonths =
    bond.tenure_months ??
    bond.tenure ??
    null;

  const maturityAmount =
    bond.maturity_amount ??
    0;


  return (
    <div className="bond-certificate-page">

      {/* Top page toolbar */}
      <div className="bond-certificate-toolbar">

        <button
          type="button"
          className="bond-certificate-back"
          onClick={handleBack}
        >
          <ArrowLeft size={12} />
          Back
        </button>

        <div className="bond-certificate-toolbar-right">

          <button
            type="button"
            className="bond-certificate-btn"
            onClick={handlePrint}
          >
            <Printer size={11} />
            Print Bond
          </button>

          <button
            type="button"
            className="bond-certificate-btn bond-certificate-btn--primary"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <Loader2
                size={11}
                className="bond-certificate-spin"
              />
            ) : (
              <Download size={11} />
            )}

            {downloading
              ? "Generating..."
              : "Download PDF"}
          </button>

        </div>
      </div>


      <div className="bond-certificate-heading">
        Bond Certificate
      </div>


      {/* Printable certificate */}
      <div
        ref={printableRef}
        className="bond-certificate-card"
        data-print-bond="true"
      >

        <div className="bond-certificate-body">

          {/* INRFS header */}
          <div className="bond-certificate-brand-row">

            <div className="bond-certificate-logo">
              IN
            </div>

            <div>
              <div className="bond-certificate-brand">
                INRFS
              </div>

              <div className="bond-certificate-brand-sub">
                Investor Management & Investment Portal
              </div>
            </div>

          </div>


          <h1 className="bond-certificate-title">
            INVESTMENT BOND CERTIFICATE
          </h1>

          <div className="bond-certificate-subtitle">
            FIXED INCOME INVESTMENT — GOVERNMENT COMPLIANT
          </div>


          <div className="bond-certificate-number">
            {bondNumber}
          </div>


          {/* Principal amount */}
          <div className="bond-certificate-amount-box">

            <div className="bond-certificate-amount-label">
              INVESTED PRINCIPAL AMOUNT
            </div>

            <div className="bond-certificate-amount">
              {formatINR(amount)}
            </div>

            <div className="bond-certificate-amount-words">
              Fixed Income Investment
            </div>

          </div>


          {/* Details */}
          <div className="bond-certificate-grid">

            <div className="bond-certificate-field">
              <span className="bond-certificate-field-label">
                INVESTOR NAME
              </span>
              <span className="bond-certificate-field-value">
                {investorName}
              </span>
            </div>


            <div className="bond-certificate-field">
              <span className="bond-certificate-field-label">
                INVESTMENT ID
              </span>
              <span className="bond-certificate-field-value">
                {investmentCode}
              </span>
            </div>


            <div className="bond-certificate-field">
              <span className="bond-certificate-field-label">
                INVESTOR ID
              </span>
              <span className="bond-certificate-field-value">
                {investorId}
              </span>
            </div>


            <div className="bond-certificate-field">
              <span className="bond-certificate-field-label">
                MOBILE
              </span>
              <span className="bond-certificate-field-value">
                {bond.mobile || "—"}
              </span>
            </div>


            <div className="bond-certificate-field">
              <span className="bond-certificate-field-label">
                INVESTMENT DATE
              </span>
              <span className="bond-certificate-field-value">
                {formatDate(
                  bond.investment_date
                )}
              </span>
            </div>


            <div className="bond-certificate-field">
              <span className="bond-certificate-field-label">
                ISSUE DATE
              </span>
              <span className="bond-certificate-field-value">
                {formatDate(
                  bond.issue_date ||
                  bond.investment_date
                )}
              </span>
            </div>


            <div className="bond-certificate-field">
              <span className="bond-certificate-field-label">
                MATURITY DATE
              </span>
              <span className="bond-certificate-field-value">
                {formatDate(
                  bond.maturity_date
                )}
              </span>
            </div>


            <div className="bond-certificate-field">
              <span className="bond-certificate-field-label">
                INTEREST RATE
              </span>
              <span className="bond-certificate-field-value">
                {rate}% p.a.
              </span>
            </div>


            {monthlyInterest !== null && (
              <div className="bond-certificate-field">
                <span className="bond-certificate-field-label">
                  MONTHLY INTEREST
                </span>
                <span className="bond-certificate-field-value">
                  {formatINR(
                    monthlyInterest
                  )}
                </span>
              </div>
            )}


            {totalInterest !== null && (
              <div className="bond-certificate-field">
                <span className="bond-certificate-field-label">
                  TOTAL INTEREST
                </span>
                <span className="bond-certificate-field-value">
                  {formatINR(totalInterest)}
                  {tenureMonths
                    ? ` (${tenureMonths} months)`
                    : ""}
                </span>
              </div>
            )}


            <div className="bond-certificate-field">
              <span className="bond-certificate-field-label">
                MATURITY AMOUNT
              </span>
              <span className="bond-certificate-field-value">
                {formatINR(maturityAmount)}
              </span>
            </div>


            <div className="bond-certificate-field">
              <span className="bond-certificate-field-label">
                STATUS
              </span>
              <span className="bond-certificate-field-value bond-certificate-status">
                ACTIVE
              </span>
            </div>

          </div>


          {/* Verification area */}
          <div className="bond-certificate-verification-area">

            <div className="bond-certificate-qr">
              <span className="qr-square qr-a" />
              <span className="qr-square qr-b" />
              <span className="qr-square qr-c" />
              <span className="qr-dots">
                ▦
              </span>
            </div>

            <div className="bond-certificate-verification">
              QR Verification Code
            </div>

            <div className="bond-certificate-verification-code">
              Verify {bondNumber}
            </div>

          </div>


          {/* Certificate declaration */}
          <div className="bond-certificate-legal">
            This bond certificate confirms that the above
            named investor has deposited the stated
            principal amount with INRFS Investment
            Management System. This certificate is
            digitally generated and is valid subject
            to the applicable investment terms.
          </div>


          {/* Signature section */}
          <div className="bond-certificate-signatures">

            <div className="bond-certificate-signature">
              <div className="bond-certificate-signature-line" />
              <div className="bond-certificate-signature-name">
                Investor Signature
              </div>
            </div>


            <div className="bond-certificate-seal">
              INRFS
            </div>


            <div className="bond-certificate-signature">
              <div className="bond-certificate-signature-line" />
              <div className="bond-certificate-signature-name">
                Authorized Signatory
              </div>
            </div>

          </div>


          <div className="bond-certificate-footer">
            INRFS Investment Portal • Digital Bond Certificate
            <br />
            Verify at the official INRFS investment portal.
          </div>

        </div>
      </div>


      {/* Bottom buttons */}
      <div className="bond-certificate-bottom-actions">

        <button
          type="button"
          className="bond-certificate-btn"
          onClick={handleBack}
        >
          <ArrowLeft size={11} />
          Close Preview
        </button>

        <button
          type="button"
          className="bond-certificate-btn"
          onClick={handlePrint}
        >
          <Printer size={11} />
          Print Bond
        </button>

        <button
          type="button"
          className="bond-certificate-btn bond-certificate-btn--primary"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <Loader2
              size={11}
              className="bond-certificate-spin"
            />
          ) : (
            <Download size={11} />
          )}
          {downloading
            ? "Generating..."
            : "Download PDF"}
        </button>

      </div>

    </div>
  );
}