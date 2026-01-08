# Database Sync - Manual Instructions

**Created:** 2026-01-07  
**Purpose:** Simple manual steps to sync production to dev database

---

## Step 1: Get Connection Strings from Neon

### Get Production Connection String:

1. Go to https://console.neon.tech
2. Click on **`gig-finder-prod`** project
3. Click **"Connect"** button (top right)
4. Click **"Show password"**
5. Copy the entire connection string

**It will look like:**
```
postgresql://neondb_owner:npg_XXXXX@ep-autumn-term-64001147-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

### Get Dev Connection String:

1. Go back to projects list
2. Click on **`gig-finder-dev`** project
3. Click **"Connect"** button
4. Click **"Show password"**
5. Copy the entire connection string

**It will look like:**
```
postgresql://neondb_owner:npg_XXXXX@ep-winter-bonus-91908088-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

---

## Step 2: Open Terminal

Open your Terminal app and navigate to the project:

```bash
cd "/Users/alexanderbunch/App dummy/gig-finder/gig-finder-app"
```

---

## Step 3: Set Environment Variables

**IMPORTANT:** Replace the connection strings below with YOUR actual connection strings from Neon!

```bash
export PROD_POSTGRES_URL="PASTE_YOUR_PRODUCTION_CONNECTION_STRING_HERE"
export DEV_POSTGRES_URL="PASTE_YOUR_DEV_CONNECTION_STRING_HERE"
```

**Example (DO NOT USE THESE - use your own!):**
```bash
export PROD_POSTGRES_URL="postgresql://neondb_owner:npg_abc123@ep-autumn-term-64001147-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
export DEV_POSTGRES_URL="postgresql://neondb_owner:npg_xyz789@ep-winter-bonus-91908088-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
```

---

## Step 4: Run Dry-Run Test (Safe - No Changes)

```bash
node scripts/sync-prod-to-preview.js --dry-run
```

**This will:**
- ✅ Connect to both databases
- ✅ Show you what data would be synced
- ✅ Show you what would be anonymized
- ❌ NOT make any changes

---

## Step 5: Review the Output

You should see output like:

```
🔗 Initializing Database Connections
Production DB: neondb (host: ep-autumn-term-64001147-pooler.eu-west-2.aws.neon.tech)
Dev/Preview DB: neondb (host: ep-winter-bonus-91908088-pooler.eu-west-2.aws.neon.tech)
✅ Connected to Production database
✅ Connected to Dev/Preview database

📊 Checking Production Data
  venues: 113 rows
  events: 352 rows
  bookings: 5 rows
  audit_logs: X rows

[DRY RUN] Would truncate all tables
[DRY RUN] Would import data to dev database
    venues: 113 rows
    events: 352 rows
    bookings: 5 rows
    audit_logs: X rows

✅ Dry run completed successfully!
```

---

## Step 6: If Dry-Run Looks Good, Run Actual Sync

**ONLY run this if the dry-run output looks correct!**

```bash
node scripts/sync-prod-to-preview.js
```

**This will:**
- ⚠️ Ask for confirmation
- ⚠️ WIPE all data in dev database
- ✅ Import production data (anonymized)
- ✅ Verify integrity

---

## Troubleshooting

### Error: "PROD_POSTGRES_URL environment variable not set"

**Solution:** Make sure you ran the `export` commands in Step 3

### Error: "Production and Dev are using the SAME Neon project/host"

**Solution:** You've set both variables to the same connection string. Double-check you copied the correct strings for prod and dev.

### Error: "Failed to connect to Production"

**Solution:** Check your connection string is correct and includes the password

---

## Quick Copy-Paste Template

```bash
# Navigate to project
cd "/Users/alexanderbunch/App dummy/gig-finder/gig-finder-app"

# Set connection strings (REPLACE WITH YOUR ACTUAL STRINGS!)
export PROD_POSTGRES_URL="YOUR_PROD_CONNECTION_STRING"
export DEV_POSTGRES_URL="YOUR_DEV_CONNECTION_STRING"

# Run dry-run test
node scripts/sync-prod-to-preview.js --dry-run

# If dry-run looks good, run actual sync
# node scripts/sync-prod-to-preview.js
```

---

**Ready?** Follow the steps above and let me know if you hit any issues!
