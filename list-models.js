// List available models
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyD4Yad0U3zsfwsbB4l81fAyY_zKKwtPqGQ';

async function listModels() {
  console.log('Checking available models for your API key...\n');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Try different model names that are commonly available
    const modelsToTry = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.0-pro',
      'gemini-1.5-flash',
      'gemini-flash'
    ];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`Testing ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say 'Hi!'");
        const response = await result.response;
        console.log(`✅ ${modelName} works!`);
        console.log(`Response: ${response.text()}\n`);
      } catch (error) {
        console.log(`❌ ${modelName} not available`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();
