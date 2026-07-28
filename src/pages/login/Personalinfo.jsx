import React from "react";
import { Phone, Mail, Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

export default function PersonalInfoStep({ formData, setFormData, onNext }) {
  const update = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

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
              type="text"
              placeholder="dd-mm-yyyy"
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
            <option value="Maharashtra">Maharashtra</option>
            <option value="Telangana">Telangana</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Kerala">Kerala</option>
            <option value="Delhi">Delhi</option>
          </select>
        </div>

        <div className="reg-field">
          <label>PIN Code</label>
          <input
            type="text"
            placeholder="400001"
            value={formData.pin}
            onChange={update("pin")}
          />
        </div>
      </div>

      <div className="reg-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => (window.location.href = "/login")}
        >
          <ChevronLeft size={15} /> Back to Login
        </button>
        <button type="button" className="btn btn-primary" onClick={onNext}>
          Next Step <ChevronRight size={15} />
        </button>
      </div>
    </>
  );
}