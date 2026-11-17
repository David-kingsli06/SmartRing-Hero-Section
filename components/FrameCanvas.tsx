"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { TOTAL_FRAMES, FRAME_WIDTH, FRAME_HEIGHT, getFramePath, mapProgressToFrame } from "@/lib/frames";

interface FrameCanvasProps {
  progress: number;
  reducedMotion: boolean;
  onLoadedChange?: (loaded: boolean) => void;
}

export default function FrameCanvas({
  progress,
  reducedMotion,
  onLoadedChange,
}: FrameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const currentRenderedFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  const [loadCount, setLoadCount] = useState<number>(0);
  const [firstBatchReady, setFirstBatchReady] = useState<boolean>(false);
  const [allReady, setAllReady] = useState<boolean>(false);
  const [isLowEnd, setIsLowEnd] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        setIsLowEnd(true);
      }
    }
  }, []);

  // Preload frames
  useEffect(() => {
    let mounted = true;
    const images: (HTMLImageElement | null)[] = new Array(TOTAL_FRAMES).fill(null);
    imagesRef.current = images;

    let loadedCounter = 0;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        if (!mounted) return;
        images[i] = img;
        loadedCounter++;
        setLoadCount(loadedCounter);

        if (loadedCounter >= 10 && !firstBatchReady) {
          setFirstBatchReady(true);
        }

        if (loadedCounter === TOTAL_FRAMES) {
          setAllReady(true);
          onLoadedChange?.(true);
        }
      };
      img.onerror = () => {
        if (!mounted) return;
        loadedCounter++;
        setLoadCount(loadedCounter);
      };
    }

    return () => {
      mounted = false;
    };
  }, [onLoadedChange]);

  // Draw frame with object-fit: cover logic and centering the ring in the ~35% center width
  const drawFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = imagesRef.current[frameIndex] || imagesRef.current[0];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      const targetCanvasWidth = Math.round(displayWidth * dpr);
      const targetCanvasHeight = Math.round(displayHeight * dpr);

      if (canvas.width !== targetCanvasWidth || canvas.height !== targetCanvasHeight) {
        canvas.width = targetCanvasWidth;
        canvas.height = targetCanvasHeight;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isMobile = displayWidth < 768;
      const posX = 0.5;
      const posY = isMobile ? 0.65 : 0.5;

      const imgAspect = FRAME_WIDTH / FRAME_HEIGHT;
      const canvasAspect = canvas.width / canvas.height;

      let drawWidth: number;
      let drawHeight: number;

      if (canvasAspect > imgAspect) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgAspect;
      } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgAspect;
      }

      const dx = (canvas.width - drawWidth) * posX;
      const dy = (canvas.height - drawHeight) * posY;

      ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
    },
    []
  );

  useEffect(() => {
    if (reducedMotion) {
      targetFrameRef.current = 0;
      currentRenderedFrameRef.current = 0;
      drawFrame(0);
      return;
    }

    let calculatedFrame = mapProgressToFrame(progress);

    if (isLowEnd) {
      calculatedFrame = Math.round(calculatedFrame / 2) * 2;
    }

    targetFrameRef.current = Math.max(0, Math.min(TOTAL_FRAMES - 1, calculatedFrame));
  }, [progress, reducedMotion, isLowEnd, drawFrame]);

  useEffect(() => {
    if (reducedMotion) return;

    let isActive = true;

    const renderLoop = () => {
      if (!isActive) return;

      const target = targetFrameRef.current;
      const current = currentRenderedFrameRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.005) {
        currentRenderedFrameRef.current = current + diff * 0.08;
      } else {
        currentRenderedFrameRef.current = target;
      }

      const frameToDraw = Math.round(currentRenderedFrameRef.current);
      drawFrame(frameToDraw);

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isActive = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [reducedMotion, drawFrame]);

  useEffect(() => {
    const handleResize = () => {
      drawFrame(Math.round(currentRenderedFrameRef.current));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawFrame]);

  const loadPercent = Math.min(100, Math.round((loadCount / TOTAL_FRAMES) * 100));

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Loading Progress Hairline */}
      {!allReady && (
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5 z-50">
          <div
            className="h-full bg-[#C9CDD2] transition-all duration-150 ease-out"
            style={{ width: `${loadPercent}%` }}
          />
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Aura Ring precision smart ring, floating and rotating in mid-air with sleep, heart rate, and recovery tracking shown as the light moves across the titanium metal."
        className={`w-full h-full block transition-opacity duration-300 ${
          firstBatchReady ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Dark-to-transparent gradient from the left edge */}
      <div
        className="absolute inset-y-0 left-0 w-[40vw] pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(10,10,11,0.92) 0%, rgba(10,10,11,0.6) 55%, rgba(10,10,11,0) 100%)",
        }}
      />
    </div>
  );
}
