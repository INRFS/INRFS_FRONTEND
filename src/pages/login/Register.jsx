import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Mail,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import "../../Styles/login/Register.css";

const steps = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Review & Submit" },
];

const BRANCHES = ["Vijayawada", "Hyderabad", "Bengaluru", "Chennai"];

const reviewRows = [
  { key: "fullName", label: "Full Name" },
  { key: "mobile", label: "Mobile Number" },
  { key: "email", label: "Email Address" },
  { key: "dob", label: "Date of Birth" },
  { key: "aadhaar", label: "Aadhaar Number" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "pin", label: "PIN Code" },
  { key: "branch", label: "Branch" },
];

function PersonalInfoStep({ formData, setFormData, onNext }) {
  const update = (field) => (e) =>
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

  return (
    <>
      <div className="reg-form-grid">
        <div className="reg-field">
          <label>
            Full Name <span className="req">*</span>
          </label>

          <input
            type="text"
            placeholder="As per Aadhaar card"
            value={formData.fullName}
            onChange={update("fullName")}
          />
        </div>

        <div className="reg-field">
          <label>
            Mobile Number <span className="req">*</span>
          </label>

          <div className="reg-input-icon">
            <Phone size={15} />
            <input
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={formData.mobile}
              onChange={update("mobile")}
            />
          </div>
        </div>

        <div className="reg-field">
          <label>Email Address</label>

          <div className="reg-input-icon">
            <Mail size={15} />
            <input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={update("email")}
            />
          </div>
        </div>

        <div className="reg-field">
          <label>
            Date of Birth <span className="req">*</span>
          </label>

          <div className="reg-input-icon">
            <Calendar size={15} />
            <input
              type="date"
              value={formData.dob}
              onChange={update("dob")}
            />
          </div>
        </div>

        <div className="reg-field">
          <label>
            Aadhaar Number <span className="req">*</span>
          </label>

          <input
            type="text"
            maxLength={12}
            placeholder="XXXX XXXX XXXX"
            value={formData.aadhaar}
            onChange={update("aadhaar")}
          />
        </div>

        <div className="reg-field reg-field-full">
          <label>
            Address <span className="req">*</span>
          </label>

          <div className="reg-input-icon">
            <MapPin size={15} />
            <input
              type="text"
              placeholder="Street address"
              value={formData.address}
              onChange={update("address")}
            />
          </div>
        </div>

        <div className="reg-field">
          <label>City</label>

          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={update("city")}
          />
        </div>

        <div className="reg-field">
          <label>State</label>

          <select value={formData.state} onChange={update("state")}>
            <option value="">Select State</option>
            <option>Telangana</option>
            <option>Andhra Pradesh</option>
            <option>Chennai</option>
          </select>
        </div>

        <div className="reg-field">
          <label>PIN Code</label>

          <input
            type="text"
            maxLength={6}
            placeholder="500001"
            value={formData.pin}
            onChange={update("pin")}
          />
        </div>

        <div className="reg-field">
  <label>
    Branch <span className="req">*</span>
  </label>

  <select value={formData.branch} onChange={update("branch")}>
    <option value="">Select Branch</option>
    {BRANCHES.map((b) => (
      <option key={b} value={b}>
        {b}
      </option>
    ))}
  </select>
</div>
        
      </div>

      <div className="reg-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => (window.location.href = "/login")}
        >
          <ChevronLeft size={15} />
          Back to Login
        </button>

        <button type="button" className="btn btn-primary" onClick={onNext}>
          Next Step
          <ChevronRight size={15} />
        </button>
      </div>
    </>
  );
}

function ReviewSubmitStep({ formData, agreed, setAgreed, onBack }) {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = () => {
    if (!agreed || submitting) return;

    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setShowSuccessModal(true);
    }, 1000);
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
          By submitting this application you certify that the information
          provided is correct. Providing incorrect
          information may lead to rejection of your registration.
        </p>
      </div>

      <label className="reg-agree">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />

        <span>
          I agree to the <a href="#terms">Terms & Conditions</a> and{" "}
          <a href="#kyc">KYC Policy</a>.
        </span>
      </label>

      <div className="reg-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onBack}
          disabled={submitting}
        >
          <ChevronLeft size={15} />
          Previous
        </button>

        <button
          type="button"
          className="btn btn-primary"
          disabled={!agreed || submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="reg-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit Application
              <ChevronRight size={15} />
            </>
          )}
        </button>
      </div>

      {showSuccessModal && (
        <div className="reg-modal-overlay">
          <div className="reg-modal">
            <div className="reg-modal-icon">
              <CheckCircle2 size={55} />
            </div>

            <h2>Registration Successful</h2>

            <p>Your registration has been submitted successfully.</p>

            <p>
              Your account is currently
              <strong> Pending Admin Approval.</strong>
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

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    dob: "",
    aadhaar: "",
    address: "",
    city: "",
    state: "",
    pin: "",
    branch: "",
  });

  const [agreed, setAgreed] = useState(false);

  const goNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="reg-page">
      <div className="reg-header">
        <div className="reg-logo">
          <span className="reg-logo-badge">IN</span>
          <span className="reg-logo-text">INRFS</span>
        </div>

        <h1>Investor Registration</h1>

        <p>Complete your KYC to start investing</p>

        <div className="reg-stepper">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="reg-step">
                <div
                  className={`reg-step-circle ${
                    currentStep === step.id
                      ? "reg-step-active"
                      : currentStep > step.id
                      ? "reg-step-done"
                      : ""
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    step.id
                  )}
                </div>

                <span
                  className={`reg-step-label ${
                    currentStep >= step.id ? "reg-step-label-active" : ""
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`reg-step-line ${
                    currentStep > step.id ? "reg-step-line-done" : ""
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="reg-card">
        {currentStep === 1 && (
          <PersonalInfoStep
            formData={formData}
            setFormData={setFormData}
            onNext={goNext}
          />
        )}

        {currentStep === 2 && (
          <ReviewSubmitStep
            formData={formData}
            agreed={agreed}
            setAgreed={setAgreed}
            onBack={goBack}
          />
        )}
      </div>
    </div>
  );
}