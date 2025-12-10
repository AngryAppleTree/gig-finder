# GigFinder Deployment Guide - AWS Amplify + IONOS Domain

## Prerequisites
- AWS Account
- GitHub account (to push your code)
- IONOS domain
- Skiddle API key

## Step 1: Prepare Your Code

### 1.1 Add all files to git
```bash
cd /Users/alexanderbunch/App\ dummy/gig-finder/gig-finder-app
git add .
git commit -m "Ready for deployment - GigFinder prototype"
```

### 1.2 Create a GitHub repository
1. Go to https://github.com/new
2. Create a new repository called `gigfinder`
3. Don't initialize with README (you already have code)

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/gigfinder.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to AWS Amplify

### 2.1 Create Amplify App
1. Go to AWS Console → AWS Amplify
2. Click "New app" → "Host web app"
3. Choose "GitHub" as your repository service
4. Authorize AWS Amplify to access your GitHub
5. Select your `gigfinder` repository
6. Select the `main` branch

### 2.2 Configure Build Settings
Amplify should auto-detect Next.js. Verify the build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### 2.3 Add Environment Variables
In Amplify console:
1. Go to "Environment variables"
2. Add: `SKIDDLE_API_KEY` = `your_api_key_here`
3. Save

### 2.4 Deploy
1. Click "Save and deploy"
2. Wait for build to complete (~5 minutes)
3. You'll get a URL like: `https://main.d1234abcd.amplifyapp.com`

## Step 3: Connect Your IONOS Domain

### 3.1 In AWS Amplify
1. Go to your app → "Domain management"
2. Click "Add domain"
3. Enter your IONOS domain (e.g., `gigfinder.com`)
4. Amplify will provide you with DNS records

### 3.2 In IONOS
1. Log into your IONOS account
2. Go to Domains → Your domain → DNS settings
3. Add the DNS records provided by Amplify:
   - Type: CNAME
   - Name: www (or @)
   - Value: (the Amplify URL provided)
4. Save changes

### 3.3 Wait for DNS Propagation
- Can take 5 minutes to 48 hours
- Usually works within 30 minutes

## Step 4: Test Your Deployment

1. Visit your Amplify URL
2. Test the quiz flow
3. Verify Skiddle API is working (check for real gigs)
4. Test all genre filters
5. Test ticket links

## Alternative: Deploy to Vercel (Easier & Free)

If you prefer Vercel (recommended for Next.js):

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /Users/alexanderbunch/App\ dummy/gig-finder/gig-finder-app
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: gigfinder
# - Directory: ./
# - Override settings? No

# Add environment variable
vercel env add SKIDDLE_API_KEY
# Paste your API key when prompted
# Select: Production

# Deploy to production
vercel --prod
```

### Connect IONOS Domain to Vercel
1. In Vercel dashboard → Your project → Settings → Domains
2. Add your IONOS domain
3. Vercel will provide DNS records
4. Add them in IONOS DNS settings
5. Wait for verification

## Troubleshooting

### Build Fails
- Check that `SKIDDLE_API_KEY` is set in environment variables
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### API Not Working
- Verify environment variable is set correctly
- Check API route is accessible at `/api/events`
- Test locally first: `npm run build && npm start`

### Domain Not Connecting
- DNS changes can take up to 48 hours
- Verify CNAME records are correct
- Try clearing browser cache
- Use https://dnschecker.org to verify propagation

## Post-Deployment Checklist

- [ ] App loads at custom domain
- [ ] Quiz flow works end-to-end
- [ ] Skiddle API returns real gigs
- [ ] Genre filtering works (test classical, rock, etc.)
- [ ] Ticket links work
- [ ] Mobile responsive design works
- [ ] Privacy/Terms/Contact pages load
- [ ] Footer links work

## Updating the App

After making changes:
```bash
git add .
git commit -m "Description of changes"
git push

# Amplify will auto-deploy
# Or for Vercel: vercel --prod
```

## Cost Estimate

### AWS Amplify
- Free tier: 1000 build minutes/month
- After: ~$0.01 per build minute
- Hosting: ~$0.15/GB served
- Estimated: $0-5/month for prototype

### Vercel (Recommended)
- Hobby plan: FREE
- Unlimited bandwidth
- Perfect for prototypes

## What URL Did You Buy?

Please provide your IONOS domain name so I can give you specific DNS instructions!
