"use client";

import { useRef, useEffect } from "react";
import { useTheme } from "next-themes";

type CursorVariant = "default" | "hover" | "text" | "button" | "link" | "map";

export default function CustomCursor() {
  const cursorOuterRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  const cursorBatikRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  const { theme } = useTheme();

  // Store cursor position in refs to avoid re-renders
  const mousePosition = useRef({ x: -100, y: -100 });
  const cursorVariant = useRef<CursorVariant>("default");
  const isVisible = useRef(false);
  const isClicking = useRef(false);

  useEffect(() => {
    // Animation function using requestAnimationFrame for smooth cursor movement
    const animateCursor = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        // Only update DOM when cursor is visible
        if (
          isVisible.current &&
          cursorOuterRef.current &&
          cursorInnerRef.current &&
          cursorBatikRef.current
        ) {
          // Apply different styles based on cursor variant
          const variant = cursorVariant.current;
          const { x, y } = mousePosition.current;

          // Show cursor elements
          cursorOuterRef.current.style.opacity = "1";
          cursorInnerRef.current.style.opacity = variant === "text" ? "0" : "1";
          cursorBatikRef.current.style.opacity =
            variant === "text" ? "0" : "0.3";

          // Main cursor
          const outerSize =
            variant === "button"
              ? 64
              : variant === "hover" || variant === "link"
              ? 48
              : 32;
          cursorOuterRef.current.style.transform = `translate3d(${
            x - outerSize / 2
          }px, ${y - outerSize / 2}px, 0)`;
          cursorOuterRef.current.style.width = `${outerSize}px`;
          cursorOuterRef.current.style.height = `${outerSize}px`;

          // Apply variant-specific styles
          if (variant === "text") {
            cursorOuterRef.current.style.width = "2px";
            cursorOuterRef.current.style.height = "32px";
            cursorOuterRef.current.style.transform = `translate3d(${x - 1}px, ${
              y - 16
            }px, 0)`;
            cursorOuterRef.current.style.backgroundColor =
              "rgba(255, 255, 255, 0.8)";
            cursorOuterRef.current.style.border = "none";
          } else {
            cursorOuterRef.current.style.backgroundColor =
              variant === "default"
                ? "rgba(255, 255, 255, 0.1)"
                : variant === "hover"
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(255, 255, 255, 0)";
            cursorOuterRef.current.style.border =
              variant === "button"
                ? "2px solid rgba(255, 255, 255, 0.8)"
                : variant === "hover" || variant === "link"
                ? "2px solid rgba(255, 255, 255, 0.6)"
                : variant === "map"
                ? "2px dashed rgba(255, 255, 255, 0.6)"
                : "2px solid rgba(255, 255, 255, 0.4)";
          }

          // Inner dot cursor
          if (variant !== "text") {
            cursorInnerRef.current.style.transform = `translate3d(${x - 4}px, ${
              y - 4
            }px, 0) scale(${isClicking.current ? 1.2 : 1})`;
          }

          // Batik pattern decoration
          const batikSize =
            variant === "button"
              ? 80
              : variant === "hover" || variant === "link"
              ? 64
              : 48;
          cursorBatikRef.current.style.transform = `translate3d(${
            x - batikSize / 2
          }px, ${y - batikSize / 2}px, 0) rotate(${Date.now() / 50}deg)`;
          cursorBatikRef.current.style.width = `${batikSize}px`;
          cursorBatikRef.current.style.height = `${batikSize}px`;

          // Apply clicking state
          if (isClicking.current) {
            cursorOuterRef.current.style.transform = `translate3d(${
              x - outerSize / 2
            }px, ${y - outerSize / 2}px, 0) scale(0.9)`;
          }
        } else {
          // Hide cursor elements when not visible
          if (cursorOuterRef.current)
            cursorOuterRef.current.style.opacity = "0";
          if (cursorInnerRef.current)
            cursorInnerRef.current.style.opacity = "0";
          if (cursorBatikRef.current)
            cursorBatikRef.current.style.opacity = "0";
        }
      }

      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animateCursor);
    };

    // Event handlers
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
      isVisible.current = true;
    };

    const handleMouseLeave = () => {
      isVisible.current = false;
    };

    const handleMouseEnter = () => {
      isVisible.current = true;
    };

    // Handle when mouse leaves the document/window
    const handleDocumentMouseLeave = (e: MouseEvent) => {
      // Check if mouse is actually leaving the document
      if (
        e.clientY <= 0 ||
        e.clientX <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        isVisible.current = false;
      }
    };

    // Handle when mouse enters the document/window
    const handleDocumentMouseEnter = () => {
      isVisible.current = true;
    };

    // Handle visibility change (when switching tabs)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible.current = false;
      }
    };

    // Handle window focus/blur
    const handleWindowBlur = () => {
      isVisible.current = false;
    };

    const handleWindowFocus = () => {
      // Only show if mouse is within window bounds
      if (mousePosition.current.x >= 0 && mousePosition.current.y >= 0) {
        isVisible.current = true;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.tagName === "BUTTON" || target.closest("button")) {
        cursorVariant.current = "button";
      } else if (target.tagName === "A" || target.closest("a")) {
        cursorVariant.current = "link";
      } else if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest("input") ||
        target.closest("textarea")
      ) {
        cursorVariant.current = "text";
      } else if (
        target.classList.contains("map-area") ||
        target.closest(".map-area")
      ) {
        cursorVariant.current = "map";
      } else if (
        target.dataset.hover === "true" ||
        target.closest("[data-hover='true']")
      ) {
        cursorVariant.current = "hover";
      } else {
        cursorVariant.current = "default";
      }
    };

    const handleMouseDown = () => {
      isClicking.current = true;
    };

    const handleMouseUp = () => {
      isClicking.current = false;
    };

    // Start animation loop
    requestRef.current = requestAnimationFrame(animateCursor);

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleDocumentMouseLeave);
    document.addEventListener("mouseenter", handleDocumentMouseEnter);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    // Additional event listeners for better visibility control
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("mouseleave", handleWindowBlur);
    window.addEventListener("mouseenter", handleWindowFocus);

    // Add cursor-none class to body
    document.body.classList.add("cursor-none");

    // Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleDocumentMouseLeave);
      document.removeEventListener("mouseenter", handleDocumentMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("mouseleave", handleWindowBlur);
      window.removeEventListener("mouseenter", handleWindowFocus);
      document.body.classList.remove("cursor-none");
    };
  }, []);

  return (
    <>
      {/* Main cursor */}
      <div
        ref={cursorOuterRef}
        className="cursor-main pointer-events-none fixed top-0 left-0 z-[9999] rounded-full mix-blend-difference"
        style={{
          width: "32px",
          height: "32px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          border: "2px solid rgba(255, 255, 255, 0.4)",
          transform: "translate3d(-100px, -100px, 0)",
          opacity: "0",
          willChange:
            "transform, width, height, opacity, background-color, border",
          transition:
            "background-color 0.15s ease, border 0.15s ease, opacity 0.2s ease",
        }}
      />

      {/* Dot cursor */}
      <div
        ref={cursorInnerRef}
        className="cursor-dot pointer-events-none fixed top-0 left-0 z-[9999] rounded-full bg-white mix-blend-difference"
        style={{
          width: "8px",
          height: "8px",
          transform: "translate3d(-100px, -100px, 0)",
          opacity: "0",
          willChange: "transform, opacity",
          transition: "opacity 0.2s ease",
        }}
      />

      {/* Batik pattern cursor decoration */}
      <div
        ref={cursorBatikRef}
        className="cursor-batik pointer-events-none fixed top-0 left-0 z-[9998] rounded-full"
        style={{
          background: `radial-gradient(circle at 25% 25%, rgba(237, 137, 54, 0.4) 2px, transparent 2px),
                      radial-gradient(circle at 75% 75%, rgba(45, 55, 72, 0.4) 1px, transparent 1px)`,
          backgroundSize: "8px 8px, 6px 6px",
          backgroundPosition: "0 0, 4px 4px",
          width: "48px",
          height: "48px",
          transform: "translate3d(-100px, -100px, 0)",
          opacity: "0",
          willChange: "transform, width, height, opacity",
          transition: "opacity 0.2s ease",
        }}
      />
    </>
  );
}
