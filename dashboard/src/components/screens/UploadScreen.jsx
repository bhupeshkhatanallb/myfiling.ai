// upload.jsx - Screen 1: Upload & Court Selection
const { useState: useStateU, useRef: useRefU, useEffect: useEffectU } = React;

// Key shared with the public marketing site (marketing/assets/site.js): when a
// visitor picks a PDF in the hero widget and then signs in, the file (metadata
// and, when small enough, its bytes) is stashed here so we can pre-fill the
// upload screen and let them continue with a single click.
const PENDING_UPLOAD_KEY = "myfiling.pendingUpload";

// Reconstruct a File from the base64 the marketing widget stored, so the real
// streaming upload works without re-picking. Returns null if bytes are absent.
function _pendingFileFromB64(name, dataB64) {
  if (!dataB64) return null;
  try {
    const bin = atob(dataB64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    return new File([bytes], name || "filing.pdf", { type: "application/pdf" });
  } catch (_) {
    return null;
  }
}

function UploadScreen({ onAnalyse, onError }) {
  const { COURTS, CASE_TYPES, SAMPLE_FILES } = window.FC_DATA;
  // Default to the first enabled court (currently Delhi High Court); falls back
  // to the first listed court so the dropdown is never empty.
  const defaultCourtId = (COURTS.find((c) => c.enabled) || COURTS[0]).id;
  const [file, setFile] = useStateU(null);
  const [court, setCourt] = useStateU(defaultCourtId);
  const [caseType, setCaseType] = useStateU("wp");
  const [dragging, setDragging] = useStateU(false);
  const [courtOpen, setCourtOpen] = useStateU(false);
  const [handoffNote, setHandoffNote] = useStateU(null);
  const inputRef = useRefU();
  const courtDropdownRef = useRefU();

  useEffectU(() => {
    function handleClickOutside(e) {
      if (courtDropdownRef.current && !courtDropdownRef.current.contains(e.target)) {
        setCourtOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // On mount, pick up any file handed off from the public homepage upload widget
  // (only when the URL says ?pending=1, set by the marketing redirect). We
  // pre-fill the dropzone and court/case-type so the user can analyse in one
  // click. The stash is cleared immediately so a refresh doesn't re-apply it.
  useEffectU(() => {
    let pendingFlag = false;
    try {
      pendingFlag = new URLSearchParams(window.location.search).get("pending") === "1";
    } catch (_) { /* no URL API */ }
    if (!pendingFlag) return;

    let raw = null;
    try { raw = sessionStorage.getItem(PENDING_UPLOAD_KEY); } catch (_) { return; }
    if (!raw) return;
    try { sessionStorage.removeItem(PENDING_UPLOAD_KEY); } catch (_) {}

    let meta;
    try { meta = JSON.parse(raw); } catch (_) { return; }
    if (!meta || !meta.name) return;

    // Restore court / case type when they map to known, enabled options.
    if (meta.court && COURTS.some((c) => c.id === meta.court && c.enabled)) setCourt(meta.court);
    if (meta.caseType && CASE_TYPES.some((c) => c.id === meta.caseType)) setCaseType(meta.caseType);

    const restored = _pendingFileFromB64(meta.name, meta.dataB64);
    if (restored) {
      setFile({
        name: restored.name,
        size: (restored.size / (1024 * 1024)).toFixed(1) + " MB",
        raw: restored,
      });
      setHandoffNote("Your file is ready - click “Analyse Filing” to continue.");
    } else {
      // We have the name but not the bytes (e.g. file was too large to carry):
      // prompt the user to re-select so the real analysis can run.
      setHandoffNote(
        "Please re-select “" + meta.name + "” to run your analysis."
      );
    }
    // Clear the prompt after a short while so it doesn't linger.
    const t = setTimeout(() => setHandoffNote(null), 9000);
    return () => clearTimeout(t);
  }, []);

  const onPick = (f) => {
    if (!f) return;
    if (!/\.pdf$/i.test(f.name)) {
      onError({
        title: "Unsupported file type",
        details: `Received "${f.name}". myfiling.ai currently only accepts PDF files.`,
      });
      return;
    }
    setFile({ name: f.name, size: (f.size / (1024*1024)).toFixed(1) + " MB", raw: f });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    onPick(f);
  };

  const canAnalyse = !!file;

  return (
    <div className="upload stagger">
      <div className="upload__hero">
        <div className="upload__eyebrow">
          <span className="upload__eyebrow-dot" /> AI filing scrutiny
        </div>
        <h1 className="upload__title">
          Catch filing defects <em>before submission.</em>
        </h1>
        <p className="upload__sub">
          myfiling.ai checks your PDF against the court's formatting and
          registry-filing requirements - paper size, margins, type, pagination, index,
          court fee, vakalatnama, limitation, certified copy and affidavit. Get a
          filing-readiness score and a defect checklist in seconds.
        </p>
        <div className="upload__trust">
          <span className="upload__trust-item"><Ico.Check size={13} /> Court rules engine</span>
          <span className="upload__trust-item"><Ico.Check size={13} /> Documents never stored</span>
          <span className="upload__trust-item"><Ico.Check size={13} /> Results in seconds</span>
        </div>
      </div>

      <div className="upload__panel">

      {handoffNote && (
        <div className="upload__handoff">
          <Ico.Spark size={14} /> {handoffNote}
        </div>
      )}

      <div
        className={
          "dropzone" +
          (dragging ? " dropzone--drag" : "") +
          (file ? " dropzone--has-file" : "")
        }
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current?.click()}
        role="button"
      >
        <input
          type="file"
          accept="application/pdf"
          ref={inputRef}
          style={{ display: "none" }}
          onChange={(e) => onPick(e.target.files?.[0])}
        />
        <div className="dropzone__icon">
          {file
            ? <Ico.Check size={26} />
            : <Ico.Upload size={26} />}
        </div>
        {file ? (
          <React.Fragment>
            <div className="dropzone__title">Ready to analyse</div>
            <div className="dropzone__sub">We'll cross-reference rules for the selected court.</div>
            <div className="dropzone__file-meta">
              <Ico.FilePdf size={14} />
              <span>{file.name}</span>
              <span style={{ color: "var(--ink-400)" }}>· {file.size}</span>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }} title="Remove">
                <Ico.X size={12} />
              </button>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="dropzone__title">
              Drag your filing PDF here or <span className="dropzone__browse">click to browse</span>
            </div>
            <div className="dropzone__sub">
              Cover page, index, synopsis, body and annexures - all in one PDF.
            </div>
          </React.Fragment>
        )}
      </div>

      <div className="upload__fields">
        <div className="field">
          <label className="field__label">
            <span>Court</span>
            <span className="field__label-sub">Rules vary per registry</span>
          </label>
          <div className={"court-dropdown" + (courtOpen ? " court-dropdown--open" : "")} ref={courtDropdownRef}>
            <button
              type="button"
              className="court-dropdown__trigger"
              onClick={() => setCourtOpen(!courtOpen)}
            >
              <span className="court-dropdown__label">{COURTS.find(c => c.id === court)?.name}</span>
              <svg className="court-dropdown__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 6 8 10 12 6"></polyline>
              </svg>
            </button>
            {courtOpen && (
              <div className="court-dropdown__menu">
                {COURTS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={
                      "court-dropdown__item" +
                      (c.id === court ? " court-dropdown__item--active" : "") +
                      (!c.enabled ? " court-dropdown__item--disabled" : "")
                    }
                    disabled={!c.enabled}
                    onClick={() => { if (c.enabled) { setCourt(c.id); setCourtOpen(false); } }}
                  >
                    <span className="court-dropdown__item-name">{c.name}</span>
                    {!c.enabled
                      ? <span className="court-dropdown__item-badge">Coming Soon</span>
                      : c.id === court
                        ? <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="12.5 3.5 5.5 10.5 2.5 7.5"></polyline></svg>
                        : null
                    }
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="field">
          <label className="field__label">
            <span>Case type</span>
            <span className="field__label-sub">Affects required annexures</span>
          </label>
          <select className="select" value={caseType} onChange={(e) => setCaseType(e.target.value)}>
            {CASE_TYPES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="upload__cta-row">
        <span className="upload__hint">Supported format: PDF only · Max size: 50MB</span>
        <button
          className="btn btn--primary btn--lg"
          disabled={!canAnalyse}
          onClick={() => onAnalyse({
            file,
            court: COURTS.find((c) => c.id === court),
            caseType: CASE_TYPES.find((c) => c.id === caseType),
          })}
        >
          <Ico.Spark size={14} /> Analyse Filing
        </button>
      </div>

      </div>{/* /upload__panel */}

      {SAMPLE_FILES.length > 0 && (
        <div className="upload__samples">
          <div className="upload__samples-label">Try a sample filing to explore</div>
          <div className="upload__samples-row">
            {SAMPLE_FILES.map((s) => (
              <button
                key={s.name}
                className="sample-chip"
                onClick={() => {
                  setFile({ name: s.name, size: s.size });
                  setCourt(s.court); setCaseType(s.caseType);
                }}
              >
                <Ico.FilePdf size={12} />
                {s.name}
                <span className="sample-chip__type">
                  {COURTS.find((c) => c.id === s.court).short}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

window.UploadScreen = UploadScreen;
