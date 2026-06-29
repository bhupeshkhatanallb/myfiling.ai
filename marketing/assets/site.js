/* ========================================================================== *
 * myfiling.ai - marketing site behaviour (vanilla JS, no dependencies).
 *
 * Responsibilities:
 *   - Mobile nav toggle
 *   - FAQ accordion
 *   - Hero upload widget (pick a PDF -> "Analyze" -> login gate -> /dashboard)
 *   - Auth: login/signup modal + the /login & /register pages reuse the same
 *     backend session API the dashboard uses (/api/auth/*).
 *   - File handoff: the picked PDF is stashed in sessionStorage so the dashboard
 *     can pre-fill its upload screen after a successful login.
 * ========================================================================== */
(function () {
  "use strict";

  var HANDOFF_KEY = "myfiling.pendingUpload";

  /* ---------- helpers ----------------------------------------------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () {
        // result is a data URL: "data:application/pdf;base64,XXXX"
        var s = String(r.result || "");
        var comma = s.indexOf(",");
        resolve(comma >= 0 ? s.slice(comma + 1) : s);
      };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  // Persist the chosen file (best-effort). sessionStorage caps ~5MB in most
  // browsers, so only stash the bytes when small enough; otherwise keep just the
  // metadata and the dashboard will ask the user to re-pick. Either way the
  // user lands on the upload screen with context.
  function stashPendingUpload(file) {
    var meta = { name: file.name, size: file.size, court: "dhc", caseType: "wp" };
    var SMALL = 4 * 1024 * 1024; // 4 MB ceiling for inlining bytes
    if (file.size <= SMALL) {
      return fileToBase64(file).then(function (b64) {
        meta.dataB64 = b64;
        try { sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(meta)); } catch (e) {
          delete meta.dataB64;
          try { sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(meta)); } catch (e2) {}
        }
      }).catch(function () {
        try { sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(meta)); } catch (e) {}
      });
    }
    try { sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(meta)); } catch (e) {}
    return Promise.resolve();
  }

  function authApi(path, body) {
    return fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) {
          var d = (data && data.detail) || {};
          throw new Error(d.details || d.title || "Something went wrong. Please try again.");
        }
        return (data && data.user) || null;
      });
    });
  }

  function goToDashboard(withPending) {
    window.location.href = withPending ? "/dashboard/?pending=1" : "/dashboard/";
  }

  /* ---------- mobile nav -------------------------------------------------- */
  function initNav() {
    var toggle = $(".nav__toggle");
    var menu = $(".nav__mobile");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () { menu.classList.toggle("open"); });
  }

  /* ---------- FAQ accordion ----------------------------------------------- */
  function initFaq() {
    $all(".faq__q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq__item");
        if (item) item.classList.toggle("open");
      });
    });
  }

  /* ---------- login / signup modal ---------------------------------------- */
  // The modal is created on demand and reused. `onSuccess` fires after a
  // successful login or signup.
  var modalEl = null;

  function openAuthModal(opts) {
    opts = opts || {};
    var startMode = opts.mode || "login";
    var hint = opts.hint;
    var onSuccess = opts.onSuccess || function () {};

    if (modalEl) modalEl.remove();

    var backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true">' +
        '<button class="modal__close" aria-label="Close">&times;</button>' +
        (hint ? '<div class="modal__hint">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>' +
          '<span>' + hint + '</span></div>' : "") +
        '<div class="modal__tabs">' +
          '<button class="modal__tab" data-mode="login">Log in</button>' +
          '<button class="modal__tab" data-mode="signup">Sign up</button>' +
        '</div>' +
        '<form class="modal__form">' +
          '<div class="field js-name" style="display:none">' +
            '<label>Name <em style="color:var(--ink-400);font-style:normal">(optional)</em></label>' +
            '<input type="text" name="name" autocomplete="name" placeholder="Your name" />' +
          '</div>' +
          '<div class="field"><label>Email</label>' +
            '<input type="email" name="email" autocomplete="email" required placeholder="you@example.com" /></div>' +
          '<div class="field"><label>Password</label>' +
            '<input type="password" name="password" required placeholder="Your password" /></div>' +
          '<div class="formerror" style="display:none"></div>' +
          '<button type="submit" class="btn btn--primary btn--block btn--lg js-submit">Log in</button>' +
        '</form>' +
      '</div>';
    document.body.appendChild(backdrop);
    modalEl = backdrop;

    var form = $(".modal__form", backdrop);
    var nameField = $(".js-name", backdrop);
    var errBox = $(".formerror", backdrop);
    var submitBtn = $(".js-submit", backdrop);
    var tabs = $all(".modal__tab", backdrop);
    var mode = startMode;

    function applyMode() {
      tabs.forEach(function (t) { t.classList.toggle("active", t.dataset.mode === mode); });
      nameField.style.display = mode === "signup" ? "" : "none";
      submitBtn.textContent = mode === "signup" ? "Create account" : "Log in";
      $("input[name=password]", backdrop).setAttribute(
        "autocomplete", mode === "signup" ? "new-password" : "current-password");
      errBox.style.display = "none";
    }
    applyMode();

    tabs.forEach(function (t) {
      t.addEventListener("click", function () { mode = t.dataset.mode; applyMode(); });
    });

    function close() { backdrop.remove(); modalEl = null; }
    $(".modal__close", backdrop).addEventListener("click", close);
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) close(); });
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc); }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      errBox.style.display = "none";
      var email = form.email.value.trim();
      var password = form.password.value;
      if (!email || !password) { showErr("Please enter your email and password."); return; }
      if (mode === "signup" && password.length < 6) { showErr("Password must be at least 6 characters."); return; }
      submitBtn.disabled = true; submitBtn.textContent = "Please wait…";
      var path = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      var body = mode === "signup"
        ? { name: form.name.value.trim(), email: email, password: password }
        : { email: email, password: password };
      authApi(path, body).then(function (user) {
        close();
        onSuccess(user);
      }).catch(function (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = mode === "signup" ? "Create account" : "Log in";
        showErr(err.message);
      });
    });

    function showErr(msg) { errBox.textContent = msg; errBox.style.display = "block"; }

    setTimeout(function () { var f = $("input[name=email]", backdrop); if (f) f.focus(); }, 60);
  }
  // expose so inline page buttons can call it
  window.openAuthModal = openAuthModal;

  /* ---------- hero upload widget ------------------------------------------ */
  function initHeroWidget() {
    var zone = $("#heroDropzone");
    if (!zone) return;
    var input = $("#heroFileInput");
    var analyzeBtn = $("#heroAnalyze");
    var picked = null;

    function render() {
      if (picked) {
        zone.classList.add("has-file");
        zone.innerHTML =
          '<div class="dropzone__icon">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</div>' +
          '<div class="dropzone__title">Ready to analyze</div>' +
          '<div class="filechip">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
            '<span>' + escapeHtml(picked.name) + '</span>' +
            '<button type="button" id="heroClear" aria-label="Remove">&times;</button>' +
          '</div>';
        var clr = $("#heroClear");
        if (clr) clr.addEventListener("click", function (e) { e.stopPropagation(); picked = null; render(); });
      } else {
        zone.classList.remove("has-file");
        zone.innerHTML =
          '<div class="dropzone__icon">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
          '</div>' +
          '<div class="dropzone__title">Select PDF or <span class="dropzone__browse">browse</span></div>' +
          '<div class="dropzone__sub">Cover page, index, body and annexures - one PDF.</div>';
      }
    }

    function pick(f) {
      if (!f) return;
      if (!/\.pdf$/i.test(f.name)) { alert("Please choose a PDF file."); return; }
      picked = f; render();
    }

    zone.addEventListener("click", function () { if (!picked) input.click(); });
    input.addEventListener("change", function () { pick(input.files && input.files[0]); });
    zone.addEventListener("dragover", function (e) { e.preventDefault(); zone.classList.add("drag"); });
    zone.addEventListener("dragleave", function () { zone.classList.remove("drag"); });
    zone.addEventListener("drop", function (e) {
      e.preventDefault(); zone.classList.remove("drag");
      pick(e.dataTransfer.files && e.dataTransfer.files[0]);
    });

    analyzeBtn.addEventListener("click", function () {
      if (!picked) {
        // nudge the user to choose a file first
        input.click();
        return;
      }
      analyzeBtn.disabled = true;
      stashPendingUpload(picked).then(function () {
        // Already logged in? Skip the gate and go straight in.
        fetch("/api/auth/me", { credentials: "same-origin" })
          .then(function (r) { return r.json(); }).catch(function () { return {}; })
          .then(function (data) {
            analyzeBtn.disabled = false;
            if (data && data.user) { goToDashboard(true); return; }
            openAuthModal({
              mode: "signup",
              hint: "Create a free account to run your analysis - it takes seconds.",
              onSuccess: function () { goToDashboard(true); },
            });
          });
      });
    });

    render();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- standalone /login & /register pages ------------------------- */
  function initAuthPage() {
    var form = $("#authPageForm");
    if (!form) return;
    var mode = form.dataset.mode || "login"; // "login" | "signup"
    var errBox = $("#authPageError", form);
    var submitBtn = $("#authPageSubmit", form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (errBox) errBox.style.display = "none";
      var email = form.email.value.trim();
      var password = form.password.value;
      if (!email || !password) { showErr("Please enter your email and password."); return; }
      if (mode === "signup" && password.length < 6) { showErr("Password must be at least 6 characters."); return; }
      submitBtn.disabled = true; var orig = submitBtn.textContent; submitBtn.textContent = "Please wait…";
      var path = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      var body = mode === "signup"
        ? { name: (form.name ? form.name.value.trim() : ""), email: email, password: password }
        : { email: email, password: password };
      authApi(path, body).then(function () {
        // honour a ?next= redirect; default to the dashboard.
        var next = new URLSearchParams(window.location.search).get("next");
        window.location.href = next || "/dashboard/";
      }).catch(function (err) {
        submitBtn.disabled = false; submitBtn.textContent = orig;
        showErr(err.message);
      });
    });

    function showErr(msg) { if (errBox) { errBox.textContent = msg; errBox.style.display = "block"; } }
  }

  /* ---------- contact form (demo, no backend) ----------------------------- */
  function initContactForm() {
    var form = $("#contactForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = $("#contactOk", form);
      if (ok) ok.style.display = "block";
      form.reset();
    });
  }

  /* ---------- boot -------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initFaq();
    initHeroWidget();
    initAuthPage();
    initContactForm();

    // "Get Started" / "Start Free Analysis" generic buttons open the modal.
    $all("[data-auth]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openAuthModal({
          mode: btn.getAttribute("data-auth") || "signup",
          onSuccess: function () { goToDashboard(false); },
        });
      });
    });
  });
})();
