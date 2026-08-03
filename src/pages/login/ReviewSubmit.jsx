import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

const reviewRows = [
  { key: "fullName", label: "Full Name" },
  { key: "mobile", label: "Mobile" },
  { key: "email", label: "Email" },
  { key: "dob", label: "Date of Birth" },
  { key: "aadhaar", label: "Aadhaar" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "pin", label: "PIN Code" },
];

export default function ReviewSubmitStep({
  formData,
  agreed,
  setAgreed,
  onBack,
}) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = () => {
    if (!agreed || submitting) return;
    setSubmitting(true);

    // Static/mock submit — no API call. Replace this block with a real
    // API call later; just move setShowSuccessModal(true) into the
    // .then()/await success path when you do.
    setTimeout(() => {
      setSubmitting(false);
      setShowSuccessModal(true);
    }, 800);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };

  return (
    <>
      <div className="reg-review-box">
        <div className="reg-review-heading">
          <CheckCircle2 size={18} className="reg-review-heading-icon" />
          Review Your Application
        </div>

        {reviewRows.map(({ key, label }) => (
          <div className="reg-review-row" key={key}>
            <span>{label}</span>
            <strong>{formData[key] || "—"}</strong>
          </div>
        ))}
      </div>

      <div className="reg-warning">
        <AlertTriangle size={16} />
        <p>
          By submitting, you confirm that all information provided is
          accurate. False information may result in application rejection
          and legal action.
        </p>
      </div>

      <label className="reg-agree">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span>
          I agree to the <a href="#terms">Terms &amp; Conditions</a> and{" "}
          <a href="#kyc">KYC Policy</a>
        </span>
      </label>

      <div className="reg-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onBack}
          disabled={submitting}
        >
          <ChevronLeft size={15} /> Previous
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!agreed || submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="reg-spin" /> Submitting...
            </>
          ) : (
            <>
              Submit Application <ChevronRight size={15} />
            </>
          )}
        </button>
      </div>

      {showSuccessModal && (
        <div className="reg-modal-overlay">
          <div className="reg-modal">
            <div className="reg-modal-icon">
              <CheckCircle2 size={48} />
            </div>
            <h2>Registration Successful</h2>
            <p>
              Your account has been created and is now{" "}
              <strong>pending admin approval</strong>. You'll be able to log
              in once an administrator reviews and approves your
              registration.
            </p>
            <button className="reg-modal-btn" onClick={handleModalClose}>
              Go to Login
            </button>
          </div>
        </div>
      )}
    </>
  );
}