import React, { useState } from 'react';
import { ResumeUpload } from './components/ResumeUpload';
import { InterviewSession } from './components/InterviewSession';
import { FeedbackDisplay } from './components/FeedbackDisplay';
import { getFeedback, Feedback } from './services/gemini';
import { Bot, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AppState = 'upload' | 'interview' | 'loading_feedback' | 'feedback';

export default function App() {
  const [state, setState] = useState<AppState>('upload');
  const [resumeText, setResumeText] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleResumeUpload = (text: string) => {
    setResumeText(text);
    setState('interview');
  };

  const handleInterviewComplete = async (history: { role: string; text: string }[]) => {
    setState('loading_feedback');
    const result = await getFeedback(resumeText, history);
    if (result) {
      setFeedback(result);
      setState('feedback');
    } else {
      // Fallback or error state
      setState('upload');
    }
  };

  const resetApp = () => {
    setResumeText('');
    setFeedback(null);
    setState('upload');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="py-6 px-8 border-b border-zinc-200 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-zinc-900 italic">IntervAI</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {state === 'upload' && (
              <ResumeUpload key="upload" onUpload={handleResumeUpload} />
            )}

            {state === 'interview' && (
              <InterviewSession 
                key="interview" 
                resumeText={resumeText} 
                onComplete={handleInterviewComplete} 
              />
            )}

            {state === 'loading_feedback' && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <h3 className="mt-8 text-2xl font-display font-bold text-zinc-900 italic">Generating Feedback</h3>
                <p className="mt-2 text-zinc-500">Our AI is analyzing your performance and technical depth...</p>
              </motion.div>
            )}

            {state === 'feedback' && feedback && (
              <FeedbackDisplay 
                key="feedback" 
                feedback={feedback} 
                onRestart={resetApp} 
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-zinc-200 text-center">
        <p className="text-xs text-zinc-400 font-medium tracking-widest uppercase">
          Crafted for Professional Growth
        </p>
      </footer>
    </div>
  );
}
