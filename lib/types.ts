// Shared TypeScript types for ECR application

export type StateLevel = 'low' | 'medium' | 'high';

export interface LearnerState {
  cognitiveLoad: StateLevel;
  attention: StateLevel;
  motivation: StateLevel;
  confidence: number; // 0–1
  timestamp: number;
}

export interface LearnerFeatures {
  timeSinceLastAction: number; // seconds
  retryCount: number;
  navigationSpeed: number; // pages/min
  inactivityStreak: number; // seconds
  sessionDuration: number; // minutes
  errorRate: number; // 0–1
}

export type InterventionType =
  | 'pacing_suggestion'
  | 'reflective_prompt'
  | 'task_reframing'
  | 'encouragement'
  | 'help_routing';

export interface Intervention {
  id: string;
  type: InterventionType;
  title: string;
  insight: string;
  actionGuidance: string[];
  buttons: string[];
  timestamp: number;
  dismissed: boolean;
  learnerId: string;
}

export type LearnerProfile = 'focused' | 'overloaded' | 'distracted' | 'disengaged';

export interface SimulatedLearner {
  id: string;
  name: string;
  profile: LearnerProfile;
  avatar: string;
  state: LearnerState;
  features: LearnerFeatures;
  currentActivity: string;
  isInQuiz: boolean;
  optOut: boolean;
  lastIntervention: number | null;
  interventionCount: number;
  sessionStart: number;
}

export interface ClassSummary {
  totalLearners: number;
  highCognitiveLoad: number;
  lowAttention: number;
  lowMotivation: number;
  interventionsToday: number;
  avgConfidence: number;
  hotspots: CourseHotspot[];
  timeline: TimelinePoint[];
}

export interface CourseHotspot {
  activity: string;
  avgCognitiveLoad: number;
  struggleRate: number;
}

export interface TimelinePoint {
  time: string;
  avgAttention: number;
  avgMotivation: number;
  avgCognitiveLoad: number;
}

export interface SimulationControl {
  playing: boolean;
  profile: LearnerProfile;
  scenario: 'normal' | 'overload' | 'distraction' | 'disengagement';
  speed: number; // 1x, 2x, 5x
}
