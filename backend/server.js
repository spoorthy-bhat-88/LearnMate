const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper functions for parsing
function parseJsonFallback(text) {
  try {
    const steps = [];
    const regex = /"title"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"content"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      try {
        const title = JSON.parse(`"${match[1]}"`);
        const content = JSON.parse(`"${match[2]}"`);
        steps.push({ title, content });
      } catch (e) {
        // Ignore individual parse errors
      }
    }
    
    if (steps.length > 0) {
      const relatedTopics = [];
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

function parseTextResponse(text) {
  const steps = [];
  const stepChunks = text.split(/^(?:Step \d+:|### Step \d+)/im);

  if (stepChunks.length <= 1) {
    return { steps: [{ title: 'Learning Guide', content: text }] };
  }

  for (let i = 1; i < stepChunks.length; i++) {
    const chunk = stepChunks[i];
    const lines = chunk.trim().split('\n');
    const title = lines.shift()?.trim().replace(/:$/, '') || `Step ${i}`;
    const content = lines.join('\n').trim();
    
    if (title && content) {
      steps.push({ title, content });
    }
  }
  
  return { steps: steps.length > 0 ? steps : [
    { title: 'Getting Started', content: text }
  ]};
}

app.get('/', (req, res) => {
    res.send('LearnMate API is running');
});

app.post('/api/learn', async (req, res) => {
  const { topic, level = 'beginner' } = req.body;

  if (!genAI) {
    return res.status(500).json({ error: 'Server API Key Missing' });
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
      }
    });

    const levelInstructions = {
      beginner: "Target Audience: Beginners. Focus on high-level concepts, use clear and simple analogies, avoid heavy jargon, and assume zero prior knowledge.",
      intermediate: "Target Audience: Intermediate Learners. Focus on practical implementation, standard practices, and connecting concepts. Assume basic familiarity with the domain.",
      advanced: "Target Audience: Experts. Focus on deep theoretical complexity, edge cases, performance optimization, and advanced mathematical or architectural principles. Do not over-explain basics."
    };

    const stepsConfig = {
      beginner: "5-10",
      intermediate: "10-20",
      advanced: "15-30"
    };

    const prompt = `You are a world-class expert teacher and instructional designer. Your goal is to create a highly engaging, interactive, and visual learning path for the topic: "${topic}".

**DIFFICULTY LEVEL: ${level.toUpperCase()}**
${levelInstructions[level]}

CRITICAL INSTRUCTIONS FOR ACCURACY:
1. Prioritize factual correctness above all else. Do not invent libraries, historical events, or scientific principles.
2. Ensure all code snippets are valid, syntactically correct, and use real, existing libraries.
3. If the topic is controversial or theoretical, present it as such, not as absolute fact.
4. If the topic is completely nonsensical or you lack sufficient verifiable information, provide a polite "Step 1" explaining the limitation instead of hallucinating content.

Break the topic down into ${stepsConfig[level]} clear, progressive learning steps. Each step must be a self-contained lesson that builds upon the previous one. Use a conversational, encouraging, and storytelling tone.

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

Now, create this detailed, step-by-step learning guide for: ${topic} at the ${level} level.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) throw new Error('No content received from API');

    let parsedResponse = null;
    
    // 1. Try JSON parse
    try {
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        const jsonStr = content.substring(start, end + 1);
        const parsed = JSON.parse(jsonStr);
        if (parsed.steps && Array.isArray(parsed.steps)) {
          parsedResponse = parsed;
        }
      }
    } catch (e) {
      console.warn('JSON parse failed', e);
    }

    // 2. Try Fallback Regex
    if (!parsedResponse) {
        parsedResponse = parseJsonFallback(content);
    }

    // 3. Last resort: text parser
    if (!parsedResponse) {
        parsedResponse = parseTextResponse(content);
    }

    res.json(parsedResponse);

  } catch (error) {
    console.error('Error in /api/learn:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.post('/api/chat', async (req, res) => {
  const { topic, currentStepTitle, currentStepContent, question, history } = req.body;

  if (!genAI) {
    return res.status(500).json({ error: 'Server API Key Missing' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    // Construct simplified history for context
    const historyContext = history.map(msg => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`).join('\n');

    const prompt = `You are an expert tutor helping a student learn about "${topic}".
    
The student is currently on the step: "${currentStepTitle}".
Here is the content they are looking at:
"""
${currentStepContent.substring(0, 1000)}... (truncated for context)
"""

Conversation History:
${historyContext}

Student Question: "${question}"

Goal: meaningful, deep explanation resolving the user's specific query about this part of the lesson.
Provide a clear, concise, and accurate answer using Markdown. If they ask for examples, provide them.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ answer: response.text() });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to get answer' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
