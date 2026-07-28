import React, { useState } from "react";
import PersonalInfoStep from "./Personalinfo";
import ReviewSubmitStep from "./ReviewSubmit";
import { CheckCircle2 } from "lucide-react";
import "../../Styles/login/Register.css";

const steps = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Review & Submit" },
];


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
  });
  const [agreed, setAgreed] = useState(false);

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, steps.length));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

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
          {steps.map((step, i) => (
            <React.Fragment key={step.id}>
              <div className="reg-step">
                <div
                  className={
                    "reg-step-circle" +
                    (currentStep === step.id
                      ? " reg-step-active"
                      : currentStep > step.id
                      ? " reg-step-done"
                      : "")
                  }
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={
                    "reg-step-label" +
                    (currentStep >= step.id ? " reg-step-label-active" : "")
                  }
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={
                    "reg-step-line" +
                    (currentStep > step.id ? " reg-step-line-done" : "")
                  }
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