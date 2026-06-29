// gauge.jsx - Arc / semicircle gauge with dynamic color band

function Gauge({ score = 0, animate = true }) {
  // Determine band based on score (reframed per advocate audit - no "safe to
  // file" guarantee; reflects formatting + filing-requirement readiness).
  const band =
    score >= 75 ? { color: "#119366", label: "Likely registry-ready", soft: "#D8F0E6" } :
    score >= 45 ? { color: "#C2790B", label: "Fix issues before filing", soft: "#FBEFD7" } :
                  { color: "#D6293E", label: "Not ready - must fix",     soft: "#FBDCE0" };

  // SVG arc geometry - semicircle. viewBox snugly fits arc + stroke + end-cap.
  const R = 100;
  const STROKE = 16;
  const CAP_R = STROKE / 2 + 3; // end-cap circle radius
  const PAD = CAP_R + 2;        // padding on all sides for cap + stroke
  const CX = R + PAD;           // center x
  const CY = R + PAD;           // center y (baseline of arc)
  const W = 2 * R + 2 * PAD;    // viewBox width
  const H = R + 2 * PAD;        // viewBox height - just enough for top half + cap

  // Parametrize position on the top semicircle by t in [0, 1].
  // t=0 → west endpoint, t=0.5 → top, t=1 → east endpoint.
  const t = Math.max(0, Math.min(100, score)) / 100;
  const theta = Math.PI * (1 - t); // 180° at t=0, 0° at t=1
  const endX = CX + R * Math.cos(theta);
  const endY = CY - R * Math.sin(theta); // -sin so the arc is above center

  // Both arcs are ≤ 180° (top semicircle only), so large-arc-flag is always 0.
  // sweep-flag=1 draws clockwise visually, which traces the top semicircle.
  const bgPath = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;
  const fgPath = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${endX} ${endY}`;

  // Tick marks at 40 & 70 (band boundaries)
  const tick = (val) => {
    const tv = val / 100;
    const a = Math.PI * (1 - tv);
    const r1 = R - STROKE / 2 - 4;
    const r2 = R + STROKE / 2 + 4;
    return {
      x1: CX + r1 * Math.cos(a), y1: CY - r1 * Math.sin(a),
      x2: CX + r2 * Math.cos(a), y2: CY - r2 * Math.sin(a),
    };
  };
  const t40 = tick(40), t70 = tick(70);

  // Pointer end cap on the arc itself
  const ptr = { x: endX, y: endY };

  const displayed = Math.round(score);

  return (
    <div className="gauge">
      <div className="gauge__svg-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="gauge-fg" x1="0" x2="1">
              <stop offset="0%" stopColor={band.color} stopOpacity="0.85" />
              <stop offset="100%" stopColor={band.color} stopOpacity="1" />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <path d={bgPath} stroke="#ECECF5" strokeWidth={STROKE} fill="none" strokeLinecap="round" />
          {/* Tick marks at 40 & 70 */}
          <line {...t40} stroke="#C5CCDA" strokeWidth="1.5" />
          <line {...t70} stroke="#C5CCDA" strokeWidth="1.5" />
          {/* Foreground arc */}
          <path
            d={fgPath}
            stroke="url(#gauge-fg)"
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            style={{
              transition: animate ? "stroke 600ms ease, d 600ms ease" : "none",
            }}
          />
          {/* End cap dot */}
          <circle
            cx={ptr.x} cy={ptr.y} r={STROKE / 2 + 3}
            fill="#fff" stroke={band.color} strokeWidth="3"
            style={{ transition: animate ? "all 600ms ease" : "none" }}
          />
        </svg>
        <div className="gauge__center">
          <div className="gauge__num">
            {displayed}<span className="gauge__num-percent">%</span>
          </div>
        </div>
      </div>
      <div className="gauge__ticks">
        <span>0</span><span>45 · 75</span><span>100</span>
      </div>
      <div className="gauge__caption">
        <strong style={{ color: band.color }}>{band.label}</strong>
        Filing Readiness Score
      </div>
    </div>
  );
}

window.Gauge = Gauge;
