# Deploy GigFinder to gig-finder.co.uk

## Quick Deployment Steps

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Commit Your Code
```bash
cd "/Users/alexanderbunch/App dummy/gig-finder/gig-finder-app"
git add .
git commit -m "GigFinder ready for deployment"
```

### Step 3: Deploy to Vercel
```bash
vercel
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → gigfinder (or press Enter)
- **Directory?** → ./ (press Enter)
- **Override settings?** → No (press Enter)

### Step 4: Add Environment Variable
```bash
vercel env add SKIDDLE_API_KEY production
```
Paste your Skiddle API key when prompted.

### Step 5: Deploy to Production
```bash
vercel --prod
```

You'll get a URL like: `https://gigfinder.vercel.app`

### Step 6: Add Custom Domain

#### In Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Click your `gigfinder` project
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `gig-finder.co.uk`
6. Click **Add**
7. Vercel will show you DNS records to add

#### In IONOS:
1. Log into https://my.ionos.co.uk
2. Go to **Domains & SSL** → **gig-finder.co.uk**
3. Click **DNS Settings** or **Manage DNS**
4. Add these records:

**For root domain (gig-finder.co.uk):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`
- TTL: `3600`

**For www subdomain (www.gig-finder.co.uk):**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`
- TTL: `3600`

5. **Save** the DNS records

### Step 7: Wait for DNS Propagation
- Usually takes 5-30 minutes
- Can take up to 48 hours
- Check status at: https://dnschecker.org

### Step 8: Verify SSL Certificate
Vercel automatically provisions SSL certificates. Once DNS propagates:
- Visit https://gig-finder.co.uk
- Verify the padlock icon appears
- Test the app!

## Testing Checklist

Once deployed, test:
- [ ] https://gig-finder.co.uk loads
- [ ] Quiz flow works
- [ ] Skiddle API returns real gigs
- [ ] Genre filters work (classical, rock, etc.)
- [ ] Ticket links open correctly
- [ ] Mobile view works
- [ ] Privacy/Terms/Contact pages load

## Future Updates

To update your live site:
```bash
cd "/Users/alexanderbunch/App dummy/gig-finder/gig-finder-app"
git add .
git commit -m "Your update message"
vercel --prod
```

## Troubleshooting

### "Domain is not configured correctly"
- Wait longer for DNS propagation
- Verify A and CNAME records are correct
- Clear browser cache

### "Environment variable not found"
```bash
vercel env add SKIDDLE_API_KEY production
# Enter your API key
vercel --prod
```

### Build fails
- Check `npm run build` works locally
- Verify all dependencies are in package.json
- Check Vercel build logs

## Your URLs

After deployment:
- **Production:** https://gig-finder.co.uk
- **Preview:** https://gigfinder.vercel.app
- **Admin:** https://vercel.com/dashboard

---

**Ready to deploy?** Run these commands:

```bash
npm i -g vercel
cd "/Users/alexanderbunch/App dummy/gig-finder/gig-finder-app"
git add .
git commit -m "GigFinder v1.0 - Ready for launch"
vercel
vercel env add SKIDDLE_API_KEY production
vercel --prod
```

Then add the DNS records in IONOS! 🚀
