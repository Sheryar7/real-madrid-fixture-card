"use client";

import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { supabase } from "@/lib/supabase";
import {
    Calendar,
    MapPin,
    Trophy,
    RefreshCw,
    AlertTriangle,
    X,
    ChevronRight,
} from "lucide-react";

export interface Match {
    id: string;
    opponent_name: string;
    opponent_logo: string;
    competition: string;
    match_date: string;
    venue: string;
    is_home: boolean;
    status: "UPCOMING" | "FINISHED";
    home_score: number | null;
    away_score: number | null;
}

interface FixtureCardProps {
    overrideState?: "default" | "loading" | "error" | "empty";
}

export default function FixtureCard({ overrideState = "default" }: FixtureCardProps) {
    const [activeTab, setActiveTab] = useState<"UPCOMING" | "FINISHED">("UPCOMING");
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    const upcomingTabRef = useRef<HTMLButtonElement>(null);
    const finishedTabRef = useRef<HTMLButtonElement>(null);

    const fetchMatches = async () => {
        setLoading(true);
        setError(null);

        if (overrideState === "loading") return;
        if (overrideState === "error") {
            setLoading(false);
            setError("Failed to fetch Real Madrid fixture data. Please check your network connection.");
            return;
        }

        try {
            const { data, error: fetchError } = await supabase
                .from("matches")
                .select("*")
                .order("match_date", { ascending: activeTab === "UPCOMING" });

            if (fetchError) throw fetchError;

            if (overrideState === "empty") {
                setMatches([]);
            } else {
                const filtered = (data || []).filter((m) => m.status === activeTab);
                setMatches(filtered);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, [activeTab, overrideState]);

    // Keyboard navigation across tabs
    const handleTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            const nextTab = activeTab === "UPCOMING" ? "FINISHED" : "UPCOMING";
            setActiveTab(nextTab);
            if (nextTab === "UPCOMING") upcomingTabRef.current?.focus();
            else finishedTabRef.current?.focus();
        }
    };

    // Close modal with Escape key
    useEffect(() => {
        const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
            if (e.key === "Escape" && selectedMatch) {
                setSelectedMatch(null);
            }
        };
        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [selectedMatch]);

    return (
        <div className="w-full max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                        <span>Real Madrid C.F.</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                            Official Fixtures
                        </span>
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Rebuilt Schedule & Results Feature with Full Keyboard Accessibility
                    </p>
                </div>

                {/* Accessible Tab Navigation */}
                <div
                    role="tablist"
                    aria-label="Real Madrid Match Categories"
                    className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto"
                >
                    <button
                        ref={upcomingTabRef}
                        role="tab"
                        aria-selected={activeTab === "UPCOMING"}
                        tabIndex={activeTab === "UPCOMING" ? 0 : -1}
                        onClick={() => setActiveTab("UPCOMING")}
                        onKeyDown={handleTabKeyDown}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${activeTab === "UPCOMING"
                                ? "bg-amber-500 text-slate-950 font-semibold shadow-md"
                                : "text-slate-400 hover:text-white"
                            }`}
                    >
                        Upcoming
                    </button>
                    <button
                        ref={finishedTabRef}
                        role="tab"
                        aria-selected={activeTab === "FINISHED"}
                        tabIndex={activeTab === "FINISHED" ? 0 : -1}
                        onClick={() => setActiveTab("FINISHED")}
                        onKeyDown={handleTabKeyDown}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${activeTab === "FINISHED"
                                ? "bg-amber-500 text-slate-950 font-semibold shadow-md"
                                : "text-slate-400 hover:text-white"
                            }`}
                    >
                        Results
                    </button>
                </div>
            </div>

            {/* Dynamic Content Views */}
            <div className="mt-6">
                {/* Loading State (Skeletons) */}
                {loading && (
                    <div className="space-y-4" aria-busy="true" aria-label="Loading fixtures">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="animate-pulse bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex justify-between items-center h-24"
                            >
                                <div className="space-y-2 w-1/3">
                                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                                    <div className="h-3 bg-slate-800/60 rounded w-1/2"></div>
                                </div>
                                <div className="h-8 bg-slate-800 rounded w-1/4"></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="p-6 bg-red-950/30 border border-red-800/50 rounded-xl text-center space-y-3">
                        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
                        <h3 className="text-lg font-bold text-red-200">Unable to Load Matches</h3>
                        <p className="text-sm text-red-300/80 max-w-md mx-auto">{error}</p>
                        <button
                            onClick={fetchMatches}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Retry Connection
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && matches.length === 0 && (
                    <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center space-y-3">
                        <Trophy className="w-10 h-10 text-amber-500/50 mx-auto" />
                        <h3 className="text-lg font-bold text-slate-200">No Matches Found</h3>
                        <p className="text-sm text-slate-400 max-w-sm mx-auto">
                            There are no scheduled {activeTab.toLowerCase()} Real Madrid fixtures available at this time.
                        </p>
                    </div>
                )}

                {/* Default State: Match List */}
                {!loading && !error && matches.length > 0 && (
                    <div className="space-y-4" role="feed" aria-label="Matches List">
                        {matches.map((match) => (
                            <div
                                key={match.id}
                                tabIndex={0}
                                role="button"
                                onClick={() => setSelectedMatch(match)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        setSelectedMatch(match);
                                    }
                                }}
                                className="group bg-slate-950 hover:bg-slate-800/60 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 flex flex-col sm:flex-row items-center justify-between gap-4"
                            >
                                {/* Competition & Venue */}
                                <div className="space-y-1 text-center sm:text-left w-full sm:w-1/3">
                                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
                                        <Trophy className="w-3.5 h-3.5" />
                                        {match.competition}
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                        {match.venue}
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(match.match_date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>

                                {/* Match Score / vs Info */}
                                <div className="flex items-center justify-center gap-4 w-full sm:w-1/2">
                                    <div className="text-right font-bold text-sm w-1/3 text-slate-200">
                                        {match.is_home ? "Real Madrid" : match.opponent_name}
                                    </div>

                                    <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-center font-mono font-bold text-amber-400 text-sm">
                                        {match.status === "FINISHED"
                                            ? `${match.home_score} - ${match.away_score}`
                                            : "VS"}
                                    </div>

                                    <div className="text-left font-bold text-sm w-1/3 text-slate-200">
                                        {match.is_home ? match.opponent_name : "Real Madrid"}
                                    </div>
                                </div>

                                <div className="hidden sm:block text-slate-500 group-hover:text-amber-400 transition">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Match Detail Modal (Accessible with Escape key handling) */}
            {selectedMatch && (
                <div
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
                        <button
                            onClick={() => setSelectedMatch(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                            aria-label="Close details modal"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 id="modal-title" className="text-xl font-bold text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            Match Breakdown
                        </h3>

                        <div className="space-y-3 text-sm text-slate-300">
                            <p>
                                <strong className="text-slate-100">Fixture:</strong>{" "}
                                {selectedMatch.is_home
                                    ? `Real Madrid vs ${selectedMatch.opponent_name}`
                                    : `${selectedMatch.opponent_name} vs Real Madrid`}
                            </p>
                            <p>
                                <strong className="text-slate-100">Tournament:</strong> {selectedMatch.competition}
                            </p>
                            <p>
                                <strong className="text-slate-100">Stadium:</strong> {selectedMatch.venue}
                            </p>
                            <p>
                                <strong className="text-slate-100">Status:</strong> {selectedMatch.status}
                            </p>
                            {selectedMatch.status === "FINISHED" && (
                                <p>
                                    <strong className="text-slate-100">Final Result:</strong> {selectedMatch.home_score} -{" "}
                                    {selectedMatch.away_score}
                                </p>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => setSelectedMatch(null)}
                                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-amber-400"
                            >
                                Close (Esc)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}