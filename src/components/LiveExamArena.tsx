"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Question, CandidateAssignment } from "@/db/schema";
import { MleapsLogo } from "./MleapsLogo";
import { Magnetic } from "./Effects";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  Send,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

interface LiveExamArenaProps {
  questions: Question[];
  assignment: CandidateAssignment;
  candidateName: string;
  candidateEmail: string;
  onSubmitExam: (payload: {
    answers: Record<string, string>;
    timeSpentSeconds: number;
    startedAt: string;
  }) => Promise<void>;
  onCancelExam: () => void;
}

export function LiveExamArena({
  questions,
  assignment,
  candidateName,
  candidateEmail,
  onSubmitExam,
  onCancelExam,
}: LiveExamArenaProps) {
  const durationSeconds = (assignment.durationMinutes || 40) * 60;
  const [startedAt] = useState(() => new Date().toISOString());
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animKey, setAnimKey] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedIds, setFlaggedIds] = useState<Record<string, boolean>>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex] || questions[0];

  const handleConfirmSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const timeSpent = Math.max(1, durationSeconds - secondsLeft);
    try {
      await onSubmitExam({ answers, timeSpentSeconds: timeSpent, startedAt });
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  }, [answers, durationSeconds, isSubmitting, onSubmitExam, secondsLeft, startedAt]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleConfirmSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleConfirmSubmit]);

  const navigateToQuestion = useCallback(
    (targetIdx: number) => {
      if (targetIdx < 0 || targetIdx >= questions.length) return;
      setDirection(targetIdx >= currentIndex ? "next" : "prev");
      setCurrentIndex(targetIdx);
      setAnimKey((k) => k + 1);
    },
    [currentIndex, questions.length]
  );

  const handleSelectOption = useCallback(
    (optionLetter: "A" | "B" | "C" | "D") => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({
        ...prev,
        [String(currentQuestion.id)]: optionLetter,
      }));
    },
    [currentQuestion]
  );

  const toggleFlagCurrent = useCallback(() => {
    if (!currentQuestion) return;
    const qId = String(currentQuestion.id);
    setFlaggedIds((prev) => ({ ...prev, [qId]: !prev[qId] }));
  }, [currentQuestion]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSubmitModal) return;
      const key = e.key.toUpperCase();
      if (["A", "B", "C", "D"].includes(key)) {
        handleSelectOption(key as "A" | "B" | "C" | "D");
      } else if (e.key === "ArrowRight" && currentIndex < questions.length - 1) {
        navigateToQuestion(currentIndex + 1);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        navigateToQuestion(currentIndex - 1);
      } else if (key === "F") {
        toggleFlagCurrent();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentIndex,
    handleSelectOption,
    navigateToQuestion,
    questions.length,
    showSubmitModal,
    toggleFlagCurrent,
  ]);

  const formatTimer = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flaggedIds).filter(Boolean).length;
  const progressPercent =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0;

  if (!currentQuestion) return null;

  const selected = answers[String(currentQuestion.id)];
  const isCurrentFlagged = !!flaggedIds[String(currentQuestion.id)];
  const options: { letter: "A" | "B" | "C" | "D"; text: string }[] = [
    { letter: "A", text: currentQuestion.optionA },
    { letter: "B", text: currentQuestion.optionB },
    { letter: "C", text: currentQuestion.optionC },
    { letter: "D", text: currentQuestion.optionD },
  ];

  const timerTone =
    secondsLeft < 180
      ? "border-rose-400/40 text-rose-300 bg-rose-400/8"
      : secondsLeft < 600
      ? "border-amber-400/40 text-amber-300 bg-amber-400/8"
      : "hairline-gold text-white bg-[#d9b45b]/6";

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="pointer-events-none fixed -top-52 -left-40 w-[600px] h-[600px] rounded-full bg-[#d9b45b]/6 blur-[170px] anim-aurora" />
      <div className="pointer-events-none fixed bottom-0 -right-48 w-[600px] h-[600px] rounded-full bg-[#8b7bd8]/8 blur-[180px] anim-aurora-2" />
      <div className="pointer-events-none fixed inset-0 grid-lines opacity-50" />

      <header className="sticky top-0 z-30 glass-deep border-b border-white/6">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <MleapsLogo size="xs" />
            <div className="hidden sm:block pl-4 border-l border-white/8">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-400/10 text-emerald-300 border border-emerald-400/25">
                <ShieldCheck className="w-3 h-3" /> Proctored session
              </span>
              <p className="text-sm font-semibold text-white mt-1">
                {candidateName}{" "}
                <span className="text-xs font-normal text-[#6f7b94]">
                  · {candidateEmail}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2.5 px-4 py-2 rounded-full border ${timerTone} ${
                secondsLeft < 180 ? "animate-pulse" : ""
              }`}
            >
              <Clock className="w-4 h-4" />
              <div>
                <div className="kicker opacity-60 leading-none text-[9px]">
                  Remaining
                </div>
                <div className="font-data text-lg font-bold leading-tight">
                  {formatTimer(secondsLeft)}
                </div>
              </div>
            </div>

            <Magnetic
              onClick={() => setShowSubmitModal(true)}
              className="sheen px-5 py-2.5 rounded-full font-bold text-sm text-[#0a0f1e] bg-gradient-to-r from-[#f3dca4] to-[#a8822f] cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Submit</span>
            </Magnetic>
          </div>
        </div>
        <div className="h-[2px] w-full bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-[#a8822f] via-[#f3dca4] to-[#8b7bd8] transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      <main className="max-w-[1400px] w-full mx-auto px-5 lg:px-8 pt-8 pb-14 grid grid-cols-1 lg:grid-cols-12 gap-7 flex-1 relative z-10">
        <div className="lg:col-span-8">
          <div
            key={`${currentQuestion.id}-${animKey}`}
            className={`glass rounded-[26px] overflow-hidden edge-gold relative ${
              direction === "next" ? "anim-swap-right" : "anim-swap-left"
            }`}
          >
            <div className="p-7 sm:p-9 relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
                <div className="flex items-center gap-3">
                  <span className="font-data text-sm font-bold text-[#d9b45b]">
                    {String(currentIndex + 1).padStart(2, "0")}
                    <span className="text-[#4a5469]">
                      {" "}
                      / {String(questions.length).padStart(2, "0")}
                    </span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-violet-400/10 text-violet-300 border border-violet-400/25">
                    {currentQuestion.dmaicPhase}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {selected && (
                    <button
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => {
                          const copy = { ...prev };
                          delete copy[String(currentQuestion.id)];
                          return copy;
                        })
                      }
                      className="px-3 py-1.5 rounded-full text-xs font-medium text-[#8b95ad] hover:text-white bg-white/4 hover:bg-white/8 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={toggleFlagCurrent}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCurrentFlagged
                        ? "bg-amber-400/12 border-amber-400/40 text-amber-300"
                        : "bg-white/4 border-transparent text-[#8b95ad] hover:text-white"
                    }`}
                  >
                    <Flag
                      className={`w-3.5 h-3.5 ${
                        isCurrentFlagged ? "fill-amber-400 text-amber-400" : ""
                      }`}
                    />
                    {isCurrentFlagged ? "Flagged" : "Flag"}
                  </button>
                </div>
              </div>

              <h2 className="font-display text-2xl sm:text-[1.75rem] font-bold text-white leading-snug mb-8">
                {currentQuestion.questionText}
              </h2>

              <div className="space-y-3">
                {options.map((opt, idx) => {
                  const isSelected = selected === opt.letter;
                  return (
                    <button
                      key={opt.letter}
                      type="button"
                      onClick={() => handleSelectOption(opt.letter)}
                      style={{ animationDelay: `${idx * 60}ms` }}
                      className={`anim-pop sheen w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 group cursor-pointer ${
                        isSelected
                          ? "bg-[#d9b45b]/10 border-[#d9b45b]/55 shadow-[0_10px_34px_-16px_rgba(217,180,91,.8)]"
                          : "inset-dark hover:border-[#d9b45b]/25 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-base shrink-0 transition-all ${
                          isSelected
                            ? "bg-gradient-to-br from-[#f3dca4] to-[#a8822f] text-[#0a0f1e] scale-105"
                            : "bg-white/5 text-[#8b95ad] group-hover:bg-white/8 group-hover:text-white"
                        }`}
                      >
                        {opt.letter}
                      </div>
                      <span
                        className={`flex-1 text-base sm:text-[17px] leading-relaxed ${
                          isSelected ? "text-white font-medium" : "text-[#b9c2d4]"
                        }`}
                      >
                        {opt.text}
                      </span>
                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#f3dca4] to-[#a8822f] flex items-center justify-center anim-pop">
                            <Check className="w-4 h-4 text-[#0a0f1e]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-white/12 group-hover:border-[#d9b45b]/40 transition-colors" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-9 pt-6 border-t border-white/8 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => navigateToQuestion(currentIndex - 1)}
                  className="px-5 py-3 rounded-full font-medium text-sm bg-white/5 hover:bg-white/9 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-[#d9b45b]" /> Previous
                </button>
                <span className="hidden sm:block text-xs text-[#4a5469] font-data">
                  A · B · C · D &nbsp;|&nbsp; ← →
                </span>
                {currentIndex < questions.length - 1 ? (
                  <Magnetic
                    onClick={() => navigateToQuestion(currentIndex + 1)}
                    className="sheen px-6 py-3 rounded-full font-bold text-sm text-[#0a0f1e] bg-gradient-to-r from-[#f3dca4] to-[#a8822f] flex items-center gap-2 cursor-pointer"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Magnetic>
                ) : (
                  <Magnetic
                    onClick={() => setShowSubmitModal(true)}
                    className="sheen px-6 py-3 rounded-full font-bold text-sm text-[#04070f] bg-gradient-to-r from-emerald-300 to-emerald-500 flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Review & submit
                  </Magnetic>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-5">
          <div className="glass rounded-[26px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-white">
                Question map
              </h3>
              <span className="font-data text-xs font-bold px-2.5 py-1 rounded-full bg-[#d9b45b]/10 text-[#d9b45b] border border-[#d9b45b]/22">
                {answeredCount}/{questions.length}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2.5 mb-5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!answers[String(q.id)];
                const isFlagged = !!flaggedIds[String(q.id)];
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => navigateToQuestion(idx)}
                    className={`relative h-11 rounded-xl font-data font-bold text-xs transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-gradient-to-br from-[#f3dca4] to-[#a8822f] text-[#0a0f1e] scale-105 shadow-[0_6px_18px_-6px_rgba(217,180,91,.8)]"
                        : isAnswered
                        ? "bg-[#8b7bd8]/18 text-white border border-[#8b7bd8]/35"
                        : "bg-white/4 text-[#6f7b94] hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-[#0c1324]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-xs text-[#8b95ad] pt-4 border-t border-white/8">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-gradient-to-br from-[#f3dca4] to-[#a8822f]" />{" "}
                Current
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#8b7bd8]/50" /> Answered (
                {answeredCount})
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-white/8" /> Pending (
                {questions.length - answeredCount})
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" /> Flagged (
                {flaggedCount})
              </div>
            </div>
          </div>

          <div className="glass rounded-[26px] p-6">
            <h4 className="kicker text-[#d9b45b] mb-3">Standards</h4>
            <ul className="text-sm text-[#8b95ad] space-y-2 leading-relaxed">
              <li>· Pass threshold 70% — 18 of 25 correct.</li>
              <li>· One correct answer; no penalty for wrong.</li>
              <li>· Auto-submission when the timer reaches zero.</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="sheen mt-5 w-full py-3 rounded-full font-bold text-sm text-[#0a0f1e] bg-gradient-to-r from-[#f3dca4] to-[#a8822f] transition-all cursor-pointer"
            >
              Finish & grade ({answeredCount}/{questions.length})
            </button>
            <button
              type="button"
              onClick={onCancelExam}
              className="mt-2 w-full py-2 rounded-full text-xs font-medium text-[#4a5469] hover:text-white transition-all cursor-pointer"
            >
              Exit without submitting
            </button>
          </div>
        </div>
      </main>

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-[#04070f]/80 backdrop-blur-md flex items-center justify-center p-4 anim-pop">
          <div className="glass max-w-lg w-full rounded-[26px] overflow-hidden edge-gold">
            <div className="p-7 sm:p-9">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f3dca4] to-[#a8822f] flex items-center justify-center text-[#0a0f1e]">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">
                    Submit your assessment?
                  </h3>
                  <p className="text-xs text-[#6f7b94]">
                    Six Sigma Green Belt · Certification Examination
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 my-6">
                {[
                  { v: answeredCount, k: "Answered", c: "text-emerald-300" },
                  {
                    v: questions.length - answeredCount,
                    k: "Unanswered",
                    c: "text-rose-300",
                  },
                  { v: flaggedCount, k: "Flagged", c: "text-amber-300" },
                ].map((s) => (
                  <div key={s.k} className="inset-dark rounded-2xl p-4 text-center">
                    <div className={`font-data text-2xl font-bold ${s.c}`}>
                      {s.v}
                    </div>
                    <div className="kicker text-[#5d6881] mt-1">{s.k}</div>
                  </div>
                ))}
              </div>

              {questions.length - answeredCount > 0 && (
                <div className="mb-6 p-3.5 rounded-xl bg-amber-400/8 border border-amber-400/25 flex items-start gap-3 text-xs text-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    {questions.length - answeredCount} unanswered question(s)
                    will be marked incorrect.
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowSubmitModal(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium text-[#8b95ad] hover:text-white bg-white/5 hover:bg-white/9 transition-all cursor-pointer"
                >
                  Keep working
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmSubmit}
                  className="sheen px-6 py-2.5 rounded-full text-sm font-bold text-[#0a0f1e] bg-gradient-to-r from-[#f3dca4] to-[#a8822f] transition-all cursor-pointer"
                >
                  {isSubmitting ? "Grading…" : "Confirm & view scorecard"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
