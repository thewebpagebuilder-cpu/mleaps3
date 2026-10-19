"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Question, CandidateAssignment, ExamAttempt } from "@/db/schema";
import { MleapsLogo } from "@/components/MleapsLogo";
import { BellCurvePanel, DmaicOrbit } from "@/components/SixSigmaVisuals";
import {
  ConstellationCanvas,
  Reveal,
  LuxeCard,
  CountUp,
  Marquee,
  Magnetic,
  CheckGlyph,
  CrossGlyph,
} from "@/components/Effects";
import { LiveExamArena } from "@/components/LiveExamArena";
import { ScorecardView } from "@/components/ScorecardView";
import { AdminDashboard } from "@/components/AdminDashboard";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  FileText,
  GraduationCap,
  Settings,
  Play,
  Eye,
  Award,
  Clock,
  CircleCheck,
  Hourglass,
  Sparkles,
} from "lucide-react";

type WorkspaceMode = "candidate" | "admin";
type CandidateStage = "verify" | "briefing" | "exam" | "scorecard";

interface VerificationResult {
  allowed: boolean;
  code:
    | "ACCESS_GRANTED"
    | "UNASSIGNED_EMAIL"
    | "WINDOW_NOT_OPEN"
    | "WINDOW_EXPIRED"
    | "ALREADY_COMPLETED"
    | "INVALID_INPUT"
    | "SERVER_ERROR";
  message: string;
  assignment?: CandidateAssignment;
  latestAttempt?: ExamAttempt | null;
}

export default function AssessmentPlatform() {
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("candidate");
  const [candidateStage, setCandidateStage] = useState<CandidateStage>("verify");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [assignments, setAssignments] = useState<CandidateAssignment[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [emailInput, setEmailInput] = useState("alex.rivera@mleaps.com");
  const [nameInput, setNameInput] = useState("Alex Rivera");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [activeAssignment, setActiveAssignment] =
    useState<CandidateAssignment | null>(null);
  const [completedAttempt, setCompletedAttempt] = useState<ExamAttempt | null>(
    null
  );
  const [shakeError, setShakeError] = useState(false);

  const fetchAllPlatformData = useCallback(async () => {
    try {
      const [qRes, aRes] = await Promise.all([
        fetch("/api/questions"),
        fetch("/api/assignments"),
      ]);
      if (qRes.ok) setQuestions((await qRes.json()).questions || []);
      if (aRes.ok) {
        const aData = await aRes.json();
        setAssignments(aData.assignments || []);
        setAttempts(aData.attempts || []);
      }
    } catch (err) {
      console.error("Failed to load platform data:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchAllPlatformData();
  }, [fetchAllPlatformData]);

  const handleVerifyCandidate = async (
    e?: React.FormEvent,
    overrideEmail?: string,
    overrideName?: string
  ) => {
    if (e) e.preventDefault();
    const targetEmail = (overrideEmail ?? emailInput).trim().toLowerCase();
    const targetName = (overrideName ?? nameInput).trim();
    if (!targetEmail) return;

    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const res = await fetch("/api/assignments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, candidateName: targetName }),
      });
      const data: VerificationResult = await res.json();
      setVerificationResult(data);
      if (data.allowed && data.assignment) {
        setActiveAssignment(data.assignment);
        if (!targetName && data.assignment.candidateName)
          setNameInput(data.assignment.candidateName);
      } else {
        setShakeError(true);
        setTimeout(() => setShakeError(false), 550);
      }
    } catch {
      setVerificationResult({
        allowed: false,
        code: "SERVER_ERROR",
        message: "Unable to verify eligibility. Please try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitExamAttempt = async (payload: {
    answers: Record<string, string>;
    timeSpentSeconds: number;
    startedAt: string;
  }) => {
    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignmentId: activeAssignment?.id ?? null,
        candidateName:
          nameInput.trim() ||
          activeAssignment?.candidateName ||
          "Authorized Candidate",
        candidateEmail:
          emailInput.trim().toLowerCase() ||
          activeAssignment?.candidateEmail ||
          "",
        answers: payload.answers,
        timeSpentSeconds: payload.timeSpentSeconds,
        startedAt: payload.startedAt,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setCompletedAttempt(data.attempt);
      if (data.questions) setQuestions(data.questions);
      setCandidateStage("scorecard");
      await fetchAllPlatformData();
    }
  };

  const handleTestCandidateFromAdmin = (email: string, name: string) => {
    setEmailInput(email);
    setNameInput(name);
    setWorkspaceMode("candidate");
    setCandidateStage("verify");
    handleVerifyCandidate(undefined, email, name);
  };

  if (
    workspaceMode === "candidate" &&
    candidateStage === "exam" &&
    activeAssignment
  ) {
    return (
      <LiveExamArena
        questions={questions}
        assignment={activeAssignment}
        candidateName={nameInput || activeAssignment.candidateName}
        candidateEmail={emailInput || activeAssignment.candidateEmail}
        onSubmitExam={handleSubmitExamAttempt}
        onCancelExam={() => setCandidateStage("briefing")}
      />
    );
  }

  const presets = [
    {
      email: "alex.rivera@mleaps.com",
      name: "Alex Rivera",
      label: "Active window",
      Icon: CircleCheck,
      tone: "text-emerald-300 border-emerald-400/25 bg-emerald-400/8",
    },
    {
      email: "marcus.vance@mleaps.com",
      name: "Marcus Vance",
      label: "Scheduled",
      Icon: Hourglass,
      tone: "text-amber-300 border-amber-400/25 bg-amber-400/8",
    },
    {
      email: "elena.rostova@mleaps.com",
      name: "Elena Rostova",
      label: "Expired",
      Icon: Clock,
      tone: "text-rose-300 border-rose-400/25 bg-rose-400/8",
    },
    {
      email: "siddharth.mehta@mleaps.com",
      name: "Dr. Siddharth Mehta",
      label: "Completed · 92%",
      Icon: Award,
      tone: "text-violet-300 border-violet-400/25 bg-violet-400/8",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* ambient aurora */}
      <div className="pointer-events-none fixed -top-52 -left-40 w-[620px] h-[620px] rounded-full bg-[#d9b45b]/7 blur-[170px] anim-aurora" />
      <div className="pointer-events-none fixed top-1/3 -right-48 w-[640px] h-[640px] rounded-full bg-[#8b7bd8]/9 blur-[180px] anim-aurora-2" />
      <div className="pointer-events-none fixed inset-0 grid-lines opacity-60" />

      {/* ============ NAV ============ */}
      <header className="sticky top-0 z-40 glass-deep border-b border-white/6">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between gap-4">
          <div
            onClick={() => {
              setWorkspaceMode("candidate");
              setCandidateStage("verify");
            }}
            className="flex items-center gap-4 cursor-pointer"
          >
            <MleapsLogo size="xs" />
            <div className="hidden lg:block pl-4 border-l border-white/8">
              <div className="kicker text-[#d9b45b]">Certification Authority</div>
              <div className="font-display text-[14px] font-bold text-white/90 leading-tight mt-0.5">
                Six Sigma Green Belt Assessment
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-full glass-deep hairline-gold">
            {(
              [
                { id: "candidate", label: "Candidate", Icon: GraduationCap },
                { id: "admin", label: "Administration", Icon: Settings },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setWorkspaceMode(m.id)}
                className={`px-4 sm:px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all cursor-pointer ${
                  workspaceMode === m.id
                    ? "bg-gradient-to-r from-[#d9b45b] to-[#a8822f] text-[#0a0f1e] shadow-[0_6px_20px_-6px_rgba(217,180,91,.6)]"
                    : "text-[#8b95ad] hover:text-white"
                }`}
              >
                <m.Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {workspaceMode === "admin" ? (
          <AdminDashboard
            questions={questions}
            assignments={assignments}
            attempts={attempts}
            onRefreshData={fetchAllPlatformData}
            onTestCandidateEmail={handleTestCandidateFromAdmin}
          />
        ) : candidateStage === "scorecard" && completedAttempt ? (
          <ScorecardView
            attempt={completedAttempt}
            questions={questions}
            onBack={() => {
              setCandidateStage("verify");
              setVerificationResult(null);
            }}
            backLabel="Return to verification"
          />
        ) : candidateStage === "briefing" && activeAssignment ? (
          /* ============ BRIEFING ============ */
          <div className="max-w-3xl mx-auto px-5 py-14 anim-pop">
            <div className="glass rounded-[28px] overflow-hidden edge-gold relative">
              <div className="scanbeam" />
              <div className="p-7 sm:p-11 relative z-10">
                <div className="flex items-start justify-between gap-6 pb-7 border-b border-white/8">
                  <MleapsLogo size="sm" />
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-300 border border-emerald-400/25">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                    <div className="text-xs text-[#6f7b94] mt-1.5 font-data">
                      Closes{" "}
                      {new Date(activeAssignment.validUntil).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <span className="kicker text-[#d9b45b]">
                    Examination Protocol
                  </span>
                  <h1 className="font-display text-4xl sm:text-5xl font-extrabold mt-3 leading-[1.04]">
                    <span className="block text-white">Six Sigma</span>
                    <span className="block foil-text">Green Belt</span>
                  </h1>
                  <p className="text-[#8b95ad] mt-4 leading-relaxed max-w-xl">
                    A proctored evaluation of {questions.length} questions
                    spanning the full DMAIC body of knowledge. Review the
                    protocol, then enter the examination room.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
                  {[
                    { k: "Questions", v: `${questions.length}` },
                    { k: "Duration", v: `${activeAssignment.durationMinutes}m` },
                    { k: "Format", v: "MCQ A–D" },
                    { k: "Pass mark", v: "70%" },
                  ].map((s, i) => (
                    <Reveal key={s.k} delay={i * 70} y={14}>
                      <div className="inset-dark rounded-2xl p-4 text-center">
                        <div className="font-display text-2xl font-bold foil-text">
                          {s.v}
                        </div>
                        <div className="kicker text-[#6f7b94] mt-1">{s.k}</div>
                      </div>
                    </Reveal>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
                  <div>
                    <label className="kicker text-[#6f7b94] block mb-2">
                      Candidate name
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl inset-dark text-white font-medium focus:outline-none focus:border-[#d9b45b]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="kicker text-[#6f7b94] block mb-2">
                      Authorized email
                    </label>
                    <div className="px-4 py-3 rounded-xl inset-dark text-[#8b95ad] font-data text-sm truncate">
                      {emailInput}
                    </div>
                  </div>
                </div>

                <div className="inset-dark rounded-2xl p-5 mt-7">
                  <div className="flex items-center gap-2 kicker text-[#d9b45b] mb-2.5">
                    <FileText className="w-3.5 h-3.5" /> Rules of engagement
                  </div>
                  <p className="text-sm text-[#8b95ad] leading-relaxed">
                    Select the single best answer (A, B, C, or D) for each
                    question. There is exactly one correct answer and no penalty
                    for an incorrect response. The timer starts the moment you
                    enter and submits automatically at zero. A detailed
                    scorecard with explanations is issued on submission.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 mt-9">
                  <button
                    type="button"
                    onClick={() => setCandidateStage("verify")}
                    className="text-sm font-medium text-[#6f7b94] hover:text-white transition-colors cursor-pointer"
                  >
                    ← Use a different email
                  </button>
                  <Magnetic
                    onClick={() => setCandidateStage("exam")}
                    className="sheen anim-pulse-gold group inline-flex items-center gap-3 pl-7 pr-5 py-4 rounded-full bg-gradient-to-r from-[#f3dca4] via-[#d9b45b] to-[#a8822f] text-[#0a0f1e] font-bold cursor-pointer"
                  >
                    <span>Enter examination room</span>
                    <span className="w-8 h-8 rounded-full bg-[#0a0f1e]/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                      <Play className="w-4 h-4 fill-[#0a0f1e]" />
                    </span>
                  </Magnetic>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ============ LANDING ============ */
          <>
            <section className="relative">
              <div className="absolute inset-0 pointer-events-none">
                <ConstellationCanvas className="w-full h-full" />
              </div>

              <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 pt-16 lg:pt-24 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
                  {/* LEFT */}
                  <div className="lg:col-span-7">
                    <div
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-deep hairline-gold anim-pop"
                      style={{ animationDelay: "80ms" }}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#d9b45b]" />
                      <span className="kicker text-[#d9b45b]">
                        Mleaps Consulting · Invitation Only
                      </span>
                    </div>

                    <h1 className="font-display text-[2.9rem] sm:text-6xl lg:text-[4.4rem] font-extrabold mt-7 leading-[1.02]">
                      <span className="mask-line">
                        <span
                          className="text-white"
                          style={{ animationDelay: "120ms" }}
                        >
                          Precision is
                        </span>
                      </span>
                      <span className="mask-line">
                        <span
                          className="foil-text"
                          style={{ animationDelay: "260ms" }}
                        >
                          a discipline.
                        </span>
                      </span>
                      <span className="mask-line">
                        <span
                          className="text-white/35 caret"
                          style={{ animationDelay: "400ms" }}
                        >
                          Prove yours.
                        </span>
                      </span>
                    </h1>

                    <Reveal delay={520} y={18}>
                      <p className="text-lg text-[#8b95ad] mt-7 leading-relaxed max-w-xl">
                        The{" "}
                        <span className="text-white font-medium">
                          Six Sigma Green Belt
                        </span>{" "}
                        certification assessment — a proctored, time-windowed
                        evaluation measuring true command of Define, Measure,
                        Analyze, Improve and Control.
                      </p>
                    </Reveal>

                    {/* stat row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 max-w-2xl">
                      {[
                        { v: questions.length || 25, k: "Questions", s: "" },
                        { v: 40, k: "Minutes", s: "" },
                        { v: 70, k: "To pass", s: "%" },
                        { v: 3.4, k: "Target DPMO", s: "", d: 1 },
                      ].map((s, i) => (
                        <Reveal key={s.k} delay={600 + i * 90} y={18}>
                          <LuxeCard className="glass rounded-2xl p-4 h-full">
                            <div className="relative z-10">
                              <div className="font-display text-3xl font-extrabold text-white">
                                <CountUp
                                  to={s.v}
                                  decimals={s.d ?? 0}
                                  suffix={s.s}
                                />
                              </div>
                              <div className="kicker text-[#6f7b94] mt-1.5">
                                {s.k}
                              </div>
                            </div>
                          </LuxeCard>
                        </Reveal>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT — verification */}
                  <div className="lg:col-span-5 lg:sticky lg:top-28">
                    <Reveal delay={200} y={30}>
                      <LuxeCard
                        tilt={4}
                        className={`glass rounded-[26px] overflow-hidden ${
                          shakeError ? "anim-shake" : ""
                        }`}
                      >
                        <div className="h-[2px] foil-rule" />
                        <div className="p-7 sm:p-8 relative z-10">
                          <div className="flex items-center justify-between mb-6">
                            <div className="w-11 h-11 rounded-full glass-deep hairline-gold flex items-center justify-center anim-float">
                              <Lock className="w-5 h-5 text-[#d9b45b]" />
                            </div>
                            <span className="kicker text-[#6f7b94]">
                              Secure Access
                            </span>
                          </div>

                          <h2 className="font-display text-2xl font-bold text-white">
                            Candidate verification
                          </h2>
                          <p className="text-sm text-[#8b95ad] mt-2 mb-7 leading-relaxed">
                            Entry is restricted to invited candidates, from
                            their registered address, inside their assigned
                            window.
                          </p>

                          <form
                            onSubmit={handleVerifyCandidate}
                            className="space-y-4"
                          >
                            <div>
                              <label className="kicker text-[#6f7b94] block mb-2">
                                Full name
                              </label>
                              <div className="relative">
                                <User className="w-4 h-4 text-[#d9b45b] absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  required
                                  value={nameInput}
                                  onChange={(e) => setNameInput(e.target.value)}
                                  placeholder="Your full name"
                                  className="w-full pl-11 pr-4 py-3.5 rounded-xl inset-dark text-sm focus:outline-none focus:border-[#d9b45b]/50 transition-colors"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="kicker text-[#6f7b94] block mb-2">
                                Registered email
                              </label>
                              <div className="relative">
                                <Mail className="w-4 h-4 text-[#8b7bd8] absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                  type="email"
                                  required
                                  value={emailInput}
                                  onChange={(e) => setEmailInput(e.target.value)}
                                  placeholder="name@company.com"
                                  className="w-full pl-11 pr-4 py-3.5 rounded-xl inset-dark text-sm font-data focus:outline-none focus:border-[#d9b45b]/50 transition-colors"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={isVerifying || isLoadingData}
                              className="sheen w-full group inline-flex items-center justify-center gap-2.5 py-4 rounded-xl bg-gradient-to-r from-[#f3dca4] via-[#d9b45b] to-[#a8822f] text-[#0a0f1e] font-bold shadow-[0_10px_30px_-12px_rgba(217,180,91,.7)] transition-all cursor-pointer disabled:opacity-60"
                            >
                              <span>
                                {isVerifying ? "Verifying…" : "Verify eligibility"}
                              </span>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </form>

                          {verificationResult && (
                            <div
                              className={`mt-5 p-4 rounded-2xl border anim-pop ${
                                verificationResult.allowed
                                  ? "bg-emerald-400/8 border-emerald-400/25"
                                  : verificationResult.code === "ALREADY_COMPLETED"
                                  ? "bg-violet-400/8 border-violet-400/25"
                                  : verificationResult.code === "WINDOW_NOT_OPEN"
                                  ? "bg-amber-400/8 border-amber-400/25"
                                  : "bg-rose-400/8 border-rose-400/25"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="shrink-0 mt-0.5">
                                  {verificationResult.allowed ? (
                                    <CheckGlyph className="w-6 h-6" />
                                  ) : (
                                    <CrossGlyph className="w-6 h-6" />
                                  )}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="text-sm font-semibold text-white">
                                    {verificationResult.code === "ACCESS_GRANTED" &&
                                      "Access granted"}
                                    {verificationResult.code === "UNASSIGNED_EMAIL" &&
                                      "Email not authorized"}
                                    {verificationResult.code === "WINDOW_NOT_OPEN" &&
                                      "Window not open yet"}
                                    {verificationResult.code === "WINDOW_EXPIRED" &&
                                      "Window expired"}
                                    {verificationResult.code === "ALREADY_COMPLETED" &&
                                      "Already completed"}
                                    {(verificationResult.code === "INVALID_INPUT" ||
                                      verificationResult.code === "SERVER_ERROR") &&
                                      "Unable to verify"}
                                  </div>
                                  <p className="text-xs text-[#8b95ad] leading-relaxed">
                                    {verificationResult.message}
                                  </p>

                                  {verificationResult.allowed &&
                                    verificationResult.assignment && (
                                      <button
                                        type="button"
                                        onClick={() => setCandidateStage("briefing")}
                                        className="mt-1 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-[#04070f] text-sm font-bold transition-colors cursor-pointer"
                                      >
                                        Continue to protocol
                                        <ArrowRight className="w-4 h-4" />
                                      </button>
                                    )}

                                  {verificationResult.code === "ALREADY_COMPLETED" &&
                                    verificationResult.latestAttempt && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCompletedAttempt(
                                            verificationResult.latestAttempt!
                                          );
                                          setCandidateStage("scorecard");
                                        }}
                                        className="mt-1 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#d9b45b] to-[#a8822f] text-[#0a0f1e] text-sm font-bold transition-colors cursor-pointer"
                                      >
                                        <Eye className="w-4 h-4" />
                                        View scorecard (
                                        {verificationResult.latestAttempt.percentage}%)
                                      </button>
                                    )}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="mt-7 pt-6 border-t border-white/8">
                            <div className="flex items-center justify-between mb-3">
                              <span className="kicker text-[#6f7b94]">
                                Demo identities
                              </span>
                              <button
                                type="button"
                                onClick={() => setWorkspaceMode("admin")}
                                className="text-xs font-medium text-[#d9b45b] hover:underline cursor-pointer"
                              >
                                Manage →
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {presets.map((p) => (
                                <button
                                  key={p.email}
                                  type="button"
                                  onClick={() => {
                                    setEmailInput(p.email);
                                    setNameInput(p.name);
                                    handleVerifyCandidate(undefined, p.email, p.name);
                                  }}
                                  className={`sheen p-2.5 rounded-xl border text-left transition-all hover:-translate-y-0.5 cursor-pointer ${p.tone}`}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <p.Icon className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-bold">
                                      {p.label}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-[#6f7b94] font-data truncate mt-0.5">
                                    {p.name}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </LuxeCard>
                    </Reveal>
                  </div>
                </div>
              </div>
            </section>

            {/* marquee */}
            <div className="border-y border-white/6 bg-[#060b16]/60">
              <Marquee
                items={[
                  "DEFINE · PROJECT CHARTER",
                  "MEASURE · GAGE R&R",
                  "ANALYZE · HYPOTHESIS TESTING",
                  "IMPROVE · POKA-YOKE",
                  "CONTROL · SPC CHARTS",
                  "3.4 DEFECTS PER MILLION",
                  "CPK · PROCESS CAPABILITY",
                  "VOICE OF THE CUSTOMER",
                ]}
              />
            </div>

            {/* lower section */}
            <section className="max-w-[1400px] mx-auto px-5 sm:px-8 py-16 lg:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-5">
                  <Reveal>
                    <span className="kicker text-[#d9b45b]">
                      The Methodology
                    </span>
                    <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-3 leading-tight">
                      Five phases.
                      <br />
                      <span className="foil-text">One standard.</span>
                    </h2>
                    <p className="text-[#8b95ad] mt-4 leading-relaxed">
                      Every question in this assessment maps to a DMAIC phase,
                      so your scorecard reveals exactly where your command is
                      strongest — and where to sharpen.
                    </p>
                  </Reveal>
                  <Reveal delay={160}>
                    <div className="mt-8">
                      <DmaicOrbit size={230} />
                    </div>
                  </Reveal>
                </div>
                <div className="lg:col-span-7">
                  <Reveal delay={120} y={30}>
                    <BellCurvePanel />
                  </Reveal>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="relative z-10 border-t border-white/6 bg-[#060b16]/70 no-print">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-8 flex flex-wrap items-center justify-between gap-4">
          <MleapsLogo size="xs" />
          <p className="text-xs text-[#5d6881]">
            Six Sigma Green Belt Certification · 25 questions · 40 minutes · 70%
            threshold · © {new Date().getFullYear()} Mleaps Consulting
          </p>
        </div>
      </footer>
    </div>
  );
}
