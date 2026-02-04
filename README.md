# LearnMate 🎓

An AI-powered learning tool that helps you learn any topic step-by-step. Built with React, TypeScript, and Tailwind CSS. Hosted completely free on Vercel!

![LearnMate Demo](https://img.shields.io/badge/demo-live-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 🤖 **AI-Powered Learning Paths**: Enter any topic and get a structured, step-by-step learning plan
- 📝 **Progress Tracking**: Mark steps as complete and track your learning progress
- 💾 **Automatic Summaries**: All learning sessions are automatically saved to localStorage
- 📚 **Learning History**: Review and revisit your past learning sessions anytime
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations
- 🆓 **100% Free Hosting**: Deploy to Vercel for free with zero configuration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key (completely FREE - no credit card required!)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/spoorthy-bhat-88/LearnMate.git
   cd LearnMate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Google Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your-api-key-here
   ```

   > **Get your FREE API key**: Go to https://aistudio.google.com/app/apikey (no credit card required!)
   > 
   > **Note**: If you don't have an API key, the app will run in demo mode with pre-generated learning steps.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🌐 Deploy to Vercel (Free!)

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add your environment variable: `VITE_GEMINI_API_KEY`
6. Click "Deploy"

### Option 2: Deploy via CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts, and your app will be live in seconds!

## 📖 How to Use

1. **Start Learning**: Enter any topic you want to learn (e.g., "React Hooks", "Machine Learning", "Spanish")
2. **Follow Steps**: Read through each learning step at your own pace
3. **Track Progress**: Mark steps as complete as you finish them
4. **Review Later**: Access your learning history anytime to review past sessions

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: Google Gemini 1.5 Flash (Free tier!)
- **Storage**: localStorage (no backend needed!)
- **Build Tool**: Vite
- **Hosting**: Vercel (free tier)

## 🎯 Features in Detail

### AI-Generated Learning Paths
The app uses Google Gemini 1.5 Flash to generate customized learning paths for any topic. Each path includes:
- Clear, progressive steps
- Practical examples
- Best practices
- Real-world applications

### Smart Progress Tracking
- Visual progress bars
- Step-by-step navigation
- Completion status for each step
- Overall progress percentage

### Persistent Storage
- All sessions automatically saved
- No account or login required
- Data stored locally in your browser
- Access your learning history anytime

## 💡 Cost-Effective Learning

### 100% Free Options:
1. **Demo Mode**: Works without API key using pre-generated content
2. **Google Gemini Free Tier**: 
   - **Completely FREE forever**
   - No credit card required
   - 60 requests per minute
   - 1,500 requests per day
   - That's 1,500 learning sessions per day for FREE!

### Estimated Costs:
- **With Gemini Free Tier**: $0 (unlimited learning!)
- **Demo Mode**: $0 (pre-generated content)
- **Vercel Hosting**: $0 (free tier)

**Total Cost: $0** 🎉

## 🔧 Configuration

### Using Alternative AI Providers

To use OpenAI instead of Gemini, modify `src/services/ai.ts`:

```typescript
// Replace Gemini import with OpenAI
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});
```

### Customizing Learning Steps

Edit `src/services/ai.ts` to modify:
- Number of steps generated (default: 5-7)
- Content depth and detail
- Step formatting and structure

## 📁 Project Structure

```
LearnMate/
├── src/
│   ├── components/
│   │   ├── LearningSession.tsx    # Main learning interface
│   │   └── SummaryHistory.tsx     # Learning history viewer
│   ├── services/
│   │   ├── ai.ts                  # AI integration
│   │   └── storage.ts             # localStorage utilities
│   ├── types.ts                   # TypeScript interfaces
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # App entry point
│   └── index.css                  # Global styles
├── public/                        # Static assets
├── index.html                     # HTML template
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── tailwind.config.js            # Tailwind CSS config
├── vite.config.ts                # Vite config
└── vercel.json                   # Vercel deployment config
```

## 🤝 Contributing

Contributions are welcome! Here are some ideas:

- [ ] Add authentication for cloud storage
- [ ] Support for multiple AI providers
- [ ] Export learning summaries as PDF
- [ ] Quiz generation for each topic
- [ ] Spaced repetition reminders
- [ ] Mobile app version

## 📄 License

MIT License - feel free to use this project for learning or building your own version!

## 🙏 Acknowledgments

- Google for the free Gemini API
- Vercel for free hosting
- The React and TypeScript communities

## 📧 Contact

Created by [@spoorthy-bhat-88](https://github.com/spoorthy-bhat-88)

---

**Happy Learning!** 🎓✨

If you find this project helpful, please consider giving it a ⭐️ on GitHub!
