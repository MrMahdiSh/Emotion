import { GoogleGenAI, Type } from "@google/genai";
import { JournalEntry, InsightResponse } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const analyzeJournalEntries = async (entries: JournalEntry[], language: 'en' | 'fa'): Promise<InsightResponse> => {
  const isPersian = language === 'fa';
  
  if (!entries || entries.length === 0) {
    return {
      summary: isPersian ? "هنوز هیچ موردی برای تحلیل وجود ندارد." : "No entries to analyze yet.",
      patterns: [],
      advice: isPersian ? "برای دریافت بینش هوشمند، احساسات خود را ثبت کنید." : "Start logging your emotions to get AI-powered insights."
    };
  }

  // We only send the last 20 entries to avoid huge token usage and keep context relevant
  const recentEntries = entries.slice(0, 20).map(e => ({
    date: e.date,
    trigger: e.action,
    emotion: e.emotion,
    my_reaction: e.reaction,
    outcome: e.result,
    intensity: e.intensity
  }));

  const langName = isPersian ? "Persian (Farsi)" : "English";

  const prompt = `
    You are an expert psychological assistant speaking ${langName}. Analyze the following journal entries from a user.
    Identify behavioral patterns, emotional triggers, and consequences of their actions.
    Provide constructive, empathetic advice on how to handle similar situations better in the future.
    
    IMPORTANT: The response MUST be in ${langName}.

    Journal Entries:
    ${JSON.stringify(recentEntries, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: `A brief summary of the user's recent emotional state in ${langName}.` },
            patterns: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: `List of observed patterns in ${langName}.` 
            },
            advice: { type: Type.STRING, description: `Actionable advice for improvement in ${langName}.` }
          },
          required: ["summary", "patterns", "advice"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as InsightResponse;

  } catch (error) {
    console.error("Error analyzing entries:", error);
    return {
      summary: isPersian ? "در حال حاضر امکان تحلیل داده‌ها وجود ندارد." : "Could not generate analysis at this time.",
      patterns: isPersian ? ["خطا در اتصال به سرویس هوش مصنوعی."] : ["Error connecting to AI service."],
      advice: isPersian ? "لطفاً بعداً دوباره تلاش کنید." : "Please try again later."
    };
  }
};
