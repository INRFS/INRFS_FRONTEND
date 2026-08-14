import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Mail,
  Calendar,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import "../../Styles/login/Register.css";

import {
  getStates,
  getBranches,
  registerInvestor,
} from "../../services/authService";

const steps = [
  {
    id: 1,
    label: "Personal Info",
  },
  {
    id: 2,
    label: "Review & Submit",
  },
];

const reviewRows = [
  {
    key: "fullName",
    label: "Full Name",
  },
  {
    key: "mobile",
    label: "Mobile Number",
  },
  {
    key: "email",
    label: "Email Address",
  },
  {
    key: "dob",
    label: "Date of Birth",
  },
  {
    key: "aadhaar",
    label: "Aadhaar Number",
  },
  {
    key: "address",
    label: "Address",
  },
  {
    key: "city",
    label: "City",
  },
  {
    key: "stateName",
    label: "State",
  },
  {
    key: "pin",
    label: "PIN Code",
  },
  {
    key: "branchName",
    label: "Branch",
  },
];

function PersonalInfoStep({
  formData,
  setFormData,
  onNext,
  states,
  branches,
  loadingStates,
  loadingBranches,
  masterError,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [validationError, setValidationError] = useState("");

  const update = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

    setValidationError("");
  };

  const handleMobileChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setFormData((prev) => ({
      ...prev,
      mobile: value,
    }));

    setValidationError("");
  };

  const handleAadhaarChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 12);

    setFormData((prev) => ({
      ...prev,
      aadhaar: value,
    }));

    setValidationError("");
  };

  const handlePinChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setFormData((prev) => ({
      ...prev,
      pin: value,
    }));

    setValidationError("");
  };

  const handleStateChange = (e) => {
    const stateId = e.target.value;

    const selectedState = states.find(
      (state) =>
        String(state.id) === String(stateId)
    );

    setFormData((prev) => ({
      ...prev,
      state: stateId,
      stateName:
        selectedState?.state_name || "",
      branch: "",
      branchName: "",
    }));

    setValidationError("");
  };

  const handleBranchChange = (e) => {
    const branchId = e.target.value;

    const selectedBranch = branches.find(
      (branch) =>
        String(branch.id) === String(branchId)
    );

    setFormData((prev) => ({
      ...prev,
      branch: branchId,
      branchName:
        selectedBranch?.branch_name || "",
    }));

    setValidationError("");
  };

  const handleNext = () => {
    if (!formData.fullName.trim()) {
      setValidationError(
        "Please enter your full name."
      );
      return;
    }

    if (
      !formData.mobile ||
      formData.mobile.length !== 10
    ) {
      setValidationError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (!formData.email.trim()) {
      setValidationError(
        "Please enter your email address."
      );
      return;
    }

    if (!formData.dob) {
      setValidationError(
        "Please select your date of birth."
      );
      return;
    }

    if (
      !formData.aadhaar ||
      formData.aadhaar.length !== 12
    ) {
      setValidationError(
        "Please enter a valid 12-digit Aadhaar number."
      );
      return;
    }

    if (!formData.password) {
      setValidationError(
        "Please create a password."
      );
      return;
    }

    if (formData.password.length < 8) {
      setValidationError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (!formData.confirmPassword) {
      setValidationError(
        "Please confirm your password."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setValidationError(
        "Passwords do not match."
      );
      return;
    }

    if (!formData.address.trim()) {
      setValidationError(
        "Please enter your address."
      );
      return;
    }

    if (!formData.city.trim()) {
      setValidationError(
        "Please enter your city."
      );
      return;
    }

    if (!formData.state) {
      setValidationError(
        "Please select your state."
      );
      return;
    }

    if (!formData.pin || formData.pin.length !== 6) {
      setValidationError(
        "Please enter a valid 6-digit PIN code."
      );
      return;
    }

    if (!formData.branch) {
      setValidationError(
        "Please select your branch."
      );
      return;
    }

    setValidationError("");
    onNext();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleNext();
  };

  return (
    <form
      className="reg-personal-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="reg-form-grid">
        <div className="reg-field">
          <label htmlFor="fullName">
            Full Name <span className="req">*</span>
          </label>

          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="As per Aadhaar card"
            value={formData.fullName}
            onChange={update("fullName")}
            autoComplete="name"
          />
        </div>

        <div className="reg-field">
          <label htmlFor="mobile">
            Mobile Number <span className="req">*</span>
          </label>

          <div className="reg-input-icon">
            <Phone size={14} />

            <input
              id="mobile"
              name="mobile"
              type="tel"
              placeholder="10-digit mobile number"
              value={formData.mobile}
              onChange={handleMobileChange}
              maxLength={10}
              inputMode="numeric"
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="reg-field">
          <label htmlFor="email">
            Email Address <span className="req">*</span>
          </label>

          <div className="reg-input-icon">
            <Mail size={14} />

            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={update("email")}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="reg-field">
          <label htmlFor="dob">
            Date of Birth <span className="req">*</span>
          </label>

          <div className="reg-input-icon">
            <Calendar size={14} />

            <input
              id="dob"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={update("dob")}
              autoComplete="bday"
            />
          </div>
        </div>

        <div className="reg-field">
          <label htmlFor="aadhaar">
            Aadhaar Number <span className="req">*</span>
          </label>

          <input
            id="aadhaar"
            name="aadhaar"
            type="text"
            maxLength={12}
            inputMode="numeric"
            placeholder="12-digit Aadhaar number"
            value={formData.aadhaar}
            onChange={handleAadhaarChange}
            autoComplete="off"
          />
        </div>

        <div className="reg-field">
          <label htmlFor="password">
            Password <span className="req">*</span>
          </label>

          <div className="reg-input-icon">
            <Lock size={14} />

            <input
              id="password"
              name="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={update("password")}
              autoComplete="new-password"
            />

            <button
              type="button"
              className="reg-password-toggle"
              onClick={() =>
                setShowPassword(
                  (prev) => !prev
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={14} />
              ) : (
                <Eye size={14} />
              )}
            </button>
          </div>
        </div>

        <div className="reg-field">
          <label htmlFor="confirmPassword">
            Confirm Password{" "}
            <span className="req">*</span>
          </label>

          <div className="reg-input-icon">
            <Lock size={14} />

            <input
              id="confirmPassword"
              name="confirmPassword"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={update(
                "confirmPassword"
              )}
              autoComplete="new-password"
            />

            <button
              type="button"
              className="reg-password-toggle"
              onClick={() =>
                setShowConfirmPassword(
                  (prev) => !prev
                )
              }
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff size={14} />
              ) : (
                <Eye size={14} />
              )}
            </button>
          </div>
        </div>

        <div className="reg-field">
          <label htmlFor="state">
            State <span className="req">*</span>
          </label>

          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleStateChange}
            disabled={loadingStates}
          >
            <option value="">
              {loadingStates
                ? "Loading states..."
                : "Select State"}
            </option>

            {states.map((state) => (
              <option
                key={state.id}
                value={state.id}
              >
                {state.state_name}
              </option>
            ))}
          </select>
        </div>

        <div className="reg-field">
          <label htmlFor="branch">
            Branch <span className="req">*</span>
          </label>

          <select
            id="branch"
            name="branch"
            value={formData.branch}
            onChange={handleBranchChange}
            disabled={
              !formData.state ||
              loadingBranches
            }
          >
            <option value="">
              {!formData.state
                ? "Select State First"
                : loadingBranches
                ? "Loading branches..."
                : branches.length === 0
                ? "No branches available"
                : "Select Branch"}
            </option>

            {branches.map((branch) => (
              <option
                key={branch.id}
                value={branch.id}
              >
                {branch.branch_name}
              </option>
            ))}
          </select>
        </div>

        <div className="reg-field">
          <label htmlFor="city">
            City <span className="req">*</span>
          </label>

          <input
            id="city"
            name="city"
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={update("city")}
            autoComplete="address-level2"
          />
        </div>

        <div className="reg-field">
          <label htmlFor="pin">
            PIN Code <span className="req">*</span>
          </label>

          <input
            id="pin"
            name="pin"
            type="text"
            maxLength={6}
            inputMode="numeric"
            placeholder="500001"
            value={formData.pin}
            onChange={handlePinChange}
            autoComplete="postal-code"
          />
        </div>

        <div className="reg-field reg-field-full">
          <label htmlFor="address">
            Address <span className="req">*</span>
          </label>

          <div className="reg-input-icon">
            <MapPin size={14} />

            <input
              id="address"
              name="address"
              type="text"
              placeholder="Street address"
              value={formData.address}
              onChange={update("address")}
              autoComplete="street-address"
            />
          </div>
        </div>
      </div>

      {masterError && (
        <div className="reg-error">
          {masterError}
        </div>
      )}

      {validationError && (
        <div className="reg-error">
          {validationError}
        </div>
      )}

      <div className="reg-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() =>
            (window.location.href = "/login")
          }
        >
          <ChevronLeft size={14} />
          Back to Login
        </button>

        <button
          type="submit"
          className="btn btn-primary"
        >
          Next Step
          <ChevronRight size={14} />
        </button>
      </div>
    </form>
  );
}

function ReviewSubmitStep({
  formData,
  agreed,
  setAgreed,
  onBack,
}) {
  const navigate = useNavigate();

  const [submitting, setSubmitting] =
    useState(false);

  const [showSuccessModal, setShowSuccessModal] =
    useState(false);

  const [investorId, setInvestorId] =
    useState("");

  const [submitError, setSubmitError] =
    useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreed || submitting) {
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    try {
      const response =
        await registerInvestor(formData);

      console.log(
        "Registration response:",
        response
      );

      const generatedInvestorId =
        response?.investor_id ||
        response?.data?.investor_id ||
        response?.data?.investor?.investor_id ||
        "";

      setInvestorId(
        generatedInvestorId
      );

      if (generatedInvestorId) {
        sessionStorage.setItem(
          "registered_investor_id",
          generatedInvestorId
        );
      }

      sessionStorage.setItem(
        "registered_investor_name",
        response?.full_name ||
          response?.data?.full_name ||
          formData.fullName
      );

      setShowSuccessModal(true);
    } catch (error) {
      console.error(
        "Investor registration error:",
        error
      );

      setSubmitError(
        error.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };

  return (
    <>
      <form
        className="reg-review-form"
        onSubmit={handleSubmit}
      >
        <div className="reg-review-box">
          <div className="reg-review-heading">
            <CheckCircle2
              size={16}
              className="reg-review-heading-icon"
            />

            Review Your Application
          </div>

          {reviewRows.map(
            ({ key, label }) => (
              <div
                className="reg-review-row"
                key={key}
              >
                <span>{label}</span>

                <strong>
                  {formData[key] || "—"}
                </strong>
              </div>
            )
          )}

          <div className="reg-review-row">
            <span>Password</span>

            <strong>
              ********
            </strong>
          </div>
        </div>

        <div className="reg-warning">
          <AlertTriangle size={14} />

          <p>
            By submitting this application
            you certify that the information
            provided is correct. Providing
            incorrect information may lead to
            rejection of your registration.
          </p>
        </div>

        {submitError && (
          <div className="reg-error">
            {submitError}
          </div>
        )}

        <label className="reg-agree">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) =>
              setAgreed(
                e.target.checked
              )
            }
          />

          <span>
            I agree to the{" "}
            <a href="#terms">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="#kyc">
              KYC Policy
            </a>
            .
          </span>
        </label>

        <div className="reg-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onBack}
            disabled={submitting}
          >
            <ChevronLeft size={14} />
            Previous
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              !agreed || submitting
            }
          >
            {submitting ? (
              <>
                <Loader2
                  size={14}
                  className="reg-spin"
                />
                Submitting...
              </>
            ) : (
              <>
                Submit Application
                <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>

      {showSuccessModal && (
        <div className="reg-modal-overlay">
          <div className="reg-modal">
            <div className="reg-modal-icon">
              <CheckCircle2 size={36} />
            </div>

            <h2>
              Registration Successful
            </h2>

            <p>
              Your registration has been
              submitted successfully.
            </p>

            {investorId && (
              <>
                <p>
                  Your Investor ID is:
                </p>

                <div className="investor-id-success">
                  {investorId}
                </div>

                <p>
                  Please save this ID.
                  You will use this ID
                  to login to your account.
                </p>
              </>
            )}

            <p>
              Your account is currently{" "}
              <strong>
                Pending Admin Approval.
              </strong>
            </p>

            <button
              type="button"
              className="reg-modal-btn"
              onClick={handleModalClose}
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function Register() {
  const [currentStep, setCurrentStep] =
    useState(1);

  const [states, setStates] =
    useState([]);

  const [branches, setBranches] =
    useState([]);

  const [loadingStates, setLoadingStates] =
    useState(true);

  const [loadingBranches, setLoadingBranches] =
    useState(false);

  const [masterError, setMasterError] =
    useState("");

  const [formData, setFormData] =
    useState({
      fullName: "",
      mobile: "",
      email: "",
      password: "",
      confirmPassword: "",
      dob: "",
      aadhaar: "",
      address: "",
      city: "",
      state: "",
      stateName: "",
      pin: "",
      branch: "",
      branchName: "",
    });

  const [agreed, setAgreed] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    const loadStates = async () => {
      setLoadingStates(true);
      setMasterError("");

      try {
        const data =
          await getStates();

        if (mounted) {
          setStates(
            Array.isArray(data)
              ? data
              : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load states:",
          error
        );

        if (mounted) {
          setMasterError(
            error.message ||
              "Unable to load states."
          );
        }
      } finally {
        if (mounted) {
          setLoadingStates(false);
        }
      }
    };

    loadStates();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!formData.state) {
      setBranches([]);
      setLoadingBranches(false);
      return;
    }

    let mounted = true;

    const loadBranches = async () => {
      setLoadingBranches(true);
      setMasterError("");

      try {
        const data =
          await getBranches(
            formData.state
          );

        if (mounted) {
          setBranches(
            Array.isArray(data)
              ? data
              : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load branches:",
          error
        );

        if (mounted) {
          setBranches([]);
          setMasterError(
            error.message ||
              "Unable to load branches."
          );
        }
      } finally {
        if (mounted) {
          setLoadingBranches(false);
        }
      }
    };

    loadBranches();

    return () => {
      mounted = false;
    };
  }, [formData.state]);

  const goNext = () => {
    setCurrentStep((prev) =>
      Math.min(
        prev + 1,
        steps.length
      )
    );
  };

  const goBack = () => {
    setCurrentStep((prev) =>
      Math.max(prev - 1, 1)
    );
  };

  return (
    <div className="reg-page">
      <div className="reg-header">


        <h1>
          Investor Registration
        </h1>

        <p>
          Complete your KYC to start investing
        </p>

        <div className="reg-stepper">
          {steps.map(
            (step, index) => (
              <React.Fragment
                key={step.id}
              >
                <div className="reg-step">
                  <div
                    className={`reg-step-circle ${
                      currentStep ===
                      step.id
                        ? "reg-step-active"
                        : currentStep >
                          step.id
                        ? "reg-step-done"
                        : ""
                    }`}
                  >
                    {currentStep >
                    step.id ? (
                      <CheckCircle2
                        size={14}
                      />
                    ) : (
                      step.id
                    )}
                  </div>

                  <span
                    className={`reg-step-label ${
                      currentStep >=
                      step.id
                        ? "reg-step-label-active"
                        : ""
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index <
                  steps.length - 1 && (
                  <div
                    className={`reg-step-line ${
                      currentStep >
                      step.id
                        ? "reg-step-line-done"
                        : ""
                    }`}
                  />
                )}
              </React.Fragment>
            )
          )}
        </div>
      </div>

      <div className="reg-card">
        {currentStep === 1 && (
          <PersonalInfoStep
            formData={formData}
            setFormData={
              setFormData
            }
            onNext={goNext}
            states={states}
            branches={branches}
            loadingStates={
              loadingStates
            }
            loadingBranches={
              loadingBranches
            }
            masterError={
              masterError
            }
          />
        )}

        {currentStep === 2 && (
          <ReviewSubmitStep
            formData={formData}
            agreed={agreed}
            setAgreed={
              setAgreed
            }
            onBack={goBack}
          />
        )}
      </div>
    </div>
  );
}