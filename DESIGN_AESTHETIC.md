# Mangesh Bide's Site Design Aesthetic

## Overall Theme
**Minimalist Professional Developer Portfolio** — Clean, modern, sophisticated with subtle interactive touches. The design balances professionalism with approachable, warm energy. Not minimal to the point of coldness—there's personality and delight in the interactions and color choices.

---

## Color Palette

### Contrast rule (non-negotiable)

Every color used as **text** must meet WCAG 2.2 SC 1.4.3 (AA): **4.5:1** for normal text, **3:1** for large text (>=24px, or >=18.66px bold). No rounding — `#777777` at 4.47:1 fails. Measure before adding a token; ratios below are measured, not estimated.

An axe audit does not check text that sits on the dotted page background: it reports that text as "incomplete", not as a violation, because the background is a gradient. Before an audit, turn the pattern off with `document.body.style.backgroundImage = 'none'`. On 2026-11-12 this found failures that earlier audits reported as clean.

This is the only evidence-based constraint on color choice. Hue carries no reliable effect on perceived trust or competence (Elliot 2015, *Frontiers in Psychology*, is explicit that applying "color psychology" is premature), so palette decisions are argued from legibility, consistency, and differentiation — never from color-meaning folklore.

### Primary Colors

**Text-safe on light (`#ffffff`):**
- **Emerald**: `#047857` (Emerald-700) 5.48:1. The accent in light mode: links, nav hover, the progress bar and the floating buttons.
- **Blue**: `#2563eb` (Blue-600) 5.17:1. Only in the resume's category palettes. It is not an accent.
- **Body text**: `#4b5563` (Gray-600) 7.56:1 · `#6b7280` (Gray-500) 4.83:1 for small metadata only
- Headings: `#111827` / `#1f2937` (Gray-900/800)

**Text-safe on dark (`#0b0f1a`):**
- **Emerald**: `#34d399` (Emerald-400) 9.95:1 on the page and 7.64:1 on Gray-800 cards. The accent in dark mode.
- `#22d3ee` (Cyan-400) 10.59:1 · `#60a5fa` (Blue-400) 7.53:1. Only in category palettes. Neither is an accent.
- Body text: `#d1d5db` (Gray-300) 12.99:1 · `#9ca3af` (Gray-400) 7.54:1

**Decorative only — never as text:**
- `#3b82f6` (Blue-500) 3.68:1 and `#10b981` (Emerald-500) 2.54:1 both FAIL AA at body size. Fine for fills, borders, glows, and the `theme-color` meta tag. `#059669` (Emerald-600) 3.77:1 also fails as text.

**Backgrounds:** `#ffffff` (light) / `#0b0f1a` (dark). Theme follows `prefers-color-scheme` unless the visitor has toggled, in which case the stored choice wins.

### Accent
The site has one accent hue: Emerald-700 (`#047857`) in light mode and Emerald-400 (`#34d399`) in dark mode. Do not use gradients for text, buttons, the nav underline or the progress bar.

### Color Usage
- **Links**: Emerald-700 light / Emerald-400 dark
- **Hover states**: The same accent for links. Primary buttons go to 90% opacity.
- **Progress bar**: Solid accent
- **Backgrounds**: White (light) / `#0b0f1a` (dark)
- **Borders**: Gray-200 (light) / Gray-700 (dark) — subtle, not heavy
- **Text**: Gray-900 → Gray-100 throughout spectrum
- **Secondary icons/backgrounds**: Gray tinted boxes

---

## Typography

### Font Stack
- **Body and headings**: `Atkinson Hyperlegible Next`, then the system stack. One family for everything.
- **Code**: `Atkinson Hyperlegible Mono`, then the system monospace stack. Use it for code, commands and identifiers only, not for labels.
- Both are variable fonts (weights 200 to 800), self-hosted as Latin subsets in `public/fonts/` with their OFL license files. `Layout.astro` declares the `@font-face` rules and preloads the body font. `tailwind.config.mjs` sets `fontFamily.sans` and `fontFamily.mono`.
- The typeface was designed for legibility. Its zero has a slash and its capital I has serifs, so `0`/`O` and `I`/`l`/`1` cannot be confused. There is no alternate zero.
- The Latin subset has no arrow glyphs. Use an inline SVG for an arrow, not `→` or `←`.

### Type Scales
- **Home statement**: 2rem on phones, 2.5rem from `sm`, semibold, line-height 1.14, tight tracking. It is the largest text on the site.
- **H1**: 2.25rem (text-4xl), bold, tight tracking. On the homepage the H1 is the name at 1.25rem, beside the avatar.
- **H2**: 1.5rem (text-2xl), bold, tight tracking
- **H3**: 1.25rem—1.5rem (text-xl—2xl), bold or semibold
- **Body**: 1rem—1.125rem (text-base—lg), color-dependent on context
- **Small**: 0.75rem—0.875rem (text-xs—sm), for metadata, timestamps
- **Line Heights**: Default 1.5-1.6 for body, 1.2-1.3 for headings, tight for display text

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## Layout & Spacing

### Content Width
- **Max-width Container**: `max-w-4xl` (56rem / 896px) for most pages
- **Side Padding**: 1rem (0.25rem on mobile) — generous whitespace
- **Vertical Spacing**: 
  - Section gaps: 2.5rem—4rem
  - Component gaps: 1rem—1.5rem
  - Internal padding: 1.5rem—2rem

### Grid System
- **Project Cards**: 2 columns on desktop, 1 column mobile
- **Responsive breakpoints**: Tailwind defaults (md: 768px, lg: 1024px)
- **Alignment**: A centered column with generous margins. Inside it, text is left-aligned on one reading edge.

### Whitespace Philosophy
Generous, clean whitespace. Never cramped. The site breathes. This creates a premium, uncluttered feel.

---

## Component Design Patterns

### Cards
```css
/* Default Card Style */
- Background: White (light) / Gray-800 (dark)
- Border: 1px solid Gray-200 / Gray-700
- Border-radius: 0.5rem (rounded-lg)
- Shadow: Shadow-sm (subtle) to shadow-md (on hover)
- Padding: 1.5rem—2rem
- Hover Effect: Translate up (-4px), enhanced shadow
```

### Buttons & CTAs
- **Primary**: Solid Gray-900 with white text (Gray-100 with Gray-900 text in dark mode)
- **Secondary**: Gray background, border or outline style
- **Hover State**: Buttons change opacity or background only. Only cards that are links lift on hover.
- **Border-radius**: rounded-lg (0.5rem)
- **Font-weight**: Medium—Bold (500—700)

### Navigation Links
- **Underline Effect**: Animated underline that grows on hover (left to right)
- **Underline Color**: Solid accent (Emerald-700 light / Emerald-400 dark)
- **Hover Color**: The accent
- **Transition**: 0.3s ease

### Borders
- **Style**: Clean, subtle 1px borders
- **Color**: Gray-200 (light) / Gray-700 (dark)
- **Usage**: Cards, input fields, dividers
- **Radius**: 0.5rem to 1rem (rounded-lg to rounded-2xl)

### Shadows
- **Light mode**: Subtle, soft shadows (0 1px 3px rgba(0,0,0,0.1))
- **Dark mode**: Stronger shadows to create separation (0 10px 25px rgba(0,0,0,0.3+))
- **Hover shadows**: Double in intensity
- **No hard shadows** — everything is soft and approachable

---

## Animation & Motion

### Scroll Animations (Intersection Observer)
- **Fade Up**: `opacity: 0` → `8`, `translateY: 30px` → `0`
- **Slide Left/Right**: `translateX: -30px/+30px` → `0`
- **Scale**: `scale: 0.95` → `1`
- **Timing**: 0.6s with cubic-bezier(0.4, 0, 0.2, 1) easing
- **Stagger Delays**: 0.1s, 0.2s, 0.3s... for lists

### Hover Effects
- **Cards**: Lift up 6px, scale 1.02
- **Buttons**: Lift up 2—4px, shadow enhancement, subtle scale
- **Links**: Underline animation in 0.3s, text color transition
- **Icons**: Slight rotation or scale on hover

### Transitions
- **Default**: 0.3s with cubic-bezier(0.4, 0, 0.2, 1) (standard easing)
- **Colors**: 0.3s
- **All**: Used sparingly on interactive elements
- **Disable for accessibility**: `prefers-reduced-motion` respected

### Custom Animations
- **Pulse**: Subtle scale pulse in lists (1 → 1.05 → 1)
- **Float**: Subtle vertical bounce (6s ease-in-out infinite)
- **Shimmer**: Loading state with gradient sweep (1.5s infinite)
- **Theme Toggle Rotate**: 180deg rotation on theme button hover. The button keeps its gray background.

### Motion Philosophy
- **Purposeful**: All animations have a reason (feedback, attention, delight)
- **Subtle**: Nothing jarring or excessive
- **Fast**: 0.3—0.6s range for most animations
- **Smooth**: Cubic-bezier easing, never linear (except for continuous animations like shimmer/float)

---

## Dark Mode

### Implementation
- **Method**: Class-based dark mode using `dark:` Tailwind prefix
- **Trigger**: Theme toggle in navbar (persists in localStorage)
- **Smooth Transition**: 0.3s color transition on body/elements
- **Background Pattern**: Both light and dark have subtle dot patterns

### Light Mode
- **Background**: White with subtle 28x28px dot pattern (`rgba(0,0,0,0.07)`)
- **Text**: Dark gray
- **Borders**: Light gray
- **Shadows**: Soft and subtle

### Dark Mode
- **Background**: `#0b0f1a` with subtle 28x28px dot pattern (`rgba(255,255,255,0.05)`)
- **Text**: Light gray
- **Borders**: Dark gray (Gray-700)
- **Shadows**: Stronger, more visible
- **Overall**: Professional, maintains readability while feeling premium

---

## Background Patterns

Both light and dark modes have a **subtle dot pattern background**:
```css
/* Light */
background-image: radial-gradient(rgba(0, 0, 0, 0.07) 1.5px, transparent 1.5px);
background-size: 28px 28px;

/* Dark */
background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1.5px, transparent 1.5px);
background-size: 28px 28px;
```
The pattern is subtle enough to not compete with content but adds texture and visual interest. Avoid looking too flat.

---

## Visual Hierarchy

### Contrast Levels
1. **Primary CTA**: Solid Gray-900 button (Gray-100 in dark mode)
2. **Secondary**: Outlined or gray button
3. **Tertiary**: Text link with underline animation
4. **Disabled**: Grayed out with reduced opacity (0.5—0.7)

### Size-based Hierarchy
- **Headlines**: 2.5—3.25rem for hero, 1.5—1.875rem for section headers
- **Body**: 1rem—1.125rem
- **Metadata**: 0.75rem (uppercase, letter-spacing)
- Hierarchy is clear and consistent

---

## Component-Specific Details

### Navigation Bar
- **Style**: Sticky, with backdrop blur and reduced opacity (0.9)
- **Border**: Bottom border in Gray-200/700
- **Transitions**: Color transitions 0.3s
- **Desktop**: Horizontal nav with dropdown menus on hover
- **Mobile**: Hamburger menu with smooth transitions
- **Logo/Brand**: Bold text "by mangesh", uses nav-link hover color (emerald)

### Hero Section
- **Layout**: Left-aligned. From `lg` it has two columns: the text, and a ruled list of results from the current job.
- **Identity row**: 64px round avatar, then the name (the H1) and the headline.
- **Statement**: The tagline from `src/data/identity.ts`, set as the largest text on the site.
- **Results list**: `highlights` in `src/data/resume.json`. Each figure is quoted from an experience bullet, and the build fails if the two disagree.
- **Actions**: One primary button (Resume), one outlined button (email), then plain accent links.
- **Motion**: None. The hero is visible from the first paint.

### Project Cards
- **Layout**: 2-column grid (desktop), single column (mobile)
- **Style**: White/Gray-800 background, subtle border, rounded corners
- **Still**: A 3:2 product illustration at the top, one file per theme (`image` and `imageDark` in the portfolio entry). The stills are 840x560 and show at 420px wide. Their sources and the steps to rebuild them are in `design/stageshow/`.
- **Hover**: Lift effect, shadow enhancement, text color change on title
- **Content**: Title, description, the first three stack chips, month and year
- Earlier work has no card. It is a plain ruled list on `/portfolio/`.

### Footer
- **Background**: Matches body background
- **Border**: Top border for separation
- **Spacing**: Generous vertical padding
- **Content**: Centered, with social links and copyright

### Reading Progress Bar
- **Style**: Fixed top, height 1 (4px)
- **Color**: Solid accent (Emerald-700 light / Emerald-400 dark)
- **Animation**: Smooth width transition (0.3s)
- **Z-index**: 50 (above content)

---

## Accessibility & Polish

### Focus States
- **Visible focus indicators** for keyboard navigation
- **High contrast** for readability
- **Color not the only indicator** (icons, text, borders used together)

### Motion
- **Respects** `prefers-reduced-motion` media query
- **No autoplaying animations**
- **User-initiated animations** (hover, scroll) are crisp and purposeful

### Typography
- **Line-height**: Generous (1.5—1.6) for readability
- **Letter-spacing**: Used with uppercase text (0.05em typical)
- **Max-width**: Limited to prevent eye strain on long-form content
- **Font sizes**: Never too small (minimum 14px for body text)

---

## Design Principles Summary

1. **Minimalist, Not Minimal**: Clean and uncluttered, but with personality and warmth
2. **Developer-Focused**: Professional, no-nonsense aesthetic that respects the audience
3. **Subtle Sophistication**: Animations, shadows, and gradients are understated and purposeful
4. **High Contrast**: Clear information hierarchy and readable text
5. **Generous Whitespace**: Content has room to breathe
6. **Accessibility-First**: Motion, colors, and contrast checked against WCAG standards
7. **Responsive by Default**: Mobile-first design, not an afterthought
8. **Warm & Approachable**: The emerald accent and the friendly, open typeface add warmth
9. **Smooth Interactions**: All transitions are 0.3—0.6s with easing, never harsh
10. **Dark Mode Parity**: Both modes are equally polished, not afterthoughts

---

## Chatbot Design Recommendations

To match this aesthetic when redesigning the chatbot:

### Colors
- Use **Emerald-700** (#047857) for filled controls and the user bubble. White text on it is 5.48:1.
- Use **Emerald-400** (#34d399) for links in dark mode.
- Do not use gradients.
- Dark backgrounds (Gray-900 / near-black) for chat windows when in dark mode
- White backgrounds with subtle borders for light mode

### Typography
- Keep headings **bold** (700 weight)
- Use the **site font** for general text (no serif)
- Use the **site monospace font** for code snippets or system responses
- Maintain **1.5rem+ line-height** for readability

### Animations
- Fade-in messages as they arrive (0.3—0.6s)
- Subtle hover lift on clickable buttons
- Smooth color transitions on state changes
- Typing indicator with gentle pulse or float animation
- No jarring animations; all motion should feel natural

### Spacing
- Generous **padding inside components** (1.5rem—2rem minimum)
- **Message bubbles** with rounded corners (rounded-lg) and subtle shadows
- Clear separation between user and assistant messages
- Not cramped—let content breathe

### Dark Mode
- Full dark mode support with `.dark:` variants
- Use Gray-900 for background, Gray-100 for text
- Stronger shadows in dark mode for separation
- Ensure sufficient contrast (WCAG AA minimum)

### Components
- Use **card-like message bubbles** with borders and backgrounds
- Implement **hover effects** (lift, shadow enhancement) on interactive elements
- Use **status badges** with colored backgrounds (blue, emerald, etc.)
- Include **transition states** for loading, sending, and received messages

### Overall Feel
Keep the chatbot **professional but warm**, **clean but delightful**, and **accessible without compromising aesthetics**. Match the site's color palette exactly, respect the same spacing and animation principles, and maintain the minimalist-with-personality vibe.
