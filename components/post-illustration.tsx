import type { ReactNode } from "react";
import type { IllustrationKind } from "@/types/post";

interface PostIllustrationProps {
  kind: IllustrationKind;
  title: string;
}

type SvgProps = {
  id: string;
};

function TechnologyLaptop({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0b1c2c" />
          <stop offset="100%" stopColor="#102a36" />
        </linearGradient>
        <linearGradient id={`${id}-screen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#164e63" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <circle cx="640" cy="80" r="120" fill="#22d3ee" opacity="0.08" />
      <rect x="196" y="96" width="408" height="248" rx="22" fill="#081018" />
      <rect
        x="216"
        y="116"
        width="368"
        height="208"
        rx="12"
        fill={`url(#${id}-screen)`}
        opacity="0.9"
      />
      <rect x="248" y="148" width="140" height="10" rx="5" fill="#ecfeff" opacity="0.8" />
      <rect x="248" y="176" width="220" height="8" rx="4" fill="#ecfeff" opacity="0.35" />
      <rect x="248" y="198" width="186" height="8" rx="4" fill="#ecfeff" opacity="0.22" />
      <rect x="248" y="240" width="88" height="48" rx="10" fill="#ecfeff" opacity="0.16" />
      <rect x="348" y="240" width="88" height="48" rx="10" fill="#ecfeff" opacity="0.1" />
      <path d="M150 368h500c18 0 28 16 22 30H128c-6-14 4-30 22-30z" fill="#0f1720" />
      <rect x="360" y="376" width="80" height="8" rx="4" fill="#334155" />
    </>
  );
}

function TechnologyCode({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#07141f" />
          <stop offset="100%" stopColor="#123044" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <rect x="88" y="72" width="624" height="336" rx="24" fill="#061018" stroke="#22d3ee" strokeOpacity="0.18" />
      <text x="128" y="140" fill="#67e8f9" fontFamily="ui-monospace, monospace" fontSize="22">
        {"const draft = open(file)"}
      </text>
      <text x="128" y="184" fill="#94a3b8" fontFamily="ui-monospace, monospace" fontSize="22">
        {"if (!ready) return quiet"}
      </text>
      <text x="128" y="228" fill="#5eead4" fontFamily="ui-monospace, monospace" fontSize="22">
        {"view.render(layout)"}
      </text>
      <text x="128" y="272" fill="#94a3b8" fontFamily="ui-monospace, monospace" fontSize="22">
        {"// local, unshared, unfinished"}
      </text>
      <rect x="128" y="312" width="18" height="28" fill="#7ee7ff" opacity="0.8" />
    </>
  );
}

function TechnologyCircuits({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#07111c" />
          <stop offset="100%" stopColor="#12263a" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <g fill="none" stroke="#67e8f9" strokeWidth="2" opacity="0.55">
        <path d="M80 120h160v80h120" />
        <path d="M80 240h90v140h210" />
        <path d="M720 90h-140v70h-80" />
        <path d="M720 300h-180v90h-90" />
        <path d="M280 80v70h80v90" />
        <path d="M500 400v-80h120" />
      </g>
      <g fill="#7ee7ff">
        <circle cx="240" cy="120" r="6" />
        <circle cx="360" cy="200" r="6" />
        <circle cx="170" cy="240" r="6" />
        <circle cx="580" cy="160" r="6" />
        <circle cx="540" cy="390" r="6" />
        <circle cx="360" cy="240" r="6" />
      </g>
      <rect x="340" y="188" width="140" height="100" rx="16" fill="#0b1b28" stroke="#67e8f9" strokeOpacity="0.4" />
      <circle cx="410" cy="238" r="18" fill="#22d3ee" opacity="0.35" />
    </>
  );
}

function TravelMountains({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16324a" />
          <stop offset="100%" stopColor="#2a1f28" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-sky)`} />
      <circle cx="560" cy="110" r="36" fill="#fde68a" opacity="0.85" />
      <path d="M0 480 180 210 310 340 430 150 620 360 800 220 800 480Z" fill="#0f172a" />
      <path d="M180 210 240 280 310 340 250 300Z" fill="#e2e8f0" opacity="0.35" />
      <path d="M430 150 490 230 560 280 500 220Z" fill="#f8fafc" opacity="0.28" />
      <rect x="0" y="400" width="800" height="80" fill="#111827" />
    </>
  );
}

function TravelBeach({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#164e63" />
          <stop offset="55%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#fcd34d" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-sky)`} />
      <circle cx="620" cy="92" r="40" fill="#fff7ed" />
      <path d="M0 250c80 30 160-10 240 10s160 40 240 8 160-18 320 16v196H0Z" fill="#0e7490" opacity="0.75" />
      <path d="M0 360c120 20 200-20 320 0s220 40 480-8v128H0Z" fill="#f5d0a9" />
      <path d="M120 300c18-70 70-110 70-110s18 62 8 118" fill="#134e4a" />
      <path d="M148 248c40-8 58 10 70 28" stroke="#115e59" strokeWidth="8" fill="none" />
    </>
  );
}

function TravelPlane({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0b1c2e" />
          <stop offset="100%" stopColor="#1e3a4c" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <path d="M80 300c140-40 260-90 380-70" stroke="#67e8f9" strokeOpacity="0.25" strokeWidth="2" fill="none" />
      <path d="M140 340c180-20 300 10 480-40" stroke="#67e8f9" strokeOpacity="0.12" strokeWidth="2" fill="none" />
      <g transform="translate(210 170)">
        <path d="M20 70 280 40l50 8-40 28-120 8 80 70-40 8-90-70-80 18z" fill="#e2e8f0" />
        <path d="M280 40 360 8l18 12-70 36z" fill="#94a3b8" />
        <circle cx="250" cy="52" r="5" fill="#22d3ee" />
      </g>
    </>
  );
}

function FitnessGym({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1c1014" />
          <stop offset="100%" stopColor="#3f1d2b" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <rect x="90" y="70" width="620" height="340" rx="28" fill="#12090d" stroke="#fda4af" strokeOpacity="0.18" />
      <rect x="160" y="300" width="480" height="16" rx="8" fill="#44403c" />
      <rect x="230" y="160" width="28" height="160" rx="8" fill="#a8a29e" />
      <rect x="542" y="160" width="28" height="160" rx="8" fill="#a8a29e" />
      <rect x="200" y="210" width="400" height="14" rx="7" fill="#e7e5e4" />
      <rect x="248" y="120" width="70" height="90" rx="12" fill="#78716c" />
      <rect x="482" y="120" width="70" height="90" rx="12" fill="#78716c" />
      <circle cx="400" cy="217" r="10" fill="#fb7185" />
    </>
  );
}

function FitnessWeights({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f1216" />
          <stop offset="100%" stopColor="#3b1d27" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <g transform="translate(120 190)">
        <rect x="140" y="42" width="280" height="20" rx="10" fill="#e7e5e4" />
        <rect x="0" y="8" width="70" height="88" rx="16" fill="#a8a29e" />
        <rect x="78" y="20" width="46" height="64" rx="12" fill="#d6d3d1" />
        <rect x="450" y="20" width="46" height="64" rx="12" fill="#d6d3d1" />
        <rect x="504" y="8" width="70" height="88" rx="16" fill="#a8a29e" />
      </g>
      <circle cx="400" cy="120" r="50" fill="#fb7185" opacity="0.12" />
    </>
  );
}

function FitnessHeartrate({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#190e14" />
          <stop offset="100%" stopColor="#3f1724" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <path
        d="M60 250h140l30-70 40 140 50-180 40 150 30-40h410"
        fill="none"
        stroke="#fb7185"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="320" cy="140" r="9" fill="#fda4af" />
      <path
        d="M400 168c20-28 56-28 76 0 20 28 0 58-38 86-38-28-58-58-38-86z"
        fill="#fb7185"
        opacity="0.8"
      />
    </>
  );
}

function FoodRestaurant({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a1a12" />
          <stop offset="100%" stopColor="#111111" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <rect x="150" y="250" width="500" height="18" rx="6" fill="#44403c" />
      <rect x="190" y="268" width="16" height="110" fill="#292524" />
      <rect x="594" y="268" width="16" height="110" fill="#292524" />
      <ellipse cx="400" cy="250" rx="170" ry="16" fill="#78716c" />
      <rect x="330" y="168" width="140" height="70" rx="16" fill="#1c1917" stroke="#fbbf24" strokeOpacity="0.35" />
      <circle cx="250" cy="140" r="18" fill="#fbbf24" opacity="0.7" />
      <circle cx="550" cy="128" r="12" fill="#fde68a" opacity="0.5" />
      <path d="M360 150c10-40 70-40 80 0" stroke="#e7e5e4" strokeWidth="6" fill="none" />
    </>
  );
}

function FoodCoffee({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1c1612" />
          <stop offset="100%" stopColor="#3f2a1c" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <path d="M300 168h180c18 0 30 16 30 34v110c0 50-54 86-120 86s-120-36-120-86V202c0-18 12-34 30-34z" fill="#e7e5e4" />
      <path d="M510 210c46 0 70 28 70 62s-28 60-70 64" fill="none" stroke="#d6d3d1" strokeWidth="16" />
      <ellipse cx="390" cy="176" rx="70" ry="14" fill="#44403c" />
      <path d="M360 110c8 22 4 36-8 50" stroke="#d6d3d1" strokeWidth="6" fill="none" opacity="0.45" />
      <path d="M392 104c8 24 2 40-10 56" stroke="#d6d3d1" strokeWidth="6" fill="none" opacity="0.3" />
    </>
  );
}

function FoodMeal({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#211610" />
          <stop offset="100%" stopColor="#3b2416" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <ellipse cx="400" cy="250" rx="210" ry="210" fill="#d6d3d1" />
      <ellipse cx="400" cy="250" rx="168" ry="168" fill="#1c1917" />
      <ellipse cx="360" cy="230" rx="58" ry="40" fill="#f97316" />
      <ellipse cx="450" cy="250" rx="46" ry="34" fill="#84cc16" />
      <circle cx="400" cy="300" r="28" fill="#fde68a" />
      <circle cx="330" cy="290" r="16" fill="#fb7185" />
      <path d="M560 140 700 70" stroke="#a8a29e" strokeWidth="8" />
      <path d="M572 128 690 90" stroke="#a8a29e" strokeWidth="8" />
    </>
  );
}

function FashionMinimal({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a1220" />
          <stop offset="100%" stopColor="#2d1b33" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <path d="M340 80h120l40 70-40 20v210H340V170l-40-20z" fill="#f5d0fe" opacity="0.92" />
      <path d="M340 80c20 28 80 28 120 0" fill="none" stroke="#e879f9" strokeWidth="6" />
      <line x1="400" y1="170" x2="400" y2="380" stroke="#86198f" strokeWidth="2" opacity="0.4" />
    </>
  );
}

function FashionAtelier({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#211428" />
          <stop offset="100%" stopColor="#140f18" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <rect x="120" y="300" width="560" height="16" fill="#44403c" />
      <path d="M260 110 400 90 540 110 500 320H300z" fill="#f5d0fe" opacity="0.2" stroke="#f0abfc" strokeOpacity="0.5" />
      <circle cx="400" cy="86" r="10" fill="#f5d0fe" />
      <rect x="150" y="250" width="90" height="50" rx="8" fill="#f5d0fe" opacity="0.18" />
      <rect x="560" y="230" width="70" height="70" rx="8" fill="#f5d0fe" opacity="0.12" />
    </>
  );
}

function SportsStadium({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10160f" />
          <stop offset="100%" stopColor="#1c2a14" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <ellipse cx="400" cy="250" rx="280" ry="160" fill="#365314" />
      <ellipse cx="400" cy="250" rx="210" ry="116" fill="#4d7c0f" />
      <ellipse cx="400" cy="250" rx="160" ry="84" fill="none" stroke="#ecfccb" strokeWidth="3" />
      <line x1="400" y1="166" x2="400" y2="334" stroke="#ecfccb" strokeWidth="3" />
      <path d="M80 140c80-70 560-70 640 0" fill="none" stroke="#a3e635" strokeOpacity="0.25" strokeWidth="10" />
      <path d="M80 360c80 70 560 70 640 0" fill="none" stroke="#a3e635" strokeOpacity="0.18" strokeWidth="10" />
    </>
  );
}

function SportsCourt({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#12200f" />
          <stop offset="100%" stopColor="#1f2f14" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <rect x="90" y="70" width="620" height="340" rx="18" fill="#3f6212" />
      <rect x="120" y="96" width="560" height="288" fill="none" stroke="#ecfccb" strokeWidth="4" />
      <line x1="400" y1="96" x2="400" y2="384" stroke="#ecfccb" strokeWidth="4" />
      <circle cx="400" cy="240" r="46" fill="none" stroke="#ecfccb" strokeWidth="4" />
      <rect x="120" y="180" width="70" height="120" fill="none" stroke="#ecfccb" strokeWidth="4" />
      <rect x="610" y="180" width="70" height="120" fill="none" stroke="#ecfccb" strokeWidth="4" />
    </>
  );
}

function PhotographyCamera({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#161225" />
          <stop offset="100%" stopColor="#2b2150" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <rect x="210" y="150" width="380" height="220" rx="36" fill="#0f0b18" stroke="#c4b5fd" strokeOpacity="0.35" />
      <rect x="250" y="118" width="110" height="40" rx="12" fill="#1e1b2e" />
      <circle cx="400" cy="260" r="74" fill="#312e81" />
      <circle cx="400" cy="260" r="46" fill="#c4b5fd" opacity="0.35" />
      <circle cx="400" cy="260" r="18" fill="#ede9fe" />
      <circle cx="520" cy="186" r="10" fill="#f472b6" />
    </>
  );
}

function PhotographyLens({ id }: SvgProps) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-lens`} cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#ddd6fe" />
          <stop offset="45%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </radialGradient>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#120f1d" />
          <stop offset="100%" stopColor="#2e2158" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <circle cx="400" cy="240" r="150" fill="#0f0b18" stroke="#c4b5fd" strokeOpacity="0.35" strokeWidth="18" />
      <circle cx="400" cy="240" r="112" fill={`url(#${id}-lens)`} />
      <circle cx="352" cy="196" r="22" fill="#f8fafc" opacity="0.28" />
    </>
  );
}

function MusicHeadphones({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#12122a" />
          <stop offset="100%" stopColor="#2a2158" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <path d="M220 250c0-110 70-180 180-180s180 70 180 180" fill="none" stroke="#c4b5fd" strokeWidth="18" />
      <rect x="188" y="230" width="70" height="110" rx="26" fill="#a5b4fc" />
      <rect x="542" y="230" width="70" height="110" rx="26" fill="#a5b4fc" />
      <circle cx="400" cy="250" r="8" fill="#818cf8" />
    </>
  );
}

function MusicVinyl({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141226" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <circle cx="400" cy="240" r="160" fill="#0b0a12" />
      <circle cx="400" cy="240" r="120" fill="none" stroke="#334155" strokeWidth="2" />
      <circle cx="400" cy="240" r="80" fill="none" stroke="#334155" strokeWidth="2" />
      <circle cx="400" cy="240" r="36" fill="#c4b5fd" />
      <circle cx="400" cy="240" r="10" fill="#0b0a12" />
      <rect x="548" y="92" width="14" height="170" rx="7" fill="#94a3b8" transform="rotate(18 555 177)" />
    </>
  );
}

function NatureForest({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1b16" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <path d="M160 400 260 160 360 400Z" fill="#166534" />
      <path d="M300 400 430 110 560 400Z" fill="#15803d" />
      <path d="M470 400 600 180 730 400Z" fill="#166534" />
      <rect x="246" y="360" width="18" height="50" fill="#3f2a14" />
      <rect x="420" y="350" width="20" height="60" fill="#3f2a14" />
      <rect x="590" y="360" width="18" height="50" fill="#3f2a14" />
    </>
  );
}

function NatureLake({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#123047" />
          <stop offset="45%" stopColor="#134e4a" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <path d="M0 220 180 150 300 200 480 120 800 210v80H0Z" fill="#064e3b" />
      <path d="M0 300c140 30 220-20 360 0s260 40 440-10v190H0Z" fill="#115e59" />
      <circle cx="580" cy="110" r="28" fill="#fde68a" opacity="0.7" />
      <path d="M80 340c80 16 140-10 220 6" stroke="#99f6e4" strokeOpacity="0.35" strokeWidth="3" fill="none" />
    </>
  );
}

function EducationBooks({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0b1a28" />
          <stop offset="100%" stopColor="#16324a" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <rect x="210" y="150" width="70" height="210" rx="8" fill="#38bdf8" transform="rotate(-8 245 255)" />
      <rect x="300" y="140" width="74" height="220" rx="8" fill="#7dd3fc" />
      <rect x="390" y="156" width="70" height="204" rx="8" fill="#e0f2fe" transform="rotate(6 425 258)" />
      <rect x="480" y="170" width="66" height="190" rx="8" fill="#38bdf8" transform="rotate(10 513 265)" />
    </>
  );
}

function EducationClassroom({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#102033" />
          <stop offset="100%" stopColor="#1e3a4c" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <rect x="120" y="80" width="560" height="220" rx="16" fill="#0b3b4d" />
      <rect x="148" y="104" width="504" height="172" rx="8" fill="#155e75" />
      <rect x="180" y="330" width="180" height="12" rx="6" fill="#cbd5e1" />
      <rect x="440" y="330" width="180" height="12" rx="6" fill="#cbd5e1" />
      <rect x="210" y="342" width="16" height="50" fill="#94a3b8" />
      <rect x="470" y="342" width="16" height="50" fill="#94a3b8" />
    </>
  );
}

function PetsCat({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a1b14" />
          <stop offset="100%" stopColor="#431407" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <ellipse cx="400" cy="300" rx="150" ry="110" fill="#fdba74" />
      <circle cx="400" cy="190" r="78" fill="#fdba74" />
      <path d="M340 140 320 70 380 120Z" fill="#fb923c" />
      <path d="M460 140 480 70 420 120Z" fill="#fb923c" />
      <circle cx="374" cy="186" r="8" fill="#1c1917" />
      <circle cx="426" cy="186" r="8" fill="#1c1917" />
      <path d="M392 210h16l-8 10z" fill="#9a3412" />
      <path d="M560 280c40 10 70 50 40 90" fill="none" stroke="#fdba74" strokeWidth="16" />
    </>
  );
}

function PetsDog({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a1c13" />
          <stop offset="100%" stopColor="#3f2a14" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <ellipse cx="410" cy="300" rx="150" ry="108" fill="#e7b48a" />
      <circle cx="390" cy="188" r="78" fill="#e7b48a" />
      <ellipse cx="318" cy="200" rx="28" ry="46" fill="#c2410c" />
      <ellipse cx="462" cy="200" rx="28" ry="46" fill="#c2410c" />
      <ellipse cx="390" cy="214" rx="22" ry="16" fill="#431407" />
      <circle cx="364" cy="176" r="7" fill="#1c1917" />
      <circle cx="416" cy="176" r="7" fill="#1c1917" />
    </>
  );
}

function DiyWorkshop({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#21160f" />
          <stop offset="100%" stopColor="#3b2a18" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <rect x="120" y="280" width="560" height="28" rx="6" fill="#7c2d12" />
      <rect x="150" y="308" width="18" height="90" fill="#44403c" />
      <rect x="632" y="308" width="18" height="90" fill="#44403c" />
      <rect x="250" y="170" width="220" height="110" rx="8" fill="#fdba74" />
      <rect x="500" y="210" width="80" height="70" rx="8" fill="#fb923c" />
      <rect x="200" y="230" width="30" height="50" fill="#a8a29e" />
    </>
  );
}

function DiyTools({ id }: SvgProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c140e" />
          <stop offset="100%" stopColor="#3f2a14" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill={`url(#${id}-bg)`} />
      <rect x="250" y="120" width="28" height="240" rx="8" fill="#a8a29e" transform="rotate(-18 264 240)" />
      <rect x="228" y="100" width="90" height="36" rx="10" fill="#fb923c" transform="rotate(-18 273 118)" />
      <path d="M430 160 620 300" stroke="#d6d3d1" strokeWidth="16" strokeLinecap="round" />
      <circle cx="430" cy="160" r="28" fill="#78716c" />
      <circle cx="620" cy="300" r="28" fill="#78716c" />
    </>
  );
}

const ILLUSTRATIONS: Record<IllustrationKind, (props: SvgProps) => ReactNode> = {
  "technology-laptop": TechnologyLaptop,
  "technology-code": TechnologyCode,
  "technology-circuits": TechnologyCircuits,
  "travel-mountains": TravelMountains,
  "travel-beach": TravelBeach,
  "travel-plane": TravelPlane,
  "fitness-gym": FitnessGym,
  "fitness-weights": FitnessWeights,
  "fitness-heartrate": FitnessHeartrate,
  "food-restaurant": FoodRestaurant,
  "food-coffee": FoodCoffee,
  "food-meal": FoodMeal,
  "fashion-minimal": FashionMinimal,
  "fashion-atelier": FashionAtelier,
  "sports-stadium": SportsStadium,
  "sports-court": SportsCourt,
  "photography-camera": PhotographyCamera,
  "photography-lens": PhotographyLens,
  "music-headphones": MusicHeadphones,
  "music-vinyl": MusicVinyl,
  "nature-forest": NatureForest,
  "nature-lake": NatureLake,
  "education-books": EducationBooks,
  "education-classroom": EducationClassroom,
  "pets-cat": PetsCat,
  "pets-dog": PetsDog,
  "diy-workshop": DiyWorkshop,
  "diy-tools": DiyTools,
};

export function PostIllustration({ kind, title }: PostIllustrationProps) {
  const Illustration = ILLUSTRATIONS[kind];

  return (
    <div className="relative overflow-hidden rounded-[1.15rem] border border-white/8 bg-black/30">
      <svg
        viewBox="0 0 800 480"
        className="block h-auto w-full"
        role="img"
        aria-label={title}
      >
        <Illustration id={kind} />
      </svg>
    </div>
  );
}
