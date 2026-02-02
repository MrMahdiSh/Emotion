export enum EmotionType {
  Angry = "Angry",
  Happy = "Happy",
  Sad = "Sad",
  Anxious = "Anxious",
  Frustrated = "Frustrated",
  Excited = "Excited",
  Neutral = "Neutral",
  Surprised = "Surprised"
}

export const EmotionLabels = {
  en: {
    [EmotionType.Angry]: "Angry",
    [EmotionType.Happy]: "Happy",
    [EmotionType.Sad]: "Sad",
    [EmotionType.Anxious]: "Anxious",
    [EmotionType.Frustrated]: "Frustrated",
    [EmotionType.Excited]: "Excited",
    [EmotionType.Neutral]: "Neutral",
    [EmotionType.Surprised]: "Surprised"
  },
  fa: {
    [EmotionType.Angry]: "عصبانی",
    [EmotionType.Happy]: "خوشحال",
    [EmotionType.Sad]: "غمگین",
    [EmotionType.Anxious]: "مضطرب",
    [EmotionType.Frustrated]: "کلافه",
    [EmotionType.Excited]: "هیجان‌زده",
    [EmotionType.Neutral]: "خنثی",
    [EmotionType.Surprised]: "متعجب"
  }
};

export interface JournalEntry {
  id: string;
  date: string; // ISO string
  action: string; // "Seeing someone"
  emotion: EmotionType; // "Get angry"
  reaction: string; // "I smash his face"
  result: string; // "He punched me back"
  intensity: number; // 1-10
}

export interface InsightResponse {
  summary: string;
  patterns: string[];
  advice: string;
}

// Chart Data Types
export interface DailyMoodData {
  date: string;
  count: number;
  avgIntensity: number;
}

export interface EmotionFrequencyData {
  name: string;
  value: number;
}
