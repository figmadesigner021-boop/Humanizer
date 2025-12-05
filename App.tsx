import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Copy, AlignLeft, CheckCircle2, AlertCircle, Loader2, Eraser, MoveRight, ScanSearch, Wand2, Layers } from 'lucide-react';
import { processText } from './services/geminiService';
import { ProcessResult } from './types';
import { ResultDashboard } from './components/ResultDashboard';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'CHECK' | 'HUMANIZE' | 'BOTH'>('CHECK');
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Clear result when switching tabs to avoid confusion
  useEffect(() => {
    setResult(null);
    setError(null);
  }, [activeTab]);

  const handleProcess = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Smooth scroll to results
    if (window.innerWidth < 1024) {
        setTimeout(() => {
            const resultElement = document.getElementById('results-anchor');
            if (resultElement) resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    try {
      const data = await processText(inputText, activeTab);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setError(null);
    textareaRef.current?.focus();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(prev => prev + text);
      textareaRef.current?.focus();
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const handleUseText = (text: string) => {
    setInputText(text);
    // Optional: Switch to check mode to verify the humanized text
    if (activeTab === 'HUMANIZE') {
      setActiveTab('CHECK');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;
  const isTextEmpty = !inputText.trim();

  // Dynamic UI Text based on Tab
  const getTabInfo = () => {
    switch(activeTab) {
      case 'CHECK': return { 
        placeholder: "Paste your text here to analyze for AI patterns...",
        buttonText: "Analyze Content",
        icon: <ScanSearch className="w-5 h-5" /> 
      };
      case 'HUMANIZE': return { 
        placeholder: "Paste AI-generated text here to rewrite it naturally...",
        buttonText: "Humanize Text",
        icon: <Wand2 className="w-5 h-5" /> 
      };
      case 'BOTH': return { 
        placeholder: "Paste text to check score and fix it in one go...",
        buttonText: "Check & Fix",
        icon: <Layers className="w-5 h-5" /> 
      };
    }
  };

  const tabInfo = getTabInfo();

  return (
    <div className="min-h-screen flex flex-col items-center py-16 px-4 sm:px-6 bg-[#F5F5F4] font-sans text-stone-900 selection:bg-stone-200">
      
      {/* Hero Typography */}
      <header className="mb-10 text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 uppercase">
          Trusted GPT-5, ChatGPT <br/>
          <span className="text-stone-500">and AI Detector</span>
        </h1>
        <p className="text-xs md:text-sm font-bold text-stone-400 tracking-[0.2em] uppercase">
          The most advanced and reliable AI content analysis tool
        </p>
      </header>

      <div className="w-full max-w-4xl flex flex-col gap-8">
        
        {/* Main Interface Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-stone-200/50 overflow-hidden ring-1 ring-stone-900/5">
          
          {/* Tab Navigation (Pill Style) */}
          <div className="flex justify-center pt-8 pb-6 px-6 bg-white border-b border-stone-100">
            <div className="inline-flex bg-stone-100 p-1.5 rounded-full border border-stone-200 relative">
              {(['CHECK', 'HUMANIZE', 'BOTH'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 z-10
                    ${activeTab === tab 
                      ? 'text-stone-900 shadow-sm bg-white ring-1 ring-stone-900/10' 
                      : 'text-stone-500 hover:text-stone-800'
                    }`}
                >
                  {tab === 'BOTH' ? 'Full Scan' : tab === 'CHECK' ? 'AI Checker' : 'AI Humanizer'}
                </button>
              ))}
            </div>
          </div>

          {/* Editor Container */}
          <div className="px-8 pb-8 pt-6 bg-stone-50/30">
            <div className="relative group">
              
              {/* Toolbar */}
              <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                 <button 
                  onClick={handlePaste}
                  className="p-2 bg-stone-100 border-2 border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-400 rounded-lg text-xs font-bold transition-all hover:scale-105"
                  title="Paste from clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleClear}
                  disabled={isTextEmpty}
                  className="p-2 bg-stone-100 border-2 border-stone-200 text-stone-600 hover:text-red-600 hover:border-red-200 rounded-lg text-xs font-bold transition-all hover:scale-105 disabled:opacity-50"
                  title="Clear text"
                >
                  <Eraser className="w-4 h-4" />
                </button>
              </div>

              {/* Text Area */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={tabInfo.placeholder}
                  className="w-full h-[320px] p-6 bg-white rounded-xl border-2 border-stone-300 hover:border-stone-400 focus:border-stone-900 resize-none focus:outline-none text-lg text-stone-900 placeholder:text-stone-400 leading-relaxed font-normal transition-all duration-200 shadow-sm"
                  spellCheck={false}
                />
                
                {/* Word Count Badge */}
                <div className="absolute bottom-4 right-4 pointer-events-none">
                    <span className="bg-stone-100 border border-stone-200 px-3 py-1 rounded-full text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                        {wordCount} Words
                    </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm font-bold flex items-center justify-center gap-2 animate-fade-in border-2 border-red-100">
                <AlertCircle className="w-4 h-4" />
                {error}
                </div>
            )}

            {/* Main Action Button */}
            <button
              onClick={handleProcess}
              disabled={loading || isTextEmpty}
              className={`mt-6 w-full h-14 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-stone-200
                ${isTextEmpty 
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed border-2 border-transparent' 
                  : 'bg-stone-900 text-white hover:bg-stone-800 hover:translate-y-[-2px] hover:shadow-xl border-2 border-stone-900'
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {tabInfo.icon}
                  {tabInfo.buttonText}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div id="results-anchor" className="animate-slide-up scroll-mt-8">
             <ResultDashboard result={result} onUseHumanizedText={handleUseText} />
          </div>
        )}

      </div>
      
      <footer className="mt-20 text-center text-stone-400">
        <p className="text-[10px] uppercase tracking-widest font-semibold">
          AI Detection System v2.5 • Powered by Gemini
        </p>
      </footer>

    </div>
  );
};

export default App;