# 🚀 Deployment Guide - Backend (Render) + Frontend (GitHub Pages)

This guide helps you deploy LearnMate securely by keeping your API Key on a backend server.

## Architecture
- **Backend (Node.js):** Hosted on Render.com. Handles API requests to Google Gemini.
- **Frontend (React):** Hosted on GitHub Pages. Sends requests to your Backend.

---

## 1. Deploy Backend to Render

1.  **Push your code to GitHub.**
2.  Go to [Render Dashboard](https://dashboard.render.com/) -> **New +** -> **Web Service**.
3.  Connect your `LearnMate` repository.
4.  **Configure the Service**:
    *   **Root Directory**: `backend` (Important! This tells Render where the server code lives).
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
    *   **Environment Variables**:
        *   Add `GEMINI_API_KEY` with your actual Google API key.
5.  Click **Create Web Service**.
6.  Once deployed, **copy the URL** (e.g., `https://learnmate-backend.onrender.com`).

---

## 2. Deploy Frontend to GitHub Pages

1.  **Configure Frontend with Backend URL**:
    Run the deployment command in your local terminal, but inject your new Render URL:
    
    ```bash
    # Replace the URL below with your actual Render URL
    VITE_BACKEND_URL=https://your-app-name.onrender.com npm run deploy
    ```

    *This command builds the React app, telling it to talk to your specific backend, and uploads the files to GitHub.*

2.  **Verify Deployment**:
    *   Go to `https://<your-username>.github.io/LearnMate/`.
    *   Try generating a lesson. It should work without exposing your API key in the browser/network tab!

## Troubleshooting
- **CORS Errors?** The backend is configured to accept all origins (`cors()`). If you face issues, check the Network tab in browser dev tools.
- **Blank Screen?** Ensure your repository name is exactly `LearnMate` (case sensitive). If it's different, update `base: '/RepoName/'` in `vite.config.ts` and redeploy.


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
