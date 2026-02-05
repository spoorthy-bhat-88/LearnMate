import { AIResponse, DifficultyLevel } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export async function generateLearningSteps(topic: string, level: DifficultyLevel = 'beginner'): Promise<AIResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/learn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, level }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate content');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling Learning API:', error);
    throw error;
  }
}

export async function askFollowUpQuestion(topic: string, currentStepTitle: string, currentStepContent: string, question: string, history: {role: string, content: string}[] = []): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            topic, 
            currentStepTitle, 
            currentStepContent, 
            question, 
            history 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }
  
      const data = await response.json();
      return data.answer;
  } catch (error) {
    console.error('Error answering follow-up:', error);
    throw new Error('Failed to get answer.');
  }
}


