import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, HelpCircle, RotateCcw, XCircle } from 'lucide-react';
import { MathTex } from './MathTex';

export interface SolutionStep {
  label: string;
  tex?: string;
  note: string;
}

export interface PracticeQuestion {
  id: string;
  prompt: string;
  promptTex?: string;
  type: 'multiple-choice' | 'numeric';
  options?: { id: string; label: string; tex?: string }[];
  correctAnswer: string | number;
  tolerance?: number;
  unitLabel?: string;
  hint: string;
  solutionSteps: SolutionStep[];
}

interface PracticeEngineProps {
  questions: PracticeQuestion[];
  accentColor: string;
}

export function PracticeEngine({ questions, accentColor }: PracticeEngineProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, 'correct' | 'incorrect' | undefined>>({});
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});
  const [openSolutions, setOpenSolutions] = useState<Record<string, boolean>>({});

  const solvedCount = Object.values(results).filter((r) => r === 'correct').length;

  const checkQuestion = (q: PracticeQuestion, overrideAnswer?: string) => {
    const raw = (overrideAnswer ?? answers[q.id] ?? '').trim();
    if (!raw) return;

    let isCorrect = false;
    if (q.type === 'multiple-choice') {
      isCorrect = raw === String(q.correctAnswer);
    } else {
      const parsed = parseFloat(raw);
      const target = Number(q.correctAnswer);
      const tol = q.tolerance ?? 0.05;
      isCorrect = !Number.isNaN(parsed) && Math.abs(parsed - target) <= tol;
    }

    setResults((prev) => ({ ...prev, [q.id]: isCorrect ? 'correct' : 'incorrect' }));
    if (isCorrect) {
      setOpenSolutions((prev) => ({ ...prev, [q.id]: true }));
    }
  };

  const resetAll = () => {
    setAnswers({});
    setResults({});
    setOpenHints({});
    setOpenSolutions({});
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b hairline-rule">
        <div className="flex items-center gap-3">
          <span className="font-mono-data text-xs text-[#9CA6B8]">
            Mastery Check:{' '}
            <strong style={{ color: accentColor }}>
              {solvedCount} / {questions.length}
            </strong>{' '}
            verified
          </span>
          <div className="w-28 h-1.5 rounded-full bg-[#161D29] overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${(solvedCount / Math.max(1, questions.length)) * 100}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        </div>
        {Object.keys(results).length > 0 && (
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#9CA6B8] hover:text-[#EDEBE4]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Set
          </button>
        )}
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => {
          const status = results[q.id];
          const hintOpen = !!openHints[q.id];
          const solOpen = !!openSolutions[q.id];

          return (
            <div
              key={q.id}
              className="instrument-frame p-5 space-y-4 transition-colors"
              style={{
                borderColor:
                  status === 'correct'
                    ? 'rgba(52, 211, 153, 0.45)'
                    : status === 'incorrect'
                      ? 'rgba(249, 115, 91, 0.45)'
                      : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <span className="font-mono-data text-[11px] uppercase tracking-wider text-[#6C7689]">
                    Problem 0{idx + 1}
                  </span>
                  <p className="text-sm sm:text-base text-[#EDEBE4] leading-relaxed">{q.prompt}</p>
                  {q.promptTex && (
                    <div className="py-1">
                      <MathTex tex={q.promptTex} displayMode className="text-[#EDEBE4]" />
                    </div>
                  )}
                </div>
                {status === 'correct' && (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono-data bg-[#34D399]/15 text-[#34D399]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                {status === 'incorrect' && (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono-data bg-[#F9735B]/15 text-[#F9735B]">
                    <XCircle className="w-3.5 h-3.5" /> Re-check
                  </span>
                )}
              </div>

              {q.type === 'multiple-choice' && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt.id;
                    const isThisCorrect = status && opt.id === String(q.correctAnswer);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setAnswers((prev) => ({ ...prev, [q.id]: opt.id }));
                          checkQuestion(q, opt.id);
                        }}
                        className="text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3"
                        style={{
                          backgroundColor: selected ? 'rgba(255,255,255,0.07)' : '#070B14',
                          borderColor:
                            selected && status === 'correct'
                              ? '#36EBA8'
                              : selected && status === 'incorrect'
                                ? '#FF7A5C'
                                : isThisCorrect && solOpen
                                  ? 'rgba(54, 235, 168, 0.5)'
                                  : selected
                                    ? accentColor
                                    : 'rgba(237, 235, 228, 0.12)',
                        }}
                      >
                        <span className="font-mono-data text-xs text-[#6C7689] uppercase">
                          {opt.id}.
                        </span>
                        {opt.tex ? (
                          <MathTex tex={opt.tex} className="text-[#EDEBE4]" />
                        ) : (
                          <span className="text-[#EDEBE4]">{opt.label}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === 'numeric' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    checkQuestion(q);
                  }}
                  className="flex flex-wrap items-center gap-2.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={answers[q.id] ?? ''}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      placeholder="Enter numeric value"
                      aria-label={`Answer for problem ${idx + 1}`}
                      className="w-44 px-3.5 py-2 rounded-full bg-[#060A13] border border-white/15 font-mono-data text-sm text-[#F4F3EE] focus:border-white/40"
                    />
                    {q.unitLabel && (
                      <span className="font-mono-data text-xs text-[#A5B4CC]">{q.unitLabel}</span>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full text-xs font-semibold text-[#03050A] transition-all hover:brightness-110"
                    style={{ backgroundColor: accentColor }}
                  >
                    Check Answer
                  </button>
                </form>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setOpenHints((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                  }
                  className="inline-flex items-center gap-1.5 font-mono-data text-[#9CA6B8] hover:text-[#EDEBE4]"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {hintOpen ? 'Hide Hint' : 'Show Hint'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOpenSolutions((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                  }
                  className="inline-flex items-center gap-1.5 font-mono-data text-[#9CA6B8] hover:text-[#EDEBE4]"
                >
                  {solOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  {solOpen ? 'Hide Step-by-Step Solution' : 'Step-by-Step Solution'}
                </button>
              </div>

              {hintOpen && (
                <div className="p-3 rounded bg-[#161D29] border border-[rgba(229,169,76,0.22)] text-xs text-[#EDEBE4]/90">
                  <span className="font-mono-data text-[#E5A94C] mr-2">HINT:</span>
                  {q.hint}
                </div>
              )}

              {solOpen && (
                <div className="p-4 rounded bg-[#0D121A] border border-[rgba(237,235,228,0.1)] space-y-2.5">
                  <p className="font-mono-data text-[10px] uppercase tracking-wider text-[#34D399]">
                    Complete Worked Solution
                  </p>
                  {q.solutionSteps.map((st, sIdx) => (
                    <div key={sIdx} className="space-y-1 text-xs">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-mono-data text-[#6C7689]">Step {sIdx + 1}:</span>
                        <span className="font-medium text-[#EDEBE4]">{st.label}</span>
                      </div>
                      {st.tex && (
                        <div className="pl-4">
                          <MathTex tex={st.tex} className="text-[#EDEBE4]" />
                        </div>
                      )}
                      <p className="pl-4 text-[#9CA6B8]">{st.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
