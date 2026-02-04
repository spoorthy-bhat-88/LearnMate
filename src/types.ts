export interface LearningStep {
  id: string;
  title: string;
  content: string;
  completed: boolean;
}

export interface LearningSummary {
  id: string;
  topic: string;
  date: string;
  steps: LearningStep[];
  progress: number;
}

export interface AIResponse {
  steps: Array<{
    title: string;
    content: string;
  }>;
  relatedTopics?: string[];
}
