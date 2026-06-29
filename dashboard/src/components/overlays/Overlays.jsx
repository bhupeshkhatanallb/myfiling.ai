// misc.jsx - Analysing overlay, Error screen, Toast

const { useState: useStateM, useEffect: useEffectM } = React;

// Friendly label for each streamed pipeline stage.
const STAGE_LABELS = {
  "parsing": "Parsing PDF (chunked, single pass)",
  "ocr": "Reading scanned pages (OCR)",
  "parsed": "Extracted text, index & bookmarks",
  "page-detectors": "Running page detectors",
  "conditional-detectors": "Checking section-specific pages",
  "validators": "Validating index & bookmarks",
};

const SEV_META = {
  critical: { cls: "live-defect--critical", label: "Critical" },
  warning: { cls: "live-defect--warning", label: "Warning" },
  minor: { cls: "live-defect--minor", label: "Minor" },
};

function AnalysingOverlay({ file, defects, progress }) {
  // Real-time overlay: the backend STREAMS progress + each defect as it is found
  // (Server-Sent Events). We render defects live and show the current stage. The
  // parent unmounts us when the final `result` frame arrives.
  defects = defects || [];
  const stageLabel = progress
    ? (STAGE_LABELS[progress.stage] || progress.stage)
    : "Starting analysis…";

  // Detail line: detector name during detector stages, page counters during
  // parsing/OCR, summary after parse.
  let detail = null;
  if (progress) {
    if (progress.detector) {
      detail = progress.detector + " (" + progress.page + "/" + progress.total + ")";
    } else if (progress.stage === "parsing" && progress.total) {
      detail = "page " + progress.page + " / " + progress.total;
    } else if (progress.stage === "ocr") {
      detail = "OCR page " + progress.page + " / " + progress.total
        + (progress.pdf_page ? " (PDF p" + progress.pdf_page + ")" : "");
    } else if (progress.stage === "parsed") {
      detail = progress.total + " pages · " + (progress.index_entries || 0)
        + " index entries · " + (progress.bookmarks || 0) + " bookmarks"
        + (progress.ocr_used ? " · OCR" : "");
    }
  }

  const counts = defects.reduce((a, d) => { a[d.severity] = (a[d.severity] || 0) + 1; return a; }, {});

  return (
    <div className="analysing">
      <div className="analysing__card analysing__card--live">
        <div className="analysing__title">
          <span className="analysing__spinner" /> Analysing filing…
        </div>
        <div className="analysing__sub">{file?.name}</div>

        <div className="analysing__stage">{stageLabel}</div>
        {detail ? <div className="analysing__detail">{detail}</div> : null}

        <div className="live-defects__head">
          <span>Findings so far</span>
          <span className="live-defects__counts">
            {counts.critical ? <b className="c-crit">{counts.critical} critical</b> : null}
            {counts.warning ? <b className="c-warn">{counts.warning} warning</b> : null}
            {counts.minor ? <b className="c-minor">{counts.minor} minor</b> : null}
            {defects.length === 0 ? <span className="c-muted">none yet…</span> : null}
          </span>
        </div>

        <div className="live-defects">
          {defects.length === 0 ? (
            <div className="live-defects__empty">
              Defects will appear here the moment each detector finds one.
            </div>
          ) : (
            defects.slice().reverse().map((d, i) => {
              const meta = SEV_META[d.severity] || SEV_META.minor;
              return (
                <div key={(d.id || "d") + "-" + i} className={"live-defect " + meta.cls}>
                  <span className="live-defect__sev">{meta.label}</span>
                  <span className="live-defect__title">{d.title}</span>
                  <span className="live-defect__page">p{d.page}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-state__icon">
        <Ico.Alert size={36} />
      </div>
      <h2 className="error-state__title">{message.title}</h2>
      <p className="error-state__sub">
        Try uploading a text-based PDF. If the file is scanned, OCR it first and re-upload.
      </p>
      <div className="error-state__details">
        <Ico.FilePdf size={14} />
        <div>
          <div style={{ color: "var(--ink-900)", fontWeight: 600, marginBottom: 4 }}>
            What went wrong
          </div>
          {message.details}
        </div>
      </div>
      <div className="error-state__cta">
        <button className="btn btn--primary" onClick={onRetry}>
          <Ico.Upload size={14} /> Re-upload PDF
        </button>
        <button className="btn btn--ghost">Read troubleshooting guide</button>
      </div>
    </div>
  );
}

function Toast({ message, onClose }) {
  useEffectM(() => {
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="toast">
      <span className="toast__ico"><Ico.Check size={16} /></span>
      <span>{message}</span>
      <button className="toast__close" onClick={onClose}><Ico.X size={12} /></button>
    </div>
  );
}

window.AnalysingOverlay = AnalysingOverlay;
window.ErrorScreen = ErrorScreen;
window.Toast = Toast;
