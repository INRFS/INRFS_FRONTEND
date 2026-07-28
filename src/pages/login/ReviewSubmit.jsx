import React from "react";
import { CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

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
        <button type="button" className="btn btn-outline" onClick={onBack}>
          <ChevronLeft size={15} /> Previous
        </button>
        <button type="button" className="btn btn-primary" disabled={!agreed}>
          Submit Application <ChevronRight size={15} />
        </button>
      </div>
    </>
  );
}