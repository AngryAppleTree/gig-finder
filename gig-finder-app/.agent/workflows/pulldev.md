---
description: Pull code, config, and data from Preview to Local dev
---

# PULLDEV - Hard Reset Local to Mirror Preview

⚠️ **WARNING:** This command **DELETES all local changes** and makes local an exact mirror of Preview.

## What This Does

1. **Code**: Hard resets to match `develop` branch (deletes local changes)
2. **Configuration**: Uses `.env.local` (unchanged)
3. **Data**: Already shared (both use `gig-finder-dev` database)

**Result:** Local becomes an EXACT copy of Preview

---

## ⚠️ IMPORTANT WARNING

**This command will DELETE:**
- ❌ All uncommitted changes
- ❌ All local-only files not in git
- ❌ Any work in progress

**This command will NOT delete:**
- ✅ `.env.local` (gitignored)
- ✅ `node_modules/` (gitignored)
- ✅ `.next/` build cache (will be cleared anyway)

**Use this when:**
- ✅ You want to start fresh from Preview
- ✅ You want to test Preview code locally
- ✅ You've pushed your work to Preview already
- ✅ You don't care about local changes

**DON'T use this when:**
- ❌ You have uncommitted work you want to keep
- ❌ You're in the middle of development
- ❌ You haven't pushed your changes yet

---

## Steps

### 1. Confirm You Want to Delete Local Changes

**AI will ask:** "⚠️ PULLDEV will DELETE all local changes. Are you sure? (Y/N)"

**If you have uncommitted changes, AI will show them and ask again.**

---

### 2. Hard Reset to Preview Branch

```bash
cd "/Users/alexanderbunch/App dummy/gig-finder/gig-finder-app"
git fetch origin
git checkout develop
git reset --hard origin/develop
```

**Expected:** Local `develop` branch now matches Preview exactly

**What this does:**
- Deletes all local commits not in Preview
- Deletes all uncommitted changes
- Resets all files to match Preview

---

### 3. Clean Untracked Files (Optional but Recommended)

```bash
git clean -fd
```

**Expected:** Removes any files not tracked by git

**What this deletes:**
- New files you created locally
- Build artifacts
- Temporary files

---

### 4. Verify Environment Variables

```bash
grep "POSTGRES_URL" .env.local
```

**Expected:** Should point to `gig-finder-dev` (square-fire host)

---

### 5. Install Dependencies

```bash
npm install
```

**Expected:** Dependencies updated to match Preview

---

### 6. Clear Build Cache

```bash
rm -rf .next
```

**Expected:** Forces fresh build with Preview code

---

### 7. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

**Expected:** Server starts with Preview code

---

### 8. Verify Sync

Open http://localhost:3000 and verify:

- [ ] Code matches Preview
- [ ] Events display correctly (352 events)
- [ ] Database connection works
- [ ] No console errors

---

## Database Note

**Local and Preview share the same database** (`gig-finder-dev`), so:
- ✅ Data is always in sync automatically
- ✅ No database migration needed
- ⚠️ Changes in local affect Preview (and vice versa)

---

## Quick Command (Destructive!)

⚠️ **This DELETES all local changes!**

```bash
cd "/Users/alexanderbunch/App dummy/gig-finder/gig-finder-app" && \
git fetch origin && \
git checkout develop && \
git reset --hard origin/develop && \
git clean -fd && \
npm install && \
rm -rf .next && \
echo "✅ PULLDEV complete! Local now mirrors Preview. Restart dev server with: npm run dev"
```

---

## Troubleshooting

### Issue: "I lost my work!"

**Solution:** 
- Work is gone if it wasn't committed and pushed
- Check `git reflog` to see if you can recover
- **Prevention:** Always commit and push before PULLDEV

### Issue: Dependencies out of sync

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database connection fails

**Solution:**
Check `.env.local` has correct `POSTGRES_URL` for dev database

---

## Safe Alternative: Check First

If you want to see what will be deleted:

```bash
# See uncommitted changes
git status

# See unpushed commits
git log origin/develop..develop

# See what files would be deleted
git clean -fd --dry-run
```

---

**Status:** Ready to use (DESTRUCTIVE - use with caution!)

