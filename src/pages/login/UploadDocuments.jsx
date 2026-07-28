import React, { useRef } from "react";
import { Upload, ChevronLeft, ChevronRight, FileCheck2 } from "lucide-react";

const documentFields = [
  { key: "aadhaarFront", label: "Aadhaar Card (Front)" },
  { key: "aadhaarBack", label: "Aadhaar Card (Back)" },
  { key: "pan", label: "PAN Card" },
  { key: "photo", label: "Passport Photo" },
  { key: "passbook", label: "Bank Passbook" },
];

export default function UploadDocumentsStep({
  documents,
  setDocuments,
  onNext,
  onBack,
}) {
  const inputRefs = useRef({});

  const handleFile = (key) => (e) => {
    const file = e.target.files?.[0] || null;
    setDocuments((prev) => ({ ...prev, [key]: file }));
  };

  return (
    <>
      <p className="reg-upload-hint">
        Upload clear, legible scans or photos of the following documents. Max
        file size: 5MB each.
      </p>

      <div className="reg-upload-list">
        {documentFields.map(({ key, label }) => {
          const file = documents[key];
          return (
            <button
              type="button"
              key={key}
              className="reg-upload-card"
              onClick={() => inputRefs.current[key]?.click()}
            >
              <span className="reg-upload-icon">
                {file ? <FileCheck2 size={18} /> : <Upload size={18} />}
              </span>
              <span>
                <span className="reg-upload-title">{label}</span>
                <span className="reg-upload-sub">
                  {file
                    ? file.name
                    : "Click to upload — PNG, JPG, PDF (Max 5MB)"}
                </span>
              </span>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                ref={(el) => (inputRefs.current[key] = el)}
                onChange={handleFile(key)}
                hidden
              />
            </button>
          );
        })}
      </div>

      <div className="reg-actions">
        <button type="button" className="btn btn-outline" onClick={onBack}>
          <ChevronLeft size={15} /> Previous
        </button>
        <button type="button" className="btn btn-primary" onClick={onNext}>
          Next Step <ChevronRight size={15} />
        </button>
      </div>
    </>
  );
}
