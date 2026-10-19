"use client";

import React, { useState } from "react";
import { ExamAttempt, Question } from "@/db/schema";
import { MleapsLogo } from "./MleapsLogo";
import { CheckGlyph, CrossGlyph, GoldRing, Reveal, CountUp } from "./Effects";
import {
  Clock,
  Calendar,
  Mail,
  User,
  Check,
  X,
  Printer,
  ArrowLeft,
  BookOpen,
  Quote,
} from "lucide-react";

interface ScorecardViewProps {
  attempt: ExamAttempt;
  questions: Question[];
  onBack: () => void;
  backLabel?: string;
}

export function ScorecardView({
  attempt,
  questions,
  onBack,
  backLabel = "Back",
}: ScorecardViewProps) {
  const [filterMode, setFilterMode] = useState<"all" | "correct" | "incorrect">(
    "all"
  );
  const [selectedPhase, setSelectedPhase] = useState("All");

  const formatDuration = (sec: number) =>
    `${Math.floor(sec / 60)}m ${sec % 60}s`;

  const phases = ["Define", "Measure", "Analyze", "Improve", "Control"];
  const phaseStats = phases.map((phase) => {
    const phaseQs = questions.filter((q) => q.dmaicPhase === phase);
    let correct = 0;
    for (const q of phaseQs) {
      const a = attempt.answers?.[String(q.id)];
      if (a && a.toUpperCase() === q.correctOption.toUpperCase()) correct += 1;
    }
    return {
      phase,
      correct,
      total: phaseQs.length,
      pct: phaseQs.length > 0 ? Math.round((correct / phaseQs.length) * 100) : 0,
    };
  });

  const filteredQuestions = questions.filter((q) => {
    const a = attempt.answers?.[String(q.id)];
    const isCorrect = a && a.toUpperCase() === q.correctOption.toUpperCase();
    if (filterMode === "correct" && !isCorrect) return false;
    if (filterMode === "incorrect" && isCorrect) return false;
    if (selectedPhase !== "All" && q.dmaicPhase !== selectedPhase) return false;
    return true;
  });

  const sigmaEstimate =
    attempt.percentage >= 96
      ? "6.0σ — World class"
      : attempt.percentage >= 88
      ? "5.2σ — Excellence"
      : attempt.percentage >= 80
      ? "4.6σ — High capability"
      : attempt.percentage >= 70
      ? "4.0σ — Green Belt standard"
      : "2.8σ — Needs improvement";

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 space-y-8 relative z-10">
      <div className="pointer-events-none fixed -top-52 -left-40 w-[560px] h-[560px] rounded-full bg-[#d9b45b]/6 blur-[170px] anim-aurora" />

      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-full glass-deep hairline-gold text-sm font-medium text-white flex items-center gap-2 hover:border-[#d9b45b]/40 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#d9b45b]" /> {backLabel}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="sheen px-4 py-2.5 rounded-full bg-gradient-to-r from-[#f3dca4] to-[#a8822f] text-sm font-bold text-[#0a0f1e] flex items-center gap-2 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print transcript
        </button>
      </div>

      {/* certificate */}
      <div className="glass rounded-[28px] overflow-hidden edge-gold relative anim-pop">
        <div className="scanbeam" />
        <div className="p-7 sm:p-11 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-9 items-center">
            <div className="lg:col-span-7 space-y-5">
              <MleapsLogo size="sm" />
              <div>
                <span className="kicker text-[#d9b45b]">
                  Official Evaluation Transcript
                </span>
                <h1 className="font-display text-3xl sm:text-[2.6rem] font-extrabold mt-2 leading-[1.08]">
                  <span className="block text-white">Six Sigma Green Belt</span>
                  <span className="block foil-text">Certification Result</span>
                </h1>
              </div>

              <div
                className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl border ${
                  attempt.passed
                    ? "bg-emerald-400/8 border-emerald-400/30"
                    : "bg-rose-400/8 border-rose-400/30"
                }`}
              >
                {attempt.passed ? (
                  <CheckGlyph className="w-7 h-7" />
                ) : (
                  <CrossGlyph className="w-7 h-7" />
                )}
                <div>
                  <div className="text-sm font-bold text-white">
                    {attempt.passed
                      ? "Certified — Green Belt standard met"
                      : "Below passing threshold (70%)"}
                  </div>
                  <div className="text-xs text-[#8b95ad]">
                    Benchmark · {sigmaEstimate}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  { Icon: User, label: "Candidate", value: attempt.candidateName, tone: "text-[#d9b45b]" },
                  { Icon: Mail, label: "Email", value: attempt.candidateEmail, tone: "text-[#8b7bd8]" },
                  { Icon: Clock, label: "Time taken", value: formatDuration(attempt.timeSpentSeconds), tone: "text-[#cfe0ff]" },
                  {
                    Icon: Calendar,
                    label: "Date",
                    value: new Date(attempt.submittedAt).toLocaleDateString(
                      undefined,
                      { year: "numeric", month: "short", day: "numeric" }
                    ),
                    tone: "text-emerald-300",
                  },
                ].map((d, i) => (
                  <Reveal key={d.label} delay={i * 70} y={14}>
                    <div className="inset-dark rounded-xl p-3.5 flex items-center gap-3">
                      <d.Icon className={`w-5 h-5 shrink-0 ${d.tone}`} />
                      <div className="min-w-0">
                        <div className="kicker text-[#5d6881]">{d.label}</div>
                        <div className="text-sm font-semibold text-white truncate">
                          {d.value}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-center inset-dark rounded-[24px] p-7">
              <GoldRing percent={attempt.percentage} size={186} stroke={13}>
                <span className="font-display text-5xl font-extrabold text-white">
                  <CountUp to={attempt.percentage} suffix="%" />
                </span>
                <span className="font-data text-sm font-bold text-[#d9b45b] mt-0.5">
                  {attempt.score} / {attempt.totalQuestions}
                </span>
                <span className="kicker text-[#5d6881] mt-1">Pass ≥ 70%</span>
              </GoldRing>

              <div className="w-full grid grid-cols-2 gap-3 mt-6">
                <div className="rounded-xl bg-emerald-400/8 border border-emerald-400/25 p-3 text-center">
                  <div className="font-data text-lg font-bold text-emerald-300">
                    {attempt.score}
                  </div>
                  <div className="text-[11px] text-emerald-300/70">Correct</div>
                </div>
                <div className="rounded-xl bg-rose-400/8 border border-rose-400/25 p-3 text-center">
                  <div className="font-data text-lg font-bold text-rose-300">
                    {attempt.totalQuestions - attempt.score}
                  </div>
                  <div className="text-[11px] text-rose-300/70">Incorrect</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DMAIC diagnostics */}
      <div className="glass rounded-[26px] p-7 sm:p-9">
        <div className="mb-6">
          <span className="kicker text-[#d9b45b]">Competency diagnostics</span>
          <h2 className="font-display text-xl font-bold text-white mt-1.5">
            Performance by DMAIC domain
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {phaseStats.map((st, idx) => (
            <Reveal key={st.phase} delay={idx * 80} y={18}>
              <div className="inset-dark rounded-2xl p-4 h-full">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-sm font-semibold text-white">
                    {st.phase}
                  </span>
                  <span className="font-data text-xs font-bold text-[#d9b45b]">
                    {st.correct}/{st.total}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/7 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#a8822f] via-[#f3dca4] to-[#8b7bd8] transition-all duration-1000"
                    style={{ width: `${st.pct}%` }}
                  />
                </div>
                <div className="text-right text-xs text-[#5d6881] font-data">
                  {st.pct}%
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* answer key */}
      <div className="glass rounded-[26px] p-7 sm:p-9 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/8">
          <div>
            <span className="kicker text-[#d9b45b] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Examiner review
            </span>
            <h2 className="font-display text-xl font-bold text-white mt-1.5">
              Answer key & explanations
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 no-print">
            {(
              [
                { id: "all", label: `All (${questions.length})` },
                { id: "correct", label: `Correct (${attempt.score})` },
                {
                  id: "incorrect",
                  label: `Incorrect (${attempt.totalQuestions - attempt.score})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterMode(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterMode === tab.id
                    ? "bg-gradient-to-r from-[#f3dca4] to-[#a8822f] text-[#0a0f1e]"
                    : "bg-white/5 text-[#8b95ad] hover:bg-white/9"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="px-3 py-1.5 rounded-full text-xs font-medium inset-dark focus:outline-none focus:border-[#d9b45b]/50"
            >
              <option value="All">All phases</option>
              {phases.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const chosen = attempt.answers?.[String(q.id)];
            const isCorrect =
              chosen && chosen.toUpperCase() === q.correctOption.toUpperCase();
            const opts: { letter: "A" | "B" | "C" | "D"; text: string }[] = [
              { letter: "A", text: q.optionA },
              { letter: "B", text: q.optionB },
              { letter: "C", text: q.optionC },
              { letter: "D", text: q.optionD },
            ];
            return (
              <Reveal key={q.id} delay={Math.min(idx * 30, 300)} y={16}>
                <div
                  className={`rounded-2xl p-5 sm:p-6 border ${
                    isCorrect
                      ? "bg-emerald-400/5 border-emerald-400/22"
                      : "bg-rose-400/5 border-rose-400/22"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-data text-sm font-bold text-[#d9b45b]">
                        Q{q.questionNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-violet-400/10 border border-violet-400/25 text-violet-300 text-xs font-medium">
                        {q.dmaicPhase}
                      </span>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300">
                          <Check className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-300">
                          <X className="w-3.5 h-3.5" />{" "}
                          {chosen
                            ? `Chose ${chosen} · key ${q.correctOption}`
                            : `Unanswered · key ${q.correctOption}`}
                        </span>
                      )}
                    </div>
                    <div className="shrink-0">
                      {isCorrect ? (
                        <CheckGlyph className="w-6 h-6" />
                      ) : (
                        <CrossGlyph className="w-6 h-6" />
                      )}
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold text-white mb-4">
                    {q.questionText}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                    {opts.map((o) => {
                      const isRight = o.letter === q.correctOption.toUpperCase();
                      const isUser = chosen && o.letter === chosen.toUpperCase();
                      return (
                        <div
                          key={o.letter}
                          className={`p-3 rounded-xl border text-sm flex items-center justify-between gap-2 ${
                            isRight
                              ? "bg-emerald-400/12 border-emerald-400/40 text-white font-medium"
                              : isUser
                              ? "bg-rose-400/12 border-rose-400/40 text-rose-100 font-medium"
                              : "inset-dark text-[#8b95ad]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center font-data font-bold text-xs shrink-0 ${
                                isRight
                                  ? "bg-emerald-400 text-[#04070f]"
                                  : isUser
                                  ? "bg-rose-400 text-[#04070f]"
                                  : "bg-white/6 text-[#8b95ad]"
                              }`}
                            >
                              {o.letter}
                            </span>
                            <span>{o.text}</span>
                          </div>
                          {isRight && (
                            <span className="kicker text-emerald-300 shrink-0">
                              Key
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="inset-dark rounded-xl p-3.5 flex items-start gap-2.5 text-sm text-[#8b95ad]">
                    <Quote className="w-4 h-4 text-[#d9b45b] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">
                        Why {q.correctOption}:{" "}
                      </span>
                      {q.explanation}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
