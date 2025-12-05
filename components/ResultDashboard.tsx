import React, { useState } from 'react';
import { ProcessResult } from '../types';
import { Check, Copy, ArrowUpLeft, ShieldCheck, ShieldAlert, Activity, Fingerprint, Zap, AlignCenter } from 'lucide-react';

interface ResultDashboardProps {
  result: ProcessResult;
  onUseHumanizedText?: (text: string) => void;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({ result, onUseHumanizedText }) => {
  const [copied, setCopied] = useState(false);
  const { analysis, humanizedText } = result;

  const handleCopy = () => {
    if (humanizedText) {
      navigator.clipboard.writeText(humanizedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderAnalysis = () => {
    if (!analysis) return null;

    const aiScore = parseInt(analysis.ai_probability.replace('%', ''), 10);
    const humanScore = parseInt(analysis.human_probability.replace('%', ''), 10);
    const isHighAi = aiScore > 50;
    const isMixed = aiScore > 30 && aiScore < 70;

    // Color Logic: Deep authoritative colors
    // High AI: Burnt Sienna / Orange-Red
    // High Human: Deep Emerald / Forest
    const accentColor = isHighAi ? 'text-orange-600' : 'text-emerald-700';
    const bgSoft = isHighAi ? 'bg-orange-50' : 'bg-emerald-50';
    const borderColor = isHighAi ? 'border-orange-200' : 'border-emerald-200';
    const icon = isHighAi ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />;
    const verdictTitle = isHighAi ? "AI Pattern Detected" : "Human Written";

    return (
      <div className="flex flex-col gap-6">
        {/* Score Card */}
        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-stone-200/50 border-2 border-stone-100">
          
          <div className="flex flex-col md:flex-row gap-10 items-center justify-between">
             
             {/* Text Verdict */}
             <div className="flex-1 text-center md:text-left">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 ${bgSoft} ${accentColor}`}>
                    {icon}
                    <span>Analysis Complete</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight mb-2">
                    {analysis.overall_verdict}
                </h2>
                <p className="text-stone-500 font-medium leading-relaxed max-w-md">
                    {analysis.reasoning}
                </p>
             </div>

             {/* Circular/Prominent Score */}
             <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-stone-100"
                    />
                    <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * aiScore) / 100}
                        className={`${isHighAi ? 'text-orange-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-black ${isHighAi ? 'text-orange-600' : 'text-emerald-700'}`}>
                        {aiScore}%
                    </span>
                    <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider mt-1">AI Score</span>
                </div>
             </div>
          </div>

          {/* Detailed Signals Grid */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
             <SignalCard 
                label="Perplexity" 
                value={analysis.signals_detected.perplexity} 
                icon={<Activity className="w-4 h-4" />}
                isNeutral
             />
             <SignalCard 
                label="Burstiness" 
                value={analysis.signals_detected.burstiness} 
                icon={<Zap className="w-4 h-4" />}
                isNeutral
             />
             <SignalCard 
                label="Pattern Repetition" 
                value={analysis.signals_detected.repetitiveness} 
                icon={<AlignCenter className="w-4 h-4" />}
                isNeutral={false}
                isBad={analysis.signals_detected.repetitiveness.toLowerCase().includes('yes')}
             />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {renderAnalysis()}

      {humanizedText && (
        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-stone-200/50 border-2 border-stone-100 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
           
           <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-500" fill="currentColor" fillOpacity={0.2} />
                        Humanized Result
                    </h3>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">Optimized for natural flow</p>
                </div>
                <div className="flex gap-2">
                     <button 
                        onClick={() => onUseHumanizedText && onUseHumanizedText(humanizedText)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200"
                    >
                        <ArrowUpLeft className="w-3 h-3" />
                        Replace Input
                    </button>
                    <button 
                        onClick={handleCopy}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border ${copied ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800'}`}
                    >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            </div>
            
            <div className="prose prose-lg max-w-none text-stone-700 leading-relaxed font-normal bg-stone-50/50 p-6 rounded-xl border-2 border-stone-200">
                {humanizedText}
            </div>
        </div>
      )}
    </div>
  );
};

const SignalCard = ({ label, value, icon, isNeutral, isBad }: any) => (
    <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg text-stone-400 shadow-sm border border-stone-200">
                {icon}
            </div>
            <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{label}</div>
                <div className={`text-sm font-bold capitalize mt-0.5 ${
                    isNeutral ? 'text-stone-700' : isBad ? 'text-orange-600' : 'text-emerald-600'
                }`}>
                    {value}
                </div>
            </div>
        </div>
    </div>
);

// Icon component needed for Humanized section
const Sparkles = ({ className, ...props }: any) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
);