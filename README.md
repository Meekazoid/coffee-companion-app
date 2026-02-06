# BrewBuddy - Updated Version with Global Grinder Selector

## 🎉 What's New

This updated version features a **global grinder selector** that has been moved out of individual coffee cards into a sticky header component.

### Key Changes

#### 1. **New Global Grinder Component**
- Sticky horizontal selector positioned between "Add Coffee" section and coffee list
- Always visible while scrolling through your coffee collection
- Minimal vertical space (~60px on desktop)
- Responsive design that stacks vertically on mobile devices

#### 2. **Simplified Coffee Cards**
- Removed individual grinder selectors from each coffee card
- Cards now use the global grinder preference
- Cleaner, less cluttered interface
- Faster brewing workflow

#### 3. **Technical Improvements**
- Single source of truth for grinder selection
- Global state management via `preferredGrinder` variable
- Improved performance (fewer DOM elements)
- Better mobile experience

## 📁 Files Included

1. **index.html** - Main application file with:
   - New global grinder selector component
   - Updated CSS styling
   - Refactored JavaScript functions
   - Removed per-card grinder code

2. **water-hardness.js** - Water hardness database (unchanged)

3. **backend-sync.js** - Backend synchronization module (unchanged)

4. **manifest.json** - PWA manifest (unchanged)

## 🚀 Installation

1. Upload all files to your web server
2. Make sure all files are in the same directory
3. Access `index.html` through your browser
4. The app works offline as a PWA

## ⚙️ How the Global Grinder Works

### UI Location
The grinder selector appears as a sticky bar with two options:
- **Fellow Ode Gen 2** - Decimal settings (e.g., 3.5)
- **Comandante C40 MK3** - Click settings (e.g., 22 clicks)

### Behavior
1. Click either grinder option to switch
2. The selection is saved to localStorage
3. All coffee cards immediately update with new grinder settings
4. The selected grinder stays active across sessions

### Visual Feedback
- Active grinder has accent color background
- Smooth hover animations
- Haptic feedback on mobile (if supported)

## 🎨 Design Features

### Desktop View
- Horizontal layout with label and toggle
- Icon on the left showing grinder symbol
- Two buttons side-by-side

### Mobile View (< 768px)
- Stacks vertically for better touch targets
- Larger buttons for easier selection
- Centered layout

## 💾 Data Persistence

The grinder selection is stored in:
```javascript
localStorage.setItem('preferredGrinder', 'fellow' | 'comandante')
```

This persists across:
- Page refreshes
- Browser restarts
- App updates

## 🔧 Developer Notes

### Key Functions

**`initGlobalGrinder()`**
- Initializes the global grinder selector
- Sets up event listeners
- Loads saved preference from localStorage

**`switchGlobalGrinder(grinder)`**
- Updates UI state
- Saves to localStorage
- Re-renders all coffee cards
- Optional haptic feedback

**`getBrewRecommendations(coffee)`**
- Now uses global `preferredGrinder` variable
- Simplified logic (no per-coffee grinder tracking)

### Removed Code

The following were removed from coffee cards:
- `.grinder-selector` CSS class
- `.grinder-btn` CSS class
- `switchGrinder()` function
- `coffee.selectedGrinder` property

### CSS Classes Added

```css
.global-grinder-selector
.grinder-selector-label
.grinder-icon
.grinder-toggle
.grinder-option
.grinder-name
.grinder-subtext
```

## 🐛 Troubleshooting

### Grinder Selection Not Saving
- Check browser localStorage is enabled
- Clear browser cache and reload
- Check console for JavaScript errors

### UI Not Updating
- Ensure `renderCoffees()` is called after grinder change
- Check that coffee cards are not using old cached HTML

### Sticky Header Not Working
- Verify CSS `position: sticky` is supported by browser
- Check `top` value is appropriate for your layout

## 📱 Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## 🎯 Future Enhancements

Potential improvements for future versions:
- Remember different grinder per coffee origin
- Grinder calibration settings
- Import/export grinder profiles
- Additional grinder models

## 📄 License

See LICENSE file for details.

## 👨‍💻 Credits

Created by Holger Pfahl
Updated: February 2026

---

**Enjoy your precision coffee brewing experience! ☕**
