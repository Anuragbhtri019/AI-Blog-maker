# VibeBlog Design System & Tech Style Guide (JavaScript MERN 2026)

## Colour Palette (Tailwind + CSS Variables)
- Primary: #031130 (blue-600) — accents, links, buttons
- Accent: #16a361 (green-600) — trending badge
- Danger: #dc2626
- Background: #0f172a (slate-900) dark default
- Surface: #1e2937
- Text: #f8fafc
- Muted: #64748b

Dark mode mandatory. Light mode optional.

## Typography
- Headings: **Inter** (system fallback: ui-sans-serif)
- Body & Articles: **ui-serif** (Georgia fallback) — optimal reading
- Code: **JetBrains Mono**
- Sizes: h1 2.75rem, Article body 1.125rem (leading-relaxed 1.75)

## Tech Style Rules
- shadcn/ui + Tailwind only (no raw CSS except globals).
- Blog cards: rounded-2xl, soft shadows, hover lift.
- Reading view: max-width 42rem, ample line height.
- Icons: Lucide React.
- Images: Always WebP, lazy-loaded, rounded-2xl.
- Animations: Subtle Tailwind + Framer Motion on scroll.

Every page must feel calm, fast, and premium for long-form reading.