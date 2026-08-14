import React, { useMemo, useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import Modal from "./Modal";
import Toast, { useToast } from "./Toast";
import "../../Styles/SuperAdmin/BranchManagement.css";

const INITIAL_BRANCHES = [
  { id: 1, branch: "Mumbai HQ", city: "Mumbai", admin: "Ravi Mehta", investors: 342, aum: "₹18.2Cr", status: "Active" },
  { id: 2, branch: "Delhi North", city: "Delhi", admin: "Suresh Kumar", investors: 218, aum: "₹11.4Cr", status: "Active" },
  { id: 3, branch: "Bangalore", city: "Bangalore", admin: "Anita Rao", investors: 186, aum: "₹9.8Cr", status: "Active" },
  { id: 4, branch: "Chennai", city: "Chennai", admin: "Mohan Das", investors: 142, aum: "₹7.2Cr", status: "Active" },
  { id: 5, branch: "Pune", city: "Pune", admin: "Priya Joshi", investors: 98, aum: "₹5.1Cr", status: "Suspended" },
];

const emptyForm = { branch: "", city: "", admin: "", aum: "", status: "Active" };

export default function BranchManagement() {
  const [branches, setBranches] = useState(INITIAL_BRANCHES);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | "view" | "delete"
  const [activeRow, setActiveRow] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const { toast, showToast, clearToast } = useToast();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter((b) =>
      [b.branch, b.city, b.admin].some((v) => v.toLowerCase().includes(q))
    );
  }, [branches, search]);

  const openAdd = () => {
    setForm(emptyForm);
    setErrors({});
    setModalMode("add");
  };

  const openEdit = (row) => {
    setActiveRow(row);
    setForm({ branch: row.branch, city: row.city, admin: row.admin, aum: row.aum, status: row.status });
    setErrors({});
    setModalMode("edit");
  };

  const openView = (row) => {
    setActiveRow(row);
    setModalMode("view");
  };

  const openDelete = (row) => {
    setActiveRow(row);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveRow(null);
  };

  const validate = () => {
    const e = {};
    if (!form.branch.trim()) e.branch = "Branch name is required.";
    if (!form.city.trim()) e.city = "City is required.";
    if (!form.admin.trim()) e.admin = "Admin name is required.";
    if (!form.aum.trim()) e.aum = "AUM is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (modalMode === "add") {
      const newBranch = {
        id: Date.now(),
        branch: form.branch.trim(),
        city: form.city.trim(),
        admin: form.admin.trim(),
        investors: 0,
        aum: form.aum.trim(),
        status: form.status,
      };
      setBranches((prev) => [newBranch, ...prev]);
      showToast(`"${newBranch.branch}" branch added.`);
    } else if (modalMode === "edit" && activeRow) {
      setBranches((prev) =>
        prev.map((b) =>
          b.id === activeRow.id
            ? { ...b, branch: form.branch.trim(), city: form.city.trim(), admin: form.admin.trim(), aum: form.aum.trim(), status: form.status }
            : b
        )
      );
      showToast(`"${form.branch}" branch updated.`);
    }
    closeModal();
  };

  const confirmDelete = () => {
    if (activeRow) {
      setBranches((prev) => prev.filter((b) => b.id !== activeRow.id));
      showToast(`"${activeRow.branch}" branch removed.`);
    }
    closeModal();
  };

  return (
    <>
      <div className="sa-page-header">
        <h1>Branch Management</h1>
        <button type="button" className="sa-btn sa-btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Branch
        </button>
      </div>

      <div className="sa-card">
        <div className="sa-card-search">
          <Search size={15} />
          <input
            placeholder="Search branches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Branch</th>
                <th>City</th>
                <th>Admin</th>
                <th>Investors</th>
                <th>AUM</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td className="sa-cell-strong">{row.branch}</td>
                  <td>{row.city}</td>
                  <td>{row.admin}</td>
                  <td>{row.investors}</td>
                  <td>{row.aum}</td>
                  <td>
                    <span className={`sa-badge ${row.status === "Active" ? "sa-badge-green" : "sa-badge-red"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <div className="sa-actions">
                      <button type="button" className="sa-icon-btn" onClick={() => openView(row)} title="View">
                        <Eye size={15} />
                      </button>
                      <button type="button" className="sa-icon-btn" onClick={() => openEdit(row)} title="Edit">
                        <Pencil size={15} />
                      </button>
                      {/* <button type="button" className="sa-icon-btn sa-icon-btn-danger" onClick={() => openDelete(row)} title="Delete">
                        <Trash2 size={15} />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="sa-empty">No branches match your search.</div>}
        </div>

        <div className="sa-table-footer">
          <span>Showing {filtered.length ? 1 : 0}–{filtered.length} of {filtered.length} records</span>
        </div>
      </div>

      {(modalMode === "add" || modalMode === "edit") && (
        <Modal
          title={modalMode === "add" ? "Add Branch" : "Edit Branch"}
          onClose={closeModal}
          footer={
            <>
              <button type="button" className="sa-btn sa-btn-ghost" onClick={closeModal}>Cancel</button>
              <button type="button" className="sa-btn sa-btn-primary" onClick={handleSubmit}>
                {modalMode === "add" ? "Add Branch" : "Save Changes"}
              </button>
            </>
          }
        >
          <div className="sa-field">
            <label>Branch Name</label>
            <input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="e.g. Hyderabad" />
            {errors.branch && <div className="sa-field-error">{errors.branch}</div>}
          </div>
          <div className="sa-field">
            <label>City</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Hyderabad" />
            {errors.city && <div className="sa-field-error">{errors.city}</div>}
          </div>
          <div className="sa-field">
            <label>Admin</label>
            <input value={form.admin} onChange={(e) => setForm({ ...form, admin: e.target.value })} placeholder="Admin name" />
            {errors.admin && <div className="sa-field-error">{errors.admin}</div>}
          </div>
          <div className="sa-field">
            <label>AUM</label>
            <input value={form.aum} onChange={(e) => setForm({ ...form, aum: e.target.value })} placeholder="e.g. ₹3.5Cr" />
            {errors.aum && <div className="sa-field-error">{errors.aum}</div>}
          </div>
          <div className="sa-field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Active</option>
              <option>Suspended</option>
            </select>
          </div>
        </Modal>
      )}

      {modalMode === "view" && activeRow && (
        <Modal title="Branch Details" onClose={closeModal} footer={<button type="button" className="sa-btn sa-btn-primary" onClick={closeModal}>Close</button>}>
          <div className="sa-view-row"><span>Branch</span><span>{activeRow.branch}</span></div>
          <div className="sa-view-row"><span>City</span><span>{activeRow.city}</span></div>
          <div className="sa-view-row"><span>Admin</span><span>{activeRow.admin}</span></div>
          <div className="sa-view-row"><span>Investors</span><span>{activeRow.investors}</span></div>
          <div className="sa-view-row"><span>AUM</span><span>{activeRow.aum}</span></div>
          <div className="sa-view-row"><span>Status</span><span>{activeRow.status}</span></div>
        </Modal>
      )}

      {modalMode === "delete" && activeRow && (
        <Modal
          title="Remove Branch"
          onClose={closeModal}
          footer={
            <>
              <button type="button" className="sa-btn sa-btn-ghost" onClick={closeModal}>Cancel</button>
              <button type="button" className="sa-btn sa-btn-danger" onClick={confirmDelete}>Remove</button>
            </>
          }
        >
          <p style={{ margin: 0, fontSize: 13.5, color: "#374151" }}>
            Are you sure you want to remove <strong>{activeRow.branch}</strong>? This can't be undone.
          </p>
        </Modal>
      )}

      <Toast message={toast} onDone={clearToast} />
    </>
  );
}