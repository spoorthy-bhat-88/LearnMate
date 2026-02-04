import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIResponse } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize Gemini client (only if API key is provided)
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateLearningSteps(topic: string): Promise<AIResponse> {
  if (!genAI) {
    throw new Error('API Key Missing: Please add your free Google Gemini API key to the .env file to start generating learning paths.');
  }

  try {
    // Use gemini-flash-latest model with lower temperature for accuracy
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: {
        temperature: 0.2, // Lower temperature reduces hallucinations
        topP: 0.8,
        topK: 40,
      }
    });

    const prompt = `You are a world-class expert teacher and instructional designer. Your goal is to create a highly engaging, interactive, and visual learning path for the topic: "${topic}".

CRITICAL INSTRUCTIONS FOR ACCURACY:
1. Prioritize factual correctness above all else. Do not invent libraries, historical events, or scientific principles.
2. Ensure all code snippets are valid, syntactically correct, and use real, existing libraries.
3. If the topic is controversial or theoretical, present it as such, not as absolute fact.
4. If the topic is completely nonsensical or you lack sufficient verifiable information, provide a polite "Step 1" explaining the limitation instead of hallucinating content.

Break the topic down into 5-10 clear, progressive learning steps. Each step must be a self-contained lesson that builds upon the previous one. Use a conversational, encouraging, and storytelling tone.

For each step, you MUST provide the following in rich Markdown format, but DO NOT include the bolded section labels (like "Core Concept:", "Real-World Analogy:", etc.). Just provide the content directly in a flowing, natural structure.

1.  **Core Concept:** Start with a clear and engaging explanation of the main idea. Avoid dry textbook language.
2.  **Visual Aid:** Include a diagram using Mermaid.js syntax (wrapped in a \`\`\`mermaid code block) or clear ASCII art to visualize the concept. Place this directly in the flow where it makes sense. IMPORTANT: When using Mermaid, ALWAYS wrap node labels in double quotes to prevent syntax errors (e.g., A["Label (Text)"] --> B["Next"]).
3.  **Real-World Analogy:** Weave in a creative and relatable analogy or metaphor locally.
4.  **Practical Example:** Provide a concrete, practical example. If the topic is technical, provide a well-commented code snippet.
5.  **"Try It Yourself" Challenge:** End with a small, actionable task, thought experiment, or quiz question.
6.  **Key Takeaway:** A single, bolded sentence summarizing the most critical point of the step.

Finally, suggest 3-5 related topics that the user might want to explore next to deepen their understanding.

Format your entire response as a single JSON object with a "steps" array and a "relatedTopics" array of strings. Each object in the "steps" array should have "title" and "content" fields. The "content" field must contain the detailed, multi-part lesson formatted in Markdown.

Example format:
{
  "steps": [
    {
      "title": "Step 1: Understanding the Basics",
      "content": "Start with the core concept explanation...\\n\\n\`\`\`mermaid\\ngraph TD;\\n    A[Start] --> B[Concept];\\n\`\`\`\\n\\nThen transition into the analogy...\\n\\nHere is an example:\\n\`\`\`javascript\\n// code snippet\\n\`\`\`\\n\\n### Try It Yourself\\nChallenge description...\\n\\n**Key Takeaway:** ...summary..."
    }
  ],
  "relatedTopics": ["Related Topic 1", "Related Topic 2", "Related Topic 3"]
}

Now, create this detailed, step-by-step learning guide for: ${topic}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      throw new Error('No content received from API');
    }

    // Try to parse as JSON first
    try {
      // Find the start and end of the JSON object
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}');
      
      if (start !== -1 && end !== -1) {
        const jsonStr = content.substring(start, end + 1);
        const parsed = JSON.parse(jsonStr);
        if (parsed.steps && Array.isArray(parsed.steps)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse AI response as JSON, attempting regex fallback', e);
    }

    // Fallback: Try to extract JSON-like structure using regex (handles some invalid JSON cases)
    const fallbackResult = parseJsonFallback(content);
    if (fallbackResult) {
      return fallbackResult;
    }

    return parseTextResponse(content);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate content. Please check your API key and try again.');
  }
}

function parseJsonFallback(text: string): AIResponse | null {
  try {
    const steps: Array<{ title: string; content: string }> = [];
    // Matches "title": "..." and "content": "..." pattern
    const regex = /"title"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"content"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      try {
        // Use JSON.parse to handle escaped characters correctly
        const title = JSON.parse(`"${match[1]}"`);
        const content = JSON.parse(`"${match[2]}"`);
        steps.push({ title, content });
      } catch (e) {
        // Ignore individual parse errors
      }
    }
    
    if (steps.length > 0) {
      // Try to extract related topics
      const relatedTopics: string[] = [];
      const relatedRegex = /"relatedTopics"\s*:\s*\[([\s\S]*?)\]/;
      const relatedMatch = text.match(relatedRegex);
      
      if (relatedMatch) {
        const topicRegex = /"((?:[^"\\]|\\.)*)"/g;
        let topicMatch;
        while ((topicMatch = topicRegex.exec(relatedMatch[1])) !== null) {
          try {
            relatedTopics.push(JSON.parse(`"${topicMatch[1]}"`));
          } catch (e) {}
        }
      }
      
      return { steps, relatedTopics };
    }
  } catch (e) {
    console.warn('Regex fallback parsing failed', e);
  }
  return null;
}

function parseTextResponse(text: string): AIResponse {
  const steps: Array<{ title: string; content: string }> = [];
  // Split the text by lines that look like "Step X: ..." or "### Step X ..."
  const stepChunks = text.split(/^(?:Step \d+:|### Step \d+)/im);

  if (stepChunks.length <= 1) {
    // If no steps found, return the whole text as one step
    return { steps: [{ title: 'Learning Guide', content: text }] };
  }

  // The first element is usually empty or introductory text, so we skip it.
  for (let i = 1; i < stepChunks.length; i++) {
    const chunk = stepChunks[i];
    const lines = chunk.trim().split('\n');
    
    // The first line of the chunk is the title
    const title = lines.shift()?.trim().replace(/:$/, '') || `Step ${i}`;
    
    // The rest is the content
    const content = lines.join('\n').trim();
    
    if (title && content) {
      steps.push({ title, content });
    }
  }
  
  return { steps: steps.length > 0 ? steps : [
    { title: 'Getting Started', content: text }
  ]};
}
