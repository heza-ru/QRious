# QRious

QRious is a **production-ready QR code scanning and link safety application** with a premium dark UI aligned with CRED's design language. It allows users to inspect URLs safely before opening them by scanning QR codes, expanding shortened URLs, and analyzing them for security threats.

## Features

- **QR Code Scanning**: Real-time QR code scanning using device camera with Web Worker-based decoding
- **URL Expansion**: Automatically follows redirect chains to reveal final destination
- **Security Analysis**: Combined heuristic checks and external API integration (Google Safe Browsing, VirusTotal)
- **Trust Scoring**: Calculates trust scores (0-100) with clear verdicts (safe/suspicious/dangerous)
- **Premium UI**: Dark-first design with glassmorphism, smooth animations, and CRED-aligned aesthetics
- **No Auto-Open**: Links are never automatically opened - user must explicitly choose to proceed

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- @zxing/library for QR code scanning
- Phosphor Icons

### Backend
- Bun runtime
- Hono web framework
- TypeScript
- REST API architecture

## Prerequisites

- **Node.js 20+** or **Bun** (recommended)
- A modern web browser with camera access support (HTTPS required for camera access)
- (Optional) API keys for Google Safe Browsing and/or VirusTotal

## Mobile Optimized

QRious is fully optimized for mobile devices with:
- Responsive design that works on all screen sizes
- Touch-friendly interactions with proper touch targets (minimum 44px)
- Mobile-optimized viewport settings
- Camera-first experience for QR scanning
- Smooth animations optimized for mobile performance

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd QRious
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   # or
   bun install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   bun install
   ```

4. **Set up environment variables**

   Create a `.env` file in the root directory (or copy from `.env.example`):
   ```env
   # Frontend
   VITE_API_BASE_URL=http://localhost:3001

   # Backend
   PORT=3001
   NODE_ENV=development

   # URL Analysis APIs (optional - app works with heuristics only)
   GOOGLE_SAFE_BROWSING_API_KEY=your_key_here
   VIRUSTOTAL_API_KEY=your_key_here

   # Cache Configuration
   CACHE_TTL_HOURS=1

   # Rate Limiting
   RATE_LIMIT_REQUESTS_PER_MINUTE=100

   # URL Expansion
   MAX_REDIRECT_DEPTH=10
   REQUEST_TIMEOUT_MS=5000
   ```

## Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   bun run dev
   ```
   The backend will start on `http://localhost:3001`

2. **Start the frontend development server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   # or
   bun run dev
   ```
   The frontend will start on `http://localhost:3000`

3. **Open your browser**
   Navigate to `http://localhost:3000` and grant camera permissions when prompted.

   **Note**: For mobile testing, use HTTPS. You can use a tool like [ngrok](https://ngrok.com/) or test on a local network with your device's IP address.

### Production Build

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Build the backend**
   ```bash
   cd backend
   bun run build
   ```

3. **Start the production server**
   ```bash
   cd backend
   bun run start
   ```

## Deployment

### Netlify Deployment (Frontend)

The frontend is configured for easy deployment on Netlify:

1. **Connect your repository to Netlify**
   - Go to [Netlify](https://www.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository

2. **Configure build settings**
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/dist`
   - Node version: `20`

3. **Set environment variables** (in Netlify Dashboard → Site settings → Environment variables)
   - `VITE_API_BASE_URL`: Your backend API URL (e.g., `https://your-backend.com`)

4. **Deploy**
   - Netlify will automatically deploy on every push to your main branch

**Important**: The backend needs to be hosted separately as Netlify Functions don't support Bun runtime. Consider hosting the backend on:
- Railway
- Render
- Fly.io
- DigitalOcean App Platform
- Or any Node.js/Bun-compatible hosting service

### Backend Deployment

The backend can be deployed on any platform that supports Bun or Node.js:

1. **Railway/Render/Fly.io**
   - Connect your repository
   - Set build command: `cd backend && bun install`
   - Set start command: `bun run src/server.ts`
   - Configure environment variables as needed

2. **Update frontend API URL**
   - Update `VITE_API_BASE_URL` in Netlify environment variables to point to your deployed backend URL

### HTTPS Requirement

**Important**: Camera access requires HTTPS in production. Ensure both frontend and backend are served over HTTPS.

## Environment Variables

### Frontend

- `VITE_API_BASE_URL`: Base URL for the backend API (default: `http://localhost:3001`)

### Backend

- `PORT`: Server port (default: `3001`)
- `NODE_ENV`: Environment mode (`development` or `production`)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend origins for CORS (default: `http://localhost:3000` in development)
- `GOOGLE_SAFE_BROWSING_API_KEY`: (Optional) Google Safe Browsing API key for URL threat detection
- `VIRUSTOTAL_API_KEY`: (Optional) VirusTotal API key for additional threat detection
- `CACHE_TTL_HOURS`: Cache TTL for URL analysis results in hours (default: `1`)
- `RATE_LIMIT_REQUESTS_PER_MINUTE`: Rate limit per IP address (default: `100`)
- `MAX_REDIRECT_DEPTH`: Maximum redirect chain depth to follow (default: `10`)
- `REQUEST_TIMEOUT_MS`: Timeout for HTTP requests in milliseconds (default: `5000`)

## API Endpoints

### `POST /api/scan`
Extract URL from QR code data.

**Request:**
```json
{
  "qrData": "https://example.com",
  "url": "https://example.com" // optional, if URL is known directly
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "message": "URL extracted successfully"
}
```

### `POST /api/expand`
Expand a shortened URL and return the redirect chain.

**Request:**
```json
{
  "url": "https://bit.ly/example"
}
```

**Response:**
```json
{
  "finalUrl": "https://example.com/final",
  "redirectChain": [
    {
      "url": "https://bit.ly/example",
      "statusCode": 301,
      "method": "HEAD"
    },
    {
      "url": "https://example.com/final",
      "statusCode": 200,
      "method": "GET"
    }
  ],
  "depth": 1
}
```

### `POST /api/analyze`
Analyze URL safety and return trust score.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "trustScore": 85,
  "verdict": "safe",
  "reasons": [
    "No security issues detected",
    "HTTPS enabled",
    "Valid domain name"
  ],
  "expandedUrl": "https://example.com",
  "redirectChain": []
}
```

### `POST /api/scan-and-analyze`
Convenience endpoint that combines scan and analyze operations.

**Request:**
```json
{
  "qrData": "https://example.com"
}
```

**Response:**
Same as `/api/analyze` response with additional `url` field.

## Security Features

- **Content Security Policy (CSP)**: Strict CSP headers to prevent XSS attacks
- **Input Validation**: All inputs are validated using Zod schemas
- **URL Sanitization**: URLs are sanitized before processing
- **Rate Limiting**: Token bucket algorithm to prevent abuse
- **No Auto-Open**: Links are never automatically opened or redirected
- **HTTPS Enforcement**: Analysis enforces HTTPS for secure connections
- **Request Size Limits**: Maximum request body size of 1MB

## Design Philosophy

QRious is designed as a **private security concierge inside a luxury fintech app**. The interface feels like:

- Entering a quiet, dark, premium lounge
- Where information is revealed only when necessary
- And every interaction feels intentional and confident

**Visual behavior:**
- Nothing shouts, everything glides
- Motion replaces borders and dividers
- Color appears only when trust or danger is confirmed

## Project Structure

```
QRious/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API and utility services
│   │   ├── styles/        # CSS and Tailwind styles
│   │   └── utils/         # Utility functions
│   └── package.json
├── backend/           # Bun backend API
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── services/      # Business logic services
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

## Troubleshooting

### Camera Permission Issues
- Ensure your browser has camera permissions enabled
- Use HTTPS in production (required for camera access)
- Check browser console for permission errors

### QR Code Not Scanning
- Ensure good lighting conditions
- Hold the QR code steady within the frame
- Try adjusting the distance from the camera

### API Connection Errors
- Verify the backend server is running
- Check `VITE_API_BASE_URL` matches the backend port
- Check browser console for CORS errors

### Rate Limiting
- Default rate limit is 100 requests per minute per IP
- Adjust `RATE_LIMIT_REQUESTS_PER_MINUTE` in environment variables if needed

## License

[Your License Here]

## Contributing

[Contributing Guidelines Here]
