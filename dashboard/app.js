"use strict";

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _toArray(r) { return _arrayWithHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableRest(); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
// AUTO-GENERATED: Do not edit - run "npm run build" to regenerate

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling - build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

var __TWEAKS_STYLE = "\n  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;\n    max-height:calc(100vh - 32px);display:flex;flex-direction:column;\n    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;\n    background:rgba(250,249,247,.78);color:#29261b;\n    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);\n    border:.5px solid rgba(255,255,255,.6);border-radius:14px;\n    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);\n    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}\n  .twk-hd{display:flex;align-items:center;justify-content:space-between;\n    padding:10px 8px 10px 14px;cursor:move;user-select:none}\n  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}\n  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);\n    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}\n  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}\n  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;\n    overflow-y:auto;overflow-x:hidden;min-height:0;\n    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}\n  .twk-body::-webkit-scrollbar{width:8px}\n  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}\n  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;\n    border:2px solid transparent;background-clip:content-box}\n  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);\n    border:2px solid transparent;background-clip:content-box}\n  .twk-row{display:flex;flex-direction:column;gap:5px}\n  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}\n  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;\n    color:rgba(41,38,27,.72)}\n  .twk-lbl>span:first-child{font-weight:500}\n  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}\n\n  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;\n    color:rgba(41,38,27,.45);padding:10px 0 0}\n  .twk-sect:first-child{padding-top:0}\n\n  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;\n    border:.5px solid rgba(0,0,0,.1);border-radius:7px;\n    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}\n  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}\n  select.twk-field{padding-right:22px;\n    background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>\");\n    background-repeat:no-repeat;background-position:right 8px center}\n\n  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;\n    border-radius:999px;background:rgba(0,0,0,.12);outline:none}\n  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;\n    width:14px;height:14px;border-radius:50%;background:#fff;\n    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}\n  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;\n    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}\n\n  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;\n    background:rgba(0,0,0,.06);user-select:none}\n  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;\n    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);\n    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}\n  .twk-seg.dragging .twk-seg-thumb{transition:none}\n  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;\n    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;\n    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;\n    overflow-wrap:anywhere}\n\n  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;\n    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}\n  .twk-toggle[data-on=\"1\"]{background:#34c759}\n  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;\n    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}\n  .twk-toggle[data-on=\"1\"] i{transform:translateX(14px)}\n\n  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;\n    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}\n  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;\n    user-select:none;padding-right:8px}\n  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;\n    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;\n    outline:none;color:inherit;-moz-appearance:textfield}\n  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{\n    -webkit-appearance:none;margin:0}\n  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}\n\n  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;\n    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}\n  .twk-btn:hover{background:rgba(0,0,0,.88)}\n  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}\n  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}\n\n  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;\n    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;\n    background:transparent;flex-shrink:0}\n  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}\n  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}\n  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}\n\n  .twk-chips{display:flex;gap:6px}\n  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;\n    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;\n    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);\n    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}\n  .twk-chip:hover{transform:translateY(-1px);\n    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}\n  .twk-chip[data-on=\"1\"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),\n    0 2px 6px rgba(0,0,0,.15)}\n  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;\n    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}\n  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}\n  .twk-chip>span>i:first-child{box-shadow:none}\n  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;\n    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}\n";

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  var _React$useState = React.useState(defaults),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    values = _React$useState2[0],
    setValues = _React$useState2[1];
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  var setTweak = React.useCallback(function (keyOrEdits, val) {
    var edits = _typeof(keyOrEdits) === 'object' && keyOrEdits !== null ? keyOrEdits : _defineProperty({}, keyOrEdits, val);
    setValues(function (prev) {
      return _objectSpread(_objectSpread({}, prev), edits);
    });
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits: edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react - the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability - if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel(_ref2) {
  var _ref2$title = _ref2.title,
    title = _ref2$title === void 0 ? 'Tweaks' : _ref2$title,
    children = _ref2.children;
  var _React$useState3 = React.useState(false),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    open = _React$useState4[0],
    setOpen = _React$useState4[1];
  var dragRef = React.useRef(null);
  var offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  var PAD = 16;
  var clampToViewport = React.useCallback(function () {
    var panel = dragRef.current;
    if (!panel) return;
    var w = panel.offsetWidth,
      h = panel.offsetHeight;
    var maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    var maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(function () {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return function () {
        return window.removeEventListener('resize', clampToViewport);
      };
    }
    var ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return function () {
      return ro.disconnect();
    };
  }, [open, clampToViewport]);
  React.useEffect(function () {
    var onMsg = function onMsg(e) {
      var _e$data;
      var t = e === null || e === void 0 || (_e$data = e.data) === null || _e$data === void 0 ? void 0 : _e$data.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return function () {
      return window.removeEventListener('message', onMsg);
    };
  }, []);
  var dismiss = function dismiss() {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  var onDragStart = function onDragStart(e) {
    var panel = dragRef.current;
    if (!panel) return;
    var r = panel.getBoundingClientRect();
    var sx = e.clientX,
      sy = e.clientY;
    var startRight = window.innerWidth - r.right;
    var startBottom = window.innerHeight - r.bottom;
    var move = function move(ev) {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    var _up = function up() {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', _up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', _up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-omelette-chrome": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: function onMouseDown(e) {
      return e.stopPropagation();
    },
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection(_ref3) {
  var label = _ref3.label,
    children = _ref3.children;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow(_ref4) {
  var label = _ref4.label,
    value = _ref4.value,
    children = _ref4.children,
    _ref4$inline = _ref4.inline,
    inline = _ref4$inline === void 0 ? false : _ref4$inline;
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider(_ref5) {
  var label = _ref5.label,
    value = _ref5.value,
    _ref5$min = _ref5.min,
    min = _ref5$min === void 0 ? 0 : _ref5$min,
    _ref5$max = _ref5.max,
    max = _ref5$max === void 0 ? 100 : _ref5$max,
    _ref5$step = _ref5.step,
    step = _ref5$step === void 0 ? 1 : _ref5$step,
    _ref5$unit = _ref5.unit,
    unit = _ref5$unit === void 0 ? '' : _ref5$unit,
    _onChange = _ref5.onChange;
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: "".concat(value).concat(unit)
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: function onChange(e) {
      return _onChange(Number(e.target.value));
    }
  }));
}
function TweakToggle(_ref6) {
  var label = _ref6.label,
    value = _ref6.value,
    onChange = _ref6.onChange;
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: function onClick() {
      return onChange(!value);
    }
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio(_ref7) {
  var _$3$options$length;
  var label = _ref7.label,
    value = _ref7.value,
    options = _ref7.options,
    _onChange2 = _ref7.onChange;
  var trackRef = React.useRef(null);
  var _React$useState5 = React.useState(false),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    dragging = _React$useState6[0],
    setDragging = _React$useState6[1];
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag - ref it so a stale closure doesn't fire onChange for every move.
  var valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char - so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  var labelLen = function labelLen(o) {
    return String(_typeof(o) === 'object' ? o.label : o).length;
  };
  var maxLen = options.reduce(function (m, o) {
    return Math.max(m, labelLen(o));
  }, 0);
  var fitsAsSegments = maxLen <= ((_$3$options$length = {
    2: 16,
    3: 10
  }[options.length]) !== null && _$3$options$length !== void 0 ? _$3$options$length : 0);
  if (!fitsAsSegments) {
    // <select> emits strings - map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    var resolve = function resolve(s) {
      var m = options.find(function (o) {
        return String(_typeof(o) === 'object' ? o.value : o) === s;
      });
      return m === undefined ? s : _typeof(m) === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: function onChange(s) {
        return _onChange2(resolve(s));
      }
    });
  }
  var opts = options.map(function (o) {
    return _typeof(o) === 'object' ? o : {
      value: o,
      label: o
    };
  });
  var idx = Math.max(0, opts.findIndex(function (o) {
    return o.value === value;
  }));
  var n = opts.length;
  var segAt = function segAt(clientX) {
    var r = trackRef.current.getBoundingClientRect();
    var inner = r.width - 4;
    var i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  var onPointerDown = function onPointerDown(e) {
    setDragging(true);
    var v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) _onChange2(v0);
    var move = function move(ev) {
      if (!trackRef.current) return;
      var v = segAt(ev.clientX);
      if (v !== valueRef.current) _onChange2(v);
    };
    var _up2 = function up() {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', _up2);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', _up2);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: "calc(2px + ".concat(idx, " * (100% - 4px) / ").concat(n, ")"),
      width: "calc((100% - 4px) / ".concat(n, ")")
    }
  }), opts.map(function (o) {
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      type: "button",
      role: "radio",
      "aria-checked": o.value === value
    }, o.label);
  })));
}
function TweakSelect(_ref8) {
  var label = _ref8.label,
    value = _ref8.value,
    options = _ref8.options,
    _onChange3 = _ref8.onChange;
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: function onChange(e) {
      return _onChange3(e.target.value);
    }
  }, options.map(function (o) {
    var v = _typeof(o) === 'object' ? o.value : o;
    var l = _typeof(o) === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText(_ref9) {
  var label = _ref9.label,
    value = _ref9.value,
    placeholder = _ref9.placeholder,
    _onChange4 = _ref9.onChange;
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: function onChange(e) {
      return _onChange4(e.target.value);
    }
  }));
}
function TweakNumber(_ref0) {
  var label = _ref0.label,
    value = _ref0.value,
    min = _ref0.min,
    max = _ref0.max,
    _ref0$step = _ref0.step,
    step = _ref0$step === void 0 ? 1 : _ref0$step,
    _ref0$unit = _ref0.unit,
    unit = _ref0$unit === void 0 ? '' : _ref0$unit,
    _onChange5 = _ref0.onChange;
  var clamp = function clamp(n) {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  var startRef = React.useRef({
    x: 0,
    val: 0
  });
  var onScrubStart = function onScrubStart(e) {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    var decimals = (String(step).split('.')[1] || '').length;
    var move = function move(ev) {
      var dx = ev.clientX - startRef.current.x;
      var raw = startRef.current.val + dx * step;
      var snapped = Math.round(raw / step) * step;
      _onChange5(clamp(Number(snapped.toFixed(decimals))));
    };
    var _up3 = function up() {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', _up3);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', _up3);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: function onChange(e) {
      return _onChange5(clamp(Number(e.target.value)));
    }
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick - checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  var h = String(hex).replace('#', '');
  var x = h.length === 3 ? h.replace(/./g, function (c) {
    return c + c;
  }) : h.padEnd(6, '0');
  var n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  var r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
var __TwkCheck = function __TwkCheck(_ref1) {
  var light = _ref1.light;
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 14 14",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 7.2 5.8 10 11 4.2",
    fill: "none",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
  }));
};

// TweakColor - curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts - a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor(_ref10) {
  var label = _ref10.label,
    value = _ref10.value,
    options = _ref10.options,
    _onChange6 = _ref10.onChange;
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: function onChange(e) {
        return _onChange6(e.target.value);
      }
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  var key = function key(o) {
    return String(JSON.stringify(o)).toLowerCase();
  };
  var cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map(function (o, i) {
    var colors = Array.isArray(o) ? o : [o];
    var _colors = _toArray(colors),
      hero = _colors[0],
      rest = _arrayLikeToArray(_colors).slice(1);
    var sup = rest.slice(0, 4);
    var on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: function onClick() {
        return _onChange6(o);
      }
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map(function (c, j) {
      return /*#__PURE__*/React.createElement("i", {
        key: j,
        style: {
          background: c
        }
      });
    })), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton(_ref11) {
  var label = _ref11.label,
    onClick = _ref11.onClick,
    _ref11$secondary = _ref11.secondary,
    secondary = _ref11$secondary === void 0 ? false : _ref11$secondary;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks: useTweaks,
  TweaksPanel: TweaksPanel,
  TweakSection: TweakSection,
  TweakRow: TweakRow,
  TweakSlider: TweakSlider,
  TweakToggle: TweakToggle,
  TweakRadio: TweakRadio,
  TweakSelect: TweakSelect,
  TweakText: TweakText,
  TweakNumber: TweakNumber,
  TweakColor: TweakColor,
  TweakButton: TweakButton
});

// icons.jsx - small inline SVG icons shared across the app

var Ico = {
  Upload: function Upload(p) {
    return /*#__PURE__*/React.createElement("svg", _extends({
      width: p.size || 24,
      height: p.size || 24,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, p), /*#__PURE__*/React.createElement("path", {
      d: "M12 16V4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m6 10 6-6 6 6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
    }));
  },
  FilePdf: function FilePdf(p) {
    return /*#__PURE__*/React.createElement("svg", _extends({
      width: p.size || 16,
      height: p.size || 16,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, p), /*#__PURE__*/React.createElement("path", {
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 2v6h6"
    }));
  },
  Check: function Check(p) {
    return /*#__PURE__*/React.createElement("svg", _extends({
      width: p.size || 16,
      height: p.size || 16,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.4",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, p), /*#__PURE__*/React.createElement("path", {
      d: "m5 12 4 4L19 6"
    }));
  },
  X: function X(p) {
    return /*#__PURE__*/React.createElement("svg", _extends({
      width: p.size || 14,
      height: p.size || 14,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, p), /*#__PURE__*/React.createElement("path", {
      d: "M18 6 6 18M6 6l12 12"
    }));
  },
  Search: function Search(p) {
    return /*#__PURE__*/React.createElement("svg", _extends({
      width: p.size || 14,
      height: p.size || 14,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, p), /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m20 20-3.5-3.5"
    }));
  },
  ChevronDown: function ChevronDown(p) {
    return /*#__PURE__*/React.createElement("svg", _extends({
      width: p.size || 16,
      height: p.size || 16,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, p), /*#__PURE__*/React.createElement("path", {
      d: "m6 9 6 6 6-6"
    }));
  },
  Alert: function Alert(p) {
    return /*#__PURE__*/React.createElement("svg", _extends({
      width: p.size || 24,
      height: p.size || 24,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, p), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 8v4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 16h.01"
    }));
  },
  Download: function Download(p) {
    return /*#__PURE__*/React.createElement("svg", _extends({
      width: p.size || 16,
      height: p.size || 16,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, p), /*#__PURE__*/React.createElement("path", {
      d: "M12 4v12"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m18 10-6 6-6-6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M4 20h16"
    }));
  },
  History: function History(p) {
    return /*#__PURE__*/React.createElement("svg", _extends({
      width: p.size || 16,
      height: p.size || 16,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, p), /*#__PURE__*/React.createElement("path", {
      d: "M3 12a9 9 0 1 0 3-6.7L3 8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 3v5h5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 7v5l3 2"
    }));
  },
  Book: function Book(p) {
    return /*#__PURE__*/React.createElement("svg", _extends({
      width: p.size || 16,
      height: p.size || 16,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, p), /*#__PURE__*/React.createElement("path", {
      d: "M4 4h11a3 3 0 0 1 3 3v14H7a3 3 0 0 1-3-3z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M4 18a3 3 0 0 1 3-3h11"
    }));
  },
  Plus: function Plus(p) {
    return /*#__PURE__*/React.createElement("svg", _extends({
      width: p.size || 14,
      height: p.size || 14,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, p), /*#__PURE__*/React.createElement("path", {
      d: "M12 5v14M5 12h14"
    }));
  },
  ArrowLeft: function ArrowLeft(p) {
    return /*#__PURE__*/React.createElement("svg", _extends({
      width: p.size || 14,
      height: p.size || 14,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, p), /*#__PURE__*/React.createElement("path", {
      d: "M19 12H5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m12 19-7-7 7-7"
    }));
  },
  Spark: function Spark(p) {
    return /*#__PURE__*/React.createElement("svg", _extends({
      width: p.size || 14,
      height: p.size || 14,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, p), /*#__PURE__*/React.createElement("path", {
      d: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
    }));
  },
  MessageSquare: function MessageSquare(p) {
    return /*#__PURE__*/React.createElement("svg", _extends({
      width: p.size || 14,
      height: p.size || 14,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, p), /*#__PURE__*/React.createElement("path", {
      d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
    }));
  }
};
window.Ico = Ico;

// gauge.jsx - Arc / semicircle gauge with dynamic color band

function Gauge(_ref12) {
  var _ref12$score = _ref12.score,
    score = _ref12$score === void 0 ? 0 : _ref12$score,
    _ref12$animate = _ref12.animate,
    animate = _ref12$animate === void 0 ? true : _ref12$animate;
  // Determine band based on score (reframed per advocate audit - no "safe to
  // file" guarantee; reflects formatting + filing-requirement readiness).
  var band = score >= 75 ? {
    color: "#119366",
    label: "Likely registry-ready",
    soft: "#D8F0E6"
  } : score >= 45 ? {
    color: "#C2790B",
    label: "Fix issues before filing",
    soft: "#FBEFD7"
  } : {
    color: "#D6293E",
    label: "Not ready - must fix",
    soft: "#FBDCE0"
  };

  // SVG arc geometry - semicircle. viewBox snugly fits arc + stroke + end-cap.
  var R = 100;
  var STROKE = 16;
  var CAP_R = STROKE / 2 + 3; // end-cap circle radius
  var PAD = CAP_R + 2; // padding on all sides for cap + stroke
  var CX = R + PAD; // center x
  var CY = R + PAD; // center y (baseline of arc)
  var W = 2 * R + 2 * PAD; // viewBox width
  var H = R + 2 * PAD; // viewBox height - just enough for top half + cap

  // Parametrize position on the top semicircle by t in [0, 1].
  // t=0 → west endpoint, t=0.5 → top, t=1 → east endpoint.
  var t = Math.max(0, Math.min(100, score)) / 100;
  var theta = Math.PI * (1 - t); // 180° at t=0, 0° at t=1
  var endX = CX + R * Math.cos(theta);
  var endY = CY - R * Math.sin(theta); // -sin so the arc is above center

  // Both arcs are ≤ 180° (top semicircle only), so large-arc-flag is always 0.
  // sweep-flag=1 draws clockwise visually, which traces the top semicircle.
  var bgPath = "M ".concat(CX - R, " ").concat(CY, " A ").concat(R, " ").concat(R, " 0 0 1 ").concat(CX + R, " ").concat(CY);
  var fgPath = "M ".concat(CX - R, " ").concat(CY, " A ").concat(R, " ").concat(R, " 0 0 1 ").concat(endX, " ").concat(endY);

  // Tick marks at 40 & 70 (band boundaries)
  var tick = function tick(val) {
    var tv = val / 100;
    var a = Math.PI * (1 - tv);
    var r1 = R - STROKE / 2 - 4;
    var r2 = R + STROKE / 2 + 4;
    return {
      x1: CX + r1 * Math.cos(a),
      y1: CY - r1 * Math.sin(a),
      x2: CX + r2 * Math.cos(a),
      y2: CY - r2 * Math.sin(a)
    };
  };
  var t40 = tick(40),
    t70 = tick(70);

  // Pointer end cap on the arc itself
  var ptr = {
    x: endX,
    y: endY
  };
  var displayed = Math.round(score);
  return /*#__PURE__*/React.createElement("div", {
    className: "gauge"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gauge__svg-wrap"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 ".concat(W, " ").concat(H),
    width: "100%",
    preserveAspectRatio: "xMidYMid meet"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "gauge-fg",
    x1: "0",
    x2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: band.color,
    stopOpacity: "0.85"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: band.color,
    stopOpacity: "1"
  }))), /*#__PURE__*/React.createElement("path", {
    d: bgPath,
    stroke: "#ECECF5",
    strokeWidth: STROKE,
    fill: "none",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("line", _extends({}, t40, {
    stroke: "#C5CCDA",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React.createElement("line", _extends({}, t70, {
    stroke: "#C5CCDA",
    strokeWidth: "1.5"
  })), /*#__PURE__*/React.createElement("path", {
    d: fgPath,
    stroke: "url(#gauge-fg)",
    strokeWidth: STROKE,
    fill: "none",
    strokeLinecap: "round",
    style: {
      transition: animate ? "stroke 600ms ease, d 600ms ease" : "none"
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: ptr.x,
    cy: ptr.y,
    r: STROKE / 2 + 3,
    fill: "#fff",
    stroke: band.color,
    strokeWidth: "3",
    style: {
      transition: animate ? "all 600ms ease" : "none"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "gauge__center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gauge__num"
  }, displayed, /*#__PURE__*/React.createElement("span", {
    className: "gauge__num-percent"
  }, "%")))), /*#__PURE__*/React.createElement("div", {
    className: "gauge__ticks"
  }, /*#__PURE__*/React.createElement("span", null, "0"), /*#__PURE__*/React.createElement("span", null, "45 \xB7 75"), /*#__PURE__*/React.createElement("span", null, "100")), /*#__PURE__*/React.createElement("div", {
    className: "gauge__caption"
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: band.color
    }
  }, band.label), "Filing Readiness Score"));
}
window.Gauge = Gauge;

// Header + Sidebar navigation
var _React = React,
  useState = _React.useState;
function _userInitials(user) {
  if (!user) return "?";
  var src = user.name && user.name.trim() || user.email || "";
  var parts = src.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (src.slice(0, 2) || "?").toUpperCase();
}
function Header(_ref) {
  var screen = _ref.screen,
    onHome = _ref.onHome,
    navActive = _ref.navActive,
    onNavClick = _ref.onNavClick,
    user = _ref.user,
    onLogout = _ref.onLogout;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    menuOpen = _useState2[0],
    setMenuOpen = _useState2[1];
  var items = [{
    label: "Dashboard",
    key: "dashboard"
  }, {
    label: "History",
    key: "history"
  }, {
    label: "Court Rules",
    key: "rules"
  }, {
    label: "Help",
    key: "help"
  }];
  var displayName = user ? user.name && user.name.trim() || user.email : "";
  return /*#__PURE__*/React.createElement("header", {
    className: "header"
  }, /*#__PURE__*/React.createElement("button", {
    className: "header__logo",
    onClick: onHome
  }, /*#__PURE__*/React.createElement("span", {
    className: "header__logo-mark"
  }, "M"), "myfiling.ai"), /*#__PURE__*/React.createElement("nav", {
    className: "header__nav"
  }, items.map(function (item) {
    return /*#__PURE__*/React.createElement("button", {
      key: item.key,
      className: "header__nav-item" + (navActive === item.key ? " header__nav-item--active" : ""),
      onClick: function onClick() {
        return onNavClick(item.key);
      }
    }, item.label);
  })), /*#__PURE__*/React.createElement("div", {
    className: "header__right"
  }, /*#__PURE__*/React.createElement("div", {
    className: "header__search"
  }, /*#__PURE__*/React.createElement(Ico.Search, null), /*#__PURE__*/React.createElement("input", {
    placeholder: "Search filings, rules, defects\u2026"
  }), /*#__PURE__*/React.createElement("span", {
    className: "header__kbd"
  }, "\u2318K")), /*#__PURE__*/React.createElement("div", {
    className: "header__user"
  }, /*#__PURE__*/React.createElement("button", {
    className: "header__avatar",
    title: displayName,
    onClick: function onClick() {
      return setMenuOpen(function (v) {
        return !v;
      });
    }
  }, _userInitials(user)), menuOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "header__menu-backdrop",
    onClick: function onClick() {
      return setMenuOpen(false);
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "header__menu"
  }, /*#__PURE__*/React.createElement("div", {
    className: "header__menu-name"
  }, displayName), user && user.email && /*#__PURE__*/React.createElement("div", {
    className: "header__menu-sub"
  }, user.email), /*#__PURE__*/React.createElement("button", {
    className: "header__menu-item",
    onClick: function onClick() {
      setMenuOpen(false);
      onLogout && onLogout();
    }
  }, "Log out"))))));
}
function Sidebar(_ref13) {
  var recents = _ref13.recents,
    onOpenRecent = _ref13.onOpenRecent,
    onCourtRuleClick = _ref13.onCourtRuleClick;
  var _window$FC_DATA = window.FC_DATA,
    RECENT = _window$FC_DATA.RECENT,
    COURT_RULES = _window$FC_DATA.COURT_RULES,
    COURTS = _window$FC_DATA.COURTS,
    CASE_TYPES = _window$FC_DATA.CASE_TYPES;
  // Prefer the live, persisted recents passed from App; fall back to any static
  // seed data only if no prop is provided.
  var recentList = recents && recents.length ? recents : recents ? [] : RECENT;
  return /*#__PURE__*/React.createElement("aside", {
    className: "sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sidebar__section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sidebar__label"
  }, "Recent uploads"), /*#__PURE__*/React.createElement("div", {
    className: "sidebar__recents"
  }, recentList.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "sidebar__empty"
  }, "No recent filings") : recentList.map(function (r, i) {
    var band = r.score >= 71 ? "g" : r.score >= 41 ? "a" : "r";
    var when = r.when || relativeWhen(r.createdAt);
    var handleClick = function handleClick() {
      onOpenRecent && onOpenRecent(r);
    };
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "sidebar__item",
      onClick: handleClick,
      style: {
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "sidebar__item-icon"
    }, /*#__PURE__*/React.createElement(Ico.FilePdf, {
      size: 14
    })), /*#__PURE__*/React.createElement("div", {
      className: "sidebar__item-meta"
    }, /*#__PURE__*/React.createElement("span", {
      className: "sidebar__item-title"
    }, r.name), /*#__PURE__*/React.createElement("span", {
      className: "sidebar__item-sub"
    }, r.court, " \xB7 ", when)), /*#__PURE__*/React.createElement("span", {
      className: "sidebar__score sidebar__score--" + band
    }, r.score, "%"));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "sidebar__section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sidebar__label"
  }, "Court rules"), COURT_RULES.map(function (c, i) {
    // Enabled-ness is driven by the COURTS data (match by name) so the
    // sidebar tracks whichever court is live - currently Delhi High Court.
    var isEnabled = !!(COURTS.find(function (ct) {
      return ct.name === c.court;
    }) || {}).enabled;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      className: "sidebar__rule-btn" + (isEnabled ? " sidebar__rule-btn--enabled" : " sidebar__rule-btn--coming-soon"),
      onClick: function onClick() {
        return isEnabled && onCourtRuleClick && onCourtRuleClick(c.court);
      },
      disabled: !isEnabled,
      title: !isEnabled ? "Rules available in next update" : "Click to view rules"
    }, /*#__PURE__*/React.createElement("span", {
      className: "sidebar__rule-name"
    }, c.court), /*#__PURE__*/React.createElement("span", {
      className: "sidebar__rule-meta"
    }, isEnabled ? /*#__PURE__*/React.createElement("span", {
      className: "sidebar__rule-count"
    }, c.count) : /*#__PURE__*/React.createElement("span", {
      className: "sidebar__rule-badge"
    }, "Coming Soon")));
  })), /*#__PURE__*/React.createElement("div", {
    className: "sidebar__section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sidebar__label"
  }, "Shortcuts"), /*#__PURE__*/React.createElement("button", {
    className: "sidebar__shortcut-btn"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Ico.Plus, {
    size: 12
  }), " New filing"), /*#__PURE__*/React.createElement("span", {
    className: "sidebar__shortcut-key"
  }, "N")), /*#__PURE__*/React.createElement("button", {
    className: "sidebar__shortcut-btn"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Ico.History, {
    size: 12
  }), " History"), /*#__PURE__*/React.createElement("span", {
    className: "sidebar__shortcut-key"
  }, "H")), /*#__PURE__*/React.createElement("button", {
    className: "sidebar__shortcut-btn"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Ico.Book, {
    size: 12
  }), " Rule library"), /*#__PURE__*/React.createElement("span", {
    className: "sidebar__shortcut-key"
  }, "R"))));
}
window.Header = Header;
window.Sidebar = Sidebar;
// misc.jsx - Analysing overlay, Error screen, Toast

var _React2 = React,
  useStateM = _React2.useState,
  useEffectM = _React2.useEffect;

// Friendly label for each streamed pipeline stage.
var STAGE_LABELS = {
  "parsing": "Parsing PDF (chunked, single pass)",
  "ocr": "Reading scanned pages (OCR)",
  "parsed": "Extracted text, index & bookmarks",
  "page-detectors": "Running page detectors",
  "conditional-detectors": "Checking section-specific pages",
  "validators": "Validating index & bookmarks"
};
var SEV_META = {
  critical: {
    cls: "live-defect--critical",
    label: "Critical"
  },
  warning: {
    cls: "live-defect--warning",
    label: "Warning"
  },
  minor: {
    cls: "live-defect--minor",
    label: "Minor"
  }
};
function AnalysingOverlay(_ref14) {
  var file = _ref14.file,
    defects = _ref14.defects,
    progress = _ref14.progress;
  // Real-time overlay: the backend STREAMS progress + each defect as it is found
  // (Server-Sent Events). We render defects live and show the current stage. The
  // parent unmounts us when the final `result` frame arrives.
  defects = defects || [];
  var stageLabel = progress ? STAGE_LABELS[progress.stage] || progress.stage : "Starting analysis…";

  // Detail line: detector name during detector stages, page counters during
  // parsing/OCR, summary after parse.
  var detail = null;
  if (progress) {
    if (progress.detector) {
      detail = progress.detector + " (" + progress.page + "/" + progress.total + ")";
    } else if (progress.stage === "parsing" && progress.total) {
      detail = "page " + progress.page + " / " + progress.total;
    } else if (progress.stage === "ocr") {
      detail = "OCR page " + progress.page + " / " + progress.total + (progress.pdf_page ? " (PDF p" + progress.pdf_page + ")" : "");
    } else if (progress.stage === "parsed") {
      detail = progress.total + " pages · " + (progress.index_entries || 0) + " index entries · " + (progress.bookmarks || 0) + " bookmarks" + (progress.ocr_used ? " · OCR" : "");
    }
  }
  var counts = defects.reduce(function (a, d) {
    a[d.severity] = (a[d.severity] || 0) + 1;
    return a;
  }, {});
  return /*#__PURE__*/React.createElement("div", {
    className: "analysing"
  }, /*#__PURE__*/React.createElement("div", {
    className: "analysing__card analysing__card--live"
  }, /*#__PURE__*/React.createElement("div", {
    className: "analysing__title"
  }, /*#__PURE__*/React.createElement("span", {
    className: "analysing__spinner"
  }), " Analysing filing\u2026"), /*#__PURE__*/React.createElement("div", {
    className: "analysing__sub"
  }, file === null || file === void 0 ? void 0 : file.name), /*#__PURE__*/React.createElement("div", {
    className: "analysing__stage"
  }, stageLabel), detail ? /*#__PURE__*/React.createElement("div", {
    className: "analysing__detail"
  }, detail) : null, /*#__PURE__*/React.createElement("div", {
    className: "live-defects__head"
  }, /*#__PURE__*/React.createElement("span", null, "Findings so far"), /*#__PURE__*/React.createElement("span", {
    className: "live-defects__counts"
  }, counts.critical ? /*#__PURE__*/React.createElement("b", {
    className: "c-crit"
  }, counts.critical, " critical") : null, counts.warning ? /*#__PURE__*/React.createElement("b", {
    className: "c-warn"
  }, counts.warning, " warning") : null, counts.minor ? /*#__PURE__*/React.createElement("b", {
    className: "c-minor"
  }, counts.minor, " minor") : null, defects.length === 0 ? /*#__PURE__*/React.createElement("span", {
    className: "c-muted"
  }, "none yet\u2026") : null)), /*#__PURE__*/React.createElement("div", {
    className: "live-defects"
  }, defects.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "live-defects__empty"
  }, "Defects will appear here the moment each detector finds one.") : defects.slice().reverse().map(function (d, i) {
    var meta = SEV_META[d.severity] || SEV_META.minor;
    return /*#__PURE__*/React.createElement("div", {
      key: (d.id || "d") + "-" + i,
      className: "live-defect " + meta.cls
    }, /*#__PURE__*/React.createElement("span", {
      className: "live-defect__sev"
    }, meta.label), /*#__PURE__*/React.createElement("span", {
      className: "live-defect__title"
    }, d.title), /*#__PURE__*/React.createElement("span", {
      className: "live-defect__page"
    }, "p", d.page));
  }))));
}
function ErrorScreen(_ref15) {
  var message = _ref15.message,
    onRetry = _ref15.onRetry;
  return /*#__PURE__*/React.createElement("div", {
    className: "error-state"
  }, /*#__PURE__*/React.createElement("div", {
    className: "error-state__icon"
  }, /*#__PURE__*/React.createElement(Ico.Alert, {
    size: 36
  })), /*#__PURE__*/React.createElement("h2", {
    className: "error-state__title"
  }, message.title), /*#__PURE__*/React.createElement("p", {
    className: "error-state__sub"
  }, "Try uploading a text-based PDF. If the file is scanned, OCR it first and re-upload."), /*#__PURE__*/React.createElement("div", {
    className: "error-state__details"
  }, /*#__PURE__*/React.createElement(Ico.FilePdf, {
    size: 14
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--ink-900)",
      fontWeight: 600,
      marginBottom: 4
    }
  }, "What went wrong"), message.details)), /*#__PURE__*/React.createElement("div", {
    className: "error-state__cta"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn--primary",
    onClick: onRetry
  }, /*#__PURE__*/React.createElement(Ico.Upload, {
    size: 14
  }), " Re-upload PDF"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn--ghost"
  }, "Read troubleshooting guide")));
}
function Toast(_ref16) {
  var message = _ref16.message,
    onClose = _ref16.onClose;
  useEffectM(function () {
    var t = setTimeout(onClose, 4200);
    return function () {
      return clearTimeout(t);
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "toast"
  }, /*#__PURE__*/React.createElement("span", {
    className: "toast__ico"
  }, /*#__PURE__*/React.createElement(Ico.Check, {
    size: 16
  })), /*#__PURE__*/React.createElement("span", null, message), /*#__PURE__*/React.createElement("button", {
    className: "toast__close",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Ico.X, {
    size: 12
  })));
}
window.AnalysingOverlay = AnalysingOverlay;
window.ErrorScreen = ErrorScreen;
window.Toast = Toast;

// AuthScreen.jsx - login / signup gate. Shown before the app when logged out.

var _React3 = React,
  useStateAuth = _React3.useState;

// --- auth API helpers (cookie-based sessions) -------------------------------
function apiMe() {
  return _apiMe.apply(this, arguments);
}
function _apiMe() {
  _apiMe = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
    var res, data, _t5;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.p = _context4.n) {
        case 0:
          _context4.p = 0;
          _context4.n = 1;
          return fetch("/api/auth/me", {
            credentials: "same-origin"
          });
        case 1:
          res = _context4.v;
          if (res.ok) {
            _context4.n = 2;
            break;
          }
          return _context4.a(2, null);
        case 2:
          _context4.n = 3;
          return res.json();
        case 3:
          data = _context4.v;
          return _context4.a(2, data.user || null);
        case 4:
          _context4.p = 4;
          _t5 = _context4.v;
          return _context4.a(2, null);
      }
    }, _callee4, null, [[0, 4]]);
  }));
  return _apiMe.apply(this, arguments);
}
function apiAuth(_x, _x2) {
  return _apiAuth.apply(this, arguments);
}
function _apiAuth() {
  _apiAuth = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(path, body) {
    var res, data, detail, _t6;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.p = _context5.n) {
        case 0:
          _context5.n = 1;
          return fetch(path, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify(body)
          });
        case 1:
          res = _context5.v;
          data = {};
          _context5.p = 2;
          _context5.n = 3;
          return res.json();
        case 3:
          data = _context5.v;
          _context5.n = 5;
          break;
        case 4:
          _context5.p = 4;
          _t6 = _context5.v;
        case 5:
          if (res.ok) {
            _context5.n = 6;
            break;
          }
          detail = data && data.detail ? data.detail : {};
          throw new Error(detail.details || detail.title || "Something went wrong. Please try again.");
        case 6:
          return _context5.a(2, data.user || null);
      }
    }, _callee5, null, [[2, 4]]);
  }));
  return _apiAuth.apply(this, arguments);
}
function apiLogout() {
  return _apiLogout.apply(this, arguments);
}
function _apiLogout() {
  _apiLogout = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
    var _t7;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.p = _context6.n) {
        case 0:
          _context6.p = 0;
          _context6.n = 1;
          return fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin"
          });
        case 1:
          _context6.n = 3;
          break;
        case 2:
          _context6.p = 2;
          _t7 = _context6.v;
        case 3:
          return _context6.a(2);
      }
    }, _callee6, null, [[0, 2]]);
  }));
  return _apiLogout.apply(this, arguments);
}
function AuthScreen(_ref17) {
  var onAuthed = _ref17.onAuthed;
  var _useStateAuth = useStateAuth("login"),
    _useStateAuth2 = _slicedToArray(_useStateAuth, 2),
    mode = _useStateAuth2[0],
    setMode = _useStateAuth2[1]; // "login" | "signup"
  var _useStateAuth3 = useStateAuth(""),
    _useStateAuth4 = _slicedToArray(_useStateAuth3, 2),
    name = _useStateAuth4[0],
    setName = _useStateAuth4[1];
  var _useStateAuth5 = useStateAuth(""),
    _useStateAuth6 = _slicedToArray(_useStateAuth5, 2),
    email = _useStateAuth6[0],
    setEmail = _useStateAuth6[1];
  var _useStateAuth7 = useStateAuth(""),
    _useStateAuth8 = _slicedToArray(_useStateAuth7, 2),
    password = _useStateAuth8[0],
    setPassword = _useStateAuth8[1];
  var _useStateAuth9 = useStateAuth(false),
    _useStateAuth0 = _slicedToArray(_useStateAuth9, 2),
    busy = _useStateAuth0[0],
    setBusy = _useStateAuth0[1];
  var _useStateAuth1 = useStateAuth(null),
    _useStateAuth10 = _slicedToArray(_useStateAuth1, 2),
    err = _useStateAuth10[0],
    setErr = _useStateAuth10[1];
  var isSignup = mode === "signup";
  var submit = /*#__PURE__*/function () {
    var _ref18 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(e) {
      var path, body, user, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            e.preventDefault();
            setErr(null);
            if (!(!email.trim() || !password)) {
              _context.n = 1;
              break;
            }
            setErr("Please enter your email and password.");
            return _context.a(2);
          case 1:
            if (!(isSignup && password.length < 6)) {
              _context.n = 2;
              break;
            }
            setErr("Password must be at least 6 characters.");
            return _context.a(2);
          case 2:
            setBusy(true);
            _context.p = 3;
            path = isSignup ? "/api/auth/signup" : "/api/auth/login";
            body = isSignup ? {
              name: name.trim(),
              email: email.trim(),
              password: password
            } : {
              email: email.trim(),
              password: password
            };
            _context.n = 4;
            return apiAuth(path, body);
          case 4:
            user = _context.v;
            onAuthed(user);
            _context.n = 6;
            break;
          case 5:
            _context.p = 5;
            _t = _context.v;
            setErr(_t.message);
          case 6:
            _context.p = 6;
            setBusy(false);
            return _context.f(6);
          case 7:
            return _context.a(2);
        }
      }, _callee, null, [[3, 5, 6, 7]]);
    }));
    return function submit(_x3) {
      return _ref18.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: "auth"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth__card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth__brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "auth__logo"
  }, "myfiling", /*#__PURE__*/React.createElement("span", {
    className: "auth__logo-dot"
  }, ".ai")), /*#__PURE__*/React.createElement("p", {
    className: "auth__tagline"
  }, "Catch filing defects before submission.")), /*#__PURE__*/React.createElement("div", {
    className: "auth__tabs"
  }, /*#__PURE__*/React.createElement("button", {
    className: "auth__tab" + (!isSignup ? " auth__tab--active" : ""),
    onClick: function onClick() {
      setMode("login");
      setErr(null);
    },
    type: "button"
  }, "Log in"), /*#__PURE__*/React.createElement("button", {
    className: "auth__tab" + (isSignup ? " auth__tab--active" : ""),
    onClick: function onClick() {
      setMode("signup");
      setErr(null);
    },
    type: "button"
  }, "Sign up")), /*#__PURE__*/React.createElement("form", {
    className: "auth__form",
    onSubmit: submit
  }, isSignup && /*#__PURE__*/React.createElement("label", {
    className: "auth__field"
  }, /*#__PURE__*/React.createElement("span", null, "Name ", /*#__PURE__*/React.createElement("em", null, "(optional)")), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: name,
    autoComplete: "name",
    onChange: function onChange(e) {
      return setName(e.target.value);
    },
    placeholder: "Your name"
  })), /*#__PURE__*/React.createElement("label", {
    className: "auth__field"
  }, /*#__PURE__*/React.createElement("span", null, "Email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: email,
    autoComplete: "email",
    required: true,
    onChange: function onChange(e) {
      return setEmail(e.target.value);
    },
    placeholder: "you@example.com"
  })), /*#__PURE__*/React.createElement("label", {
    className: "auth__field"
  }, /*#__PURE__*/React.createElement("span", null, "Password"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: password,
    required: true,
    autoComplete: isSignup ? "new-password" : "current-password",
    onChange: function onChange(e) {
      return setPassword(e.target.value);
    },
    placeholder: isSignup ? "At least 6 characters" : "Your password"
  })), err && /*#__PURE__*/React.createElement("div", {
    className: "auth__error"
  }, err), /*#__PURE__*/React.createElement("button", {
    className: "auth__submit",
    type: "submit",
    disabled: busy
  }, busy ? "Please wait…" : isSignup ? "Create account" : "Log in")), /*#__PURE__*/React.createElement("p", {
    className: "auth__switch"
  }, isSignup ? "Already have an account? " : "New here? ", /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "auth__link",
    onClick: function onClick() {
      setMode(isSignup ? "login" : "signup");
      setErr(null);
    }
  }, isSignup ? "Log in" : "Create a free account"))));
}
window.AuthScreen = AuthScreen;
window.apiMe = apiMe;
window.apiLogout = apiLogout;

// upload.jsx - Screen 1: Upload & Court Selection
var _React4 = React,
  useStateU = _React4.useState,
  useRefU = _React4.useRef,
  useEffectU = _React4.useEffect;

// Key shared with the public marketing site (marketing/assets/site.js): when a
// visitor picks a PDF in the hero widget and then signs in, the file (metadata
// and, when small enough, its bytes) is stashed here so we can pre-fill the
// upload screen and let them continue with a single click.
var PENDING_UPLOAD_KEY = "myfiling.pendingUpload";

// Reconstruct a File from the base64 the marketing widget stored, so the real
// streaming upload works without re-picking. Returns null if bytes are absent.
function _pendingFileFromB64(name, dataB64) {
  if (!dataB64) return null;
  try {
    var bin = atob(dataB64);
    var len = bin.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    return new File([bytes], name || "filing.pdf", {
      type: "application/pdf"
    });
  } catch (_) {
    return null;
  }
}
function UploadScreen(_ref19) {
  var _COURTS$find;
  var onAnalyse = _ref19.onAnalyse,
    onError = _ref19.onError;
  var _window$FC_DATA2 = window.FC_DATA,
    COURTS = _window$FC_DATA2.COURTS,
    CASE_TYPES = _window$FC_DATA2.CASE_TYPES,
    SAMPLE_FILES = _window$FC_DATA2.SAMPLE_FILES;
  // Default to the first enabled court (currently Delhi High Court); falls back
  // to the first listed court so the dropdown is never empty.
  var defaultCourtId = (COURTS.find(function (c) {
    return c.enabled;
  }) || COURTS[0]).id;
  var _useStateU = useStateU(null),
    _useStateU2 = _slicedToArray(_useStateU, 2),
    file = _useStateU2[0],
    setFile = _useStateU2[1];
  var _useStateU3 = useStateU(defaultCourtId),
    _useStateU4 = _slicedToArray(_useStateU3, 2),
    court = _useStateU4[0],
    setCourt = _useStateU4[1];
  var _useStateU5 = useStateU("wp"),
    _useStateU6 = _slicedToArray(_useStateU5, 2),
    caseType = _useStateU6[0],
    setCaseType = _useStateU6[1];
  var _useStateU7 = useStateU(false),
    _useStateU8 = _slicedToArray(_useStateU7, 2),
    dragging = _useStateU8[0],
    setDragging = _useStateU8[1];
  var _useStateU9 = useStateU(false),
    _useStateU0 = _slicedToArray(_useStateU9, 2),
    courtOpen = _useStateU0[0],
    setCourtOpen = _useStateU0[1];
  var _useStateU1 = useStateU(null),
    _useStateU10 = _slicedToArray(_useStateU1, 2),
    handoffNote = _useStateU10[0],
    setHandoffNote = _useStateU10[1];
  var inputRef = useRefU();
  var courtDropdownRef = useRefU();
  useEffectU(function () {
    function handleClickOutside(e) {
      if (courtDropdownRef.current && !courtDropdownRef.current.contains(e.target)) {
        setCourtOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return function () {
      return document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // On mount, pick up any file handed off from the public homepage upload widget
  // (only when the URL says ?pending=1, set by the marketing redirect). We
  // pre-fill the dropzone and court/case-type so the user can analyse in one
  // click. The stash is cleared immediately so a refresh doesn't re-apply it.
  useEffectU(function () {
    var pendingFlag = false;
    try {
      pendingFlag = new URLSearchParams(window.location.search).get("pending") === "1";
    } catch (_) {/* no URL API */}
    if (!pendingFlag) return;
    var raw = null;
    try {
      raw = sessionStorage.getItem(PENDING_UPLOAD_KEY);
    } catch (_) {
      return;
    }
    if (!raw) return;
    try {
      sessionStorage.removeItem(PENDING_UPLOAD_KEY);
    } catch (_) {}
    var meta;
    try {
      meta = JSON.parse(raw);
    } catch (_) {
      return;
    }
    if (!meta || !meta.name) return;

    // Restore court / case type when they map to known, enabled options.
    if (meta.court && COURTS.some(function (c) {
      return c.id === meta.court && c.enabled;
    })) setCourt(meta.court);
    if (meta.caseType && CASE_TYPES.some(function (c) {
      return c.id === meta.caseType;
    })) setCaseType(meta.caseType);
    var restored = _pendingFileFromB64(meta.name, meta.dataB64);
    if (restored) {
      setFile({
        name: restored.name,
        size: (restored.size / (1024 * 1024)).toFixed(1) + " MB",
        raw: restored
      });
      setHandoffNote("Your file is ready - click “Analyse Filing” to continue.");
    } else {
      // We have the name but not the bytes (e.g. file was too large to carry):
      // prompt the user to re-select so the real analysis can run.
      setHandoffNote("Please re-select “" + meta.name + "” to run your analysis.");
    }
    // Clear the prompt after a short while so it doesn't linger.
    var t = setTimeout(function () {
      return setHandoffNote(null);
    }, 9000);
    return function () {
      return clearTimeout(t);
    };
  }, []);
  var onPick = function onPick(f) {
    if (!f) return;
    if (!/\.pdf$/i.test(f.name)) {
      onError({
        title: "Unsupported file type",
        details: "Received \"".concat(f.name, "\". myfiling.ai currently only accepts PDF files.")
      });
      return;
    }
    setFile({
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
      raw: f
    });
  };
  var onDrop = function onDrop(e) {
    var _e$dataTransfer$files;
    e.preventDefault();
    setDragging(false);
    var f = (_e$dataTransfer$files = e.dataTransfer.files) === null || _e$dataTransfer$files === void 0 ? void 0 : _e$dataTransfer$files[0];
    onPick(f);
  };
  var canAnalyse = !!file;
  return /*#__PURE__*/React.createElement("div", {
    className: "upload stagger"
  }, /*#__PURE__*/React.createElement("div", {
    className: "upload__hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "upload__eyebrow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "upload__eyebrow-dot"
  }), " AI filing scrutiny"), /*#__PURE__*/React.createElement("h1", {
    className: "upload__title"
  }, "Catch filing defects ", /*#__PURE__*/React.createElement("em", null, "before submission.")), /*#__PURE__*/React.createElement("p", {
    className: "upload__sub"
  }, "myfiling.ai checks your PDF against the court's formatting and registry-filing requirements \u2014 paper size, margins, type, pagination, index, court fee, vakalatnama, limitation, certified copy and affidavit. Get a filing-readiness score and a defect checklist in seconds."), /*#__PURE__*/React.createElement("div", {
    className: "upload__trust"
  }, /*#__PURE__*/React.createElement("span", {
    className: "upload__trust-item"
  }, /*#__PURE__*/React.createElement(Ico.Check, {
    size: 13
  }), " Court rules engine"), /*#__PURE__*/React.createElement("span", {
    className: "upload__trust-item"
  }, /*#__PURE__*/React.createElement(Ico.Check, {
    size: 13
  }), " Documents never stored"), /*#__PURE__*/React.createElement("span", {
    className: "upload__trust-item"
  }, /*#__PURE__*/React.createElement(Ico.Check, {
    size: 13
  }), " Results in seconds"))), /*#__PURE__*/React.createElement("div", {
    className: "upload__panel"
  }, handoffNote && /*#__PURE__*/React.createElement("div", {
    className: "upload__handoff"
  }, /*#__PURE__*/React.createElement(Ico.Spark, {
    size: 14
  }), " ", handoffNote), /*#__PURE__*/React.createElement("div", {
    className: "dropzone" + (dragging ? " dropzone--drag" : "") + (file ? " dropzone--has-file" : ""),
    onDragOver: function onDragOver(e) {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: function onDragLeave() {
      return setDragging(false);
    },
    onDrop: onDrop,
    onClick: function onClick() {
      var _inputRef$current;
      return !file && ((_inputRef$current = inputRef.current) === null || _inputRef$current === void 0 ? void 0 : _inputRef$current.click());
    },
    role: "button"
  }, /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "application/pdf",
    ref: inputRef,
    style: {
      display: "none"
    },
    onChange: function onChange(e) {
      var _e$target$files;
      return onPick((_e$target$files = e.target.files) === null || _e$target$files === void 0 ? void 0 : _e$target$files[0]);
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "dropzone__icon"
  }, file ? /*#__PURE__*/React.createElement(Ico.Check, {
    size: 26
  }) : /*#__PURE__*/React.createElement(Ico.Upload, {
    size: 26
  })), file ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "dropzone__title"
  }, "Ready to analyse"), /*#__PURE__*/React.createElement("div", {
    className: "dropzone__sub"
  }, "We'll cross-reference rules for the selected court."), /*#__PURE__*/React.createElement("div", {
    className: "dropzone__file-meta"
  }, /*#__PURE__*/React.createElement(Ico.FilePdf, {
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, file.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--ink-400)"
    }
  }, "\xB7 ", file.size), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick(e) {
      e.stopPropagation();
      setFile(null);
    },
    title: "Remove"
  }, /*#__PURE__*/React.createElement(Ico.X, {
    size: 12
  })))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "dropzone__title"
  }, "Drag your filing PDF here or ", /*#__PURE__*/React.createElement("span", {
    className: "dropzone__browse"
  }, "click to browse")), /*#__PURE__*/React.createElement("div", {
    className: "dropzone__sub"
  }, "Cover page, index, synopsis, body and annexures \u2014 all in one PDF."))), /*#__PURE__*/React.createElement("div", {
    className: "upload__fields"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "field__label"
  }, /*#__PURE__*/React.createElement("span", null, "Court"), /*#__PURE__*/React.createElement("span", {
    className: "field__label-sub"
  }, "Rules vary per registry")), /*#__PURE__*/React.createElement("div", {
    className: "court-dropdown" + (courtOpen ? " court-dropdown--open" : ""),
    ref: courtDropdownRef
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "court-dropdown__trigger",
    onClick: function onClick() {
      return setCourtOpen(!courtOpen);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "court-dropdown__label"
  }, (_COURTS$find = COURTS.find(function (c) {
    return c.id === court;
  })) === null || _COURTS$find === void 0 ? void 0 : _COURTS$find.name), /*#__PURE__*/React.createElement("svg", {
    className: "court-dropdown__chevron",
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "4 6 8 10 12 6"
  }))), courtOpen && /*#__PURE__*/React.createElement("div", {
    className: "court-dropdown__menu"
  }, COURTS.map(function (c) {
    return /*#__PURE__*/React.createElement("button", {
      key: c.id,
      type: "button",
      className: "court-dropdown__item" + (c.id === court ? " court-dropdown__item--active" : "") + (!c.enabled ? " court-dropdown__item--disabled" : ""),
      disabled: !c.enabled,
      onClick: function onClick() {
        if (c.enabled) {
          setCourt(c.id);
          setCourtOpen(false);
        }
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "court-dropdown__item-name"
    }, c.name), !c.enabled ? /*#__PURE__*/React.createElement("span", {
      className: "court-dropdown__item-badge"
    }, "Coming Soon") : c.id === court ? /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 15 15",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "12.5 3.5 5.5 10.5 2.5 7.5"
    })) : null);
  })))), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "field__label"
  }, /*#__PURE__*/React.createElement("span", null, "Case type"), /*#__PURE__*/React.createElement("span", {
    className: "field__label-sub"
  }, "Affects required annexures")), /*#__PURE__*/React.createElement("select", {
    className: "select",
    value: caseType,
    onChange: function onChange(e) {
      return setCaseType(e.target.value);
    }
  }, CASE_TYPES.map(function (c) {
    return /*#__PURE__*/React.createElement("option", {
      key: c.id,
      value: c.id
    }, c.name);
  })))), /*#__PURE__*/React.createElement("div", {
    className: "upload__cta-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "upload__hint"
  }, "Supported format: PDF only \xB7 Max size: 50MB"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn--primary btn--lg",
    disabled: !canAnalyse,
    onClick: function onClick() {
      return onAnalyse({
        file: file,
        court: COURTS.find(function (c) {
          return c.id === court;
        }),
        caseType: CASE_TYPES.find(function (c) {
          return c.id === caseType;
        })
      });
    }
  }, /*#__PURE__*/React.createElement(Ico.Spark, {
    size: 14
  }), " Analyse Filing"))), SAMPLE_FILES.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "upload__samples"
  }, /*#__PURE__*/React.createElement("div", {
    className: "upload__samples-label"
  }, "Try a sample filing to explore"), /*#__PURE__*/React.createElement("div", {
    className: "upload__samples-row"
  }, SAMPLE_FILES.map(function (s) {
    return /*#__PURE__*/React.createElement("button", {
      key: s.name,
      className: "sample-chip",
      onClick: function onClick() {
        setFile({
          name: s.name,
          size: s.size
        });
        setCourt(s.court);
        setCaseType(s.caseType);
      }
    }, /*#__PURE__*/React.createElement(Ico.FilePdf, {
      size: 12
    }), s.name, /*#__PURE__*/React.createElement("span", {
      className: "sample-chip__type"
    }, COURTS.find(function (c) {
      return c.id === s.court;
    })["short"]));
  }))));
}
window.UploadScreen = UploadScreen;

// results.jsx - Screen 2: Results Dashboard
var _React5 = React,
  useStateR = _React5.useState,
  useMemoR = _React5.useMemo,
  useEffectR = _React5.useEffect;
var SEV_LABEL = {
  critical: "Critical",
  minor: "Minor",
  warning: "Warning"
};

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
  var KNOWN = {
    timesnewroman: "Times New Roman",
    times: "Times New Roman",
    timesroman: "Times New Roman",
    liberationserif: "Liberation Serif",
    nimbusroman: "Nimbus Roman",
    arial: "Arial",
    helvetica: "Helvetica",
    calibri: "Calibri",
    cambria: "Cambria",
    georgia: "Georgia",
    verdana: "Verdana",
    couriernew: "Courier New",
    courier: "Courier",
    garamond: "Garamond",
    tahoma: "Tahoma"
  };
  return KNOWN[fam] || (fam ? fam.charAt(0).toUpperCase() + fam.slice(1) : fam);
}

// Render the measured evidence object (e.g. {left_cm: 2.3}) as readable chips.
var EVIDENCE_LABELS = {
  left_cm: "Left",
  right_cm: "Right",
  top_cm: "Top",
  bottom_cm: "Bottom",
  body_pt: "Body size",
  ratio: "Spacing",
  dominant_family: "Font",
  dominant_fraction: "Share",
  non_a4_fraction: "Non-A4",
  blocks: "Blocks",
  off_spec: "Off-spec",
  first_page: "First page"
};
function EvidenceChips(_ref20) {
  var evidence = _ref20.evidence;
  if (!evidence || _typeof(evidence) !== "object") return null;
  var entries = Object.entries(evidence).filter(function (_ref21) {
    var _ref22 = _slicedToArray(_ref21, 2),
      k = _ref22[0],
      v = _ref22[1];
    return v != null && _typeof(v) !== "object";
  });
  if (!entries.length) return null;
  var fmt = function fmt(k, v) {
    if (k.endsWith("_cm")) return v + " cm";
    if (k.endsWith("_pt")) return v + " pt";
    if (k.endsWith("_fraction") || k === "dominant_fraction") return Math.round(v * 100) + "%";
    return String(v);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "defect__evidence"
  }, entries.map(function (_ref23) {
    var _ref24 = _slicedToArray(_ref23, 2),
      k = _ref24[0],
      v = _ref24[1];
    return /*#__PURE__*/React.createElement("span", {
      className: "evidence-chip",
      key: k
    }, /*#__PURE__*/React.createElement("span", {
      className: "evidence-chip__k"
    }, EVIDENCE_LABELS[k] || k), /*#__PURE__*/React.createElement("span", {
      className: "evidence-chip__v"
    }, fmt(k, v)));
  }));
}
function DefectCard(_ref25) {
  var defect = _ref25.defect,
    open = _ref25.open,
    onToggle = _ref25.onToggle,
    fixed = _ref25.fixed,
    onToggleFixed = _ref25.onToggleFixed,
    fileUrl = _ref25.fileUrl,
    onViewPage = _ref25.onViewPage;
  var conf = defect.confidence;
  var confTier = confidenceTier(conf);
  return /*#__PURE__*/React.createElement("div", {
    className: "defect defect--" + defect.severity + (open ? " defect--open" : "") + (fixed ? " defect--fixed" : ""),
    onClick: onToggle
  }, /*#__PURE__*/React.createElement("div", {
    className: "defect__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "defect__page"
  }, /*#__PURE__*/React.createElement("span", {
    className: "defect__page-num"
  }, "p.", defect.page)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "defect__title"
  }, defect.title, /*#__PURE__*/React.createElement("span", {
    className: "severity severity--" + defect.severity
  }, SEV_LABEL[defect.severity]), confTier && /*#__PURE__*/React.createElement("span", {
    className: "conf-badge conf-badge--" + confTier,
    title: confidenceLabel(conf) + " (" + Math.round(conf * 100) + "%)"
  }, Math.round(conf * 100), "%"), fixed && /*#__PURE__*/React.createElement("span", {
    className: "severity severity--fixed"
  }, "Fixed")), /*#__PURE__*/React.createElement("p", {
    className: "defect__desc"
  }, defect.desc)), /*#__PURE__*/React.createElement("div", {
    className: "defect__chev"
  }, /*#__PURE__*/React.createElement(Ico.ChevronDown, null))), open && /*#__PURE__*/React.createElement("div", {
    className: "defect__body",
    onClick: function onClick(e) {
      return e.stopPropagation();
    }
  }, /*#__PURE__*/React.createElement(EvidenceChips, {
    evidence: defect.evidence
  }), /*#__PURE__*/React.createElement("div", {
    className: "defect__section"
  }, /*#__PURE__*/React.createElement("h5", null, "Rule Violated"), /*#__PURE__*/React.createElement("div", {
    className: "defect__rule"
  }, defect.rule)), /*#__PURE__*/React.createElement("div", {
    className: "defect__section"
  }, /*#__PURE__*/React.createElement("h5", null, "What to Do"), /*#__PURE__*/React.createElement("p", {
    style: {
      lineHeight: 1.6,
      color: "var(--ink-700)"
    }
  }, defect.fix)), /*#__PURE__*/React.createElement("div", {
    className: "defect__action"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn--ghost btn--xs",
    onClick: function onClick() {
      return onViewPage(defect.page);
    },
    disabled: !fileUrl,
    title: fileUrl ? "Open this page of the PDF" : "Original PDF not available in this session"
  }, /*#__PURE__*/React.createElement(Ico.FilePdf, {
    size: 12,
    style: {
      marginRight: 6
    }
  }), "View Page ", defect.page), /*#__PURE__*/React.createElement("button", {
    className: "btn btn--xs" + (fixed ? " btn--primary" : " btn--ghost"),
    onClick: function onClick() {
      return onToggleFixed(defect.id);
    }
  }, /*#__PURE__*/React.createElement(Ico.Check, {
    size: 12,
    style: {
      marginRight: 6
    }
  }), fixed ? "Fixed ✓" : "Mark Fixed"))));
}
function ResultsScreen(_ref26) {
  var session = _ref26.session,
    onBack = _ref26.onBack,
    onDownload = _ref26.onDownload,
    onShare = _ref26.onShare;
  var _useStateR = useStateR("all"),
    _useStateR2 = _slicedToArray(_useStateR, 2),
    filter = _useStateR2[0],
    setFilter = _useStateR2[1];
  var _useStateR3 = useStateR(null),
    _useStateR4 = _slicedToArray(_useStateR3, 2),
    openId = _useStateR4[0],
    setOpenId = _useStateR4[1];
  var _useStateR5 = useStateR(0),
    _useStateR6 = _slicedToArray(_useStateR5, 2),
    score = _useStateR6[0],
    setScore = _useStateR6[1];
  var _useStateR7 = useStateR({}),
    _useStateR8 = _slicedToArray(_useStateR7, 2),
    fixedIds = _useStateR8[0],
    setFixedIds = _useStateR8[1];
  var _useStateR9 = useStateR(false),
    _useStateR0 = _slicedToArray(_useStateR9, 2),
    checksOpen = _useStateR0[0],
    setChecksOpen = _useStateR0[1];
  var toggleFixed = function toggleFixed(id) {
    return setFixedIds(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, id, !prev[id]));
    });
  };
  var viewPage = function viewPage(page) {
    var url = session.file && session.file.url;
    if (!url) return;
    // Most PDF viewers honour the #page fragment to jump to a page.
    window.open(url + "#page=" + page, "_blank", "noopener");
  };

  // Animate the score in
  useEffectR(function () {
    var raf;
    var target = session.score;
    var start = performance.now();
    var dur = 900;
    var _step = function step(t) {
      var k = Math.min(1, (t - start) / dur);
      var eased = 1 - Math.pow(1 - k, 3);
      setScore(Math.round(target * eased));
      if (k < 1) raf = requestAnimationFrame(_step);
    };
    raf = requestAnimationFrame(_step);
    return function () {
      return cancelAnimationFrame(raf);
    };
  }, [session.score]);
  var defects = session.defectsToUse || [];
  var stats = session.stats || {};
  var counts = useMemoR(function () {
    return {
      all: defects.length,
      critical: defects.filter(function (d) {
        return d.severity === "critical";
      }).length,
      minor: defects.filter(function (d) {
        return d.severity === "minor";
      }).length,
      warning: defects.filter(function (d) {
        return d.severity === "warning";
      }).length
    };
  }, [defects]);
  var sevOrder = {
    critical: 0,
    minor: 1,
    warning: 2
  };
  var visible = useMemoR(function () {
    var list = defects;
    if (filter !== "all") list = list.filter(function (d) {
      return d.severity === filter;
    });
    return _toConsumableArray(list).sort(function (a, b) {
      return sevOrder[a.severity] - sevOrder[b.severity];
    });
  }, [defects, filter]);
  var filters = [{
    id: "all",
    label: "All"
  }, {
    id: "critical",
    label: "Critical"
  }, {
    id: "minor",
    label: "Minor"
  }, {
    id: "warning",
    label: "Warnings"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "results"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "results__left"
  }, /*#__PURE__*/React.createElement("div", {
    className: "results__crumbs"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack
  }, /*#__PURE__*/React.createElement(Ico.ArrowLeft, {
    size: 12,
    style: {
      display: "inline",
      verticalAlign: "-2px",
      marginRight: 4
    }
  }), " New filing"), /*#__PURE__*/React.createElement("span", null, "/"), /*#__PURE__*/React.createElement("span", null, "Scrutiny report")), /*#__PURE__*/React.createElement("div", {
    className: "summary__file"
  }, /*#__PURE__*/React.createElement("div", {
    className: "summary__file-ico"
  }, "PDF"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "summary__file-name"
  }, session.file.name), /*#__PURE__*/React.createElement("div", {
    className: "summary__file-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tag tag--blue"
  }, session.court["short"]), /*#__PURE__*/React.createElement("span", {
    className: "tag"
  }, session.caseType.name), /*#__PURE__*/React.createElement("span", {
    className: "tag"
  }, session.file.size)))), /*#__PURE__*/React.createElement(Gauge, {
    score: score
  }), /*#__PURE__*/React.createElement("p", {
    className: "readiness-note"
  }, "Covers formatting & registry-filing requirements \u2014 not legal merit. Not a guarantee against objection; have an advocate review before filing."), /*#__PURE__*/React.createElement("div", {
    className: "metrics"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric__label"
  }, "Total"), /*#__PURE__*/React.createElement("div", {
    className: "metric__value"
  }, counts.all)), /*#__PURE__*/React.createElement("div", {
    className: "metric"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric__label"
  }, /*#__PURE__*/React.createElement("span", {
    className: "metric__dot metric__dot--r"
  }), "Critical"), /*#__PURE__*/React.createElement("div", {
    className: "metric__value",
    style: {
      color: "var(--red-600)"
    }
  }, counts.critical)), /*#__PURE__*/React.createElement("div", {
    className: "metric"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric__label"
  }, /*#__PURE__*/React.createElement("span", {
    className: "metric__dot metric__dot--a"
  }), "Minor"), /*#__PURE__*/React.createElement("div", {
    className: "metric__value",
    style: {
      color: "var(--amber-600)"
    }
  }, counts.minor))), /*#__PURE__*/React.createElement("div", {
    className: "summary__detail-list"
  }, /*#__PURE__*/React.createElement("div", {
    className: "summary__detail-row"
  }, /*#__PURE__*/React.createElement("span", null, "Pages scanned"), /*#__PURE__*/React.createElement("span", null, stats.pages_scanned != null ? stats.pages_scanned : "-")), function () {
    var checks = stats.checks || [];
    var clickable = checks.length > 0;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "summary__detail-row" + (clickable ? " summary__detail-row--clickable" : "") + (checksOpen ? " summary__detail-row--open" : ""),
      onClick: function onClick() {
        return clickable && setChecksOpen(function (v) {
          return !v;
        });
      },
      role: clickable ? "button" : undefined,
      title: clickable ? "Show the checks that ran" : undefined
    }, /*#__PURE__*/React.createElement("span", null, "Checks evaluated", clickable && /*#__PURE__*/React.createElement(Ico.ChevronDown, {
      size: 12,
      style: {
        marginLeft: 6,
        verticalAlign: "-2px",
        transition: "transform .15s",
        transform: checksOpen ? "rotate(180deg)" : "none"
      }
    })), /*#__PURE__*/React.createElement("span", null, stats.rules_evaluated != null ? stats.rules_evaluated : "-")), clickable && checksOpen && /*#__PURE__*/React.createElement("div", {
      className: "checks-panel"
    }, checks.map(function (c, i) {
      return /*#__PURE__*/React.createElement("div", {
        className: "checks-panel__row",
        key: i
      }, /*#__PURE__*/React.createElement("span", {
        className: "checks-panel__dot checks-panel__dot--" + c.status
      }), /*#__PURE__*/React.createElement("span", {
        className: "checks-panel__name"
      }, c.name, /*#__PURE__*/React.createElement("span", {
        className: "checks-panel__rule"
      }, c.rule)), /*#__PURE__*/React.createElement("span", {
        className: "checks-panel__status checks-panel__status--" + c.status
      }, c.status === "pass" ? "Pass" : c.defects + (c.defects === 1 ? " issue" : " issues")));
    })));
  }(), /*#__PURE__*/React.createElement("div", {
    className: "summary__detail-row"
  }, /*#__PURE__*/React.createElement("span", null, "Sections detected"), /*#__PURE__*/React.createElement("span", null, stats.sections_detected && stats.sections_detected.length ? stats.sections_detected.length : 0)), /*#__PURE__*/React.createElement("div", {
    className: "summary__detail-row"
  }, /*#__PURE__*/React.createElement("span", null, "Index entries"), /*#__PURE__*/React.createElement("span", null, stats.index_entries != null ? stats.index_entries : "-")), /*#__PURE__*/React.createElement("div", {
    className: "summary__detail-row"
  }, /*#__PURE__*/React.createElement("span", null, "Scrutiny baseline"), /*#__PURE__*/React.createElement("span", null, stats.baseline || "DHC Rules / PD 74")), /*#__PURE__*/React.createElement("div", {
    className: "summary__detail-row"
  }, /*#__PURE__*/React.createElement("span", null, "Analysed"), /*#__PURE__*/React.createElement("span", null, "Just now"))), function () {
    // Measured formatting metrics from the detector engine. Shown only when
    // at least one value is available (text-based, scrutinisable filing).
    var m = stats.margins_cm || {};
    var rows = [["Paper size", stats.paper_size], ["Font family", stats.font_family ? titleCaseFamily(stats.font_family) : null], ["Body font", stats.body_font_pt != null ? stats.body_font_pt + " pt" : null], ["Line spacing", stats.line_spacing_ratio != null ? stats.line_spacing_ratio + "×" : null], ["Margins (L/R/T/B)", m.left != null ? "".concat(m.left, "/").concat(m.right, "/").concat(m.top, "/").concat(m.bottom, " cm") : stats.left_margin_cm != null ? stats.left_margin_cm + " cm (L)" : null]].filter(function (_ref27) {
      var _ref28 = _slicedToArray(_ref27, 2),
        v = _ref28[1];
      return v != null && v !== "";
    });
    if (!rows.length) return null;
    return /*#__PURE__*/React.createElement("div", {
      className: "metrics-panel"
    }, /*#__PURE__*/React.createElement("div", {
      className: "metrics-panel__title"
    }, "Measured formatting"), rows.map(function (_ref29) {
      var _ref30 = _slicedToArray(_ref29, 2),
        k = _ref30[0],
        v = _ref30[1];
      return /*#__PURE__*/React.createElement("div", {
        className: "summary__detail-row",
        key: k
      }, /*#__PURE__*/React.createElement("span", null, k), /*#__PURE__*/React.createElement("span", {
        className: "metrics-panel__val"
      }, v));
    }));
  }(), /*#__PURE__*/React.createElement("div", {
    className: "summary__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn--gold btn--block",
    onClick: onDownload
  }, /*#__PURE__*/React.createElement(Ico.Download, {
    size: 14
  }), " Download Report (PDF)"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn--ghost btn--block",
    onClick: onShare
  }, "Share with co-counsel"))), /*#__PURE__*/React.createElement("section", {
    className: "results__right"
  }, stats.ocr_used && /*#__PURE__*/React.createElement("div", {
    className: "ocr-banner"
  }, /*#__PURE__*/React.createElement(Ico.Spark, {
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, "This appears to be a ", /*#__PURE__*/React.createElement("strong", null, "scanned document"), ". Text was recovered via OCR", stats.ocr_pages ? " from the first ".concat(stats.ocr_pages, " page").concat(stats.ocr_pages === 1 ? "" : "s") : "", ", so text checks ran at lower confidence and layout checks (margins, font size, spacing) could not be measured. Verify findings manually.")), /*#__PURE__*/React.createElement("div", {
    className: "results__header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "results__heading"
  }, "Defects Found"), /*#__PURE__*/React.createElement("p", {
    className: "results__heading-sub"
  }, "Sorted by severity. Click any defect to see the rule citation and remediation steps.")), /*#__PURE__*/React.createElement("div", {
    className: "filter-bar"
  }, filters.map(function (f) {
    return /*#__PURE__*/React.createElement("button", {
      key: f.id,
      className: "filter-bar__btn" + (filter === f.id ? " filter-bar__btn--active" : ""),
      onClick: function onClick() {
        return setFilter(f.id);
      }
    }, f.label, /*#__PURE__*/React.createElement("span", {
      className: "filter-bar__count"
    }, counts[f.id]));
  }))), visible.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty-filter"
  }, filter === "all" ? /*#__PURE__*/React.createElement("div", {
    className: "empty-filter__success"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty-filter__success-icon"
  }, "\u2713"), /*#__PURE__*/React.createElement("strong", null, "No defects detected"), /*#__PURE__*/React.createElement("p", null, "This filing appears compliant with court rules. However, have a qualified advocate review before final submission."), /*#__PURE__*/React.createElement("button", {
    className: "btn btn--ghost btn--sm",
    onClick: function onClick() {
      return setFilter("all");
    },
    style: {
      marginTop: 12
    }
  }, "View detailed analysis")) : /*#__PURE__*/React.createElement("div", null, "No ", filter, " defects in this filing.")) : /*#__PURE__*/React.createElement("div", {
    className: "defect-list stagger"
  }, visible.map(function (d) {
    return /*#__PURE__*/React.createElement(DefectCard, {
      key: d.id,
      defect: d,
      open: openId === d.id,
      onToggle: function onToggle() {
        return setOpenId(openId === d.id ? null : d.id);
      },
      fixed: !!fixedIds[d.id],
      onToggleFixed: toggleFixed,
      fileUrl: session.file && session.file.url,
      onViewPage: viewPage
    });
  }))));
}
window.ResultsScreen = ResultsScreen;

// screens.jsx - Additional screens: History, Court Rules, Help

var _React6 = React,
  useStateS = _React6.useState,
  useMemoS = _React6.useMemo;

// ============================================================================
// HISTORY SCREEN
// ============================================================================

function _historyWhen(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  var mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return mins + "m ago";
  var hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  var days = Math.round(hrs / 24);
  if (days < 30) return days + "d ago";
  return d.toLocaleDateString();
}
function HistoryScreen(_ref31) {
  var recents = _ref31.recents,
    onOpen = _ref31.onOpen,
    onUpload = _ref31.onUpload;
  var list = Array.isArray(recents) ? recents : [];
  var _useStateS = useStateS("all"),
    _useStateS2 = _slicedToArray(_useStateS, 2),
    filterScore = _useStateS2[0],
    setFilterScore = _useStateS2[1];
  var filtered = useMemoS(function () {
    if (filterScore === "pass") return list.filter(function (r) {
      return (r.score || 0) >= 71;
    });
    if (filterScore === "risk") return list.filter(function (r) {
      return (r.score || 0) < 71;
    });
    return list;
  }, [filterScore, list]);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "screen-header"
  }, /*#__PURE__*/React.createElement("h1", null, "Filing History"), /*#__PURE__*/React.createElement("p", null, "Your recent uploads and their scrutiny scores")), /*#__PURE__*/React.createElement("div", {
    className: "screen-filters"
  }, /*#__PURE__*/React.createElement("button", {
    className: "filter-pill" + (filterScore === "all" ? " filter-pill--active" : ""),
    onClick: function onClick() {
      return setFilterScore("all");
    }
  }, "All (", list.length, ")"), /*#__PURE__*/React.createElement("button", {
    className: "filter-pill" + (filterScore === "pass" ? " filter-pill--active" : ""),
    onClick: function onClick() {
      return setFilterScore("pass");
    }
  }, "Likely to Pass (", list.filter(function (r) {
    return (r.score || 0) >= 71;
  }).length, ")"), /*#__PURE__*/React.createElement("button", {
    className: "filter-pill" + (filterScore === "risk" ? " filter-pill--active" : ""),
    onClick: function onClick() {
      return setFilterScore("risk");
    }
  }, "Needs Work (", list.filter(function (r) {
    return (r.score || 0) < 71;
  }).length, ")")), /*#__PURE__*/React.createElement("div", {
    className: "history-list"
  }, filtered.map(function (filing, i) {
    var score = filing.score || 0;
    var band = score >= 71 ? "g" : score >= 41 ? "a" : "r";
    var label = score >= 71 ? "Likely to pass" : score >= 41 ? "Moderate risk" : "High risk";
    var when = filing.when || _historyWhen(filing.createdAt);
    return /*#__PURE__*/React.createElement("div", {
      key: filing.analysisId || i,
      className: "history-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "history-card__left"
    }, /*#__PURE__*/React.createElement("div", {
      className: "history-card__icon"
    }, /*#__PURE__*/React.createElement(Ico.FilePdf, {
      size: 16
    })), /*#__PURE__*/React.createElement("div", {
      className: "history-card__info"
    }, /*#__PURE__*/React.createElement("div", {
      className: "history-card__name"
    }, filing.name), /*#__PURE__*/React.createElement("div", {
      className: "history-card__meta"
    }, filing.court && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, filing.court), /*#__PURE__*/React.createElement("span", null, "\xB7")), /*#__PURE__*/React.createElement("span", null, when)))), /*#__PURE__*/React.createElement("div", {
      className: "history-card__right"
    }, /*#__PURE__*/React.createElement("div", {
      className: "history-card__score-badge"
    }, /*#__PURE__*/React.createElement("div", {
      className: "score-badge score-badge--" + band
    }, /*#__PURE__*/React.createElement("span", {
      className: "score-badge__num"
    }, score, "%"), /*#__PURE__*/React.createElement("span", {
      className: "score-badge__label"
    }, label))), /*#__PURE__*/React.createElement("button", {
      className: "btn btn--ghost btn--sm",
      onClick: function onClick() {
        return onOpen && onOpen(filing);
      },
      disabled: !filing.session,
      title: filing.session ? "View the saved report" : "Report not available"
    }, "View report")));
  })), filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty-state__icon"
  }, /*#__PURE__*/React.createElement(Ico.FilePdf, {
    size: 48
  })), /*#__PURE__*/React.createElement("h3", null, "No filings yet"), /*#__PURE__*/React.createElement("p", null, "Start by uploading your first filing for analysis"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn--primary",
    onClick: function onClick() {
      return onUpload && onUpload();
    },
    style: {
      marginTop: 16
    }
  }, "Upload a filing")));
}

// ============================================================================
// COURT RULES SCREEN
// ============================================================================

function CourtRulesScreen() {
  var _window$FC_DATA3 = window.FC_DATA,
    COURT_RULES = _window$FC_DATA3.COURT_RULES,
    COURTS = _window$FC_DATA3.COURTS;
  var _useStateS3 = useStateS(null),
    _useStateS4 = _slicedToArray(_useStateS3, 2),
    selectedCourt = _useStateS4[0],
    setSelectedCourt = _useStateS4[1];
  var courtsWithRules = useMemoS(function () {
    return COURT_RULES.map(function (rule) {
      return _objectSpread(_objectSpread({}, rule), {}, {
        courtObj: COURTS.find(function (c) {
          return c.name === rule.court;
        })
      });
    });
  }, []);
  var selected = courtsWithRules.find(function (r) {
    return r.court === selectedCourt;
  });
  var categories = selected && selected.categories || [];

  // Normalize a rule entry to { text, auto } - supports plain strings too.
  var normalizeRule = function normalizeRule(r) {
    return typeof r === "string" ? {
      text: r,
      auto: null
    } : r;
  };
  var autoBadge = {
    high: {
      label: "Auto",
      cls: "rule-badge--high",
      title: "Checked automatically with high confidence"
    },
    medium: {
      label: "Partial",
      cls: "rule-badge--medium",
      title: "Partially automated - verify manually"
    },
    manual: {
      label: "Manual",
      cls: "rule-badge--manual",
      title: "Requires manual verification"
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "screen-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "screen-header"
  }, /*#__PURE__*/React.createElement("h1", null, "Court Rules & Guidelines"), /*#__PURE__*/React.createElement("p", null, "Complete rule library for Indian courts")), /*#__PURE__*/React.createElement("div", {
    className: "rules-layout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rules-sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rules-sidebar__label"
  }, "Select a court:"), /*#__PURE__*/React.createElement("div", {
    className: "rules-list"
  }, courtsWithRules.map(function (rule, i) {
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      className: "rules-item" + (selectedCourt === rule.court ? " rules-item--active" : ""),
      onClick: function onClick() {
        return setSelectedCourt(rule.court);
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "rules-item__name"
    }, rule.court), /*#__PURE__*/React.createElement("span", {
      className: "rules-item__count"
    }, rule.count));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rules-main"
  }, selectedCourt ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "rules-header"
  }, /*#__PURE__*/React.createElement("h2", null, selectedCourt), /*#__PURE__*/React.createElement("p", {
    className: "rules-header__subtitle"
  }, selected === null || selected === void 0 ? void 0 : selected.count, " rules"), (selected === null || selected === void 0 ? void 0 : selected.source) && /*#__PURE__*/React.createElement("p", {
    className: "rules-header__source"
  }, selected.source)), categories.map(function (cat, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "rule-category"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "rule-category__name"
    }, cat.name), /*#__PURE__*/React.createElement("div", {
      className: "rule-items"
    }, cat.rules.map(function (r, j) {
      var rule = normalizeRule(r);
      var badge = rule.auto ? autoBadge[rule.auto] : null;
      return /*#__PURE__*/React.createElement("div", {
        key: j,
        className: "rule-item"
      }, /*#__PURE__*/React.createElement("div", {
        className: "rule-item__indicator"
      }), /*#__PURE__*/React.createElement("span", {
        className: "rule-item__text"
      }, rule.text), badge && /*#__PURE__*/React.createElement("span", {
        className: "rule-badge " + badge.cls,
        title: badge.title
      }, badge.label));
    })));
  }), /*#__PURE__*/React.createElement("div", {
    className: "rules-note"
  }, /*#__PURE__*/React.createElement(Ico.Alert, {
    size: 14,
    style: {
      color: "var(--amber-600)"
    }
  }), /*#__PURE__*/React.createElement("span", null, "Rules researched: June 2026 from official court circulars. See COURT_RULES.md for citations. Verify before filing."))) : /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement(Ico.Book, {
    size: 48,
    style: {
      color: "var(--ink-300)"
    }
  }), /*#__PURE__*/React.createElement("h3", null, "Select a court"), /*#__PURE__*/React.createElement("p", null, "Choose a court from the list to see its rules and guidelines")))));
}

// ============================================================================
// HELP SCREEN
// ============================================================================

function HelpScreen(_ref32) {
  var onHome = _ref32.onHome;
  var _useStateS5 = useStateS("getting-started"),
    _useStateS6 = _slicedToArray(_useStateS5, 2),
    activeTab = _useStateS6[0],
    setActiveTab = _useStateS6[1];
  var tabs = [{
    id: "getting-started",
    label: "Getting Started"
  }, {
    id: "faq",
    label: "FAQ"
  }, {
    id: "terms",
    label: "Terms & Disclaimer"
  }, {
    id: "support",
    label: "Support"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "screen-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "screen-header"
  }, /*#__PURE__*/React.createElement("h1", null, "Help & Support"), /*#__PURE__*/React.createElement("p", null, "Learn how to use myfiling.ai effectively")), /*#__PURE__*/React.createElement("div", {
    className: "help-tabs"
  }, tabs.map(function (tab) {
    return /*#__PURE__*/React.createElement("button", {
      key: tab.id,
      className: "help-tab" + (activeTab === tab.id ? " help-tab--active" : ""),
      onClick: function onClick() {
        return setActiveTab(tab.id);
      }
    }, tab.label);
  })), /*#__PURE__*/React.createElement("div", {
    className: "help-content"
  }, activeTab === "getting-started" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Getting Started with myfiling.ai"), /*#__PURE__*/React.createElement("div", {
    className: "help-section"
  }, /*#__PURE__*/React.createElement("h3", null, "Step 1: Upload Your Filing"), /*#__PURE__*/React.createElement("p", null, "Drag and drop your PDF filing onto the upload area, or click to browse your computer. The file must be a text-based PDF (not scanned images).")), /*#__PURE__*/React.createElement("div", {
    className: "help-section"
  }, /*#__PURE__*/React.createElement("h3", null, "Step 2: Select Court & Case Type"), /*#__PURE__*/React.createElement("p", null, "Choose the court where you're filing and the case type (Writ Petition, SLP, etc.). This ensures we apply the right rules.")), /*#__PURE__*/React.createElement("div", {
    className: "help-section"
  }, /*#__PURE__*/React.createElement("h3", null, "Step 3: Review Your Analysis"), /*#__PURE__*/React.createElement("p", null, "We scan your document and identify defects. Each defect shows the page number, severity level, and the court rule it violates.")), /*#__PURE__*/React.createElement("div", {
    className: "help-section"
  }, /*#__PURE__*/React.createElement("h3", null, "Step 4: Fix & Re-upload"), /*#__PURE__*/React.createElement("p", null, "Use our suggested fixes to correct each defect. When ready, upload the revised version for re-analysis.")), /*#__PURE__*/React.createElement("div", {
    className: "help-section"
  }, /*#__PURE__*/React.createElement("h3", null, "Step 5: Download & Share"), /*#__PURE__*/React.createElement("p", null, "Download the defect report to share with your team or client. Use the share button to collaborate with co-counsel."))), activeTab === "faq" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Frequently Asked Questions"), /*#__PURE__*/React.createElement("div", {
    className: "faq-item"
  }, /*#__PURE__*/React.createElement("h3", null, "What file formats do you support?"), /*#__PURE__*/React.createElement("p", null, "Currently, we accept PDF files only. The PDF must contain extractable text (not just scanned images). For scanned PDFs, use OCR software first.")), /*#__PURE__*/React.createElement("div", {
    className: "faq-item"
  }, /*#__PURE__*/React.createElement("h3", null, "Does the tool guarantee my filing will pass?"), /*#__PURE__*/React.createElement("p", null, "No. The Filing Readiness Score is indicative only \u2014 it reflects formatting and registry-filing requirements, not the legal merit of your matter, and registry scrutiny involves human discretion we can't fully automate. Always have a qualified advocate review your filing before submission.")), /*#__PURE__*/React.createElement("div", {
    className: "faq-item"
  }, /*#__PURE__*/React.createElement("h3", null, "What courts do you cover?"), /*#__PURE__*/React.createElement("p", null, "We're rolling out support court by court \u2014 select your court at upload to see what's currently available. We're expanding coverage based on user demand.")), /*#__PURE__*/React.createElement("div", {
    className: "faq-item"
  }, /*#__PURE__*/React.createElement("h3", null, "How accurate is the analysis?"), /*#__PURE__*/React.createElement("p", null, "Our rules are based on official court guidelines. However, rules change periodically. We update our database quarterly. Always verify critical requirements with the court.")), /*#__PURE__*/React.createElement("div", {
    className: "faq-item"
  }, /*#__PURE__*/React.createElement("h3", null, "Is my filing data secure?"), /*#__PURE__*/React.createElement("p", null, "Yes. Your uploaded PDFs are processed in real-time and deleted immediately after analysis. We don't store your documents. See our Privacy Policy for details.")), /*#__PURE__*/React.createElement("div", {
    className: "faq-item"
  }, /*#__PURE__*/React.createElement("h3", null, "Can I use this instead of a lawyer?"), /*#__PURE__*/React.createElement("p", null, "No. This tool helps catch obvious defects, but it's not a substitute for legal advice. Always review filings with a qualified advocate before submission."))), activeTab === "terms" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Terms & Disclaimer"), /*#__PURE__*/React.createElement("div", {
    className: "terms-section",
    style: {
      background: "var(--blue-50)",
      padding: 16,
      borderRadius: "var(--radius-md)",
      border: "1px solid #D6E1FB",
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      marginTop: 0
    }
  }, "How myfiling.ai Works"), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "myfiling.ai checks your filings"), " against the court's formatting and registry-filing requirements (paper, margins, type, pagination, index, court fee, vakalatnama, limitation, certified copy, affidavit). The Filing Readiness Score helps you understand your filing's registry-compliance level. This is a ", /*#__PURE__*/React.createElement("strong", null, "tool to catch common defects early"), " and save time on your drafting workflow \u2014 not a substitute for legal review."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Important:"), " While highly accurate, we recommend having your advocate review the final filing before submission, as with any important legal document.")), /*#__PURE__*/React.createElement("div", {
    className: "terms-section"
  }, /*#__PURE__*/React.createElement("h3", null, "Limitations of the Tool"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "Cannot evaluate legal merit or substance of claims"), /*#__PURE__*/React.createElement("li", null, "Cannot predict human discretion by court staff"), /*#__PURE__*/React.createElement("li", null, "Cannot account for rule changes that occur between updates"), /*#__PURE__*/React.createElement("li", null, "May miss issues specific to your court or jurisdiction"), /*#__PURE__*/React.createElement("li", null, "Does not provide legal advice or representation"))), /*#__PURE__*/React.createElement("div", {
    className: "terms-section"
  }, /*#__PURE__*/React.createElement("h3", null, "Your Responsibility"), /*#__PURE__*/React.createElement("p", null, "You are responsible for ensuring your filing is legally sound and complete. You must have a qualified advocate review your filing before submission. myfiling.ai is a tool to assist in formatting compliance, not a substitute for legal judgment.")), /*#__PURE__*/React.createElement("div", {
    className: "terms-section"
  }, /*#__PURE__*/React.createElement("h3", null, "Liability Limitation"), /*#__PURE__*/React.createElement("p", null, "myfiling.ai is provided \"as is\" without warranties. We are not liable for filing rejections, delays, or adverse consequences resulting from reliance on this tool. Use at your own risk."))), activeTab === "support" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Get Help"), /*#__PURE__*/React.createElement("div", {
    className: "help-section"
  }, /*#__PURE__*/React.createElement("h3", null, "\uD83D\uDCE7 Email Support"), /*#__PURE__*/React.createElement("p", null, "For questions or issues: ", /*#__PURE__*/React.createElement("strong", null, "support@myfiling.ai")), /*#__PURE__*/React.createElement("p", null, "Response time: Within 24 hours")), /*#__PURE__*/React.createElement("div", {
    className: "help-section"
  }, /*#__PURE__*/React.createElement("h3", null, "\uD83D\uDCAC Chat Support"), /*#__PURE__*/React.createElement("p", null, "Available during business hours (9 AM - 6 PM IST, Monday-Friday)"), /*#__PURE__*/React.createElement("p", null, "Click the chat icon in the bottom-right corner of the app")), /*#__PURE__*/React.createElement("div", {
    className: "help-section"
  }, /*#__PURE__*/React.createElement("h3", null, "\uD83D\uDCDA Documentation"), /*#__PURE__*/React.createElement("p", null, "Check our detailed guides:"), /*#__PURE__*/React.createElement("ul", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Getting Started Guide"), " \u2014 How to upload and analyze"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Court Rules Library"), " \u2014 Rules for each court"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "FAQ"), " \u2014 Common questions"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Video Tutorials"), " \u2014 Visual walkthrough"))), /*#__PURE__*/React.createElement("div", {
    className: "help-section"
  }, /*#__PURE__*/React.createElement("h3", null, "\uD83D\uDC1B Report a Bug"), /*#__PURE__*/React.createElement("p", null, "Found an issue? Let us know: ", /*#__PURE__*/React.createElement("strong", null, "bugs@myfiling.ai")), /*#__PURE__*/React.createElement("p", null, "Include: what you were doing, what happened, and your browser")), /*#__PURE__*/React.createElement("div", {
    className: "help-section"
  }, /*#__PURE__*/React.createElement("h3", null, "\uD83D\uDCA1 Suggest a Feature"), /*#__PURE__*/React.createElement("p", null, "Have an idea? We'd love to hear it: ", /*#__PURE__*/React.createElement("strong", null, "features@myfiling.ai")), /*#__PURE__*/React.createElement("p", null, "Tell us what feature would help you most")), /*#__PURE__*/React.createElement("div", {
    className: "help-section",
    style: {
      background: "var(--blue-50)",
      padding: 16,
      borderRadius: "var(--radius-md)",
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Ready to analyze your next filing?")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn--primary",
    onClick: onHome,
    style: {
      marginTop: 12
    }
  }, "Go Back to Dashboard")))));
}
window.HistoryScreen = HistoryScreen;
window.CourtRulesScreen = CourtRulesScreen;
window.HelpScreen = HelpScreen;

// Indian courts and tribunals for filing selection.
// High Court (Delhi) is the first launch court; Supreme Court is queued next.
// The active court is listed first so COURTS[0] resolves to an enabled court.
var COURTS = [{
  id: "dhc",
  name: "Delhi High Court",
  "short": "DHC",
  enabled: true,
  comingSoon: false
}, {
  id: "sc",
  name: "Supreme Court of India",
  "short": "SC",
  enabled: false,
  comingSoon: true
}, {
  id: "bhc",
  name: "Bombay High Court",
  "short": "BHC",
  enabled: false,
  comingSoon: true
}, {
  id: "chc",
  name: "Calcutta High Court",
  "short": "CHC",
  enabled: false,
  comingSoon: true
}, {
  id: "mhc",
  name: "Madras High Court",
  "short": "MHC",
  enabled: false,
  comingSoon: true
}, {
  id: "khc",
  name: "Karnataka High Court",
  "short": "KHC",
  enabled: false,
  comingSoon: true
}, {
  id: "nclt",
  name: "National Company Law Tribunal",
  "short": "NCLT",
  enabled: false,
  comingSoon: true
}, {
  id: "kat",
  name: "Kathmandu District Court (Test)",
  "short": "KAT",
  enabled: false,
  comingSoon: true
}];
COURTS;
// Types of legal cases that can be filed
var CASE_TYPES = [{
  id: "wp",
  name: "Writ Petition (Civil)"
}, {
  id: "wpc",
  name: "Writ Petition (Criminal)"
}, {
  id: "slp",
  name: "Special Leave Petition"
}, {
  id: "ca",
  name: "Civil Appeal"
}, {
  id: "cra",
  name: "Criminal Appeal"
}, {
  id: "rp",
  name: "Review Petition"
}, {
  id: "tp",
  name: "Transfer Petition"
}];
CASE_TYPES;
// Defect profiles: Critical, Medium (Minor), Excellent (Warnings only)

// CRITICAL PROFILE: 3 critical defects = 40 - (3 * 10) = 10%
var CRITICAL_DEFECTS = [{
  id: "d1",
  title: "Court Fee Stamp Missing",
  severity: "critical",
  page: 1,
  desc: "No e-stamp or affixed court fee on the cover page. Filing without prescribed court fee will be rejected at Registry scrutiny.",
  rule: "Supreme Court Rules, 2013 - Order IV, Rule 1(a); Court Fees Act Schedule II. Court fee of ₹250 required on first page.",
  fix: "Affix prescribed court fee stamp (e-stamp via SHCIL or physical stamp) on cover page. Re-upload the corrected PDF."
}, {
  id: "d2",
  title: "Vakalatnama Not Found",
  severity: "critical",
  page: 2,
  desc: "No executed Vakalatnama between cover page and index. Counsel authorization is mandatory; filing without it is rejected.",
  rule: "SC Rules, 2013 - Order IV, Rule 7. Vakalatnama must be signed by petitioner and accepted by Advocate-on-Record.",
  fix: "Insert signed Vakalatnama immediately after cover page. Ensure clear AOR stamp and registration number visible."
}, {
  id: "d3",
  title: "Affidavit Not Notarized",
  severity: "critical",
  page: 8,
  desc: "Verifying affidavit lacks notary seal. Unattested affidavits are routinely returned by the Registry without scrutiny.",
  rule: "SC Rules - Order XIX, Rule 3 read with Notaries Act, 1952, §8. Affidavit must be sworn before Notary Public.",
  fix: "Get affidavit notarized by Notary Public. Replace page with attested version. Ensure notary seal is legible."
}];

// MEDIUM PROFILE: 2 minor defects = 100 - (2 * 15) = 70% (safe to file, but has issues)
var MEDIUM_DEFECTS = [{
  id: "d6",
  title: "Cause Title Missing 'Through:' Line",
  severity: "minor",
  page: 1,
  desc: "Cause title lacks 'Through: [Advocate name & AOR number]' line. Incomplete cause title causes Registry queries.",
  rule: "SC Rules - Order IV, Rule 1(b) and Form No. 1. Cause title must include counsel representation.",
  fix: "Add 'Through: [Counsel name], Advocate-on-Record (Reg. No.)' line after respondent array."
}, {
  id: "d7",
  title: "Index Page References Mismatch",
  severity: "minor",
  page: 2,
  desc: "Index lists Annexure P-5 at Page 42, but P-5 actually begins Page 44. Pagination mismatch causes Registry correspondence.",
  rule: "SC Rules - Order IV, Rule 4. Index must accurately reflect page numbers of document sections.",
  fix: "Manually verify index against bound document. Correct all page numbers. Re-paginate if needed."
}, {
  id: "d10",
  title: "Insufficient Left Margin",
  severity: "warning",
  page: "3–50",
  desc: "Left margin measures 1.8cm; minimum is 2.5cm. May prevent proper binding. Not grounds for rejection.",
  rule: "SC Practice Direction - Minimum left margin of 2.5cm required for proper binding.",
  fix: "Re-print all pages with 2.5cm left margin. Recommend 3cm to ensure safe binding."
}];

// EXCELLENT PROFILE: 0 critical, 0 minor, warnings only = 93% (nearly perfect, but not 100%)
var EXCELLENT_DEFECTS = [{
  id: "d11",
  title: "Affidavit Deponent Name Clarity",
  severity: "warning",
  page: 8,
  desc: "Affidavit deponent's printed name is slightly small but readable. Best practice: make it more prominent.",
  rule: "SC Rules - Deponent should be clearly identified for audit trail. Current format is acceptable.",
  fix: "Optional: Increase deponent name font size slightly for better visibility."
}, {
  id: "d12",
  title: "Certified Copy Stamp Format",
  severity: "warning",
  page: "14, 16",
  desc: "Certified copy attestation uses acceptable wording. Standard format would enhance consistency.",
  rule: "SC Practice Direction - Attestation format is acceptable. Standard format recommended for best practice.",
  fix: "Optional: Revise attestation to read: 'Certified true copy of the original. Attested by: [Signature] [Date]'."
}];
var ALL_DEFECTS = [].concat(CRITICAL_DEFECTS, MEDIUM_DEFECTS, EXCELLENT_DEFECTS);
{
  CRITICAL_DEFECTS, MEDIUM_DEFECTS, EXCELLENT_DEFECTS, ALL_DEFECTS;
}
;
// Sample filings for demo and testing (removed for production)

var SAMPLE_FILES = [];
var RECENT = [];

// ---------------------------------------------------------------------------
// COURT RULES LIBRARY
// Detailed, court-specific rules with exact specifications and legal source.
// Researched 15 Jun 2026 from official court circulars / Rules - see
// COURT_RULES.md at the repo root for full citations and automation ratings.
// `auto` field: "high" | "medium" | "manual" - detector confidence.
// ---------------------------------------------------------------------------

var COURT_RULES = [{
  court: "Supreme Court of India",
  source: "SC Rules 2013 · Circular 05-03-2020 (w.e.f. 01-04-2020) · e-Filing Rules",
  categories: [{
    name: "Paper, Font & Margins (Circular 05-03-2020)",
    rules: [{
      text: "Paper size: A4 - 29.7 cm × 21 cm",
      auto: "high"
    }, {
      text: "Paper weight: not less than 75 GSM (superior quality)",
      auto: "manual"
    }, {
      text: "Font: Times New Roman",
      auto: "medium"
    }, {
      text: "Body font size: 14 pt",
      auto: "high"
    }, {
      text: "Line spacing: 1.5 (body)",
      auto: "high"
    }, {
      text: "Quotations & indents: 12 pt, single line spacing",
      auto: "high"
    }, {
      text: "Left margin: 4 cm",
      auto: "high"
    }, {
      text: "Right margin: 4 cm",
      auto: "high"
    }, {
      text: "Top margin: 2 cm",
      auto: "high"
    }, {
      text: "Bottom margin: 2 cm",
      auto: "high"
    }]
  }, {
    name: "Document Structure (Order IV / Order XXI)",
    rules: [{
      text: "Pages numbered consecutively & noted in Index",
      auto: "high"
    }, {
      text: "Index page references match actual section start pages",
      auto: "medium"
    }, {
      text: "Papers arranged per Order XXI r.3(1)(f)",
      auto: "medium"
    }, {
      text: "Synopsis & List of Dates (chronological events)",
      auto: "medium"
    }, {
      text: "Certified copy of impugned judgment / order",
      auto: "manual"
    }]
  }, {
    name: "Legal Documents",
    rules: [{
      text: "Cause title includes 'Through: [AOR name], (Reg. No.)'",
      auto: "medium"
    }, {
      text: "Vakalatnama executed & accepted by Advocate-on-Record",
      auto: "medium"
    }, {
      text: "Only an AOR may act / file for a party (Order IV)",
      auto: "manual"
    }, {
      text: "Verifying affidavit sworn before a Notary Public (Order XIX r.3)",
      auto: "manual"
    }]
  }, {
    name: "Court Fees (Third Schedule)",
    rules: [{
      text: "SLP: ₹1,500 (ordinary) / ₹5,000 (special category)",
      auto: "manual"
    }, {
      text: "Each application (IA): ₹200",
      auto: "manual"
    }, {
      text: "Court-fee stamp / e-stamp affixed on cover page",
      auto: "medium"
    }]
  }, {
    name: "E-Filing (e-Filing Rules / Manual)",
    rules: [{
      text: "PDF format only",
      auto: "high"
    }, {
      text: "Searchable / OCR'd text layer (not pure image)",
      auto: "high"
    }, {
      text: "PDF bookmarks / outline present",
      auto: "high"
    }, {
      text: "Continuous pagination throughout",
      auto: "high"
    }]
  }]
}, {
  court: "Delhi High Court",
  source: "Practice Direction 74/Rules/DHC (w.e.f. 01-04-2021) · PD 90 (double-sided, 01-11-2022)",
  categories: [{
    name: "Paper, Font & Margins (PD 74/Rules/DHC)",
    rules: [{
      text: "Paper size: A4 - 29.7 cm × 21 cm",
      auto: "high"
    }, {
      text: "Paper weight: not less than 75 GSM",
      auto: "manual"
    }, {
      text: "Font: Times New Roman",
      auto: "medium"
    }, {
      text: "Body font size: 14 pt",
      auto: "high"
    }, {
      text: "Line spacing: 1.5 (body)",
      auto: "high"
    }, {
      text: "Quotations & indents: 12 pt, single line spacing",
      auto: "high"
    }, {
      text: "Left margin: 4 cm",
      auto: "high"
    }, {
      text: "Right margin: 4 cm",
      auto: "high"
    }, {
      text: "Top margin: 2 cm",
      auto: "high"
    }, {
      text: "Bottom margin: 2 cm",
      auto: "high"
    }, {
      text: "Double-sided printing allowed (PD 90, from 01-11-2022)",
      auto: "manual"
    }]
  }, {
    name: "Scope",
    rules: [{
      text: "Applies to High Court AND all Delhi District Courts",
      auto: "manual"
    }, {
      text: "Covers pleadings, affidavits, applications, appeals, orders",
      auto: "manual"
    }]
  }, {
    name: "Court Fees (DHC Rules, Chapter 4)",
    rules: [{
      text: "Governed by Court Fees Act (amount varies by case type / valuation)",
      auto: "manual"
    }, {
      text: "Court-fee stamp present",
      auto: "medium"
    }]
  }]
}, {
  court: "Bombay High Court",
  source: "Circular No. Rule/E1604/2021 dated 14-07-2021 (amending Appellate Side Rules 1960 & Original Side Rules 1980)",
  categories: [{
    name: "Paper, Font & Margins",
    rules: [{
      text: "Paper size: A4",
      auto: "high"
    }, {
      text: "Paper weight: not less than 75 GSM",
      auto: "manual"
    }, {
      text: "Printing: both sides",
      auto: "manual"
    }, {
      text: "Font: Times New Roman OR Georgia",
      auto: "medium"
    }, {
      text: "Font size: 14 pt",
      auto: "high"
    }, {
      text: "Inner (binding-side) margin: 5 cm",
      auto: "high"
    }, {
      text: "Outer margin: 3 cm",
      auto: "high"
    }]
  }]
}, {
  court: "Calcutta High Court",
  source: "Calcutta HC Gazette Notification - A4 white bond paper (figures marked * follow SC uniform standard; verify primary notification)",
  categories: [{
    name: "Paper, Font & Margins",
    rules: [{
      text: "Paper size: A4 (white Bond paper, replacing green)",
      auto: "high"
    }, {
      text: "Font: Times New Roman *",
      auto: "medium"
    }, {
      text: "Font size: 14 pt *",
      auto: "high"
    }, {
      text: "Line spacing: 1.5 *",
      auto: "high"
    }, {
      text: "Margins: 4 cm L/R, 2 cm T/B * (verify exact figures)",
      auto: "medium"
    }]
  }]
}, {
  court: "Madras High Court",
  source: "Madras HC direction - A4, min 75 GSM, both-sided (figures marked * follow SC uniform standard; verify primary notification)",
  categories: [{
    name: "Paper, Font & Margins",
    rules: [{
      text: "Paper size: A4",
      auto: "high"
    }, {
      text: "Paper weight: minimum 75 GSM",
      auto: "manual"
    }, {
      text: "Printing: both sides (mandated)",
      auto: "manual"
    }, {
      text: "Font: Times New Roman *",
      auto: "medium"
    }, {
      text: "Font size: 14 pt *",
      auto: "high"
    }, {
      text: "Margins: 4 cm L/R, 2 cm T/B * (verify exact figures)",
      auto: "medium"
    }]
  }]
}];

// Derive the rule count for each court from its categories.
COURT_RULES.forEach(function (c) {
  c.count = (c.categories || []).reduce(function (n, cat) {
    return n + cat.rules.length;
  }, 0);
});
{
  SAMPLE_FILES, RECENT, COURT_RULES;
}
;

// Filing-readiness score - MIRRORS server.py:calculate_score so the demo/preset
// path and any client-side computation agree with the backend. For real
// analyses the score comes from the API (data.score); this is the fallback.

function calculateScore(defectsToUse, presetScore) {
  if (presetScore !== undefined) {
    return presetScore;
  }
  var critical = defectsToUse.filter(function (d) {
    return d.severity === "critical";
  }).length;
  var warning = defectsToUse.filter(function (d) {
    return d.severity === "warning";
  }).length;
  var minor = defectsToUse.filter(function (d) {
    return d.severity === "minor";
  }).length;
  var score;
  if (critical > 0) {
    score = 45 - (critical - 1) * 12 - warning * 2 - minor;
  } else {
    score = 100 - warning * 6 - minor * 2;
    if (warning <= 2) score = Math.max(80, score);
    score = Math.max(55, score);
  }
  return Math.max(0, Math.min(100, score));
}

// Score band: green (75+) likely registry-ready, amber (45-74) fix issues,
// red (<45) must fix. Labels reframed (advocate audit): the tool checks
// formatting + filing-requirement presence, not legal merit, so we avoid
// "safe to file" guarantees.
function getScoreBand(score) {
  if (score >= 75) return {
    color: "#119366",
    label: "Likely registry-ready",
    soft: "#D8F0E6"
  };
  if (score >= 45) return {
    color: "#C2790B",
    label: "Fix issues before filing",
    soft: "#FBEFD7"
  };
  return {
    color: "#D6293E",
    label: "Not ready - must fix",
    soft: "#FBDCE0"
  };
}
{
  calculateScore, getScoreBand;
}
;

// Printable filing report - opens a clean, self-contained report in a new window
// and invokes the browser's print dialog (the user saves as PDF). This makes the
// "Download Report" button deliver a real artifact an advocate can keep or hand
// to a clerk, instead of a placeholder toast.
//
// ADVOCATE AUDIT: a downloadable report + a Filing Readiness Checklist were the
// top "would-pay-for" items. The report leads with the readiness checklist
// (pass/needs-attention per check), then the full defect list with remediation.

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Build a Filing Readiness Checklist from the per-check breakdown the API sends.
function readinessRows(stats) {
  var checks = stats && stats.checks || [];
  return checks.map(function (c) {
    var status = c.status === "pass" ? "Pass" : c.status === "fail" ? "Action required" : "Review";
    return {
      name: c.name,
      rule: c.rule,
      status: status,
      raw: c.status,
      detail: c.defects ? "".concat(c.defects, " issue").concat(c.defects === 1 ? "" : "s") : "-"
    };
  });
}
function downloadReport(session) {
  var s = session || {};
  var stats = s.stats || {};
  var defects = s.defectsToUse || [];
  var score = s.score != null ? s.score : 0;
  var band = typeof getScoreBand === "function" ? getScoreBand(score) : {
    label: "",
    color: "#0A1628"
  };
  var when = new Date(s.createdAt || Date.now()).toLocaleString();
  var fileName = s.file && s.file.name || "filing.pdf";
  var court = s.court && (s.court["short"] || s.court.name) || "-";
  var caseType = s.caseType && s.caseType.name || "-";
  var sevRank = {
    critical: 0,
    warning: 1,
    minor: 2
  };
  var sorted = _toConsumableArray(defects).sort(function (a, b) {
    var _sevRank$a$severity, _sevRank$b$severity;
    return ((_sevRank$a$severity = sevRank[a.severity]) !== null && _sevRank$a$severity !== void 0 ? _sevRank$a$severity : 3) - ((_sevRank$b$severity = sevRank[b.severity]) !== null && _sevRank$b$severity !== void 0 ? _sevRank$b$severity : 3) || a.page - b.page;
  });
  var checklist = readinessRows(stats);
  var checklistHtml = checklist.length ? checklist.map(function (r) {
    return "\n    <tr>\n      <td>".concat(escapeHtml(r.name), "<div class=\"rule\">").concat(escapeHtml(r.rule), "</div></td>\n      <td class=\"status status--").concat(escapeHtml(r.raw), "\">").concat(escapeHtml(r.status), "</td>\n      <td>").concat(escapeHtml(r.detail), "</td>\n    </tr>");
  }).join("") : "<tr><td colspan=\"3\">No checks recorded.</td></tr>";
  var defectsHtml = sorted.length ? sorted.map(function (d) {
    return "\n    <div class=\"defect defect--".concat(escapeHtml(d.severity), "\">\n      <div class=\"defect__head\">\n        <span class=\"sev sev--").concat(escapeHtml(d.severity), "\">").concat(escapeHtml(d.severity), "</span>\n        <span class=\"defect__title\">").concat(escapeHtml(d.title), "</span>\n        <span class=\"defect__page\">p.").concat(escapeHtml(d.page), "</span>\n      </div>\n      <div class=\"defect__desc\">").concat(escapeHtml(d.desc), "</div>\n      <div class=\"defect__rule\"><strong>Rule:</strong> ").concat(escapeHtml(d.rule), "</div>\n      <div class=\"defect__fix\"><strong>What to do:</strong> ").concat(escapeHtml(d.fix), "</div>\n    </div>");
  }).join("") : "<p class=\"none\">No defects detected. Have a qualified advocate review before filing.</p>";
  var counts = {
    critical: defects.filter(function (d) {
      return d.severity === "critical";
    }).length,
    warning: defects.filter(function (d) {
      return d.severity === "warning";
    }).length,
    minor: defects.filter(function (d) {
      return d.severity === "minor";
    }).length
  };
  var html = "<!doctype html><html><head><meta charset=\"utf-8\">\n  <title>Filing Readiness Report \u2014 ".concat(escapeHtml(fileName), "</title>\n  <style>\n    * { box-sizing: border-box; }\n    body { font-family: Georgia, \"Times New Roman\", serif; color: #11203B; margin: 0; padding: 40px; line-height: 1.5; }\n    h1 { font-size: 22px; margin: 0 0 4px; }\n    h2 { font-size: 15px; margin: 28px 0 10px; border-bottom: 2px solid #11203B; padding-bottom: 4px; }\n    .sub { color: #5B6577; font-size: 12px; }\n    .meta { margin: 16px 0; font-size: 12px; color: #2A3344; }\n    .meta span { display: inline-block; margin-right: 18px; }\n    .scorebox { display: flex; align-items: center; gap: 16px; margin: 16px 0 8px; padding: 14px 18px; border: 1px solid #E5E8EE; border-radius: 10px; }\n    .scorenum { font-size: 40px; font-weight: 700; line-height: 1; color: ").concat(band.color, "; }\n    .scoreband { font-size: 14px; font-weight: 700; color: ").concat(band.color, "; }\n    .summary { font-size: 12px; color: #5B6577; }\n    table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; }\n    th { text-align: left; color: #5B6577; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; padding: 6px 8px; border-bottom: 1px solid #E5E8EE; }\n    td { padding: 8px; border-bottom: 1px solid #EEF1F5; vertical-align: top; }\n    .rule { color: #828B9D; font-size: 10px; margin-top: 2px; }\n    .status { font-weight: 700; white-space: nowrap; }\n    .status--pass { color: #167A3C; } .status--warn { color: #B0640A; } .status--fail { color: #C2261B; }\n    .defect { border: 1px solid #E5E8EE; border-left: 3px solid #B7BECC; border-radius: 8px; padding: 12px 14px; margin: 10px 0; page-break-inside: avoid; }\n    .defect--critical { border-left-color: #D6293E; } .defect--warning { border-left-color: #C2790B; } .defect--minor { border-left-color: #B9BCD4; }\n    .defect__head { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }\n    .defect__title { font-weight: 700; font-family: Arial, sans-serif; font-size: 13px; flex: 1; }\n    .defect__page { color: #828B9D; font-family: Arial, sans-serif; font-size: 11px; }\n    .sev { font-family: Arial, sans-serif; font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; }\n    .sev--critical { background: #FEECEC; color: #C2261B; } .sev--warning { background: #FFF7E0; color: #A16207; } .sev--minor { background: #FCF1DF; color: #B0640A; }\n    .defect__desc, .defect__rule, .defect__fix { font-family: Arial, sans-serif; font-size: 11.5px; color: #2A3344; margin-top: 4px; }\n    .defect__rule { color: #5B6577; } .none { color: #167A3C; font-family: Arial, sans-serif; }\n    .disclaimer { margin-top: 28px; padding: 12px 14px; background: #F7F8FB; border: 1px solid #E5E8EE; border-radius: 8px; font-family: Arial, sans-serif; font-size: 10.5px; color: #5B6577; }\n    @media print { body { padding: 0; } @page { margin: 18mm; } }\n  </style></head><body>\n    <h1>Filing Readiness Report</h1>\n    <div class=\"sub\">myfiling.ai \u2014 formatting &amp; registry-requirement scrutiny</div>\n    <div class=\"meta\">\n      <span><strong>File:</strong> ").concat(escapeHtml(fileName), "</span>\n      <span><strong>Court:</strong> ").concat(escapeHtml(court), "</span>\n      <span><strong>Case type:</strong> ").concat(escapeHtml(caseType), "</span>\n      <span><strong>Generated:</strong> ").concat(escapeHtml(when), "</span>\n    </div>\n    <div class=\"scorebox\">\n      <div class=\"scorenum\">").concat(escapeHtml(score), "</div>\n      <div>\n        <div class=\"scoreband\">").concat(escapeHtml(band.label), "</div>\n        <div class=\"summary\">").concat(counts.critical, " critical \xB7 ").concat(counts.warning, " warning \xB7 ").concat(counts.minor, " minor</div>\n      </div>\n    </div>\n\n    <h2>Filing Readiness Checklist</h2>\n    <table>\n      <thead><tr><th>Check</th><th>Status</th><th>Detail</th></tr></thead>\n      <tbody>").concat(checklistHtml, "</tbody>\n    </table>\n\n    <h2>Defects &amp; Remediation</h2>\n    ").concat(defectsHtml, "\n\n    <div class=\"disclaimer\">\n      This report covers <strong>formatting and registry-filing requirements</strong>\n      (paper, margins, type, pagination, index, court fee, vakalatnama, limitation,\n      certified copy, affidavit). It does <strong>not</strong> assess the legal merit\n      or substance of the matter, and is not a guarantee against registry objection.\n      Have a qualified advocate review the filing before submission.\n    </div>\n    <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };</script>\n  </body></html>");
  var w = window.open("", "_blank");
  if (!w) return false; // popup blocked - caller can toast a hint
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}
{
  downloadReport;
}
;

// Filter and sort defects by severity

function filterDefectsBySeverity(defects, severity) {
  if (severity === "all") return defects;
  return defects.filter(function (d) {
    return d.severity === severity;
  });
}
function sortDefectsBySeverity(defects) {
  var sevOrder = {
    critical: 0,
    minor: 1,
    warning: 2
  };
  return _toConsumableArray(defects).sort(function (a, b) {
    return sevOrder[a.severity] - sevOrder[b.severity];
  });
}
function countDefectsBySeverity(defects) {
  return {
    all: defects.length,
    critical: defects.filter(function (d) {
      return d.severity === "critical";
    }).length,
    minor: defects.filter(function (d) {
      return d.severity === "minor";
    }).length,
    warning: defects.filter(function (d) {
      return d.severity === "warning";
    }).length
  };
}
{
  filterDefectsBySeverity, sortDefectsBySeverity, countDefectsBySeverity;
}
;
// File upload and validation logic

function validatePdfFile(file) {
  if (!file) return null;
  if (!/\.pdf$/i.test(file.name)) {
    return {
      valid: false,
      error: {
        title: "Unsupported file type",
        details: "Received \"".concat(file.name, "\". myfiling.ai currently only accepts PDF files.")
      }
    };
  }
  return {
    valid: true
  };
}
function formatFileSize(bytes) {
  var mb = (bytes / (1024 * 1024)).toFixed(1);
  return "".concat(mb, " MB");
}
function createFileObject(file) {
  return {
    name: file.name,
    size: formatFileSize(file.size)
  };
}
{
  validatePdfFile, formatFileSize, createFileObject;
}
;
// app.jsx - root App, ties screens together
var _React7 = React,
  useStateA = _React7.useState,
  useEffectA = _React7.useEffect;

// --- Recent filings: server-side (SQLite via /api/recents) ------------------
// The backend records each completed analysis in SQLite and returns the full
// result snapshot, so reopening a recent shows the cached report. The frontend
// just fetches the list; it no longer stores anything in the browser.
function fetchRecents() {
  return _fetchRecents.apply(this, arguments);
}
function _fetchRecents() {
  _fetchRecents = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
    var res, data, _t8;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.p = _context7.n) {
        case 0:
          _context7.p = 0;
          _context7.n = 1;
          return fetch("/api/recents", {
            credentials: "same-origin"
          });
        case 1:
          res = _context7.v;
          if (res.ok) {
            _context7.n = 2;
            break;
          }
          return _context7.a(2, []);
        case 2:
          _context7.n = 3;
          return res.json();
        case 3:
          data = _context7.v;
          return _context7.a(2, Array.isArray(data.recents) ? data.recents : []);
        case 4:
          _context7.p = 4;
          _t8 = _context7.v;
          return _context7.a(2, []);
      }
    }, _callee7, null, [[0, 4]]);
  }));
  return _fetchRecents.apply(this, arguments);
}
function relativeWhen(iso) {
  var d = iso ? new Date(iso) : new Date();
  var mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return mins + "m ago";
  var hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  var days = Math.round(hrs / 24);
  return days + "d ago";
}
var TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "showSidebar": true
} /*EDITMODE-END*/;
function App() {
  var _useTweaks = useTweaks(TWEAK_DEFAULTS),
    _useTweaks2 = _slicedToArray(_useTweaks, 2),
    t = _useTweaks2[0],
    setTweak = _useTweaks2[1];
  var _useStateA = useStateA("upload"),
    _useStateA2 = _slicedToArray(_useStateA, 2),
    screen = _useStateA2[0],
    setScreen = _useStateA2[1]; // upload | analysing | results | error | history | rules | help
  var _useStateA3 = useStateA(null),
    _useStateA4 = _slicedToArray(_useStateA3, 2),
    session = _useStateA4[0],
    setSession = _useStateA4[1];
  var _useStateA5 = useStateA(null),
    _useStateA6 = _slicedToArray(_useStateA5, 2),
    errorMsg = _useStateA6[0],
    setErrorMsg = _useStateA6[1];
  var _useStateA7 = useStateA(null),
    _useStateA8 = _slicedToArray(_useStateA7, 2),
    toast = _useStateA8[0],
    setToast = _useStateA8[1];
  var _useStateA9 = useStateA("dashboard"),
    _useStateA0 = _slicedToArray(_useStateA9, 2),
    navActive = _useStateA0[0],
    setNavActive = _useStateA0[1];
  var _useStateA1 = useStateA([]),
    _useStateA10 = _slicedToArray(_useStateA1, 2),
    recents = _useStateA10[0],
    setRecents = _useStateA10[1];

  // Auth gate: `user` is null when logged out; `authChecked` flips true once the
  // initial /api/auth/me has resolved (so we don't flash the login screen).
  var _useStateA11 = useStateA(null),
    _useStateA12 = _slicedToArray(_useStateA11, 2),
    user = _useStateA12[0],
    setUser = _useStateA12[1];
  var _useStateA13 = useStateA(false),
    _useStateA14 = _slicedToArray(_useStateA13, 2),
    authChecked = _useStateA14[0],
    setAuthChecked = _useStateA14[1];

  // On startup, check whether there's an existing session, then load recents.
  useEffectA(function () {
    window.apiMe().then(function (u) {
      setUser(u);
      setAuthChecked(true);
      if (u) fetchRecents().then(setRecents);
    });
  }, []);
  var onAuthed = function onAuthed(u) {
    setUser(u);
    setScreen("upload");
    setNavActive("dashboard");
    fetchRecents().then(setRecents);
  };
  var onLogout = /*#__PURE__*/function () {
    var _ref33 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            _context2.n = 1;
            return window.apiLogout();
          case 1:
            setUser(null);
            setRecents([]);
            setSession(null);
            setScreen("upload");
            setNavActive("dashboard");
          case 2:
            return _context2.a(2);
        }
      }, _callee2);
    }));
    return function onLogout() {
      return _ref33.apply(this, arguments);
    };
  }();

  // Re-pull the list from the server (called after an analysis records one).
  var refreshRecents = function refreshRecents() {
    fetchRecents().then(setRecents);
  };

  // Live defects streamed from the backend during an in-flight analysis. The
  // AnalysingOverlay reads these to show findings appearing in real time.
  var _useStateA15 = useStateA([]),
    _useStateA16 = _slicedToArray(_useStateA15, 2),
    liveDefects = _useStateA16[0],
    setLiveDefects = _useStateA16[1];
  var _useStateA17 = useStateA(null),
    _useStateA18 = _slicedToArray(_useStateA17, 2),
    liveProgress = _useStateA18[0],
    setLiveProgress = _useStateA18[1];

  // Run the REAL analysis by STREAMING from the backend (Server-Sent Events over
  // a POST/fetch ReadableStream). Defects render live as each detector finds them;
  // the final `result` frame carries the score + full payload.
  var startAnalyse = /*#__PURE__*/function () {
    var _ref34 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(payload) {
      var raw, form, fileUrl, finishWithResult, res, detail, body, reader, decoder, buffer, errored, handleFrame, _yield$reader$read, value, done, sep, frame, _t2, _t3, _t4;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.p = _context3.n) {
          case 0:
            setScreen("analysing");
            setNavActive("dashboard");
            setSession(_objectSpread(_objectSpread({}, payload), {}, {
              pending: true
            }));
            setLiveDefects([]);
            setLiveProgress(null);
            raw = payload.file && payload.file.raw;
            if (raw) {
              _context3.n = 1;
              break;
            }
            showError({
              title: "No file to analyse",
              details: "Please choose a PDF file before running analysis."
            });
            return _context3.a(2);
          case 1:
            form = new FormData();
            form.append("file", raw, payload.file.name);
            form.append("court_id", payload.court.id);
            form.append("case_type_id", payload.caseType.id);
            fileUrl = raw ? URL.createObjectURL(raw) : null;
            finishWithResult = function finishWithResult(data) {
              var newSession = {
                file: {
                  name: data.file_name,
                  size: data.file_size_label || data.file_size_mb + " MB",
                  url: fileUrl
                },
                court: payload.court,
                caseType: payload.caseType,
                score: data.score,
                confidence: data.confidence,
                defectsToUse: data.defects,
                summary: data.summary,
                stats: data.stats,
                analysisId: data.analysis_id,
                createdAt: data.created_at
              };
              setSession(newSession);
              setScreen("results");
              setNavActive("dashboard");
              refreshRecents();
            };
            _context3.p = 2;
            _context3.n = 3;
            return fetch("/api/analyze/stream", {
              method: "POST",
              body: form,
              credentials: "same-origin"
            });
          case 3:
            res = _context3.v;
            if (!(!res.ok || !res.body)) {
              _context3.n = 8;
              break;
            }
            detail = {
              title: "Analysis failed",
              details: "Server returned ".concat(res.status, ".")
            };
            _context3.p = 4;
            _context3.n = 5;
            return res.json();
          case 5:
            body = _context3.v;
            if (body && body.detail) detail = body.detail;
            _context3.n = 7;
            break;
          case 6:
            _context3.p = 6;
            _t2 = _context3.v;
          case 7:
            showError(detail);
            return _context3.a(2);
          case 8:
            // Parse the SSE byte stream frame-by-frame (event: <type>\ndata: <json>\n\n).
            reader = res.body.getReader();
            decoder = new TextDecoder();
            buffer = "";
            errored = false;
            handleFrame = function handleFrame(frame) {
              var lines = frame.split("\n");
              var evType = "message";
              var dataStr = "";
              var _iterator = _createForOfIteratorHelper(lines),
                _step2;
              try {
                for (_iterator.s(); !(_step2 = _iterator.n()).done;) {
                  var line = _step2.value;
                  if (line.startsWith("event:")) evType = line.slice(6).trim();else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
                }
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }
              if (!dataStr) return;
              var data;
              try {
                data = JSON.parse(dataStr);
              } catch (_) {
                return;
              }
              if (evType === "defect") {
                setLiveDefects(function (prev) {
                  return [].concat(_toConsumableArray(prev), [data]);
                });
              } else if (evType === "progress") {
                setLiveProgress(data);
              } else if (evType === "result") {
                finishWithResult(data);
              } else if (evType === "error") {
                errored = true;
                showError(data.title ? data : {
                  title: "Analysis failed",
                  details: data.details || "Unknown error."
                });
              }
            }; // eslint-disable-next-line no-constant-condition
          case 9:
            if (!true) {
              _context3.n = 17;
              break;
            }
            _context3.n = 10;
            return reader.read();
          case 10:
            _yield$reader$read = _context3.v;
            value = _yield$reader$read.value;
            done = _yield$reader$read.done;
            if (!done) {
              _context3.n = 11;
              break;
            }
            return _context3.a(3, 17);
          case 11:
            buffer += decoder.decode(value, {
              stream: true
            });
            sep = void 0;
            while ((sep = buffer.indexOf("\n\n")) !== -1) {
              frame = buffer.slice(0, sep);
              buffer = buffer.slice(sep + 2);
              handleFrame(frame);
            }
            if (!errored) {
              _context3.n = 16;
              break;
            }
            _context3.p = 12;
            _context3.n = 13;
            return reader.cancel();
          case 13:
            _context3.n = 15;
            break;
          case 14:
            _context3.p = 14;
            _t3 = _context3.v;
          case 15:
            return _context3.a(2);
          case 16:
            _context3.n = 9;
            break;
          case 17:
            _context3.n = 19;
            break;
          case 18:
            _context3.p = 18;
            _t4 = _context3.v;
            showError({
              title: "Could not reach the analysis service",
              details: "The backend did not respond. Make sure the server is running, then retry."
            });
          case 19:
            return _context3.a(2);
        }
      }, _callee3, null, [[12, 14], [4, 6], [2, 18]]);
    }));
    return function startAnalyse(_x4) {
      return _ref34.apply(this, arguments);
    };
  }();
  var showError = function showError(msg) {
    setErrorMsg(msg);
    setScreen("error");
  };
  var goHome = function goHome() {
    setScreen("upload");
    setSession(null);
    setErrorMsg(null);
    setNavActive("dashboard");
  };
  var goToScreen = function goToScreen(screenName, navName) {
    setScreen(screenName);
    setNavActive(navName);
  };
  useEffectA(function () {
    document.documentElement.style.setProperty("--sidebar-w", t.showSidebar ? "260px" : "0px");
  }, [t.showSidebar]);

  // Until the initial auth check resolves, render nothing (avoids a login flash).
  if (!authChecked) {
    return /*#__PURE__*/React.createElement("div", {
      className: "auth-loading"
    });
  }

  // Logged out -> show the login / signup gate; the rest of the app is hidden.
  if (!user) {
    return /*#__PURE__*/React.createElement(AuthScreen, {
      onAuthed: onAuthed
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "app" + (t.showSidebar ? "" : " app--no-sidebar")
  }, /*#__PURE__*/React.createElement(Header, {
    screen: screen,
    onHome: goHome,
    navActive: navActive,
    user: user,
    onLogout: onLogout,
    onNavClick: function onNavClick(name) {
      if (name === "dashboard") goHome();else goToScreen(name, name);
    }
  }), t.showSidebar && /*#__PURE__*/React.createElement(Sidebar, {
    recents: recents,
    onOpenRecent: function onOpenRecent(entry) {
      // Restore the cached report directly (no re-analysis: the original
      // PDF is not retained across sessions).
      if (entry && entry.session) {
        setSession(entry.session);
        setScreen("results");
        setNavActive("dashboard");
      }
    },
    onCourtRuleClick: function onCourtRuleClick(courtName) {
      goToScreen("rules", "rules");
    }
  }), /*#__PURE__*/React.createElement("main", {
    className: "main"
  }, screen === "upload" && /*#__PURE__*/React.createElement(UploadScreen, {
    onAnalyse: startAnalyse,
    onError: showError
  }), screen === "results" && session && /*#__PURE__*/React.createElement(ResultsScreen, {
    session: session,
    onBack: goHome,
    onDownload: function onDownload() {
      var ok = downloadReport(session);
      setToast(ok ? "Filing report opened in a new tab - use your browser's Save as PDF." : "Pop-up blocked. Allow pop-ups for this site to download the report.");
    },
    onShare: function onShare() {
      return setToast("Share link copied to clipboard! Share with: co-counsel@firm.com");
    }
  }), screen === "error" && errorMsg && /*#__PURE__*/React.createElement(ErrorScreen, {
    message: errorMsg,
    onRetry: goHome
  }), screen === "history" && /*#__PURE__*/React.createElement(HistoryScreen, {
    recents: recents,
    onOpen: function onOpen(entry) {
      // Open the cached report (the original PDF is not retained).
      if (entry && entry.session) {
        setSession(entry.session);
        setScreen("results");
        setNavActive("dashboard");
      }
    },
    onUpload: goHome
  }), screen === "rules" && /*#__PURE__*/React.createElement(CourtRulesScreen, null), screen === "help" && /*#__PURE__*/React.createElement(HelpScreen, {
    onHome: goHome
  })), screen === "analysing" && session && /*#__PURE__*/React.createElement(AnalysingOverlay, {
    file: session.file,
    defects: liveDefects,
    progress: liveProgress
  }), toast && /*#__PURE__*/React.createElement(Toast, {
    message: toast,
    onClose: function onClose() {
      return setToast(null);
    }
  }), /*#__PURE__*/React.createElement(TweaksPanel, null, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Layout"
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Show sidebar",
    value: t.showSidebar,
    onChange: function onChange(v) {
      return setTweak("showSidebar", v);
    }
  })));
}
var root = ReactDOM.createRoot(document.getElementById("root"));
root.render(/*#__PURE__*/React.createElement(App, null));

// Initialize window.FC_DATA with all exported data
window.FC_DATA = {
  SAMPLE_FILES: SAMPLE_FILES,
  RECENT: RECENT,
  COURT_RULES: COURT_RULES,
  COURTS: COURTS,
  CASE_TYPES: CASE_TYPES,
  ALL_DEFECTS: ALL_DEFECTS,
  CRITICAL_DEFECTS: CRITICAL_DEFECTS,
  MEDIUM_DEFECTS: MEDIUM_DEFECTS,
  EXCELLENT_DEFECTS: EXCELLENT_DEFECTS
};
