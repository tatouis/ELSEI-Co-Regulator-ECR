
/**
 * Cognitive Load Service
 * Handles the calculation of estimated cognitive load based on Moodle signals.
 * Implementation based on the "Objetivonuevo" mission prompt.
 */

export interface CognitiveLoadFeatures {
  attempts: number;
  activitiesAttempted: number;
  retryRate: number;
  wrongAnswers: number;
  totalAnswers: number;
  errRate: number;
  switchRate: number;
  timeSpentActive: number;
  expectedTime: number;
  timePressure: number;
  completedActivities: number;
  totalActivities: number;
  progressRate: number;
  progressGap: number;
}

export interface CognitiveLoadResult {
  score: number;
  level: 'Baja' | 'Moderada' | 'Alta';
  confidence: 'Alta' | 'Media' | 'Baja' | 'Insuficiente';
  features: CognitiveLoadFeatures;
  normalizedFeatures: Record<string, number>;
  missingSources: string[];
  warnings: string[];
}

export const COGNITIVE_LOAD_DEFAULTS = {
  beta0: -2.0, // Bias
  beta1: 1.5,  // RetryRate
  beta2: 2.0,  // ErrRate
  beta3: 1.0,  // SwitchRate
  beta4: 1.5,  // TimePressure
  beta5: 1.0,  // ProgressGap (High gap = high load)
  inactivityThresholdMinutes: 30,
  epsilon: 0.000001
};

/**
 * Sigmoid function
 */
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Normalizes a feature value
 */
function normalizeFeature(value: number, featureName: string): number {
  // Rates are already normalized between 0 and 1
  if (['retryRate', 'errRate', 'switchRate', 'progressRate', 'progressGap'].includes(featureName)) {
    return Math.max(0, Math.min(1, value));
  }
  
  // TimePressure is normalized by clamping at 2 and dividing by 2 (as suggested)
  if (featureName === 'timePressure') {
    return Math.min(value, 2) / 2;
  }
  
  // For other count-based variables, we use simple clamping for now 
  // until cohort statistics are available.
  return Math.min(value, 10) / 10; 
}

/**
 * Calculates estimated cognitive load
 */
export function calculateCognitiveLoad(features: Partial<CognitiveLoadFeatures>): CognitiveLoadResult {
  const f: CognitiveLoadFeatures = {
    attempts: features.attempts ?? 0,
    activitiesAttempted: features.activitiesAttempted ?? 0,
    retryRate: features.retryRate ?? 0,
    wrongAnswers: features.wrongAnswers ?? 0,
    totalAnswers: features.totalAnswers ?? 0,
    errRate: features.errRate ?? 0,
    switchRate: features.switchRate ?? 0,
    timeSpentActive: features.timeSpentActive ?? 0,
    expectedTime: features.expectedTime ?? 0,
    timePressure: features.timePressure ?? 0,
    completedActivities: features.completedActivities ?? 0,
    totalActivities: features.totalActivities ?? 0,
    progressRate: features.progressRate ?? 0,
    progressGap: features.progressGap ?? (1 - (features.progressRate ?? 0))
  };

  // Re-calculate derived rates if needed
  if (!features.retryRate && f.activitiesAttempted > 0) {
    f.retryRate = f.attempts / (f.activitiesAttempted + 1);
  }
  if (!features.errRate && f.totalAnswers > 0) {
    f.errRate = f.wrongAnswers / (f.totalAnswers + COGNITIVE_LOAD_DEFAULTS.epsilon);
  }
  if (!features.timePressure && f.expectedTime > 0) {
    f.timePressure = f.timeSpentActive / f.expectedTime;
  }
  if (!features.progressRate && f.totalActivities > 0) {
    f.progressRate = f.completedActivities / (f.totalActivities + COGNITIVE_LOAD_DEFAULTS.epsilon);
    f.progressGap = 1 - f.progressRate;
  }

  // Normalization
  const norm: Record<string, number> = {
    retryRate: normalizeFeature(f.retryRate, 'retryRate'),
    errRate: normalizeFeature(f.errRate, 'errRate'),
    switchRate: normalizeFeature(f.switchRate, 'switchRate'),
    timePressure: normalizeFeature(f.timePressure, 'timePressure'),
    progressGap: normalizeFeature(f.progressGap, 'progressGap')
  };

  // Sigmoid Calculation
  // Formula from image: CL = σ(β0 + β1·R + β2·E + β3·S + β4·T - β5·P)
  const x = COGNITIVE_LOAD_DEFAULTS.beta0 +
            (COGNITIVE_LOAD_DEFAULTS.beta1 * norm.retryRate) +
            (COGNITIVE_LOAD_DEFAULTS.beta2 * norm.errRate) +
            (COGNITIVE_LOAD_DEFAULTS.beta3 * norm.switchRate) +
            (COGNITIVE_LOAD_DEFAULTS.beta4 * norm.timePressure) -
            (COGNITIVE_LOAD_DEFAULTS.beta5 * norm.progressRate);

  const score = sigmoid(x);

  // Level determination
  let level: 'Baja' | 'Moderada' | 'Alta' = 'Baja';
  if (score > 0.66) level = 'Alta';
  else if (score > 0.33) level = 'Moderada';

  // Confidence scoring
  const missingSources = [];
  if (!features.attempts) missingSources.push('mdl_quiz_attempts');
  if (!features.wrongAnswers) missingSources.push('mdl_question_attempt_steps');
  if (!features.activitiesAttempted) missingSources.push('mdl_logstore_standard_log');
  if (!features.completedActivities) missingSources.push('mdl_course_modules_completion');
  if (!features.expectedTime) missingSources.push('expected_time');

  let confidence: 'Alta' | 'Media' | 'Baja' | 'Insuficiente' = 'Alta';
  const missingCount = missingSources.length;
  if (missingCount >= 4) confidence = 'Insuficiente';
  else if (missingCount >= 3) confidence = 'Baja';
  else if (missingCount >= 1) confidence = 'Media';

  const warnings = [];
  if (confidence === 'Insuficiente') {
    warnings.push('Datos insuficientes para calcular una estimación fiable.');
  }
  if (!f.expectedTime) {
    warnings.push('Tiempo esperado no disponible. Se requiere configuración.');
  }

  return {
    score,
    level,
    confidence,
    features: f,
    normalizedFeatures: norm,
    missingSources,
    warnings
  };
}
