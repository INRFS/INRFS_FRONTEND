import React, {
  useEffect,
  useState,
} from "react";

import {
  Edit2,
  X,
  Save,
  Loader2,
} from "lucide-react";

import {
  getAdminProfile,
  updateAdminProfile,
} from "../../services/admin/adminProfileService";

import "../../Styles/Admin/Profile.css";


const emptyProfile = {
  id: null,
  name: "",
  email: "",
  mobile: "",
  role: "",
  branch: "",
  status: "",
  username: "",
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
        await getAdminProfile();

      const data =
        response?.data || {};

      const loadedProfile = {
        id: data.id ?? null,
        name: data.name || "",
        email: data.email || "",
        mobile: data.mobile || "",
        role: data.role || "",
        branch: data.branch || "",
        status: data.status || "",
        username: data.username || "",
      };

      setProfile(
        loadedProfile
      );

      setDraft(
        loadedProfile
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load profile."
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
    });

    setError("");
    setSuccess("");
    setIsEditing(true);
  };


  const handleCancel = () => {
    setDraft({
      ...profile,
    });

    setError("");
    setSuccess("");
    setIsEditing(false);
  };


  const handleFieldChange = (
    field,
    value
  ) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };


  const handleSave = async () => {
    if (!draft.name.trim()) {
      setError(
        "Full name is required."
      );
      return;
    }

    if (
      draft.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        draft.email
      )
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!draft.mobile.trim()) {
      setError(
        "Mobile number is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await updateAdminProfile({
          name: draft.name,
          email: draft.email,
          mobile: draft.mobile,
        });

      const data =
        response?.data || {};

      const updatedProfile = {
        id: data.id ?? profile.id,
        name: data.name || "",
        email: data.email || "",
        mobile: data.mobile || "",
        role: data.role || "",
        branch: data.branch || "",
        status: data.status || "",
        username: data.username || "",
      };

      setProfile(
        updatedProfile
      );

      setDraft(
        updatedProfile
      );

      setIsEditing(false);

      setSuccess(
        response?.message ||
          "Profile updated successfully."
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };


  const getInitial = () => {
    const name =
      profile.name?.trim();

    if (!name) {
      return "A";
    }

    return name
      .charAt(0)
      .toUpperCase();
  };


  if (loading) {
    return (
      <div className="admin-page">
        <div className="profile-loading">
          <Loader2
            size={20}
            className="profile-loading-spinner"
          />
          <span>
            Loading profile...
          </span>
        </div>
      </div>
    );
  }


  return (
    <div className="admin-page">

      <div className="admin-page-actions admin-page-actions--end">

        {isEditing ? (
          <>
            <button
              type="button"
              className="admin-btn admin-btn--outline"
              onClick={
                handleCancel
              }
              disabled={saving}
            >
              <X size={14} />
              Cancel
            </button>

            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={
                handleSave
              }
              disabled={saving}
            >
              {saving ? (
                <Loader2
                  size={14}
                  className="profile-loading-spinner"
                />
              ) : (
                <Save size={14} />
              )}

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={
              handleEditClick
            }
          >
            <Edit2 size={14} />
            Edit Profile
          </button>
        )}

      </div>


      {error && (
        <div className="profile-alert profile-alert--error">
          {error}
        </div>
      )}


      {success && (
        <div className="profile-alert profile-alert--success">
          {success}
        </div>
      )}


      <div className="profile-layout">

        <div className="profile-card">

          <span className="profile-avatar">
            {getInitial()}
          </span>

          <p className="profile-name">
            {profile.name ||
              "Admin User"}
          </p>

          <p className="profile-email">
            {profile.email ||
              "No email"}
          </p>

          <span className="profile-role-pill">
            {profile.role ||
              "Admin"}
          </span>

        </div>


        <div className="profile-info-card">

          <p className="admin-section__title">
            Personal Information
          </p>


          <div className="profile-info-grid">

            <div className="profile-info-field">

              <span className="profile-info-label">
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
                  disabled={saving}
                />
              ) : (
                <span className="profile-info-value">
                  {profile.name ||
                    "—"}
                </span>
              )}

            </div>


            <div className="profile-info-field">

              <span className="profile-info-label">
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
                  disabled={saving}
                />
              ) : (
                <span className="profile-info-value">
                  {profile.mobile ||
                    "—"}
                </span>
              )}

            </div>


            <div className="profile-info-field">

              <span className="profile-info-label">
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
                  disabled={saving}
                />
              ) : (
                <span className="profile-info-value">
                  {profile.email ||
                    "—"}
                </span>
              )}

            </div>


            <div className="profile-info-field">

              <span className="profile-info-label">
                Username
              </span>

              <span className="profile-info-value">
                {profile.username ||
                  "—"}
              </span>

            </div>


            <div className="profile-info-field">

              <span className="profile-info-label">
                Role
              </span>

              <span className="profile-info-value">
                {profile.role ||
                  "—"}
              </span>

            </div>


            <div className="profile-info-field">

              <span className="profile-info-label">
                Branch
              </span>

              <span className="profile-info-value">
                {profile.branch ||
                  "—"}
              </span>

            </div>


            <div className="profile-info-field">

              <span className="profile-info-label">
                Status
              </span>

              <span
                className={`profile-status ${
                  profile.status
                    ?.toLowerCase()
                    .includes("active")
                    ? "profile-status--active"
                    : "profile-status--inactive"
                }`}
              >
                {profile.status ||
                  "—"}
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}