
# Plan: Change Job Detail Cards Blue Ring to Peach

## Summary
The main content cards/blocks on the Job Detail page currently have a blue-tinted ring/glow. This plan will update the styling to use a consistent peach color that matches the site's warm cream aesthetic.

## Current State Analysis
The Job Detail page contains multiple content blocks (About the Role, Skills Required, Eligibility Criteria, Benefits & Perks, etc.) that use:
- `bg-card rounded-2xl shadow-primary p-6 mb-6`

The `shadow-primary` was recently updated in `tailwind.config.ts` to use peach tones:
```
'primary': '0 8px 35px hsl(30 50% 70% / 0.4), 0 4px 20px hsl(35 45% 75% / 0.3)'
```

However, the user is still seeing blue rings. This is likely due to:
1. **Browser caching** of the old CSS
2. **The `--primary` CSS variable** still being set to blue (`210 100% 45%`) which may be used by other utilities

## Changes Required

### 1. Create a Dedicated Peach Shadow Utility
**File:** `tailwind.config.ts`

Add a new `shadow-peach` utility specifically for the Job Detail page cards to ensure the peach glow is applied consistently:
```typescript
boxShadow: {
  'soft': '0 2px 20px hsl(36 25% 70% / 0.2)',
  'card': '0 4px 25px hsl(30 50% 70% / 0.15)',
  'primary': '0 8px 35px hsl(30 50% 70% / 0.4), 0 4px 20px hsl(35 45% 75% / 0.3)',
  'peach-glow': '0 0 0 1px hsl(30 50% 75% / 0.3), 0 8px 35px hsl(30 50% 70% / 0.4), 0 4px 20px hsl(35 45% 75% / 0.3)',
}
```

### 2. Update Job Detail Page Cards
**File:** `src/pages/JobDetail.tsx`

Replace `shadow-primary` with `shadow-peach-glow` on all the main content cards:
- Job Header card (line 140)
- Skills Required card (line 320)  
- About the Role card (line 333)
- Eligibility Criteria card (line 369)
- Benefits & Perks card (line 410)

**Example change:**
```tsx
// Before:
<div className="bg-card rounded-2xl shadow-primary p-6 mb-6">

// After:
<div className="bg-card rounded-2xl shadow-peach-glow p-6 mb-6">
```

### 3. Add Peach Border for Extra Visibility
To ensure the peach ring is clearly visible, add a subtle peach border to the cards:

**File:** `src/pages/JobDetail.tsx`

Update classes to include a peach border:
```tsx
<div className="bg-card rounded-2xl shadow-peach-glow border border-[hsl(30_50%_80%)] p-6 mb-6">
```

## Technical Details

| File | Change Type | Description |
|------|-------------|-------------|
| `tailwind.config.ts` | Add utility | New `shadow-peach-glow` with ring effect |
| `src/pages/JobDetail.tsx` | Update classes | 5 cards updated from `shadow-primary` to `shadow-peach-glow` with peach border |

## Visual Result
- All Job Detail content cards will have a warm peach glow/ring
- The effect will be visible as a subtle peach-tinted shadow and border
- Matches the existing peach theme used elsewhere on the site (job card hover states, featured carousel)
