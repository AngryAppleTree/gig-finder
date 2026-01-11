# Static Pages Global CSS

**File:** `/app/static-pages-global.css`  
**Created:** 2026-01-11  
**Purpose:** Global CSS for Footer and shared elements on static pages

---

## 📋 Overview

This global CSS file provides styles for the Footer component and other shared elements that need global class names (not CSS modules) on static content pages.

---

## 🎯 Why This File Exists

**The Problem:**
- Footer component uses global class names (`.footer`, `.angry-apple-text`, etc.)
- These classes are defined in `gigfinder.css`
- `gigfinder.css` is only loaded for pages under `/gigfinder/`
- Static pages (`/terms`, `/privacy`, etc.) don't get `gigfinder.css`
- Result: Footer looks broken (huge logo, no styling)

**The Solution:**
- Copy Footer styles from `gigfinder.css`
- Put them in a separate global CSS file
- Import on static pages
- Footer now displays correctly

---

## 📦 Styles Included

### **Footer Layout**
- `.footer` - Main footer container
- `.footer-content` - Content wrapper
- `.footer-bottom` - Bottom section with links

### **Logo Section**
- `.logo-container` - Logo and branding wrapper
- `.main-logo` - GigFinder logo (max-width: 200px)
- `.powered-by` - "Powered by" wrapper
- `.powered-text` - "Powered by" text
- `.angry-apple-text` - "Angry Apple Tree" with red border/shadow

### **Responsive**
- Mobile styles for smaller screens

---

## 🔧 Usage

**In static pages:**
```tsx
import '../static-pages.module.css';      // Scoped component styles
import '../static-pages-global.css';      // Global Footer styles
import { Footer } from '../../components/gigfinder/Footer';

export default function TermsPage() {
    return (
        <div className={styles.container}>
            {/* Page content */}
            <Footer />
        </div>
    );
}
```

---

## ⚠️ Important Notes

1. **Hardcoded Values:** This file uses hardcoded color/font values (not CSS variables) to be independent from `gigfinder.css`

2. **Duplication:** Yes, these styles are duplicated from `gigfinder.css`. This is intentional for isolation.

3. **Maintenance:** If you update Footer styles in `gigfinder.css`, you may need to update this file too.

4. **Scope:** Only import this on static pages that need Footer styling.

---

## 📝 Files Using This

- `/app/terms/page.tsx`
- `/app/privacy/page.tsx` (future)
- `/app/contact/page.tsx` (future)
- `/app/pledge/page.tsx` (future)

---

## 🔄 Relationship to Other CSS

```
Static Pages CSS Architecture:
├── static-pages.module.css      ← Scoped component styles
├── static-pages-global.css      ← Global Footer/shared styles (THIS FILE)
└── gigfinder.css                ← GigFinder-specific (NOT loaded on static pages)
```

---

*Global CSS file for Footer consistency across static pages*
