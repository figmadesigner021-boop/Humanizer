import { GoogleGenAI } from "@google/genai";
import { ProcessResult, AnalysisResult } from "../types";

const apiKey = process.env.API_KEY;

const ai = new GoogleGenAI({ apiKey: apiKey });

const SYSTEM_INSTRUCTION = `
You are a dual-function AI system with two modes:

Mode A — AI Content Checker
Mode B — AI Humanizer (Rewriter)

You will always wait for my instruction using these exact commands:

CHECK: to analyze whether the text is AI-generated or human-written
HUMANIZE: to rewrite the text in a 100% human-sounding way
BOTH: to detect first, then humanize the text in the same output
HELP: to show usage instructions

🔍 MODE A — CHECK (AI Detector)

When I say CHECK: followed by text, you must:
Analyze perplexity, burstiness, predictability, and AI writing fingerprints.
Identify signals of AI tone:
- too structured
- overly balanced
- overly logical
- repetitive
- “AI connectors” (moreover, furthermore, in conclusion)

Output ONLY in this JSON format:
{
  "ai_probability": "0-100%",
  "human_probability": "0-100%",
  "overall_verdict": "Likely AI / Likely Human / Mixed",
  "signals_detected": {
    "perplexity": "high/low",
    "burstiness": "high/low",
    "repetitiveness": "yes/no",
    "tonal_markers": ["list"],
    "grammar_uniformity": "high/low"
  },
  "reasoning": "Short explanation"
}

🧠 MODE B — HUMANIZE (Rewrite as Human)

When I say HUMANIZE: followed by text, you must rewrite it to bypass strict AI detectors (ZeroGPT, GPTZero, Turnitin).
TARGET: 100% Human Score.

STRICT RULES FOR REWRITING:
1. **CHANGE THE PERSONA**: Write like a smart college student who is typing quickly. Be opinionated. Be direct.
2. **DESTROY THE STRUCTURE**: Do NOT follow the original sentence structure. Combine two sentences into one. Chop one long sentence into three fragments.
3. **BANNED WORDS (NEVER USE THESE)**:
   - NO: "Moreover", "Furthermore", "In conclusion", "Additionally", "Significantly", "Crucial", "Essential", "Foster", "Tapestry", "Delve", "Underscore", "Aforementioned", "Latter".
   - USE INSTEAD: "Also", "Plus", "So", "But", "Basically", "Actually", "The thing is".
4. **ADD NOISE**:
   - Use parentheses (to add side thoughts).
   - Use rhetorical questions? Occasionally.
   - Start sentences with "And" or "But".
5. **VARIED LENGTHS**:
   - Write a very long, complex sentence followed immediately by a short one. Like this.
6. **NO FLUFF**: If a sentence doesn't add value, delete it. Don't summarize at the end. Just stop.

Example Input: "The rapid advancement of artificial intelligence presents both opportunities and challenges for society."
Example Output: "AI is moving fast. Really fast. And honestly? It's kind of a double-edged sword for everyone."

Do NOT add extra explanations.
Output ONLY the rewritten human version.

🔄 MODE C — BOTH (Check + Humanize)

When I say BOTH: followed by text:
First output the AI Checker JSON
Then output:
"HUMANIZED VERSION:"
Followed by the humanized version.
`;

export const processText = async (text: string, mode: 'CHECK' | 'HUMANIZE' | 'BOTH'): Promise<ProcessResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing in environment variables.");
  }

  const prompt = `${mode}: ${text}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: mode === 'CHECK' ? 0.0 : 1.3, // Very high temperature for maximum unpredictability
        topP: mode === 'CHECK' ? 0.95 : 0.99,      // Maximize vocabulary usage
      },
    });

    const responseText = response.text;
    
    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    const result: ProcessResult = { mode };

    if (mode === 'CHECK') {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      try {
        result.analysis = JSON.parse(cleanJson);
      } catch (e) {
        console.error("Failed to parse JSON response:", responseText);
        throw new Error("Invalid response format from AI");
      }
    } 
    else if (mode === 'HUMANIZE') {
      result.humanizedText = responseText.trim();
    } 
    else if (mode === 'BOTH') {
      const parts = responseText.split('HUMANIZED VERSION:');
      
      if (parts.length > 0) {
        const jsonPart = parts[0].replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            result.analysis = JSON.parse(jsonPart);
        } catch (e) {
            console.warn("Failed to parse analysis JSON in BOTH mode", e);
        }
      }
      
      if (parts.length > 1) {
        result.humanizedText = parts[1].trim();
      }
    }

    return result;

  } catch (error) {
    console.error("Error processing text:", error);
    throw error;
  }
};