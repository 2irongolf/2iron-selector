export interface Recommendation {
  isRecommended: boolean;
  mainReason: string;
  additionalReasons: string[];
  alternativeSuggestion?: string;
  practiceRoutine?: string[];
  confidenceScore: number;
} 