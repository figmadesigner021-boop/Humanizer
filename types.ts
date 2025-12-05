export interface AnalysisSignals {
  perplexity: string;
  burstiness: string;
  repetitiveness: string;
  tonal_markers: string[];
  grammar_uniformity: string;
}

export interface AnalysisResult {
  ai_probability: string;
  human_probability: string;
  overall_verdict: string;
  signals_detected: AnalysisSignals;
  reasoning: string;
}

export interface ProcessResult {
  analysis?: AnalysisResult;
  humanizedText?: string;
  mode: 'CHECK' | 'HUMANIZE' | 'BOTH';
}
