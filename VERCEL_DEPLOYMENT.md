# Vercel Deployment Guide - ONE PERCENT EDGE

## Quick Start

### 1. Prerequisites
- Vercel account (https://vercel.com)
- Upstash account for Redis KV storage (https://upstash.com)
- GitHub account (optional, but recommended for easy deployment)

### 2. Set Up Upstash Redis KV

1. Go to https://upstash.com and create a free account
2. Create a new Redis database
3. Copy the REST URL and REST Token
4. Keep these handy for environment variables

### 3. Deploy to Vercel

#### Option A: Using GitHub (Recommended)

```bash
# 1. Push your repository to GitHub
git push origin main

# 2. Go to https://vercel.com/new
# 3. Import your GitHub repository
# 4. Select deployment settings
# 5. Click "Environment Variables" and add:
```

#### Option B: Using Vercel CLI

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from your project directory
vercel

# 4. Follow the prompts and add environment variables
```

### 4. Configure Environment Variables

In Vercel project settings, add these variables:

```
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
AUTH_SESSION_SECRET=generate-a-secure-random-string
AUTH_PASSWORD_SALT=generate-another-secure-string
ADMIN_EMAILS=admin@example.com
ADMIN_PANEL_KEY=your-admin-key
GROQ_API_KEY=your_groq_api_key
```

**Optional OAuth Variables:**
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
```

### 5. Configure OAuth Redirect URIs

If using OAuth, update your provider settings:

- **Google**: Add redirect URI: `https://your-domain.vercel.app/auth/callback/google`
- **GitHub**: Add redirect URI: `https://your-domain.vercel.app/auth/callback/github`
- **Facebook**: Add redirect URI: `https://your-domain.vercel.app/auth/callback/facebook`

### 6. Test Deployment

After deployment completes:

```bash
# Test the API
curl https://your-domain.vercel.app/stocks

# Test authentication
curl https://your-domain.vercel.app/auth/session

# Test status
curl https://your-domain.vercel.app/status
```

## Architecture Changes for Vercel

### What Changed:
1. **Persistent Storage**: In-memory DB → Upstash Redis KV
2. **Deployment**: Local Uvicorn → Vercel Serverless Functions
3. **Frontend**: Served from Vercel CDN
4. **Backend**: Available at `/api/*` routes

### What Stayed the Same:
- All API endpoints
- Frontend UI/UX
- Authentication flows
- Data models and logic
- Market engine functionality

## Project Structure for Vercel

```
project/
├── api/
│   └── index.py              # Vercel serverless handler
├── backend/
│   ├── api.py                # FastAPI application
│   ├── engine.py             # Market engine logic
│   ├── edge.py               # Edge detection
│   └── kv_adapter.py         # KV storage adapter (NEW)
├── data/
│   └── generator.py          # Market data generator
├── frontend/                 # Static files
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── ...
├── vercel.json               # Vercel configuration (NEW)
├── .env.example              # Environment template (NEW)
├── requirements.txt          # Updated with redis/upstash
└── ...
```

## Local Development (Before Deployment)

### Without Upstash (In-Memory Only):
```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
python -m uvicorn backend.api:app --reload
```

### With Upstash Redis (Simulate Production):
```bash
# Set Upstash credentials
export UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
export UPSTASH_REDIS_REST_TOKEN=your_token_here

# Run locally
python -m uvicorn backend.api:app --reload
```

## Troubleshooting

### Issue: Redis connection fails
- **Solution**: Check UPSTASH_REDIS_REST_URL and token are correct
- **Fallback**: App will auto-fallback to in-memory storage (won't persist across function calls)

### Issue: Static files not loading
- **Solution**: Ensure `frontend/` directory is in root folder
- **Check**: Vercel deployment logs for static file mounting errors

### Issue: Environment variables not working
- **Solution**: Redeploy after updating variables in Vercel dashboard
- **Check**: Use `vercel env list` to verify variables are set

### Issue: API timeouts after 120 seconds
- **Note**: Vercel function timeout is 60-120s depending on plan
- **Solution**: Optimize heavy operations or upgrade to Pro plan

## Performance Tips

1. **Enable Redis Caching**: Market data is cached automatically
2. **CDN for Frontend**: Vercel CDN automatically serves static files
3. **Database Indexes**: Upstash Redis is optimized for fast lookups
4. **Function Optimization**: Market engine respects serverless constraints

## Costs

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Upstash Redis**: Free tier includes 10GB storage, unlimited requests
- **Groq API**: Check groq.com for API costs

## Next Steps

1. Deploy to Vercel following steps above
2. Monitor logs: `vercel logs [deployment-url]`
3. Set up error tracking (optional): Sentry, LogRocket, etc.
4. Configure custom domain (optional)

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Upstash Docs**: https://upstash.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com

## Rollback

To rollback to a previous deployment:
1. Go to Vercel project dashboard
2. Click "Deployments"
3. Find previous deployment
4. Click "…" menu → "Promote to Production"
