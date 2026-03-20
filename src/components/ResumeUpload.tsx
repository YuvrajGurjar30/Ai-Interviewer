import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { extractTextFromPdf } from '../services/pdf';
import { motion } from 'motion/react';

interface ResumeUploadProps {
  onUpload: (text: string) => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPaste, setShowPaste] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const handlePasteSubmit = () => {
    if (pastedText.trim().length < 50) {
      setError('Please provide a more detailed resume.');
      return;
    }
    onUpload(pastedText);
  };

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
      setError('Please upload a PDF or text file.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractTextFromPdf(file);
      } else {
        text = await file.text();
      }

      if (text.trim().length < 50) {
        throw new Error('Resume text seems too short. Please provide a more detailed resume.');
      }

      onUpload(text);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to parse resume. Try copying the text instead.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto mt-12"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-zinc-900 mb-2 italic">Upload Your Resume</h2>
        <p className="text-zinc-500">We'll analyze your experience to tailor the interview questions.</p>
      </div>

      {!showPaste ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-300
            ${isDragging ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50'}
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
            accept=".pdf,.txt"
          />

          <div className="flex flex-col items-center gap-4">
            {isLoading ? (
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors">
                <Upload className="w-8 h-8" />
              </div>
            )}
            
            <div>
              <p className="text-lg font-medium text-zinc-900">
                {isLoading ? 'Analyzing resume...' : 'Drop your resume here'}
              </p>
              <p className="text-sm text-zinc-500 mt-1">PDF or TXT files only</p>
            </div>
          </div>

          {error && (
            <div className="mt-6 flex items-center justify-center gap-2 text-red-500 bg-red-50 py-2 px-4 rounded-full text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-zinc-200 p-8">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your resume content here..."
            className="w-full h-64 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:border-zinc-300 focus:ring-0 text-sm resize-none"
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={handlePasteSubmit}
              disabled={pastedText.length < 50}
              className="flex-1 py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 disabled:opacity-50 transition-all"
            >
              Start Interview
            </button>
            <button
              onClick={() => setShowPaste(false)}
              className="px-6 py-3 rounded-xl bg-zinc-100 text-zinc-600 font-bold hover:bg-zinc-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <button 
          onClick={() => setShowPaste(!showPaste)}
          className="text-sm font-medium text-zinc-400 hover:text-zinc-600 transition-colors underline underline-offset-4"
        >
          {showPaste ? 'Back to file upload' : 'Or paste resume text instead'}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        {[
          { icon: FileText, label: 'Smart Analysis' },
          { icon: CheckCircle2, label: 'Tailored Questions' },
          { icon: Loader2, label: 'Instant Feedback' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-zinc-100">
            <item.icon className="w-5 h-5 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-500">{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
