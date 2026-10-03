---
name: Quantum Precision
colors:
  surface: '#fdf8ff'
  surface-dim: '#ddd8e6'
  surface-bright: '#fdf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f1ff'
  surface-container: '#f1ebfa'
  surface-container-high: '#ebe6f5'
  surface-container-highest: '#e5e0ef'
  on-surface: '#1c1a24'
  on-surface-variant: '#484556'
  inverse-surface: '#312f3a'
  inverse-on-surface: '#f4eefd'
  outline: '#797588'
  outline-variant: '#c9c4d9'
  surface-tint: '#5d36ef'
  primary: '#5427e6'
  on-primary: '#ffffff'
  primary-container: '#6d4aff'
  on-primary-container: '#f4eeff'
  inverse-primary: '#c9bfff'
  secondary: '#5d5e65'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2ea'
  on-secondary-container: '#63646b'
  tertiary: '#8e3d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#b44f00'
  on-tertiary-container: '#ffede5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5deff'
  primary-fixed-dim: '#c9bfff'
  on-primary-fixed: '#1b0063'
  on-primary-fixed-variant: '#4500d8'
  secondary-fixed: '#e2e2ea'
  secondary-fixed-dim: '#c5c6ce'
  on-secondary-fixed: '#191b21'
  on-secondary-fixed-variant: '#45474d'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb68f'
  on-tertiary-fixed: '#331100'
  on-tertiary-fixed-variant: '#773200'
  background: '#fdf8ff'
  on-background: '#1c1a24'
  surface-variant: '#e5e0ef'
  core-bg: '#F5F5FA'
  core-surface: '#FFFFFF'
  core-text-primary: '#171821'
  core-text-secondary: '#666978'
  core-border: '#E5E5EE'
  cyber-bg: '#080B14'
  cyber-secondary-bg: '#0D1220'
  cyber-surface: '#121827'
  cyber-elevated: '#182033'
  cyber-primary-violet: '#7C5CFF'
  cyber-text-primary: '#F7F8FC'
  cyber-text-secondary: '#A8AFBF'
  cyber-border: '#252E42'
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
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
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

The design system serves a dual-purpose environment for quantum cryptography assessment. It balances enterprise-grade stability with high-tech technical precision through two distinct themes:

- **Core Mode (Light):** Focuses on clarity, transparency, and administrative efficiency. It uses a "Light-First" approach to reduce cognitive load during complex audits.
- **Cyber Mode (Dark):** Tailored for active monitoring, high-stakes analysis, and immersive "war room" scenarios, emphasizing focus and technical depth.

The overall aesthetic is **Modern Corporate SaaS** with a **Futuristic Minimalist** edge. It communicates authority through structured layouts and meticulous typography, ensuring that high-stakes technical data remains approachable yet mathematically rigorous.

## Colors

The system is defined by its two operational themes. **Core Mode** utilizes soft off-whites and crisp borders to establish a professional workspace. **Cyber Mode** transitions the interface into deep obsidian tones with elevated surfaces that prioritize contrast and readability in low-light environments.

The **Primary Violet** acts as the brand anchor across both modes, adjusted slightly in Cyber Mode for optimal vibrancy against dark backgrounds. Use semantic secondary text colors to maintain hierarchy in data-dense views.

## Typography

This design system employs a strategic dual-font strategy. 

**Inter** serves as the primary UI typeface for all headings and narrative body text, chosen for its exceptional legibility and modern character. 
**JetBrains Mono** is reserved for technical data assets—cryptographic keys, scanner logs, and raw entropy. This visual distinction alerts the user that they are interacting with machine-generated or mathematically significant data.

## Layout & Spacing

The system follows a strict **8px rhythm** to ensure a consistent visual cadence. 

The layout utilizes a **Fluid Grid** for main content areas, anchored by a fixed 250px sidebar. On mobile, the container padding reduces from 32px to 16px, and the sidebar transitions to a bottom navigation bar or a collapsed menu to maximize vertical screen real estate for data analysis.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than aggressive shadows. 

In **Core Mode**, depth is defined by white surfaces on top of light gray backgrounds. In **Cyber Mode**, depth is conveyed through progressively lighter surface colors (Surface → Elevated Surface). Shadows are used only for floating elements like modals or tooltips, using an extremely diffused, low-opacity profile to maintain the minimalist aesthetic.

## Shapes

The shape language is "Soft-Modern," utilizing an 8px base (ROUND_EIGHT). This approach avoids the clinical feel of sharp corners while maintaining a professional, structured appearance. 

- **Containers & Cards:** Use `rounded-lg` (16px) to soften the industrial data presentation.
- **Interactive Elements:** Buttons and inputs use the standard `rounded` (8px) for a functional, precise look.
- **Indicators:** Status pills are fully rounded to distinguish them from actionable buttons.

## Components

**Buttons:**
Primary actions use the brand violet background with white text. Buttons have a height of 44px. In Cyber Mode, the violet is shifted to a higher luminosity (#7C5CFF) for contrast.

**Input Fields:**
Technical inputs (key entry, hex strings) must use `JetBrains Mono`. Standard UI inputs use `Inter`. Borders are 1px and follow the theme's specific border color (E5E5EE for Core, 252E42 for Cyber).

**Cards:**
All cards include 24px internal padding. Card headers use `headline-md` and should be separated from the body by a subtle 1px rule when content density is high.

**Log Streamer:**
A specialized sub-component used in both themes that always maintains a dark-themed appearance (Cyber Mode colors) to provide a high-contrast environment for reading terminal logs and technical audits.