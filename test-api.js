// Test script for Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyD4Yad0U3zsfwsbB4l81fAyY_zKKwtPqGQ';

async function testGeminiAPI() {
  console.log('Testing Gemini API...');
  console.log('API Key:', apiKey.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('Sending test request...');
    const result = await model.generateContent("Say 'Hello, this API key works!'");
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS! API key is working!');
    console.log('Response:', text);
    
  } catch (error) {
    console.error('\n❌ ERROR: API key is not working');
    console.error('Error details:', error);
    
    if (error.message) {
      console.error('Error message:', error.message);
    }
    
    // Common issues
    console.log('\n🔍 Possible reasons:');
    console.log('1. API key is invalid or expired');
    console.log('2. API key has restrictions (IP, domain, API)');
    console.log('3. Gemini API is not enabled for this key');
    console.log('4. Rate limit exceeded');
    console.log('5. Network/firewall blocking the request');
    
    console.log('\n🔧 To fix:');
    console.log('1. Go to: https://aistudio.google.com/app/apikey');
    console.log('2. Delete the old key and create a NEW one');
    console.log('3. Make sure "Generative Language API" is enabled');
    console.log('4. Try the new key');
  }
}

testGeminiAPI();
