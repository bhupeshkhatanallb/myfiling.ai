// results.jsx - Screen 2: Results Dashboard
const { useState: useStateR, useMemo: useMemoR, useEffect: useEffectR } = React;

const SEV_LABEL = { critical: "Critical", minor: "Minor", warning: "Warning" };

// Confidence (0..1) -> short label for the badge. The detector engine emits a
// per-finding confidence; surfacing it tells the advocate how sure the tool is.
function confidenceLabel(c) {
  if (c == null) return null;
  if (c >= 0.9) return "High confidence";
  if (c >= 0.75) return "Medium confidence";
  return "Low confidence";
}
function confidenceTier(c) {
  if (c == null) return null;
  if (c >= 0.9) return "high";
  if (c >= 0.75) return "med";
  return "low";
}

// Pretty-print a normalised font family token ("timesnewroman" -> "Times New Roman").
function titleCaseFamily(fam) {
  const KNOWN = {
    timesnewroman: "Times New Roman", times: "Times New Roman",
    timesroman: "Times New Roman", liberationserif: "Liberation Serif",
    nimbusroman: "Nimbus Roman", arial: "Arial", helvetica: "Helvetica",
    calibri: "Calibri", cambria: "Cambria", georgia: "Georgia",
    verdana: "Verdana", couriernew: "Courier New", courier: "Courier",
    garamond: "Garamond", tahoma: "Tahoma",
  };
  return KNOWN[fam] || (fam ? fam.charAt(0).toUpperCase() + fam.slice(1) : fam);
}

// Render the measured evidence object (e.g. {left_cm: 2.3}) as readable chips.
const EVIDENCE_LABELS = {
  left_cm: "Left", right_cm: "Right", top_cm: "Top", bottom_cm: "Bottom",
  body_pt: "Body size", ratio: "Spacing", dominant_family: "Font",
  dominant_fraction: "Share", non_a4_fraction: "Non-A4", blocks: "Blocks",
  off_spec: "Off-spec", first_page: "First page",
};
function EvidenceChips({ evidence }) {
  if (!evidence || typeof evidence !== "object") return null;
  const entries = Object.entries(evidence).filter(
    ([k, v]) => v != null && typeof v !== "object"
  );
  if (!entries.length) return null;
  const fmt = (k, v) => {
    if (k.endsWith("_cm")) return v + " cm";
    if (k.endsWith("_pt")) return v + " pt";
    if (k.endsWith("_fraction") || k === "dominant_fraction")
      return Math.round(v * 100) + "%";
    return String(v);
  };
  return (
    <div className="defect__evidence">
      {entries.map(([k, v]) => (
        <span className="evidence-chip" key={k}>
          <span className="evidence-chip__k">{EVIDENCE_LABELS[k] || k}</span>
          <span className="evidence-chip__v">{fmt(k, v)}</span>
        </span>
      ))}
    </div>
  );
}

function DefectCard({ defect, open, onToggle, fixed, onToggleFixed, fileUrl, onViewPage }) {
  const conf = defect.confidence;
  const confTier = confidenceTier(conf);
  return (
    <div className={"defect defect--" + defect.severity + (open ? " defect--open" : "") + (fixed ? " defect--fixed" : "")} onClick={onToggle}>
      <div className="defect__head">
        <div className="defect__page">
          <span className="defect__page-num">p.{defect.page}</span>
        </div>
        <div style={{flex: 1, minWidth: 0}}>
          <div className="defect__title">
            {defect.title}
            <span className={"severity severity--" + defect.severity}>
              {SEV_LABEL[defect.severity]}
            </span>
            {confTier && (
              <span className={"conf-badge conf-badge--" + confTier} title={confidenceLabel(conf) + " (" + Math.round(conf * 100) + "%)"}>
                {Math.round(conf * 100)}%
              </span>
            )}
            {fixed && <span className="severity severity--fixed">Fixed</span>}
          </div>
          <p className="defect__desc">{defect.desc}</p>
        </div>
        <div className="defect__chev"><Ico.ChevronDown /></div>
      </div>
      {open && (
        <div className="defect__body" onClick={(e) => e.stopPropagation()}>
          <EvidenceChips evidence={defect.evidence} />
          <div className="defect__section">
            <h5>Rule Violated</h5>
            <div className="defect__rule">{defect.rule}</div>
          </div>
          <div className="defect__section">
            <h5>What to Do</h5>
            <p style={{lineHeight: 1.6, color: "var(--ink-700)"}}>{defect.fix}</p>
          </div>
          <div className="defect__action">
            <button
              className="btn btn--ghost btn--xs"
              onClick={() => onViewPage(defect.page)}
              disabled={!fileUrl}
              title={fileUrl ? "Open this page of the PDF" : "Original PDF not available in this session"}
            >
              <Ico.FilePdf size={12} style={{marginRight: 6}} />
              View Page {defect.page}
            </button>
            <button
              className={"btn btn--xs" + (fixed ? " btn--primary" : " btn--ghost")}
              onClick={() => onToggleFixed(defect.id)}
            >
              <Ico.Check size={12} style={{marginRight: 6}} />
              {fixed ? "Fixed ✓" : "Mark Fixed"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultsScreen({ session, onBack, onDownload, onShare }) {
  const [filter, setFilter] = useStateR("all");
  const [openId, setOpenId] = useStateR(null);
  const [score, setScore] = useStateR(0);
  const [fixedIds, setFixedIds] = useStateR({});
  const [checksOpen, setChecksOpen] = useStateR(false);

  const toggleFixed = (id) =>
    setFixedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  const viewPage = (page) => {
    const url = session.file && session.file.url;
    if (!url) return;
    // Most PDF viewers honour the #page fragment to jump to a page.
    window.open(url + "#page=" + page, "_blank", "noopener");
  };

  // Animate the score in
  useEffectR(() => {
    let raf;
    const target = session.score;
    const start = performance.now();
    const dur = 900;
    const step = (t) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setScore(Math.round(target * eased));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [session.score]);

  const defects = session.defectsToUse || [];
  const stats = session.stats || {};
  const counts = useMemoR(() => ({
    all: defects.length,
    critical: defects.filter((d) => d.severity === "critical").length,
    minor: defects.filter((d) => d.severity === "minor").length,
    warning: defects.filter((d) => d.severity === "warning").length,
  }), [defects]);

  const sevOrder = { critical: 0, minor: 1, warning: 2 };
  const visible = useMemoR(() => {
    let list = defects;
    if (filter !== "all") list = list.filter((d) => d.severity === filter);
    return [...list].sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);
  }, [defects, filter]);

  const filters = [
    { id: "all", label: "All" },
    { id: "critical", label: "Critical" },
    { id: "minor", label: "Minor" },
    { id: "warning", label: "Warnings" },
  ];

  return (
    <div className="results">
      <aside className="results__left">
        <div className="results__crumbs">
          <button onClick={onBack}><Ico.ArrowLeft size={12} style={{display:"inline", verticalAlign:"-2px", marginRight:4}} /> New filing</button>
          <span>/</span>
          <span>Scrutiny report</span>
        </div>

        <div className="summary__file">
          <div className="summary__file-ico">PDF</div>
          <div style={{flex: 1, minWidth: 0}}>
            <div className="summary__file-name">{session.file.name}</div>
            <div className="summary__file-meta">
              <span className="tag tag--blue">{session.court.short}</span>
              <span className="tag">{session.caseType.name}</span>
              <span className="tag">{session.file.size}</span>
            </div>
          </div>
        </div>

        <Gauge score={score} />

        <p className="readiness-note">
          Covers formatting &amp; registry-filing requirements - not legal merit.
          Not a guarantee against objection; have an advocate review before filing.
        </p>

        <div className="metrics">
          <div className="metric">
            <div className="metric__label">Total</div>
            <div className="metric__value">{counts.all}</div>
          </div>
          <div className="metric">
            <div className="metric__label"><span className="metric__dot metric__dot--r"></span>Critical</div>
            <div className="metric__value" style={{color: "var(--red-600)"}}>{counts.critical}</div>
          </div>
          <div className="metric">
            <div className="metric__label"><span className="metric__dot metric__dot--a"></span>Minor</div>
            <div className="metric__value" style={{color: "var(--amber-600)"}}>{counts.minor}</div>
          </div>
        </div>

        <div className="summary__detail-list">
          <div className="summary__detail-row"><span>Pages scanned</span><span>{stats.pages_scanned != null ? stats.pages_scanned : "-"}</span></div>
          {(() => {
            const checks = stats.checks || [];
            const clickable = checks.length > 0;
            return (
              <React.Fragment>
                <div
                  className={"summary__detail-row" + (clickable ? " summary__detail-row--clickable" : "") + (checksOpen ? " summary__detail-row--open" : "")}
                  onClick={() => clickable && setChecksOpen((v) => !v)}
                  role={clickable ? "button" : undefined}
                  title={clickable ? "Show the checks that ran" : undefined}
                >
                  <span>
                    Checks evaluated
                    {clickable && (
                      <Ico.ChevronDown
                        size={12}
                        style={{ marginLeft: 6, verticalAlign: "-2px", transition: "transform .15s", transform: checksOpen ? "rotate(180deg)" : "none" }}
                      />
                    )}
                  </span>
                  <span>{stats.rules_evaluated != null ? stats.rules_evaluated : "-"}</span>
                </div>
                {clickable && checksOpen && (
                  <div className="checks-panel">
                    {checks.map((c, i) => (
                      <div className="checks-panel__row" key={i}>
                        <span className={"checks-panel__dot checks-panel__dot--" + c.status}></span>
                        <span className="checks-panel__name">
                          {c.name}
                          <span className="checks-panel__rule">{c.rule}</span>
                        </span>
                        <span className={"checks-panel__status checks-panel__status--" + c.status}>
                          {c.status === "pass" ? "Pass" : (c.defects + (c.defects === 1 ? " issue" : " issues"))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </React.Fragment>
            );
          })()}
          <div className="summary__detail-row"><span>Sections detected</span><span>{stats.sections_detected && stats.sections_detected.length ? stats.sections_detected.length : 0}</span></div>
          <div className="summary__detail-row"><span>Index entries</span><span>{stats.index_entries != null ? stats.index_entries : "-"}</span></div>
          <div className="summary__detail-row"><span>Scrutiny baseline</span><span>{stats.baseline || "DHC Rules / PD 74"}</span></div>
          <div className="summary__detail-row"><span>Analysed</span><span>Just now</span></div>
        </div>

        {(() => {
          // Measured formatting metrics from the detector engine. Shown only when
          // at least one value is available (text-based, scrutinisable filing).
          const m = stats.margins_cm || {};
          const rows = [
            ["Paper size", stats.paper_size],
            ["Font family", stats.font_family ? titleCaseFamily(stats.font_family) : null],
            ["Body font", stats.body_font_pt != null ? stats.body_font_pt + " pt" : null],
            ["Line spacing", stats.line_spacing_ratio != null ? stats.line_spacing_ratio + "×" : null],
            ["Margins (L/R/T/B)", (m.left != null) ? `${m.left}/${m.right}/${m.top}/${m.bottom} cm` : (stats.left_margin_cm != null ? stats.left_margin_cm + " cm (L)" : null)],
          ].filter(([, v]) => v != null && v !== "");
          if (!rows.length) return null;
          return (
            <div className="metrics-panel">
              <div className="metrics-panel__title">Measured formatting</div>
              {rows.map(([k, v]) => (
                <div className="summary__detail-row" key={k}><span>{k}</span><span className="metrics-panel__val">{v}</span></div>
              ))}
            </div>
          );
        })()}

        <div className="summary__actions">
          <button className="btn btn--gold btn--block" onClick={onDownload}>
            <Ico.Download size={14} /> Download Report (PDF)
          </button>
          <button className="btn btn--ghost btn--block" onClick={onShare}>Share with co-counsel</button>
        </div>
      </aside>

      <section className="results__right">
        {stats.ocr_used && (
          <div className="ocr-banner">
            <Ico.Spark size={14} />
            <span>
              This appears to be a <strong>scanned document</strong>. Text was recovered via OCR
              {stats.ocr_pages ? ` from the first ${stats.ocr_pages} page${stats.ocr_pages === 1 ? "" : "s"}` : ""},
              so text checks ran at lower confidence and layout checks (margins, font size, spacing) could not be measured. Verify findings manually.
            </span>
          </div>
        )}
        <div className="results__header">
          <div>
            <h2 className="results__heading">Defects Found</h2>
            <p className="results__heading-sub">
              Sorted by severity. Click any defect to see the rule citation and remediation steps.
            </p>
          </div>
          <div className="filter-bar">
            {filters.map((f) => (
              <button
                key={f.id}
                className={"filter-bar__btn" + (filter === f.id ? " filter-bar__btn--active" : "")}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <span className="filter-bar__count">{counts[f.id]}</span>
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="empty-filter">
            {filter === "all" ? (
              <div className="empty-filter__success">
                <div className="empty-filter__success-icon">✓</div>
                <strong>No defects detected</strong>
                <p>This filing appears compliant with court rules. However, have a qualified advocate review before final submission.</p>
                <button className="btn btn--ghost btn--sm" onClick={() => setFilter("all")} style={{marginTop: 12}}>
                  View detailed analysis
                </button>
              </div>
            ) : (
              <div>No {filter} defects in this filing.</div>
            )}
          </div>
        ) : (
          <div className="defect-list stagger">
            {visible.map((d) => (
              <DefectCard
                key={d.id}
                defect={d}
                open={openId === d.id}
                onToggle={() => setOpenId(openId === d.id ? null : d.id)}
                fixed={!!fixedIds[d.id]}
                onToggleFixed={toggleFixed}
                fileUrl={session.file && session.file.url}
                onViewPage={viewPage}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

window.ResultsScreen = ResultsScreen;
