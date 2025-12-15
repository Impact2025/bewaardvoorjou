# Life Journey - Design System (MyStoryBox Inspired)

## 🎨 Color Palette

### Primary Colors
```css
--primary-accent: #00A693         /* Teal/Turquoise - Main brand color */
--primary-accent-dark: #008B7A    /* Darker teal for hover states */
```
**Usage:** Primary buttons, links, focus states, icons

### Secondary Colors
```css
--secondary-accent: #FF8C42       /* Vibrant Orange - Call to action */
--secondary-accent-dark: #F47B3B  /* Darker orange for hover */
--highlight: #FFB84D              /* Warm Yellow - Highlights */
```
**Usage:** Secondary buttons, badges, highlights, important notifications

### Background Colors
```css
--background-light: #FAF7F2       /* Soft cream - Main background */
--background-dark: #1a1a1a        /* Dark mode background */
--card-background: #FFFFFF        /* White cards */
--neutral-light: #F5F2ED          /* Light neutral background */
```

### Text Colors
```css
--text-dark: #333333              /* Main text */
--text-medium: #555555            /* Secondary text */
--text-light: #E0E0E0             /* Light text for dark mode */
```

### Utility Colors
```css
--success: #7BB661                /* Success states */
--warning: #E0AA3E                /* Warning states */
--neutral: #E6E2DD                /* Neutral borders */
```

---

## 📐 Typography

### Font Families
```css
--font-serif: 'Source Serif 4', serif    /* Headings, emotional content */
--font-sans: 'Inter', sans-serif         /* Body text, UI elements */
--font-mono: 'Geist Mono'                /* Code, timestamps */
```

### Font Sizes (Tailwind)
- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)
- **4xl**: 2.25rem (36px)

### Heading Classes
```css
.text-heading         /* Serif, bold, dark */
.text-subheading      /* Serif, medium, gray */
```

---

## 🔲 Components

### Buttons

#### Primary Button (Teal Gradient)
```html
<button class="btn-primary">
  Start Your Journey
</button>
```
**Style:**
- Teal gradient background
- White text
- 12px border radius
- Subtle shadow
- Hover: lift effect

#### Secondary Button (Orange Gradient)
```html
<button class="btn-secondary">
  Learn More
</button>
```
**Style:**
- Orange gradient background
- White text
- 12px border radius
- Subtle shadow
- Hover: lift effect

### Cards
```html
<div class="bg-card rounded-card card-shadow p-6">
  <!-- Content -->
</div>
```
**Style:**
- White background
- 16px border radius
- Subtle shadow
- Hover: stronger shadow

### Input Fields
```html
<input class="input-field focus-teal rounded-button" />
```
**Style:**
- White background
- Soft border
- Teal focus ring
- 12px border radius

---

## 🎭 Shadows

### Card Shadows
```css
.card-shadow        /* Subtle: 0 2px 8px rgba(0,0,0,0.08) */
.card-shadow-hover  /* Medium: 0 4px 16px rgba(0,0,0,0.12) */
```

### Button Shadows
```css
/* Primary button */
box-shadow: 0 4px 12px rgba(0, 166, 147, 0.2);

/* Secondary button */
box-shadow: 0 4px 12px rgba(255, 140, 66, 0.2);
```

---

## 📏 Spacing & Border Radius

### Border Radius
```css
.rounded-card       /* 16px - For cards, containers */
.rounded-button     /* 12px - For buttons, inputs */
.rounded-lg         /* 8px - For small components */
.rounded-full       /* 9999px - For avatars, badges */
```

### Spacing Scale (Tailwind)
- **0**: 0px
- **1**: 0.25rem (4px)
- **2**: 0.5rem (8px)
- **3**: 0.75rem (12px)
- **4**: 1rem (16px)
- **6**: 1.5rem (24px)
- **8**: 2rem (32px)
- **12**: 3rem (48px)

---

## 🎨 Theme Classes

### Background Classes
```css
.bg-cream           /* Soft cream background */
.bg-card            /* White card background */
.bg-teal            /* Teal brand color */
.bg-teal-dark       /* Darker teal */
.bg-orange          /* Orange accent */
.bg-orange-dark     /* Darker orange */
```

### Text Classes
```css
.text-teal          /* Teal text color */
.text-orange        /* Orange text color */
.text-highlight     /* Yellow highlight */
.text-input         /* Input text color */
.text-label         /* Label text color */
.text-medium        /* Medium gray text */
```

### Border Classes
```css
.border-neutral-sand  /* Neutral sand border */
.border-card          /* Card border color */
```

---

## 🎯 Component Examples

### Landing Page Hero
```html
<section class="bg-cream min-h-screen">
  <div class="max-w-7xl mx-auto px-4 py-12">
    <h1 class="text-heading text-4xl md:text-6xl mb-6">
      Preserve Your Memories, Your Way
    </h1>
    <p class="text-medium text-lg mb-8">
      Life Journey helps you capture the moments that matter
    </p>
    <button class="btn-primary">
      Start Free
    </button>
  </div>
</section>
```

### Dashboard Card
```html
<div class="bg-card rounded-card card-shadow p-6 hover:card-shadow-hover transition-shadow">
  <h3 class="text-heading text-xl mb-2">Your Stories</h3>
  <p class="text-medium mb-4">3 stories in progress</p>
  <button class="btn-secondary">
    + New Story
  </button>
</div>
```

### Chapter Card
```html
<div class="bg-card rounded-card card-shadow p-6 border-2 border-transparent hover:border-teal transition-colors">
  <div class="flex items-center mb-4">
    <div class="w-12 h-12 bg-teal rounded-full flex items-center justify-center text-white text-2xl">
      🌱
    </div>
    <h3 class="text-heading text-xl ml-4">Roots</h3>
  </div>
  <p class="text-medium">Waar kom je vandaan?</p>
</div>
```

### Input Form
```html
<form class="space-y-4">
  <div>
    <label class="text-label text-sm font-medium mb-2 block">Email</label>
    <input
      type="email"
      class="input-field focus-teal rounded-button w-full px-4 py-3"
      placeholder="you@example.com"
    />
  </div>
  <button class="btn-primary w-full">
    Sign In
  </button>
</form>
```

---

## 🌗 Dark Mode

### Automatic Theme Switching
```css
[data-theme="dark"] {
  --background: var(--background-dark);
  --foreground: var(--text-light);
  --card-background: #222222;
  --card-border: #444444;
}
```

### Usage
```html
<html data-theme="light">  <!-- or "dark" -->
```

---

## 📱 Responsive Design

### Breakpoints (Tailwind)
```css
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Mobile-First Approach
```html
<div class="text-base md:text-lg lg:text-xl">
  Responsive text
</div>
```

---

## ✨ Animations & Transitions

### Button Hover
```css
transition: all 0.2s ease;
transform: translateY(-2px);
```

### Card Hover
```css
transition: box-shadow 0.3s ease;
```

### Focus States
```css
transition: border-color 0.2s ease;
box-shadow: 0 0 0 3px rgba(0, 166, 147, 0.15);
```

---

## 🎭 Icons

### Icon Style
- Use outline style for consistency
- Teal color for primary icons
- Orange color for action icons
- Size: 20-24px for most cases

### Icon Classes
```html
<svg class="w-6 h-6 text-teal">
  <!-- Icon path -->
</svg>
```

---

## 📊 Status Colors

### Progress States
```html
<span class="bg-success text-white px-3 py-1 rounded-full text-sm">
  Completed
</span>

<span class="bg-orange text-white px-3 py-1 rounded-full text-sm">
  In Progress
</span>

<span class="bg-neutral-sand text-text-dark px-3 py-1 rounded-full text-sm">
  Draft
</span>
```

---

## 🎨 Gradients

### Primary Gradient (Teal)
```css
background: linear-gradient(135deg, #00A693 0%, #008B7A 100%);
```

### Secondary Gradient (Orange)
```css
background: linear-gradient(135deg, #FF8C42 0%, #F47B3B 100%);
```

### Highlight Gradient
```css
background: linear-gradient(135deg, #FFB84D 0%, #FFA726 100%);
```

---

## 🔍 Accessibility

### Contrast Ratios
- Text on cream background: 7:1 (AAA)
- White text on teal: 4.5:1 (AA)
- White text on orange: 4.5:1 (AA)

### Focus Indicators
- Always visible
- 3px ring
- Teal color
- Clear distinction

### Interactive States
- Hover: visual feedback
- Active: pressed state
- Focus: keyboard navigation
- Disabled: reduced opacity

---

## 💡 Best Practices

1. **Consistency**: Use predefined classes
2. **Spacing**: Use Tailwind spacing scale
3. **Colors**: Stick to the palette
4. **Shadows**: Use subtle shadows
5. **Borders**: 12-16px radius
6. **Typography**: Serif for emotion, Sans for UI
7. **Buttons**: Gradients for primary actions
8. **Cards**: White with subtle shadows
9. **Responsive**: Mobile-first approach
10. **Accessibility**: Always test contrast & keyboard

---

**Last Updated**: 2025-10-28
**Version**: 2.0 (MyStoryBox Inspired)
