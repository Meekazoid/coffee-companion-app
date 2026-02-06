# Changelog - BrewBuddy Global Grinder Update

## Version 2.0.0 - February 2026

### ✨ New Features

#### Global Grinder Selector
- **NEW:** Sticky grinder selector component positioned between "Add Coffee" section and coffee list
- **NEW:** Always visible while scrolling through coffee cards
- **NEW:** Minimal UI footprint (~60px height on desktop)
- **NEW:** Responsive mobile layout (stacks vertically on small screens)
- **NEW:** Smooth transitions and hover effects
- **NEW:** Haptic feedback on mobile devices (when supported)

### 🎨 UI/UX Improvements

#### Visual Design
- Added custom grinder icon (gear/cog symbol)
- Active state with accent color highlighting
- Smooth CSS transitions on all interactive elements
- Light/Dark mode compatible design
- Better visual hierarchy

#### Mobile Optimization
- Stacked vertical layout on screens < 768px
- Larger touch targets for easier selection
- Centered alignment for better symmetry
- Optimized font sizes for readability

### 🔧 Technical Changes

#### Refactored Functions

**Added:**
```javascript
initGlobalGrinder()        // Initialize global selector
switchGlobalGrinder()      // Handle grinder switching
```

**Modified:**
```javascript
getBrewRecommendations()   // Now uses global preferredGrinder
renderCoffeeCard()         // Removed grinder selector HTML
```

**Removed:**
```javascript
switchGrinder()            // Old per-card switching logic
```

#### Code Cleanup

**Removed CSS:**
- `.grinder-selector { ... }`
- `.grinder-btn { ... }`
- `.grinder-btn.active { ... }`
- `.grinder-btn:hover { ... }`

**Removed HTML:**
- Per-card grinder selector blocks
- Individual onclick handlers for card grinders

**Removed Data:**
- `coffee.selectedGrinder` property
- Per-coffee grinder state tracking

#### New CSS Classes
```css
.global-grinder-selector       /* Main container */
.grinder-selector-label        /* Left label with icon */
.grinder-icon                  /* SVG gear icon */
.grinder-toggle                /* Button container */
.grinder-option                /* Individual button */
.grinder-name                  /* Main grinder name */
.grinder-subtext               /* Model designation */
```

### 🚀 Performance Improvements

- **Reduced DOM elements:** 1 selector instead of N (where N = number of coffees)
- **Faster rendering:** Less HTML to generate per card
- **Better memory usage:** Single global state instead of per-coffee tracking
- **Smoother animations:** CSS-based instead of JavaScript-heavy

### 📱 Mobile Responsiveness

#### Breakpoints
- **Desktop (>768px):** Horizontal layout
- **Tablet (768px):** Starts vertical stacking
- **Mobile (<400px):** Smaller fonts, tighter spacing

#### Touch Optimizations
- Larger tap targets (min 44x44px)
- No hover-dependent interactions
- Haptic feedback on selection change

### 🐛 Bug Fixes

- Fixed grinder state persistence across page reloads
- Fixed render order issues when switching grinders
- Fixed mobile scroll interference with sticky header
- Fixed z-index layering for modals over grinder selector

### 🔄 Migration Guide

If updating from old version:

1. **Backup your data:**
   ```javascript
   const backup = localStorage.getItem('coffees');
   // Save this somewhere safe
   ```

2. **Replace files:**
   - Upload new `index.html`
   - Keep existing `water-hardness.js`
   - Keep existing `backend-sync.js`
   - Keep existing `manifest.json`

3. **Clear old data (optional):**
   ```javascript
   // Run in console to clean up old grinder selections
   coffees = coffees.map(c => {
       delete c.selectedGrinder;
       return c;
   });
   localStorage.setItem('coffees', JSON.stringify(coffees));
   ```

4. **Test grinder selection:**
   - Click each grinder option
   - Verify localStorage updates
   - Check that brew parameters change

### 📊 File Size Changes

| File | Old Size | New Size | Change |
|------|----------|----------|--------|
| index.html | ~122KB | ~122KB | Same (code reorganization) |
| Total Bundle | ~125KB | ~125KB | No increase |

### ⚙️ Configuration

No configuration changes required. The component works out-of-the-box with:
- Default grinder: Fellow Ode Gen 2
- Saved preference: localStorage `preferredGrinder`
- Sticky position: 20px from top

### 🎯 Testing Checklist

- [x] Desktop layout displays correctly
- [x] Mobile layout stacks vertically
- [x] Grinder selection persists on reload
- [x] All coffee cards update simultaneously
- [x] Sticky positioning works on scroll
- [x] Light/Dark mode compatibility
- [x] Touch targets adequate on mobile
- [x] Haptic feedback on supported devices
- [x] No console errors
- [x] Backward compatible with existing data

### 🔮 Future Roadmap

Planned for next versions:
- [ ] Add more grinder options (Baratza, etc.)
- [ ] Grinder calibration settings
- [ ] Per-origin default grinder preference
- [ ] Export/import grinder profiles
- [ ] Visual grinder comparison tool

### 📞 Support

For issues or questions:
- Check README.md for detailed documentation
- Review browser console for errors
- Verify localStorage is enabled
- Test in private/incognito mode

---

**Full credit to the original BrewBuddy codebase.**

**This update maintains 100% backward compatibility with existing coffee data.**
