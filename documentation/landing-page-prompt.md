# Claude Landing Page Prompt — Next.js + Framer Motion Edition

> **Exact usage order:**
> 1. Paste this file into a new Claude conversation
> 2. Attach your app context MD file
> 3. Say: "Build the landing page"
>
> **Why this order:** Guidelines set Claude's mental frame and behavioral constraints first. Your app context fills in the specifics second. Reversing this order weakens both — Claude forms premature assumptions before the frame is established, and those early impressions are sticky.

---

## ROLE & MISSION

You are a world-class frontend designer, conversion copywriter, and React/Next.js engineer. Your job is to build a landing page that is visually stunning, psychologically persuasive, and production-grade — not generic AI output.

Every decision — layout, copy, color, animation, visual hierarchy — must feel made by a human with strong taste, clear strategy, and deep understanding of how people read, feel, and decide.

---

## PHASE 1 — THINK BEFORE YOU BUILD

Do not write a single line of code until you have thought through everything below.

### Understand the Product
- Who is this for? Name the exact type of person.
- What pain do they feel before using this? What does life look like after?
- What is the single most compelling reason to sign up today?
- Who are the competitors, and what makes this unmistakably different?

### Commit to One Aesthetic Direction
Pick one extreme and own it completely. Examples: brutally minimal, maximalist editorial, warm and tactile, cold and precise, retro-technical, luxury refined, playful toy-like, brutalist/raw. Do not blend aesthetics randomly — mixed aesthetics communicate indecision.

**Ask yourself:** What is the one thing a visitor will remember about this page 10 minutes after leaving?

### Plan the Narrative Arc
A landing page is a story. Map its arc before coding:
- Hero → establish the dream outcome in seconds
- Problem → make the visitor feel understood
- Solution → reveal the product as the direct answer
- Features → prove the promise with specifics
- Social Proof → remove doubt with real evidence
- CTA → a clear, low-friction next step

### Check the Context Document
Before designing anything, read the attached app context file carefully. Extract: the exact target user, the brand's design tokens (colors, fonts), the product's emotional tone, and the key differentiators. Everything below must serve what's in that document.

---

## PHASE 2 — COPYWRITING RULES

Copy is the single most important element on a landing page. Beautiful design with weak copy fails. Strong copy with decent design converts. Write copy first, design around it.

### The Headline — Most Critical Element
- Must answer "What's in it for me?" in under 5 seconds
- Lead with the benefit, not the feature — sell the outcome, not the tool
- Apply the 4-U test: Useful, Unique, Urgent, Ultra-specific. Hit at least 3.
- Write in second person — "you" and "your" — a direct one-on-one conversation
- Never use: "next-level", "seamless", "powerful", "innovative", "cutting-edge", "revolutionize"
- Weak: "The future of productivity is here." Strong: "Write your full weekly report in 4 minutes."

### Subheadline
- One sentence that expands on the headline
- Covers: who it's for + how it works if the headline focused on the what
- Maximum 2 lines

### Body Copy
- Write as if speaking to one specific person, not an audience
- Plain language — never sacrifice clarity for cleverness
- Every sentence is about the reader's benefit, not your features
- Sell outcomes not mechanics: not "300hp engine" but "0–60 in 4.2 seconds"
- Body paragraphs: 3 lines maximum. Use sub-headings for scannability.
- 79% of visitors scan rather than read every word. Design and write for scanners.

### Developer Audience Adjustments
If the target user is a developer or technical person:
- Skip fluffy metaphors — be direct and specific
- Show what the product actually does, technically, in plain terms
- Use real numbers, real metrics, real constraints
- They distrust vague claims — prove everything with specifics
- They respond to: "works with your existing workflow", "zero config", "open source", "ships in minutes"
- They are skeptical by default — earn trust, don't assume it

### CTA Copy
- Format: action verb + specific outcome. "Start building for free" not "Submit."
- First-person converts better: "Get my free trial" vs "Get your free trial"
- Add microcopy below the button handling the top objection (cost, commitment, complexity): "No credit card required. Cancel anytime."
- Final CTA should restate the value from a different angle — not a verbatim repeat of the hero CTA

### Voice
- Conversational, confident, never pushy or hype-driven
- Visitors can detect desperation. Avoid it.
- Match the exact brand tone described in the app context. Stay consistent throughout.

---

## PHASE 3 — PSYCHOLOGY & CONVERSION PRINCIPLES

These are not tricks. They are how people actually think, feel, and decide.

### First Impression — The 50ms Rule
Users form aesthetic trust judgments in 50 milliseconds — before reading a single word. A clean layout and strong hierarchy signal credibility instantly (Halo Effect). A cluttered or generic-looking page signals low quality regardless of the actual product quality. Design the first frame like a billboard.

### Cognitive Fluency
The brain trusts things that are easy to process. When copy is clever or complex, it creates cognitive friction. Simple, direct language feels more credible — not less. Complexity reads as hiding something.

### Rule of One — Single Conversion Goal
One page. One offer. One primary CTA. When visitors face multiple competing actions (sign up, read blog, watch video, follow on X), they do none. Every element on the page must serve the one goal.

### Visual Hierarchy of Trust
Guide the eye deliberately. Biggest text = most important idea. Highest contrast element = CTA. Supporting content = visually secondary. White space is not emptiness — it is directed attention. It tells the eye where to go.

### Social Proof — Bandwagon Effect
People follow people. Social proof eliminates uncertainty and builds belonging. Use: testimonials with real names and photos, user or customer counts, recognizable logos, media mentions, star ratings. Place social proof near the CTA — not only at the page bottom. Authentic proof converts. Polished or vague testimonials backfire.

### Authority Bias
Credibility signals matter: press mentions, awards, certifications, expert endorsements. Use them — but don't overload the hero with every badge you own. Restraint communicates confidence. Cluttering the hero looks desperate.

### Loss Aversion
People are more motivated by avoiding loss than acquiring gain. "Don't lose another hour to manual X" can outperform "Save time with X." Use both aspirational framing and loss framing depending on the section.

### Anchoring
Show the premium option or full price before the discounted one. Show the largest or most complete plan first. The first number a user sees anchors their entire perception of value.

### Reduce Friction Ruthlessly
Every extra form field, every unclear step, every moment of hesitation costs conversions. Minimum necessary fields. Obvious buttons. The next step should require zero thought.

---

## PHASE 4 — VISUAL DESIGN RULES

### Visual Hierarchy — Non-Negotiable
Before writing any code, establish a priority stack:
1. Primary: Headline and CTA — these must dominate
2. Secondary: Sub-headline, key benefits, section headers
3. Tertiary: Body text, footnotes, supplementary detail

Use size, contrast, color, and whitespace to express hierarchy — but not all four simultaneously on the same element. One tool per level.

### Typography
- Use distinctive, characterful fonts from Google Fonts — loaded via `next/font/google`
- Pair a bold display font with a refined body font that has a contrasting personality
- Never use: Inter, Roboto, Arial, system-ui, or Space Grotesk — they are invisible, forgettable, and scream "AI default"
- Vary weight, size, and letter-spacing aggressively to establish hierarchy
- Body text: 16px minimum. Line-height 1.5–1.75. Line length 65–75 characters max.
- If the app context specifies brand fonts, use those exactly

### Color
- Commit to one dominant color and one sharp accent — defined as Tailwind CSS variables or inline style tokens
- If the app context specifies brand colors, use them precisely
- Avoid: purple gradient on white, generic SaaS blue, flat grey everywhere
- Use color psychology intentionally: blue = trust, green = growth/safety, orange = energy/action, teal = precision/tech
- CTA button must have the highest contrast element on the entire page
- Verify all text against background at 4.5:1 contrast ratio minimum

### Layout & Composition
- Use unexpected, intentional layouts: asymmetry, overlapping elements, diagonal flow, grid-breaking sections
- At least one section must break the predictable centered-column grid
- Generous negative space OR controlled density — not both randomly mixed
- Never use a card grid as the only layout treatment for every section
- Above the fold: value proposition + CTA must be visible without scrolling on desktop AND mobile

### Backgrounds & Visual Depth
- Never use a flat solid color for the entire page — add depth and atmosphere
- Use: gradient meshes, noise textures, geometric patterns, layered transparencies, grain overlays, glowing elements, dramatic shadows
- Hero background sets the emotional tone for everything below — it is the most important canvas

### Component Library References
Before building custom components, check these sources for polished, copy-paste React components:
- **Aceternity UI** (aceternity.com/components) — for complex animated components: glowing cards, moving borders, spotlight effects, beam backgrounds
- **shadcn/ui** (ui.shadcn.com) — for clean utility components: buttons, badges, dialogs, tabs
- **React Bits** (reactbits.dev) — for creative standalone animations and interactive components
- **Magic UI** (magicui.design) — for animated number counters, animated beams, shimmer effects
- Choose components that match your aesthetic direction — do not mix styles from multiple libraries

---

## PHASE 5 — ANIMATION SYSTEM (Framer Motion)

All animations must be implemented with Framer Motion (`framer-motion`). Follow these patterns and principles.

### Core Principles
- Every `motion` component must be in a `"use client"` file
- Always wrap animation groups with `AnimatePresence` when elements conditionally mount/unmount
- Always include `prefers-reduced-motion` support: `const prefersReducedMotion = useReducedMotion()` — disable or simplify animations when true
- Animate `transform` and `opacity` only for performance. Never animate `width`, `height`, `top`, `left` — use `scaleX`, `scaleY`, `x`, `y` instead
- `viewport={{ once: true }}` on scroll-triggered animations — they should not replay on scroll back

### Animation 1 — Text Reveal (Hero Headline)
The signature entrance. Split the headline by words or characters, stagger them in with blur + upward motion.
```tsx
// Character-by-character with blur — most dramatic
const chars = text.split("")
<motion.span
  initial={{ opacity: 0, filter: "blur(8px)", y: 12 }}
  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
  transition={{ duration: 0.4, delay: index * 0.03, ease: [0.25, 0.4, 0.25, 1] }}
/>

// Word-by-word — cleaner, faster feel
<motion.span
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
/>
```
**Flipping/rotating variant:** For taglines that cycle through multiple values, use `AnimatePresence` with `exit={{ rotateX: -90, opacity: 0 }}` and `initial={{ rotateX: 90, opacity: 0 }}` — gives a slot-machine flip effect. Pair with `style={{ perspective: 800 }}` on the container.

### Animation 2 — Modals & Overlays
Fast, snappy, never sluggish. Scale-in from slightly below center.
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.92, y: 8 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95, y: 4 }}
  transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
/>
// Backdrop
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.15 }}
  className="fixed inset-0 bg-black/60 backdrop-blur-sm"
/>
```
Rule: modal open ≤ 200ms, modal close ≤ 150ms. Closing should always feel faster than opening.

### Animation 3 — Progressive Blur (Section Fade Edges)
Creates depth at section boundaries — content fades into background rather than hard-cutting.
```tsx
// CSS implementation — add to bottom of any section
<div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
  style={{
    background: "linear-gradient(to bottom, transparent 0%, rgba(9,9,15,0.6) 40%, rgba(9,9,15,1) 100%)"
  }}
/>
// With blur layering — stack multiple for depth
// Layer 1: blur(4px), opacity 0.3
// Layer 2: blur(12px), opacity 0.5
// Layer 3: solid fill, opacity 1
```
Use on: hero section bottom, feature section transitions, anywhere content should "emerge" rather than start abruptly.

### Animation 4 — Glowing Borders & Gradient Cards
Animated gradient that rotates around the card border, creating a subtle living glow.
```tsx
// CSS conic-gradient rotation approach
<div className="relative rounded-xl p-[1px] overflow-hidden">
  <div
    className="absolute inset-0 rounded-xl"
    style={{
      background: "conic-gradient(from var(--angle), transparent 70%, #00d4aa 80%, transparent 90%)",
      animation: "rotate 4s linear infinite"
    }}
  />
  <div className="relative rounded-xl bg-[#111118] p-6">{children}</div>
</div>
// @keyframes rotate { from { --angle: 0deg } to { --angle: 360deg } }

// Framer Motion variant — for hover-triggered glow
<motion.div
  whileHover={{ boxShadow: "0 0 20px 2px rgba(0,212,170,0.3), 0 0 40px 4px rgba(0,212,170,0.1)" }}
  transition={{ duration: 0.3 }}
/>
```
Rules: keep glow subtle — 20–30% opacity maximum. Glow color should match the accent, not contrast against it. Animated borders work best on feature cards and CTAs. Never use on every card simultaneously.

### Animation 5 — Number Counters (Stats Section)
Numbers that count up on scroll entry. High impact for stats strips.
```tsx
// useMotionValue + useTransform approach
const count = useMotionValue(0)
const rounded = useTransform(count, Math.round)
useEffect(() => {
  const controls = animate(count, targetValue, {
    duration: 1.8,
    ease: [0.16, 1, 0.3, 1], // easeOutExpo — fast start, gentle finish
    delay: index * 0.1 // stagger multiple counters
  })
  return controls.stop
}, [isInView])
<motion.span>{rounded}</motion.span>
// Pair with suffix text ("+", "k", "%") rendered alongside
```
Trigger with `useInView` — counters should only fire when the stats section scrolls into view, not on page load.

### Animation 6 — Scroll-Driven Animations
Two distinct patterns — use the right one for each context.

**Scroll-triggered (enter viewport, animate once):** For section reveals, feature cards, testimonial cards
```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
/>
// Stagger children using variants
const container = { visible: { transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }
```

**Scroll-linked (continuously driven by scroll position):** For parallax effects, progress indicators, sticky elements that transform as user scrolls
```tsx
const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
const y = useTransform(scrollYProgress, [0, 1], [60, -60]) // parallax
const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1])
```
Use scroll-linked sparingly — it's powerful but expensive. Avoid it on mobile unless tested for performance.

### Animation 7 — Popovers & Tooltips
Fast and snappy. Popovers should feel instant, not delayed. Use spring physics.
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.88, y: -6 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.92, y: -4 }}
  transition={{ type: "spring", stiffness: 400, damping: 28 }}
/>
```
Rules: open delay ≤ 100ms, never add artificial delay to popovers. The spring easing makes them feel physical and satisfying rather than mechanical.

### Animation 8 — Layout Animations
When elements reorder, resize, or shift — Framer Motion's layout engine animates the transition automatically.
```tsx
// On any element that changes position or size
<motion.div layout layoutId="unique-id" />

// For shared element transitions between states (e.g. card expanding to modal)
// Use matching layoutId on source and destination element
<motion.div layoutId="card-123" /> // list view
<motion.div layoutId="card-123" /> // expanded modal view

// Animate list reordering
<AnimatePresence>
  {items.map(item => (
    <motion.div key={item.id} layout exit={{ opacity: 0, scale: 0.8 }} />
  ))}
</AnimatePresence>
```
Layout animations are zero-cost in terms of implementation but extremely high-value visually. Use them on any dynamic list, filter UI, or expanding element.

### Animation 9 — Footer Entrance
The footer is the last thing a user sees. Make it memorable. Options:

**Staggered link reveal:**
```tsx
const links = { visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const link = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
```
**Large display text reveal (editorial footer):**
```tsx
// Oversized brand name that reveals on scroll — clip reveal technique
<div style={{ overflow: "hidden" }}>
  <motion.h2
    initial={{ y: "100%" }}
    whileInView={{ y: "0%" }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
  />
</div>
```
**Ambient glow pulse on CTA in footer:**
```tsx
<motion.div
  animate={{ opacity: [0.4, 0.8, 0.4] }}
  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
  className="absolute inset-0 rounded-full bg-[--accent] blur-3xl"
/>
```

### Animation 10 — Ambient / Shader-Style Backgrounds
CSS-based mesh gradients and animated backgrounds that create atmosphere without WebGL.
```tsx
// Animated gradient mesh — CSS only
<div className="absolute inset-0 overflow-hidden -z-10">
  <div
    className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full opacity-20 blur-3xl"
    style={{
      background: "radial-gradient(circle, #00d4aa, transparent 70%)",
      animation: "drift 8s ease-in-out infinite alternate"
    }}
  />
  <div
    className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full opacity-15 blur-3xl"
    style={{
      background: "radial-gradient(circle, #5b6fff, transparent 70%)",
      animation: "drift 10s ease-in-out infinite alternate-reverse"
    }}
  />
</div>
// @keyframes drift { from { transform: translate(0,0) scale(1) } to { transform: translate(30px, 20px) scale(1.05) } }

// Noise texture overlay — adds film grain that makes gradients feel premium
<div
  className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
  style={{ backgroundImage: "url(\"data:image/svg+xml,...\")" }} // SVG noise pattern
/>
```

### General Animation Rules
- Page load: stagger hero elements with `animation-delay` or Framer `delayChildren` — creates a sense of arrival
- Never animate more than 5 elements simultaneously — focus attention, don't scatter it
- Easing reference: `[0.25, 0.4, 0.25, 1]` for standard ease-out, `[0.76, 0, 0.24, 1]` for dramatic entrance, `[0.16, 1, 0.3, 1]` for easeOutExpo
- Spring settings: `stiffness: 300–500, damping: 25–35` for snappy UI, lower stiffness for floaty effects
- All durations: micro (100–150ms), standard (200–400ms), dramatic (500–800ms). Nothing above 1s unless scroll-driven.

---

## PHASE 6 — SECTION-BY-SECTION GUIDE

Each section has exactly one job. Do not skip or blur these responsibilities.

### Nav / Header
Logo on left + one CTA button on right matching the hero CTA. Nothing else. No nav links that take users off the page. Sticky on scroll — add `backdrop-blur` + slight background opacity when scrolled. Never cover body content — pad the page top by the nav height. Animate nav items in on load with stagger.

### Hero
Headline (benefit-led, specific, animated with text-reveal). Sub-headline (1–2 lines: who it's for + how it works). One primary CTA button. Microcopy below button handling the biggest objection. A supporting visual showing the actual product — a real screenshot, UI mockup, or interactive demo — never a stock photo. Optionally: 2–3 social proof signals (star rating, user count, press logos). The hero visual should have a subtle entrance animation (scale from 0.96 + fade, with slight shadow glow).

### Stats Strip
4–5 metrics that establish credibility through specificity. Animate each number counting up when scrolled into view. Numbers must be real and verifiable — invented metrics destroy trust with technical audiences. Short label below each number.

### Problem Section
Make the visitor feel seen and understood. Describe the pain without naming your product. Use their language — the exact words they'd use to describe the frustration. This section should feel like you read their journal. Three pain points work well as cards or a horizontal layout.

### Solution / Features
Reveal the product as the direct answer to every pain just described. Lead with outcomes, support with features. 3–5 capabilities, each with a sharp headline and one-sentence explanation. Show the product in context: screenshots, UI mockups, or interactive demos. Bento grid layouts work well here for visual density.

### Social Proof
Named testimonials with photos, job title, and company. No generic testimonials — they read as fabricated. Logos of recognizable customers or press mentions. Metrics if available. Place at least one testimonial directly adjacent to the primary CTA — not only at the page bottom. For developer products: GitHub stars, npm downloads, "used by engineers at X" format resonates.

### Pricing (if included)
2–3 tiers. Visually highlight the recommended plan (border, scale, badge). Use anchoring — show premium or most complete plan first. Each tier: name, price, one-line description of who it's for, 3–5 key inclusions, CTA. Animate tier cards staggering in on scroll.

### Final CTA Section
Restate the value from a different angle — not a repeat of hero copy. One CTA button. One trust signal (testimonial, stat, or guarantee). Add ambient glow or visual emphasis — this is the conversion moment.

### Footer
Minimal. Logo, tagline, nav links, legal links, social icons. Consider a large typographic treatment of the brand name as a visual close. Stagger link groups in on scroll.

---

## PHASE 7 — NEXT.JS CODE RULES

### Project Structure
```
app/
  page.tsx                    → "use client" or split into server + client components
  layout.tsx                  → font loading via next/font/google
components/
  landing/
    Hero.tsx
    Stats.tsx
    Problem.tsx
    Features.tsx
    SocialProof.tsx
    Pricing.tsx
    FinalCTA.tsx
    Footer.tsx
    Navbar.tsx
  ui/                         → shared animated components
    AnimatedText.tsx
    NumberCounter.tsx
    GlowCard.tsx
```

### Critical Rules
- All Framer Motion components require `"use client"` — never use motion in Server Components
- Load fonts with `next/font/google` in `layout.tsx`, pass className to body — never use `<link>` for fonts in Next.js
- Images via `next/image` with explicit `width`, `height` or `fill` — never use `<img>` tags
- All page sections should be separate components, not one giant JSX file
- TypeScript strict mode — no `any` types, proper prop interfaces on every component
- Tailwind v4: use `@theme` for CSS variables if on v4, or `tailwind.config.ts` `extend.colors` for v3

### Performance
- `viewport={{ once: true }}` on all `whileInView` animations — never re-animate on scroll back
- Lazy load sections below the fold using `dynamic(() => import(...), { ssr: false })` if they contain heavy animations
- `will-change: transform` only on elements that are actively animating — not as a blanket rule
- Test on mobile before finalizing — scroll-linked animations especially can lag on iOS

### Tailwind + Design Token Setup
```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: "var(--color-primary)",
      accent: "var(--color-accent)",
      surface: "var(--color-surface)",
    }
  }
}
// globals.css
:root {
  --color-primary: #00d4aa;    /* override per project */
  --color-accent: #5b6fff;
  --color-surface: #111118;
  --color-bg: #09090f;
}
```

---

## WHAT TO AVOID AT ALL COSTS

- Purple gradient on white background
- Hero with centered text + one button + generic illustration — the most common and most forgettable pattern
- Card grid as the only layout treatment for every single section
- Fonts: Inter, Roboto, Arial, Space Grotesk, or any system font
- Invisible borders (border-white/10 in light contexts, border that disappears against background)
- Emojis as UI icons — SVG only
- Animating every element on the page — exhausting, distracting, and performance-killing
- Multiple competing CTAs on the same screen view
- Vague copy: "powerful", "seamless", "next-level", "innovative", "cutting-edge", "game-changing"
- `<img>` tags in Next.js — always `next/image`
- Motion components in Server Components — always `"use client"`
- Pages that look identical to every other SaaS landing page

---

## PRE-DELIVERY CHECKLIST

### Copy
- [ ] Headline is benefit-led and specific — passes the 5-second "what's in it for me?" test
- [ ] CTA copy is action + outcome, not generic verbs ("Submit", "Click here")
- [ ] Microcopy below CTA handles the primary objection
- [ ] Body copy uses second person (you/your) throughout
- [ ] Zero vague marketing words anywhere on the page
- [ ] Copy matches the tone of the target audience (technical, casual, professional)

### Visual Quality
- [ ] No emoji icons — SVG only
- [ ] No generic fonts (Inter, Roboto, Arial, system fonts, Space Grotesk)
- [ ] Background has visual depth — not a flat solid color throughout
- [ ] Hover states on all interactive elements
- [ ] Color palette defined as CSS variables, not hardcoded hex values in components
- [ ] Brand colors from the context document are used correctly

### Hierarchy & Contrast
- [ ] Headline is the visually dominant element
- [ ] CTA has the highest contrast of any element on the page
- [ ] Body text contrast ≥ 4.5:1 against background
- [ ] Dark mode (if applicable): no invisible borders, no near-invisible text

### Animation
- [ ] All motion components are in `"use client"` files
- [ ] `prefers-reduced-motion` is handled — `useReducedMotion()` hook used
- [ ] `viewport={{ once: true }}` on all `whileInView` animations
- [ ] Staggered hero entrance is present
- [ ] No more than 5 elements animating simultaneously
- [ ] Number counters trigger on scroll, not on page load
- [ ] Modal/popover open ≤ 200ms, close ≤ 150ms
- [ ] No `width`/`height` animated — only `transform` and `opacity`

### Layout & Responsiveness
- [ ] Hero CTA visible above the fold on desktop AND mobile without scrolling
- [ ] No content hidden behind sticky navbar (padding-top accounts for height)
- [ ] Fully responsive at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on any screen size
- [ ] Touch targets ≥ 44px on mobile

### Next.js Specific
- [ ] `next/font/google` used for fonts — no `<link>` font tags
- [ ] `next/image` used for all images — no `<img>` tags
- [ ] No Framer Motion in Server Components
- [ ] `AnimatePresence` wraps all conditionally rendered animated elements
- [ ] No TypeScript `any` types

### Structure
- [ ] Single conversion goal throughout — no competing actions
- [ ] Nav: logo + single CTA only
- [ ] Hero: headline + sub-headline + CTA + microcopy + product visual
- [ ] Social proof placed near CTA, not only at the page bottom
- [ ] Final CTA uses different copy from hero CTA
- [ ] `prefers-reduced-motion` respected globally

---

## YOUR BRIEF
> Fill this in before sending. Attach your full app context MD file alongside this prompt.
> The context file overrides any conflicting defaults in this prompt (especially design tokens, fonts, and colors).

**Product name:** [e.g. Memoize]

**What it does (1–2 sentences):** [e.g. Auto-captures LeetCode solves and schedules spaced repetition reviews so engineers never forget what they've practiced]

**Target audience (be specific):** [e.g. Software engineers actively prepping for FAANG technical interviews]

**Core pain it solves:** [e.g. Grinding 200+ problems but retaining almost none of them by interview day]

**Single most important reason to sign up today:** [e.g. Free, installs in 2 minutes, works automatically in the background]

**Tone / vibe:** [e.g. Precise, clean, developer-native — not a consumer app. Feels like a tool engineers would actually trust.]

**Visual inspiration (optional):** [e.g. "Linear meets GitHub" or "dark, precise, teal accents — like a terminal but beautiful"]

**Brand design tokens (if specified in context doc):** [e.g. Primary: #00d4aa, Background: #09090f, Display font: Syne, Body font: Inter]

**Sections to include:** [e.g. Navbar, Hero, Stats strip, Problem, How it works, Features, Analytics preview, Final CTA, Footer]

**Tech:** Next.js 16 (default) + Framer Motion + Tailwind + TypeScript / Other: ___

**Hard constraints (if any):** [e.g. Extension install CTA opens Google Drive link, not App Store. Auth via GitHub/Google OAuth only.]