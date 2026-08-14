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


/* =========================================================
   EMPTY PROFILE
========================================================= */

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
    name: "",
    accountNumber: "",
    ifsc: "",
    accountType: "",
  },
};


/* =========================================================
   MAP API RESPONSE
========================================================= */

const mapProfileResponse = (data) => {
  const fullName =
    data?.full_name || "";

  return {
    investorId:
      data?.investor_id || "",

    name: fullName,

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
      data?.state_id || "",

    stateName:
      data?.state_name || "",

    pincode:
      data?.pincode || "",

    branchId:
      data?.branch_id || "",

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
        ? fullName
            .charAt(0)
            .toUpperCase()
        : "A",

    bank: {
      name:
        data?.bank?.name ||
        data?.bank_name ||
        "",

      accountNumber:
        data?.bank?.accountNumber ||
        data?.account_number ||
        "",

      ifsc:
        data?.bank?.ifsc ||
        data?.ifsc_code ||
        "",

      accountType:
        data?.bank?.accountType ||
        data?.account_type ||
        "",
    },
  };
};


/* =========================================================
   PROFILE COMPONENT
========================================================= */

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


  /* =======================================================
     LOAD PROFILE
  ======================================================= */

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

      const mappedProfile =
        mapProfileResponse(response);

      setProfile(mappedProfile);
      setDraft(mappedProfile);
    } catch (err) {
      console.error(
        "Get investor profile error:",
        err
      );

      setError(
        err.message ||
          "Unable to load investor profile."
      );
    } finally {
      setLoading(false);
    }
  };


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadProfile();
  }, []);


  /* =======================================================
     EDIT
  ======================================================= */

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


  /* =======================================================
     CANCEL
  ======================================================= */

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


  /* =======================================================
     FIELD CHANGE
  ======================================================= */

  const handleFieldChange = (
    field,
    value
  ) => {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }));
  };


  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await updateInvestorProfile(
          draft
        );

      console.log(
        "Update investor profile response:",
        response
      );

      const updatedProfile =
        mapProfileResponse(response);

      setProfile(updatedProfile);
      setDraft(updatedProfile);

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
        err.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };


  /* =======================================================
     LOADING
  ======================================================= */

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


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="investor-page">

      {/* ===================================================
          TOP ACTIONS
      =================================================== */}

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


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="profile-alert profile-alert--error">
          <AlertCircle size={17} />

          <span>
            {error}
          </span>
        </div>
      )}


      {/* ===================================================
          SUCCESS
      =================================================== */}

      {success && (
        <div className="profile-alert profile-alert--success">
          <CheckCircle2 size={17} />

          <span>
            {success}
          </span>
        </div>
      )}


      {/* ===================================================
          PROFILE LAYOUT
      =================================================== */}

      <div className="profile-layout">

        {/* =================================================
            LEFT PROFILE CARD
        ================================================= */}

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


        {/* =================================================
            RIGHT COLUMN
        ================================================= */}

        <div className="profile-right-col">

          {/* ===============================================
              PERSONAL INFORMATION
          =============================================== */}

          <div className="profile-info-card">

            <p className="investor-section__title">
              Personal Information
            </p>


            <div className="profile-info-grid">

              {/* FULL NAME */}

              <div className="profile-info-field">

                <span className="profile-info-label">
                  <User size={13} />

                  Full Name
                </span>

                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    value={
                      draft.name
                    }
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


              {/* MOBILE */}

              <div className="profile-info-field">

                <span className="profile-info-label">
                  <Phone size={13} />

                  Mobile
                </span>

                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    value={
                      draft.mobile
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        "mobile",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <span className="profile-info-value">
                    {profile.mobile || "—"}
                  </span>
                )}

              </div>


              {/* EMAIL */}

              <div className="profile-info-field">

                <span className="profile-info-label">
                  <Mail size={13} />

                  Email
                </span>

                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="email"
                    value={
                      draft.email
                    }
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


              {/* DATE OF BIRTH */}

              <div className="profile-info-field">

                <span className="profile-info-label">
                  Date of Birth
                </span>

                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="date"
                    value={
                      draft.dateOfBirth
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


              {/* CITY */}

              <div className="profile-info-field">

                <span className="profile-info-label">
                  City
                </span>

                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    value={
                      draft.city
                    }
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


              {/* PINCODE */}

              <div className="profile-info-field">

                <span className="profile-info-label">
                  Pincode
                </span>

                {isEditing ? (
                  <input
                    className="profile-info-input"
                    type="text"
                    maxLength={10}
                    value={
                      draft.pincode
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        "pincode",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  <span className="profile-info-value">
                    {profile.pincode || "—"}
                  </span>
                )}

              </div>


              {/* ADDRESS */}

              <div
                className="profile-info-field"
                style={{
                  gridColumn:
                    "1 / -1",
                }}
              >

                <span className="profile-info-label">
                  <MapPin size={13} />

                  Address
                </span>

                {isEditing ? (
                  <textarea
                    className="profile-info-input profile-info-textarea"
                    value={
                      draft.address
                    }
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


              {/* STATE */}

              <div className="profile-info-field">

                <span className="profile-info-label">
                  State
                </span>

                <span className="profile-info-value">
                  {profile.stateName || "—"}
                </span>

              </div>


              {/* ROLE */}

              <div className="profile-info-field">

                <span className="profile-info-label">
                  Role
                </span>

                <span className="profile-info-value">
                  {profile.role}
                </span>

              </div>


              {/* BRANCH */}

              <div className="profile-info-field">

                <span className="profile-info-label">
                  <Building2 size={13} />

                  Branch
                </span>

                <span className="profile-info-value">
                  {profile.branch || "—"}
                </span>

              </div>


              {/* STATUS */}

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


          {/* ===============================================
              BANK DETAILS
          =============================================== */}

          <div className="profile-info-card">

            <p className="investor-section__title">
              <CreditCard size={17} />

              Bank Details
            </p>

            <div className="profile-info-grid">

              {/* BANK NAME */}

              <div className="profile-info-field">

                <span className="profile-info-label">
                  Bank Name
                </span>

                <span className="profile-info-value">
                  {profile.bank.name || "—"}
                </span>

              </div>


              {/* ACCOUNT NUMBER */}

              <div className="profile-info-field">

                <span className="profile-info-label">
                  Account Number
                </span>

                <span className="profile-info-value">
                  {profile.bank.accountNumber || "—"}
                </span>

              </div>


              {/* IFSC */}

              <div className="profile-info-field">

                <span className="profile-info-label">
                  IFSC Code
                </span>

                <span className="profile-info-value">
                  {profile.bank.ifsc || "—"}
                </span>

              </div>


              {/* ACCOUNT TYPE */}

              <div className="profile-info-field">

                <span className="profile-info-label">
                  Account Type
                </span>

                <span className="profile-info-value">
                  {profile.bank.accountType || "—"}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}