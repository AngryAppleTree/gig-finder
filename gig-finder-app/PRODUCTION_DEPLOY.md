# GigFinder Production Deployment Checklist

## Pre-Deployment: Environment Variables Setup

### Required Environment Variables for Vercel Production

You need to add these in **Vercel Dashboard → Project → Settings → Environment Variables**:

#### 1. **Database (CRITICAL)** ✅
```
POSTGRES_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```
- Get this from your **Neon dashboard** (gig-finder-prod database)
- This is the production database connection string
- **Without this, the app will not work!**

#### 2. **Authentication (CRITICAL)** ✅
```
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
```
- Get these from **Clerk Dashboard → API Keys**
- Make sure to use **LIVE** keys, not test keys
- Required for sign-in/sign-up functionality

#### 3. **Email (Optional but Recommended)** 📧
```
RESEND_API_KEY=re_...
EMAIL_FROM=gigs@yourdomain.com
```
- Get from **Resend.com** dashboard
- Used for sending booking confirmation emails
- App works without this, but users won't get emails

#### 4. **Skiddle API (Optional)** 🎫
```
SKIDDLE_API_KEY=your_key_here
```
- Used for fetching additional events from Skiddle
- App has fallback mock data if not provided
- Get from Skiddle API dashboard

---

## Deployment Steps

### Step 1: Merge develop to main
```bash
cd /Users/alexanderbunch/App\ dummy/gig-finder/gig-finder-app

# Make sure develop is up to date
git checkout develop
git pull origin develop

# Merge to main
git checkout main
git merge develop

# Push to main (triggers production deployment)
git push origin main
```

### Step 2: Verify Vercel Environment Variables

1. Go to **Vercel Dashboard**
2. Select your **gig-finder** project
3. Go to **Settings → Environment Variables**
4. Verify these are set for **Production**:
   - ✅ `POSTGRES_URL`
   - ✅ `CLERK_SECRET_KEY`
   - ✅ `CLERK_PUBLISHABLE_KEY`
   - ⚠️ `RESEND_API_KEY` (optional)
   - ⚠️ `EMAIL_FROM` (optional)
   - ⚠️ `SKIDDLE_API_KEY` (optional)

### Step 3: Trigger Deployment

If Vercel is connected to your `main` branch:
- **Automatic**: Push to main triggers deployment
- **Manual**: Go to Vercel Dashboard → Deployments → Redeploy

### Step 4: Initialize Production Database

After deployment, run the database setup:

1. Visit: `https://your-domain.com/api/setup-db`
2. This creates the `events` table
3. Visit: `https://your-domain.com/api/setup-db/ticketing`
4. This creates the `bookings` table

**Or use the Vercel CLI:**
```bash
# If you have the production POSTGRES_URL
vercel env pull .env.production.local
node scripts/init-db.js
```

### Step 5: Test Production

Visit your production URL and test:

- [ ] Homepage loads
- [ ] Sign in/Sign up works (Clerk)
- [ ] Wizard flow works
- [ ] QuickSearch works
- [ ] Results page displays correctly on mobile
- [ ] Results page displays correctly on desktop
- [ ] Admin login works
- [ ] Scrapers work (if admin)
- [ ] Booking system works (if enabled)

---

## Troubleshooting

### "Database connection failed"
- Check `POSTGRES_URL` is set correctly in Vercel
- Verify the Neon database is active
- Check the connection string format

### "Clerk authentication not working"
- Verify `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` are set
- Make sure you're using **LIVE** keys, not test keys
- Check Clerk dashboard for any domain restrictions

### "No events showing"
- Run `/api/setup-db` to create tables
- Check if scrapers have run (admin panel)
- Verify `POSTGRES_URL` is correct

### "Build fails on Vercel"
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Check for TypeScript errors

---

## Post-Deployment

### Run Scrapers
1. Log in as admin
2. Go to `/admin`
3. Click "Run Scrapers" for each venue
4. Verify events appear in database

### Monitor
- Check Vercel Analytics for traffic
- Monitor Neon database usage
- Check error logs in Vercel

---

## Rollback Plan

If something goes wrong:

```bash
# Revert to previous deployment in Vercel Dashboard
# Or rollback the merge:
git checkout main
git revert HEAD
git push origin main
```

---

## Current Status

- ✅ Code ready on `develop` branch
- ✅ All mobile issues fixed
- ✅ Results page refactored
- ✅ Wizard scroll behavior fixed
- ⚠️ **Need to verify**: Production environment variables
- ⚠️ **Need to do**: Merge to main and deploy

---

## Quick Deploy Command

```bash
# One-liner to deploy
git checkout main && git merge develop && git push origin main
```

This will trigger automatic deployment on Vercel (if connected to main branch).
