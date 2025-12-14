# Deployment Guide for QRious

## Netlify Frontend Deployment

### Quick Setup

1. **Prepare your repository**
   - Ensure all code is committed and pushed to your Git repository

2. **Deploy to Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider (GitHub, GitLab, Bitbucket)
   - Select your QRious repository

3. **Configure build settings**
   ```
   Base directory: (leave empty or use root)
   Build command: cd frontend && npm install && npm run build
   Publish directory: frontend/dist
   ```

4. **Set environment variables**
   In Netlify Dashboard → Site settings → Environment variables, add:
   ```
   VITE_API_BASE_URL=https://your-backend-api-url.com
   ```
   Replace with your actual backend API URL.

5. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your frontend
   - Your site will be available at `https://your-site-name.netlify.app`

### Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow Netlify's instructions to configure DNS

## Backend Deployment Options

The backend needs to be deployed separately since Netlify Functions don't support Bun runtime.

### Option 1: Railway (Recommended)

1. **Sign up at [Railway](https://railway.app/)**
2. **Create a new project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your QRious repository

3. **Configure service**
   - Root directory: `backend`
   - Build command: `bun install`
   - Start command: `bun run src/server.ts`

4. **Set environment variables**
   - Add all required environment variables from `.env.example`

5. **Get your backend URL**
   - Railway will provide a URL like `https://your-app.up.railway.app`
   - Use this URL for `VITE_API_BASE_URL` in Netlify

### Option 2: Render

1. **Sign up at [Render](https://render.com/)**
2. **Create a new Web Service**
   - Connect your GitHub repository
   - Name: `qrious-backend`
   - Root Directory: `backend`
   - Environment: `Docker` (or use Node.js if Bun isn't available)
   - Build Command: `bun install`
   - Start Command: `bun run src/server.ts`

3. **Set environment variables**
   - Add all required environment variables

4. **Deploy**
   - Render will build and deploy your backend
   - Get the URL and use it for `VITE_API_BASE_URL`

### Option 3: Fly.io

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly.io**
   ```bash
   fly auth login
   ```

3. **Create a Fly app**
   ```bash
   cd backend
   fly launch
   ```

4. **Configure and deploy**
   - Follow the prompts
   - Set environment variables: `fly secrets set KEY=value`

5. **Get your backend URL**
   - Use the provided URL for `VITE_API_BASE_URL`

### Option 4: DigitalOcean App Platform

1. **Create a new App on DigitalOcean**
2. **Connect your GitHub repository**
3. **Configure**
   - Root directory: `backend`
   - Build command: `bun install`
   - Run command: `bun run src/server.ts`

4. **Set environment variables**
   - Add all required variables in the App settings

## Environment Variables

### Frontend (Netlify)

```
VITE_API_BASE_URL=https://your-backend-url.com
```

### Backend (Railway/Render/etc.)

```
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://your-netlify-site.netlify.app,https://your-custom-domain.com
GOOGLE_SAFE_BROWSING_API_KEY=your_key_here
VIRUSTOTAL_API_KEY=your_key_here
CACHE_TTL_HOURS=1
RATE_LIMIT_REQUESTS_PER_MINUTE=100
MAX_REDIRECT_DEPTH=10
REQUEST_TIMEOUT_MS=5000
```

**Important**: Replace `ALLOWED_ORIGINS` with your actual Netlify frontend URL(s). Use comma-separated values for multiple origins.

## Post-Deployment Checklist

- [ ] Backend is deployed and accessible
- [ ] Frontend `VITE_API_BASE_URL` points to backend
- [ ] Environment variables are set correctly
- [ ] HTTPS is enabled (required for camera access)
- [ ] Test QR scanning on mobile device
- [ ] Verify API endpoints are working
- [ ] Check CORS settings allow your frontend domain
- [ ] Test on different mobile devices/browsers

## Troubleshooting

### Camera not working
- Ensure site is served over HTTPS
- Check browser permissions for camera access
- Verify CSP headers allow camera access

### API connection errors
- Verify `VITE_API_BASE_URL` is correct
- Check backend CORS settings allow frontend domain
- Verify backend is running and accessible

### Build errors
- Ensure Node.js version is 20+
- Check all dependencies are installed
- Review build logs for specific errors

## Mobile Testing

After deployment, test on mobile devices:

1. **Open the deployed site on your mobile device**
2. **Grant camera permissions when prompted**
3. **Test QR code scanning**
4. **Verify all screens display correctly**
5. **Test touch interactions**

Consider creating a QR code for easy mobile access during testing.

