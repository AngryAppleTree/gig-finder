# 🍝 Spaghetti Code Analysis Report
**Date**: 2026-01-18  
**Project**: GigFinder Application  
**Scope**: Post CSS Module Refactoring  

---

## 📊 Executive Summary

**Overall Code Health**: 6.5/10 (Good, with improvement opportunities)

**Key Findings**:
- ✅ CSS architecture is now excellent (100% CSS Modules)
- ⚠️ Significant code duplication in Add/Edit Event pages
- ⚠️ Large component files (>500 lines)
- ⚠️ No centralized API client
- ⚠️ Repeated fetch patterns
- ✅ Good component separation
- ⚠️ Missing custom hooks for common logic

---

## 🔴 Critical Issues (High Priority)

### 1. **Massive Code Duplication: Add vs Edit Event**
**Severity**: HIGH  
**Files**: 
- `app/gigfinder/add-event/page.tsx` (590 lines)
- `app/gigfinder/edit/[id]/page.tsx` (624 lines)

**Problem**:
These two files share ~80% identical code:
- Venue autocomplete logic (identical)
- Image upload/resize logic (identical)
- Form validation (identical)
- State management (nearly identical)
- UI rendering (95% identical)

**Impact**:
- Bug fixes must be applied twice
- Features must be implemented twice
- High maintenance burden
- Inconsistency risk

**Duplicate Code Blocks**:
```typescript
// DUPLICATED: Venue fetching (both files)
const fetchVenues = async () => {
    try {
        const res = await fetch('/api/venues');
        if (res.ok) {
            const data = await res.json();
            setVenues(data.venues || []);
        }
    } catch (e) {
        console.error(e);
    }
};

// DUPLICATED: Image resize (both files, ~30 lines)
const resizeImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // ... identical 25 lines ...
            };
        };
    });
};

// DUPLICATED: Venue autocomplete (both files, ~40 lines)
const handleVenueInputChange = (value: string) => {
    setVenueInput(value);
    setSelectedVenue(null);
    setIsNewVenue(false);
    
    if (value.trim().length > 0) {
        const filtered = venues.filter(/* ... */);
        setFilteredVenues(filtered);
        setShowVenueSuggestions(true);
    } else {
        setShowVenueSuggestions(false);
    }
};
```

**Recommended Fix**:
Create shared components/hooks:
- `useEventForm()` custom hook
- `useVenueAutocomplete()` custom hook
- `useImageUpload()` custom hook
- `<EventFormFields>` shared component

**Estimated Effort**: 6-8 hours  
**Benefit**: Reduce 1,200 lines to ~400 lines shared + 200 lines each page

---

### 2. **No Centralized API Client**
**Severity**: MEDIUM-HIGH  
**Affected Files**: 16 files with fetch calls

**Problem**:
Every component implements its own fetch logic:
```typescript
// Pattern repeated 16 times across codebase
const res = await fetch('/api/events/user');
if (res.ok) {
    const data = await res.json();
    // ...
} else {
    console.error('Failed');
}
```

**Issues**:
- No centralized error handling
- No request/response interceptors
- No loading state management
- No retry logic
- Inconsistent error messages
- Hard to add auth headers globally

**Recommended Fix**:
Create `lib/api-client.ts`:
```typescript
// Centralized API client
export const apiClient = {
    async get<T>(url: string): Promise<T> {
        const res = await fetch(url);
        if (!res.ok) throw new ApiError(res);
        return res.json();
    },
    
    async post<T>(url: string, data: any): Promise<T> {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new ApiError(res);
        return res.json();
    },
    
    // ... delete, put, etc.
};

// Usage becomes:
const events = await apiClient.get<Event[]>('/api/events/user');
```

**Estimated Effort**: 4-6 hours  
**Benefit**: Consistent error handling, easier testing, better UX

---

## 🟡 Medium Priority Issues

### 3. **Large Component Files**
**Severity**: MEDIUM  
**Files**:
- `EditEventForm`: 586 lines (function within 624-line file)
- `AddEventForm`: 551 lines (function within 590-line file)
- `Wizard.tsx`: 361 lines
- `BookingModal.tsx`: 310 lines

**Problem**:
Single components handling too many responsibilities:
- Form state management
- API calls
- Validation
- UI rendering
- Image processing
- Venue autocomplete
- Draft restoration

**Recommended Fix**:
Break into smaller components:
```
EventForm/
├── EventFormContainer.tsx (main logic)
├── BasicInfoSection.tsx
├── VenueSection.tsx
├── DateTimeSection.tsx
├── PricingSection.tsx
├── ImageUploadSection.tsx
├── TicketingSection.tsx
└── hooks/
    ├── useEventForm.ts
    ├── useVenueAutocomplete.ts
    └── useImageUpload.ts
```

**Estimated Effort**: 8-10 hours  
**Benefit**: Better testability, easier maintenance, clearer responsibilities

---

### 4. **Repeated useEffect Patterns**
**Severity**: MEDIUM  
**Occurrences**: 22 useEffect calls across app

**Problem**:
Common patterns repeated without abstraction:
```typescript
// Pattern 1: Fetch on mount (repeated 8 times)
useEffect(() => {
    if (isLoaded && isSignedIn) {
        fetchData();
    }
}, [isLoaded, isSignedIn]);

// Pattern 2: Auth redirect (repeated 5 times)
useEffect(() => {
    if (isLoaded && !isSignedIn) {
        router.push('/sign-in');
    }
}, [isLoaded, isSignedIn]);
```

**Recommended Fix**:
Create custom hooks:
```typescript
// hooks/useAuthenticatedFetch.ts
export function useAuthenticatedFetch<T>(
    fetcher: () => Promise<T>,
    deps: any[] = []
) {
    const { isLoaded, isSignedIn } = useUser();
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetcher().then(setData).finally(() => setLoading(false));
        }
    }, [isLoaded, isSignedIn, ...deps]);
    
    return { data, loading };
}

// Usage:
const { data: events, loading } = useAuthenticatedFetch(
    () => apiClient.get('/api/events/user')
);
```

**Estimated Effort**: 3-4 hours  
**Benefit**: DRY code, consistent behavior, easier testing

---

### 5. **Missing Error Boundaries**
**Severity**: MEDIUM  
**Affected**: All pages

**Problem**:
No error boundaries to catch runtime errors gracefully.

**Recommended Fix**:
Add error boundaries:
```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
    // ... standard error boundary implementation
}

// app/gigfinder/layout.tsx
export default function GigFinderLayout({ children }) {
    return (
        <ErrorBoundary fallback={<ErrorPage />}>
            {children}
        </ErrorBoundary>
    );
}
```

**Estimated Effort**: 2-3 hours  
**Benefit**: Better UX, error tracking, graceful degradation

---

## 🟢 Low Priority Issues

### 6. **Magic Strings**
**Severity**: LOW  
**Examples**:
```typescript
// Repeated throughout codebase
'/api/events/user'
'/api/bookings'
'/api/venues'
'GIGFINDER_DRAFT_EVENT'
```

**Recommended Fix**:
Create constants file:
```typescript
// lib/api-routes.ts
export const API_ROUTES = {
    EVENTS: {
        USER: '/api/events/user',
        MANUAL: '/api/events/manual',
        BY_ID: (id: string) => `/api/events/${id}`,
    },
    BOOKINGS: {
        BASE: '/api/bookings',
        MY_BOOKINGS: '/api/bookings/my-bookings',
        EMAIL: '/api/bookings/email',
    },
    VENUES: '/api/venues',
} as const;

// lib/storage-keys.ts
export const STORAGE_KEYS = {
    DRAFT_EVENT: 'GIGFINDER_DRAFT_EVENT',
} as const;
```

**Estimated Effort**: 2 hours  
**Benefit**: Type safety, easier refactoring, single source of truth

---

### 7. **Inconsistent Error Handling**
**Severity**: LOW  
**Examples**:
```typescript
// Some places:
console.error(err);

// Other places:
console.error('Failed to fetch');

// Other places:
alert('Error: ' + data.error);

// Other places:
setError('Could not load...');
```

**Recommended Fix**:
Standardize error handling:
```typescript
// lib/error-handler.ts
export function handleApiError(error: unknown, context: string) {
    console.error(`[${context}]`, error);
    
    if (error instanceof ApiError) {
        return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
}

// Usage:
catch (error) {
    const message = handleApiError(error, 'Fetch Events');
    setError(message);
}
```

**Estimated Effort**: 2-3 hours  
**Benefit**: Consistent UX, better debugging, easier error tracking

---

## ✅ What's Already Good

### Strengths:
1. ✅ **CSS Architecture**: 100% CSS Modules, well-organized
2. ✅ **Component Separation**: Good separation of concerns (Wizard, BookingModal, etc.)
3. ✅ **Type Safety**: TypeScript interfaces defined
4. ✅ **Client-Side Routing**: Proper Next.js patterns
5. ✅ **Authentication**: Clerk integration working
6. ✅ **No God Objects**: No single file >700 lines
7. ✅ **Consistent Naming**: Good variable/function naming conventions

---

## 📋 Prioritized Refactoring Roadmap

### Phase 1: High Impact, Medium Effort (Recommended Next)
**Timeline**: 1-2 weeks

1. **Create API Client** (4-6 hours)
   - Centralize all fetch calls
   - Add error handling
   - Add loading states

2. **Extract Shared Event Form Logic** (8-10 hours)
   - Create `useEventForm()` hook
   - Create `useVenueAutocomplete()` hook
   - Create `useImageUpload()` hook
   - Reduce duplication by 60%

3. **Add Error Boundaries** (2-3 hours)
   - Catch runtime errors
   - Improve UX

**Total**: 14-19 hours  
**Impact**: Massive reduction in code duplication, better error handling

---

### Phase 2: Code Organization (Optional)
**Timeline**: 1-2 weeks

4. **Break Up Large Components** (8-10 hours)
   - Split EventForm into sections
   - Split Wizard into steps
   - Split BookingModal into sub-components

5. **Create Custom Hooks** (3-4 hours)
   - `useAuthenticatedFetch()`
   - `useFormValidation()`
   - `useDebounce()`

6. **Add Constants** (2 hours)
   - API routes
   - Storage keys
   - Magic numbers

**Total**: 13-16 hours  
**Impact**: Better maintainability, easier testing

---

### Phase 3: Polish (Nice to Have)
**Timeline**: 1 week

7. **Standardize Error Handling** (2-3 hours)
8. **Add Loading Skeletons** (3-4 hours)
9. **Add Unit Tests** (10-15 hours)
10. **Performance Optimization** (5-8 hours)

**Total**: 20-30 hours  
**Impact**: Production-ready quality

---

## 🎯 Immediate Recommendations

### Start Here (This Week):
1. **Create API Client** - Quick win, high impact
2. **Extract `useVenueAutocomplete()` hook** - Removes biggest duplication

### Next Sprint:
3. **Extract `useEventForm()` hook** - Unifies Add/Edit
4. **Add Error Boundaries** - Better UX

### Future:
5. Component splitting (as needed)
6. Testing (before production)

---

## 📊 Metrics

### Current State:
- **Total Lines**: ~2,900 (app) + ~1,160 (components) = 4,060 lines
- **Duplication**: ~40% (Add/Edit Event)
- **Average File Size**: 200 lines
- **Largest File**: 624 lines (Edit Event)
- **Fetch Calls**: 16 (no centralization)
- **useEffect Calls**: 22 (some duplication)

### After Phase 1 Refactoring:
- **Total Lines**: ~3,200 lines (20% reduction)
- **Duplication**: ~10% (75% improvement)
- **Average File Size**: 150 lines
- **Largest File**: ~400 lines
- **Fetch Calls**: 16 (all centralized)
- **useEffect Calls**: 15 (custom hooks)

---

## 💡 Conclusion

**The codebase is in good shape** after the CSS Module refactoring. The main issue is **code duplication** between Add and Edit Event pages.

**Recommended Action**: Focus on Phase 1 refactoring to:
1. Centralize API calls
2. Extract shared form logic
3. Add error boundaries

This will provide the **biggest impact** for the **least effort** and make the codebase **production-ready**.

**Estimated Total Effort**: 14-19 hours  
**Expected Improvement**: 40% → 10% duplication, centralized error handling, better UX
