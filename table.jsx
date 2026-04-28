// Table + filter popover + main shell

const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ============ Toast helpers ============
function ToastStack({ toasts, dismiss }) {
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={"toast " + (t.variant || "")}>
          <span className="icon">
            {t.variant === "error" ? <Icons.ErrorFilled /> :
             t.variant === "warning" ? <Icons.WarningFilled /> :
             t.variant === "info" ? <Icons.Information /> :
             <Icons.CheckmarkFilled />}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="title">{t.title}</div>
            {t.body && <div className="body">{t.body}</div>}
          </div>
          <button className="dismiss" onClick={() => dismiss(t.id)}><Icons.Close /></button>
        </div>
      ))}
    </div>
  );
}

// ============ Filter popover ============
function FilterPopover({ open, onClose, filters, setFilters, statusOptions }) {
  if (!open) return null;
  return (
    <div className="filter-popover" onClick={(e) => e.stopPropagation()}>
      <div className="pop-scroll">
        <div className="pop-section">
          <h4>Status</h4>
          {statusOptions.map(([val, meta]) => (
            <label key={val} className="opt-row">
              <input
                type="checkbox"
                checked={filters.status.includes(val)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...filters.status, val]
                    : filters.status.filter((s) => s !== val);
                  setFilters({ ...filters, status: next });
                }}
              />
              <span className="cb"><Icons.Check size={12} /></span>
              <window.StatusTag status={val} />
            </label>
          ))}
        </div>
        <div className="pop-section">
          <h4>Validator type</h4>
          {[["manual","Manual"], ["ondato","Ondato"]].map(([val, label]) => (
            <label key={val} className="opt-row">
              <input
                type="checkbox"
                checked={filters.validator.includes(val)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...filters.validator, val]
                    : filters.validator.filter((s) => s !== val);
                  setFilters({ ...filters, validator: next });
                }}
              />
              <span className="cb"><Icons.Check size={12} /></span>
              <span>{label}</span>
            </label>
          ))}
        </div>
        <div className="pop-section">
          <h4>Flags</h4>
          <label className="opt-row">
            <input
              type="checkbox"
              checked={filters.pep}
              onChange={(e) => setFilters({ ...filters, pep: e.target.checked })}
            />
            <span className="cb"><Icons.Check size={12} /></span>
            <span>PEP only</span>
          </label>
          <label className="opt-row">
            <input
              type="checkbox"
              checked={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.checked })}
            />
            <span className="cb"><Icons.Check size={12} /></span>
            <span>Company only</span>
          </label>
        </div>
      </div>
      <div className="pop-footer">
        <button onClick={() => setFilters({ status: [], validator: [], pep: false, company: false })}>
          Clear all
        </button>
        <button onClick={onClose}>Apply</button>
      </div>
    </div>
  );
}

// ============ Date format helpers ============
function relativeTime(iso) {
  const now = new Date("2026-04-28T12:00:00Z").getTime();
  const t = new Date(iso).getTime();
  const diff = Math.floor((now - t) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + " min ago";
  if (diff < 86400) return Math.floor(diff / 3600) + " h ago";
  if (diff < 86400 * 30) return Math.floor(diff / 86400) + " d ago";
  if (diff < 86400 * 365) return Math.floor(diff / (86400 * 30)) + " mo ago";
  return Math.floor(diff / (86400 * 365)) + " y ago";
}
function formatDate(iso) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yy} ${hh}:${mi}`;
}

// ============ Table ============
function KycTable({ rows, sortKey, sortDir, onSort, density, onRowClick, selectedId }) {
  const cols = [
    { key: "investor_id", label: "Investor ID", width: 120, sortable: true },
    { key: "name", label: "Name", width: 220, sortable: true },
    { key: "validator_type", label: "Validator", width: 140, sortable: true },
    { key: "status", label: "Status", width: 200, sortable: true },
    { key: "created_at", label: "Created", width: 160, sortable: true },
    { key: "updated_at", label: "Updated", width: 160, sortable: true },
  ];

  return (
    <div className="kyc-table-wrap">
      <table className={"kyc-table density-" + density}>
        <colgroup>
          {cols.map((c) => <col key={c.key} style={{ width: c.width }} />)}
        </colgroup>
        <thead>
          <tr>
            {cols.map((c) => {
              const sorted = sortKey === c.key;
              return (
                <th
                  key={c.key}
                  data-sortable={c.sortable}
                  className={(sorted ? "sorted " : "") + (sorted && sortDir === "desc" ? "sorted-desc" : "")}
                  onClick={() => c.sortable && onSort(c.key)}
                >
                  <span className="th-inner">
                    {c.label}
                    {c.sortable && (
                      <span className="sort-icon">
                        {sorted ? <Icons.ChevronUp /> : <Icons.ArrowsVert />}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr className="empty-row">
              <td colSpan={cols.length}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <Icons.Search size={32} />
                  <div style={{ fontSize: 16, color: "var(--text-secondary)" }}>No applications match your filters</div>
                  <div style={{ fontSize: 12 }}>Try clearing your search or filters.</div>
                </div>
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr
              key={row.id}
              className={selectedId === row.id ? "selected" : ""}
              onClick={() => onRowClick(row)}
            >
              <td className="cell-mono">INV-{row.investor_id}</td>
              <td className="cell-name">
                <span className="full-name">
                  {row.data.firstname} {row.data.lastname}
                  {row.data.isPolitical && <span className="pep">PEP</span>}
                  {row.data.isCompany && <span className="corp" title="Company"><Icons.Building size={14} /></span>}
                </span>
              </td>
              <td className="cell-validator">
                <ValidatorIcon type={row.validator_type} />
                <span style={{ textTransform: "capitalize" }}>{row.validator_type}</span>
              </td>
              <td>
                <StatusTag status={row.status} />
              </td>
              <td className="cell-date">
                {formatDate(row.created_at)}
                <span className="relative">{relativeTime(row.created_at)}</span>
              </td>
              <td className="cell-date">
                {formatDate(row.updated_at)}
                <span className="relative">{relativeTime(row.updated_at)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============ Reject Modal ============
function RejectModal({ open, row, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (open) { setReason(""); setDetails(""); }
  }, [open]);

  if (!row) return null;
  return (
    <div className={"modal-scrim" + (open ? " open" : "")} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="label">Reject application</div>
          <h2>Reject KYC for {row.data.firstname} {row.data.lastname}?</h2>
        </div>
        <div className="modal-body">
          The applicant will be notified and the application status will be set to <strong style={{ color: "var(--text-primary)" }}>Denied (IRM)</strong>. This action is reversible within 30 days.
          <label>Reason</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="">Select a reason…</option>
            <option>Document quality insufficient</option>
            <option>Information mismatch</option>
            <option>Failed sanctions or PEP screening</option>
            <option>Suspected fraudulent documents</option>
            <option>Source of funds not credible</option>
            <option>Other</option>
          </select>
          <label>Internal note <span style={{ color: "var(--text-placeholder)" }}>(optional)</span></label>
          <textarea
            placeholder="Add details for the audit trail…"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <button className="ghost" onClick={onClose}>Cancel</button>
          <button
            className="danger"
            onClick={() => onConfirm(reason, details)}
            disabled={!reason}
            style={{ opacity: reason ? 1 : 0.4, cursor: reason ? "pointer" : "not-allowed" }}
          >Reject</button>
        </div>
      </div>
    </div>
  );
}

// ============ Request Info Modal ============
function RequestInfoModal({ open, row, onClose, onConfirm }) {
  const [items, setItems] = useState([]);
  const [note, setNote] = useState("");
  const opts = [
    "Higher quality ID photo",
    "Selfie with handwritten note",
    "Proof of address (utility bill)",
    "Source of funds documentation",
    "Updated personal information",
  ];
  useEffect(() => { if (open) { setItems([]); setNote(""); } }, [open]);
  if (!row) return null;

  return (
    <div className={"modal-scrim" + (open ? " open" : "")} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="label">Request additional information</div>
          <h2>What does {row.data.firstname} need to provide?</h2>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: 8 }}>Select the items the applicant should resubmit. They will receive an email and the status will be set to <strong style={{ color: "var(--text-primary)" }}>Stage 1 · Identity</strong>.</div>
          {opts.map((o) => (
            <label key={o} className="opt-row" style={{ display: "flex", gap: 8, padding: "8px 0", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={items.includes(o)}
                onChange={(e) => setItems(e.target.checked ? [...items, o] : items.filter((i) => i !== o))}
              />
              <span>{o}</span>
            </label>
          ))}
          <label>Note for the applicant</label>
          <textarea
            placeholder="Optional message…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <button className="ghost" onClick={onClose}>Cancel</button>
          <button
            className="primary"
            disabled={items.length === 0}
            style={{ opacity: items.length ? 1 : 0.4 }}
            onClick={() => onConfirm(items, note)}
          >Send request</button>
        </div>
      </div>
    </div>
  );
}

window.KycTable = KycTable;
window.FilterPopover = FilterPopover;
window.RejectModal = RejectModal;
window.RequestInfoModal = RequestInfoModal;
window.ToastStack = ToastStack;
window.formatDate = formatDate;
window.relativeTime = relativeTime;
