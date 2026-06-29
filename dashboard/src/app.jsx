// app.jsx — root App, ties screens together
const { useState: useStateA, useEffect: useEffectA } = React;

// --- Recent filings: server-side (SQLite via /api/recents) ------------------
// The backend records each completed analysis in SQLite and returns the full
// result snapshot, so reopening a recent shows the cached report. The frontend
// just fetches the list; it no longer stores anything in the browser.
async function fetchRecents() {
  try {
    const res = await fetch("/api/recents", { credentials: "same-origin" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.recents) ? data.recents : [];
  } catch (_) {
    return [];
  }
}

function relativeWhen(iso) {
  const d = iso ? new Date(iso) : new Date();
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return mins + "m ago";
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  const days = Math.round(hrs / 24);
  return days + "d ago";
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "showSidebar": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useStateA("upload"); // upload | analysing | results | error | history | rules | help
  const [session, setSession] = useStateA(null);
  const [errorMsg, setErrorMsg] = useStateA(null);
  const [toast, setToast] = useStateA(null);
  const [navActive, setNavActive] = useStateA("dashboard");
  const [recents, setRecents] = useStateA([]);

  // Auth gate: `user` is null when logged out; `authChecked` flips true once the
  // initial /api/auth/me has resolved (so we don't flash the login screen).
  const [user, setUser] = useStateA(null);
  const [authChecked, setAuthChecked] = useStateA(false);

  // On startup, check whether there's an existing session, then load recents.
  useEffectA(() => {
    window.apiMe().then((u) => {
      setUser(u);
      setAuthChecked(true);
      if (u) fetchRecents().then(setRecents);
    });
  }, []);

  const onAuthed = (u) => {
    setUser(u);
    setScreen("upload");
    setNavActive("dashboard");
    fetchRecents().then(setRecents);
  };

  const onLogout = async () => {
    await window.apiLogout();
    setUser(null);
    setRecents([]);
    setSession(null);
    setScreen("upload");
    setNavActive("dashboard");
  };

  // Re-pull the list from the server (called after an analysis records one).
  const refreshRecents = () => { fetchRecents().then(setRecents); };

  // Live defects streamed from the backend during an in-flight analysis. The
  // AnalysingOverlay reads these to show findings appearing in real time.
  const [liveDefects, setLiveDefects] = useStateA([]);
  const [liveProgress, setLiveProgress] = useStateA(null);

  // Run the REAL analysis by STREAMING from the backend (Server-Sent Events over
  // a POST/fetch ReadableStream). Defects render live as each detector finds them;
  // the final `result` frame carries the score + full payload.
  const startAnalyse = async (payload) => {
    setScreen("analysing");
    setNavActive("dashboard");
    setSession({ ...payload, pending: true });
    setLiveDefects([]);
    setLiveProgress(null);

    const raw = payload.file && payload.file.raw;
    if (!raw) {
      showError({
        title: "No file to analyse",
        details: "Please choose a PDF file before running analysis.",
      });
      return;
    }

    const form = new FormData();
    form.append("file", raw, payload.file.name);
    form.append("court_id", payload.court.id);
    form.append("case_type_id", payload.caseType.id);

    const fileUrl = raw ? URL.createObjectURL(raw) : null;
    const finishWithResult = (data) => {
      const newSession = {
        file: { name: data.file_name, size: data.file_size_label || (data.file_size_mb + " MB"), url: fileUrl },
        court: payload.court,
        caseType: payload.caseType,
        score: data.score,
        confidence: data.confidence,
        defectsToUse: data.defects,
        summary: data.summary,
        stats: data.stats,
        analysisId: data.analysis_id,
        createdAt: data.created_at,
      };
      setSession(newSession);
      setScreen("results");
      setNavActive("dashboard");
      refreshRecents();
    };

    try {
      const res = await fetch("/api/analyze/stream", {
        method: "POST", body: form, credentials: "same-origin",
      });
      if (!res.ok || !res.body) {
        let detail = { title: "Analysis failed", details: `Server returned ${res.status}.` };
        try {
          const body = await res.json();
          if (body && body.detail) detail = body.detail;
        } catch (_) { /* non-JSON error body (e.g. a stream) */ }
        showError(detail);
        return;
      }

      // Parse the SSE byte stream frame-by-frame (event: <type>\ndata: <json>\n\n).
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let errored = false;

      const handleFrame = (frame) => {
        const lines = frame.split("\n");
        let evType = "message";
        let dataStr = "";
        for (const line of lines) {
          if (line.startsWith("event:")) evType = line.slice(6).trim();
          else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
        }
        if (!dataStr) return;
        let data;
        try { data = JSON.parse(dataStr); } catch (_) { return; }

        if (evType === "defect") {
          setLiveDefects((prev) => [...prev, data]);
        } else if (evType === "progress") {
          setLiveProgress(data);
        } else if (evType === "result") {
          finishWithResult(data);
        } else if (evType === "error") {
          errored = true;
          showError(data.title ? data : { title: "Analysis failed", details: data.details || "Unknown error." });
        }
      };

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let sep;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          handleFrame(frame);
        }
        if (errored) { try { await reader.cancel(); } catch (_) {} return; }
      }
    } catch (err) {
      showError({
        title: "Could not reach the analysis service",
        details: "The backend did not respond. Make sure the server is running, then retry.",
      });
    }
  };

  const showError = (msg) => { setErrorMsg(msg); setScreen("error"); };
  const goHome = () => {
    setScreen("upload");
    setSession(null);
    setErrorMsg(null);
    setNavActive("dashboard");
  };

  const goToScreen = (screenName, navName) => {
    setScreen(screenName);
    setNavActive(navName);
  };

  useEffectA(() => {
    document.documentElement.style.setProperty(
      "--sidebar-w", t.showSidebar ? "260px" : "0px"
    );
  }, [t.showSidebar]);

  // Until the initial auth check resolves, render nothing (avoids a login flash).
  if (!authChecked) {
    return <div className="auth-loading" />;
  }

  // Logged out -> show the login / signup gate; the rest of the app is hidden.
  if (!user) {
    return <AuthScreen onAuthed={onAuthed} />;
  }

  return (
    <div className={"app" + (t.showSidebar ? "" : " app--no-sidebar")}>
      <Header
        screen={screen}
        onHome={goHome}
        navActive={navActive}
        user={user}
        onLogout={onLogout}
        onNavClick={(name) => {
          if (name === "dashboard") goHome();
          else goToScreen(name, name);
        }}
      />
      {t.showSidebar && <Sidebar
        recents={recents}
        onOpenRecent={(entry) => {
          // Restore the cached report directly (no re-analysis: the original
          // PDF is not retained across sessions).
          if (entry && entry.session) {
            setSession(entry.session);
            setScreen("results");
            setNavActive("dashboard");
          }
        }}
        onCourtRuleClick={(courtName) => {
          goToScreen("rules", "rules");
        }}
      />}
      <main className="main">
        {screen === "upload" && (
          <UploadScreen onAnalyse={startAnalyse} onError={showError} />
        )}
        {screen === "results" && session && (
          <ResultsScreen
            session={session}
            onBack={goHome}
            onDownload={() => {
              const ok = downloadReport(session);
              setToast(ok
                ? "Filing report opened in a new tab — use your browser's Save as PDF."
                : "Pop-up blocked. Allow pop-ups for this site to download the report.");
            }}
            onShare={() => setToast("Share link copied to clipboard! Share with: co-counsel@firm.com")}
          />
        )}
        {screen === "error" && errorMsg && (
          <ErrorScreen message={errorMsg} onRetry={goHome} />
        )}
        {screen === "history" && (
          <HistoryScreen
            recents={recents}
            onOpen={(entry) => {
              // Open the cached report (the original PDF is not retained).
              if (entry && entry.session) {
                setSession(entry.session);
                setScreen("results");
                setNavActive("dashboard");
              }
            }}
            onUpload={goHome}
          />
        )}
        {screen === "rules" && (
          <CourtRulesScreen />
        )}
        {screen === "help" && (
          <HelpScreen onHome={goHome} />
        )}
      </main>

      {screen === "analysing" && session && (
        <AnalysingOverlay file={session.file} defects={liveDefects} progress={liveProgress} />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <TweaksPanel>
        <TweakSection label="Layout" />
        <TweakToggle
          label="Show sidebar"
          value={t.showSidebar}
          onChange={(v) => setTweak("showSidebar", v)}
        />
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
