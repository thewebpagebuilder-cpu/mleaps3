"use client";

import React from "react";

interface MleapsLogoProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function MleapsLogo({ size = "md", className = "" }: MleapsLogoProps) {
  const d = {
    xs: { width: 112, height: 45 },
    sm: { width: 146, height: 59 },
    md: { width: 190, height: 76 },
    lg: { width: 248, height: 100 },
  }[size];

  return (
    <div className={`inline-flex items-center select-none group ${className}`}>
      <svg
        width={d.width}
        height={d.height}
        viewBox="0 0 460 185"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="mlArrow" x1="20" y1="145" x2="185" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E07A1F" />
            <stop offset="50%" stopColor="#F0A93C" />
            <stop offset="100%" stopColor="#F3DCA4" />
          </linearGradient>
          <linearGradient id="mlWord" x1="145" y1="40" x2="430" y2="155" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F3DCA4" />
            <stop offset="45%" stopColor="#D9B45B" />
            <stop offset="100%" stopColor="#A8822F" />
          </linearGradient>
          <filter id="mlGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feComposite in="SourceGraphic" in2="b" operator="over" />
          </filter>
        </defs>

        <g
          className="transition-transform duration-500 ease-out group-hover:-translate-y-[2px]"
          filter="url(#mlGlow)"
        >
          <path
            d="M 24 134 L 24 34 L 44 34 L 96 86 L 154 28 L 141 18 L 185 8 L 173 50 L 164 38 L 96 106 L 42 52 L 42 134 Z"
            fill="url(#mlArrow)"
          />
          <path
            d="M 54 74 L 96 116 L 146 66 L 146 84 L 96 134 L 54 92 Z"
            fill="url(#mlArrow)"
            opacity="0.92"
          />
        </g>

        <g>
          <path d="M 146 65 L 168 43 L 168 134 L 146 134 Z" fill="url(#mlWord)" />
          <text
            x="174"
            y="134"
            fill="url(#mlWord)"
            fontFamily="'Syne', system-ui, sans-serif"
            fontWeight="800"
            fontSize="94"
            letterSpacing="-3"
          >
            eaps
          </text>
        </g>

        <text
          x="25"
          y="167"
          fill="#9FB0CC"
          fontFamily="'Manrope', system-ui, sans-serif"
          fontWeight="600"
          fontSize="19.5"
          letterSpacing="14.6"
        >
          CONSULTING
        </text>
      </svg>
    </div>
  );
}
