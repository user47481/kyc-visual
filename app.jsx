// Main app — KYC admin

const { useState, useEffect, useMemo, useRef, useCallback } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "default",
  "panelWidth": 640,
  "rowCount": 60
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [allRows, setAllRows] = useState(() => window.makeMockData(tweaks.rowCount));
  const [selectedRow, setSelectedRow] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ status: [], validator: [], pep: false, company: false });
  const [rejectRow, setRejectRow] = useState(null);
  const [requestInfoRow, setRequestInfoRow] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [navOpen, setNavOpen] = useState(true);

  // Regenerate mock data when count changes
  useEffect(() => {
    setAllRows(window.makeMockData(tweaks.rowCount));
    setPage(1);
  }, [tweaks.rowCount]);

  // ===== Filtering =====
  const filtered = useMemo(() => {
    let list = allRows;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const hay = [
          r.investor_id, r.id,
          r.data.firstname, r.data.lastname,
          r.data.gov_id, r.data.address_city,
          r.data.profession, r.data.company_title,
        ].join(" ").toLowerCase();
        return hay.includes(q);
      });
    }
    if (filters.status.length) list = list.filter((r) => filters.status.includes(String(r.status)));
    if (filters.validator.length) list = list.filter((r) => filters.validator.includes(r.validator_type));
    if (filters.pep) list = list.filter((r) => r.data.isPolitical);
    if (filters.company) list = list.filter((r) => r.data.isCompany);
    return list;
  }, [allRows, search, filters]);

  // ===== Sorting =====
  const sorted = useMemo(() => {
    const list = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      let av, bv;
      switch (sortKey) {
        case "name":
          av = (a.data.firstname + a.data.lastname).toLowerCase();
          bv = (b.data.firstname + b.data.lastname).toLowerCase();
          break;
        case "investor_id": av = a.investor_id; bv = b.investor_id; break;
        case "validator_type": av = a.validator_type; bv = b.validator_type; break;
        case "status": av = a.status; bv = b.status; break;
        case "created_at": av = a.created_at; bv = b.created_at; break;
        case "updated_at": av = a.updated_at; bv = b.updated_at; break;
        default: av = a[sortKey]; bv = b[sortKey];
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  // ===== Pagination =====
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageRows = sorted.slice(pageStart, pageStart + pageSize);

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  // ===== Counts for sidebar =====
  const counts = useMemo(() => {
    const c = { all: allRows.length, pending: 0, approved: 0, rejected: 0, irm: 0, ondato: 0, manual: 0, pep: 0 };
    for (const r of allRows) {
      if (r.status === 10) c.approved++;
      else if (r.status < 0) c.rejected++;
      else if (r.status === 9) c.irm++;
      else c.pending++;
      if (r.validator_type === "ondato") c.ondato++; else c.manual++;
      if (r.data.isPolitical) c.pep++;
    }
    return c;
  }, [allRows]);

  // ===== Handlers =====
  const onSort = (key) => {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key.endsWith("_at") ? "desc" : "asc");
    }
  };

  const onRowClick = (row) => {
    setSelectedRow(row);
    setPanelOpen(true);
  };

  const onPanelClose = () => {
    setPanelOpen(false);
    setTimeout(() => setSelectedRow(null), 280);
  };

  const onUpdate = (updated) => {
    setAllRows((rows) => rows.map((r) => r.id === updated.id ? updated : r));
    setSelectedRow(updated);
    pushToast({ title: "Saved", body: "Changes recorded to audit log.", variant: "success" });
  };

  const pushToast = (t) => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts, { ...t, id }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 4000);
  };

  const onAction = (action, row) => {
    switch (action) {
      case "approve": {
        const updated = { ...row, status: 10, updated_at: new Date().toISOString() };
        onUpdate(updated);
        pushToast({ title: "Application approved", body: `INV-${row.investor_id} · ${row.data.firstname} ${row.data.lastname}`, variant: "success" });
        break;
      }
      case "reject":
        setRejectRow(row);
        break;
      case "request_info":
        setRequestInfoRow(row);
        break;
      case "rerun":
        pushToast({ title: "Ondato verification re-queued", body: `Estimated 2–4 minutes`, variant: "info" });
        break;
      case "download":
        pushToast({ title: "Download started", body: `kyc-${row.investor_id}.zip`, variant: "info" });
        break;
    }
  };

  const confirmReject = (reason, details) => {
    const updated = { ...rejectRow, status: -1, updated_at: new Date().toISOString() };
    setAllRows((rows) => rows.map((r) => r.id === updated.id ? updated : r));
    setSelectedRow(updated);
    pushToast({ title: "Application rejected", body: reason || "Reason recorded", variant: "error" });
    setRejectRow(null);
  };

  const confirmRequestInfo = (items, note) => {
    const updated = { ...requestInfoRow, status: 0, updated_at: new Date().toISOString() };
    setAllRows((rows) => rows.map((r) => r.id === updated.id ? updated : r));
    setSelectedRow(updated);
    pushToast({ title: "Request sent", body: `${items.length} item${items.length !== 1 ? "s" : ""} requested from applicant`, variant: "info" });
    setRequestInfoRow(null);
  };

  // ===== Status options for filter =====
  const statusOptionsArr = Object.entries(window.KYC_STATUSES);

  // ===== Active filter chips =====
  const activeChips = [];
  filters.status.forEach((s) => activeChips.push({ key: "status:" + s, kind: "status", value: s, onRemove: () => setFilters({ ...filters, status: filters.status.filter((x) => x !== s) }) }));
  filters.validator.forEach((v) => activeChips.push({ key: "validator:" + v, kind: "plain", label: "Validator: " + v, onRemove: () => setFilters({ ...filters, validator: filters.validator.filter((x) => x !== v) }) }));
  if (filters.pep) activeChips.push({ key: "pep", kind: "plain", label: "PEP only", onRemove: () => setFilters({ ...filters, pep: false }) });
  if (filters.company) activeChips.push({ key: "company", kind: "plain", label: "Company only", onRemove: () => setFilters({ ...filters, company: false }) });

  const filterCount = filters.status.length + filters.validator.length + (filters.pep ? 1 : 0) + (filters.company ? 1 : 0);

  // close filter popover on outside click
  useEffect(() => {
    if (!filterOpen) return;
    const onClick = () => setFilterOpen(false);
    setTimeout(() => document.addEventListener("click", onClick), 0);
    return () => document.removeEventListener("click", onClick);
  }, [filterOpen]);

  return (
    <>
      <div className={"shell" + (navOpen ? "" : " nav-collapsed")}>
        {/* ======= Header ======= */}
        <header className="header">
          <button className="header-trigger" onClick={() => setNavOpen(!navOpen)} title="Toggle nav">
            <Icons.Hamburger size={20} />
          </button>
          <div className="header-brand">
            <span className="product"><span className="prefix" style={{ color: "var(--text-secondary)" }}>IRM</span> Compliance</span>
          </div>
          <nav className="header-nav">
            <a href="#" className="active">KYC</a>
            <a href="#" className="tbd" onClick={(e) => { e.preventDefault(); pushToast({ title: "Investors", body: "TBD", variant: "info" }); }}>Investors <span className="tbd-tag">TBD</span></a>
            <a href="#" className="tbd" onClick={(e) => { e.preventDefault(); pushToast({ title: "Reports", body: "TBD", variant: "info" }); }}>Reports <span className="tbd-tag">TBD</span></a>
            <a href="#" className="tbd" onClick={(e) => { e.preventDefault(); pushToast({ title: "Settings", body: "TBD", variant: "info" }); }}>Settings <span className="tbd-tag">TBD</span></a>
          </nav>
          <div className="header-actions">
            <button title="Search"><Icons.Search size={20} /></button>
            <button title="Notifications">
              <Icons.Notification size={20} />
              <span className="badge-dot" />
            </button>
            <button title="Help"><Icons.Help size={20} /></button>
            <button title="Switcher"><Icons.Switcher size={20} /></button>
            <button title="Account" style={{ width: 48 }}>
              <span className="avatar">MK</span>
            </button>
          </div>
        </header>

        {/* ======= Side nav ======= */}
        <aside className="sidenav">
          <div className="group-label">Compliance</div>
          {(() => {
            const sameSet = (a, b) => a.length === b.length && a.every((v) => b.includes(v));
            const isAll = filters.status.length === 0 && filters.validator.length === 0;
            const isPending = sameSet(filters.status, ["0","1","2","3"]) && filters.validator.length === 0;
            const isIrm = sameSet(filters.status, ["9"]) && filters.validator.length === 0;
            const isApproved = sameSet(filters.status, ["10"]) && filters.validator.length === 0;
            const isRejected = sameSet(filters.status, ["-1","-2","-6"]) && filters.validator.length === 0;
            const isManual = sameSet(filters.validator, ["manual"]) && filters.status.length === 0;
            const isOndato = sameSet(filters.validator, ["ondato"]) && filters.status.length === 0;
            return (
              <>
                <a className={"sidenav-item" + (isAll ? " active" : "")} onClick={() => setFilters({ ...filters, status: [], validator: [] })}>
                  All applications <span className="count">{counts.all}</span>
                </a>
                <a className={"sidenav-item tone-blue" + (isPending ? " active" : "")} onClick={() => setFilters({ ...filters, status: ["0","1","2","3"], validator: [] })}>
                  Pending <span className="count">{counts.pending}</span>
                </a>
                <a className={"sidenav-item tone-purple" + (isIrm ? " active" : "")} onClick={() => setFilters({ ...filters, status: ["9"], validator: [] })}>
                  In IRM review <span className="count">{counts.irm}</span>
                </a>
                <a className={"sidenav-item tone-green" + (isApproved ? " active" : "")} onClick={() => setFilters({ ...filters, status: ["10"], validator: [] })}>
                  Approved <span className="count">{counts.approved}</span>
                </a>
                <a className={"sidenav-item tone-red" + (isRejected ? " active" : "")} onClick={() => setFilters({ ...filters, status: ["-1","-2","-6"], validator: [] })}>
                  Rejected <span className="count">{counts.rejected}</span>
                </a>

                <div className="group-label">Validator</div>
                <a className={"sidenav-item" + (isManual ? " active" : "")} onClick={() => setFilters({ ...filters, validator: ["manual"], status: [] })}>
                  Manual <span className="count">{counts.manual}</span>
                </a>
                <a className={"sidenav-item" + (isOndato ? " active" : "")} onClick={() => setFilters({ ...filters, validator: ["ondato"], status: [] })}>
                  Ondato <span className="count">{counts.ondato}</span>
                </a>
              </>
            );
          })()}

        </aside>

        {/* ======= Main ======= */}
        <main className="main">
          <div className="page-header">
            <div>
              <div className="breadcrumbs">
                <a href="#">Compliance</a><span className="sep">/</span>
                <a href="#">All applications</a>
              </div>
              <h1>KYC applications</h1>
            </div>
          </div>

          <div className="stat-cards">
            {[
              { key: "all", label: "All applications", value: counts.all, mod: "total", filter: { status: [], validator: [], pep: false, company: false } },
              { key: "pending", label: "Pending", value: counts.pending, mod: "pending", filter: { ...filters, status: ["0","1","2","3"] } },
              { key: "irm", label: "In IRM review", value: counts.irm, mod: "irm", filter: { ...filters, status: ["9"] } },
              { key: "approved", label: "Approved", value: counts.approved, mod: "approved", filter: { ...filters, status: ["10"] } },
              { key: "rejected", label: "Rejected", value: counts.rejected, mod: "rejected", filter: { ...filters, status: ["-1","-2","-6"] } },
            ].map((card) => {
              const isActive =
                (card.key === "all" && filters.status.length === 0) ||
                (card.key === "pending" && filters.status.length === 4 && ["0","1","2","3"].every((s) => filters.status.includes(s))) ||
                (card.key === "irm" && filters.status.length === 1 && filters.status[0] === "9") ||
                (card.key === "approved" && filters.status.length === 1 && filters.status[0] === "10") ||
                (card.key === "rejected" && filters.status.length === 3 && ["-1","-2","-6"].every((s) => filters.status.includes(s)));
              return (
                <div
                  key={card.key}
                  role="button"
                  tabIndex={0}
                  className={"stats-card " + card.mod + (isActive ? " is-active" : "")}
                  onClick={() => { setFilters(card.filter); setPage(1); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFilters(card.filter); setPage(1); } }}
                >
                  <div className="label"><span className="dot"></span>{card.label}</div>
                  <div className="value">{card.value}</div>
                </div>
              );
            })}
          </div>

          {/* Toolbar */}
          <div className="toolbar" style={{ position: "relative" }}>
            <div className="toolbar-search">
              <span className="search-icon"><Icons.Search size={16} /></span>
              <input
                type="search"
                placeholder="Search by name, investor ID, gov ID, city…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <button
              className={"toolbar-btn" + (filterOpen ? " active" : "")}
              onClick={(e) => { e.stopPropagation(); setFilterOpen(!filterOpen); }}
              style={{ position: "relative" }}
            >
              <Icons.Filter /> Filter
              {filterCount > 0 && <span className="filter-count">{filterCount}</span>}
              <FilterPopover
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                filters={filters}
                setFilters={(f) => { setFilters(f); setPage(1); }}
                statusOptions={statusOptionsArr}
              />
            </button>
            <button className="toolbar-btn" onClick={() => pushToast({ title: "Export started", body: "CSV will be ready shortly", variant: "info" })}><Icons.Download /> Export</button>
          </div>

          {/* Filter chips */}
          {activeChips.length > 0 && (
            <div className="filter-bar">
              <span className="label">Active filters:</span>
              {activeChips.map((c) => (
                <span key={c.key} className="chip-wrap">
                  {c.kind === "status"
                    ? <window.StatusTag status={c.value} />
                    : <span className="tag tag-gray">{c.label}</span>}
                  <button className="chip-close" onClick={c.onRemove} aria-label="Remove filter"><Icons.Close /></button>
                </span>
              ))}
              <button className="clear-all" onClick={() => setFilters({ status: [], validator: [], pep: false, company: false })}>
                Clear all
              </button>
            </div>
          )}

          <KycTable
            rows={pageRows}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={onSort}
            density={tweaks.density}
            onRowClick={onRowClick}
            selectedId={selectedRow?.id}
          />

          {/* Pagination */}
          <div className="pagination">
            <div className="group">
              <label>Items per page:</label>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="info">
              {sorted.length === 0 ? "0–0" : (pageStart + 1) + "–" + Math.min(pageStart + pageSize, sorted.length)} of {sorted.length} items
            </div>
            <div className="group right">
              <button className="nav-btn" disabled={safePage === 1} onClick={() => setPage(1)} title="First page">
                <Icons.ChevronDoubleLeft />
              </button>
              <button className="nav-btn" disabled={safePage === 1} onClick={() => setPage(safePage - 1)} title="Previous">
                <Icons.ChevronLeft />
              </button>
              <input
                type="number"
                className="page-input"
                min={1} max={totalPages}
                value={safePage}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v >= 1 && v <= totalPages) setPage(v);
                }}
              />
              <span className="of">of {totalPages} pages</span>
              <button className="nav-btn" disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)} title="Next">
                <Icons.ChevronRight />
              </button>
              <button className="nav-btn" disabled={safePage === totalPages} onClick={() => setPage(totalPages)} title="Last page">
                <Icons.ChevronDoubleRight />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Side panel (overlay over table) */}
      <SidePanel
        row={selectedRow}
        isOpen={panelOpen}
        onClose={onPanelClose}
        onUpdate={onUpdate}
        onAction={onAction}
        panelWidth={tweaks.panelWidth}
      />

      {/* Modals */}
      <RejectModal
        open={!!rejectRow}
        row={rejectRow}
        onClose={() => setRejectRow(null)}
        onConfirm={confirmReject}
      />
      <RequestInfoModal
        open={!!requestInfoRow}
        row={requestInfoRow}
        onClose={() => setRequestInfoRow(null)}
        onConfirm={confirmRequestInfo}
      />

      {/* Toasts */}
      <ToastStack toasts={toasts} dismiss={(id) => setToasts((ts) => ts.filter((t) => t.id !== id))} />

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Layout">
          <TweakRadio
            label="Table density"
            value={tweaks.density}
            options={[
              { value: "compact", label: "Compact" },
              { value: "default", label: "Default" },
              { value: "tall", label: "Tall" },
            ]}
            onChange={(v) => setTweak("density", v)}
          />
          <TweakSlider
            label="Side panel width"
            value={tweaks.panelWidth}
            min={400} max={960} step={20}
            unit="px"
            onChange={(v) => setTweak("panelWidth", v)}
          />
        </TweakSection>
        <TweakSection title="Mock data">
          <TweakSlider
            label="Number of applications"
            value={tweaks.rowCount}
            min={5} max={200} step={5}
            onChange={(v) => setTweak("rowCount", v)}
          />
          <TweakButton onClick={() => setAllRows(window.makeMockData(tweaks.rowCount))}>
            Regenerate data
          </TweakButton>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
