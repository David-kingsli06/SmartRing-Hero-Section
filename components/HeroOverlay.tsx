"use client";

import React from "react";
import { FEATURES } from "@/lib/features";

interface HeroOverlayProps {
  progress: number;
  canvasEntered: boolean;
  reducedMotion: boolean;
}

export default function HeroOverlay({
  progress,
  canvasEntered,
  reducedMotion,
}: HeroOverlayProps) {
  const isFeatureHoldActive = FEATURES.some(
    (f) => progress >= f.holdStart && progress <= f.holdEnd
  );

  // Stage 1 (0 to 0.28): Headline 1
  const stage1Opacity = reducedMotion
    ? 0
    : progress <= 0.26
    ? 1
    : Math.max(0, 1 - (progress - 0.26) / 0.04);

  // Stage 3 (0.72 to 1.0): Wordmark "AURA RING" reveals
  let stage3Opacity = 0;
  if (reducedMotion) {
    stage3Opacity = 1;
  } else if (progress < 0.72) {
    stage3Opacity = 0;
  } else if (progress >= 0.72 && progress <= 0.82) {
    stage3Opacity = (progress - 0.72) / (0.82 - 0.72);
  } else {
    stage3Opacity = 1;
  }

  // Scroll cue: bottom center, fading out after p = 0.05
  const scrollCueOpacity = reducedMotion
    ? 0
    : progress < 0.01
    ? 1
    : Math.max(0, 1 - progress / 0.05);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
      {/* Stage 1: Headline & Subline */}
      <div
        className={`absolute select-none flex flex-col justify-center
          top-[10%] left-[6vw] w-[88vw]
          lg:top-1/2 lg:-translate-y-1/2 lg:left-[6vw] lg:w-[26vw]
          ${isFeatureHoldActive ? "max-lg:opacity-0" : ""}`}
        style={{
          opacity: canvasEntered ? stage1Opacity : 0,
          transition: "opacity 600ms cubic-bezier(0.22, 1, 0.36, 1), transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
          transform: canvasEntered ? "translateY(0px)" : "translateY(12px)",
        }}
      >
        <h1
          className="text-[44px] sm:text-[52px] lg:text-[76px] font-extrabold text-[#F2F0EB] text-left leading-[1.02]"
          style={{
            fontFamily: "var(--font-sans)",
            letterSpacing: "-0.02em",
          }}
        >
          Health, on your finger.
        </h1>

        <p
          className="mt-6 text-[18px] sm:text-[20px] lg:text-[22px] text-[#F2F0EB]/80 font-normal leading-[1.4] text-left"
          style={{
            fontFamily: "var(--font-sans)",
            transition: "opacity 600ms cubic-bezier(0.22, 1, 0.36, 1) 120ms, transform 600ms cubic-bezier(0.22, 1, 0.36, 1) 120ms",
            transform: canvasEntered ? "translateY(0px)" : "translateY(12px)",
          }}
        >
          Sleep, heart rate, and recovery in one ring.
        </p>
      </div>

      {/* Stage 3: Wordmark "AURA RING" */}
      <div
        className="absolute select-none flex flex-col justify-center
          top-[10%] left-[6vw] w-[88vw]
          lg:top-1/2 lg:-translate-y-1/2 lg:left-[6vw] lg:w-[26vw]"
        style={{
          opacity: stage3Opacity,
          transition: "opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <p
          className="text-[56px] sm:text-[68px] lg:text-[96px] font-extrabold text-[#F2F0EB] leading-[0.98] tracking-tight uppercase"
          style={{
            fontFamily: "var(--font-sans)",
            letterSpacing: "-0.03em",
          }}
        >
          Aura
          <br />
          Ring
        </p>

        <p
          className="mt-6 text-[18px] sm:text-[20px] lg:text-[22px] text-[#F2F0EB]/80 font-normal leading-[1.4]"
          style={{
            fontFamily: "var(--font-sans)",
          }}
        >
          Track every night. Recover every day.
        </p>
      </div>

      {/* Scroll cue: bottom center, fading out after p = 0.05 */}
      {!reducedMotion && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-300 select-none z-30"
          style={{
            opacity: scrollCueOpacity,
          }}
        >
          <span
            className="text-[12px] font-medium tracking-[0.2em] uppercase text-[#F2F0EB]"
            style={{
              fontFamily: "var(--font-sans)",
            }}
          >
            Scroll
          </span>
          <div className="w-[1px] h-[40px] bg-[#C9CDD2]" />
        </div>
      )}
    </div>
  );
}
