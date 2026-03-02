"use client";

import React, { useEffect, useRef } from "react";

/** City node positions on our SVG globe (0-100 coordinate system) */
const cities = [
  { name: "New York", x: 28, y: 38, region: "NA" },
  { name: "London", x: 47, y: 30, region: "EU" },
  { name: "Paris", x: 49, y: 33, region: "EU" },
  { name: "Dubai", x: 60, y: 42, region: "ME" },
  { name: "Singapore", x: 72, y: 55, region: "AS" },
  { name: "Tokyo", x: 80, y: 36, region: "AS" },
  { name: "Sydney", x: 82, y: 70, region: "OC" },
  { name: "São Paulo", x: 34, y: 62, region: "SA" },
  { name: "Mumbai", x: 64, y: 45, region: "AS" },
  { name: "Lagos", x: 48, y: 52, region: "AF" },
  { name: "Geneva", x: 49, y: 32, region: "EU" },
  { name: "Hong Kong", x: 75, y: 42, region: "AS" },
  { name: "Riyadh", x: 58, y: 43, region: "ME" },
];

/** Flight route arcs between cities */
const flightRoutes = [
  { from: 0, to: 1, delay: 0 },    // NY → London
  { from: 1, to: 3, delay: 2 },    // London → Dubai
  { from: 3, to: 4, delay: 4 },    // Dubai → Singapore
  { from: 4, to: 5, delay: 1 },    // Singapore → Tokyo
  { from: 0, to: 7, delay: 3 },    // NY → São Paulo
  { from: 1, to: 8, delay: 5 },    // London → Mumbai
  { from: 5, to: 6, delay: 2 },    // Tokyo → Sydney
  { from: 9, to: 1, delay: 6 },    // Lagos → London
  { from: 10, to: 12, delay: 1 },  // Geneva → Riyadh
  { from: 11, to: 0, delay: 4 },   // Hong Kong → NY
  { from: 8, to: 4, delay: 3 },    // Mumbai → Singapore
  { from: 3, to: 5, delay: 7 },    // Dubai → Tokyo
];

function generateArcPath(x1: number, y1: number, x2: number, y2: number): string {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const curvature = dist * 0.35;
  const angle = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2;
  const cpX = midX + Math.cos(angle) * curvature;
  const cpY = midY + Math.sin(angle) * curvature;
  return `M ${x1} ${y1} Q ${cpX} ${cpY} ${x2} ${y2}`;
}

interface AirplaneProps {
  pathId: string;
  delay: number;
  duration: number;
}

function AnimatedAirplane({ pathId, delay, duration }: AirplaneProps) {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const path = document.getElementById(pathId) as unknown as SVGGeometryElement;
    if (!path) return;

    let startTime: number | null = null;
    let animFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = ((timestamp - startTime) / 1000 - delay) % (duration + 2);
      
      if (elapsed < 0 || elapsed > duration) {
        el.style.opacity = "0";
      } else {
        const progress = elapsed / duration;
        const point = path.getPointAtLength(progress * path.getTotalLength());
        
        // Get direction for rotation
        const nextProgress = Math.min(progress + 0.01, 1);
        const nextPoint = path.getPointAtLength(nextProgress * path.getTotalLength());
        const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
        
        const fadeIn = Math.min(progress * 10, 1);
        const fadeOut = Math.min((1 - progress) * 10, 1);
        
        el.style.opacity = String(fadeIn * fadeOut);
        el.setAttribute("transform", `translate(${point.x}, ${point.y}) rotate(${angle})`);
      }
      
      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [pathId, delay, duration]);

  return (
    <g ref={ref} style={{ opacity: 0 }}>
      {/* Airplane glow */}
      <circle r="2" fill="#D4AF37" opacity="0.6" filter="url(#airplane-glow)" />
      {/* Airplane icon (small triangle) */}
      <polygon
        points="-2,1 0,-2 2,1"
        fill="#D4AF37"
        stroke="none"
      />
      {/* Light trail */}
      <line x1="0" y1="3" x2="0" y2="8" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
    </g>
  );
}

export default function AnimatedGlobe({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Outer atmospheric glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[90%] h-[90%] rounded-full bg-[#D4AF37]/5 blur-[80px]" />
      </div>

      {/* Main globe SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Globe gradient */}
          <radialGradient id="globe-gradient" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#0a2652" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#061B3A" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#020810" stopOpacity="1" />
          </radialGradient>
          
          {/* Atmospheric rim glow */}
          <radialGradient id="atmo-glow" cx="50%" cy="50%">
            <stop offset="85%" stopColor="transparent" />
            <stop offset="95%" stopColor="#1a6fff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#4dabff" stopOpacity="0.08" />
          </radialGradient>

          {/* Gold glow filter */}
          <filter id="gold-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
          </filter>

          {/* Airplane glow filter */}
          <filter id="airplane-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
          </filter>

          {/* Arc glow filter */}
          <filter id="arc-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" />
          </filter>

          {/* City pulse */}
          <filter id="city-pulse" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" />
          </filter>
        </defs>

        {/* Globe base */}
        <circle cx="50" cy="50" r="42" fill="url(#globe-gradient)" />
        
        {/* Atmospheric rim */}
        <circle cx="50" cy="50" r="42" fill="url(#atmo-glow)" />
        
        {/* Globe outline - subtle blue rim light */}
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke="url(#atmo-glow)"
          strokeWidth="0.5"
          opacity="0.3"
        />

        {/* Latitude lines */}
        {[25, 35, 45, 55, 65].map((y) => (
          <ellipse
            key={`lat-${y}`}
            cx="50"
            cy={y}
            rx={Math.sqrt(42 * 42 - (y - 50) * (y - 50))}
            ry="1.5"
            fill="none"
            stroke="#1a6fff"
            strokeWidth="0.15"
            opacity="0.15"
          />
        ))}

        {/* Longitude curves */}
        {[35, 42, 50, 58, 65].map((x) => (
          <ellipse
            key={`lon-${x}`}
            cx={x}
            cy="50"
            rx="1.5"
            ry={Math.sqrt(42 * 42 - (x - 50) * (x - 50)) * 0.8}
            fill="none"
            stroke="#1a6fff"
            strokeWidth="0.15"
            opacity="0.12"
          />
        ))}

        {/* Landmass hints - subtle continent shapes */}
        {/* North America */}
        <path 
          d="M22 30 Q25 28 30 30 Q32 34 30 38 Q28 42 25 40 Q20 38 22 34 Z" 
          fill="#0a2652" stroke="#1a6fff" strokeWidth="0.2" opacity="0.3" 
        />
        {/* Europe */}
        <path 
          d="M44 26 Q48 24 52 26 Q54 30 52 34 Q48 36 44 34 Q42 30 44 26 Z" 
          fill="#0a2652" stroke="#1a6fff" strokeWidth="0.2" opacity="0.3" 
        />
        {/* Asia */}
        <path 
          d="M60 28 Q70 26 80 32 Q82 40 78 46 Q72 50 64 48 Q58 44 60 36 Z" 
          fill="#0a2652" stroke="#1a6fff" strokeWidth="0.2" opacity="0.3" 
        />
        {/* Africa */}
        <path 
          d="M46 42 Q50 40 54 44 Q54 54 50 60 Q46 58 44 52 Q44 46 46 42 Z" 
          fill="#0a2652" stroke="#1a6fff" strokeWidth="0.2" opacity="0.3" 
        />
        {/* South America */}
        <path 
          d="M30 50 Q34 48 36 52 Q36 60 34 66 Q30 64 28 58 Q28 54 30 50 Z" 
          fill="#0a2652" stroke="#1a6fff" strokeWidth="0.2" opacity="0.3" 
        />
        {/* Australia */}
        <path 
          d="M76 62 Q82 60 84 64 Q84 70 80 72 Q76 70 76 66 Z" 
          fill="#0a2652" stroke="#1a6fff" strokeWidth="0.2" opacity="0.3" 
        />

        {/* Flight route arcs - glow layer */}
        {flightRoutes.map((route, i) => {
          const from = cities[route.from];
          const to = cities[route.to];
          const pathD = generateArcPath(from.x, from.y, to.x, to.y);
          return (
            <path
              key={`glow-${i}`}
              d={pathD}
              fill="none"
              stroke="#D4AF37"
              strokeWidth="0.6"
              opacity="0.15"
              filter="url(#arc-glow)"
            />
          );
        })}

        {/* Flight route arcs - visible dashed lines */}
        {flightRoutes.map((route, i) => {
          const from = cities[route.from];
          const to = cities[route.to];
          const pathD = generateArcPath(from.x, from.y, to.x, to.y);
          return (
            <path
              key={`arc-${i}`}
              id={`flight-path-${i}`}
              d={pathD}
              fill="none"
              stroke="#D4AF37"
              strokeWidth="0.25"
              strokeDasharray="1.5 1"
              opacity="0.4"
              className="flight-arc"
            />
          );
        })}

        {/* Animated airplanes flying along paths */}
        {flightRoutes.map((route, i) => (
          <AnimatedAirplane
            key={`plane-${i}`}
            pathId={`flight-path-${i}`}
            delay={route.delay}
            duration={4 + Math.random() * 2}
          />
        ))}

        {/* City dots - glow layer */}
        {cities.map((city, i) => (
          <circle
            key={`glow-${i}`}
            cx={city.x}
            cy={city.y}
            r="1.8"
            fill="#D4AF37"
            opacity="0.2"
            filter="url(#city-pulse)"
          />
        ))}

        {/* City dots - core */}
        {cities.map((city, i) => (
          <g key={`city-${i}`}>
            <circle
              cx={city.x}
              cy={city.y}
              r="0.8"
              fill="#D4AF37"
              opacity="0.9"
            >
              <animate
                attributeName="r"
                values="0.6;1.2;0.6"
                dur={`${2 + (i % 3)}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.7;1;0.7"
                dur={`${2 + (i % 3)}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
}
