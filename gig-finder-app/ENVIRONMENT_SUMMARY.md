# GigFinder Environment Summary

**Last Updated:** 2026-01-07

---

## 🗄️ Database Structure

| Environment | Database Name | Purpose | Data Status |
|-------------|---------------|---------|-------------|
| **Production** | `gig-finder-prod` | Live data | ✅ Stable (113 venues, 352 events, 5 bookings) |
| **Preview** | `gig-finder-dev` | Pre-production testing | ⚠️ Needs sync |
| **Local** | `gig-finder-dev` | Local development | ⚠️ Needs sync |

**Note:** Preview and Local share the same database (`gig-finder-dev`)

---

## 📊 Database Tables

| Table | Production Count | Anonymize on Sync? | Notes |
|-------|------------------|-------------------|-------|
| `venues` | 113 | ❌ No | Venue data is public |
| `events` | 352 | ❌ No | Event data is public |
| `bookings` | 5 | ✅ Yes | Customer PII (names, emails, Stripe IDs) |
| `audit_logs` | Variable | ✅ Yes | User emails, IP addresses |

---

## 🔐 Service Credentials

### Clerk (Authentication)

| Environment | Keys | Users |
|-------------|------|-------|
| **Production** | `pk_live_...` / `sk_live_...` | Real users |
| **Preview** | `pk_test_...` / `sk_test_...` | Test users |
| **Local** | `pk_test_...` / `sk_test_...` | Test users |

### Stripe (Payments)

| Environment | Keys | Mode |
|-------------|------|------|
| **Production** | `sk_live_...` / `pk_live_...` | Live mode |
| **Preview** | `sk_test_...` / `pk_test_...` | Test mode |
| **Local** | `sk_test_...` / `pk_test_...` | Test mode |

**Test Card:** `4242 4242 4242 4242` (any future date, any CVC)

---

## 🌐 URLs

| Environment | URL | Branch | Deployment |
|-------------|-----|--------|------------|
| **Production** | https://gig-finder.co.uk | `main` | Vercel Production |
| **Preview** | https://gigfinder-git-develop-*.vercel.app | `develop` | Vercel Preview |
| **Local** | http://localhost:3000 | `develop` | Local dev server |

---

## ⚙️ Configuration Flags

| Setting | Production | Preview | Local |
|---------|-----------|---------|-------|
| `DISABLE_SKIDDLE` | ✅ Enabled | ✅ Enabled | ✅ Enabled |
| `ADMIN_EMAIL` | (your email) | (your email) | (your email) |
| `RESEND_API_KEY` | (same for all) | (same for all) | (same for all) |

---

## 🔄 Sync Workflow

### Quick Sync (Automated)

```bash
# 1. Set environment variables
export PROD_POSTGRES_URL="<from Neon dashboard>"
export DEV_POSTGRES_URL="<from Neon dashboard>"

# 2. Dry run first
node scripts/sync-prod-to-preview.js --dry-run

# 3. Actual sync
node scripts/sync-prod-to-preview.js
```

### What Gets Anonymized

**Bookings:**
- `customer_name` → "Test User 1", "Test User 2", etc.
- `customer_email` → "test-booking-1@example.com"
- `stripe_payment_intent_id` → "pi_test_abc123"

**Audit Logs:**
- `user_email` → "test-user-1@example.com"
- `ip_address` → "127.0.0.1"

---

## 📝 Development Workflow

### 1. Local Development (LOCALDEV)
```bash
# Work on develop branch
git checkout develop

# Make changes, test locally
npm run dev

# AI can edit files, but NO git operations
```

### 2. Push to Preview (PUSHPREVIEW)
```bash
# AI commits and pushes to develop
git add .
git commit -m "feat: description"
git push origin develop

# Auto-deploys to Vercel Preview
# Test at: https://gigfinder-git-develop-*.vercel.app
```

### 3. Deploy to Production (Manual)
```bash
# User manually merges develop → main
# Via GitHub PR or:
git checkout main
git merge develop
git push origin main

# Auto-deploys to Production
# Live at: https://gig-finder.co.uk
```

---

## ✅ Pre-Deployment Checklist

Before deploying to Production:

- [ ] Code synced: `develop` merged with `main`
- [ ] Database synced: Preview has latest production data (anonymized)
- [ ] Environment variables verified in Vercel
- [ ] Clerk test users created for Preview
- [ ] Stripe webhook configured for Preview
- [ ] All critical flows tested on Preview:
  - [ ] Search wizard
  - [ ] Event detail pages
  - [ ] Booking flow (with test card)
  - [ ] Admin panel access
  - [ ] Email notifications
- [ ] No console errors on Preview
- [ ] Performance acceptable on Preview

---

## 🚨 Safety Guardrails

### AI Restrictions
- ❌ NEVER push to `main` branch
- ❌ NEVER merge branches
- ❌ NEVER modify production database directly
- ❌ NEVER access `.env.production.local`

### User Controls
- ✅ User approves all pushes to `develop` (via PUSHPREVIEW command)
- ✅ User controls all merges to `main`
- ✅ User manages production environment variables
- ✅ User runs database sync script manually

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `PREVIEW_ENVIRONMENT_CHECKLIST.md` | Complete checklist for mirroring environments |
| `SYNC_GUIDE.md` | Detailed guide for database sync |
| `DEVOPS_PIPELINE_STRATEGY.md` | Overall pipeline architecture |
| `DEVELOPMENT_WORKFLOW.md` | AI development commands (CONSULT, LOCALDEV, PUSHPREVIEW) |
| `scripts/sync-prod-to-preview.js` | Automated sync script |

---

## 🎯 Current Status

**Production:**
- ✅ Stable and running
- ✅ 113 venues, 352 events, 5 bookings
- ✅ All integrations working (Clerk, Stripe, Resend)

**Preview:**
- ⚠️ Needs database sync
- ⚠️ Needs environment variable verification
- ⚠️ Needs testing after sync

**Next Steps:**
1. Run database sync script
2. Verify Preview environment variables
3. Test all critical flows on Preview
4. Document any issues found

---

**For Questions:** Refer to detailed documentation files listed above
