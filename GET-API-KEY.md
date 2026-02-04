# 🔑 Get Your FREE Google Gemini API Key

## Quick Steps (2 minutes)

1. **Visit Google AI Studio**
   ```
   👉 https://aistudio.google.com/app/apikey
   ```

2. **Sign In**
   - Use your Google account (Gmail)
   - No credit card required!

3. **Create API Key**
   - Click "Create API Key" button
   - Select "Create API key in new project" (or choose existing)
   - Click "Create"

4. **Copy Your Key**
   - Your key starts with `AIza...`
   - Copy it to clipboard

5. **Add to LearnMate**
   - Open `.env` file in project root
   - Add this line:
   ```
   VITE_GEMINI_API_KEY=AIza...your-key-here...
   ```
   - Save the file
   - Restart dev server (Ctrl+C then `npm run dev`)

## ✅ Done!

You now have:
- ✅ 1,500 free requests per day
- ✅ 60 requests per minute
- ✅ FREE forever (no credit card ever)
- ✅ Full AI-powered learning

## 🔒 Keep Your Key Safe

**DO:**
- ✅ Add `.env` to `.gitignore` (already done!)
- ✅ Use environment variables
- ✅ Set API restrictions in Google Cloud Console

**DON'T:**
- ❌ Commit `.env` to git
- ❌ Share your key publicly
- ❌ Hardcode in source files

## 📊 Check Your Usage

Monitor your API usage:
```
👉 https://aistudio.google.com/app/apikey
```

## 🆘 Troubleshooting

**Key not working?**
- Make sure it starts with `AIza`
- Check for extra spaces in `.env`
- Restart dev server after adding key

**Rate limit hit?**
- Free tier: 60 requests/minute, 1,500/day
- Wait a minute and try again
- Very generous for personal use!

**Need more quota?**
- Free tier is usually more than enough
- For production apps, consider upgrading
- Or implement caching/rate limiting

## 🎓 You're Ready!

Your LearnMate app is now powered by Google's latest AI - completely free!

**Test it:**
1. Open http://localhost:5173
2. Enter a topic: "React Hooks"
3. Click "Start Learning"
4. Watch the magic happen! ✨

---

**Questions?** Check SETUP.md or README.md for more details.
