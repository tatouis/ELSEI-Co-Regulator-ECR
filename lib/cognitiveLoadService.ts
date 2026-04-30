
/**
 * Cognitive Load Calculation Service (API-only version)
 * Based on the Extended API Documentation for EduAI
 */

export interface CognitiveLoadFeatures {
  // Core API-only Variables (0-1)
  retryPressure?: number;       // β1
  errorPressure?: number;       // β2
  quizTimePressure?: number;    // β3
  deadlinePressure?: number;    // β4
  lowProgress?: number;         // β5
  gradeDrop?: number;           // β6
  nonCompletionRisk?: number;   // β7
  assignmentPressure?: number;  // β8
  lessonDifficulty?: number;    // β9
  contentCoverageGap?: number;  // β10
  
  // Legacy support
  retryRate?: number;
  errRate?: number;
  switchRate?: number;
  timePressure?: number;
  progressRate?: number;
}

export const COGNITIVE_LOAD_DEFAULTS = {
  beta0: -1.5,  // Base intercept
  beta1: 0.8,   // RetryPressure
  beta2: 1.2,   // ErrorPressure
  beta3: 0.7,   // QuizTimePressure
  beta4: 0.9,   // DeadlinePressure
  beta5: 1.1,   // LowProgress
  beta6: 0.6,   // GradeDrop
  beta7: 0.8,   // NonCompletionRisk
  beta8: 0.7,   // AssignmentPressure
  beta9: 0.5,   // LessonDifficulty
  beta10: 0.4   // ContentCoverageGap
};

/**
 * Normalizes a feature value
 */
function normalizeFeature(value: number | undefined, featureName: string): number {
  const val = value === undefined || isNaN(value) ? 0 : value;
  
  // Most API-only variables are already normalized by the API layer (0-1)
  if ([
    'retryPressure', 'errorPressure', 'quizTimePressure', 'deadlinePressure', 
    'lowProgress', 'gradeDrop', 'nonCompletionRisk', 'assignmentPressure', 
    'lessonDifficulty', 'contentCoverageGap',
    'retryRate', 'errRate', 'switchRate', 'progressRate'
  ].includes(featureName)) {
    return Math.max(0, Math.min(1, val));
  }
  
  if (featureName === 'timePressure') {
    return Math.min(val, 2) / 2;
  }
  
  return Math.min(val, 10) / 10; 
}

/**
 * Estimates cognitive load based on the logistic regression model
 */
export function calculateCognitiveLoad(features: CognitiveLoadFeatures) {
  // Map legacy values if new ones aren't provided
  const norm = {
    retryPressure: normalizeFeature(features.retryPressure ?? features.retryRate, 'retryPressure'),
    errorPressure: normalizeFeature(features.errorPressure ?? features.errRate, 'errorPressure'),
    quizTimePressure: normalizeFeature(features.quizTimePressure ?? features.timePressure, 'quizTimePressure'),
    deadlinePressure: normalizeFeature(features.deadlinePressure, 'deadlinePressure'),
    lowProgress: normalizeFeature(features.lowProgress ?? (features.progressRate !== undefined ? 1 - features.progressRate : undefined), 'lowProgress'),
    gradeDrop: normalizeFeature(features.gradeDrop, 'gradeDrop'),
    nonCompletionRisk: normalizeFeature(features.nonCompletionRisk, 'nonCompletionRisk'),
    assignmentPressure: normalizeFeature(features.assignmentPressure, 'assignmentPressure'),
    lessonDifficulty: normalizeFeature(features.lessonDifficulty, 'lessonDifficulty'),
    contentCoverageGap: normalizeFeature(features.contentCoverageGap, 'contentCoverageGap'),
  };

  // Calculate weighted sum: β0 + Σ(βi * Xi)
  // Note: For Progress, the doc uses β5·LowProgress (which is positive impact on load)
  const x = COGNITIVE_LOAD_DEFAULTS.beta0 +
            (COGNITIVE_LOAD_DEFAULTS.beta1 * norm.retryPressure) +
            (COGNITIVE_LOAD_DEFAULTS.beta2 * norm.errorPressure) +
            (COGNITIVE_LOAD_DEFAULTS.beta3 * norm.quizTimePressure) +
            (COGNITIVE_LOAD_DEFAULTS.beta4 * norm.deadlinePressure) +
            (COGNITIVE_LOAD_DEFAULTS.beta5 * norm.lowProgress) +
            (COGNITIVE_LOAD_DEFAULTS.beta6 * norm.gradeDrop) +
            (COGNITIVE_LOAD_DEFAULTS.beta7 * norm.nonCompletionRisk) +
            (COGNITIVE_LOAD_DEFAULTS.beta8 * norm.assignmentPressure) +
            (COGNITIVE_LOAD_DEFAULTS.beta9 * norm.lessonDifficulty) +
            (COGNITIVE_LOAD_DEFAULTS.beta10 * norm.contentCoverageGap);

  // Sigmoid activation: 1 / (1 + e^-x)
  const score = 1 / (1 + Math.exp(-x));

  // Determine confidence level based on data availability
  const activeFeatures = [
    features.retryPressure, features.errorPressure, features.quizTimePressure, 
    features.deadlinePressure, features.lowProgress, features.gradeDrop,
    features.nonCompletionRisk, features.assignmentPressure, features.lessonDifficulty,
    features.contentCoverageGap
  ].filter(v => v !== undefined && v > 0).length;
  
  let confidence: 'Alta' | 'Media' | 'Baja' = 'Baja';
  if (activeFeatures >= 6) confidence = 'Alta';
  else if (activeFeatures >= 3) confidence = 'Media';

  return {
    score,
    level: score > 0.66 ? 'Alta' : score > 0.33 ? 'Moderada' : 'Baja',
    confidence,
    features: norm,
    missingSources: [] 
  };
}
