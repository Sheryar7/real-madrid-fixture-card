"use client";

import { useEffect, useState, useRef, KeyboardEvent } from "react";
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
  real_madrid_logo: string;
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
  onResetOverrideState?: () => void;
}

// Fallback lookup table for opponent stadiums (Football-Data free tier omits away venue fields)
const opponentStadiums: Record<string, string> = {
  "Atlético de Madrid": "Riyadh Air Metropolitano",
  "FC Barcelona": "Spotify Camp Nou",
  "Real Betis Balompié": "Estadio Benito Villamarín",
  "Rayo Vallecano": "Campo de Fútbol de Vallecas",
  "RCD Espanyol de Barcelona": "Stage Front Stadium",
  "Real Sociedad de Fútbol": "Reale Arena",
  "Athletic Club": "San Mamés",
  "Villarreal CF": "Estadio de la Cerámica",
  "Sevilla FC": "Estadio Ramón Sánchez Pizjuán",
  "Valencia CF": "Mestalla",
  "Getafe CF": "Coliseum",
  "RC Celta de Vigo": "Abanca-Balaídos",
  "Girona FC": "Estadi Montilivi",
  "RCD Mallorca": "Estadi Mallorca Son Moix",
  "CA Osasuna": "El Sadar",
  "Deportivo Alavés": "Mendizorrotza",
  "UD Las Palmas": "Estadio Gran Canaria",
  "CD Leganés": "Estadio Municipal de Butarque",
  "Real Valladolid CF": "Estadio José Zorrilla",
  "AC Milan": "San Siro",
  "FC Bayern München": "Allianz Arena",
  "Borussia Dortmund": "Signal Iduna Park",
  "Liverpool FC": "Anfield",
  "Manchester City FC": "Etihad Stadium",
  "Arsenal FC": "Emirates Stadium",
  "Paris Saint-Germain FC": "Parc des Princes",
  "Juventus FC": "Allianz Stadium",
};

export default function FixtureCard({
  overrideState = "default",
  onResetOverrideState,
}: FixtureCardProps) {
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "FINISHED">("UPCOMING");
  const [rawMatches, setRawMatches] = useState<Match[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const upcomingTabRef = useRef<HTMLButtonElement>(null);
  const finishedTabRef = useRef<HTMLButtonElement>(null);
  const skipNextOverrideFetchRef = useRef(false);

  // 1. Fetch all raw matches ONCE on mount or when overrideState changes
  const fetchAllMatches = async (force = false) => {
    setLoading(true);
    setError(null);

    if (overrideState === "loading") return;
    if (overrideState === "error" && !force) {
      setLoading(false);
      setError("Failed to fetch live Real Madrid fixture data.");
      return;
    }

    try {
      const res = await fetch("/api/matches");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "API Connection Failed");
      }

      if (overrideState === "empty" && !force) {
        setRawMatches([]);
        return;
      }

      // Parse matches from Football-Data.org response
      const transformedMatches: Match[] = (data.matches || []).map((m: any) => {
        const isHome = m.homeTeam.id === 86; // 86 is Real Madrid in Football-Data.org
        const opponentName = isHome ? m.awayTeam.name : m.homeTeam.name;

        // Resolve logos and stadium
        const realMadridCrest = isHome ? m.homeTeam.crest : m.awayTeam.crest;
        const opponentCrest = isHome ? m.awayTeam.crest : m.homeTeam.crest;

        // Map API competition names to display names
        const rawCompetition = m.competition.name;
        const competitionName =
          rawCompetition === "Primera Division" ? "LaLiga" : rawCompetition;

        const venueName = isHome
          ? "Santiago Bernabéu, Madrid"
          : m.venue
          ? m.venue
          : opponentStadiums[opponentName]
          ? opponentStadiums[opponentName]
          : `${opponentName} Stadium`;

        return {
          id: String(m.id),
          opponent_name: opponentName,
          opponent_logo: opponentCrest,
          real_madrid_logo: realMadridCrest,
          competition: competitionName,
          match_date: m.utcDate,
          venue: venueName,
          is_home: isHome,
          status: m.status === "FINISHED" ? "FINISHED" : "UPCOMING",
          home_score: m.score?.fullTime?.home ?? null,
          away_score: m.score?.fullTime?.away ?? null,
        };
      });

      setRawMatches(transformedMatches);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (skipNextOverrideFetchRef.current) {
      skipNextOverrideFetchRef.current = false;
      return;
    }
    fetchAllMatches();
  }, [overrideState]);

  // 2. Filter matches client-side when activeTab or rawMatches change
  useEffect(() => {
    const filtered = rawMatches.filter((m) => m.status === activeTab);
    setMatches(filtered);
  }, [activeTab, rawMatches]);

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
    <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl shadow-slate-950/40">
      {/* Header */}
      <div className="flex flex-col gap-5 border-b border-slate-800/90 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Real Madrid C.F.</h2>
            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-300">
              Official Fixtures
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-400 sm:text-sm">
            Live Matches & Results Powered by Football-Data API
          </p>
        </div>

        {/* Accessible Tab Navigation */}
        <div
          role="tablist"
          aria-label="Real Madrid Match Categories"
          className="flex w-full rounded-xl border border-slate-800 bg-slate-950/80 p-1 sm:w-auto"
        >
          <button
            ref={upcomingTabRef}
            role="tab"
            aria-selected={activeTab === "UPCOMING"}
            tabIndex={activeTab === "UPCOMING" ? 0 : -1}
            onClick={() => setActiveTab("UPCOMING")}
            onKeyDown={handleTabKeyDown}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:flex-none ${
              activeTab === "UPCOMING"
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
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:flex-none ${
              activeTab === "FINISHED"
                ? "bg-amber-500 text-slate-950 font-semibold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Results
          </button>
        </div>
      </div>

      {/* Dynamic Content Views */}
      <div className="px-4 py-5 sm:px-6 sm:py-6">
        {/* Loading State */}
        {loading && (
          <div className="space-y-3" aria-busy="true" aria-label="Loading fixtures">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex min-h-32 animate-pulse items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:min-h-26"
              >
                <div className="hidden w-1/4 space-y-2 sm:block">
                  <div className="h-3 w-24 rounded bg-slate-800"></div>
                  <div className="h-3 w-32 rounded bg-slate-800/70"></div>
                  <div className="h-3 w-28 rounded bg-slate-800/50"></div>
                </div>
                <div className="flex flex-1 items-center justify-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-800"></div>
                  <div className="h-8 w-12 rounded-lg bg-slate-800"></div>
                  <div className="h-10 w-10 rounded-full bg-slate-800"></div>
                </div>
                <div className="h-5 w-5 rounded bg-slate-800/60"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="space-y-4 rounded-xl border border-red-400/20 bg-red-950/20 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-red-400/20 bg-red-400/10">
              <AlertTriangle className="h-5 w-5 text-red-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-red-100">Unable to Load Matches</h3>
              <p className="mx-auto max-w-md text-sm text-red-200/70">{error}</p>
            </div>
            <button
              onClick={() => {
                if (onResetOverrideState) {
                  skipNextOverrideFetchRef.current = true;
                }
                onResetOverrideState?.();
                void fetchAllMatches(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300/20 bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && matches.length === 0 && (
          <div className="space-y-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/30 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10">
              <Trophy className="h-5 w-5 text-amber-300" />
            </div>
            <h3 className="text-base font-bold text-slate-100">No Matches Found</h3>
            <p className="mx-auto max-w-sm text-sm text-slate-400">
              There are no scheduled {activeTab.toLowerCase()} Real Madrid fixtures available at this time.
            </p>
          </div>
        )}

        {/* Default State: Match List */}
        {!loading && !error && matches.length > 0 && (
          <div className="space-y-3" role="feed" aria-label="Matches List">
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
                aria-label={`View details for ${match.is_home ? `Real Madrid vs ${match.opponent_name}` : `${match.opponent_name} vs Real Madrid`}`}
                className="group grid min-h-32 cursor-pointer grid-cols-1 items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition-all duration-200 hover:border-amber-400/35 hover:bg-slate-800/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:min-h-26 sm:grid-cols-[minmax(170px,1fr)_minmax(280px,1.5fr)_24px] sm:gap-5 sm:p-5"
              >
                {/* Competition & Venue */}
                <div className="min-w-0 space-y-2 text-center sm:text-left">
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-300 sm:justify-start">
                    <Trophy className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{match.competition}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 sm:justify-start">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                    <span>{new Date(match.match_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 truncate text-xs text-slate-500 sm:justify-start">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{match.venue}</span>
                  </div>
                </div>

                {/* Match Score / VS Info */}
                <div className="flex min-w-0 items-center justify-center gap-3 sm:gap-4">
                  {/* Home Team */}
                  <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
                    <span className="truncate text-sm font-semibold text-slate-100">
                      {match.is_home ? "Real Madrid" : match.opponent_name}
                    </span>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 p-1.5">
                      {match.is_home ? (
                        match.real_madrid_logo ? (
                          <img src={match.real_madrid_logo} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[10px] font-black text-amber-300">RM</span>
                        )
                      ) : match.opponent_logo ? (
                        <img src={match.opponent_logo} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">FC</span>
                      )}
                    </div>
                  </div>

                  {/* VS / Score Divider */}
                  <div className="min-w-13 rounded-lg border border-amber-400/20 bg-amber-400/10 px-2.5 py-2 text-center font-mono text-xs font-bold text-amber-300">
                    {match.status === "FINISHED"
                      ? `${match.home_score} - ${match.away_score}`
                      : "VS"}
                  </div>

                  {/* Away Team */}
                  <div className="flex min-w-0 flex-1 items-center justify-start gap-2 text-left">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 p-1.5">
                      {match.is_home ? (
                        match.opponent_logo ? (
                          <img src={match.opponent_logo} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">FC</span>
                        )
                      ) : match.real_madrid_logo ? (
                        <img src={match.real_madrid_logo} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-[10px] font-black text-amber-300">RM</span>
                      )}
                    </div>
                    <span className="truncate text-sm font-semibold text-slate-100">
                      {match.is_home ? match.opponent_name : "Real Madrid"}
                    </span>
                  </div>
                </div>

                <div className="hidden text-slate-600 transition group-hover:text-amber-300 sm:block">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="relative w-full max-w-md space-y-5 rounded-2xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl shadow-slate-950/60">
            <button
              onClick={() => setSelectedMatch(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Close details modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300">Match details</p>
              <h3 id="modal-title" className="flex items-center gap-2 text-xl font-bold text-white">
                <Trophy className="h-5 w-5 text-amber-400" />
                Match Breakdown
              </h3>
            </div>

            <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/40 px-4 text-sm">
              <p className="flex items-start justify-between gap-4 py-3">
                <strong className="text-slate-400">Fixture</strong>
                <span className="text-right text-slate-100">
                {selectedMatch.is_home
                  ? `Real Madrid vs ${selectedMatch.opponent_name}`
                  : `${selectedMatch.opponent_name} vs Real Madrid`}
                </span>
              </p>
              <p className="flex items-start justify-between gap-4 py-3">
                <strong className="text-slate-400">Tournament</strong>
                <span className="text-right text-slate-100">{selectedMatch.competition}</span>
              </p>
              <p className="flex items-start justify-between gap-4 py-3">
                <strong className="text-slate-400">Stadium</strong>
                <span className="text-right text-slate-100">{selectedMatch.venue}</span>
              </p>
              <p className="flex items-start justify-between gap-4 py-3">
                <strong className="text-slate-400">Status</strong>
                <span className="text-right font-semibold text-amber-300">{selectedMatch.status}</span>
              </p>
              {selectedMatch.status === "FINISHED" && (
                <p className="flex items-start justify-between gap-4 py-3">
                  <strong className="text-slate-400">Final Result</strong>
                  <span className="text-right font-mono font-bold text-slate-100">{selectedMatch.home_score} - {selectedMatch.away_score}</span>
                </p>
              )}
            </div>

            <div className="pt-1">
              <button
                onClick={() => setSelectedMatch(null)}
                className="w-full rounded-xl bg-amber-400 py-2.5 font-bold text-slate-950 transition hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
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