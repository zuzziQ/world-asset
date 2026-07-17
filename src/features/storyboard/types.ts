export interface SubScores {
  drama: number;
  characterArc: number;
  pacing: number;
  visualViability: number;
}

export interface SkipEditSegment {
  scene: string;
  type: 'edit' | 'skip';
  reason: string;
  tip: string;
  aiSuggestion: string;
}

export interface RetentionHacks {
  hookSuggestions: string[];
  visualRetentionCues: string[];
  pacingAndMusicBeats: string[];
}

export interface EvaluationResult {
  overallScore: number;
  subScores: SubScores;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  retentionHacks: RetentionHacks;
  skipEditSegments?: SkipEditSegment[];
}
