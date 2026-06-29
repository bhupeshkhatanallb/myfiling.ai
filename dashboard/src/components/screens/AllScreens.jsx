// screens.jsx — Additional screens: History, Court Rules, Help

const { useState: useStateS, useMemo: useMemoS } = React;

// ============================================================================
// HISTORY SCREEN
// ============================================================================

function HistoryScreen({ onSelect }) {
  const { RECENT } = window.FC_DATA;
  const [filterScore, setFilterScore] = useStateS("all");

  const filtered = useMemoS(() => {
    if (filterScore === "all") return RECENT;
    if (filterScore === "pass") return RECENT.filter(r => r.score >= 71);
    if (filterScore === "risk") return RECENT.filter(r => r.score < 71);
    return RECENT;
  }, [filterScore]);

  return (
    <div className="screen-content">
      <div className="screen-header">
        <h1>Filing History</h1>
        <p>Your recent uploads and their scrutiny scores</p>
      </div>

      <div className="screen-filters">
        <button
          className={"filter-pill" + (filterScore === "all" ? " filter-pill--active" : "")}
          onClick={() => setFilterScore("all")}
        >
          All ({RECENT.length})
        </button>
        <button
          className={"filter-pill" + (filterScore === "pass" ? " filter-pill--active" : "")}
          onClick={() => setFilterScore("pass")}
        >
          Likely to Pass ({RECENT.filter(r => r.score >= 71).length})
        </button>
        <button
          className={"filter-pill" + (filterScore === "risk" ? " filter-pill--active" : "")}
          onClick={() => setFilterScore("risk")}
        >
          Needs Work ({RECENT.filter(r => r.score < 71).length})
        </button>
      </div>

      <div className="history-list">
        {filtered.map((filing, i) => {
          const band = filing.score >= 71 ? "g" : filing.score >= 41 ? "a" : "r";
          const label = filing.score >= 71 ? "Likely to pass" : filing.score >= 41 ? "Moderate risk" : "High risk";
          return (
            <div key={i} className="history-card">
              <div className="history-card__left">
                <div className="history-card__icon"><Ico.FilePdf size={16} /></div>
                <div className="history-card__info">
                  <div className="history-card__name">{filing.name}</div>
                  <div className="history-card__meta">
                    <span>{filing.court}</span>
                    <span>·</span>
                    <span>{filing.when}</span>
                  </div>
                </div>
              </div>
              <div className="history-card__right">
                <div className="history-card__score-badge">
                  <div className={"score-badge score-badge--" + band}>
                    <span className="score-badge__num">{filing.score}%</span>
                    <span className="score-badge__label">{label}</span>
                  </div>
                </div>
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => onSelect({
                    file: { name: filing.name, size: "3.4 MB" },
                    court: window.FC_DATA.COURTS[0],
                    caseType: window.FC_DATA.CASE_TYPES[0],
                  })}
                >
                  Review
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon"><Ico.FilePdf size={48} /></div>
          <h3>No filings yet</h3>
          <p>Start by uploading your first filing for analysis</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COURT RULES SCREEN
// ============================================================================

function CourtRulesScreen() {
  const { COURT_RULES, COURTS } = window.FC_DATA;
  const [selectedCourt, setSelectedCourt] = useStateS(null);

  const courtsWithRules = useMemoS(() => {
    return COURT_RULES.map((rule) => ({
      ...rule,
      courtObj: COURTS.find(c => c.name === rule.court)
    }));
  }, []);

  const selected = courtsWithRules.find(r => r.court === selectedCourt);
  const categories = (selected && selected.categories) || [];

  // Normalize a rule entry to { text, auto } — supports plain strings too.
  const normalizeRule = (r) => (typeof r === "string" ? { text: r, auto: null } : r);

  const autoBadge = {
    high: { label: "Auto", cls: "rule-badge--high", title: "Checked automatically with high confidence" },
    medium: { label: "Partial", cls: "rule-badge--medium", title: "Partially automated — verify manually" },
    manual: { label: "Manual", cls: "rule-badge--manual", title: "Requires manual verification" },
  };

  return (
    <div className="screen-content">
      <div className="screen-header">
        <h1>Court Rules & Guidelines</h1>
        <p>Complete rule library for Indian courts</p>
      </div>

      <div className="rules-layout">
        <div className="rules-sidebar">
          <div className="rules-sidebar__label">Select a court:</div>
          <div className="rules-list">
            {courtsWithRules.map((rule, i) => (
              <button
                key={i}
                className={"rules-item" + (selectedCourt === rule.court ? " rules-item--active" : "")}
                onClick={() => setSelectedCourt(rule.court)}
              >
                <span className="rules-item__name">{rule.court}</span>
                <span className="rules-item__count">{rule.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rules-main">
          {selectedCourt ? (
            <div>
              <div className="rules-header">
                <h2>{selectedCourt}</h2>
                <p className="rules-header__subtitle">
                  {selected?.count} rules
                </p>
                {selected?.source && (
                  <p className="rules-header__source">{selected.source}</p>
                )}
              </div>

              {categories.map((cat, i) => (
                <div key={i} className="rule-category">
                  <h3 className="rule-category__name">{cat.name}</h3>
                  <div className="rule-items">
                    {cat.rules.map((r, j) => {
                      const rule = normalizeRule(r);
                      const badge = rule.auto ? autoBadge[rule.auto] : null;
                      return (
                        <div key={j} className="rule-item">
                          <div className="rule-item__indicator"></div>
                          <span className="rule-item__text">{rule.text}</span>
                          {badge && (
                            <span className={"rule-badge " + badge.cls} title={badge.title}>
                              {badge.label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="rules-note">
                <Ico.Alert size={14} style={{color: "var(--amber-600)"}} />
                <span>Rules researched: June 2026 from official court circulars. See COURT_RULES.md for citations. Verify before filing.</span>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <Ico.Book size={48} style={{color: "var(--ink-300)"}} />
              <h3>Select a court</h3>
              <p>Choose a court from the list to see its rules and guidelines</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELP SCREEN
// ============================================================================

function HelpScreen({ onHome }) {
  const [activeTab, setActiveTab] = useStateS("getting-started");

  const tabs = [
    { id: "getting-started", label: "Getting Started" },
    { id: "faq", label: "FAQ" },
    { id: "terms", label: "Terms & Disclaimer" },
    { id: "support", label: "Support" },
  ];

  return (
    <div className="screen-content">
      <div className="screen-header">
        <h1>Help & Support</h1>
        <p>Learn how to use myfiling.ai effectively</p>
      </div>

      <div className="help-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={"help-tab" + (activeTab === tab.id ? " help-tab--active" : "")}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="help-content">
        {activeTab === "getting-started" && (
          <div>
            <h2>Getting Started with myfiling.ai</h2>

            <div className="help-section">
              <h3>Step 1: Upload Your Filing</h3>
              <p>Drag and drop your PDF filing onto the upload area, or click to browse your computer. The file must be a text-based PDF (not scanned images).</p>
            </div>

            <div className="help-section">
              <h3>Step 2: Select Court & Case Type</h3>
              <p>Choose the court where you're filing (Supreme Court, Delhi High Court, etc.) and the case type (Writ Petition, SLP, etc.). This ensures we apply the right rules.</p>
            </div>

            <div className="help-section">
              <h3>Step 3: Review Your Analysis</h3>
              <p>We scan your document and identify defects. Each defect shows the page number, severity level, and the court rule it violates.</p>
            </div>

            <div className="help-section">
              <h3>Step 4: Fix & Re-upload</h3>
              <p>Use our suggested fixes to correct each defect. When ready, upload the revised version for re-analysis.</p>
            </div>

            <div className="help-section">
              <h3>Step 5: Download & Share</h3>
              <p>Download the defect report to share with your team or client. Use the share button to collaborate with co-counsel.</p>
            </div>
          </div>
        )}

        {activeTab === "faq" && (
          <div>
            <h2>Frequently Asked Questions</h2>

            <div className="faq-item">
              <h3>What file formats do you support?</h3>
              <p>Currently, we accept PDF files only. The PDF must contain extractable text (not just scanned images). For scanned PDFs, use OCR software first.</p>
            </div>

            <div className="faq-item">
              <h3>Does the tool guarantee my filing will pass?</h3>
              <p>No. The Filing Readiness Score is indicative only — it reflects formatting and registry-filing requirements, not the legal merit of your matter, and registry scrutiny involves human discretion we can't fully automate. Always have a qualified advocate review your filing before submission.</p>
            </div>

            <div className="faq-item">
              <h3>What courts do you cover?</h3>
              <p>We currently analyze filings for the Delhi High Court. Support for the Supreme Court and other High Courts is coming soon — we're expanding coverage based on user demand.</p>
            </div>

            <div className="faq-item">
              <h3>How accurate is the analysis?</h3>
              <p>Our rules are based on official court guidelines. However, rules change periodically. We update our database quarterly. Always verify critical requirements with the court.</p>
            </div>

            <div className="faq-item">
              <h3>Is my filing data secure?</h3>
              <p>Yes. Your uploaded PDFs are processed in real-time and deleted immediately after analysis. We don't store your documents. See our Privacy Policy for details.</p>
            </div>

            <div className="faq-item">
              <h3>Can I use this instead of a lawyer?</h3>
              <p>No. This tool helps catch obvious defects, but it's not a substitute for legal advice. Always review filings with a qualified advocate before submission.</p>
            </div>
          </div>
        )}

        {activeTab === "terms" && (
          <div>
            <h2>Terms & Disclaimer</h2>

            <div className="terms-section" style={{background: "var(--blue-50)", padding: 16, borderRadius: "var(--radius-md)", border: "1px solid #D6E1FB", marginBottom: 24}}>
              <h3 style={{marginTop: 0}}>How myfiling.ai Works</h3>
              <p><strong>myfiling.ai checks your filings</strong> against the Delhi High Court's formatting and registry-filing requirements (paper, margins, type, pagination, index, court fee, vakalatnama, limitation, certified copy, affidavit). The Filing Readiness Score helps you understand your filing's registry-compliance level. This is a <strong>tool to catch common defects early</strong> and save time on your drafting workflow — not a substitute for legal review.</p>
              <p style={{marginBottom: 0}}><strong>Important:</strong> While highly accurate, we recommend having your advocate review the final filing before submission, as with any important legal document.</p>
            </div>

            <div className="terms-section">
              <h3>Limitations of the Tool</h3>
              <ul>
                <li>Cannot evaluate legal merit or substance of claims</li>
                <li>Cannot predict human discretion by court staff</li>
                <li>Cannot account for rule changes that occur between updates</li>
                <li>May miss issues specific to your court or jurisdiction</li>
                <li>Does not provide legal advice or representation</li>
              </ul>
            </div>

            <div className="terms-section">
              <h3>Your Responsibility</h3>
              <p>You are responsible for ensuring your filing is legally sound and complete. You must have a qualified advocate review your filing before submission. myfiling.ai is a tool to assist in formatting compliance, not a substitute for legal judgment.</p>
            </div>

            <div className="terms-section">
              <h3>Liability Limitation</h3>
              <p>myfiling.ai is provided "as is" without warranties. We are not liable for filing rejections, delays, or adverse consequences resulting from reliance on this tool. Use at your own risk.</p>
            </div>
          </div>
        )}

        {activeTab === "support" && (
          <div>
            <h2>Get Help</h2>

            <div className="help-section">
              <h3>📧 Email Support</h3>
              <p>For questions or issues: <strong>support@myfiling.ai</strong></p>
              <p>Response time: Within 24 hours</p>
            </div>

            <div className="help-section">
              <h3>💬 Chat Support</h3>
              <p>Available during business hours (9 AM - 6 PM IST, Monday-Friday)</p>
              <p>Click the chat icon in the bottom-right corner of the app</p>
            </div>

            <div className="help-section">
              <h3>📚 Documentation</h3>
              <p>Check our detailed guides:</p>
              <ul style={{marginTop: 8}}>
                <li><strong>Getting Started Guide</strong> — How to upload and analyze</li>
                <li><strong>Court Rules Library</strong> — Rules for each court</li>
                <li><strong>FAQ</strong> — Common questions</li>
                <li><strong>Video Tutorials</strong> — Visual walkthrough</li>
              </ul>
            </div>

            <div className="help-section">
              <h3>🐛 Report a Bug</h3>
              <p>Found an issue? Let us know: <strong>bugs@myfiling.ai</strong></p>
              <p>Include: what you were doing, what happened, and your browser</p>
            </div>

            <div className="help-section">
              <h3>💡 Suggest a Feature</h3>
              <p>Have an idea? We'd love to hear it: <strong>features@myfiling.ai</strong></p>
              <p>Tell us what feature would help you most</p>
            </div>

            <div className="help-section" style={{background: "var(--blue-50)", padding: 16, borderRadius: "var(--radius-md)", marginTop: 24}}>
              <p style={{marginBottom: 0}}><strong>Ready to analyze your next filing?</strong></p>
              <button className="btn btn--primary" onClick={onHome} style={{marginTop: 12}}>
                Go Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.HistoryScreen = HistoryScreen;
window.CourtRulesScreen = CourtRulesScreen;
window.HelpScreen = HelpScreen;
