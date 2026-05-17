---
name: Cinematic Immersive Analytics
colors:
  surface: '#0e150e'
  surface-dim: '#0e150e'
  surface-bright: '#333b33'
  surface-container-lowest: '#091009'
  surface-container-low: '#161d16'
  surface-container: '#1a211a'
  surface-container-high: '#242c24'
  surface-container-highest: '#2f372e'
  on-surface: '#dde5d9'
  on-surface-variant: '#bccbb9'
  inverse-surface: '#dde5d9'
  inverse-on-surface: '#2b322a'
  outline: '#869585'
  outline-variant: '#3d4a3d'
  surface-tint: '#53e076'
  primary: '#53e076'
  on-primary: '#003914'
  primary-container: '#1db954'
  on-primary-container: '#004118'
  inverse-primary: '#006e2d'
  secondary: '#ddb7ff'
  on-secondary: '#4a0080'
  secondary-container: '#7900cd'
  on-secondary-container: '#ddb7ff'
  tertiary: '#47d6ff'
  on-tertiary: '#003543'
  tertiary-container: '#00afd5'
  on-tertiary-container: '#003d4c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#72fe8f'
  primary-fixed-dim: '#53e076'
  on-primary-fixed: '#002108'
  on-primary-fixed-variant: '#005320'
  secondary-fixed: '#f0dbff'
  secondary-fixed-dim: '#ddb7ff'
  on-secondary-fixed: '#2c0050'
  on-secondary-fixed-variant: '#6900b3'
  tertiary-fixed: '#b6ebff'
  tertiary-fixed-dim: '#47d6ff'
  on-tertiary-fixed: '#001f28'
  on-tertiary-fixed-variant: '#004e60'
  background: '#0e150e'
  on-background: '#dde5d9'
  surface-variant: '#2f372e'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Sora
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.7'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding-dt: 64px
  container-padding-mb: 24px
  gutter: 24px
  card-gap: 32px
  section-margin: 120px
---

## Brand & Style
The design system embodies a "Cinematic Tech" aesthetic, positioning itself as an elite, high-performance tool for music enthusiasts and industry professionals. The brand personality is sophisticated, nocturnal, and emotionally resonant, moving beyond standard utility into a curated, high-fidelity experience.

The visual direction utilizes **Glassmorphism** and **Atmospheric Depth**. By combining deep, obsidian surfaces with ethereal, glowing gradients, the UI creates a sense of infinite space. Elements appear to float in a multi-layered environment, using varying degrees of transparency and backdrop-blur to signify importance and relationship. The tone is unapologetically premium, mirroring the precision of a high-end audio interface mixed with the immersive quality of modern streaming media.

## Colors
The palette is built on a foundation of **Deep Obsidian (#050505)** to ensure maximum contrast for the vibrant, neon-inflected accents. 

- **Primary Green:** Reserved for core Spotify-linked actions and success states.
- **Electric Blue & Deep Purple:** Used for data visualization and secondary interactive elements to create a "midnight neon" atmosphere.
- **Soft Pink:** Used sparingly as a highlight color for "hot" trends or high-momentum data points.
- **Glass Surfaces:** Layers are constructed using low-opacity whites (4-8%) with heavy backdrop blurs to maintain legibility over background gradients.

## Typography
Typography is architectural. **Sora** provides a high-tech, geometric rhythm for headlines, utilizing tight tracking to create "blocks" of text that feel like luxury branding. **Geist** is used for all functional and body text, chosen for its monospaced-influenced precision which aids in reading dense analytical data.

Large display sizes should use a slight vertical gradient or a subtle "inner glow" to feel integrated into the glassmorphic aesthetic. Body text should maintain generous leading (1.6+) to ensure the dark interface remains breathable and accessible.

## Layout & Spacing
The layout follows a **Fluid 12-Column Grid** with extreme internal margins to create a "Gallery" feel. 

- **Desktop:** 64px outer margins, 24px gutters. Content is centered with significant whitespace to prevent visual clutter.
- **Mobile:** 24px outer margins. Cards reflow to a single column, maintaining 24px-32px of vertical separation.
- **Rhythm:** All spacing is derived from a 8px base unit. Component internal padding should be generous (typically 24px or 32px) to support the large corner radii.

## Elevation & Depth
Depth is not achieved through traditional drop shadows, but through **Tonal Stacking** and **Backdrop Blurs**.

1.  **Level 0 (Background):** Pure Obsidian with animated, blurred mesh gradients (opacity 10-15%).
2.  **Level 1 (Cards):** 4% White fill, 40px Backdrop Blur, 1px border (White @ 10% opacity).
3.  **Level 2 (Modals/Popovers):** 8% White fill, 64px Backdrop Blur, 1px border (White @ 20% opacity), accompanied by a soft, colored outer glow matching the primary or secondary accent color.
4.  **The "Glow" Rule:** Interactive elements (hovered cards, active buttons) should emit a soft, diffused radial glow behind the element to simulate a light source under the glass.

## Shapes
The shape language is defined by **Exaggerated Roundness**. High-level containers and cards use a 24px to 32px radius to feel soft and organic against the technical typography. 

Interactive components like buttons should be fully pill-shaped (100px) to distinguish them from information containers. Small UI elements (checkboxes, tags) use a more conservative 8px-12px radius to maintain structural integrity at small scales.

## Components

- **Glass Cards:** The signature component. Feature a 1px "inner-light" stroke on the top and left edges to simulate light hitting a glass edge.
- **Buttons:** 
    - *Primary:* Solid Spotify Green with a subtle outer glow. Text in black for high contrast.
    - *Secondary:* Transparent glass with a 1px white border and white text.
- **Data Visualization:** Line charts should use "neon" strokes (2px) with a semi-transparent gradient fill that fades to 0% opacity at the baseline.
- **Inputs:** Darker than the background (Pure black), 1px subtle border, Geist typography. The focus state should trigger a primary green outer glow.
- **Navigation:** A floating glass dock at the bottom of the screen or a minimalist sidebar with high transparency.
- **Music Player Progress:** A thin, high-contrast bar using the Tertiary Blue, featuring a "glow-head" at the current play position.