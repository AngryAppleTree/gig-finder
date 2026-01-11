# Static Pages CSS Module

**File:** `/app/static-pages.module.css`  
**Created:** 2026-01-11  
**Purpose:** Shared CSS module for all static content pages

---

## 📋 Overview

This CSS module provides consistent styling for all static content pages in the application. It is self-contained with its own font definitions and color variables, ensuring isolation from the GigFinder-specific styles.

---

## 🎯 Pages Using This Module

1. **Terms & Conditions** (`/app/terms/page.tsx`)
2. **Privacy Policy** (`/app/privacy/page.tsx`)
3. **Contact** (`/app/contact/page.tsx`)
4. **Pledge** (`/app/pledge/page.tsx`)

---

## 🎨 Design System

### **Fonts**
- **Primary:** `'Arial Black', 'Arial Bold', sans-serif` (headings, buttons)
- **Secondary:** `'Courier New', monospace` (body text)

### **Colors**
- **Background:** `#0a0a0f` (dark)
- **Surface:** `#050508` (darker cards)
- **Primary:** `#ff3366` (pink - headings, borders)
- **Secondary:** `#00d4ff` (cyan - section headings)
- **Text:** `#e0e0e0` (light gray)
- **Text Dim:** `#aaa` (dimmed text)

---

## 📦 Available Classes

### **Layout**
- `.container` - Main page container
- `.card` - Content card with border
- `.contentWrapper` - Text content wrapper

### **Typography**
- `.heroTitle` - Page title (h1)
- `.sectionTitle` - Main section title (h2)
- `.sectionHeading` - Sub-section heading (h3)
- `.subHeading` - Paragraph with emphasis
- `.lastUpdated` - "Last Updated" text

### **Navigation**
- `.backButtonWrapper` - Centers back button
- `.backButton` - Styled back button

### **Lists**
- `.bulletList` - Unstyled list
- `.bulletItem` - List item
- `.numberedList` - Numbered list
- `.numberedItem` - Numbered list item

### **Links**
- `.link` - Styled link with hover

### **Forms** (for contact page)
- `.formGroup` - Form field wrapper
- `.label` - Form label
- `.input` - Text input
- `.textarea` - Textarea
- `.select` - Select dropdown
- `.btnSubmit` - Submit button

### **Messages**
- `.successMessage` - Success notification
- `.errorMessage` - Error notification

### **Utility**
- `.highlight` - Highlighted text (primary color)

---

## 🔧 Usage Example

```tsx
import styles from '../static-pages.module.css';

export default function TermsPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.heroTitle}>Terms & Conditions</h1>
            
            <div className={styles.backButtonWrapper}>
                <a href="/gigfinder" className={styles.backButton}>
                    ← Back to GigFinder
                </a>
            </div>

            <div className={styles.card}>
                <div className={styles.contentWrapper}>
                    <h2 className={styles.sectionTitle}>
                        📜 Main Title
                    </h2>
                    
                    <h3 className={styles.sectionHeading}>
                        Section Heading
                    </h3>
                    
                    <p>Regular paragraph text...</p>
                </div>
            </div>
        </div>
    );
}
```

---

## ✅ Benefits

1. **Self-Contained:** Own font and color definitions
2. **Isolated:** No conflicts with GigFinder styles
3. **Consistent:** All static pages look the same
4. **Maintainable:** One place to update all static page styles
5. **Reusable:** Easy to add new static pages

---

## 🚀 Migration Plan

**Phase 1:** ✅ Create module (DONE)  
**Phase 2:** Refactor Terms page  
**Phase 3:** Refactor Privacy page  
**Phase 4:** Refactor Contact page (migrate from contact.module.css)  
**Phase 5:** Refactor Pledge page  

---

## 📝 Notes

- This module does NOT use GigFinder's CSS variables
- Font definitions are local to avoid conflicts
- Can be used independently of any other CSS
- Footer component should work correctly with these styles

---

*Module ready for use in static page refactoring*
