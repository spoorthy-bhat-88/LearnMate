import { LearningSummary } from '../types';

const STORAGE_KEY = 'learnmate_summaries';

export function saveSummary(summary: LearningSummary): void {
  const summaries = getSummaries();
  const existingIndex = summaries.findIndex(s => s.id === summary.id);
  
  if (existingIndex >= 0) {
    summaries[existingIndex] = summary;
  } else {
    summaries.push(summary);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(summaries));
}

export function getSummaries(): LearningSummary[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function deleteSummary(id: string): void {
  const summaries = getSummaries().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(summaries));
}

export function getSummaryById(id: string): LearningSummary | undefined {
  return getSummaries().find(s => s.id === id);
}
