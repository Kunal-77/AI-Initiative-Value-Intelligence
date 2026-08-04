# AI Initiative Value Intelligence — Master Design System

This design system serves as the single source of truth for the visual identity, UI/UX components, and layout architecture of the **AI Initiative Value Intelligence** platform. It combines the clean minimalism of Vercel and Notion, the rich dark-mode aesthetics and micro-interactions of Linear, the precision layout of Stripe and Ramp, the AI-first prompt ergonomics of ChatGPT and Claude, and the professional data density of Power BI.

---

## 1. Brand Philosophy
Our brand represents **Executive Clarity powered by Decision Intelligence**. We present complex multi-million dollar business portfolios, metrics, and cloud costs with zero visual fluff, enabling immediate executive decision-making. 
- **Content-First**: UI elements exist to serve the data, never to distract from it.
- **AI-Native, Human-Directed**: AI is an active partner in the UI. AI suggestions are distinguished by subtle, high-fidelity visual indicator glows, making them trustworthy yet distinct from raw financial baselines.
- **High-Contrast Precision**: Every pixel, border, and metric card uses absolute grid alignments and high-contrast boundaries to prevent visual ambiguity.

---

## 2. Visual Design Principles
1. **Geometric Rigidity**: We use sharp grid systems (4px base) with subtle, consistent border-radius steps. Layouts feel structural and engineered.
2. **Atmospheric Dark Mode & Crisp Light Mode**:
   - **Light Theme**: Stark white surfaces, crisp zinc boundaries, deep charcoal typography, and sharp indigo active states.
   - **Dark Theme**: Deep ink surfaces, slate border grids, glowing white/gray typography, and ambient indigo/violet glows behind interactive or AI-driven cards.
3. **Intentional Accents**: Color is reserved for state visualization (metrics, lifecycle states, AI-driven insights). If everything is colorful, nothing is important.

---

## 3. Core Color Tokens (Light & Dark Themes)

These tokens must be defined as CSS custom properties under `globals.css` using HSL coordinates to support seamless opacity scaling (e.g., `hsla(var(--primary), 0.1)`).

### CSS Custom Variables
```css
:root {
  /* Brand Core */
  --background: 0 0% 100%;       /* #ffffff */
  --foreground: 240 10% 3.9%;    /* #09090b */
  --card: 0 0% 100%;             /* #ffffff */
  --card-foreground: 240 10% 3.9%;
  
  /* Borders & Grids */
  --border: 240 5.9% 90%;        /* #e4e4e7 */
  --input: 240 5.9% 90%;         /* #e4e4e7 */
  --ring: 263.4 70% 50.4%;       /* Indigo Focus */
  
  /* Interactive Accents */
  --primary: 240 5.9% 10%;       /* Zinc-900 */
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;   /* Zinc-100 */
  --secondary-foreground: 240 5.9% 10%;
  --accent: 262.1 83.3% 57.8%;   /* Violet-600 */
  --accent-foreground: 0 0% 100%;
  
  /* Status Color Palette */
  --success: 142.1 76.2% 36.3%;  /* Emerald-600 */
  --success-foreground: 355.7 100% 97.3%;
  --warning: 37.9 90.2% 49.8%;   /* Amber-600 */
  --warning-foreground: 38 92% 95%;
  --destructive: 346.8 77.2% 49.8%; /* Rose-600 */
  --destructive-foreground: 347 100% 97%;
  
  /* AI Insights Accent */
  --ai-glow: 271 91.2% 65.1%;     /* Purple-500 */
  --ai-bg: 270 50% 98%;           /* Pastel Purple */
  --ai-border: 271 70% 85%;
}

.dark {
  /* Brand Core */
  --background: 240 10% 3.9%;    /* #09090b */
  --foreground: 0 0% 98%;        /* #fafafa */
  --card: 240 10% 5.9%;          /* #0f0f12 */
  --card-foreground: 0 0% 98%;
  
  /* Borders & Grids */
  --border: 240 3.7% 15.9%;      /* Zinc-800 */
  --input: 240 3.7% 15.9%;
  --ring: 263.4 70% 50.4%;
  
  /* Interactive Accents */
  --primary: 0 0% 98%;           /* Zinc-50 */
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --accent: 263.4 70% 50.4%;     /* Violet-500 */
  --accent-foreground: 0 0% 100%;
  
  /* Status Color Palette */
  --success: 142.1 70.6% 45.3%;  /* Emerald-500 */
  --success-foreground: 144 61% 95%;
  --warning: 47.9 95.8% 53.1%;   /* Amber-500 */
  --warning-foreground: 48 96% 96%;
  --destructive: 346.8 77.2% 49.8%;
  --destructive-foreground: 0 0% 100%;
  
  /* AI Insights Accent */
  --ai-glow: 271 91.2% 65.1%;     /* Purple-500 */
  --ai-bg: 270 20% 8%;            /* Dark Velvet */
  --ai-border: 271 40% 25%;
}
```

---

## 4. Typography Scale
We use standard Sans-serif layout engines prioritizing readability in high-density tabular environments.
- **Font Family**: `Geist Sans`, `Inter`, system-ui, sans-serif.
- **Monospace (for numbers and costs)**: `Geist Mono`, `SFMono-Regular`, monospace.

| CSS Class | FontSize | LineHeight | Weight (Regular / Medium / Bold) | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `text-xs` | 12px (0.75rem) | 16px | 400 / 500 / 600 | Secondary tables, timestamps, badges, captions |
| `text-sm` | 14px (0.875rem)| 20px | 400 / 500 / 600 | Base body copy, form labels, table cells |
| `text-base` | 16px (1.00rem) | 24px | 400 / 500 / 600 | Sub-headers, metrics labels, paragraph text |
| `text-lg` | 18px (1.125rem)| 28px | 500 / 600 / 700 | Card titles, detail headers, dialog titles |
| `text-xl` | 20px (1.25rem) | 30px | 600 / 700 | Metric totals, section titles |
| `text-2xl` | 24px (1.50rem) | 32px | 600 / 700 | Workspace titles, portfolio summary values |
| `text-3xl` | 30px (1.875rem)| 38px | 700 | Landing page headings, master totals dashboard |

---

## 5. Spacing Scale
All margins, paddings, and flex/grid gaps must adhere to this 4px mathematical scale.

- **`space-1`**: 4px (0.25rem) — Badges padding, micro-alignments.
- **`space-2`**: 8px (0.50rem) — Card padding (compact), badge gaps, inline inputs.
- **`space-3`**: 12px (0.75rem) — Inner form gaps, tab bar spacings.
- **`space-4`**: 16px (1.00rem) — Standard card padding, list item gaps, header gaps.
- **`space-6`**: 24px (1.50rem) — Form sections, table margin containers, page subheadings.
- **`space-8`**: 32px (2.00rem) — Main outer dashboard margins, dialog body paddings.
- **`space-12`**: 48px (3.00rem) — Bottom margins, empty state page boundaries.

---

## 6. Border Radius
Corners define component boundaries. We favor clean, structural geometric shapes.
- **`radius-sm`**: 4px (0.25rem) — Input elements, select dropdown options, small badges.
- **`radius-md`**: 6px (0.375rem) — Buttons, form elements, table search bars.
- **`radius-lg`**: 8px (0.50rem) — Dashboard cards, dialog boxes, tab containers.
- **`radius-full`**: 9999px — Pill badges, user avatars, slider buttons.

---

## 7. Shadows & Borders
Rather than heavy blurred shadows, we utilize Linear/Vercel-style ambient borders and sharp inset rings.

- **Light Mode Borders**:
  - Base: `1px solid hsl(var(--border))`
  - Interactive: `1px solid hsl(var(--primary) / 0.2)`
- **Dark Mode Borders**:
  - Base: `1px solid hsl(var(--border))`
  - Interactive: `1px solid hsl(var(--foreground) / 0.15)`
- **Standard Shadow (Base)**:
  - `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);`
- **Elevated Shadow (Modals / Dialogs)**:
  - `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);`
- **AI Glowing Shadow**:
  - `box-shadow: 0 0 12px -2px hsla(var(--ai-glow), 0.25), 0 0 4px -1px hsla(var(--ai-glow), 0.15);`

---

## 8. Dashboard Layout Rules
- **Grid Layout**: 12-column grid system with `gap-6` (24px) spacing.
- **Max Width**: Dashboards should be wrapped in `max-w-5xl` (1024px) or `max-w-7xl` (1280px) centered containers.
- **Dynamic Columns**:
  - Large Metrics: 3-column grid (`grid-cols-1 md:grid-cols-3`).
  - Cost Tables & Metrics Plans: 2/3 and 1/3 split (`grid-cols-1 lg:grid-cols-3`, with table occupying `lg:col-span-2` and aside occupying `lg:col-span-1`).
- **Workspace Navigation Header**:
  - Absolute height of `h-16` (64px) with bottom border.
  - Left side: Logo, dynamic Workspace Selector badge.
  - Right side: Global navigations, user profile dropdown, dark mode toggle.

---

## 9. Forms & Inputs
Inputs should feel responsive and solid.
- **Height**: Standard input height is `h-9` (36px).
- **Default State**: Background `hsl(var(--background))`, border `1px solid hsl(var(--input))`, typography `text-sm`.
- **Hover State**: Border shifts to `hsl(var(--foreground) / 0.3)`.
- **Focus State**: Ring shadow `0 0 0 2px hsla(var(--ring), 0.2)` and border color shifts to `hsl(var(--ring))`. Transition speed is `150ms`.
- **Disabled State**: Opacity `50%`, background `hsl(var(--secondary))`, cursor `not-allowed`.

---

## 10. Tables & Grids
Tables represent the financial ledger of AI initiative investments.
- **Header Row**: Background `hsl(var(--secondary) / 0.3)`, height `h-10`, typography `text-xs font-semibold uppercase tracking-wider text-zinc-500`.
- **Data Row**: Border bottom `1px solid hsl(var(--border))`, height `h-12`, hover background `hsl(var(--secondary) / 0.15)`.
- **Alignments**:
  - Text columns: Left-aligned.
  - Cost/financial columns: Right-aligned with tabular numbers font family (`font-mono`).
  - Action/Status columns: Centered.

---

## 11. Component Guidelines

### Card Container
```tsx
<div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
  <div className="flex flex-col space-y-1.5 pb-4">
    <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Card Title</h3>
    <p className="text-sm text-zinc-500 dark:text-zinc-400">Card description copy goes here.</p>
  </div>
  <div className="text-sm">Card Body Content</div>
</div>
```

### Dialog Box (Modal)
- Backdrop: Background `rgba(0, 0, 0, 0.4)` with blur filter `backdrop-blur-sm`.
- Card: Centered on screen, max width `max-w-md` (448px) or `max-w-lg` (512px).
- Content: Padding `p-6`, header, form inputs, action footer aligned to the right.

---

## 12. Charts & Financial Visualizations
- **Data Series Colors**:
  - Planned Cost: Muted Zinc/Slate (`hsl(var(--border))`).
  - Actual Cost: Indigo/Violet (`hsl(var(--accent))`).
  - Positive Variance: Emerald/Green (`hsl(var(--success))`).
  - Negative Variance: Rose/Red (`hsl(var(--destructive))`).
- **Visual Hygiene**:
  - Zero gridlines on vertical axes. Muted dotted gridlines on horizontal axes.
  - Hover tooltip uses same custom properties as Card containers for dark/light mode consistency.

---

## 13. Empty States
Empty states are opportunities for guidance, not error pages.
- **Layout**: Centered flex column, padding `py-16 px-6`.
- **Structure**:
  1. Muted icon or graphic.
  2. Heading `text-base font-semibold`.
  3. Description `text-sm text-zinc-500` explaining what the object is and how to create one.
  4. Primary button `Button` to trigger the creation form.

---

## 14. Loading States & Hydration
To prevent Next.js hydration flicker, layout shells must mount placeholders before the state loads:
- **Skeleton Panels**: Simple rounded borders with background color `hsl(var(--secondary))` applying CSS animation `animate-pulse`.
- **Page Loader**: Full-screen center spinner or thin top-progress active loading bar using brand indigo `hsl(var(--ring))`.

---

## 15. Status Badges
Status badges categorize initiative states and success measurements:

| Status | Background (Light) | Text (Light) | Background (Dark) | Text (Dark) | Border Color (Dark) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DRAFT** | Zinc-100 | Zinc-700 | Zinc-900 | Zinc-400 | Zinc-800 |
| **SUBMITTED**| Indigo-50 | Indigo-700 | Indigo-950/30 | Indigo-400 | Indigo-800/40 |
| **ACTIVE** | Emerald-50 | Emerald-700 | Emerald-950/30 | Emerald-400 | Emerald-800/40 |
| **COMPLETED**| Slate-100 | Slate-800 | Slate-900 | Slate-300 | Slate-800 |
| **ABANDONED**| Rose-50 | Rose-700 | Rose-950/30 | Rose-400 | Rose-900/40 |

---

## 16. AI UI & Decision Intelligence Guidelines
When the platform generates AI recommendations (e.g. baseline projections, cloud cost optimizations, automated metrics assessments):
1. **Interactive Glow**: AI suggestion cards use a double border with `hsl(var(--ai-border))` and `box-shadow` purple glow.
2. **Citations & Traceability**: Every AI cost projection or metric plan must include an inline metadata citation link (e.g., `[AI Baseline Projections]`). Clicking this citation must display the underlying model provider details and prompt context in a drawer panel.
3. **Prompt Shells**: Prompt input boxes must use a glassmorphism blur backdrop with a border gradient that animates on focus.

---

## 17. Motion & Micro-interactions
Transitions should be subtle and feel physical.
- **Fast Action** (Toggle switch, hover highlights): `100ms ease-out`.
- **Medium Transitions** (Dropdown drawer open, route shifts): `150ms cubic-bezier(0.16, 1, 0.3, 1)` (Linear curve).
- **Scale Pop** (Modals): Scale entry transition from `scale-95` to `scale-100` with duration `200ms`.

---

## 18. Accessibility Guidelines (WCAG)
We target **WCAG 2.1 AA** compliance:
- **Contrast Ratios**: Body copy text must have a minimum contrast ratio of `4.5:1` against backgrounds. Small captions must meet `3:1`.
- **Focus Rings**: Keyboard navigation must highlight interactive elements with an active indigo focus border `outline-none ring-2 ring-indigo-500 ring-offset-2`.
- **Semantic HTML**: Dashboards must use header tag structures (`<h1>` for title, `<h2>` for cards, `<main>`, `<aside>`) to ensure screen readers can parse the ledger.

---

## 19. Core Design Principles
Every UI decision made inside this codebase is governed by the following core design tenets:
- **Executive-First Focus**: The platform is built for corporate decision-makers (CFOs, CTOs, IT Leaders). Present aggregated insights immediately; avoid bury-deep metrics.
- **Content Over Decoration**: Visual decorations (e.g. colorful gradients, illustrative vector art, or structural borders) that do not represent functional data are strictly prohibited.
- **Progressive Disclosure**: Keep layouts clean by default. Show high-level summaries first, and provide micro-interactions (collapsible side panels, tabs, interactive hover drawers) to reveal deep data.
- **AI Assists, Never Interrupts**: AI suggestions must remain non-intrusive. They should highlight optimization options and provide suggested prompt pills without locking screen context or forcing action modals.
- **Consistency Over Creativity**: Avoid inventing new design patterns. Rely entirely on standardized layout spacing, typography sizes, and color variables outlined in this system.
- **Reusable Component Architecture**: Every interface must be assembled using standard generic primitives (e.g., `<Button>`, `<Card>`, `<Table>`). Custom page-specific styling blocks are rejected.
- **Data Density Without Clutter**: Maximize layout real estate by utilizing precise paddings (`space-2` / `space-3`), crisp tabular lines, and numeric monospacing while maintaining clear alignment flow.
- **Accessible by Default**: Accessible styling (contrast ratios, focus rings, semantic HTML structure) is woven directly into core primitives from the start, not appended afterward.

---

## 20. Complete Component Inventory

This section catalogs every reusable UI primitive, outlining its purpose, variant criteria, states, and accessibility rules.

### 20.1 Navigation
- **Sidebar**
  - *Purpose*: Main navigation structure for the workspace layout.
  - *Usage*: Rendered fixed to the left viewport boundary. Contains primary sections (Dashboard, Cost Items, Metrics, AI Studio).
  - *Variants*: Extended (standard) vs. Collapsed (icon-only, triggered on smaller laptops or manual toggle).
  - *States*: Active, Hover, Focused.
  - *Accessibility*: Wrapped in `<nav>` with `aria-label="Primary Navigation"`. Collapsible toggle must use `aria-expanded` and track tab indexing.
- **Top Navigation**
  - *Purpose*: Displays current path context and anchors header controls.
  - *Usage*: Absolute height `h-16`, sticky top alignment with boundary border.
  - *Variants*: Workspace Dashboard style vs. Inner detail page back-aligned style.
  - *States*: Scrolled-glass (opaque backdrop blur), Static.
  - *Accessibility*: Uses semantic `<header>` container; must include descriptive landmarks.
- **Breadcrumb**
  - *Purpose*: Shows hierarchical nesting path (e.g., `Portfolio / Initiatives / Details`).
  - *Usage*: Renders inline in the top header.
  - *Variants*: Muted link path list.
  - *States*: Link Hover, Active (current page).
  - *Accessibility*: Uses `<nav aria-label="Breadcrumb">` and OL structure; current page link marked with `aria-current="page"`.
- **Search Bar**
  - *Purpose*: Filters list items or queries initiatives.
  - *Usage*: Mounted inside top navigation or table headers.
  - *Variants*: Inline block vs. Global Overlay Dialog modal (triggered via `Cmd+K` / `Ctrl+K`).
  - *States*: Idle, Active, Focus, Loading.
  - *Accessibility*: Input marked with `type="search"`, `aria-label="Search initiatives"`, and connected to a clear label.
- **Workspace Switcher**
  - *Purpose*: Dropdown switcher coordinating transitions between Personal and Business sessions.
  - *Usage*: Rendered in top-left sidebar header.
  - *Variants*: Pure native selection dropdown element.
  - *States*: Normal, Hover, Focus, Disabled, Transition-pulsing.
  - *Accessibility*: Keyboard navigable option focus outlines; clearly readable labels.
- **Avatar**
  - *Purpose*: Renders profile indicator for active user session.
  - *Usage*: Top-right header profile triggers.
  - *Variants*: Pill image vs. Fallback initials indicator.
  - *States*: Normal, Hover (focus border).
  - *Accessibility*: Profile image must have descriptive `alt` text or fallback to `aria-label` initials.

### 20.2 Basic Primitives & Form Fields
- **Buttons**
  - *Purpose*: Triggers page-level actions or form submissions.
  - *Usage*: Inlined or inside form footers.
  - *Variants*: Primary (Zinc-900), Secondary (Zinc-100), Outline, Destructive (Rose-600), Icon-only.
  - *States*: Idle, Hover, Active, Focus, Disabled, Loading (renders dynamic spinner).
  - *Accessibility*: Keyboard navigation triggers (`space`/`enter`), focus indicators, clear labels.
- **Inputs & Textareas**
  - *Purpose*: Text input fields.
  - *Usage*: Rendered in forms and filter controls.
  - *Variants*: Regular Text, Password, Numeric, Search, Textarea (adjustable height).
  - *States*: Default, Hover, Focus (indigo ring), Error (rose border), Disabled.
  - *Accessibility*: Direct correlation to `<Label>` via `htmlFor`/`id` bindings; error messages bound via `aria-describedby`.
- **Selects & Comboboxes**
  - *Purpose*: Multi-option dropdown pickers.
  - *Usage*: Category select lists, currencies selection.
  - *Variants*: Native Browser Select (preferred for stability), Custom Combobox (with search filter input).
  - *States*: Closed, Open, Item Focus, Item Hover, Disabled.
  - *Accessibility*: Standard `select` tags default to browser accessibility. Comboboxes must use `aria-autocomplete="list"` and match item values to focus references.
- **Checkboxes, Radios & Switches**
  - *Purpose*: Toggle and selection switches.
  - *Usage*: Cost item bulk selections, boolean toggles, setting lists.
  - *Variants*: Standard Checkbox (square), Radio Button (circle group), Switch (toggle pill).
  - *States*: Unchecked, Checked, Indeterminate (checkbox only), Hover, Focus, Disabled.
  - *Accessibility*: Renders native inputs styled with hidden opacity to preserve screen reader and keyboard tracking. Focus triggers clear outline rings.

### 20.3 Overlays & Layout Blocks
- **Tabs**
  - *Purpose*: Sub-sections navigation within a single page view.
  - *Usage*: Detail page sections (e.g. "Business Case", "Financials", "Measurement Plan").
  - *Variants*: Horizontal tab bar (standard) vs. Vertical sidebar tabs (settings).
  - *States*: Default, Active (indigo indicator), Hover, Disabled.
  - *Accessibility*: Renders tablist role with buttons matching `aria-controls` target sections.
- **Accordion**
  - *Purpose*: Collapse-expand panel to toggle detail visibility.
  - *Usage*: FAQ lists, secondary configuration items, history logs.
  - *Variants*: Single open vs. Multiple open list.
  - *States*: Collapsed, Expanded.
  - *Accessibility*: Toggle header wraps `aria-expanded` and targets content section `id` with standard tab navigation.
- **Dialog (Modal Overlay)**
  - *Purpose*: Focuses user attention on critical forms or confirmations (e.g., metric creation).
  - *Usage*: Absolute layout overlay, backdrop block.
  - *Variants*: Modal dialog box vs. Drawer panel (slides from right boundary).
  - *States*: Entrance (pop), Exit (slide-away).
  - *Accessibility*: Focus trapping (locks focus inside dialog), `aria-modal="true"`, closed by pressing `Escape` or clicking backdrop overlay.
- **Drawer**
  - *Purpose*: Slides out from viewport boundary to show details without losing context.
  - *Usage*: AI citations panel, cost line item audit log.
  - *Variants*: Right boundary Drawer vs. Bottom boundary Drawer.
  - *States*: Slide-in, Slide-out.
  - *Accessibility*: Behaves identically to Dialog modal overlay (focus trapping and Escape key support).
- **Toast Notifications**
  - *Purpose*: Temporary message alerts notifying user of asynchronous outcome.
  - *Usage*: "Initiative Created", "Metric Baseline Approved", "Failed to update cost item".
  - *Variants*: Success (Green check), Error (Red cross), Info (Blue bubble).
  - *States*: Slide-in (bottom-right), Visible (auto-dismiss duration `3000ms`), Fade-out.
  - *Accessibility*: Uses `role="alert"` (or `role="status"` based on severity) to ensure immediate screen reader interrupt.
- **Tooltip & Popover**
  - *Purpose*: Floating informational content panels.
  - *Usage*: Hovering over variance metrics or chart bars to reveal formulas/breakdowns.
  - *Variants*: Simple text Tooltip (hover only) vs. Interactive Popover (requires click trigger).
  - *States*: Invisible, Fade-in.
  - *Accessibility*: Connected to trigger via `aria-describedby`, supports Escape dismiss. Popovers must manage keyboard focus transition.

### 20.4 Data & AI Indicators
- **Metric Card**
  - *Purpose*: Displays single key summary values (e.g. "Planned Cost").
  - *Usage*: Standard metric rows.
  - *Variants*: Standard Financial vs. KPI Target Progress vs. AI Projected metric.
  - *States*: Default, Interactive Hover, Skeleton Pulse.
  - *Accessibility*: Focus ring on hover; clear text contrast for value figures.
- **AI Insight Card**
  - *Purpose*: Highlight recommendations or cost variances discovered by AI.
  - *Usage*: Studio dashboards, detail pages.
  - *Variants*: Warning Card (amber glow), Opportunity Card (purple glow), Risk Card (rose outline).
  - *States*: Default, Clicked (opens drawer).
  - *Accessibility*: Double border styling for visual aid, alt tags on all AI-suggested indicators.
- **Status Badges**
  - *Purpose*: Standard indicators for lifecycle states.
  - *Usage*: Tables and headers (see Section 15 for complete configuration color table).
  - *Variants*: Draft, Submitted, Active, Completed, Abandoned.
  - *States*: Pill badges.
  - *Accessibility*: Colored badges must include text-alternative metadata or semantic indicators.
- **Skeleton Placeholder**
  - *Purpose*: Hydration skeleton layout blocks.
  - *Usage*: Mounted inside loading card/grid structures.
  - *Variants*: Panel rectangle, text line bar, avatar circle.
  - *States*: Pulsing color transition (`animate-pulse`).
  - *Accessibility*: Labeled with `aria-busy="true"` and `aria-live="polite"`.

---

## 21. Page Blueprint Library
Standard layout hierarchies for key page templates:

### 21.1 Business Dashboard
1.  **Header**: AppHeader containing logo, WorkspaceSelector, global search, user button.
2.  **Summary KPIs**: 3-card metrics row displaying Planned, Actual, and Variance totals.
3.  **Core Section Split** (2/3 & 1/3 Grid):
    - **Main 2/3 column**: Initiatives Portfolio Table (searchable list of estratégico initiatives).
    - **Aside 1/3 column**: AI Insights Panel (glowing list of cost optimization opportunities).

### 21.2 Initiative Detail
1.  **Header**: AppHeader (with back button linking back to portfolio list, initiative title, lifecycle status badge).
2.  **Navigation Tabs**: Horizontal tabs layout: "Business Case" | "Financials" | "Measurement Plan".
3.  **Content Window**:
    - *Business Case tab*: Card grid mapping expected business outcomes, planned start date, and description text.
    - *Financials tab*: Cost grid summary cards followed by Cost Items Grid Table, with "Add Cost Item" button.
    - *Measurement Plan tab*: Metric list cards mapping registered KPI metrics, status (Active/Retired), and baseline values.

### 21.3 Personal Dashboard
1.  **Header**: AppHeader (with "Personal Workspace" indicator badge, profile controls).
2.  **Summary KPIs**: Total subscriptions count, monthly spend estimate, renewal timelines.
3.  **Active Lists**: Grid cards layout displaying registered SaaS subscriptions, utilities bills, and AI memberships.

### 21.4 Settings & Profile Layouts
1.  **Header**: AppHeader (Title: "Account Settings").
2.  **Two-Column Layout**:
    - **Left navigation panel**: Vertical tab links (General, Workspace Members, Payment Methods, Billing).
    - **Right settings panel**: Card wrapper containing form fields, input inputs, label descriptors, action save footers.

### 21.5 Authentication Pages
1.  **Layout**: Full-screen split layout (Desktop: left 50% brand purple dashboard preview vector; right 50% centered signup/signin form block).
2.  **Form Shell**: Clean white card container, email/password inputs, primary submit button, secondary redirect link.

---

## 22. Dashboard Blueprint
Executive dashboards must enforce a strict vertical ordering hierarchy and visual weight spacing to prevent information overload.

```
┌────────────────────────────────────────────────────────┐
│ 1. Header: Logo / WorkspaceSelector     Search  Avatar │
├────────────────────────────────────────────────────────┤
│ 2. KPI Metrics Row                                     │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────┐   │
│   │ Planned Cost │   │  Actual Cost │   │ Variance │   │
│   └──────────────┘   └──────────────┘   └──────────┘   │
├────────────────────────────────────────────────────────┤
│ 3. Main Data Area: Split Grid (2/3 and 1/3)            │
│   ┌──────────────────────────────┐   ┌──────────────┐  │
│   │                              │   │              │  │
│   │  Core Portfolio Table        │   │  AI Insights │  │
│   │                              │   │  Panel       │  │
│   └──────────────────────────────┘   └──────────────┘  │
├────────────────────────────────────────────────────────┤
│ 4. Activity Logs & Recent Actions                      │
│   ┌────────────────────────────────────────────────┐   │
│   │ Audit events list                              │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### Dashboard Spacing and Ordering Rules
- **Spacing**: Margins below AppHeader must be `space-8` (32px). The vertical spacing between sections (KPI Row to Main Data Area) must be `space-6` (24px).
- **Ordering Hierarchy**:
  1. **Page Context**: Workspace Selector and Primary Page Actions.
  2. **Top-Level Aggregates**: Metric Cards (variance highlight colors).
  3. **Visual Trends**: Charts showing trends.
  4. **Detailed Ledger**: Tables and database lists.
  5. **Actions & Insights**: AI-driven suggestions and secondary audit histories.

---

## 23. AI Experience Standards
Artificial Intelligence recommendations must align with these interactive, highly traceable patterns:
- **AI Assistant Drawer**: Slides in from the right viewport boundary when the user invokes help. Features a prompt composer input field at the bottom.
- **Confidence Metrics**: Every cost variance projection or baseline target proposed by the AI must display an inline confidence pill badge (e.g., `Confidence: 94%`). Pill borders map to confidence brackets:
  - $\ge 90\%$: Muted emerald border.
  - $70\% - 89\%$: Muted amber border.
  - $< 70\%$: Muted zinc border.
- **Source Traceability & Citations**: Projections must include clickable footnote citation markers (e.g., `[AI Baseline Projections]`). Clicking this must open the AI sidebar panel displaying:
  - The model provider (e.g., Gemini 1.5 Flash).
  - The raw input variables used to calculate the baseline.
  - The descriptive reasoning/logic context behind the calculation.
- **Interactive Streaming UX**: AI text generation in drawers must use a character-by-character text stream layout, displaying a blinking cursor cursor (`h-4 w-1 bg-purple-500 animate-pulse inline-block`) at the end of the active stream block.
- **Approval Workflow for Suggestions**: AI-suggested changes (e.g. creating cost items, adjusting metric thresholds) must render a side-by-side comparison pane showing "Current" vs. "Suggested". Action buttons must read **"Accept Suggestion"** (primary purple button) or **"Decline"** (secondary outline button).

---

## 24. Responsive Design Rules
The application layout dynamically adapts across breakpoints to ensure data density is preserved:

### Breakpoint Specifications
- **Mobile** (`< 768px`): Sidebar collapses completely into a hamburger menu overlay. Metric cards stack vertically (`grid-cols-1`). Tables collapse into card lists, showing only the key status badge and title in list item rows.
- **Tablet** (`768px - 1024px`): Sidebar collapses to an icon-only narrow sidebar panel (`w-16`). Metric cards adapt to 2-column or 3-column rows. Table headers are preserved, but secondary columns (e.g., planned start date, tags) are hidden.
- **Desktop/Laptop** (`> 1024px`): Full expanded sidebar (`w-64`) remains fixed. Large 12-column grid maps the 2/3 and 1/3 layout structure. Tables render all columns.

### Responsive Component Behaviors
- **Charts**: Must use responsive wrappers to auto-scale width and height dynamically on viewport resize.
- **Dialog Modals**: Modals scale down to full-width bottom drawers on mobile devices (`< 768px`) for easier thumb-based touch interaction.
- **Touch Targets**: On touch-enabled viewports (mobile/tablet), interactive action triggers (buttons, select dropdown lists) expand their padding to satisfy a minimum touch boundary of `44px x 44px`.

---

## 25. Motion System
Animations must feel responsive, physical, and clean. Avoid bouncy, distracting easing curves.

### Animation Curve Standards
- **Standard Transition**: `150ms cubic-bezier(0.16, 1, 0.3, 1)` (Linear curve) — used for hover states, color changes, and border highlights.
- **Modals & Dialog Pop**: Scale animation from `scale-95` to `scale-100` with duration `200ms cubic-bezier(0.34, 1.56, 0.64, 1)` (provides a subtle elastic snap).
- **Drawers & Side Panels**: Slide transition from screen edge with duration `250ms cubic-bezier(0.16, 1, 0.3, 1)`.

### Event Easing Definitions
- **Loading Skeleton**: Continuous breathing animation transition using CSS keyframes fading background opacity from `1` to `0.5` over `2000ms` (`animate-pulse`).
- **Toast Alerts Entry**: Slide from bottom-right boundary with duration `200ms ease-out`, and dismisses via fade-out with duration `150ms`.

---

## 26. Iconography Standards
Visual icons assist usability but must never serve as raw decoration.
- **Icon Library**: `Lucide Icons` (SVG icons).
- **Standard Sizes**:
  - Small (inline icons, table links, button prefixes): `16px x 16px` (`w-4 h-4`).
  - Medium (sidebar links, card icons, header actions): `20px x 20px` (`w-5 h-5`).
  - Large (empty state headers, dialog warnings): `32px x 32px` (`w-8 h-8`).
- **Stroke Weights**: Icons must use a consistent stroke weight of `2px` for normal layouts, and `1.5px` for large dashboard indicators to maintain a high-contrast outline appearance. Filled icons are prohibited; rely entirely on outline styles.

---

## 27. Data Visualization Standards
Visual data charts must align with corporate-level financial report standards (similar to Microsoft Fabric and Power BI):

### Chart Selection Criteria
- **Line & Area Charts**: Used for tracking initiative spending overtime (month-over-month costs). Area fills must use a faded accent opacity (`0.1`).
- **Bar & Stacked Bar Charts**: Used for comparing costs across business areas or categories.
- **Waterfall Charts**: Used to visualize financial increments and negative variances leading to the current total variance.
- **KPI Progress Rings**: Used to display percentage achievement of key metric baselines.
- **Pie Charts**: Strictly prohibited. Utilize Donut charts only when showing a simple distribution of $\le 4$ categories.

### Chart Styling Rules
- **Color Palettes**: Chart series must use primary accents (`var(--accent)`), borders (`var(--border)`), and status palette colors (`var(--success)`, `var(--destructive)`). Random color generations are forbidden.
- **Hover tooltips**: Rendered inside a clean HTML popup using custom borders (`1px solid var(--border)`) and standard background tokens to match card themes.
- **Axis Muting**: Axis lines must be styled as thin and muted. Gridlines are vertical-disabled and horizontal-dashed.

---

## 28. Content & Copywriting Standards
All UI microcopy, error banners, and buttons must use clear, professional, and descriptive B2B enterprise language.

### Writing Rules
- **Action Buttons**: Must start with a clear, active verb describing the outcome. 
  - *Yes*: "Create Initiative", "Save Cost Item", "Approve Baseline".
  - *No*: "Submit", "Submit Form", "Go", "OK".
- **Error Messages**: Banners must explain: (1) what failed, (2) why it failed, and (3) how to resolve it.
  - *Yes*: "Failed to register metric. The baseline value must be greater than zero. Please adjust the input and try again."
  - *No*: "Error occurred", "Invalid value".
- **Empty States**: Must clearly state what the missing context is and what the primary button will create.
  - *Yes*: "No registered cost items found. Create a cost item below to start tracking your initiative financials."
  - *No*: "Empty", "No data".

---

## 29. Accessibility Expansion
We target full compliance with WCAG 2.1 AA parameters:
- **Keyboard Trapping**: Modals and dropdown flyouts must trap focus within their component boundaries. Clicking outside or pressing `Escape` must close the overlay and return focus to the trigger element.
- **Visual Focus Rings**: Focused links or inputs must display a clear outline ring: `outline-none ring-2 ring-indigo-500 ring-offset-2`.
- **Screen Reader Support**: All interactive SVGs, buttons, and status icons must have corresponding `aria-label` or `title` tags. Content panels loading async data must use `aria-busy="true"` and `aria-live="polite"`.

---

## 30. Performance UX Rules
Page loading and UI transitions must feel immediate.
- **Prevent Cumulative Layout Shifts (CLS)**: Skeletons and component wrappers must specify fixed container dimensions before async data loads, keeping the layout stable.
- **Skeletons Before Content**: When fetching data from APIs, card grids and tables must render exact layout skeletons matching the shape of the incoming data.
- **Lazy Loading Panels**: Non-visible tab contents or side drawer panes must be lazy-loaded on request rather than hydrated on initial page load.

---

## 31. Inspiration Matrix
We borrow design patterns selectively to establish a premium and highly focused visual product.

| Product | Patterns Adopted | Elements Avoided / Rejected |
| :--- | :--- | :--- |
| **Vercel** | Crisp high-contrast zinc borders, geometric rigidity, stark white light mode themes. | Lack of visual borders, overly simple flat surfaces. |
| **Linear** | Vibrant dark mode ink tones, clean status badges, fluid motion easing curves. | Heavy dark gradient backdrops, dense sidebar links. |
| **Stripe** | Professional typography weights, clean form inputs, structured dashboard grids. | Large colourful decorative mesh gradients, organic shapes. |
| **Ramp** | Heavy focus on transaction tables, tabular numeric alignments, solid data density. | Rigid gray inputs, raw system default font families. |
| **Notion** | Accessible typography proportions, clear layout nesting. | Emoji icons, loose spacing, hand-drawn vector elements. |
| **Claude / ChatGPT** | Inline AI citation footnotes, prompt input boxes, streaming cursors. | Floating assistant bubbles that block page content. |
| **Power BI / Fabric** | Summary card grids, variance color alignments, ledger tracking layouts. | Cluttered vertical axes, thick gridlines, non-standard visual charts. |

---

## 32. Visual Anti-Patterns ("What We Never Do")
To maintain design integrity, developers must avoid these visual anti-patterns:
- **No Decorative Gradients**: Gradients are prohibited unless highlighting a prompt input focus or displaying a chart trend series.
- **No Nested Scrollbars**: Scrolling must occur globally or within a single, dedicated table view. Nested scrolling inside multiple nested containers is forbidden.
- **No Heavy Blurred Shadows**: Surface separation must rely on borders (`var(--border)`) and thin, low-blur drop shadows.
- **No Inconsistent Spacing**: Ad-hoc margin values (e.g. `margin-top: 13px`) are rejected. All spacing must use standard mathematical `space-` increments.
- **No Page-Specific Components**: Creating custom, page-specific variations of shared components (like a custom edit dialog that doesn't use the standard primitive) is strictly prohibited.
- **No Decorative AI**: Do not add AI badges or indicators for elements that do not contain LLM or decision-intelligence data.

---

## 33. Governance Rules
To ensure the design language does not drift during future feature development:
1.  **System-First Development**: No feature branch may introduce a custom primitive, color token, or font weight without updating this `DESIGN_SYSTEM.md` document first.
2.  **Zero Inline Color Overrides**: All colors used in component styling must map to CSS variables (`var(--...)`) defined in Section 3. Inline hex codes or raw color classes are strictly prohibited.
3.  **Strict Component Reuse**: Primitives like `<Button>`, `<Card>`, `<Table>`, and `<Dialog>` must be imported from the shared UI folder. No page-level duplicate components are allowed.

---

## 34. Canonical Mock Data Governance
To prevent mock data drift and inline duplicate fake data:
1. **Canonical Source**: All mock datasets (organizations, initiatives, audit logs, AI recommendations, personas, milestones) are governed by `MOCK_DATA_GUIDE.md`.
2. **Central Export**: All mock UI components and pages must import shared mock datasets directly from `apps/web/src/lib/mockData.ts`. Inline fake data definitions in components are prohibited.

