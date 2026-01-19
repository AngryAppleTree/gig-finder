# 📋 Manual Test Checklist - Preview Environment

**Environment:** https://gigfinder-git-develop-contactangryappletree-4366s-projects.vercel.app  
**Test User:** alexander_bunch@yahoo.co.uk  
**Password:** 123usertesting123  
**Last Updated:** 2026-01-19

---

## ℹ️ **Purpose**

This checklist covers automated tests that cannot run in the preview environment due to Clerk authentication limitations. These tests must be performed manually to ensure full coverage.

---

## ✅ **Manual Tests Required**

### **1. Event Management (1 test)**

#### **Test 1.1: Edit and Delete Event**
**File:** `tests/functional-units/event-management/edit-delete-event.spec.ts`  
**Prerequisites:** At least one event in My Gigs

**Steps:**
- [ ] Sign in as test user
- [ ] Navigate to My Gigs (`/gigfinder/my-gigs`)
- [ ] Click "EDIT" button on any event
- [ ] Modify event details (name, date, venue, etc.)
- [ ] Click "Save Changes"
- [ ] Verify changes appear on My Gigs page
- [ ] Click "DELETE" button on the same event
- [ ] Confirm deletion in modal
- [ ] Verify event removed from My Gigs list

**Expected Result:** Event can be edited and deleted successfully

---

### **2. Guest List Management (9 tests)**

**Prerequisites:** 
- Create test event named "SPONGEBOB" with:
  - Date: Future date
  - Internal ticketing enabled (guest list)
  - At least 1 guest added

#### **Test 2.1: Navigate to Guest List**
**File:** `tests/functional-units/event-management/view-guestlist.spec.ts:47`

**Steps:**
- [ ] Sign in as test user
- [ ] Navigate to My Gigs
- [ ] Find event "SPONGEBOB"
- [ ] Verify "GUEST LIST" button is visible
- [ ] Click "GUEST LIST" button
- [ ] Verify Guest List page loads with event name in title

**Expected Result:** Successfully navigate to Guest List page

---

#### **Test 2.2: Guest List Page Elements**
**File:** `tests/functional-units/event-management/view-guestlist.spec.ts:77`

**Steps:**
- [ ] Navigate to Guest List for SPONGEBOB
- [ ] Verify page title shows "SPONGEBOB"
- [ ] Verify "Add Guest" button visible
- [ ] Verify "Back to My Gigs" button visible
- [ ] Verify guest list table/cards visible
- [ ] Verify guest count displayed

**Expected Result:** All required page elements are present

---

#### **Test 2.3: Add Guest Manually**
**File:** `tests/functional-units/event-management/view-guestlist.spec.ts:104`

**Steps:**
- [ ] Navigate to Guest List
- [ ] Click "Add Guest" button
- [ ] Fill in guest name: "Test Guest [timestamp]"
- [ ] Fill in guest email: "test@example.com"
- [ ] Fill in quantity: 2
- [ ] Click "Add" or "Submit"
- [ ] Verify guest appears in list immediately
- [ ] Verify guest details are correct

**Expected Result:** Guest added successfully and appears in list

---

#### **Test 2.4: Empty State Display**
**File:** `tests/functional-units/event-management/view-guestlist.spec.ts:137`

**Steps:**
- [ ] Create new event with internal ticketing (no guests)
- [ ] Navigate to its Guest List
- [ ] Verify empty state message displays
- [ ] Verify message says "No guests yet" or similar
- [ ] Verify "Add Guest" button still available

**Expected Result:** Empty state displays correctly

---

#### **Test 2.5: Email Guests Button**
**File:** `tests/functional-units/event-management/view-guestlist.spec.ts:157`

**Steps:**
- [ ] Navigate to Guest List with at least 1 guest
- [ ] Verify "Email Guests" button appears
- [ ] Verify button is enabled (not disabled)
- [ ] Verify button has email icon or text

**Expected Result:** Email Guests button appears when guests exist

---

#### **Test 2.6: Email Modal**
**File:** `tests/functional-units/event-management/view-guestlist.spec.ts:180`

**Steps:**
- [ ] Navigate to Guest List with guests
- [ ] Click "Email Guests" button
- [ ] Verify email modal opens
- [ ] Verify modal has subject field
- [ ] Verify modal has message/body field
- [ ] Verify modal has "Send" button
- [ ] Verify modal has "Cancel" button
- [ ] Click "Cancel"
- [ ] Verify modal closes without sending

**Expected Result:** Email modal opens and closes correctly

---

#### **Test 2.7: Back Navigation**
**File:** `tests/functional-units/event-management/view-guestlist.spec.ts:214`

**Steps:**
- [ ] Navigate to Guest List
- [ ] Click "Back to My Gigs" button
- [ ] Verify returns to My Gigs page (`/gigfinder/my-gigs`)
- [ ] Verify SPONGEBOB event still visible in list

**Expected Result:** Back button navigates to My Gigs correctly

---

#### **Test 2.8: Guest Card Information**
**File:** `tests/functional-units/event-management/view-guestlist.spec.ts:231`

**Steps:**
- [ ] Navigate to Guest List with guests
- [ ] For each guest card, verify it shows:
  - [ ] Guest name
  - [ ] Guest email
  - [ ] Ticket quantity
  - [ ] QR code (if generated)
  - [ ] Check-in status or button

**Expected Result:** Guest cards display all required information

---

#### **Test 2.9: Complete Guest List Journey**
**File:** `tests/functional-units/event-management/view-guestlist.spec.ts:260`

**Steps:**
- [ ] Start at My Gigs page
- [ ] Click "GUEST LIST" on SPONGEBOB event
- [ ] Verify Guest List page loads
- [ ] Click "Add Guest"
- [ ] Add guest: Name="Journey Test", Email="journey@test.com", Qty=1
- [ ] Verify guest appears in list
- [ ] Click "Back to My Gigs"
- [ ] Verify returned to My Gigs page
- [ ] Verify SPONGEBOB still in list

**Expected Result:** Complete journey works end-to-end

---

### **3. QR Code Generation - Phase 2A (3 tests)**

**Prerequisites:** Event with internal ticketing enabled

#### **Test 3.1: Manual Booking QR Code Generation**
**File:** `tests/functional-units/phase2a-qr-generation.spec.ts:37`

**Steps:**
- [ ] Navigate to Guest List
- [ ] Add a manual guest booking
- [ ] Note the guest name/email
- [ ] Open database query tool or API
- [ ] Query bookings table for the guest
- [ ] Verify `qr_code` field is populated
- [ ] Verify QR code is not null/empty

**Expected Result:** QR code generated for manual booking

---

#### **Test 3.2: QR Code Format Validation**
**File:** `tests/functional-units/phase2a-qr-generation.spec.ts:77`

**Steps:**
- [ ] Create manual booking (from Test 3.1)
- [ ] Retrieve QR code from database
- [ ] Verify format matches: `GF-TICKET:{bookingId}-{eventId}`
- [ ] Verify bookingId is a number
- [ ] Verify eventId is a number
- [ ] Example: `GF-TICKET:123-456`

**Expected Result:** QR code has correct format

---

#### **Test 3.3: Guest Appears in UI After Adding**
**File:** `tests/functional-units/phase2a-qr-generation.spec.ts:203`

**Steps:**
- [ ] Navigate to Guest List
- [ ] Note current guest count
- [ ] Click "Add Guest"
- [ ] Fill form and submit
- [ ] Verify guest appears immediately (no page refresh)
- [ ] Verify guest count incremented by 1
- [ ] Verify new guest is at top/bottom of list

**Expected Result:** Guest appears in UI immediately after adding

---

### **4. Search & Filtering (1 test)**

#### **Test 4.1: No Results Message for Impossible Search**
**File:** `tests/functional-units/landing-and-search/results-layout.spec.ts:34`

**Steps:**
- [ ] Navigate to homepage wizard
- [ ] Select impossible criteria:
  - Budget: High (£50+)
  - Venue Size: Small (< 100 capacity)
  - Date: Far future (e.g., 2099-12-31)
  - Location: Remote postcode
- [ ] Submit search
- [ ] Verify "No Results" or "No gigs found" message displays
- [ ] Verify message is user-friendly
- [ ] Verify "Start Over" or similar button available

**Expected Result:** Helpful no results message displays

---

### **5. Payment Test Fixture (1 test)**

#### **Test 5.1: Create Payment Test Event**
**File:** `tests/setup/create-payment-test-event.spec.ts:124`

**Steps:**
- [ ] Sign in as test user
- [ ] Navigate to Add Event (`/gigfinder/add-event`)
- [ ] Fill in event details:
  - Name: "E2E Payment Test Event"
  - Venue: "E2E Test Venue" (new venue)
  - City: Edinburgh
  - Capacity: 100
  - Date: 2026-12-31
  - Time: 20:00
  - Genre: Rock/Blues/Punk
  - Price: £10.00
  - Ticketing: Enable Stripe (paid ticketing)
- [ ] Submit event
- [ ] Navigate to search: `/gigfinder/results?search=E2E+Payment+Test+Event`
- [ ] Verify event appears in results
- [ ] Click "View Event"
- [ ] Verify "Buy Tickets" button visible
- [ ] Verify price shows £10.00

**Expected Result:** Payment test event created and searchable

---

## 📊 **Summary**

| Category | Tests | Time Estimate |
|----------|-------|---------------|
| Event Management | 1 | 5 min |
| Guest List | 9 | 25 min |
| QR Code Generation | 3 | 10 min |
| Search & Filtering | 1 | 3 min |
| Payment Fixture | 1 | 5 min |
| **Total** | **15** | **~48 min** |

---

## 📝 **Notes**

- All tests require signing in as test user first
- Tests assume preview environment has some existing event data
- QR code tests may require database access or API inspection
- Complete all tests in one session to maintain auth state
- Mark each checkbox as you complete the test
- Report any failures or unexpected behavior

---

## ✅ **Completion Tracking**

**Date Tested:** ___________  
**Tester:** ___________  
**Tests Passed:** ___ / 15  
**Tests Failed:** ___  
**Issues Found:** ___________

---

**Last Updated:** 2026-01-19  
**Automated Test Run:** https://github.com/your-repo/actions
