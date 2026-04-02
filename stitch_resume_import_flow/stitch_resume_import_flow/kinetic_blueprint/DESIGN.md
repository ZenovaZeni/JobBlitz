```markdown
# Design System Specification: The Architectural Copilot

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Atelier."** 

In an industry often cluttered with HR clichés and frantic energy, this system moves in the opposite direction: toward the quiet, focused precision of a high-end architectural studio. We are not building a simple utility; we are building a sophisticated workspace for career curation. 

The design rejects the "standard SaaS template" look. Instead of a rigid grid of boxes, we utilize **Intentional Asymmetry** and **Tonal Depth**. By leaning into high-contrast typography scales and generous, "breathable" negative space, the interface feels less like software and more like a premium editorial publication. The AI is not a chatbot "gimmick" but a luminous, ethereal presence integrated into the very fabric of the document editing experience.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep indigos and architectural slates, designed to minimize eye strain while conveying absolute authority.

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning. Structural boundaries must be defined exclusively through **Background Color Shifts**. To separate a sidebar from a main canvas, use `surface-container-low` against a `surface` background. This creates a "clean-room" aesthetic that feels intentional rather than boxed-in.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—stacked sheets of heavy-weight paper or frosted glass. Use the hierarchy below to define importance:
- **Base Layer:** `surface` (#f7f9fb)
- **Secondary Layouts:** `surface-container-low` (#f2f4f6)
- **Nested Components:** `surface-container` (#eceef0)
- **Interactive Floating Elements:** `surface-container-lowest` (#ffffff)

### The "Glass & Gradient" Rule
For AI-driven elements or high-priority floating panels, utilize **Glassmorphism**. Apply `surface_container_lowest` at 80% opacity with a `24px` backdrop-blur. 
- **Signature AI Texture:** Use a subtle linear gradient for primary CTAs and AI-active states, transitioning from `primary` (#031631) to `tertiary_container` (#0e0099). This provides a "visual soul" that feels intelligent and deep.

---

## 3. Typography
The typography system uses a dual-font approach to balance editorial elegance with functional clarity.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision. Use `display-lg` and `headline-md` with tighter letter-spacing (-0.02em) to create an authoritative, "newsroom" feel.
*   **Body & UI (Inter):** The workhorse. Inter provides maximum readability for resume data and AI suggestions. Use `body-md` for standard text and `label-md` for metadata.
*   **Hierarchy as Identity:** Create drama by pairing a `display-sm` headline with a `label-sm` subtitle in `on_surface_variant`. The vast difference in scale communicates professional polish.

---

## 4. Elevation & Depth
We eschew traditional "drop shadows" in favor of **Tonal Layering**.

*   **The Layering Principle:** Softness is achieved by stacking. Place a `surface-container-lowest` card on a `surface-container-low` background. This creates a natural "lift" without visual noise.
*   **Ambient Shadows:** For floating modals or popovers, use a shadow with a blur radius of `40px` and an opacity of `4%`. The shadow color must be a tint of `primary` (#031631) rather than black, mimicking how light interacts with deep blue materials.
*   **The "Ghost Border" Fallback:** If a container requires a border for accessibility (e.g., in high-contrast situations), use `outline_variant` at **15% opacity**. A 100% opaque border is considered a failure of the design system.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `lg` (1rem) roundedness. No border.
- **Secondary:** `surface_container_high` background with `on_surface` text.
- **Tertiary:** Transparent background, `on_surface_variant` text. High-contrast hover state using `surface_variant`.

### Input Fields
- **Styling:** Use `surface_container_low` for the field background. On focus, transition to `surface_container_lowest` with a subtle `primary` "Ghost Border."
- **Feedback:** Error states use `error` (#ba1a1a) but should be presented via soft-tinted `error_container` backgrounds rather than harsh red outlines.

### Document Cards & AI Lists
- **Rule:** Forbid divider lines. 
- **Separation:** Use `spacing-5` (1.7rem) of vertical white space or a subtle shift from `surface` to `surface_container_low`.
- **AI Suggested Chips:** Use `tertiary_fixed` background with `on_tertiary_fixed_variant` text to signify "intelligence" without using a clichéd spark icon.

### Additional Signature Components
- **The Intelligence Rail:** A thin, high-blur glass vertical bar for AI tools, utilizing `surface_tint` at low opacity.
- **The Focus Canvas:** A centered document editor that uses `surface_container_lowest` against a `surface_dim` background to create a "desk-lamp" effect, drawing the eye to the work.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace the Void:** Use `spacing-12` and `spacing-16` for section margins. Generous whitespace is a sign of a premium product.
*   **Layer Neutrals:** Mix `surface_container_low` and `surface_variant` to create subtle zones of interaction.
*   **Subtle Motion:** AI-driven transitions should use long durations (400ms+) with "Expo" easing to feel sophisticated and calm.

### Don’t:
*   **No "Pure" Black:** Never use #000000. Use `on_primary_fixed` (#081b37) for the deepest blacks to maintain the "Indigo" tonal depth.
*   **No Hard Borders:** Avoid the 1px #CCCCCC trap. If you can't see the separation, use a different surface token, not a line.
*   **No HR Clichés:** Avoid illustrations of people high-fiving or generic office photos. Use abstract geometric textures or high-end typography to fill empty states.

### Accessibility Note:
While we prioritize "softness," always ensure that text (`on_surface`) maintains a 4.5:1 contrast ratio against its respective `surface` token. High-end design is only successful if it is inclusive.```