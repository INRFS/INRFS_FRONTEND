import React, {
  useEffect,
  useState,
} from "react";

import {
  Edit2,
  X,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

import "../../Styles/Investor/Profile.css";

import {
  getInvestorProfile,
  updateInvestorProfile,
} from "../../services/investorProfileService";

const emptyProfile = {
  investorId: "",
  name: "",
  email: "",
  mobile: "",
  dateOfBirth: "",
  address: "",
  city: "",
  stateId: "",
  stateName: "",
  pincode: "",
  branchId: "",
  branch: "",
  role: "Investor Portal",
  status: "",
  kyc: "",
  initial: "A",

  bank: {
    id: "",
    accountHolderName: "",
    name: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    accountTypeId: "",
    accountType: "",
    isPrimary: false,
  },
};

const mapProfileResponse = (data) => {
  const fullName = data?.full_name || "";
  const bankData = data?.bank || {};

  return {
    investorId:
      data?.investor_id || "",

    name:
      fullName,

    email:
      data?.email || "",

    mobile:
      data?.mobile || "",

    dateOfBirth:
      data?.date_of_birth || "",

    address:
      data?.address || "",

    city:
      data?.city || "",

    stateId:
      data?.state_id ?? "",

    stateName:
      data?.state_name || "",

    pincode:
      data?.pincode || "",

    branchId:
      data?.branch_id ?? "",

    branch:
      data?.branch_name || "",

    role:
      "Investor Portal",

    status:
      data?.status || "",

    kyc:
      data?.kyc_status ||
      data?.kyc_status_name ||
      "",

    initial:
      fullName
        ? fullName.charAt(0).toUpperCase()
        : "A",

    bank: {
      id:
        bankData?.id ?? "",

      accountHolderName:
        bankData?.account_holder_name ||
        "",

      name:
        bankData?.bank_name ||
        "",

      bankName:
        bankData?.bank_name ||
        "",

      accountTypeId:
        bankData?.account_type_id ?? "",

      accountType:
        bankData?.account_type ||
        "",

      accountNumber:
        bankData?.account_number ||
        "",

      ifsc:
        bankData?.ifsc_code ||
        "",

      isPrimary:
        Boolean(bankData?.is_primary),
    },
  };
};

export default function Profile() {
  const [profile, setProfile] =
    useState(emptyProfile);

  const [draft, setDraft] =
    useState(emptyProfile);

  const [isEditing, setIsEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getInvestorProfile();

      console.log(
        "Investor profile response:",
        response
      );

      const mapped =
        mapProfileResponse(response);

      console.log(
        "Mapped investor profile:",
        mapped
      );

      console.log(
        "Mapped bank details:",
        mapped.bank
      );

      setProfile(mapped);

      setDraft({
        ...mapped,
        bank: {
          ...mapped.bank,
        },
      });
    } catch (err) {
      console.error(
        "Get investor profile error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load investor profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleEditClick = () => {
    setDraft({
      ...profile,
      bank: {
        ...profile.bank,
      },
    });

    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft({
      ...profile,
      bank: {
        ...profile.bank,
      },
    });

    setError("");
    setSuccess("");
    setIsEditing(false);
  };

  const handleFieldChange = (
    field,
    value
  ) => {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleBankFieldChange = (
    field,
    value
  ) => {
    setDraft((previous) => ({
      ...previous,

      bank: {
        ...(previous.bank || {}),
        [field]: value,
      },
    }));
  };

  const validateProfile = () => {
    if (!draft.name?.trim()) {
      return "Full name is required.";
    }

    if (!draft.mobile?.trim()) {
      return "Mobile number is required.";
    }

    if (
      !/^[0-9]{10,20}$/.test(
        draft.mobile.trim()
      )
    ) {
      return "Please enter a valid mobile number.";
    }

    if (
      draft.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        draft.email.trim()
      )
    ) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const validationError =
        validateProfile();

      if (validationError) {
        setError(validationError);
        setSaving(false);
        return;
      }

      console.log(
        "Saving investor profile:",
        draft
      );

      console.log(
        "Saving bank details:",
        draft.bank
      );

      const response =
        await updateInvestorProfile(
          draft
        );

      console.log(
        "Updated investor profile:",
        response
      );

      const updated =
        mapProfileResponse(response);

      setProfile(updated);

      setDraft({
        ...updated,
        bank: {
          ...updated.bank,
        },
      });

      setIsEditing(false);

      setSuccess(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Update investor profile error:",
        err
      );

      setError(
        err?.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="investor-page">
        <div className="profile-loading">
          <Loader2
            size={28}
            className="profile-loading-icon"
          />

          <span>
            Loading profile...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="investor-page">

      <div className="investor-page-actions investor-page-actions--end">

        {isEditing ? (
          <>
            <button
              type="button"
              className="investor-btn investor-btn--outline"
              onClick={handleCancel}
              disabled={saving}
            >
              <X size={14} />
              Cancel
            </button>

            <button
              type="button"
              className="investor-btn investor-btn--primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2
                    size={14}
                    className="profile-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Changes
                </>
              )}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="investor-btn investor-btn--primary"
            onClick={handleEditClick}
          >
            <Edit2 size={14} />
            Edit Profile
          </button>
        )}

      </div>

      {error && (
        <div className="profile-alert profile-alert--error">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="profile-alert profile-alert--success">
          <CheckCircle2 size={17} />
          <span>{success}</span>
        </div>
      )}

      <div className="profile-layout">

        <div className="profile-card">

          <span className="profile-avatar">
            {profile.initial}
          </span>

          <p className="profile-name">
            {profile.name || "—"}
          </p>

          <p className="profile-email">
            {profile.email || "—"}
          </p>

          {profile.investorId && (
            <p className="profile-investor-id">
              {profile.investorId}
            </p>
          )}

          {profile.kyc && (
            <span className="profile-role-pill">
              <ShieldCheck size={13} />
              {profile.kyc}
            </span>
          )}

        </div>

        <div className="profile-right-col">

          <div className="profile-info-card">

            <p className="investor-section__title">
              Personal Information
            </p>

            <div className="profile-info-grid">

              <div className="profile-info-field">

                <span className="profile-info-label">
                  <User size={13} />
                  Full Name
                </span>

                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    value={draft.name}
                    onChange={(e) =>
                      handleFieldChange(
                        "name",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <span className="profile-info-value">
                    {profile.name || "—"}
                  </span>
                )}

              </div>

              <div className="profile-info-field">

                <span className="profile-info-label">
                  <Phone size={13} />
                  Mobile
                </span>

                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    maxLength={20}
                    value={draft.mobile}
                    onChange={(e) =>
                      handleFieldChange(
                        "mobile",
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                  />
                ) : (
                  <span className="profile-info-value">
                    {profile.mobile || "—"}
                  </span>
                )}

              </div>

              <div className="profile-info-field">

                <span className="profile-info-label">
                  <Mail size={13} />
                  Email
                </span>

                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="email"
                    value={draft.email}
                    onChange={(e) =>
                      handleFieldChange(
                        "email",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <span className="profile-info-value">
                    {profile.email || "—"}
                  </span>
                )}

              </div>

              <div className="profile-info-field">

                <span className="profile-info-label">
                  Date of Birth
                </span>

                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="date"
                    value={
                      draft.dateOfBirth || ""
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        "dateOfBirth",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <span className="profile-info-value">
                    {profile.dateOfBirth || "—"}
                  </span>
                )}

              </div>

              <div className="profile-info-field">

                <span className="profile-info-label">
                  City
                </span>

                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    value={draft.city}
                    onChange={(e) =>
                      handleFieldChange(
                        "city",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <span className="profile-info-value">
                    {profile.city || "—"}
                  </span>
                )}

              </div>

              <div className="profile-info-field">

                <span className="profile-info-label">
                  Pincode
                </span>

                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    maxLength={10}
                    value={draft.pincode}
                    onChange={(e) =>
                      handleFieldChange(
                        "pincode",
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                  />
                ) : (
                  <span className="profile-info-value">
                    {profile.pincode || "—"}
                  </span>
                )}

              </div>

              <div
                className="profile-info-field"
                style={{
                  gridColumn: "1 / -1",
                }}
              >

                <span className="profile-info-label">
                  <MapPin size={13} />
                  Address
                </span>

                {isEditing ? (
                  <textarea
                    className="profile-info-input profile-info-textarea"
                    value={draft.address}
                    onChange={(e) =>
                      handleFieldChange(
                        "address",
                        e.target.value
                      )
                    }
                    rows={3}
                  />
                ) : (
                  <span className="profile-info-value">
                    {profile.address || "—"}
                  </span>
                )}

              </div>

              <div className="profile-info-field">

                <span className="profile-info-label">
                  State
                </span>

                <span className="profile-info-value">
                  {profile.stateName || "—"}
                </span>

              </div>

              <div className="profile-info-field">

                <span className="profile-info-label">
                  Role
                </span>

                <span className="profile-info-value">
                  {profile.role}
                </span>

              </div>

              <div className="profile-info-field">

                <span className="profile-info-label">
                  <Building2 size={13} />
                  Branch
                </span>

                <span className="profile-info-value">
                  {profile.branch || "—"}
                </span>

              </div>

              <div className="profile-info-field">

                <span className="profile-info-label">
                  Status
                </span>

                <span className="profile-info-value">
                  {profile.status || "—"}
                </span>

              </div>

            </div>

          </div>

          <div className="profile-info-card">

            <p className="investor-section__title">
              <CreditCard size={17} />
              Bank Details
            </p>

            <div className="profile-info-grid">

              <div className="profile-info-field">

                <span className="profile-info-label">
                  Bank Name
                </span>

                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    value={
                      draft.bank?.bankName ||
                      draft.bank?.name ||
                      ""
                    }
                    onChange={(e) =>
                      handleBankFieldChange(
                        "bankName",
                        e.target.value
                      )
                    }
                    placeholder="Enter bank name"
                  />
                ) : (
                  <span className="profile-info-value">
                    {profile.bank?.bankName ||
                      profile.bank?.name ||
                      "—"}
                  </span>
                )}

              </div>

              <div className="profile-info-field">

                <span className="profile-info-label">
                  Account Holder Name
                </span>

                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    value={
                      draft.bank
                        ?.accountHolderName ||
                      ""
                    }
                    onChange={(e) =>
                      handleBankFieldChange(
                        "accountHolderName",
                        e.target.value
                      )
                    }
                    placeholder="Enter account holder name"
                  />
                ) : (
                  <span className="profile-info-value">
                    {profile.bank
                      ?.accountHolderName ||
                      "—"}
                  </span>
                )}

              </div>

              <div className="profile-info-field">

                <span className="profile-info-label">
                  Account Number
                </span>

                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={30}
                    value={
                      draft.bank
                        ?.accountNumber || ""
                    }
                    onChange={(e) =>
                      handleBankFieldChange(
                        "accountNumber",
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    placeholder="Enter account number"
                  />
                ) : (
                  <span className="profile-info-value">
                    {profile.bank
                      ?.accountNumber || "—"}
                  </span>
                )}

              </div>

              <div className="profile-info-field">

                <span className="profile-info-label">
                  IFSC Code
                </span>

                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    maxLength={11}
                    value={
                      draft.bank?.ifsc || ""
                    }
                    onChange={(e) =>
                      handleBankFieldChange(
                        "ifsc",
                        e.target.value
                          .toUpperCase()
                          .replace(
                            /[^A-Z0-9]/g,
                            ""
                          )
                      )
                    }
                    placeholder="Enter IFSC code"
                  />
                ) : (
                  <span className="profile-info-value">
                    {profile.bank?.ifsc || "—"}
                  </span>
                )}

              </div>

              <div className="profile-info-field">

                <span className="profile-info-label">
                  Account Type
                </span>

                {isEditing ? (
                  <select
                    className="profile-info-input"
                    value={
                      draft.bank
                        ?.accountType || ""
                    }
                    onChange={(e) => {
                      const value =
                        e.target.value;

                      const accountTypeId =
                        value === "Savings"
                          ? 1
                          : value === "Current"
                          ? 2
                          : "";

                      handleBankFieldChange(
                        "accountType",
                        value
                      );

                      handleBankFieldChange(
                        "accountTypeId",
                        accountTypeId
                      );
                    }}
                  >
                    <option value="">
                      Select account type
                    </option>

                    <option value="Savings">
                      Savings
                    </option>

                    <option value="Current">
                      Current
                    </option>
                  </select>
                ) : (
                  <span className="profile-info-value">
                    {profile.bank
                      ?.accountType || "—"}
                  </span>
                )}

              </div>

              <div className="profile-info-field">

                <span className="profile-info-label">
                  Primary Account
                </span>

                <span className="profile-info-value">
                  {profile.bank?.isPrimary
                    ? "Yes"
                    : "No"}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}