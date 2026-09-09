"use client";

import { useState } from "react";
import FixtureCard from "@/components/FixtureCard";
import { Shield, Eye, Layers, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [overrideState, setOverrideState] = useState<
    "default" | "loading" | "error" | "empty"
  >("default");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Banner Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>DevConnect Final Project • Feature Rebuild</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Real Madrid Match Schedule & Fixtures
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            A production-ready rebuild of the match fixture schedule component with zero layout shift, accessibility controls, and asynchronous state handling.
          </p>
        </div>

        {/* Reviewer State Controller Controls */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Eye className="w-4 h-4" />
              <span>Reviewer Test Controls (Force UI States)</span>
            </div>
            <span className="text-xs text-slate-400">
              Active State: <strong className="text-amber-400 uppercase">{overrideState}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["default", "loading", "error", "empty"] as const).map((state) => (
              <button
                key={state}
                onClick={() => setOverrideState(state)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                  overrideState === state
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {overrideState === state && <CheckCircle2 className="w-3.5 h-3.5" />}
                <span className="capitalize">{state} State</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Interactive Component */}
        <FixtureCard
          overrideState={overrideState}
          onResetOverrideState={() => setOverrideState("default")}
        />

        {/* Accessibility & Feature Highlights Footer */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-xs text-slate-400 space-y-3">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Engineering & Accessibility Standards Handled
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-disc list-inside text-slate-400">
            <li>Full Keyboard Nav: Tab focus & Arrow key tab navigation</li>
            <li>Escape key listener to close match detail modals</li>
            <li>Complete UI handling for Loading, Error, and Empty states</li>
            <li>Zero layout shift client tab switching</li>
          </ul>
        </div>
      </div>
    </main>
  );
}