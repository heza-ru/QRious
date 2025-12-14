# Netlify Deployment Fix

## Issue
The build was failing because TypeScript (`tsc`) was not found. This happened because Netlify was not installing devDependencies by default.

## Solution Applied

Updated `netlify.toml` with the following changes:

1. **Added NPM_FLAGS environment variable** to ensure devDependencies are installed:
   ```toml
   NPM_FLAGS = "--include=dev"
   ```

2. **Set NPM_CONFIG_PRODUCTION to false** as an additional safeguard:
   ```toml
   NPM_CONFIG_PRODUCTION = "false"
   ```

3. **Explicitly install dependencies** in the build command:
   ```toml
   command = "cd frontend && npm install && npm run build"
   ```

## Why This Works

- Netlify by default sets `NODE_ENV=production`, which causes `npm install` to skip devDependencies
- The `NPM_FLAGS = "--include=dev"` tells npm to include devDependencies regardless of NODE_ENV
- The explicit `npm install` in the build command ensures dependencies are installed in the `frontend` directory
- TypeScript is listed in devDependencies, so it will now be available during the build

## Verification

After deploying, the build should now:
1. Install all dependencies including devDependencies
2. Run TypeScript type checking (`tsc`)
3. Build the Vite application (`vite build`)
4. Deploy successfully

## Alternative Solution (if needed)

If you want to skip type-checking during build for faster builds, you can modify `frontend/package.json`:

```json
"scripts": {
  "build": "vite build"
}
```

However, keeping type-checking is recommended for production builds.

