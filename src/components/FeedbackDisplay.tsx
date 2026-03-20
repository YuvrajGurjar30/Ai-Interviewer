import React from 'react';
import { Award, CheckCircle, XCircle, Lightbulb, RefreshCw, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Feedback } from '../services/gemini';

interface FeedbackDisplayProps {
  feedback: Feedback;
  onRestart: () => void;
}

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback, onRestart }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <Award className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-display font-bold text-zinc-900 mb-2 italic">Interview Complete</h2>
        <p className="text-zinc-500">Here's how you performed during the session.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 p-8">
            <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Overall Performance
            </h3>
            <p className="text-zinc-600 leading-relaxed italic">"{feedback.overallFeedback}"</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-emerald-50/50 rounded-3xl border border-emerald-100 p-6">
              <h4 className="text-emerald-700 font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Key Strengths
              </h4>
              <ul className="space-y-3">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-emerald-800 flex gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-rose-50/50 rounded-3xl border border-rose-100 p-6">
              <h4 className="text-rose-700 font-bold mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Areas for Improvement
              </h4>
              <ul className="space-y-3">
                {feedback.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-rose-800 flex gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-8 text-white">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              Expert Suggestions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {feedback.suggestions.map((s, i) => (
                <div key={i} className="bg-white/10 rounded-2xl p-4 text-sm border border-white/5">
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 p-8 text-center">
            <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Interview Score</span>
            <div className="mt-4 relative inline-flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-zinc-100"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * feedback.score) / 100}
                  className="text-emerald-500 transition-all duration-1000"
                />
              </svg>
              <span className="absolute text-3xl font-bold text-zinc-900">{feedback.score}</span>
            </div>
            <p className="mt-4 text-sm text-zinc-500">Based on communication, technical depth, and relevance.</p>
          </div>

          <button
            onClick={onRestart}
            className="w-full py-4 rounded-2xl bg-zinc-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
          >
            <RefreshCw className="w-5 h-5" />
            Try Another Interview
          </button>
        </div>
      </div>
    </motion.div>
  );
};
