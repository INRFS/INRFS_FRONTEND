import React, { useMemo, useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import Modal from "./Modal";
import Toast, { useToast } from "./Toast";
import "../../Styles/SuperAdmin/UserManagement.css";

const BRANCHES = ["Mumbai HQ", "Delhi North", "Bangalore", "Chennai", "Pune", "Head Office"];
const ROLES = ["Investor", "Admin", "Branch Manager", "Super Admin"];

const INITIAL_USERS = [
  { id: 1, name: "Arjun Sharma", email: "arjun@email.com", role: "Investor", branch: "Mumbai HQ", status: "Active" },
  { id: 2, name: "Ravi Mehta", email: "ravi@inrfs.in", role: "Admin", branch: "Mumbai HQ", status: "Active" },
  { id: 3, name: "Kishore Nair", email: "kishore@inrfs.in", role: "Branch Manager", branch: "Mumbai HQ", status: "Active" },
  { id: 4, name: "Super Admin", email: "sa@inrfs.in", role: "Super Admin", branch: "Head Office", status: "Active" },
];

const emptyForm = { name: "", email: "", role: ROLES[0], branch: BRANCHES[0], status: "Active" };

export default function UserManagement() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const { toast, showToast, clearToast } = useToast();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.email, u.role, u.branch].some((v) => v.toLowerCase().includes(q))
    );
  }, [users, search]);

  const openAdd = () => { setForm(emptyForm); setErrors({}); setModalMode("add"); };
  const openEdit = (row) => {
    setActiveRow(row);
    setForm({ name: row.name, email: row.email, role: row.role, branch: row.branch, status: row.status });
    setErrors({});
    setModalMode("edit");
  };
  const openView = (row) => { setActiveRow(row); setModalMode("view"); };
  const openDelete = (row) => { setActiveRow(row); setModalMode("delete"); };
  const closeModal = () => { setModalMode(null); setActiveRow(null); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (modalMode === "add") {
      const newUser = { id: Date.now(), ...form, name: form.name.trim(), email: form.email.trim() };
      setUsers((prev) => [newUser, ...prev]);
      showToast(`"${newUser.name}" added.`);
    } else if (modalMode === "edit" && activeRow) {
      setUsers((prev) => prev.map((u) => (u.id === activeRow.id ? { ...u, ...form, name: form.name.trim(), email: form.email.trim() } : u)));
      showToast(`"${form.name}" updated.`);
    }
    closeModal();
  };

  const confirmDelete = () => {
    if (activeRow) {
      setUsers((prev) => prev.filter((u) => u.id !== activeRow.id));
      showToast(`"${activeRow.name}" removed.`);
    }
    closeModal();
  };

  return (
    <>
      <div className="sa-page-header">
        <h1>User Management</h1>
        <button type="button" className="sa-btn sa-btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="sa-card">
        <div className="sa-card-search">
          <Search size={15} />
          <input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td className="sa-cell-strong">{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.role}</td>
                  <td>{row.branch}</td>
                  <td><span className={`sa-badge ${row.status === "Active" ? "sa-badge-green" : "sa-badge-red"}`}>{row.status}</span></td>
                  <td>
                    <div className="sa-actions">
                      <button type="button" className="sa-icon-btn" onClick={() => openView(row)} title="View"><Eye size={15} /></button>
                      <button type="button" className="sa-icon-btn" onClick={() => openEdit(row)} title="Edit"><Pencil size={15} /></button>
                      <button type="button" className="sa-icon-btn sa-icon-btn-danger" onClick={() => openDelete(row)} title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="sa-empty">No users match your search.</div>}
        </div>

        <div className="sa-table-footer">
          <span>Showing {filtered.length ? 1 : 0}–{filtered.length} of {filtered.length} records</span>
        </div>
      </div>

      {(modalMode === "add" || modalMode === "edit") && (
        <Modal
          title={modalMode === "add" ? "Add User" : "Edit User"}
          onClose={closeModal}
          footer={
            <>
              <button type="button" className="sa-btn sa-btn-ghost" onClick={closeModal}>Cancel</button>
              <button type="button" className="sa-btn sa-btn-primary" onClick={handleSubmit}>{modalMode === "add" ? "Add User" : "Save Changes"}</button>
            </>
          }
        >
          <div className="sa-field">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            {errors.name && <div className="sa-field-error">{errors.name}</div>}
          </div>
          <div className="sa-field">
            <label>Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@email.com" />
            {errors.email && <div className="sa-field-error">{errors.email}</div>}
          </div>
          <div className="sa-field">
            <label>Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="sa-field">
            <label>Branch</label>
            <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
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
        <Modal title="User Details" onClose={closeModal} footer={<button type="button" className="sa-btn sa-btn-primary" onClick={closeModal}>Close</button>}>
          <div className="sa-view-row"><span>Name</span><span>{activeRow.name}</span></div>
          <div className="sa-view-row"><span>Email</span><span>{activeRow.email}</span></div>
          <div className="sa-view-row"><span>Role</span><span>{activeRow.role}</span></div>
          <div className="sa-view-row"><span>Branch</span><span>{activeRow.branch}</span></div>
          <div className="sa-view-row"><span>Status</span><span>{activeRow.status}</span></div>
        </Modal>
      )}

      {modalMode === "delete" && activeRow && (
        <Modal
          title="Remove User"
          onClose={closeModal}
          footer={
            <>
              <button type="button" className="sa-btn sa-btn-ghost" onClick={closeModal}>Cancel</button>
              <button type="button" className="sa-btn sa-btn-danger" onClick={confirmDelete}>Remove</button>
            </>
          }
        >
          <p style={{ margin: 0, fontSize: 13.5, color: "#374151" }}>
            Are you sure you want to remove <strong>{activeRow.name}</strong>? This can't be undone.
          </p>
        </Modal>
      )}

      <Toast message={toast} onDone={clearToast} />
    </>
  );
}