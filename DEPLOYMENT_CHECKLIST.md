# QRious Deployment Checklist

## Pre-Deployment

### Frontend (Netlify)
- [ ] Code is committed and pushed to Git repository
- [ ] `frontend/package.json` has all dependencies listed
- [ ] Build command works locally: `cd frontend && npm run build`
- [ ] No TypeScript or linting errors
- [ ] Environment variable `VITE_API_BASE_URL` is ready (you'll set this in Netlify after backend is deployed)

### Backend
- [ ] Backend code is committed and pushed
- [ ] `backend/package.json` has all dependencies
- [ ] Backend runs successfully locally
- [ ] Environment variables documented
- [ ] CORS middleware configured for production origins

## Deployment Steps

### Step 1: Deploy Backend First

1. [ ] Choose hosting platform (Railway, Render, Fly.io, etc.)
2. [ ] Connect repository and configure service
3. [ ] Set all environment variables:
   - [ ] `PORT=3001`
   - [ ] `NODE_ENV=production`
   - [ ] `ALLOWED_ORIGINS=https://your-netlify-site.netlify.app` (update after frontend deploy)
   - [ ] `GOOGLE_SAFE_BROWSING_API_KEY` (optional)
   - [ ] `VIRUSTOTAL_API_KEY` (optional)
   - [ ] `CACHE_TTL_HOURS=1`
   - [ ] `RATE_LIMIT_REQUESTS_PER_MINUTE=100`
   - [ ] `MAX_REDIRECT_DEPTH=10`
   - [ ] `REQUEST_TIMEOUT_MS=5000`
4. [ ] Deploy backend
5. [ ] Test backend health endpoint: `https://your-backend-url.com/health`
6. [ ] Test API endpoint: `POST https://your-backend-url.com/api/analyze`
7. [ ] **Save backend URL** for frontend configuration

### Step 2: Deploy Frontend (Netlify)

1. [ ] Go to Netlify dashboard
2. [ ] Import Git repository
3. [ ] Configure build settings:
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`
   - Node version: `20`
4. [ ] Set environment variable:
   - `VITE_API_BASE_URL=https://your-backend-url.com`
5. [ ] Deploy frontend
6. [ ] Get frontend URL: `https://your-site-name.netlify.app`
7. [ ] **Update backend `ALLOWED_ORIGINS`** with frontend URL

### Step 3: Update Backend CORS

1. [ ] Go to backend hosting platform
2. [ ] Update environment variable:
   - `ALLOWED_ORIGINS=https://your-site-name.netlify.app,https://your-custom-domain.com`
3. [ ] Redeploy backend (if needed)

## Post-Deployment Testing

### Functional Tests
- [ ] Frontend loads without errors
- [ ] Camera permission prompt appears
- [ ] QR code scanning works
- [ ] URL expansion works
- [ ] Analysis completes successfully
- [ ] Trust score displays correctly
- [ ] Copy URL button works
- [ ] "Scan Again" works

### Mobile Tests
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test on different screen sizes
- [ ] Touch interactions work smoothly
- [ ] Text is readable on mobile
- [ ] Buttons are easily tappable (44px minimum)
- [ ] Camera works on mobile
- [ ] No horizontal scrolling issues

### Performance Tests
- [ ] Page loads quickly (< 3 seconds)
- [ ] Animations are smooth
- [ ] No console errors
- [ ] API responses are fast
- [ ] QR scanning is responsive

### Security Tests
- [ ] HTTPS is enabled (required for camera)
- [ ] CORS is configured correctly
- [ ] No sensitive data in client-side code
- [ ] CSP headers are working
- [ ] Rate limiting is active

## Troubleshooting

### Camera Not Working
- [ ] Verify site is served over HTTPS
- [ ] Check browser console for permission errors
- [ ] Verify CSP allows camera access
- [ ] Test on actual mobile device (not emulator)

### API Connection Errors
- [ ] Verify `VITE_API_BASE_URL` is correct
- [ ] Check backend CORS settings
- [ ] Test backend endpoints directly
- [ ] Check network tab for CORS errors
- [ ] Verify backend is running

### Build Errors
- [ ] Check Node.js version (20+)
- [ ] Verify all dependencies installed
- [ ] Check build logs for specific errors
- [ ] Try building locally first

### Mobile Layout Issues
- [ ] Check viewport meta tag
- [ ] Verify responsive classes (sm:, md:, etc.)
- [ ] Test on actual devices, not just browser DevTools
- [ ] Check for fixed widths that break mobile layout

## Optimization

### Performance
- [ ] Enable gzip compression
- [ ] Use CDN for static assets
- [ ] Optimize images (if any)
- [ ] Enable browser caching
- [ ] Monitor bundle size

### SEO (if needed)
- [ ] Add meta descriptions
- [ ] Add Open Graph tags
- [ ] Add Twitter Card tags
- [ ] Submit sitemap (if applicable)

## Monitoring

Set up monitoring for:
- [ ] Backend uptime
- [ ] API response times
- [ ] Error rates
- [ ] User analytics (optional)
- [ ] Rate limit hits

## Notes

- Always test on actual mobile devices, not just browser DevTools
- HTTPS is required for camera access - ensure both frontend and backend use HTTPS
- Keep backend URL secure and don't expose it unnecessarily
- Regularly update dependencies for security patches
- Monitor rate limiting to prevent abuse

