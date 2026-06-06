

/**
 * Kaelthas Frost-K Crest — hand-crafted SVG matching the reference logo.
 *
 * • Gothic blackletter "K" — dark steel body, ice-blue outer rim, inner sheen
 * • Sharp spiked serifs at all terminals (top-left split, bottom spike, arm tips)
 * • Frostmourne-style sword diagonal across top-right with blue gem crossguard
 * • Snowflake inside lower K body
 * • Icicle row dripping from bottom edge
 * • 4 cardinal star spikes + diagonal corner spikes framing the letter
 * • Subtle runic ring behind the whole mark
 */
export function KaelthasLogo({
  size = 64,
  className,
  style,
  ...props
}) {
  return (
    <svg
      viewBox="0 0 220 230"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Kaelthas"
      className={className}
      style={style}
      {...props}
    >
      <defs>
        <filter id="gl-bloom" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
        <filter id="gl-med" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
        <filter id="gl-soft" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
        <filter id="gl-gem" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>

        {/* K body: very dark charcoal steel */}
        <linearGradient id="k-body" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%"   stopColor="#1c2d3e" />
          <stop offset="35%"  stopColor="#111c28" />
          <stop offset="70%"  stopColor="#0a1520" />
          <stop offset="100%" stopColor="#060e18" />
        </linearGradient>

        {/* K outer ice rim */}
        <linearGradient id="k-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#dff6ff" />
          <stop offset="30%"  stopColor="#8de4ff" />
          <stop offset="65%"  stopColor="#4db8e8" />
          <stop offset="100%" stopColor="#2878a8" />
        </linearGradient>

        {/* K inner sheen: subtle ice reflection inside the dark body */}
        <linearGradient id="k-sheen" x1="0.05" y1="0.05" x2="0.55" y2="0.95">
          <stop offset="0%"   stopColor="#7de8ff" stopOpacity="0.22" />
          <stop offset="40%"  stopColor="#4eb8e8" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#1a5a8a" stopOpacity="0.0" />
        </linearGradient>

        {/* Blade gradient: bright tip → deep ice */}
        <linearGradient id="blade-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.97" />
          <stop offset="25%"  stopColor="#c8eeff" />
          <stop offset="65%"  stopColor="#4eb8e8" />
          <stop offset="100%" stopColor="#1a4a6a" stopOpacity="0.85" />
        </linearGradient>

        {/* Handle: dark steel */}
        <linearGradient id="handle-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#2c4254" />
          <stop offset="50%"  stopColor="#3e5f78" />
          <stop offset="100%" stopColor="#1a2e3e" />
        </linearGradient>

        {/* Gem radial */}
        <radialGradient id="gem-g" cx="30%" cy="25%" r="70%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="30%"  stopColor="#80e8ff" />
          <stop offset="100%" stopColor="#0d4a6e" />
        </radialGradient>

        {/* Snowflake */}
        <linearGradient id="snow-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#c4eeff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#5ab8e8" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* ════════ RUNIC RING (behind everything) ════════ */}
      <circle cx="110" cy="118" r="96"
        stroke="rgba(111,211,255,0.16)" strokeWidth="1.5" />
      <circle cx="110" cy="118" r="88"
        stroke="rgba(111,211,255,0.08)" strokeWidth="0.7"
        strokeDasharray="4 7" />

      {/* 8 small diamond ticks on outer ring */}
      {[0,45,90,135,180,225,270,315].map((deg) => (
        <polygon key={deg}
          points="110,20 113,27 110,34 107,27"
          fill="rgba(111,211,255,0.4)"
          transform={`rotate(${deg} 110 118)`} />
      ))}

      {/* ════════ STAR SPIKES ════════ */}
      {/* top spike — behind K */}
      <polygon points="110,0  114,22 110,30 106,22"
        fill="url(#k-rim)" opacity="0.85" filter="url(#gl-med)" />
      {/* bottom spike */}
      <polygon points="110,228 114,206 110,198 106,206"
        fill="url(#k-rim)" opacity="0.85" filter="url(#gl-med)" />
      {/* left spike */}
      <polygon points="2,118  24,122 32,118 24,114"
        fill="url(#k-rim)" opacity="0.65" filter="url(#gl-med)" />
      {/* right spike */}
      <polygon points="218,118 196,122 188,118 196,114"
        fill="url(#k-rim)" opacity="0.65" filter="url(#gl-med)" />
      {/* diagonal corner mini spikes */}
      <polygon points="30,30  44,50  32,56  20,44"  fill="rgba(111,211,255,0.28)" />
      <polygon points="190,30 176,50 188,56 200,44" fill="rgba(111,211,255,0.22)" />
      <polygon points="30,206 44,186 32,180 20,192" fill="rgba(111,211,255,0.28)" />
      <polygon points="190,206 176,186 188,180 200,192" fill="rgba(111,211,255,0.2)" />

      {/* ════════ GOTHIC K — glow halo ════════ */}
      {/*
        The K is built as a blackletter letterform:
        • Left vertical bar with split-spike top and downward spike bottom
        • Upper arm: goes up-right with a sharp spike tip
        • Lower arm: goes down-right with a sharp spike tip
        • Junction: sharp inward notch where both arms meet the vertical
        All terminals are pointed / spiked for the gothic game-logo look.
      */}
      <path
        d="
          M 52,25
          L 52,205
          L 84,205
          L 84,148
          L 92,138
          L 148,205
          L 186,205
          L 118,120
          L 180,25
          L 144,25
          L 94,95
          L 84,82
          L 84,25
          Z
        "
        fill="rgba(111,211,255,0.22)"
        filter="url(#gl-bloom)"
      />

      {/* ════════ GOTHIC K — ice outer stroke ════════ */}
      <path
        d="
          M 52,25
          L 52,205
          L 84,205
          L 84,148
          L 92,138
          L 148,205
          L 186,205
          L 118,120
          L 180,25
          L 144,25
          L 94,95
          L 84,82
          L 84,25
          Z
        "
        fill="none"
        stroke="url(#k-rim)"
        strokeWidth="5.5"
        strokeLinejoin="miter"
        strokeMiterlimit="2"
        filter="url(#gl-soft)"
      />

      {/* ════════ GOTHIC K — dark steel fill ════════ */}
      <path
        d="
          M 52,25
          L 52,205
          L 84,205
          L 84,148
          L 92,138
          L 148,205
          L 186,205
          L 118,120
          L 180,25
          L 144,25
          L 94,95
          L 84,82
          L 84,25
          Z
        "
        fill="url(#k-body)"
      />

      {/* ════════ GOTHIC K — inner sheen overlay ════════ */}
      <path
        d="
          M 52,25
          L 52,205
          L 84,205
          L 84,148
          L 92,138
          L 148,205
          L 186,205
          L 118,120
          L 180,25
          L 144,25
          L 94,95
          L 84,82
          L 84,25
          Z
        "
        fill="url(#k-sheen)"
      />

      {/* ════════ GOTHIC K — inner thin secondary stroke ════════ */}
      <path
        d="
          M 57,31
          L 57,199
          L 79,199
          L 79,145
          L 94,130
          L 150,199
          L 178,199
          L 115,120
          L 174,31
          L 147,31
          L 94,100
          L 79,84
          L 79,31
          Z
        "
        fill="none"
        stroke="rgba(184,236,255,0.14)"
        strokeWidth="1.5"
        strokeLinejoin="miter"
      />

      {/* ════════ SHARP SPIKED SERIFS at K terminals ════════ */}
      {/* Top-left: split spike — two upward points on top of vertical bar */}
      <polygon points="52,25 60,10 64,22 68,8 76,22 84,25 84,32 52,32"
        fill="url(#k-body)"
        stroke="url(#k-rim)" strokeWidth="4" strokeLinejoin="miter"
        filter="url(#gl-soft)" />
      {/* Bottom-left: downward spike */}
      <polygon points="52,205 68,222 84,205 84,198 52,198"
        fill="url(#k-body)"
        stroke="url(#k-rim)" strokeWidth="4" strokeLinejoin="miter"
        filter="url(#gl-soft)" />
      {/* Top-right of upper arm: sharp tip spike */}
      <polygon points="180,25 194,18 190,32 178,32"
        fill="url(#k-body)"
        stroke="url(#k-rim)" strokeWidth="3.5" strokeLinejoin="miter"
        filter="url(#gl-soft)" />
      {/* Bottom-right of lower arm: sharp tip spike */}
      <polygon points="186,205 200,214 194,198 180,198"
        fill="url(#k-body)"
        stroke="url(#k-rim)" strokeWidth="3.5" strokeLinejoin="miter"
        filter="url(#gl-soft)" />

      {/* ════════ SNOWFLAKE inside lower K body ════════ */}
      <g transform="translate(120, 162)" opacity="0.62" filter="url(#gl-soft)">
        {[0,60,120,180,240,300].map((deg) => (
          <g key={deg} transform={`rotate(${deg})`}>
            <line x1="0" y1="-26" x2="0" y2="26"
              stroke="url(#snow-g)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="-8"  y1="-14" x2="0" y2="-18" stroke="url(#snow-g)" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="8"   y1="-14" x2="0" y2="-18" stroke="url(#snow-g)" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="-5"  y1="-22" x2="0" y2="-26" stroke="url(#snow-g)" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="5"   y1="-22" x2="0" y2="-26" stroke="url(#snow-g)" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        ))}
        <circle cx="0" cy="0" r="4" fill="rgba(111,211,255,0.8)" filter="url(#gl-med)" />
      </g>

      {/* ════════ ICICLES dripping from bottom of K ════════ */}
      <g filter="url(#gl-soft)" opacity="0.88">
        {[
          { x: 55,  h: 20, r: 3.5 },
          { x: 62,  h: 14, r: 2.8 },
          { x: 68,  h: 26, r: 3.5 },
          { x: 75,  h: 16, r: 3 },
          { x: 81,  h: 11, r: 2.5 },
          { x: 104, h: 9,  r: 2.5 },
          { x: 112, h: 15, r: 3 },
          { x: 120, h: 22, r: 3.5 },
          { x: 128, h: 13, r: 3 },
          { x: 136, h: 18, r: 3.2 },
          { x: 144, h: 10, r: 2.5 },
          { x: 152, h: 24, r: 3.5 },
          { x: 160, h: 15, r: 3 },
          { x: 168, h: 11, r: 2.5 },
          { x: 176, h: 19, r: 3.2 },
          { x: 184, h: 13, r: 2.8 },
        ].map(({ x, h, r }) => (
          <ellipse key={x}
            cx={x} cy={208 + h / 2}
            rx={r} ry={h / 2}
            fill="url(#k-rim)"
            opacity="0.85"
          />
        ))}
        {/* small ice droplets at icicle tips */}
        {[
          { x: 68, y: 234 },
          { x: 120, y: 230 },
          { x: 152, y: 232 },
        ].map(({ x, y }) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5"
            fill="rgba(184,236,255,0.6)" filter="url(#gl-soft)" />
        ))}
      </g>

      {/* ════════ FROSTMOURNE SWORD — diagonal top-right ════════ */}
      {/*
        Sword runs roughly from center of K (around 118,118) up to top-right (188,38).
        We draw it in local coords then transform.
      */}
      <g transform="translate(148, 68) rotate(-42)">
        {/* blade glow aura */}
        <rect x="-4" y="-75" width="8" height="75" rx="4"
          fill="rgba(111,211,255,0.22)" filter="url(#gl-bloom)" />

        {/* main blade */}
        <polygon points="0,-78 4,-30 4.5,0 0,7 -4.5,0 -4,-30"
          fill="url(#blade-g)" filter="url(#gl-soft)" />

        {/* blade fuller / central groove */}
        <line x1="0" y1="-70" x2="0" y2="-3"
          stroke="rgba(255,255,255,0.55)" strokeWidth="1.2"
          strokeLinecap="round" />

        {/* rune etchings on blade */}
        {[-60,-50,-40,-30,-20].map((y) => (
          <line key={y} x1="-3.5" y1={y} x2="3.5" y2={y}
            stroke="rgba(111,211,255,0.5)" strokeWidth="0.9"
            strokeLinecap="round" />
        ))}

        {/* crossguard body */}
        <rect x="-22" y="0" width="44" height="8.5" rx="4"
          fill="rgba(38,60,80,0.95)"
          stroke="rgba(111,211,255,0.55)" strokeWidth="1.2" />

        {/* crossguard wing claws */}
        <path d="M-22,0 Q-32,-2 -34,4.25 Q-32,10 -22,8.5"
          fill="rgba(30,48,64,0.95)"
          stroke="rgba(111,211,255,0.45)" strokeWidth="1" />
        <path d="M22,0 Q32,-2 34,4.25 Q32,10 22,8.5"
          fill="rgba(30,48,64,0.95)"
          stroke="rgba(111,211,255,0.45)" strokeWidth="1" />
        {/* claw spikes */}
        <polygon points="-34,4.25 -40,0   -36,4.25" fill="rgba(111,211,255,0.5)" />
        <polygon points="-34,4.25 -40,8.5 -36,4.25" fill="rgba(111,211,255,0.4)" />
        <polygon points="34,4.25  40,0    36,4.25" fill="rgba(111,211,255,0.5)" />
        <polygon points="34,4.25  40,8.5  36,4.25" fill="rgba(111,211,255,0.4)" />

        {/* center gem */}
        <circle cx="0" cy="4.25" r="7.5"
          fill="url(#gem-g)" filter="url(#gl-gem)" />
        <circle cx="0" cy="4.25" r="7.5"
          stroke="rgba(111,211,255,0.7)" strokeWidth="0.8" />
        {/* gem highlight */}
        <circle cx="-2" cy="1.8" r="2.8" fill="white" opacity="0.82" />

        {/* flanking gems on crossguard */}
        <circle cx="-13" cy="4.25" r="5" fill="url(#gem-g)" filter="url(#gl-soft)" />
        <circle cx="-13" cy="2.5" r="1.8" fill="white" opacity="0.75" />
        <circle cx="13" cy="4.25" r="5" fill="url(#gem-g)" filter="url(#gl-soft)" />
        <circle cx="13" cy="2.5" r="1.8" fill="white" opacity="0.75" />

        {/* handle / grip */}
        <rect x="-4.5" y="8.5" width="9" height="25" rx="4.5"
          fill="url(#handle-g)"
          stroke="rgba(111,211,255,0.2)" strokeWidth="0.8" />
        {/* grip wrap lines */}
        {[13,17,21,25].map((y) => (
          <line key={y} x1="-4.5" y1={y} x2="4.5" y2={y}
            stroke="rgba(111,211,255,0.32)" strokeWidth="1" />
        ))}

        {/* pommel */}
        <ellipse cx="0" cy="36" rx="9" ry="5"
          fill="rgba(38,60,80,0.95)"
          stroke="rgba(111,211,255,0.55)" strokeWidth="1" />
        <circle cx="0" cy="36" r="6" fill="url(#gem-g)" filter="url(#gl-soft)" />
        <circle cx="-1.5" cy="34" r="2.2" fill="white" opacity="0.72" />
      </g>

      {/* ════════ ICE CRYSTAL BURST near sword hilt ════════ */}
      <g opacity="0.55" filter="url(#gl-soft)">
        <polygon points="175,44 183,28 191,44 183,60" fill="rgba(111,211,255,0.38)" />
        <polygon points="162,44 175,38 175,50" fill="rgba(184,236,255,0.25)" />
        <polygon points="196,30 188,44 202,42" fill="rgba(184,236,255,0.2)" />
      </g>
    </svg>
  );
}
