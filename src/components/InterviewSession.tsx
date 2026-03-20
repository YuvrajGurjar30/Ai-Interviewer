import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Loader2, User, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { startInterview, getNextQuestion } from '../services/gemini';

interface InterviewSessionProps {
  resumeText: string;
  onComplete: (history: { role: string; text: string }[]) => void;
}

export const InterviewSession: React.FC<InterviewSessionProps> = ({ resumeText, onComplete }) => {
  const [messages, setMessages] = useState<{ role: 'interviewer' | 'candidate'; text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const init = async () => {
      setIsTyping(true);
      const firstQuestion = await startInterview(resumeText);
      setMessages([{ role: 'interviewer', text: firstQuestion }]);
      setIsTyping(false);
    };
    init();

    // Setup Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, [resumeText]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'candidate', text: userMessage }]);
    
    setIsTyping(true);
    
    const history = [...messages, { role: 'candidate' as const, text: userMessage }].map(m => ({
      role: m.role === 'interviewer' ? 'Interviewer' : 'Candidate',
      text: m.text
    }));

    const nextResponse = await getNextQuestion(resumeText, history);
    
    if (nextResponse.includes('INTERVIEW_COMPLETE')) {
      onComplete(history);
    } else {
      setMessages(prev => [...prev, { role: 'interviewer', text: nextResponse }]);
    }
    
    setIsTyping(false);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-zinc-900">AI Interviewer</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-zinc-500 font-medium">Active Session</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          Analyzing Responses
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'interviewer' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`
                max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'interviewer' 
                  ? 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none' 
                  : 'bg-zinc-900 text-white rounded-tr-none'}
              `}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-zinc-200 p-4 rounded-2xl rounded-tl-none flex gap-1">
                <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 relative">
        <div className="flex items-end gap-3 bg-white border border-zinc-200 p-2 rounded-2xl shadow-sm focus-within:border-zinc-400 transition-colors">
          <button
            onClick={toggleListening}
            className={`
              p-3 rounded-xl transition-all
              ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}
            `}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your answer here..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 resize-none max-h-32 min-h-[44px]"
            rows={1}
          />

          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className={`
              p-3 rounded-xl transition-all
              ${!inputText.trim() || isTyping ? 'bg-zinc-100 text-zinc-300' : 'bg-emerald-500 text-white hover:bg-emerald-600'}
            `}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-zinc-400 mt-2 ml-2">Press Enter to send, Shift + Enter for new line</p>
      </div>
    </div>
  );
};
