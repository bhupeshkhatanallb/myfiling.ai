// AuthScreen.jsx — login / signup gate. Shown before the app when logged out.

const { useState: useStateAuth } = React;

// --- auth API helpers (cookie-based sessions) -------------------------------
async function apiMe() {
  try {
    const res = await fetch("/api/auth/me", { credentials: "same-origin" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (_) {
    return null;
  }
}

async function apiAuth(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  let data = {};
  try { data = await res.json(); } catch (_) {}
  if (!res.ok) {
    const detail = data && data.detail ? data.detail : {};
    throw new Error(detail.details || detail.title || "Something went wrong. Please try again.");
  }
  return data.user || null;
}

async function apiLogout() {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
  } catch (_) {}
}

function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useStateAuth("login");   // "login" | "signup"
  const [name, setName] = useStateAuth("");
  const [email, setEmail] = useStateAuth("");
  const [password, setPassword] = useStateAuth("");
  const [busy, setBusy] = useStateAuth(false);
  const [err, setErr] = useStateAuth(null);

  const isSignup = mode === "signup";

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (!email.trim() || !password) {
      setErr("Please enter your email and password.");
      return;
    }
    if (isSignup && password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      const path = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const body = isSignup
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };
      const user = await apiAuth(path, body);
      onAuthed(user);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__brand">
          <span className="auth__logo">myfiling<span className="auth__logo-dot">.ai</span></span>
          <p className="auth__tagline">Catch filing defects before submission.</p>
        </div>

        <div className="auth__tabs">
          <button
            className={"auth__tab" + (!isSignup ? " auth__tab--active" : "")}
            onClick={() => { setMode("login"); setErr(null); }}
            type="button"
          >Log in</button>
          <button
            className={"auth__tab" + (isSignup ? " auth__tab--active" : "")}
            onClick={() => { setMode("signup"); setErr(null); }}
            type="button"
          >Sign up</button>
        </div>

        <form className="auth__form" onSubmit={submit}>
          {isSignup && (
            <label className="auth__field">
              <span>Name <em>(optional)</em></span>
              <input
                type="text" value={name} autoComplete="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </label>
          )}
          <label className="auth__field">
            <span>Email</span>
            <input
              type="email" value={email} autoComplete="email" required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="auth__field">
            <span>Password</span>
            <input
              type="password" value={password} required
              autoComplete={isSignup ? "new-password" : "current-password"}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? "At least 6 characters" : "Your password"}
            />
          </label>

          {err && <div className="auth__error">{err}</div>}

          <button className="auth__submit" type="submit" disabled={busy}>
            {busy ? "Please wait…" : (isSignup ? "Create account" : "Log in")}
          </button>
        </form>

        <p className="auth__switch">
          {isSignup ? "Already have an account? " : "New here? "}
          <button
            type="button" className="auth__link"
            onClick={() => { setMode(isSignup ? "login" : "signup"); setErr(null); }}
          >
            {isSignup ? "Log in" : "Create a free account"}
          </button>
        </p>
      </div>
    </div>
  );
}

window.AuthScreen = AuthScreen;
window.apiMe = apiMe;
window.apiLogout = apiLogout;
