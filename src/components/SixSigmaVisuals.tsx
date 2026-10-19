"use client";

import React from "react";
import { Reveal } from "./Effects";

const DMAIC = [
  { letter: "D", name: "Define", desc: "Charter · VOC · CTQ" },
  { letter: "M", name: "Measure", desc: "Baseline · Gage R&R" },
  { letter: "A", name: "Analyze", desc: "Pareto · FMEA" },
  { letter: "I", name: "Improve", desc: "Kaizen · Poka-Yoke" },
  { letter: "C", name: "Control", desc: "SPC · Control Plan" },
];

/* Rotating DMAIC orbit emblem */
export function DmaicOrbit({ size = 230 }: { size?: number }) {
  const radius = size / 2 - 26;
  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-full border border-[#d9b45b]/15" />
      <div className="absolute inset-[18px] rounded-full border border-dashed border-[#8b7bd8]/20" />
      <div className="absolute inset-0 anim-orbit">
        {DMAIC.map((s, i) => {
          const angle = (i / DMAIC.length) * Math.PI * 2 - Math.PI / 2;
          const x = size / 2 + radius * Math.cos(angle) - 21;
          const y = size / 2 + radius * Math.sin(angle) - 21;
          return (
            <div
              key={s.name}
              className="absolute w-[42px] h-[42px] rounded-full glass-deep hairline-gold flex items-center justify-center anim-orbit-rev"
              style={{ left: x, top: y }}
            >
              <span className="font-display text-sm font-bold foil-text">
                {s.letter}
              </span>
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-4xl font-extrabold foil-text leading-none">
          6σ
        </div>
        <div className="kicker text-[#8b95ad] mt-1.5">3.4 DPMO</div>
      </div>
    </div>
  );
}

export function DmaicStrip() {
  return (
    <div className="grid grid-cols-5 gap-2">
      {DMAIC.map((s, i) => (
        <Reveal key={s.name} delay={i * 80} y={16}>
          <div className="glass-deep rounded-2xl px-2.5 py-3.5 text-center hover:border-[#d9b45b]/35 transition-colors group h-full">
            <div className="w-8 h-8 mx-auto mb-2 rounded-lg border border-[#d9b45b]/25 bg-[#d9b45b]/8 flex items-center justify-center font-display text-sm font-bold foil-text group-hover:scale-110 transition-transform">
              {s.letter}
            </div>
            <div className="text-[13px] font-semibold text-[#eef2fb]">
              {s.name}
            </div>
            <div className="text-[10px] text-[#6f7b94] mt-0.5 leading-tight">
              {s.desc}
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function BellCurvePanel() {
  return (
    <div className="glass rounded-3xl p-7 relative overflow-hidden edge-gold">
      <div className="scanbeam" />
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div>
          <span className="kicker text-[#d9b45b]">Statistical Target</span>
          <h3 className="font-display text-xl font-bold text-white mt-1.5">
            The Six Sigma Standard
          </h3>
          <p className="text-sm text-[#8b95ad] mt-1 max-w-sm">
            A six-sigma process yields only{" "}
            <span className="font-data text-[#f3dca4]">3.4</span> defects per
            million opportunities.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-data text-xl font-bold foil-text">99.99966%</div>
          <div className="kicker text-[#6f7b94] mt-0.5">Yield</div>
        </div>
      </div>

      <div className="inset-dark rounded-2xl p-4 mb-6 relative z-10">
        <svg viewBox="0 0 500 152" className="w-full h-32" fill="none">
          <defs>
            <linearGradient id="bFill" x1="0" y1="0" x2="500" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#d9b45b" stopOpacity="0.02" />
              <stop offset="35%" stopColor="#d9b45b" stopOpacity="0.18" />
              <stop offset="50%" stopColor="#f3dca4" stopOpacity="0.26" />
              <stop offset="68%" stopColor="#8b7bd8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#8b7bd8" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="bLine" x1="0" y1="0" x2="500" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a8822f" />
              <stop offset="50%" stopColor="#f3dca4" />
              <stop offset="100%" stopColor="#8b7bd8" />
            </linearGradient>
          </defs>

          <line x1="20" y1="124" x2="480" y2="124" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="70" y1="20" x2="70" y2="124" stroke="rgba(251,113,133,0.4)" strokeWidth="1.2" strokeDasharray="4 4" />
          <text x="54" y="15" fill="#fb7185" fontSize="9.5" fontWeight="700" fontFamily="monospace">LSL</text>
          <line x1="430" y1="20" x2="430" y2="124" stroke="rgba(251,113,133,0.4)" strokeWidth="1.2" strokeDasharray="4 4" />
          <text x="414" y="15" fill="#fb7185" fontSize="9.5" fontWeight="700" fontFamily="monospace">USL</text>
          <line x1="250" y1="18" x2="250" y2="124" stroke="rgba(217,180,91,0.5)" strokeWidth="1.2" strokeDasharray="3 3" />
          <text x="243" y="13" fill="#d9b45b" fontSize="10" fontWeight="700" fontFamily="monospace">μ</text>

          <path
            d="M 25 124 C 110 124, 160 118, 196 66 C 221 28, 236 18, 250 18 C 264 18, 279 28, 304 66 C 340 118, 390 124, 475 124 Z"
            fill="url(#bFill)"
          />
          <path
            d="M 25 124 C 110 124, 160 118, 196 66 C 221 28, 236 18, 250 18 C 264 18, 279 28, 304 66 C 340 118, 390 124, 475 124"
            stroke="url(#bLine)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray="900"
            className="animate-[drawStroke_2s_ease-out_forwards]"
            style={{ strokeDashoffset: 0 }}
          />

          {[
            { x: 70, l: "-6σ" },
            { x: 130, l: "-3σ" },
            { x: 250, l: "0" },
            { x: 370, l: "+3σ" },
            { x: 430, l: "+6σ" },
          ].map((m) => (
            <g key={m.l}>
              <circle cx={m.x} cy="124" r="2.4" fill="#d9b45b" />
              <text x={m.x} y="141" textAnchor="middle" fill="#6f7b94" fontSize="9" fontFamily="monospace">
                {m.l}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="relative z-10">
        <DmaicStrip />
      </div>
    </div>
  );
}
