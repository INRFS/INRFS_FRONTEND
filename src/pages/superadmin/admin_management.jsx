import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  UserX,
  RefreshCw,
  Download,
} from "lucide-react";

import Modal from "./Modal";
import Toast, { useToast } from "./Toast";

import {
  getAdminManagement,
  getAdminDetails,
  getAdminBranches,
  getAdminRoles,
  getAdminStatuses,
  createAdmin,
  updateAdmin,
  suspendAdmin,
  exportAdminsCSV,
} from "../../services/superadmin/adminManagementService";

import "../../Styles/SuperAdmin/AdminManagement.css";

const emptyForm = {
  full_name: "",
  email: "",
  mobile: "",
  branch_id: "",
  role_id: "",
  status_id: "",
};

const getValue = (row, ...keys) => {
  for (const key of keys) {
    if (
      row?.[key] !== undefined &&
      row?.[key] !== null
    ) {
      return row[key];
    }
  }

  return "";
};

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [modalMode, setModalMode] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const {
    toast,
    showToast,
    clearToast,
  } = useToast();

  const normalizeAdmins = (rows) => {
    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map((row) => ({
      ...row,

      id: getValue(
        row,
        "admin_id",
        "id"
      ),

      name: getValue(
        row,
        "admin_name",
        "full_name",
        "name"
      ),

      email: getValue(
        row,
        "email"
      ),

      mobile: getValue(
        row,
        "mobile",
        "phone"
      ),

      branch: getValue(
        row,
        "branch_name",
        "branch"
      ),

      branch_id: getValue(
        row,
        "branch_id"
      ),

      role: getValue(
        row,
        "role_name",
        "role"
      ),

      role_id: getValue(
        row,
        "role_id"
      ),

      status: getValue(
        row,
        "status_name",
        "status"
      ),

      status_id: getValue(
        row,
        "status_id"
      ),
    }));
  };

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAdminManagement({
          search,
        });

      setAdmins(
        normalizeAdmins(
          response?.data || []
        )
      );
    } catch (err) {
      console.error(
        "Admin loading error:",
        err
      );

      setError(
        err?.message ||
          "Failed to load admins."
      );

      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [
        branchResponse,
        roleResponse,
        statusResponse,
      ] = await Promise.all([
        getAdminBranches(),
        getAdminRoles(),
        getAdminStatuses(),
      ]);

      setBranches(
        branchResponse?.data || []
      );

      setRoles(
        roleResponse?.data || []
      );

      setStatuses(
        statusResponse?.data || []
      );
    } catch (err) {
      console.error(
        "Admin filters error:",
        err
      );

      showToast(
        err?.message ||
          "Failed to load form options."
      );
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAdmins();
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const openAdd = () => {
    const defaultBranch =
      branches[0];

    const defaultRole =
      roles[0];

    const defaultStatus =
      statuses.find(
        (item) =>
          String(
            getValue(
              item,
              "status_name",
              "name"
            )
          ).toLowerCase() ===
          "active"
      ) || statuses[0];

    setForm({
      full_name: "",
      email: "",
      mobile: "",

      branch_id: getValue(
        defaultBranch,
        "id",
        "branch_id"
      ),

      role_id: getValue(
        defaultRole,
        "id",
        "role_id"
      ),

      status_id: getValue(
        defaultStatus,
        "id",
        "status_id"
      ),
    });

    setErrors({});
    setActiveRow(null);
    setModalMode("add");
  };

  const openEdit = async (row) => {
    try {
      setSaving(true);

      const response =
        await getAdminDetails(
          row.id
        );

      const detail =
        response?.data || row;

      setActiveRow({
        ...row,
        ...detail,
      });

      setForm({
        full_name: getValue(
          detail,
          "full_name",
          "admin_name",
          "name"
        ),

        email: getValue(
          detail,
          "email"
        ),

        mobile: getValue(
          detail,
          "mobile",
          "phone"
        ),

        branch_id: getValue(
          detail,
          "branch_id"
        ),

        role_id: getValue(
          detail,
          "role_id"
        ),

        status_id: getValue(
          detail,
          "status_id"
        ),
      });

      setErrors({});
      setModalMode("edit");
    } catch (err) {
      showToast(
        err?.message ||
          "Unable to load admin."
      );
    } finally {
      setSaving(false);
    }
  };

  const openView = async (row) => {
    try {
      setSaving(true);

      const response =
        await getAdminDetails(
          row.id
        );

      setActiveRow({
        ...row,
        ...(response?.data || {}),
      });

      setModalMode("view");
    } catch (err) {
      showToast(
        err?.message ||
          "Unable to load admin details."
      );
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (row) => {
    setActiveRow(row);
    setModalMode("delete");
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalMode(null);
    setActiveRow(null);
    setErrors({});
  };

  const validate = () => {
    const e = {};

    if (!form.full_name.trim()) {
      e.full_name =
        "Name is required.";
    }

    if (!form.email.trim()) {
      e.email =
        "Email is required.";
    } else if (
      !/^\S+@\S+\.\S+$/.test(
        form.email.trim()
      )
    ) {
      e.email =
        "Enter a valid email.";
    }

    if (!form.mobile.trim()) {
      e.mobile =
        "Mobile number is required.";
    }

    if (!form.branch_id) {
      e.branch_id =
        "Branch is required.";
    }

    if (!form.role_id) {
      e.role_id =
        "Role is required.";
    }

    if (!form.status_id) {
      e.status_id =
        "Status is required.";
    }

    setErrors(e);

    return (
      Object.keys(e).length === 0
    );
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      if (modalMode === "add") {
        await createAdmin({
          full_name:
            form.full_name.trim(),

          email:
            form.email.trim(),

          mobile:
            form.mobile.trim(),

          branch_id:
            form.branch_id,

          role_id:
            form.role_id,

          status_id:
            form.status_id,
        });

        showToast(
          `"${form.full_name}" added successfully.`
        );
      }

      if (
        modalMode === "edit" &&
        activeRow
      ) {
        await updateAdmin(
          activeRow.id,
          {
            full_name:
              form.full_name.trim(),

            email:
              form.email.trim(),

            mobile:
              form.mobile.trim(),

            branch_id:
              form.branch_id,

            role_id:
              form.role_id,

            status_id:
              form.status_id,
          }
        );

        showToast(
          `"${form.full_name}" updated successfully.`
        );
      }

      setModalMode(null);
      setActiveRow(null);
      setErrors({});

      await loadAdmins();
    } catch (err) {
      console.error(
        "Admin save error:",
        err
      );

      showToast(
        err?.message ||
          "Failed to save admin."
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmSuspend = async () => {
    if (!activeRow) {
      return;
    }

    try {
      setSaving(true);

      await suspendAdmin(
        activeRow.id
      );

      showToast(
        `"${activeRow.name}" suspended successfully.`
      );

      setModalMode(null);
      setActiveRow(null);

      await loadAdmins();
    } catch (err) {
      console.error(
        "Admin suspend error:",
        err
      );

      showToast(
        err?.message ||
          "Failed to suspend admin."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");

      await Promise.all([
        loadAdmins(),
        loadFilters(),
      ]);

      showToast(
        "Admin data refreshed."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    if (!admins.length) {
      showToast(
        "No admins to export."
      );
      return;
    }

    const result =
      exportAdminsCSV(admins);

    if (result !== false) {
      showToast(
        "Admin list exported."
      );
    }
  };

  const getBranchName = (row) => {
    return (
      getValue(
        row,
        "branch_name",
        "branch"
      ) || "-"
    );
  };

  const getRoleName = (row) => {
    return (
      getValue(
        row,
        "role_name",
        "role"
      ) || "-"
    );
  };

  const getStatusName = (row) => {
    return (
      getValue(
        row,
        "status_name",
        "status"
      ) || "Unknown"
    );
  };

  return (
    <>
  

      <div className="sa-card">
        <div className="sa-toolbar">
          <div className="sa-card-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search admins..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />
          </div>

          <button
            type="button"
            className="sa-btn sa-btn-primary sa-add-admin-btn"
            onClick={openAdd}
          >
            <Plus size={16} />

            <span>
              Add Admin
            </span>
          </button>

          <button
            type="button"
            className="sa-btn sa-btn-ghost sa-export-btn"
            onClick={handleExport}
            disabled={!admins.length}
          >
            <Download size={15} />

            <span>
              Export
            </span>
          </button>
        </div>

        {error && (
          <div className="sa-error">
            {error}
          </div>
        )}

        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Branch</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="sa-loading"
                  >
                    <div className="sa-loading-content">
                      <RefreshCw
                        size={18}
                        className="sa-spin"
                      />

                      Loading admins...
                    </div>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="sa-empty"
                  >
                    <div className="sa-empty-content">
                      <div className="sa-empty-icon">
                        <Search size={20} />
                      </div>

                      <strong>
                        No admins found
                      </strong>

                      <span>
                        Try changing your
                        search or add a
                        new admin.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                admins.map((row) => {
                  const status =
                    getStatusName(
                      row
                    );

                  const isActive =
                    status
                      .toLowerCase() ===
                    "active";

                  return (
                    <tr
                      key={row.id}
                    >
                      <td>
                        <div className="sa-admin-name">
                          <div className="sa-avatar">
                            {String(
                              row.name ||
                                "A"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <span className="sa-cell-strong">
                            {row.name ||
                              "-"}
                          </span>
                        </div>
                      </td>

                      <td>
                        {row.email ||
                          "-"}
                      </td>

                      <td>
                        {row.mobile ||
                          "-"}
                      </td>

                      <td>
                        {getBranchName(
                          row
                        )}
                      </td>

                      <td>
                        <span className="sa-role-text">
                          {getRoleName(
                            row
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`sa-badge ${
                            isActive
                              ? "sa-badge-green"
                              : "sa-badge-red"
                          }`}
                        >
                          <span className="sa-status-dot" />
                          {status}
                        </span>
                      </td>

                      <td>
                        <div className="sa-actions">
                          <button
                            type="button"
                            className="sa-icon-btn"
                            onClick={() =>
                              openView(
                                row
                              )
                            }
                            title="View"
                          >
                            <Eye
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            className="sa-icon-btn"
                            onClick={() =>
                              openEdit(
                                row
                              )
                            }
                            title="Edit"
                          >
                            <Pencil
                              size={15}
                            />
                          </button>

                          {isActive && (
                            <button
                              type="button"
                              className="sa-icon-btn sa-icon-btn-danger"
                              onClick={() =>
                                openDelete(
                                  row
                                )
                              }
                              title="Suspend"
                            >
                              <UserX
                                size={15}
                              />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="sa-table-footer">
          <span>
            Showing{" "}
            <strong>
              {admins.length}
            </strong>{" "}
            of{" "}
            <strong>
              {admins.length}
            </strong>{" "}
            records
          </span>
        </div>
      </div>

      {(modalMode === "add" ||
        modalMode === "edit") && (
        <Modal
          title={
            modalMode === "add"
              ? "Add Admin"
              : "Edit Admin"
          }
          onClose={closeModal}
          footer={
            <div className="sa-modal-actions">
              <button
                type="button"
                className="sa-btn sa-btn-ghost"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="sa-btn sa-btn-primary"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : modalMode ===
                    "add"
                  ? "Add Admin"
                  : "Save Changes"}
              </button>
            </div>
          }
        >
          <div className="sa-form-grid">
            <div className="sa-field">
              <label>
                Full Name
              </label>

              <input
                value={
                  form.full_name
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    full_name:
                      e.target.value,
                  })
                }
                placeholder="Enter full name"
              />

              {errors.full_name && (
                <div className="sa-field-error">
                  {errors.full_name}
                </div>
              )}
            </div>

            <div className="sa-field">
              <label>
                Email
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email:
                      e.target.value,
                  })
                }
                placeholder="name@inrfs.in"
              />

              {errors.email && (
                <div className="sa-field-error">
                  {errors.email}
                </div>
              )}
            </div>

            <div className="sa-field">
              <label>
                Mobile
              </label>

              <input
                value={
                  form.mobile
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    mobile:
                      e.target.value,
                  })
                }
                placeholder="+91 98765 43210"
              />

              {errors.mobile && (
                <div className="sa-field-error">
                  {errors.mobile}
                </div>
              )}
            </div>

            <div className="sa-field">
              <label>
                Branch
              </label>

              <select
                value={
                  form.branch_id
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    branch_id:
                      e.target.value,
                  })
                }
              >
                <option value="">
                  Select Branch
                </option>

                {branches.map(
                  (branch) => {
                    const id =
                      getValue(
                        branch,
                        "id",
                        "branch_id"
                      );

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {getValue(
                          branch,
                          "branch_name",
                          "name"
                        )}
                      </option>
                    );
                  }
                )}
              </select>

              {errors.branch_id && (
                <div className="sa-field-error">
                  {errors.branch_id}
                </div>
              )}
            </div>

            <div className="sa-field">
              <label>
                Role
              </label>

              <select
                value={
                  form.role_id
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    role_id:
                      e.target.value,
                  })
                }
              >
                <option value="">
                  Select Role
                </option>

                {roles.map((role) => {
                  const id =
                    getValue(
                      role,
                      "id",
                      "role_id"
                    );

                  return (
                    <option
                      key={id}
                      value={id}
                    >
                      {getValue(
                        role,
                        "role_name",
                        "name"
                      )}
                    </option>
                  );
                })}
              </select>

              {errors.role_id && (
                <div className="sa-field-error">
                  {errors.role_id}
                </div>
              )}
            </div>

            <div className="sa-field">
              <label>
                Status
              </label>

              <select
                value={
                  form.status_id
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    status_id:
                      e.target.value,
                  })
                }
              >
                <option value="">
                  Select Status
                </option>

                {statuses.map(
                  (status) => {
                    const id =
                      getValue(
                        status,
                        "id",
                        "status_id"
                      );

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {getValue(
                          status,
                          "status_name",
                          "name"
                        )}
                      </option>
                    );
                  }
                )}
              </select>

              {errors.status_id && (
                <div className="sa-field-error">
                  {errors.status_id}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {modalMode === "view" &&
        activeRow && (
          <Modal
            title="Admin Details"
            onClose={closeModal}
            footer={
              <button
                type="button"
                className="sa-btn sa-btn-primary"
                onClick={closeModal}
              >
                Close
              </button>
            }
          >
            <div className="sa-profile-header">
              <div className="sa-profile-avatar">
                {String(
                  getValue(
                    activeRow,
                    "admin_name",
                    "full_name",
                    "name"
                  ) || "A"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h3>
                  {getValue(
                    activeRow,
                    "admin_name",
                    "full_name",
                    "name"
                  ) || "-"}
                </h3>

                <span>
                  {getRoleName(
                    activeRow
                  )}
                </span>
              </div>
            </div>

            <div className="sa-details-list">
              <div className="sa-view-row">
                <span>
                  Name
                </span>

                <span>
                  {getValue(
                    activeRow,
                    "admin_name",
                    "full_name",
                    "name"
                  ) || "-"}
                </span>
              </div>

              <div className="sa-view-row">
                <span>
                  Email
                </span>

                <span>
                  {activeRow.email ||
                    "-"}
                </span>
              </div>

              <div className="sa-view-row">
                <span>
                  Mobile
                </span>

                <span>
                  {activeRow.mobile ||
                    "-"}
                </span>
              </div>

              <div className="sa-view-row">
                <span>
                  Branch
                </span>

                <span>
                  {getBranchName(
                    activeRow
                  )}
                </span>
              </div>

              <div className="sa-view-row">
                <span>
                  Role
                </span>

                <span>
                  {getRoleName(
                    activeRow
                  )}
                </span>
              </div>

              <div className="sa-view-row">
                <span>
                  Status
                </span>

                <span>
                  {getStatusName(
                    activeRow
                  )}
                </span>
              </div>
            </div>
          </Modal>
        )}

      {modalMode === "delete" &&
        activeRow && (
          <Modal
            title="Suspend Admin"
            onClose={closeModal}
            footer={
              <div className="sa-modal-actions">
                <button
                  type="button"
                  className="sa-btn sa-btn-ghost"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="sa-btn sa-btn-danger"
                  onClick={
                    confirmSuspend
                  }
                  disabled={saving}
                >
                  {saving
                    ? "Suspending..."
                    : "Suspend"}
                </button>
              </div>
            }
          >
            <div className="sa-confirm-box">
              <div className="sa-confirm-icon">
                <UserX size={20} />
              </div>

              <div>
                <h3>
                  Suspend this admin?
                </h3>

                <p>
                  Are you sure you want
                  to suspend{" "}
                  <strong>
                    {activeRow.name}
                  </strong>
                  ? The admin will no
                  longer be active.
                </p>
              </div>
            </div>
          </Modal>
        )}

      <Toast
        message={toast}
        onDone={clearToast}
      />
    </>
  );
}