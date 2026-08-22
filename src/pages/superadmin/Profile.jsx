import React, {
  useEffect,
  useState,
} from "react";
import {
  Edit2,
  X,
  Save,
  Check,
  User,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  CircleCheck,
  Loader2,
} from "lucide-react";

import "../../Styles/SuperAdmin/Profile.css";

import {
  getSuperAdminProfile,
  updateSuperAdminProfile,
} from "../../services/superadmin/profileService";

const EMPTY_PROFILE = {
  fullName: "",
  email: "",
  mobile: "",
  role: "",
  branch: "",
  status: "",
};

export default function Profile() {
  const [profile, setProfile] =
    useState(EMPTY_PROFILE);

  const [formData, setFormData] =
    useState(EMPTY_PROFILE);

  const [isEditing, setIsEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState({});

  const [showToast, setShowToast] =
    useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getSuperAdminProfile();

      const data =
        response?.data || {};

      const normalized = {
        fullName:
          data.full_name ||
          data.fullName ||
          data.name ||
          "",
        email:
          data.email || "",
        mobile:
          data.mobile || "",
        role:
          data.role_name ||
          data.role ||
          "",
        branch:
          data.branch_name ||
          data.branch ||
          "",
        status:
          data.status_name ||
          data.status ||
          "",
      };

      setProfile(normalized);
      setFormData(normalized);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData(profile);
      setFieldErrors({});
      setError("");
      setIsEditing(false);
      return;
    }

    setFormData(profile);
    setFieldErrors({});
    setError("");
    setIsEditing(true);
  };

  const handleChange = (
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validate = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName =
        "Full name is required.";
    }

    if (!formData.email.trim()) {
      errors.email =
        "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      errors.email =
        "Enter a valid email address.";
    }

    if (!formData.mobile.trim()) {
      errors.mobile =
        "Mobile number is required.";
    } else if (
      !/^\+?[\d\s-]{8,15}$/.test(
        formData.mobile.trim()
      )
    ) {
      errors.mobile =
        "Enter a valid mobile number.";
    }

    setFieldErrors(errors);

    return (
      Object.keys(errors).length === 0
    );
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response =
        await updateSuperAdminProfile(
          formData
        );

      const data =
        response?.data || {};

      const updatedProfile = {
        fullName:
          data.full_name ||
          data.fullName ||
          formData.fullName,
        email:
          data.email ||
          formData.email,
        mobile:
          data.mobile ||
          formData.mobile,
        role:
          data.role_name ||
          data.role ||
          profile.role,
        branch:
          data.branch_name ||
          data.branch ||
          profile.branch,
        status:
          data.status_name ||
          data.status ||
          profile.status,
      };

      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setIsEditing(false);

      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
      }, 2500);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const initial =
    profile.fullName
      ?.charAt(0)
      ?.toUpperCase() || "S";

  if (loading) {
    return (
      <div className="sa-profile-page">
        <div className="sa-profile-loading">
          <Loader2
            size={22}
            className="sa-profile-spin"
          />
          <span>
            Loading profile...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="sa-profile-page">
      <div className="sa-profile-page__header">
        <div>
          <h1 className="sa-profile-page__title">
            My Profile
          </h1>

          <p className="sa-profile-page__subtitle">
            Manage your personal information
            and account details
          </p>
        </div>

        <button
          type="button"
          className="sa-profile-edit-btn"
          onClick={handleEditToggle}
          disabled={saving}
        >
          {isEditing ? (
            <>
              <X size={14} />
              Cancel
            </>
          ) : (
            <>
              <Edit2 size={14} />
              Edit Profile
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="sa-profile-error">
          {error}
        </div>
      )}

      <div className="sa-profile-page__grid">
        <div className="sa-profile-avatar-card">
          <div className="sa-profile-avatar">
            {initial}
          </div>

          <div className="sa-profile-avatar-card__name">
            {profile.fullName || "Super Admin"}
          </div>

          <div className="sa-profile-avatar-card__email">
            {profile.email || "—"}
          </div>

          <span className="sa-profile-role-badge">
            <ShieldCheck size={13} />
            {profile.role || "Super Admin"}
          </span>

          <div className="sa-profile-account-status">
            <span className="sa-profile-status-dot" />
            {profile.status || "Active"}
          </div>
        </div>

        <div className="sa-profile-info-card">
          <div className="sa-profile-info-card__heading">
            <div>
              <h2 className="sa-profile-info-card__title">
                Personal Information
              </h2>

              <p className="sa-profile-info-card__subtitle">
                Your account and contact details
              </p>
            </div>
          </div>

          <div className="sa-profile-info-card__divider" />

          <div className="sa-profile-info-grid">
            <ProfileField
              icon={<User size={14} />}
              label="FULL NAME"
              value={formData.fullName}
              editing={isEditing}
              error={fieldErrors.fullName}
              onChange={(value) =>
                handleChange(
                  "fullName",
                  value
                )
              }
            />

            <ProfileField
              icon={<Phone size={14} />}
              label="MOBILE"
              value={formData.mobile}
              editing={isEditing}
              error={fieldErrors.mobile}
              onChange={(value) =>
                handleChange(
                  "mobile",
                  value
                )
              }
            />

            <ProfileField
              icon={<Mail size={14} />}
              label="EMAIL"
              value={formData.email}
              editing={isEditing}
              error={fieldErrors.email}
              type="email"
              onChange={(value) =>
                handleChange(
                  "email",
                  value
                )
              }
            />

            <ProfileField
              icon={<ShieldCheck size={14} />}
              label="ROLE"
              value={profile.role}
            />

            <ProfileField
              icon={<Building2 size={14} />}
              label="BRANCH"
              value={profile.branch}
            />

            <div className="sa-profile-field">
              <div className="sa-profile-field__label-row">
                <span className="sa-profile-field__icon">
                  <CircleCheck size={14} />
                </span>

                <span className="sa-profile-field__label">
                  STATUS
                </span>
              </div>

              <span
                className={`sa-profile-status-value ${
                  String(
                    profile.status
                  ).toLowerCase() ===
                  "active"
                    ? "active"
                    : "inactive"
                }`}
              >
                <span />
                {profile.status || "—"}
              </span>
            </div>
          </div>

          {isEditing && (
            <div className="sa-profile-save-area">
              <button
                type="button"
                className="sa-profile-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2
                      size={14}
                      className="sa-profile-spin"
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
            </div>
          )}
        </div>
      </div>

      {showToast && (
        <div className="sa-profile-toast">
          <span className="sa-profile-toast__icon">
            <Check size={14} />
          </span>

          Profile updated successfully!
        </div>
      )}
    </div>
  );
}

function ProfileField({
  icon,
  label,
  value,
  editing = false,
  error,
  type = "text",
  onChange,
}) {
  return (
    <div className="sa-profile-field">
      <div className="sa-profile-field__label-row">
        <span className="sa-profile-field__icon">
          {icon}
        </span>

        <span className="sa-profile-field__label">
          {label}
        </span>
      </div>

      {editing ? (
        <>
          <input
            className={
              error
                ? "sa-profile-input sa-profile-input-error"
                : "sa-profile-input"
            }
            type={type}
            value={value || ""}
            onChange={(e) =>
              onChange?.(
                e.target.value
              )
            }
          />

          {error && (
            <div className="sa-profile-field-error">
              {error}
            </div>
          )}
        </>
      ) : (
        <span className="sa-profile-field__value">
          {value || "—"}
        </span>
      )}
    </div>
  );
}