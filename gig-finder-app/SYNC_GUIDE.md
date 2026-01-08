# Database Sync Guide - Production to Preview

**Created:** 2026-01-07  
**Purpose:** Guide for syncing gig-finder-prod → gig-finder-dev

---

## Overview

**Database Structure:**
- **`gig-finder-prod`** = PRODUCTION (live data)
- **`gig-finder-dev`** = PREVIEW + LOCAL (test data, anonymized)

**Tables:**
1. `venues` (113 rows in production)
2. `events` (352 rows in production)
3. `bookings` (5 rows in production - will be anonymized)
4. `audit_logs` (variable - will be anonymized)

---

## Quick Start

### Method 1: Automated Script (Recommended)

```bash
# 1. Set environment variables
export PROD_POSTGRES_URL="postgresql://user:pass@host/gig-finder-prod?sslmode=require"
export DEV_POSTGRES_URL="postgresql://user:pass@host/gig-finder-dev?sslmode=require"

# 2. Test with dry run
node scripts/sync-prod-to-preview.js --dry-run

# 3. Run actual sync
node scripts/sync-prod-to-preview.js

# 4. Skip confirmation prompt (use with caution!)
node scripts/sync-prod-to-preview.js --skip-confirmation
```

### Method 2: Manual CSV Export/Import

See detailed steps below in "Manual CSV Method" section.

---

## Automated Script Features

### ✅ What It Does

1. **Connects to both databases**
   - Validates connection strings
   - Ensures dev database doesn't contain "prod" in name (safety check)

2. **Exports data from Production**
   - Exports all tables in correct order (respects foreign keys)
   - Shows progress for each table

3. **Anonymizes sensitive data**
   - Bookings: Replaces customer names, emails, Stripe IDs
   - Audit logs: Replaces user emails, IP addresses
   - Preserves all non-PII data (dates, prices, quantities)

4. **Wipes Dev database**
   - Truncates all tables (CASCADE to handle foreign keys)
   - Asks for confirmation (unless --skip-confirmation)

5. **Imports to Dev database**
   - Imports in correct order
   - Handles JSON/JSONB columns
   - Shows progress and error handling

6. **Resets sequences**
   - Ensures auto-increment IDs continue correctly

7. **Verifies integrity**
   - Counts rows in each table
   - Checks for orphaned records
   - Compares production vs dev counts

### 🛡️ Safety Features

- **Dry run mode**: Test without making changes
- **Confirmation prompt**: Requires explicit "yes" to proceed
- **Database name validation**: Refuses to wipe if target contains "prod"
- **Connection testing**: Validates both databases before starting
- **Error handling**: Graceful failures with detailed error messages

### 📊 Anonymization Rules

**Bookings Table:**
```javascript
customer_name → "Test User 1", "Test User 2", etc.
customer_email → "test-booking-1@example.com", "test-booking-2@example.com"
stripe_payment_intent_id → "pi_test_abc123" (random)
stripe_session_id → "cs_test_xyz789" (random)
```

**Audit Logs Table:**
```javascript
user_email → "test-user-1@example.com"
ip_address → "127.0.0.1"
details.email → "test-1@example.com"
details.customerName → "Test User 1"
```

---

## Manual CSV Method

### Step 1: Export from Production

```bash
# Connect to production database
psql "$PROD_POSTGRES_URL"

# Export venues
\copy (SELECT * FROM venues ORDER BY id) TO '/tmp/venues_export.csv' WITH CSV HEADER;

# Export events
\copy (SELECT * FROM events ORDER BY id) TO '/tmp/events_export.csv' WITH CSV HEADER;

# Export bookings
\copy (SELECT * FROM bookings ORDER BY id) TO '/tmp/bookings_export.csv' WITH CSV HEADER;

# Export audit logs (optional)
\copy (SELECT * FROM audit_logs ORDER BY id) TO '/tmp/audit_logs_export.csv' WITH CSV HEADER;

# Exit
\q
```

### Step 2: Anonymize Data

Open CSV files in a text editor and replace:

**bookings_export.csv:**
- Column: `customer_name` → Replace with "Test User 1", "Test User 2", etc.
- Column: `customer_email` → Replace with "test-1@example.com", "test-2@example.com"
- Column: `stripe_payment_intent_id` → Replace with "pi_test_123456"

Save as `bookings_anonymized.csv`

**audit_logs_export.csv:**
- Column: `user_email` → Replace with test emails
- Column: `ip_address` → Replace with "127.0.0.1"

Save as `audit_logs_anonymized.csv`

### Step 3: Wipe Dev Database

```bash
# Connect to dev database
psql "$DEV_POSTGRES_URL"

# VERIFY YOU'RE CONNECTED TO DEV (NOT PROD!)
SELECT current_database();
-- Should return: gig-finder-dev

# Wipe all data
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE bookings CASCADE;
TRUNCATE TABLE events CASCADE;
TRUNCATE TABLE venues CASCADE;

# Verify empty
SELECT COUNT(*) FROM venues;   -- Should return 0
SELECT COUNT(*) FROM events;   -- Should return 0
SELECT COUNT(*) FROM bookings; -- Should return 0
```

### Step 4: Import to Dev Database

```bash
# Still connected to dev database

# Import venues
\copy venues FROM '/tmp/venues_export.csv' WITH CSV HEADER;

# Import events
\copy events FROM '/tmp/events_export.csv' WITH CSV HEADER;

# Import anonymized bookings
\copy bookings FROM '/tmp/bookings_anonymized.csv' WITH CSV HEADER;

# Import anonymized audit logs (optional)
\copy audit_logs FROM '/tmp/audit_logs_anonymized.csv' WITH CSV HEADER;
```

### Step 5: Reset Sequences

```sql
-- Reset auto-increment sequences
SELECT setval('venues_id_seq', (SELECT MAX(id) FROM venues));
SELECT setval('events_id_seq', (SELECT MAX(id) FROM events));
SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings));
SELECT setval('audit_logs_id_seq', (SELECT MAX(id) FROM audit_logs));
```

### Step 6: Verify Integrity

```sql
-- Check counts
SELECT COUNT(*) FROM venues;   -- Should be 113
SELECT COUNT(*) FROM events;   -- Should be 352
SELECT COUNT(*) FROM bookings; -- Should be 5

-- Check for orphaned events
SELECT COUNT(*) FROM events e
LEFT JOIN venues v ON e.venue_id = v.id
WHERE e.venue_id IS NOT NULL AND v.id IS NULL;
-- Should return 0

-- Check for orphaned bookings
SELECT COUNT(*) FROM bookings b
LEFT JOIN events e ON b.event_id = e.id
WHERE e.id IS NULL;
-- Should return 0

-- Exit
\q
```

---

## Environment Variables Setup

### Option 1: Temporary (for one-time sync)

```bash
# Get connection strings from Neon dashboard
export PROD_POSTGRES_URL="postgresql://..."
export DEV_POSTGRES_URL="postgresql://..."

# Run sync
node scripts/sync-prod-to-preview.js
```

### Option 2: Create .env.sync file

```bash
# Create .env.sync file
cat > .env.sync << 'EOF'
PROD_POSTGRES_URL=postgresql://user:pass@host/gig-finder-prod?sslmode=require
DEV_POSTGRES_URL=postgresql://user:pass@host/gig-finder-dev?sslmode=require
EOF

# Load and run
source .env.sync && node scripts/sync-prod-to-preview.js
```

**⚠️ Important:** Add `.env.sync` to `.gitignore` to prevent committing credentials!

---

## Verification Checklist

After syncing, verify the following:

### Database Level
- [ ] Venues count matches (113)
- [ ] Events count matches (352)
- [ ] Bookings count matches (5, anonymized)
- [ ] No orphaned events (all have valid venue_id)
- [ ] No orphaned bookings (all have valid event_id)
- [ ] Sequences reset correctly

### Application Level
- [ ] Start local dev server: `npm run dev`
- [ ] Homepage loads without errors
- [ ] Search wizard shows events
- [ ] Event detail pages load
- [ ] Venue pages load
- [ ] Admin panel accessible (with test credentials)
- [ ] No console errors related to database

### Data Quality
- [ ] Event names look correct
- [ ] Venue names look correct
- [ ] Dates are preserved
- [ ] Prices are preserved
- [ ] Customer data is anonymized (check bookings)
- [ ] No real customer emails visible

---

## Troubleshooting

### Error: "permission denied for table"
**Solution:** Ensure your database user has SELECT/INSERT/TRUNCATE permissions

### Error: "relation does not exist"
**Solution:** Table might not exist in one of the databases. Check schema with `\dt`

### Error: "violates foreign key constraint"
**Solution:** Import tables in correct order: venues → events → bookings → audit_logs

### Error: "duplicate key value violates unique constraint"
**Solution:** Ensure dev database is fully truncated before import

### Sequences not working after import
**Solution:** Run the `setval()` commands to reset sequences

### Connection timeout
**Solution:** Check your connection string, ensure SSL mode is correct

---

## Sync Schedule

### Recommended Frequency

- **Before major feature testing:** Sync to ensure latest production data
- **After production schema changes:** Sync to mirror structure
- **Weekly (optional):** Keep preview environment fresh
- **On-demand:** When preview data becomes stale or corrupted

### Automation (Future)

Consider setting up:
- GitHub Action to sync on schedule
- Webhook trigger from production deployments
- Slack notification when sync completes

---

## Schema Differences to Watch

If you make schema changes in production, you'll need to:

1. **Apply same changes to dev database first**
2. **Then run sync script**
3. **Or:** Sync will fail if columns don't match

**Example:**
```sql
-- If you add a column to production:
ALTER TABLE events ADD COLUMN new_field TEXT;

-- Add same column to dev BEFORE syncing:
ALTER TABLE events ADD COLUMN new_field TEXT;

-- Then run sync
node scripts/sync-prod-to-preview.js
```

---

## Next Steps

1. ✅ Run sync script in dry-run mode
2. ✅ Review output and verify it looks correct
3. ✅ Run actual sync
4. ✅ Verify data in dev database
5. ✅ Test application locally
6. ✅ Push to Vercel Preview (develop branch)
7. ✅ Test on Preview URL
8. ✅ Document any issues found

---

## Related Documentation

- `PREVIEW_ENVIRONMENT_CHECKLIST.md` - Full environment setup checklist
- `DEVOPS_PIPELINE_STRATEGY.md` - Overall pipeline architecture
- `DEVELOPMENT_WORKFLOW.md` - AI development commands

---

**Last Updated:** 2026-01-07  
**Maintained By:** User + AI collaboration
