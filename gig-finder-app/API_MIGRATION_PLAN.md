# 🔄 API Client Migration Plan

**Project**: GigFinder Application  
**Goal**: Centralize all API calls with a robust API client  
**Timeline**: 3 sessions (~8-11 hours total)  
**Status**: 📝 Planning

---

## 🎯 Overview

This plan outlines the migration from scattered `fetch()` calls to a centralized API client. The migration will be done **incrementally** to minimize risk and allow for testing at each step.

**Key Decision**: After Step 5, we will **merge Add-Event and Edit-Event components** to eliminate duplication before migrating them to the API client.

---

## 📊 Current State Analysis

### Fetch Calls Inventory:
```
Total fetch calls: 16 across 7 components

1. My Gigs (2 calls)
   - GET /api/events/user
   - DELETE /api/events/user?id={id}

2. Event Detail (1 call)
   - GET /api/events/{id}

3. Guest List (3 calls)
   - GET /api/bookings?eventId={id}
   - POST /api/bookings
   - POST /api/bookings/email

4. My Bookings (2 calls)
   - GET /api/bookings/my-bookings
   - POST /api/bookings/refund

5. Results Page (1 call)
   - GET /api/events?{params}

6. Add Event (2 calls)
   - GET /api/venues
   - POST /api/events/manual

7. Edit Event (3 calls)
   - GET /api/venues
   - GET /api/events/user?id={id}
   - PUT /api/events/user

8. QR Scanner (1 call)
   - POST /api/bookings/scan

9. Cancel Booking (1 call)
   - GET /api/bookings/my-bookings
```

---

## 🏗️ Phase 1: Foundation (Session 1)

### ✅ Step 1: Create API Client Infrastructure
**Time**: 2-3 hours  
**Status**: ⏳ Not Started

**Deliverables**:
1. Create `lib/api-client.ts`
2. Create `lib/api-types.ts`
3. Create `lib/api-routes.ts`
4. Create `lib/errors/ApiError.ts`

**Features**:
- TypeScript generics for type safety
- Centralized error handling
- Request/response interceptors
- Retry logic (optional)
- Loading state helpers
- Environment-aware base URL

**Files to Create**:
```
lib/
├── api-client.ts       (Main API client class)
├── api-types.ts        (Request/Response types)
├── api-routes.ts       (API endpoint constants)
└── errors/
    └── ApiError.ts     (Custom error class)
```

**Acceptance Criteria**:
- [ ] API client can make GET, POST, PUT, DELETE requests
- [ ] Errors are properly typed and handled
- [ ] All API routes are defined as constants
- [ ] TypeScript types are exported
- [ ] Basic unit tests pass (optional)

---

### ✅ Step 2: Migrate My Gigs Page
**Time**: 30 minutes  
**Status**: ⏳ Not Started  
**Depends On**: Step 1

**Current Fetch Calls**:
```typescript
// 1. Fetch user's gigs
const res = await fetch('/api/events/user');

// 2. Delete gig
const res = await fetch(`/api/events/user?id=${id}`, {
    method: 'DELETE',
});
```

**After Migration**:
```typescript
// 1. Fetch user's gigs
const data = await api.events.getUserEvents();

// 2. Delete gig
await api.events.deleteUserEvent(id);
```

**Files to Modify**:
- `app/gigfinder/my-gigs/page.tsx`

**Testing Checklist**:
- [ ] My Gigs page loads correctly
- [ ] User's gigs are displayed
- [ ] Delete functionality works
- [ ] Error states display properly
- [ ] Loading states work

**Commit Message**: `refactor: migrate My Gigs page to API client`

---

### ✅ Step 3: Migrate Event Detail Page
**Time**: 30 minutes  
**Status**: ⏳ Not Started  
**Depends On**: Step 1

**Current Fetch Calls**:
```typescript
// Fetch single event
const response = await fetch(`/api/events/${id}`);
```

**After Migration**:
```typescript
// Fetch single event
const event = await api.events.getById(id);
```

**Files to Modify**:
- `app/gigfinder/event/[id]/page.tsx`

**Testing Checklist**:
- [ ] Event detail page loads
- [ ] Event data displays correctly
- [ ] Error handling works (404, etc.)
- [ ] Share functionality still works
- [ ] Booking modal integration works

**Commit Message**: `refactor: migrate Event Detail page to API client`

---

## 🏗️ Phase 2: Core Features (Session 2)

### ✅ Step 4: Migrate Guest List Page
**Time**: 1 hour  
**Status**: ⏳ Not Started  
**Depends On**: Step 1

**Current Fetch Calls**:
```typescript
// 1. Fetch bookings for event
const res = await fetch(`/api/bookings?eventId=${eventId}`);

// 2. Add guest manually
const res = await fetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({ eventId, name, email })
});

// 3. Send email to all guests
const res = await fetch('/api/bookings/email', {
    method: 'POST',
    body: JSON.stringify({ eventId, subject, message })
});
```

**After Migration**:
```typescript
// 1. Fetch bookings
const bookings = await api.bookings.getByEventId(eventId);

// 2. Add guest
await api.bookings.create({ eventId, name, email });

// 3. Send email
await api.bookings.sendEmail({ eventId, subject, message });
```

**Files to Modify**:
- `app/gigfinder/my-gigs/guestlist/[id]/page.tsx`

**Testing Checklist**:
- [ ] Guest list loads correctly
- [ ] Can add guest manually
- [ ] Email modal works
- [ ] Email sending works
- [ ] Guest count updates
- [ ] Error handling works

**Commit Message**: `refactor: migrate Guest List page to API client`

---

### ✅ Step 5: Migrate My Bookings & Results Pages
**Time**: 1.5 hours  
**Status**: ⏳ Not Started  
**Depends On**: Step 1

#### 5a. My Bookings Page (45 min)
**Current Fetch Calls**:
```typescript
// 1. Fetch user's bookings
const res = await fetch('/api/bookings/my-bookings');

// 2. Request refund
const res = await fetch('/api/bookings/refund', {
    method: 'POST',
    body: JSON.stringify({ bookingId })
});
```

**After Migration**:
```typescript
// 1. Fetch bookings
const bookings = await api.bookings.getMyBookings();

// 2. Request refund
await api.bookings.requestRefund(bookingId);
```

**Files to Modify**:
- `app/gigfinder/my-bookings/page.tsx`
- `app/gigfinder/my-bookings/cancel/[id]/page.tsx`

#### 5b. Results Page (45 min)
**Current Fetch Calls**:
```typescript
// Fetch events with filters
const response = await fetch(`/api/events?${params.toString()}`);
```

**After Migration**:
```typescript
// Fetch events with filters
const events = await api.events.search(searchParams);
```

**Files to Modify**:
- `app/gigfinder/results/page.tsx`

**Testing Checklist**:
- [ ] My Bookings page loads
- [ ] Bookings display correctly
- [ ] Cancel/refund works
- [ ] Results page search works
- [ ] Filters apply correctly
- [ ] Error states work

**Commit Message**: `refactor: migrate My Bookings and Results pages to API client`

---

## 🔀 Phase 3: Component Merge (Session 2/3)

### ✅ Step 6: Merge Add-Event and Edit-Event Components
**Time**: 6-8 hours  
**Status**: ⏳ Not Started  
**Depends On**: Step 5 (API client is stable)

**Goal**: Eliminate ~80% code duplication between Add and Edit Event pages

**Strategy**:
1. Extract shared logic into custom hooks
2. Create shared form components
3. Refactor Add-Event to use shared code
4. Refactor Edit-Event to use shared code
5. Test both pages thoroughly

**Sub-Steps**:

#### 6a. Create Shared Hooks (2-3 hours)
**Files to Create**:
```
app/gigfinder/_shared/hooks/
├── useEventForm.ts           (Form state management)
├── useVenueAutocomplete.ts   (Venue search logic)
└── useImageUpload.ts         (Image resize/upload)
```

**Extracted Logic**:
- Form state management
- Venue autocomplete
- Image upload/resize
- Form validation
- Draft restoration (Add Event only)

#### 6b. Create Shared Components (2-3 hours)
**Files to Create**:
```
app/gigfinder/_shared/components/
├── EventFormFields.tsx       (Shared form fields)
├── VenueAutocomplete.tsx     (Venue search UI)
├── ImageUploadSection.tsx    (Image upload UI)
├── PricingSection.tsx        (Price/presale fields)
└── TicketingSection.tsx      (Ticketing checkboxes)
```

#### 6c. Refactor Add-Event (1 hour)
**Goal**: Use shared hooks and components

**Expected Result**:
- Reduce from 590 lines to ~200 lines
- All functionality preserved
- Tests pass

#### 6d. Refactor Edit-Event (1 hour)
**Goal**: Use shared hooks and components

**Expected Result**:
- Reduce from 624 lines to ~250 lines
- All functionality preserved
- Tests pass

#### 6e. Testing (1 hour)
**Test Both Pages**:
- [ ] Add Event: Create new event
- [ ] Add Event: Venue autocomplete works
- [ ] Add Event: Image upload works
- [ ] Add Event: Draft restoration works
- [ ] Edit Event: Load existing event
- [ ] Edit Event: Update event
- [ ] Edit Event: Venue autocomplete works
- [ ] Edit Event: Image upload works
- [ ] Edit Event: Ticketing constraints work

**Acceptance Criteria**:
- [ ] Code duplication reduced from 80% to <20%
- [ ] Both pages work identically to before
- [ ] All tests pass
- [ ] No regressions

**Commit Message**: `refactor: merge Add-Event and Edit-Event shared logic`

---

## 🏗️ Phase 4: Final Migration (Session 3)

### ✅ Step 7: Migrate Add-Event and Edit-Event to API Client
**Time**: 1.5 hours  
**Status**: ⏳ Not Started  
**Depends On**: Step 6 (Components merged)

**Current Fetch Calls** (after merge, in shared hooks):
```typescript
// In useEventForm or useVenueAutocomplete:

// 1. Fetch venues
const res = await fetch('/api/venues');

// 2. Create event (Add)
const res = await fetch('/api/events/manual', {
    method: 'POST',
    body: JSON.stringify(formData)
});

// 3. Fetch event data (Edit)
const res = await fetch(`/api/events/user?id=${eventId}`);

// 4. Update event (Edit)
const res = await fetch('/api/events/user', {
    method: 'PUT',
    body: JSON.stringify(formData)
});
```

**After Migration**:
```typescript
// 1. Fetch venues
const venues = await api.venues.getAll();

// 2. Create event
const event = await api.events.create(formData);

// 3. Fetch event data
const event = await api.events.getUserEvent(eventId);

// 4. Update event
await api.events.update(eventId, formData);
```

**Files to Modify**:
- `app/gigfinder/_shared/hooks/useEventForm.ts`
- `app/gigfinder/_shared/hooks/useVenueAutocomplete.ts`
- `app/gigfinder/add-event/page.tsx`
- `app/gigfinder/edit/[id]/page.tsx`

**Testing Checklist**:
- [ ] Add Event: Create event works
- [ ] Add Event: Venue autocomplete works
- [ ] Edit Event: Load event works
- [ ] Edit Event: Update event works
- [ ] Error handling works
- [ ] Loading states work
- [ ] All shared hooks work

**Commit Message**: `refactor: migrate Add/Edit Event pages to API client`

---

### ✅ Step 8: Migrate Remaining Pages
**Time**: 30 minutes  
**Status**: ⏳ Not Started  
**Depends On**: Step 1

**Pages**:
- QR Scanner (`app/gigfinder/my-gigs/scan/[id]/page.tsx`)

**Current Fetch Calls**:
```typescript
// QR Scanner
const res = await fetch('/api/bookings/scan', {
    method: 'POST',
    body: JSON.stringify({ bookingId, eventId })
});
```

**After Migration**:
```typescript
await api.bookings.checkIn(bookingId, eventId);
```

**Testing Checklist**:
- [ ] QR scanner works
- [ ] Check-in updates booking status
- [ ] Error handling works

**Commit Message**: `refactor: migrate QR Scanner to API client`

---

## ✅ Phase 5: Cleanup & Documentation

### ✅ Step 9: Final Testing & Documentation
**Time**: 1 hour  
**Status**: ⏳ Not Started  
**Depends On**: Steps 1-8

**Tasks**:
1. **Full Regression Test** (30 min)
   - Test all pages end-to-end
   - Verify error handling
   - Check loading states
   - Test edge cases

2. **Update Documentation** (15 min)
   - Update README with API client usage
   - Document API routes
   - Add examples

3. **Code Review** (15 min)
   - Check for any remaining `fetch()` calls
   - Verify all error handling is consistent
   - Ensure types are correct

**Acceptance Criteria**:
- [ ] All pages work correctly
- [ ] No direct `fetch()` calls remain (except in API client)
- [ ] Error handling is consistent
- [ ] Loading states work everywhere
- [ ] Documentation is updated

**Commit Message**: `docs: update API client documentation`

---

## 📊 Progress Tracking

### Migration Status:
```
[ ] Step 1: Create API Client Infrastructure
[ ] Step 2: Migrate My Gigs
[ ] Step 3: Migrate Event Detail
[ ] Step 4: Migrate Guest List
[ ] Step 5: Migrate My Bookings & Results
[ ] Step 6: Merge Add/Edit Event Components
[ ] Step 7: Migrate Add/Edit Event to API Client
[ ] Step 8: Migrate QR Scanner
[ ] Step 9: Final Testing & Documentation
```

### Metrics:
```
Components Migrated: 0/9 (0%)
Fetch Calls Centralized: 0/16 (0%)
Code Duplication: 80% → Target: <20%
Estimated Time Remaining: 8-11 hours
```

---

## 🎯 Success Criteria

### Technical:
- [ ] All fetch calls go through API client
- [ ] Consistent error handling across all pages
- [ ] Type-safe API calls
- [ ] No code duplication in Add/Edit Event
- [ ] All tests pass

### Quality:
- [ ] Better error messages for users
- [ ] Consistent loading states
- [ ] Easier to add new API endpoints
- [ ] Easier to maintain and debug

### Performance:
- [ ] No performance regressions
- [ ] Proper error recovery
- [ ] Graceful degradation

---

## 🚨 Risk Mitigation

### Risks:
1. **Breaking existing functionality**
   - Mitigation: Test after each step, commit frequently

2. **Merge conflicts during Add/Edit merge**
   - Mitigation: Do merge in separate branch, thorough testing

3. **Type mismatches**
   - Mitigation: Define types upfront, use TypeScript strict mode

4. **Performance issues**
   - Mitigation: Monitor bundle size, lazy load if needed

### Rollback Plan:
- Each step is a separate commit
- Can rollback to any previous step
- API client is additive (doesn't break existing code)

---

## 📝 Notes

### Key Decisions:
1. **API Client First**: Foundation before migration
2. **Incremental Migration**: One component at a time
3. **Merge Before Migrate**: Eliminate duplication in Add/Edit before API migration
4. **Test After Each Step**: Ensure stability

### Future Enhancements:
- Add request caching
- Add optimistic updates
- Add request deduplication
- Add offline support
- Add analytics/monitoring

---

## 🎉 Expected Outcomes

### After Completion:
- ✅ 100% of fetch calls centralized
- ✅ Consistent error handling
- ✅ Type-safe API calls
- ✅ 60% reduction in Add/Edit Event code
- ✅ Easier to maintain and extend
- ✅ Better developer experience
- ✅ Better user experience (consistent errors/loading)

**Total Impact**: Professional, maintainable, production-ready API layer!
