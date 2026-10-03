---
name: Quantum Assurance System
colors:
  surface: '#f9f9fe'
  surface-dim: '#d9dade'
  surface-bright: '#f9f9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f8'
  surface-container: '#ededf2'
  surface-container-high: '#e8e8ed'
  surface-container-highest: '#e2e2e7'
  on-surface: '#1a1c1f'
  on-surface-variant: '#484556'
  inverse-surface: '#2e3034'
  inverse-on-surface: '#f0f0f5'
  outline: '#797588'
  outline-variant: '#c9c4d9'
  surface-tint: '#5d36ef'
  primary: '#5427e6'
  on-primary: '#ffffff'
  primary-container: '#6d4aff'
  on-primary-container: '#f4eeff'
  inverse-primary: '#c9bfff'
  secondary: '#5c4bc3'
  on-secondary: '#ffffff'
  secondary-container: '#9485ff'
  on-secondary-container: '#2a0992'
  tertiary: '#005c79'
  on-tertiary: '#ffffff'
  tertiary-container: '#00769b'
  on-tertiary-container: '#e1f3ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5deff'
  primary-fixed-dim: '#c9bfff'
  on-primary-fixed: '#1b0063'
  on-primary-fixed-variant: '#4500d8'
  secondary-fixed: '#e5deff'
  secondary-fixed-dim: '#c7bfff'
  on-secondary-fixed: '#180065'
  on-secondary-fixed-variant: '#4330aa'
  tertiary-fixed: '#c0e8ff'
  tertiary-fixed-dim: '#70d2ff'
  on-tertiary-fixed: '#001e2b'
  on-tertiary-fixed-variant: '#004d66'
  background: '#f9f9fe'
  on-background: '#1a1c1f'
  surface-variant: '#e2e2e7'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  mono-code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  sidebar_width: 250px
  container_padding: 32px
  gutter: 24px
  card_padding: 24px
  stack_gap_lg: 32px
  stack_gap_md: 16px
---

## Brand & Style

The design system is engineered for **Q-CAPS**, a platform dedicated to the high-stakes world of quantum cryptography and preparedness. The brand personality is authoritative yet approachable, shifting the narrative from "hacker-centric" chaos to "enterprise-grade" stability.

The design style is **Modern Corporate SaaS** with a **Futuristic Minimalist** edge. It leverages heavy whitespace, a refined color palette, and high-precision typography to convey technical sophistication. Unlike traditional cybersecurity tools that rely on dark modes and neon accents, this system utilizes a "Light-First" approach to promote clarity, transparency, and trust during complex assessment workflows.

**Key Visual Principles:**
- **Clarity over Complexity:** Use generous negative space to reduce cognitive load during data-heavy cryptography audits.
- **Precision:** Technical data is presented with monospaced accents to emphasize mathematical accuracy.
- **Translucency:** Subtle glass-like effects on overlays to maintain spatial awareness within the platform.

## Colors

The palette is anchored by a deep **Primary Violet (#6D4AFF)**, representing the intersection of logic and innovation. 

- **Primary & Action:** Use the Primary Violet for all main actions. The Technical Cyan is reserved for data-visualization accents or "active scanning" states to maintain its impact.
- **Neutral Backgrounds:** The main workspace uses a cool-toned off-white (#F5F5FA) to prevent eye strain, while cards sit on pure white surfaces to create a clear "layering" effect.
- **Semantic Logic:** Status colors follow standard conventions but are slightly desaturated to align with the professional SaaS aesthetic. "Risk" replaces the traditional "Error" label to better suit the assessment context.

## Typography

The typography strategy employs a dual-font system to distinguish between UI narrative and technical data.

- **Inter:** The primary workhorse. It is used for all headings, labels, and body text. Its high x-height ensures readability in complex dashboard environments.
- **JetBrains Mono:** Reserved specifically for "Quantum Assets"—cryptographic keys, scanner logs, algorithm snippets, and raw entropy data. This font acts as a visual cue that the information presented is machine-generated or mathematically significant.

**Hierarchy Rules:**
- Use `display-lg` sparingly for high-level dashboard summaries (e.g., "Quantum Readiness Score").
- All technical identifiers should be set in `mono-label` with uppercase styling where appropriate.

## Layout & Spacing

This design system utilizes a **Fluid Grid** model with a fixed left-hand navigation structure.

- **Sidebar:** A constant 250px sidebar provides a stable anchor for the application. Navigation items should have a minimum height of 48px with 12px of vertical spacing between them.
- **The 8px Rhythm:** All spacing (margins, padding, gaps) should be multiples of 8px to ensure a consistent visual cadence.
- **Card Layouts:** Main content areas use a 12-column grid. Large data visualizations should span 8-12 columns, while metric cards should span 3-4 columns.
- **Mobile Adaptation:** On mobile, the sidebar collapses into a bottom navigation bar or a hamburger menu, and container padding reduces to 16px.

## Elevation & Depth

The system uses **Tonal Layers** combined with **Low-Contrast Outlines** rather than heavy shadows to indicate depth.

- **Level 0 (Background):** #F5F5FA. The lowest layer.
- **Level 1 (Cards/Surface):** White (#FFFFFF) with a 1px solid border (#E5E5EE).
- **Elevation Shadow:** For active or floating elements, use an extremely diffused shadow: `0px 4px 20px rgba(0, 0, 0, 0.04)`.
- **Hover State:** When hovering over interactive cards, the surface shifts to #F8F7FF and the border color darkens slightly to #DADAED. This creates a tactile feel without traditional skeuomorphism.

## Shapes

The shape language is "Soft-Modern." It avoids the aggressive sharpness of traditional technical tools while maintaining a professional structure.

- **Main Cards:** Use `rounded-lg` (16px) or `rounded-xl` (24px) for large containers to soften the "industrial" feel of the data.
- **Buttons & Inputs:** Use the standard `rounded` (8px) for a crisp, functional look.
- **Status Pills:** Use fully rounded (Pill-shaped) corners to distinguish status indicators from clickable buttons.

## Components

**Buttons:**
- **Primary:** #6D4AFF background, white text. 44px height. Transition to #5C3BE8 on hover.
- **Secondary:** #E9E4FF background, #6D4AFF text. No border.
- **Focus State:** 2px offset with #6D4AFF ring for WCAG AA compliance.

**Input Fields:**
- 44px height, #FFFFFF background, 1px #E5E5EE border. 
- Technical inputs (e.g., Key entry) should use `JetBrains Mono`.

**Cards:**
- All cards must include a padding of 24px. 
- Headers within cards should use `headline-md` and be separated by a subtle horizontal rule if the content below is dense.

**Quantum-Specific Components:**
- **Entropy Visualizer:** A specialized component using Technical Cyan (#3CB7E8) to show randomness quality.
- **Log Streamer:** A dark-themed (neutral-900) sub-component for JetBrains Mono scanner logs to provide high-contrast focus during active audits.
- **Readiness Gauge:** A semi-circular progress bar using a gradient from Primary Violet to Technical Cyan.