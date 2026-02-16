"use client";

import React from "react";

/* ──────────────────────────────────────────────────────────────────
   INLINE SVG PLANES — pre-oriented with internal <g> transforms
   so each plane's nose faces the correct flight direction.

   Native nose directions (before any transform):
   • PlaneSide:     LEFT  (x≈3 is nose, x≈507 is tail)
   • PlaneDiagonal: UPPER-RIGHT (≈−45° from horizontal)
   • PlaneTop:      UP    (y≈3 is nose,  y≈509 is tail)
   • PlaneTravel:   RIGHT (x≈464 is nose, x≈48 is tail)

   After <g> transforms applied inside each SVG:
   • PlaneSide:     → RIGHT  (mirrored horizontally)
   • PlaneDiagonal: → UPPER-LEFT at ≈−135° (mirrored for R→L flight)
   • PlaneTop:      → RIGHT  (rotated 90° CW)
   • PlaneTravel:   → RIGHT  (no transform needed)
   ────────────────────────────────────────────────────────────────── */

/** Side-view commercial jet — mirrored so nose → RIGHT */
function PlaneSide({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g transform="translate(512,0) scale(-1,1)">
        <path
          d="M507.068,194.059c-5.3-6.143-13.759-8.507-21.481-6.013l-59.859,17.264
          c-11.406,3.695-23.81,2.792-34.574-2.507l-68.887-33.742l61.093-80.864c4.682-4.847,5.584-12.261,2.139-18.095
          c-3.422-5.809-10.336-8.638-16.848-6.903L247.486,116.32l23.597,11.572l-16.23,8.115l-24.69-12.095L124.278,72.015
          C65.799,43.262,18.154,52.695,3.16,83.208c-14.994,30.522,26.591,49.402,57.102,64.395l105.696,52.041l54.749,242.78
          c1.877,8.982,10.003,15.28,19.224,14.828c9.172-0.464,16.633-7.509,17.632-16.669l33.956-179.158l73.569,36.226
          c47.073,21.732,97.259,19.64,112.253-10.86l32.579-70.61C513.507,208.911,512.39,200.19,507.068,194.059z"
          fill="#D4AF37"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}

/** Diagonal fighter — mirrored so nose → UPPER-LEFT (for R→L flight) */
function PlaneDiagonal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 446.852 446.852" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g transform="translate(446.852,0) scale(-1,1)">
        <path
          d="M403.233,288.574c13.831-15.959,20.406-30.375,15.334-36.447c-3.509-4.203-11.969-3.604-22.862,0.714l-3.835-18.231
          c12.295-15.36,17.592-29.028,12.362-35.549c-3.399-4.237-10.758-4.747-20.318-2.23l-10.098-47.954
          C433.2,78.469,457.742,19.853,442.367,4.478c-15.375-15.375-73.991,9.173-144.398,68.558l-47.953-10.098
          c2.516-9.561,2.006-16.918-2.23-20.318c-6.515-5.229-20.183,0.068-35.55,12.362l-18.231-3.835
          c4.318-10.887,4.917-19.346,0.714-22.861c-6.072-5.073-20.481,1.503-36.448,15.334L86.55,28.522L48.082,66.99l66.015,34.095
          c-5.63,12.566-6.848,22.481-2.203,26.357c5.44,4.542,17.564-0.245,31.504-11.227l16.109,8.323
          c-5.392,13.729-6.065,24.568-0.625,28.934c6.358,5.1,19.523,0.177,34.421-11.479l22.678,11.709
          c-0.667,0.755-1.333,1.482-1.999,2.244c-42.48,48.409-80.614,93.819-108.447,131.458l-76.677-8.847L0.006,307.41l67.796,38.481
          c-9.275,18.599-11.757,31.987-5.291,38.454s19.856,3.985,38.454-5.29l38.481,67.796l28.853-28.853l-8.847-76.677
          c37.645-27.833,83.049-65.967,131.458-108.446c0.761-0.667,1.488-1.333,2.243-1.999l11.71,22.678
          c-11.655,14.898-16.578,28.063-11.479,34.422c4.366,5.439,15.205,4.767,28.935-0.626l8.323,16.109
          c-10.982,13.939-15.77,26.064-11.228,31.504c3.876,4.645,13.798,3.421,26.357-2.203l34.095,66.015l38.468-38.468L403.233,288.574z"
          fill="#D4AF37"
          opacity="0.85"
        />
      </g>
    </svg>
  );
}

/** Top-down jumbo jet — rotated 90° CW so nose → RIGHT */
function PlaneTop({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g transform="rotate(90,256,256)">
        <path
          d="M511.06,286.261c-0.387-10.849-7.42-20.615-18.226-25.356l-193.947-74.094
          C298.658,78.15,285.367,3.228,256.001,3.228c-29.366,0-42.657,74.922-42.885,183.583L19.167,260.904
          C8.345,265.646,1.33,275.412,0.941,286.261L0.008,311.97c-0.142,3.886,1.657,7.623,4.917,10.188
          c3.261,2.564,7.597,3.684,11.845,3.049c0,0,151.678-22.359,198.037-29.559c1.85,82.016,4.019,127.626,4.019,127.626l-51.312,24.166
          c-6.046,2.38-10.012,8.206-10.012,14.701v9.465c0,4.346,1.781,8.505,4.954,11.493c3.155,2.987,7.403,4.539,11.74,4.292l64.83-3.667
          c2.08,14.436,8.884,25.048,16.975,25.048c8.091,0,14.877-10.612,16.975-25.048l64.832,3.667c4.336,0.246,8.584-1.305,11.738-4.292
          c3.174-2.988,4.954-7.148,4.954-11.493v-9.465c0-6.495-3.966-12.321-10.012-14.701l-51.329-24.166c0,0,2.186-45.61,4.037-127.626
          c46.358,7.2,198.036,29.559,198.036,29.559c4.248,0.635,8.602-0.485,11.845-3.049c3.261-2.565,5.041-6.302,4.918-10.188
          L511.06,286.261z"
          fill="#D4AF37"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}

/** Travel airplane — nose already faces RIGHT, no transform needed */
function PlaneTravel({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M463.84,267.92L456,264h-52c-6.64,0-12-5.36-12-12c0-6.64,5.36-12,12-12h23.2l-9.6-12c-6.08-7.6-15.28-12-24.96-12H320
        l-80.16-50.96c-5.12-3.28-11.04-5.04-17.12-5.04h-19.44c-7.12,0-10.64,8.64-5.6,13.68L240,216H104l-29.68-52
        c-1.44-2.48-4.08-4-6.96-4h-18.4c-4.8,0-8.48,4.16-8,8.88l5.84,52c0.8,7.2,4.08,14,9.2,19.12l20,20l-22.32,22.32
        c-5.04,5.04-1.52,13.68,5.6,13.68h11.84c5.84,0,11.52-1.6,16.48-4.56c16.905-10.205,3.989-2.441,65.52-39.36
        c3.84-2.24,8.72-1.04,10.96,2.8c2.436,3.898,0.974,8.696-2.72,10.96l-44.16,26.48c6.72,2.4,13.92,3.68,21.28,3.68H240
        l-42.32,42.32c-5.04,5.04-1.52,13.68,5.6,13.68h18.48c6.64,0,13.12-2.08,18.56-6c84.228-60.094,63.133-45.041,97.2-69.36
        c3.52-2.56,8.56-1.76,11.12,1.84c2.673,3.701,1.679,8.723-1.84,11.2l-8.88,6.32H457.2c8.16,0,14.8-6.64,14.8-14.8v-0.08
        C472,275.52,468.8,270.4,463.84,267.92z"
        fill="#D4AF37"
        opacity="0.9"
      />
    </svg>
  );
}

/* ─── Flight path configs ───
   Rotation values are ONLY the small flight-direction tilt (±35° max).
   The SVG internal transforms handle the base nose orientation.

   Flight direction angles (atan2 of movement deltas):
   • Flight 1 (L→R): start≈−35° mid≈−22° end≈−9°
   • Flight 2 (L→R): start≈−30° mid≈−22° end≈−15°
   • Flight 3 (R→L): tilt from −135° base: start≈−11° mid≈−19° end≈−27°
   • Flight 4 (L→R): start≈−34° mid≈−22° end≈−9°
   • Flight 5 (L→R): start≈−27° mid≈−21° end≈−15°
   ─── */
interface FlightConfig {
  id: string;
  plane: "side" | "diagonal" | "top" | "travel";
  startX: string; startY: string;
  midX: string;   midY: string;
  endX: string;   endY: string;
  duration: number;
  delay: number;
  scaleStart: number;
  scaleMid: number;
  scaleEnd: number;
  /** Small rotation tilt following the flight-path direction */
  rotateStart: number;
  rotateMid: number;
  rotateEnd: number;
  trailOpacity: number;
  /** true = flying right-to-left (affects trail position) */
  rtl: boolean;
}

const FLIGHTS: FlightConfig[] = [
  {
    // PlaneSide (nose→RIGHT). L→R, ascending arc.
    // Starts hidden off-screen, tiny → grows → shrinks tiny → fades off-screen.
    id: "flight-1",
    plane: "side",
    startX: "-12%", startY: "72%",
    midX: "46%",    midY: "30%",
    endX: "112%",   endY: "16%",
    duration: 16, delay: 0,
    scaleStart: 0.06, scaleMid: 1, scaleEnd: 0.06,
    rotateStart: -35, rotateMid: -22, rotateEnd: -9,
    trailOpacity: 0.55,
    rtl: false,
  },
  {
    // PlaneTravel (nose→RIGHT). L→R, wider ascending arc.
    id: "flight-2",
    plane: "travel",
    startX: "-14%", startY: "85%",
    midX: "52%",    midY: "42%",
    endX: "114%",   endY: "28%",
    duration: 20, delay: 6,
    scaleStart: 0.05, scaleMid: 0.75, scaleEnd: 0.05,
    rotateStart: -30, rotateMid: -22, rotateEnd: -15,
    trailOpacity: 0.4,
    rtl: false,
  },
  {
    // PlaneDiagonal (nose→UPPER-LEFT). R→L sweep.
    id: "flight-3",
    plane: "diagonal",
    startX: "114%", startY: "78%",
    midX: "48%",    midY: "36%",
    endX: "-14%",   endY: "12%",
    duration: 18, delay: 12,
    scaleStart: 0.05, scaleMid: 0.85, scaleEnd: 0.05,
    rotateStart: -11, rotateMid: -19, rotateEnd: -27,
    trailOpacity: 0.45,
    rtl: true,
  },
];

function PlaneComponent({ type, className }: { type: FlightConfig["plane"]; className?: string }) {
  switch (type) {
    case "side": return <PlaneSide className={className} />;
    case "diagonal": return <PlaneDiagonal className={className} />;
    case "top": return <PlaneTop className={className} />;
    case "travel": return <PlaneTravel className={className} />;
  }
}

export function FlyingAirplane() {
  return (
    <>
      <style>{`
        /* ─── Multi-plane flight system ─── */
        ${FLIGHTS.map((f) => {
          /* Trail position: L→R planes trail behind to the left, R→L trail to the right */
          const trailPos = f.rtl ? "left" : "right";
          const trailGrad = f.rtl
            ? `linear-gradient(90deg, rgba(212,175,55,${f.trailOpacity}) 0%, rgba(212,175,55,0.05) 90%, transparent 100%)`
            : `linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.05) 10%, rgba(212,175,55,${f.trailOpacity}) 100%)`;
          const trailInnerGrad = f.rtl
            ? `linear-gradient(90deg, rgba(255,255,255,${f.trailOpacity * 0.3}) 0%, rgba(255,255,255,0.02) 80%, transparent 100%)`
            : `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.02) 20%, rgba(255,255,255,${f.trailOpacity * 0.3}) 100%)`;

          return `
          @keyframes ${f.id}-move {
            0% {
              left: ${f.startX};
              top: ${f.startY};
              transform: scale(${f.scaleStart}) rotate(${f.rotateStart}deg);
              opacity: 0;
            }
            8% { opacity: 0.9; }
            12% { opacity: 1; }
            50% {
              left: ${f.midX};
              top: ${f.midY};
              transform: scale(${f.scaleMid}) rotate(${f.rotateMid}deg);
              opacity: 1;
            }
            88% { opacity: 1; }
            92% { opacity: 0.6; }
            100% {
              left: ${f.endX};
              top: ${f.endY};
              transform: scale(${f.scaleEnd}) rotate(${f.rotateEnd}deg);
              opacity: 0;
            }
          }

          @keyframes ${f.id}-glow {
            0%, 100% {
              filter: drop-shadow(0 0 4px rgba(212,175,55,0.2));
            }
            50% {
              filter: drop-shadow(0 0 18px rgba(212,175,55,0.7))
                     drop-shadow(0 4px 12px rgba(212,175,55,0.4));
            }
          }

          @keyframes ${f.id}-trail {
            0%   { width: 0;     opacity: 0; }
            10%  { opacity: ${f.trailOpacity}; }
            50%  { width: 120px; opacity: ${f.trailOpacity}; }
            90%  { opacity: ${f.trailOpacity * 0.4}; }
            100% { width: 0;     opacity: 0; }
          }

          .${f.id} {
            position: absolute;
            width: 3.5rem;
            height: 3.5rem;
            animation:
              ${f.id}-move ${f.duration}s cubic-bezier(0.25, 0.1, 0.25, 1) ${f.delay}s infinite,
              ${f.id}-glow ${f.duration / 2}s ease-in-out ${f.delay}s infinite;
            z-index: 30;
            pointer-events: none;
            will-change: transform, left, top, opacity;
          }

          .${f.id}-trail-line {
            position: absolute;
            height: 1.5px;
            ${trailPos}: 100%;
            top: 50%;
            transform: translateY(-50%);
            background: ${trailGrad};
            border-radius: 1px;
            animation: ${f.id}-trail ${f.duration}s cubic-bezier(0.25, 0.1, 0.25, 1) ${f.delay}s infinite;
            pointer-events: none;
          }

          .${f.id}-trail-inner {
            position: absolute;
            height: 0.5px;
            ${trailPos}: 100%;
            top: 50%;
            margin-top: 1px;
            transform: translateY(-50%);
            background: ${trailInnerGrad};
            border-radius: 1px;
            animation: ${f.id}-trail ${f.duration}s cubic-bezier(0.25, 0.1, 0.25, 1) ${f.delay + 0.15}s infinite;
            pointer-events: none;
          }
        `;
        }).join("\n")}

        /* Subtle body bob for realism */
        @keyframes plane-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .plane-bob {
          animation: plane-bob 2.5s ease-in-out infinite;
        }

        /* Sparkle dots along trails */
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {FLIGHTS.map((flight) => (
        <div key={flight.id} className={flight.id}>
          {/* Vapor trail */}
          <div className={`${flight.id}-trail-line`} />
          <div className={`${flight.id}-trail-inner`} />

          {/* Plane body with subtle bob */}
          <div className="plane-bob w-full h-full">
            <PlaneComponent type={flight.plane} className="w-full h-full" />
          </div>
        </div>
      ))}

      {/* Sparkle particles scattered along flight corridors */}
      {[
        { left: "20%", top: "52%", delay: "2s", size: 3 },
        { left: "35%", top: "38%", delay: "4s", size: 2 },
        { left: "55%", top: "30%", delay: "6s", size: 2.5 },
        { left: "70%", top: "25%", delay: "8s", size: 2 },
        { left: "42%", top: "42%", delay: "10s", size: 1.5 },
        { left: "65%", top: "48%", delay: "12s", size: 2 },
        { left: "30%", top: "60%", delay: "3s", size: 1.5 },
        { left: "80%", top: "35%", delay: "7s", size: 2 },
        { left: "48%", top: "22%", delay: "11s", size: 3 },
        { left: "15%", top: "70%", delay: "5s", size: 1.5 },
      ].map((spark, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: spark.left,
            top: spark.top,
            width: spark.size,
            height: spark.size,
            background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)",
            animation: `sparkle 4s ease-in-out ${spark.delay} infinite`,
            zIndex: 25,
          }}
        />
      ))}
    </>
  );
}
