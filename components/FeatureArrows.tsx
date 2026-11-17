"use client";

import React from "react";
import { FEATURES, Feature } from "@/lib/features";

interface FeatureArrowsProps {
  progress: number;
  reducedMotion: boolean;
}

export default function FeatureArrows({
  progress,
  reducedMotion,
}: FeatureArrowsProps) {
  // Find which feature is currently active (holds at 0.36, 0.48, 0.60)
  const activeFeatureIndex = FEATURES.findIndex(
    (f) => progress >= f.holdStart && progress <= f.holdEnd
  );

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
      {/* SVG Leader Lines & Anchor Dots (Desktop only: 1024px and up) */}
      <svg className="w-full h-full hidden lg:block absolute inset-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>{`
            @keyframes pulseOnce {
              0% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.15); opacity: 1; }
              100% { transform: scale(1); opacity: 0.9; }
            }
            .dot-pulse {
              animation: pulseOnce 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
          `}</style>
        </defs>

        {FEATURES.map((feature: Feature, idx: number) => {
          const isActive =
            reducedMotion || activeFeatureIndex === idx;

          const anchorX = `${feature.anchor.x}%`;
          const anchorY = `${feature.anchor.y}%`;
          const targetX = `${feature.panelTarget.x}%`;
          const targetY = `${feature.panelTarget.y}%`;

          return (
            <g
              key={feature.id}
              className={`transition-opacity duration-300 ease-out ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Leader line from sensor anchor to right column panel target */}
              <line
                x1={anchorX}
                y1={anchorY}
                x2={targetX}
                y2={targetY}
                stroke="#C9CDD2"
                strokeWidth="1"
                strokeDasharray="200"
                strokeDashoffset={isActive ? "0" : "200"}
                className="transition-all duration-400 ease-out"
              />

              {/* Anchor dot on the sensor pod: 6px diameter */}
              <circle
                cx={anchorX}
                cy={anchorY}
                r={3}
                fill="#C9CDD2"
                className={isActive && !reducedMotion ? "dot-pulse" : ""}
                style={{ transformOrigin: `${anchorX} ${anchorY}` }}
              />
            </g>
          );
        })}
      </svg>

      {/* Right Column Stat Panels (Desktop: ends at 6vw from right edge, width 22vw, vertically centered) */}
      {/* Mobile: Full-width in top band during hold */}
      <div className="absolute inset-0 pointer-events-none">
        {FEATURES.map((feature: Feature, idx: number) => {
          const isActive = reducedMotion || activeFeatureIndex === idx;

          return (
            <div
              key={feature.id}
              className={`absolute flex flex-col transition-all duration-300 ease-out
                /* Mobile: top band replacing headline */
                top-[12%] left-[6vw] w-[88vw]
                /* Desktop: right column, ends at 6vw from right edge, width 22vw, vertically centered */
                lg:top-1/2 lg:-translate-y-1/2 lg:left-auto lg:right-[6vw] lg:w-[22vw]
                ${
                  isActive
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-2 pointer-events-none"
                }`}
            >
              {/* Translucent Stat Panel Card */}
              <div
                className="w-full rounded-[16px] p-6 lg:py-6 lg:px-8 border shadow-2xl backdrop-blur-[12px] flex items-center"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  borderColor: "rgba(255, 255, 255, 0.18)",
                }}
              >
                {/* Two columns inside panel */}
                {/* Left column: Big stat number (tabular figures, 48-56px, weight 700) */}
                <div className="flex-1 pr-6 flex items-center">
                  <span
                    className="text-[44px] sm:text-[48px] lg:text-[54px] font-bold text-[#F2F0EB] tabular-nums tracking-tight leading-none"
                    style={{
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {feature.statNumber}
                  </span>
                </div>

                {/* 1px vertical divider at 30% opacity */}
                <div
                  className="w-[1px] self-stretch"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                />

                {/* Right column: Stat label (weight 500, 14-16px, uppercase, 0.08em tracking) */}
                <div className="flex-1 pl-6 flex items-center">
                  <h2
                    className="text-[13px] sm:text-[14px] lg:text-[15px] font-medium uppercase text-[#F2F0EB] leading-tight"
                    style={{
                      fontFamily: "var(--font-sans)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {feature.statLabel}
                  </h2>
                </div>
              </div>

              {/* Footnote below panel */}
              {feature.footnote && (
                <p
                  className="mt-3 text-[12px] sm:text-[13px] text-[#F2F0EB]/60 font-medium select-none"
                  style={{
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {feature.footnote}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
