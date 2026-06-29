// Header + Sidebar navigation
const { useState } = React;

function Header({ screen, onHome, navActive, onNavClick }) {
  const items = [
    { label: "Dashboard", key: "dashboard" },
    { label: "History", key: "history" },
    { label: "Court Rules", key: "rules" },
    { label: "Help", key: "help" }
  ];
  return (
    <header className="header">
      <button className="header__logo" onClick={onHome}>
        <span className="header__logo-mark">M</span>
        myfiling.ai
      </button>
      <nav className="header__nav">
        {items.map((item) => (
          <button
            key={item.key}
            className={"header__nav-item" + (navActive === item.key ? " header__nav-item--active" : "")}
            onClick={() => onNavClick(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="header__right">
        <div className="header__search">
          <Ico.Search />
          <input placeholder="Search filings, rules, defects…" />
          <span className="header__kbd">⌘K</span>
        </div>
        <div className="header__avatar" title="A. Raghavan, AOR">AR</div>
      </div>
    </header>
  );
}

function Sidebar({ recents, onOpenRecent, onCourtRuleClick }) {
  const { RECENT, COURT_RULES, COURTS, CASE_TYPES } = window.FC_DATA;
  // Prefer the live, persisted recents passed from App; fall back to any static
  // seed data only if no prop is provided.
  const recentList = (recents && recents.length) ? recents : (recents ? [] : RECENT);
  return (
    <aside className="sidebar">
      <div className="sidebar__section">
        <div className="sidebar__label">Recent uploads</div>
        <div className="sidebar__recents">
          {recentList.length === 0 ? (
            <div className="sidebar__empty">No recent filings</div>
          ) : (
            recentList.map((r, i) => {
              const band = r.score >= 71 ? "g" : r.score >= 41 ? "a" : "r";
              const when = r.when || relativeWhen(r.createdAt);
              const handleClick = () => { onOpenRecent && onOpenRecent(r); };
              return (
                <div
                  key={i}
                  className="sidebar__item"
                  onClick={handleClick}
                  style={{ cursor: "pointer" }}
                >
                  <div className="sidebar__item-icon"><Ico.FilePdf size={14} /></div>
                  <div className="sidebar__item-meta">
                    <span className="sidebar__item-title">{r.name}</span>
                    <span className="sidebar__item-sub">{r.court} · {when}</span>
                  </div>
                  <span className={"sidebar__score sidebar__score--" + band}>{r.score}%</span>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="sidebar__section">
        <div className="sidebar__label">Court rules</div>
        {COURT_RULES.map((c, i) => {
          // Enabled-ness is driven by the COURTS data (match by name) so the
          // sidebar tracks whichever court is live — currently Delhi High Court.
          const isEnabled = !!(COURTS.find((ct) => ct.name === c.court) || {}).enabled;
          return (
            <button
              key={i}
              className={
                "sidebar__rule-btn" +
                (isEnabled ? " sidebar__rule-btn--enabled" : " sidebar__rule-btn--coming-soon")
              }
              onClick={() => isEnabled && onCourtRuleClick && onCourtRuleClick(c.court)}
              disabled={!isEnabled}
              title={!isEnabled ? "Rules available in next update" : "Click to view rules"}
            >
              <span className="sidebar__rule-name">{c.court}</span>
              <span className="sidebar__rule-meta">
                {isEnabled ? (
                  <span className="sidebar__rule-count">{c.count}</span>
                ) : (
                  <span className="sidebar__rule-badge">Coming Soon</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <div className="sidebar__section">
        <div className="sidebar__label">Shortcuts</div>
        <button className="sidebar__shortcut-btn">
          <span style={{display:"flex", alignItems:"center", gap:8}}>
            <Ico.Plus size={12} /> New filing
          </span>
          <span className="sidebar__shortcut-key">N</span>
        </button>
        <button className="sidebar__shortcut-btn">
          <span style={{display:"flex", alignItems:"center", gap:8}}>
            <Ico.History size={12} /> History
          </span>
          <span className="sidebar__shortcut-key">H</span>
        </button>
        <button className="sidebar__shortcut-btn">
          <span style={{display:"flex", alignItems:"center", gap:8}}>
            <Ico.Book size={12} /> Rule library
          </span>
          <span className="sidebar__shortcut-key">R</span>
        </button>
      </div>
    </aside>
  );
}

window.Header = Header;
window.Sidebar = Sidebar;