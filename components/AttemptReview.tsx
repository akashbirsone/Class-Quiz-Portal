import React from 'react';
import { Quiz, Attempt } from '../types';
import { CheckCircle2, XCircle, MinusCircle, AlertCircle } from 'lucide-react';

interface AttemptReviewProps {
  quiz: Quiz;
  attempt: Attempt;
}

const AttemptReview: React.FC<AttemptReviewProps> = ({ quiz, attempt }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
          <p className="text-xl md:text-2xl font-black text-indigo-600">{Math.round((attempt.score / attempt.totalQuestions) * 100)}%</p>
          <p className="text-[10px] md:text-xs font-bold text-slate-500">{attempt.score} / {attempt.totalQuestions} Correct</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Taken</p>
          <p className="text-xl md:text-2xl font-black text-slate-900">{Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s</p>
          <p className="text-[10px] md:text-xs font-bold text-slate-500">of {quiz.durationMinutes}m allowed</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attempt Status</p>
          <p className="text-xl md:text-2xl font-black text-emerald-600">
            {Object.keys(attempt.answers).length} / {quiz.questions.length}
          </p>
          <p className="text-[10px] md:text-xs font-bold text-slate-500">Questions Answered</p>
        </div>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((q, idx) => {
          const selectedIdx = attempt.answers[q.id];
          const isCorrect = selectedIdx === q.correctAnswer;
          const isUnattempted = selectedIdx === undefined;

          return (
            <div key={q.id} className="glass-card p-6 border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start space-x-4">
                  <span className="w-7 md:w-8 h-7 md:h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px] md:text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-base md:text-lg font-black text-slate-900 leading-tight">{q.text}</h4>
                    <div className="flex items-center space-x-3 mt-2">
                      {isUnattempted ? (
                        <span className="flex items-center text-amber-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                          <MinusCircle className="w-3 h-3 mr-1" />
                          Unattempted
                        </span>
                      ) : isCorrect ? (
                        <span className="flex items-center text-emerald-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Correct
                        </span>
                      ) : (
                        <span className="flex items-center text-red-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                          <XCircle className="w-3 h-3 mr-1" />
                          Incorrect
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, i) => {
                  const isSelected = selectedIdx === i;
                  const isCorrectOption = i === q.correctAnswer;
                  
                  let borderColor = 'border-slate-100';
                  let bgColor = 'bg-white';
                  let textColor = 'text-slate-600';
                  let icon = null;

                  if (isSelected) {
                    if (isCorrectOption) {
                      borderColor = 'border-emerald-500';
                      bgColor = 'bg-emerald-50';
                      textColor = 'text-emerald-700';
                      icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                    } else {
                      borderColor = 'border-red-500';
                      bgColor = 'bg-red-50';
                      textColor = 'text-red-700';
                      icon = <XCircle className="w-4 h-4 text-red-500" />;
                    }
                  } else if (isCorrectOption) {
                    borderColor = 'border-emerald-200';
                    bgColor = 'bg-emerald-50/30';
                    textColor = 'text-emerald-600';
                  }

                  return (
                    <div 
                      key={i} 
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${borderColor} ${bgColor} ${textColor}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-[10px] ${isSelected ? 'bg-current text-white' : 'bg-slate-50 text-slate-400'}`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="font-bold text-sm">{opt}</span>
                      </div>
                      {icon}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="mt-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs font-medium text-indigo-800 leading-relaxed">
                  <span className="font-black uppercase tracking-widest text-[9px] block mb-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Explanation:
                  </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttemptReview;
