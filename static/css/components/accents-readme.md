# Neo-Brutalism Pixel-Art Accent System

## Overview
The pixel-art accent system provides retro-style decorative elements that enhance the Neo-Brutalism aesthetic with pixel-perfect details.

## Available Classes

### Corner Bracket Accents
- `.neo-accent-corner-tl` - Red top-left corner bracket
- `.neo-accent-corner-tr` - Green top-right corner bracket  
- `.neo-accent-corner-bl` - Yellow bottom-left corner bracket
- `.neo-accent-corner-br` - Blue bottom-right corner bracket

### Geometric Shapes
- `.neo-accent-diamond` - Red diamond on right side
- `.neo-accent-triangle` - Green triangle on left side
- `.neo-accent-square` - Yellow square on top-right

### Pixel-Art Icons
- `.neo-icon-pixel .neo-icon-arrow-right` - Pixelated arrow icon
- `.neo-icon-pixel .neo-icon-plus` - Pixelated plus icon
- `.neo-icon-pixel .neo-icon-cross` - Pixelated cross/X icon

### Decorative Borders
- `.neo-accent-pixel-border-top` - Pixel pattern top border
- `.neo-accent-pixel-border-bottom` - Pixel pattern bottom border

### Combined Effects
- `.neo-accent-combo-corners` - Top-left + bottom-right corners
- Multiple classes can be combined for layered effects

## Usage Examples

```html
<!-- Button with corner accent -->
<button class="neo-button neo-accent-corner-tl">Click Me</button>

<!-- Card with multiple accents -->
<div class="neo-card neo-accent-combo-corners neo-accent-pixel-border-top">
  <h3>Card Title</h3>
  <p>Content with pixel accents</p>
</div>

<!-- Form with geometric accents -->
<div class="neo-accent-triangle">
  <input type="text" placeholder="Input with triangle accent">
</div>

<!-- Pixel icons -->
<span class="neo-icon-pixel neo-icon-arrow-right"></span>
```

## Accessibility Features
- High contrast mode support (thicker borders)
- Reduced motion preference respect
- Screen reader friendly (decorative elements don't interfere)
- Maintains color contrast ratios

## Responsive Behavior
- Scales down on mobile devices (< 768px)
- Maintains visual impact across all screen sizes
- Preserves pixel-art aesthetic at all breakpoints