import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Search,
  Eye,
  RefreshCw,
  Plus,
  Pencil,
} from "lucide-react";

import Modal from "./Modal";

import Toast, {
  useToast,
} from "./Toast";

import "../../Styles/SuperAdmin/BranchManagement.css";

import {
  getBranchManagement,
  getBranchManagementDetails,
  getBranchStates,
  createBranch,
  updateBranch,
} from "../../services/superadmin/branchManagementService";


const normalizeBranch = (row) => {
  if (!row) {
    return null;
  }

  return {
    id:
      row.id ??
      row.branch_id ??
      row.branchId,

    branch:
      row.branch ??
      row.branch_name ??
      row.branchName ??
      row.name ??
      "",

    city:
      row.city ??
      row.city_name ??
      row.cityName ??
      "",

    state:
      row.state ??
      row.state_name ??
      row.stateName ??
      "",

    state_id:
      row.state_id ??
      row.stateId ??
      null,

    admin:
      row.admin ??
      row.admin_name ??
      row.adminName ??
      row.admin_full_name ??
      "",

    investors:
      row.active_investor_count ??
      row.investors ??
      row.investor_count ??
      row.investors_count ??
      row.total_investors ??
      0,

    aum:
      row.aum ??
      row.total_aum ??
      row.aum_amount ??
      0,

    status:
      row.branch_status ??
      row.status ??
      row.status_name ??
      row.statusName ??
      "",

    raw: row,
  };
};


const getStatusClass = (status) => {
  const value = String(
    status || ""
  )
    .trim()
    .toLowerCase();

  if (
    value === "active" ||
    value === "approved" ||
    value === "enabled"
  ) {
    return "sa-badge-green";
  }

  if (
    value === "suspended" ||
    value === "inactive" ||
    value === "disabled" ||
    value === "blocked"
  ) {
    return "sa-badge-red";
  }

  return "sa-badge-gray";
};


const emptyForm = {
  branch_name: "",
  city_name: "",
  state_id: "",
  is_active: true,
};


export default function BranchManagement() {
  const [branches, setBranches] =
    useState([]);

  const [states, setStates] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [statesLoading, setStatesLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [total, setTotal] =
    useState(0);

  const [offset, setOffset] =
    useState(0);

  const limit = 10;

  const [
    modalMode,
    setModalMode,
  ] = useState(null);

  const [
    activeRow,
    setActiveRow,
  ] = useState(null);

  const [
    detailsLoading,
    setDetailsLoading,
  ] = useState(false);

  const [
    detailsError,
    setDetailsError,
  ] = useState("");

  const [
    form,
    setForm,
  ] = useState(emptyForm);

  const [
    formErrors,
    setFormErrors,
  ] = useState({});

  const [
    saving,
    setSaving,
  ] = useState(false);

  const {
    toast,
    showToast,
    clearToast,
  } = useToast();


  const loadBranches =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const response =
            await getBranchManagement({
              search,
              limit,
              offset,
            });

          const rows =
            Array.isArray(
              response?.data
            )
              ? response.data
              : [];

          const normalized =
            rows
              .map(normalizeBranch)
              .filter(Boolean);

          setBranches(
            normalized
          );

          setTotal(
            Number(
              response?.total ??
              response?.count ??
              normalized.length
            )
          );
        } catch (err) {
          console.error(
            "Branch loading error:",
            err
          );

          setBranches([]);
          setTotal(0);

          setError(
            err?.message ||
              "Unable to load branches."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        search,
        offset,
      ]
    );


  const loadStates =
    useCallback(
      async () => {
        setStatesLoading(true);

        try {
          const response =
            await getBranchStates();

          const rows =
            Array.isArray(
              response?.data
            )
              ? response.data
              : [];

          setStates(rows);
        } catch (err) {
          console.error(
            "State loading error:",
            err
          );

          showToast(
            err?.message ||
              "Unable to load states."
          );
        } finally {
          setStatesLoading(false);
        }
      },
      [showToast]
    );


  useEffect(() => {
    loadBranches();
  }, [loadBranches]);


  useEffect(() => {
    loadStates();
  }, [loadStates]);


  useEffect(() => {
    if (offset !== 0) {
      setOffset(0);
    }
  }, [search]);


  const openAdd = () => {
    setForm({
      ...emptyForm,
    });

    setFormErrors({});
    setActiveRow(null);
    setModalMode("add");
  };


  const openEdit = async (row) => {
    setActiveRow(row);

    setForm({
      branch_name:
        row.branch || "",

      city_name:
        row.city || "",

      state_id:
        row.state_id ??
        row.raw?.state_id ??
        "",

      is_active:
        String(
          row.status || ""
        )
          .trim()
          .toLowerCase() !==
        "suspended",
    });

    setFormErrors({});
    setModalMode("edit");
  };


  const openView =
    async (row) => {
      if (
        row?.id === null ||
        row?.id === undefined ||
        row?.id === ""
      ) {
        showToast(
          "Branch ID is missing."
        );
        return;
      }

      setActiveRow(row);
      setModalMode("view");
      setDetailsLoading(true);
      setDetailsError("");

      try {
        const response =
          await getBranchManagementDetails(
            row.id
          );

        const details =
          normalizeBranch(
            response?.data
          );

        if (details) {
          setActiveRow({
            ...row,
            ...details,
            raw:
              response?.data ||
              row.raw,
          });
        }
      } catch (err) {
        console.error(
          "Branch details error:",
          err
        );

        setDetailsError(
          err?.message ||
            "Unable to load branch details."
        );
      } finally {
        setDetailsLoading(false);
      }
    };


  const closeModal = () => {
    setModalMode(null);
    setActiveRow(null);
    setDetailsError("");
    setDetailsLoading(false);
    setFormErrors({});
  };


  const handleRefresh = () => {
    loadBranches();
  };


  const handleFormChange = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };


  const validateForm = () => {
    const errors = {};

    if (
      !form.branch_name ||
      !form.branch_name.trim()
    ) {
      errors.branch_name =
        "Branch name is required.";
    }

    if (
      !form.city_name ||
      !form.city_name.trim()
    ) {
      errors.city_name =
        "City is required.";
    }

    if (
      !form.state_id ||
      Number(form.state_id) <= 0
    ) {
      errors.state_id =
        "Please select a state.";
    }

    setFormErrors(errors);

    return (
      Object.keys(errors).length === 0
    );
  };


  const handleSubmit =
    async () => {
      if (!validateForm()) {
        return;
      }

      setSaving(true);

      try {
        if (
          modalMode === "add"
        ) {
          await createBranch({
            branch_name:
              form.branch_name.trim(),

            city_name:
              form.city_name.trim(),

            state_id:
              Number(form.state_id),

            is_active:
              Boolean(form.is_active),
          });

          showToast(
            `"${form.branch_name.trim()}" branch added successfully.`
          );
        }

        if (
          modalMode === "edit" &&
          activeRow
        ) {
          await updateBranch(
            activeRow.id,
            {
              branch_name:
                form.branch_name.trim(),

              city_name:
                form.city_name.trim(),

              state_id:
                Number(form.state_id),

              is_active:
                Boolean(form.is_active),
            }
          );

          showToast(
            `"${form.branch_name.trim()}" branch updated successfully.`
          );
        }

        closeModal();

        await loadBranches();
      } catch (err) {
        console.error(
          "Branch save error:",
          err
        );

        showToast(
          err?.message ||
            "Unable to save branch."
        );
      } finally {
        setSaving(false);
      }
    };


  const hasPrevious =
    offset > 0;


  const hasNext =
    branches.length === limit &&
    (
      total === 0 ||
      offset + branches.length <
        total
    );


  const showingFrom =
    branches.length
      ? offset + 1
      : 0;


  const showingTo =
    offset +
    branches.length;


  const pageNumber =
    Math.floor(
      offset / limit
    ) + 1;


  const totalPages =
    total > 0
      ? Math.ceil(
          total / limit
        )
      : 1;


  return (
    <>
   


      <div className="sa-card branch-management-card">
        <div className="sa-card-toolbar branch-toolbar">
          <div className="sa-card-search branch-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search branches..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <button
            type="button"
            className="sa-btn sa-btn-primary branch-add-btn"
            onClick={openAdd}
          >
            <Plus size={16} />
            <span>Add Branch</span>
          </button>
        </div>


        {error && (
          <div className="sa-error-box">
            {error}
          </div>
        )}


        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>
                  Branch
                </th>

                <th>
                  City
                </th>

                <th>
                  Admin
                </th>

                <th>
                  Investors
                </th>

                <th>
                  AUM
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>
              </tr>
            </thead>


            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="sa-loading-cell"
                  >
                    Loading branches...
                  </td>
                </tr>
              ) : branches.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="sa-empty-cell"
                  >
                    No branches found.
                  </td>
                </tr>
              ) : (
                branches.map(
                  (row) => (
                    <tr
                      key={row.id}
                    >
                      <td className="sa-cell-strong">
                        {
                          row.branch ||
                          "-"
                        }
                      </td>

                      <td>
                        {
                          row.city ||
                          "-"
                        }
                      </td>

                      <td>
                        {
                          row.admin ||
                          "-"
                        }
                      </td>

                      <td>
                        {Number(
                          row.investors ||
                            0
                        )}
                      </td>

                      <td>
                        {`₹${Number(
                          row.aum || 0
                        ).toLocaleString(
                          "en-IN"
                        )}`}
                      </td>

                      <td>
                        <span
                          className={`sa-badge ${getStatusClass(
                            row.status
                          )}`}
                        >
                          {
                            row.status ||
                            "Unknown"
                          }
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
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>


        <div className="sa-table-footer">
          <span>
            Showing{" "}
            {showingFrom}
            –
            {showingTo}{" "}
            of{" "}
            {total}{" "}
            records
          </span>

          <div className="sa-pagination">
            <button
              type="button"
              className="sa-pagination-btn"
              disabled={
                !hasPrevious ||
                loading
              }
              onClick={() =>
                setOffset(
                  Math.max(
                    0,
                    offset -
                      limit
                  )
                )
              }
            >
              Previous
            </button>

            <span className="sa-pagination-info">
              Page{" "}
              {pageNumber}{" "}
              of{" "}
              {totalPages}
            </span>

            <button
              type="button"
              className="sa-pagination-btn"
              disabled={
                !hasNext ||
                loading
              }
              onClick={() =>
                setOffset(
                  offset +
                    limit
                )
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>


      {(modalMode === "add" ||
        modalMode === "edit") && (
        <Modal
          title={
            modalMode === "add"
              ? "Add Branch"
              : "Edit Branch"
          }
          onClose={
            saving
              ? undefined
              : closeModal
          }
          footer={
            <>
              <button
                type="button"
                className="sa-btn sa-btn-ghost"
                onClick={
                  closeModal
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="sa-btn sa-btn-primary"
                onClick={
                  handleSubmit
                }
                disabled={
                  saving ||
                  statesLoading
                }
              >
                {saving
                  ? "Saving..."
                  : modalMode ===
                    "add"
                  ? "Add Branch"
                  : "Save Changes"}
              </button>
            </>
          }
        >
          <div className="sa-field">
            <label>
              Branch Name
            </label>

            <input
              type="text"
              value={
                form.branch_name
              }
              onChange={(e) =>
                handleFormChange(
                  "branch_name",
                  e.target.value
                )
              }
              placeholder="e.g. Visakhapatnam Branch"
            />

            {formErrors.branch_name && (
              <div className="sa-field-error">
                {
                  formErrors.branch_name
                }
              </div>
            )}
          </div>


          <div className="sa-field">
            <label>
              City
            </label>

            <input
              type="text"
              value={
                form.city_name
              }
              onChange={(e) =>
                handleFormChange(
                  "city_name",
                  e.target.value
                )
              }
              placeholder="e.g. Visakhapatnam"
            />

            {formErrors.city_name && (
              <div className="sa-field-error">
                {
                  formErrors.city_name
                }
              </div>
            )}
          </div>


          <div className="sa-field">
            <label>
              State
            </label>

            <select
              value={
                form.state_id
              }
              onChange={(e) =>
                handleFormChange(
                  "state_id",
                  e.target.value
                )
              }
              disabled={
                statesLoading
              }
            >
              <option value="">
                {statesLoading
                  ? "Loading states..."
                  : "Select State"}
              </option>

              {states.map(
                (state) => (
                  <option
                    key={state.id}
                    value={state.id}
                  >
                    {
                      state.state_name
                    }
                  </option>
                )
              )}
            </select>

            {formErrors.state_id && (
              <div className="sa-field-error">
                {
                  formErrors.state_id
                }
              </div>
            )}
          </div>


          <div className="sa-field">
            <label>
              Status
            </label>

            <select
              value={
                form.is_active
                  ? "active"
                  : "suspended"
              }
              onChange={(e) =>
                handleFormChange(
                  "is_active",
                  e.target.value ===
                    "active"
                )
              }
            >
              <option value="active">
                Active
              </option>

              <option value="suspended">
                Suspended
              </option>
            </select>
          </div>
        </Modal>
      )}


      {modalMode === "view" &&
        activeRow && (
          <Modal
            title="Branch Details"
            onClose={
              closeModal
            }
            footer={
              <button
                type="button"
                className="sa-btn sa-btn-primary"
                onClick={
                  closeModal
                }
              >
                Close
              </button>
            }
          >
            {detailsLoading ? (
              <div className="sa-modal-loading">
                Loading branch details...
              </div>
            ) : (
              <>
                {detailsError && (
                  <div className="sa-error-box">
                    {
                      detailsError
                    }
                  </div>
                )}

                <div className="sa-view-row">
                  <span>
                    Branch
                  </span>

                  <span>
                    {
                      activeRow.branch ||
                      "-"
                    }
                  </span>
                </div>

                <div className="sa-view-row">
                  <span>
                    City
                  </span>

                  <span>
                    {
                      activeRow.city ||
                      "-"
                    }
                  </span>
                </div>

                <div className="sa-view-row">
                  <span>
                    State
                  </span>

                  <span>
                    {
                      activeRow.state ||
                      "-"
                    }
                  </span>
                </div>

                <div className="sa-view-row">
                  <span>
                    Admin
                  </span>

                  <span>
                    {
                      activeRow.admin ||
                      "-"
                    }
                  </span>
                </div>

                <div className="sa-view-row">
                  <span>
                    Investors
                  </span>

                  <span>
                    {
                      activeRow.investors ??
                      0
                    }
                  </span>
                </div>

                <div className="sa-view-row">
                  <span>
                    AUM
                  </span>

                  <span>
                    {`₹${Number(
                      activeRow.aum ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}`}
                  </span>
                </div>

                <div className="sa-view-row">
                  <span>
                    Status
                  </span>

                  <span>
                    {
                      activeRow.status ||
                      "-"
                    }
                  </span>
                </div>
              </>
            )}
          </Modal>
        )}


      <Toast
        message={toast}
        onDone={
          clearToast
        }
      />
    </>
  );
}