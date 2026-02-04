# 🚀 Deployment Guide - Host LearnMate for FREE

## Why Vercel?

- ✅ **100% Free** for personal projects
- ✅ **Zero Configuration** - works out of the box
- ✅ **Automatic HTTPS** - secure by default
- ✅ **Global CDN** - fast worldwide
- ✅ **Automatic Deployments** - push to GitHub = instant deploy
- ✅ **Environment Variables** - secure API key storage

## Method 1: Deploy via Vercel Dashboard (Easiest)

### Prerequisites:
- GitHub account
- Vercel account (free - sign up with GitHub)

### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - LearnMate"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/LearnMate.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects settings (no config needed!)
   - Click "Deploy"

3. **Add Environment Variables** (for full AI functionality)
   - Go to Project Settings → Environment Variables
   - Add key: `VITE_GEMINI_API_KEY`
   - Add value: your Google Gemini API key
   - Click "Save"
   - Redeploy the project

4. **Done!** 🎉
   - Your app is live at: `your-project.vercel.app`
   - Share the link with friends!

## Method 2: Deploy via CLI (For Developers)

### Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? **learnmate** (or any name)
   - In which directory is your code? **./** 
   - Want to override settings? **N**

4. **Add Environment Variables**
   ```bash
   vercel env add VITE_GEMINI_API_KEY
   ```
   Enter your API key when prompted

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

## Method 3: Other Free Hosting Options

### Netlify (Alternative to Vercel)

1. **Build your app**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to https://netlify.com
   - Drag and drop the `dist` folder
   - Or connect your GitHub repo
   - Add environment variables in Site Settings

### GitHub Pages (Static Hosting)

1. **Update `vite.config.ts`**
   ```typescript
   export default defineConfig({
     plugins: [react()],
     base: '/LearnMate/', // Your repo name
   })
   ```

2. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add to package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**
   - Go to repo Settings → Pages
   - Source: gh-pages branch
   - Your site: `https://username.github.io/LearnMate`

## Environment Variables Security

### ⚠️ Important Notes:

1. **Frontend Exposure**: 
   - Variables starting with `VITE_` are exposed to the browser
   - This is okay for Gemini API keys
   - Set up API key restrictions in Google Cloud Console

2. **Better Security** (Optional):
   - Create a backend proxy (Next.js API routes, Cloudflare Workers)
   - Store API keys server-side
   - Frontend calls your backend, not Google directly

3. **Gemini Safety**:
   - Free tier has generous limits (1,500 requests/day)
   - Monitor usage at https://aistudio.google.com/app/apikey
   - Set up API restrictions for your domain only

## Custom Domain (Optional)

### On Vercel:

1. **Add Domain**
   - Project Settings → Domains
   - Add your domain
   - Update DNS records as instructed

2. **Free Options**:
   - Get free domain from: Freenom, .tk, .ml domains
   - Or buy from: Namecheap, Google Domains (~$10/year)

## Continuous Deployment

### Auto-Deploy on Push:

1. **Connect GitHub to Vercel** (done in Method 1)

2. **Every push to main branch**:
   - Vercel automatically builds
   - Runs tests (if configured)
   - Deploys new version
   - Previous versions saved

3. **Preview Deployments**:
   - Every PR gets its own preview URL
   - Test changes before merging
   - Share with team/friends

## Monitoring & Analytics

### Vercel Analytics (Free):

```bash
npm install @vercel/analytics
```

Add to `src/main.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>,
)
```

## Troubleshooting Deployment

### Build Fails?

1. **Check Node Version**
   - Vercel uses Node 18 by default
   - Set in `package.json`: `"engines": { "node": "18.x" }`

2. **TypeScript Errors**
   - Run `npm run build` locally first
   - Fix all errors before deploying

3. **Missing Dependencies**
   - Ensure all deps in `package.json`
   - Not just devDependencies

### API Key Not Working?

1. **Check Variable Name**: Must be exact: `VITE_GEMINI_API_KEY`
2. **Redeploy**: Changes require redeploy
3. **Check Logs**: Vercel dashboard → Deployments → Function logs
4. **Verify Key**: Make sure it starts with `AIza`

### App Not Loading?

1. **Check Build Output**: Should create `dist` folder
2. **Check Console**: Browser dev tools for errors
3. **Check Vercel Logs**: Deployment logs in dashboard

## Cost Tracking

### Vercel (Hosting):
- **Free Tier**: 100 GB bandwidth/month
- **Enough for**: Thousands of users
- **Upgrade**: Only if you exceed limits

### Google Gemini (API):
- **Free Tier**: 1,500 requests/day (forever!)
- **No Credit Card**: Required
- **Enough for**: Heavy personal use

### Total Cost: **$0/month** for most users! 🎉

## Performance Optimization

### For Production:

1. **Enable Caching**
   - Vite automatically optimizes
   - Vercel CDN caches static assets

2. **Lazy Loading** (Already implemented)
   - Components load on-demand
   - Faster initial page load

3. **Image Optimization** (If you add images)
   ```bash
   npm install sharp
   ```

## Going Live Checklist

- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables added
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled (optional)
- [ ] Test all features on live site
- [ ] Share with friends! 🎉

## Support

Need help deploying?
- Vercel Docs: https://vercel.com/docs
- Google AI Studio: https://aistudio.google.com
- GitHub Issues: Open one on your repo

---

**Ready to deploy?** Follow Method 1 above and go live in 5 minutes! 🚀

Your app will be available at: `https://your-project.vercel.app`
