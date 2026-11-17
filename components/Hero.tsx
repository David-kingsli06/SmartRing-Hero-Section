"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import FrameCanvas from "@/components/FrameCanvas";
import FeatureArrows from "@/components/FeatureArrows";
import HeroOverlay from "@/components/HeroOverlay";
import { useReducedMotion } from "@/lib/useReducedMotion";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  const [progress, setProgress] = useState<number>(0);
  const [canvasEntered, setCanvasEntered] = useState<boolean>(false);
  const reducedMotion = useReducedMotion();

  // Entrance animation (on load, ~1.2s)
  useEffect(() => {
    if (reducedMotion) {
      setCanvasEntered(true);
      return;
    }

    const timer = setTimeout(() => {
      if (canvasContainerRef.current) {
        gsap.fromTo(
          canvasContainerRef.current,
          {
            scale: 0.96,
            y: 20,
            opacity: 0,
          },
          {
            scale: 1,
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)",
            onComplete: () => {
              setCanvasEntered(true);
            },
          }
        );
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [reducedMotion]);

  // Height increased to 600vh to give ample scroll runway for reading all typography details comfortably
  useGSAP(
    () => {
      if (reducedMotion) {
        setProgress(0);
        return;
      }

      if (!containerRef.current || !viewportRef.current) return;

      const trigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        pin: viewportRef.current,
        pinSpacing: false,
        onUpdate: (self) => {
          setProgress(self.progress);
        },
      });

      return () => {
        trigger.kill();
      };
    },
    { dependencies: [reducedMotion] }
  );

  return (
    <section
      ref={containerRef}
      className={`relative w-full bg-[#0A0A0B] ${
        reducedMotion ? "h-screen" : "h-[600vh]"
      }`}
    >
      {/* Sticky 100vh viewport */}
      <div
        ref={viewportRef}
        className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center"
      >
        {/* Canvas container with entrance animation */}
        <div
          ref={canvasContainerRef}
          className="absolute inset-0 w-full h-full transform-gpu will-change-transform"
        >
          <FrameCanvas
            progress={progress}
            reducedMotion={reducedMotion}
          />
        </div>

        {/* Feature Arrows Overlay */}
        <FeatureArrows
          progress={progress}
          reducedMotion={reducedMotion}
        />

        {/* Hero Overlay (Headlines, Wordmark, Scroll Cue) */}
        <HeroOverlay
          progress={progress}
          canvasEntered={canvasEntered}
          reducedMotion={reducedMotion}
        />
      </div>
    </section>
  );
}
