import { JournalEntry, InsightResponse } from "../types";

export const analyzeJournalEntries = async (
  entries: JournalEntry[],
  language: "en" | "fa"
): Promise<InsightResponse> => {

  const isPersian = language === "fa";

  if (!entries || entries.length === 0) {
    return {
      summary: isPersian
        ? "هنوز هیچ موردی برای تحلیل وجود ندارد."
        : "No entries to analyze yet.",
      patterns: [],
      advice: isPersian
        ? "برای دریافت بینش، احساسات خود را ثبت کنید."
        : "Start logging your emotions to get insights."
    };
  }

  // only recent 20
  const recentEntries = entries.slice(0, 20);

  // ---------- LOCAL ANALYSIS ----------

  const emotionCount: Record<string, number> = {};
  const highIntensity: JournalEntry[] = [];

  for (const e of recentEntries) {
    emotionCount[e.emotion] = (emotionCount[e.emotion] || 0) + 1;

    if (e.intensity >= 7) {
      highIntensity.push(e);
    }
  }

  // most frequent emotion
  const topEmotion =
    Object.entries(emotionCount).sort((a, b) => b[1] - a[1])[0]?.[0];

  const patterns: string[] = [];

  if (topEmotion) {
    patterns.push(
      isPersian
        ? `احساس غالب شما: ${topEmotion}`
        : `Most frequent emotion: ${topEmotion}`
    );
  }

  if (highIntensity.length > 0) {
    patterns.push(
      isPersian
        ? "چند رویداد با شدت احساسی بالا ثبت شده است."
        : "Several high intensity emotional events detected."
    );
  }

  // ---------- RESPONSE ----------

  return {
    summary: isPersian
      ? `در این مدت بیشتر احساس ${topEmotion || "متغیر"} داشته‌اید.`
      : `Recently you mostly felt ${topEmotion || "mixed emotions"}.`,

    patterns,

    advice: isPersian
      ? "قبل از واکنش، چند نفس عمیق بکشید و محرک‌های تکراری را شناسایی کنید."
      : "Pause before reacting, identify repeating triggers, and practice reflection."
  };
};
