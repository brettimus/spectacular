// Define the score result type
export type ScoreResult = {
  score: number;
  metadata: {
    rationale: string;
  };
};

// Define the cache type
export type ScoreCache = {
  [messageId: string]: ScoreResult;
};
