"use client";

/**
 * FloatingCities — small city names that fade-in / hold / fade-out across
 * the globe background on the landing hero.
 *
 * 5 cities, each visible for 3 s (0.8 s fade-in → 1.4 s hold → 0.8 s fade-out),
 * staggered so a new city appears every 3 s. Full rotation = 15 s.
 *
 * Pure CSS @keyframes — no JS timers, no hydration flicker.
 */

interface CityDot {
  city: string;
  country: string;
  top: string;
  left: string;
}

const CITIES: CityDot[] = [
  { city: "Lagos",     country: "Nigeria",        top: "54%", left: "30%" },
  { city: "London",    country: "United Kingdom",  top: "26%", left: "38%" },
  { city: "Dubai",     country: "UAE",             top: "40%", left: "60%" },
  { city: "Stockholm", country: "Sweden",          top: "18%", left: "44%" },
  { city: "Hong Kong", country: "China",           top: "42%", left: "80%" },
];

const TOTAL_CITIES = CITIES.length;          // 5
const VISIBLE_SEC  = 3;                       // each city visible for 3 s
const CYCLE_SEC    = TOTAL_CITIES * VISIBLE_SEC; // 15 s full rotation
const VISIBLE_PCT  = (VISIBLE_SEC / CYCLE_SEC) * 100; // 20 %

/**
 * Build a keyframes string for a city at index `i`.
 * Each city is visible only during its 20 % window of the 15 s cycle.
 *
 * 0 %–start : opacity 0
 * start     : fade in
 * start+6 % : full opacity (≈ 0.8 s fade-in)
 * end−6 %   : still full
 * end       : fade out complete → opacity 0
 * 100 %     : opacity 0
 */
function buildKeyframes(name: string, i: number): string {
  const start = (i / TOTAL_CITIES) * 100;
  const fadeIn  = start + VISIBLE_PCT * 0.27;   // ~0.8 s of 3 s
  const fadeOut = start + VISIBLE_PCT * 0.73;   // start fading at ~2.2 s
  const end     = start + VISIBLE_PCT;          // fully gone

  return `
@keyframes ${name} {
  0%, ${start.toFixed(1)}% { opacity: 0; transform: translateY(5px); }
  ${fadeIn.toFixed(1)}% { opacity: 1; transform: translateY(0); }
  ${fadeOut.toFixed(1)}% { opacity: 1; transform: translateY(0); }
  ${end.toFixed(1)}%, 100% { opacity: 0; transform: translateY(-3px); }
}`;
}

/* Pre-build all keyframe CSS once */
const keyframeCSS = CITIES.map((_, i) => buildKeyframes(`cityFade${i}`, i)).join("\n");

export function FloatingCities() {
  return (
    <>
      {/* Inject keyframes */}
      <style>{keyframeCSS}</style>

      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {CITIES.map((c, i) => (
          <div
            key={c.city}
            className="absolute flex flex-col items-center"
            style={{
              top: c.top,
              left: c.left,
              opacity: 0,
              animation: `cityFade${i} ${CYCLE_SEC}s ease-in-out infinite`,
            }}
          >
            {/* Gold ping dot */}
            <span
              className="block w-1.5 h-1.5 rounded-full mb-1"
              style={{
                backgroundColor: "#D4AF37",
                boxShadow: "0 0 6px 2px rgba(212,175,55,0.5)",
              }}
            />
            {/* City name */}
            <span
              className="text-[10px] font-medium tracking-wide whitespace-nowrap"
              style={{
                color: "#D4AF37",
                textShadow:
                  "0 0 8px rgba(212,175,55,0.6), 0 1px 3px rgba(0,0,0,0.8)",
              }}
            >
              {c.city}
            </span>
            {/* Country */}
            <span
              className="text-[7px] font-normal tracking-wider uppercase whitespace-nowrap mt-px"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {c.country}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
