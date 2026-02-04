# 🎓 LearnMate - Quick Setup Guide

## You're Almost Ready! 🚀

Your AI-powered learning tool is set up and running at: **http://localhost:5173**

## 📝 Next Steps

### Step 1: Get Your Free API Key (Optional but Recommended)

**Google Gemini - 100% FREE (Recommended!)**
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza`)
5. **No credit card required!**
6. **Free tier includes:**
   - 60 requests per minute
   - 1,500 requests per day
   - Unlimited forever!

**Or Use Demo Mode**
- The app works without an API key!
- It will use pre-generated learning steps
- Perfect for testing

### Step 2: Add Your API Key

1. Open the `.env` file in this directory
2. Replace the empty value with your API key:
   ```env
   VITE_GEMINI_API_KEY=AIza-your-actual-api-key-here
   ```
3. Save the file
4. Restart the dev server (the app will reload automatically)

### Step 3: Try It Out!

1. Open http://localhost:5173 in your browser
2. Enter a topic you want to learn (e.g., "React Hooks")
3. Click "Start Learning"
4. Follow the step-by-step guide
5. Mark steps as complete as you progress
6. Check the "History" tab to see your saved sessions

## 🌐 Deploy to Vercel (100% Free!)

### Quick Deploy:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (it's that simple!)
vercel

# Follow the prompts, and you're live in 30 seconds!
```

### Add Your API Key on Vercel:
1. Go to your project dashboard on vercel.com
2. Settings → Environment Variables
3. Add: `VITE_GEMINI_API_KEY` with your key
4. Redeploy

## 💡 Features You Can Use:

✅ **AI-Generated Learning Paths** - Custom learning plans for any topic
✅ **Progress Tracking** - Mark steps complete and track your progress
✅ **Auto-Save** - All sessions saved automatically in your browser
✅ **Learning History** - Review past topics anytime
✅ **Beautiful UI** - Modern, responsive design
✅ **Zero Backend** - Everything runs in your browser!

## 🎯 Example Topics to Try:

- "React Hooks"
- "Machine Learning Basics"
- "JavaScript Promises"
- "CSS Grid Layout"
- "Python for Data Science"
- "Docker Containers"
- "Learning Spanish"
- "Personal Finance"

## 💰 Cost Breakdown:

**With Google Gemini (Recommended):**
- Each learning session: **$0**
- API calls per day: **1,500 FREE**
- Hosting: **$0** (Vercel free tier)
- **Total: $0 forever!** 🎉

**Without API Key (Demo Mode):**
- Everything: **$0**
- Unlimited sessions
- Still saves your progress!

## 🛠️ Troubleshooting:

**App won't start?**
- Make sure Node.js is installed: `node --version`
- Try: `npm install` then `npm run dev`

**API errors?**
- Check your API key in `.env`
- Verify you're using a valid Gemini API key (starts with `AIza`)
- Check quota: https://aistudio.google.com/app/apikey
- Try demo mode by leaving `.env` empty

**Changes not showing?**
- Save your files
- The app will auto-reload
- Check the terminal for errors

## 📚 Learn More:

- Full documentation in `README.md`
- Code is well-commented - explore `src/` folder
- Customize in `tailwind.config.js` for styling
- Modify AI prompts in `src/services/ai.ts`

## 🤝 Need Help?

- Check the README.md for detailed info
- Review the code - it's designed to be readable!
- Open an issue on GitHub

---

**You're all set!** Open http://localhost:5173 and start learning! 🎓✨
