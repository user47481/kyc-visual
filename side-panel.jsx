// Side panel: Main info / Images / Ondato tabs

const { useState, useEffect, useMemo } = React;

// ============ Field row with click-to-edit ============
function Field({ label, value, type = "text", options, mono, onSave, fullWidth, required, formatter, placeholder }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  const commit = () => {
    if (draft !== value) onSave(draft);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const display = formatter ? formatter(value) : value;
  const isEmpty = value === undefined || value === null || value === "";

  return (
    <div className={"field" + (fullWidth ? " field-full" : "")}>
      <div className="field-label">
        <span>{label}{required && <span className="req">*</span>}</span>
        <button
          className={"field-edit-btn" + (editing ? " editing" : "")}
          onClick={() => editing ? cancel() : setEditing(true)}
          title={editing ? "Cancel" : "Edit"}
        >
          {editing ? <Icons.Close /> : <Icons.Edit />}
        </button>
      </div>
      {editing ? (
        type === "select" ? (
          <select
            className="fld-select"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
          >
            {options.map((o) => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
          </select>
        ) : type === "checkbox" ? (
          <label className="fld-checkbox" style={{ height: 40, paddingLeft: 0 }}>
            <input
              type="checkbox"
              checked={!!draft}
              onChange={(e) => setDraft(e.target.checked)}
            />
            <span>{draft ? "Yes" : "No"}</span>
            <button
              className="fld-input"
              style={{ marginLeft: "auto", width: 80, height: 32, fontSize: 12 }}
              onClick={commit}
            >Save</button>
          </label>
        ) : (
          <input
            className="fld-input"
            type={type}
            value={draft || ""}
            placeholder={placeholder}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
          />
        )
      ) : (
        <div className={"field-value" + (isEmpty ? " muted" : "")}>
          {isEmpty ? (
            <span>—</span>
          ) : mono ? (
            <span className="mono">{display}</span>
          ) : (
            <span>{display}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ============ Status tag helper ============
function StatusTag({ status }) {
  const meta = window.KYC_STATUSES[String(status)];
  if (!meta) return null;
  const dotColor = {
    blue: "var(--support-info)",
    green: "var(--support-success)",
    red: "var(--support-error)",
    purple: "#be95ff",
    gray: "var(--text-placeholder)",
  }[meta.type];
  return (
    <span className={"tag tag-" + meta.type}>
      <span className="tag-status-dot" style={{ background: dotColor }} />
      {meta.label}
    </span>
  );
}

function ValidatorIcon({ type }) {
  if (type === "ondato") {
    return (
      <span className="vt-icon ondato" title="Ondato (automated)">
        <Icons.Bolt />
      </span>
    );
  }
  return (
    <span className="vt-icon manual" title="Manual">
      <Icons.User />
    </span>
  );
}

// ============ Main Tab ============
function MainTab({ row, updateField }) {
  const d = row.data;

  return (
    <>
      <section className="section-block">
        <h3>
          Personal information
          {d.isPolitical && <span className="badge" style={{ background: "var(--tag-bg-purple)", color: "var(--tag-text-purple)" }}>PEP</span>}
        </h3>
        <div className="field-grid">
          <Field label="First name" value={d.firstname} required onSave={(v) => updateField("firstname", v)} />
          <Field label="Last name" value={d.lastname} required onSave={(v) => updateField("lastname", v)} />
          <Field label="Date of birth" value={d.birthdate} type="date" onSave={(v) => updateField("birthdate", v)} mono />
          <Field label="Gender" value={d.gender} type="select" options={["male", "female", "other"]} onSave={(v) => updateField("gender", v)} />
          <Field label="Government ID" value={d.gov_id} mono onSave={(v) => updateField("gov_id", v)} />
          <Field label="Nationality" value={d.state} onSave={(v) => updateField("state", v)} />
          <Field label="Profession" value={d.profession} onSave={(v) => updateField("profession", v)} />
          <Field label="Source of capital" value={d.capitalsource} type="select"
            options={["Employment income","Business activity","Savings","Investment income","Inheritance","Sale of property","Other"]}
            onSave={(v) => updateField("capitalsource", v)} />
          <Field label="Politically exposed person (PEP)" value={d.isPolitical} type="checkbox" onSave={(v) => updateField("isPolitical", v)} fullWidth
            formatter={(v) => v ? "Yes — declared as PEP" : "No"} />
        </div>
      </section>

      <section className="section-block">
        <h3>Address</h3>
        <div className="field-grid">
          <Field label="Country" value={d.address_country} onSave={(v) => updateField("address_country", v)} />
          <Field label="City" value={d.address_city} onSave={(v) => updateField("address_city", v)} />
          <Field label="Street" value={d.address_street} onSave={(v) => updateField("address_street", v)} fullWidth />
          <Field label="Building" value={d.address_build} onSave={(v) => updateField("address_build", v)} />
          <Field label="Apartment" value={d.address_apartment} onSave={(v) => updateField("address_apartment", v)} />
          <Field label="Postcode" value={d.address_postcode} mono onSave={(v) => updateField("address_postcode", v)} />
        </div>
      </section>

      <section className="section-block">
        <h3>
          Company
          {d.isCompany && <span className="badge">Acting on behalf of company</span>}
        </h3>
        {!d.isCompany ? (
          <div className="field-value muted" style={{ fontStyle: "italic" }}>Individual investor — no company associated.</div>
        ) : (
          <div className="field-grid">
            <Field label="Company name" value={d.company_title} onSave={(v) => updateField("company_title", v)} fullWidth />
            <Field label="Registration number" value={d.company_number} mono onSave={(v) => updateField("company_number", v)} />
            <Field label="Country" value={d.company_state} onSave={(v) => updateField("company_state", v)} />
            <Field label="Beneficial owner" value={d.company_owner} onSave={(v) => updateField("company_owner", v)} />
            <Field label="Owns the company" value={d.company_isyour} type="checkbox" onSave={(v) => updateField("company_isyour", v)}
              formatter={(v) => v ? "Yes — declared owner" : "No — representative"} />
          </div>
        )}
      </section>
    </>
  );
}

// ============ Images Tab ============
function ImagesTab({ row }) {
  const [openImg, setOpenImg] = useState(null);
  const investor = row.investor_id;
  const seedHue = (investor * 47) % 360;

  // Generate a deterministic faux-ID image
  const makeFaceSvg = (h) => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={"bg" + h} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={`hsl(${h}, 18%, 22%)`} />
          <stop offset="100%" stopColor={`hsl(${h}, 22%, 12%)`} />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#bg${h})`} />
      <circle cx="100" cy="80" r="32" fill={`hsl(${h}, 30%, 65%)`} />
      <path d={`M 40 200 Q 40 130 100 130 Q 160 130 160 200 Z`} fill={`hsl(${h}, 30%, 60%)`} />
    </svg>
  );

  const makeIdCardSvg = (h, side) => (
    <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="200" fill="#1a1d24" />
      <rect x="12" y="12" width="296" height="176" fill="#2a3142" rx="4" />
      <rect x="20" y="22" width="40" height="6" fill={`hsl(${h}, 50%, 60%)`} />
      <text x="20" y="48" fill="#9aa0b0" fontSize="9" fontFamily="monospace">REPUBLIC OF UKRAINE</text>
      <text x="20" y="62" fill="#cdd2e0" fontSize="7" fontFamily="monospace">{side === "front" ? "IDENTITY CARD" : "PASSPORT REVERSE"}</text>
      {side === "front" ? (
        <>
          <rect x="20" y="76" width="64" height="80" fill={`hsl(${h}, 18%, 35%)`} />
          <circle cx="52" cy="106" r="14" fill={`hsl(${h}, 30%, 70%)`} />
          <path d="M 30 156 Q 30 130 52 130 Q 74 130 74 156 Z" fill={`hsl(${h}, 30%, 65%)`} />
          <text x="98" y="92" fill="#cdd2e0" fontSize="7" fontFamily="monospace">SURNAME</text>
          <text x="98" y="105" fill="#fff" fontSize="11" fontFamily="monospace" fontWeight="600">{row.data.lastname.toUpperCase()}</text>
          <text x="98" y="124" fill="#cdd2e0" fontSize="7" fontFamily="monospace">GIVEN NAMES</text>
          <text x="98" y="137" fill="#fff" fontSize="11" fontFamily="monospace" fontWeight="600">{row.data.firstname.toUpperCase()}</text>
          <text x="98" y="156" fill="#cdd2e0" fontSize="7" fontFamily="monospace">DOC NO.</text>
          <text x="98" y="169" fill={`hsl(${h}, 50%, 75%)`} fontSize="10" fontFamily="monospace">{row.data.gov_id}</text>
        </>
      ) : (
        <>
          <text x="20" y="86" fill="#cdd2e0" fontSize="7" fontFamily="monospace">DATE OF BIRTH</text>
          <text x="20" y="100" fill="#fff" fontSize="11" fontFamily="monospace">{row.data.birthdate}</text>
          <text x="20" y="118" fill="#cdd2e0" fontSize="7" fontFamily="monospace">SEX</text>
          <text x="20" y="132" fill="#fff" fontSize="11" fontFamily="monospace">{row.data.gender === "female" ? "F" : "M"}</text>
          <text x="20" y="172" fill={`hsl(${h}, 40%, 70%)`} fontSize="9" fontFamily="monospace">{"<<".repeat(8)}</text>
          <text x="20" y="183" fill={`hsl(${h}, 40%, 70%)`} fontSize="9" fontFamily="monospace">{row.data.gov_id}{"<".repeat(12)}</text>
        </>
      )}
    </svg>
  );

  const images = [
    { key: "selfie", label: "Selfie", date: "Apr 14, 2026 · 14:32", size: "2.4 MB", svg: makeFaceSvg(seedHue) },
    { key: "id_front", label: "ID — front", date: "Apr 14, 2026 · 14:33", size: "1.8 MB", svg: makeIdCardSvg(seedHue, "front") },
    { key: "id_back", label: "ID — back", date: "Apr 14, 2026 · 14:33", size: "1.6 MB", svg: makeIdCardSvg(seedHue, "back") },
  ];

  return (
    <>
      <div className="image-grid">
        {images.map((img) => (
          <div key={img.key} className="image-card">
            <div className="img-area" onClick={() => setOpenImg(img)}>
              {img.svg}
              <span className="verified-badge">
                <Icons.Check size={12} /> Verified
              </span>
            </div>
            <div className="img-meta">
              <div>
                <div className="label">{img.label}</div>
                <div style={{ color: "var(--text-placeholder)", fontSize: 11, marginTop: 2 }}>{img.date} · {img.size}</div>
              </div>
              <div className="actions">
                <button title="View" onClick={() => setOpenImg(img)}><Icons.ZoomIn /></button>
                <button title="Download"><Icons.Download /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="section-block" style={{ borderTop: "1px solid var(--border-subtle)", marginTop: 0 }}>
        <h3>Document checks</h3>
        <div className="check-list" style={{ marginLeft: -24, marginRight: -24 }}>
          {[
            { name: "Document authenticity", desc: "MRZ + hologram patterns valid", state: "pass", time: "0.4s" },
            { name: "Face match (selfie ↔ ID)", desc: "Confidence 97.2% — high match", state: "pass", time: "1.1s" },
            { name: "Liveness check", desc: "Active liveness — passed", state: "pass", time: "2.0s" },
            { name: "Document expiry", desc: "Valid until 2031-08-22", state: "pass", time: "0.1s" },
          ].map((c, i) => (
            <div key={i} className="check-row">
              <span className={"icon-wrap " + c.state}>
                {c.state === "pass" ? <Icons.CheckmarkFilled /> : c.state === "warn" ? <Icons.WarningFilled /> : <Icons.ErrorFilled />}
              </span>
              <div className="body">
                <div className="name">{c.name}</div>
                <div className="desc">{c.desc}</div>
              </div>
              <div className="stamp">{c.time}</div>
            </div>
          ))}
        </div>
      </div>
      {openImg && (
        <div className="lightbox-scrim open" onClick={() => setOpenImg(null)}>
          <div className="lb-content" onClick={(e) => e.stopPropagation()}>
            <button className="lb-close" onClick={() => setOpenImg(null)}><Icons.CloseLg /></button>
            {openImg.svg}
            <div style={{ color: "#c6c6c6", fontSize: 12, marginTop: 12, textAlign: "center" }}>{openImg.label} · {openImg.date}</div>
          </div>
        </div>
      )}
    </>
  );
}

// ============ Ondato Tab ============
function OndatoTab({ row }) {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([
    { who: "M. Karpenko", role: "Compliance officer", text: "Auto-checks passed; recommend approval pending IRM review.", at: "Apr 14, 2026 · 14:38" },
  ]);

  const isOndato = row.validator_type === "ondato";
  const score = (row.investor_id % 17) + 78; // 78–94

  return (
    <>
      <div className="ondato-summary">
        <div className="score-ring">
          <svg viewBox="0 0 64 64" width="64" height="64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--layer-03)" strokeWidth="4" />
            <circle
              cx="32" cy="32" r="28" fill="none"
              stroke={score > 85 ? "var(--support-success)" : "var(--support-warning)"}
              strokeWidth="4"
              strokeDasharray={`${(score / 100) * 175.9}, 175.9`}
              transform="rotate(-90 32 32)"
              strokeLinecap="round"
            />
          </svg>
          <div className="score-text">{score}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="label">Risk score</div>
          <div className="value" style={{ marginBottom: 6 }}>
            {score > 85 ? "Low risk" : score > 70 ? "Medium risk" : "High risk"} · {isOndato ? "Ondato automated check" : "Manual review only"}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="tag tag-cyan">AML</span>
            <span className="tag tag-cyan">PEP screening</span>
            <span className="tag tag-cyan">Sanctions</span>
            {row.data.isPolitical && <span className="tag tag-purple">PEP declared</span>}
          </div>
        </div>
      </div>

      <div className="section-block">
        <h3>Verification checks</h3>
        <div className="check-list" style={{ marginLeft: -24, marginRight: -24 }}>
          {[
            { name: "Identity document", desc: "Government-issued ID validated", state: "pass", time: "Apr 14, 14:33" },
            { name: "Biometric face match", desc: "97.2% confidence", state: "pass", time: "Apr 14, 14:33" },
            { name: "Liveness detection", desc: "Active liveness · 3 challenges passed", state: "pass", time: "Apr 14, 14:33" },
            { name: "Sanctions screening", desc: "OFAC, EU, UN consolidated lists — no match", state: "pass", time: "Apr 14, 14:34" },
            { name: "PEP screening", desc: row.data.isPolitical ? "User self-declared PEP — escalated" : "No match in PEP databases", state: row.data.isPolitical ? "warn" : "pass", time: "Apr 14, 14:34" },
            { name: "Adverse media", desc: "0 results across 12,000+ sources", state: "pass", time: "Apr 14, 14:35" },
            { name: "Address verification", desc: row.data.address_country !== row.data.state ? "Address country differs from nationality" : "Address country matches nationality", state: row.data.address_country !== row.data.state ? "warn" : "pass", time: "Apr 14, 14:35" },
          ].map((c, i) => (
            <div key={i} className="check-row">
              <span className={"icon-wrap " + c.state}>
                {c.state === "pass" ? <Icons.CheckmarkFilled /> : c.state === "warn" ? <Icons.WarningFilled /> : <Icons.ErrorFilled />}
              </span>
              <div className="body">
                <div className="name">{c.name}</div>
                <div className="desc">{c.desc}</div>
              </div>
              <div className="stamp">{c.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-block">
        <h3>Internal notes & activity</h3>
        <div className="activity-log" style={{ marginLeft: -24, marginRight: -24, marginBottom: 0 }}>
          <div className="activity-row">
            <span className="dot" style={{ background: "var(--support-info)" }} />
            <div className="body">
              <div><span className="who">Ondato</span> <span style={{ color: "var(--text-secondary)" }}>completed automated verification</span></div>
              <div className="text">All automated checks passed. Risk score: {score}/100.</div>
            </div>
            <div className="stamp">Apr 14, 14:35</div>
          </div>
          <div className="activity-row">
            <span className="dot" style={{ background: "var(--support-success)" }} />
            <div className="body">
              <div><span className="who">System</span> <span style={{ color: "var(--text-secondary)" }}>moved to IRM review queue</span></div>
              <div className="text">Forwarded for manual second-line review.</div>
            </div>
            <div className="stamp">Apr 14, 14:35</div>
          </div>
          {notes.map((n, i) => (
            <div key={i} className="activity-row">
              <span className="dot" style={{ background: "var(--text-placeholder)" }} />
              <div className="body">
                <div><span className="who">{n.who}</span> <span style={{ color: "var(--text-secondary)" }}>· {n.role}</span></div>
                <div className="text">{n.text}</div>
              </div>
              <div className="stamp">{n.at}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="note-input">
        <textarea
          placeholder="Add internal note (visible to compliance team only)…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="actions">
          <button
            disabled={!note.trim()}
            style={{ opacity: note.trim() ? 1 : 0.4 }}
            onClick={() => {
              if (!note.trim()) return;
              setNotes([{ who: "You", role: "Compliance officer", text: note.trim(), at: "now" }, ...notes]);
              setNote("");
            }}
          >Add note</button>
        </div>
      </div>
    </>
  );
}

// ============ Side panel ============
function SidePanel({ row, isOpen, onClose, onUpdate, onAction, panelWidth }) {
  const [tab, setTab] = useState("main");

  useEffect(() => {
    if (row) setTab("main");
  }, [row?.id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!row) return null;

  const updateField = (key, value) => {
    const newData = { ...row.data, [key]: value };
    onUpdate({ ...row, data: newData, updated_at: new Date().toISOString() });
  };

  const fmtDateLong = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <div className={"panel-scrim" + (isOpen ? " open" : "")} onClick={onClose} />
      <aside className={"side-panel" + (isOpen ? " open" : "")} style={{ "--panel-w": panelWidth + "px" }}>
        <header className="panel-header">
          <div className="meta">
            <div className="eyebrow">
              <ValidatorIcon type={row.validator_type} />
              {row.validator_type === "ondato" ? "Automated · Ondato" : "Manual review"}
              <span style={{ color: "var(--text-placeholder)" }}>·</span>
              <span className="mono" style={{ fontFamily: "var(--font-mono)", textTransform: "none", letterSpacing: 0 }}>
                INV-{row.investor_id}
              </span>
            </div>
            <h2 className="title">
              {row.data.firstname} {row.data.lastname}
              <StatusTag status={row.status} />
            </h2>
            <div className="submeta">
              <span><strong>{row.data.gov_id}</strong> · gov ID</span>
              <span>Created <strong>{fmtDateLong(row.created_at)}</strong></span>
              <span>Updated <strong>{fmtDateLong(row.updated_at)}</strong></span>
            </div>
          </div>
          <button className="close" onClick={onClose} title="Close (Esc)"><Icons.CloseLg /></button>
        </header>

        <nav className="panel-tabs">
          <button className={tab === "main" ? "active" : ""} onClick={() => setTab("main")}>
            <Icons.User /> Overview
          </button>
          <button className={tab === "images" ? "active" : ""} onClick={() => setTab("images")}>
            <Icons.Image /> Files <span className="count">3</span>
          </button>
          {row.validator_type === "ondato" && (
            <button className={tab === "ondato" ? "active" : ""} onClick={() => setTab("ondato")}>
              <Icons.Bolt /> Ondato
            </button>
          )}
        </nav>

        <div className="panel-body">
          {tab === "main"   && <MainTab row={row} updateField={updateField} />}
          {tab === "images" && <ImagesTab row={row} />}
          {tab === "ondato" && <OndatoTab row={row} />}
        </div>

        <footer className="panel-footer">
          {row.validator_type === "ondato" ? (
            <>
              <button className="btn ghost" onClick={() => onAction("request_info", row)}>
                Request info <Icons.Send />
              </button>
              <button className="btn ghost" onClick={() => onAction("rerun", row)}>
                Re-run Ondato <Icons.Renew />
              </button>
            </>
          ) : (
            <>
              <button className="btn ghost" onClick={() => onAction("reject", row)}>
                Reject <Icons.Close />
              </button>
              <button className="btn ghost" onClick={() => onAction("request_info", row)}>
                Request info <Icons.Send />
              </button>
            </>
          )}
          <button className="btn primary" onClick={() => onAction("approve", row)}>
            Approve <Icons.Check />
          </button>
        </footer>
      </aside>
    </>
  );
}

window.SidePanel = SidePanel;
window.StatusTag = StatusTag;
window.ValidatorIcon = ValidatorIcon;
