# Luminary Design System — Chanakya Enterprise Specification

Inspired by the high-end architectural aesthetics of `templatemo_621_luminary`, this design system provides an ultra-premium, modern user interface optimized for both **Dark Mode (Luminary Obsidian)** and **Light Mode (Luminary Alabaster)**.

---

## 1. Color Palette Tokens

The design system is built entirely on custom CSS variables with smooth theme transitions.

### Dark Mode (Luminary Obsidian — Default)

| Token | Hex / Value | Description & Purpose |
| :--- | :--- | :--- |
| `--base-deep` | `#0F1115` | Deepest luxury background void |
| `--base-mid` | `#161A20` | Secondary container and sidebar background |
| `--base-soft` | `#1C2128` | Elevated card surfaces and active tab items |
| `--slate-warm` | `#6B7280` | Subtle metadata, timestamps, and placeholder labels |
| `--slate-light` | `#9CA3AF` | Secondary body text and description paragraphs |
| `--graphite` | `#2A2E35` | Subtle divider rules and interactive icon borders |
| `--graphite-soft`| `#3D424A` | Hover border accentuation |
| `--ivory` | `#E5E7EB` | Primary high-contrast headings and active typography |
| `--ivory-muted` | `#C9CDD4` | Secondary interactive links |
| `--silver` | `#B0B8C4` | Metallic accent chrome, active dots, and button gradients |
| `--panel-bg` | `rgba(22, 26, 32, 0.72)` | Glassmorphic panel fill |
| `--panel-border`| `rgba(156, 163, 175, 0.12)` | Hairline translucent boundary border |
| `--silk-ease` | `cubic-bezier(0.16, 1, 0.3, 1)` | Luxury easing curve for micro-animations |

### Light Mode (Luminary Alabaster)

Toggled via the Sun/Moon switch in the top navigation bar, applying the `.light` class to `document.documentElement`:

| Token | Hex / Value | Description & Purpose |
| :--- | :--- | :--- |
| `--base-deep` | `#F8FAFC` | Clean alabaster slate background |
| `--base-mid` | `#FFFFFF` | Pure white container surfaces |
| `--base-soft` | `#F1F5F9` | Elevated card surfaces and active pills |
| `--slate-warm` | `#64748B` | Subtle metadata and captions |
| `--slate-light` | `#475569` | High-readability body copy |
| `--graphite` | `#E2E8F0` | Clean light dividers and hairline borders |
| `--graphite-soft`| `#CBD5E1` | Hover border accents |
| `--ivory` | `#0F172A` | Deep obsidian high-contrast text |
| `--ivory-muted` | `#1E293B` | High-contrast secondary typography |
| `--silver` | `#334155` | Refined slate-chrome accent color |
| `--panel-bg` | `rgba(255, 255, 255, 0.88)` | Translucent light glassmorphism |
| `--panel-border`| `rgba(15, 23, 42, 0.08)` | Crisp hairline light boundary |

---

## 2. Glassmorphism & Panel Styling

Luminary avoids solid flat boxes, employing translucent glass cards with backdrop blur:

```css
.luminary-panel {
  background: var(--panel-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--panel-border);
  transition: all 0.6s var(--silk-ease);
}

.luminary-card {
  background: var(--panel-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--panel-border);
  border-radius: 1.25rem;
  transition: transform 0.6s var(--silk-ease), border-color 0.6s var(--silk-ease), box-shadow 0.6s var(--silk-ease);
}

.luminary-card:hover {
  transform: translateY(-2px);
  border-color: var(--card-hover-border);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.18);
}
```

---

## 3. Button & Action Specifications

### Primary Action (`luminary-btn-primary`)
- **Appearance**: Pill-shaped (`rounded-full`) with a metallic silver gradient (`linear-gradient(135deg, var(--silver), var(--slate-light))`).
- **Typography**: Bold uppercase tracking (`letter-spacing: 0.05em; font-size: 0.8125rem`).
- **Interaction**: Scales smoothly to `1.02` on hover with a diffuse silver halo shadow (`box-shadow: 0 6px 24px rgba(176, 184, 196, 0.22)`).

### Secondary Action (`luminary-btn-secondary`)
- **Appearance**: Translucent glass background with hairline border (`border: 1px solid var(--panel-border)`).
- **Hover**: Background shifts slightly with subtle border glow.

---

## 4. Iconography Standards

> [!IMPORTANT]
> **Strict Rule**: Unicode emojis (e.g. 🤖, 💬, 📁, 📄) are strictly forbidden in production code. 
> All UI indicators, status pills, and navigation links must use **Lucide-React** SVG icons.

Key Lucide Icon Mappings:
- **Assistant Mascot**: `<Bot className="h-5 w-5 stroke-[2] text-[var(--silver)]" />`
- **Upload**: `<UploadCloud className="h-5 w-5 stroke-[2]" />`
- **Conversations**: `<MessageSquare className="h-5 w-5 stroke-[2]" />`
- **Knowledge Base**: `<Database className="h-5 w-5 stroke-[2]" />`
- **Verifiable Citations**: `<Sparkles className="h-4 w-4 stroke-[2]" />` & `<BookmarkCheck className="h-4 w-4" />`
- **Verified Status**: `<CheckCircle2 className="h-3.5 w-3.5 stroke-[2]" />`
- **Theme Toggle**: `<Sun className="h-4 w-4 stroke-[2]" />` & `<Moon className="h-4 w-4 stroke-[2]" />`

---

## 5. Typography & Hierarchy

- **Font Family**: Modern sans-serif stack (`Montserrat`, `Inter`, system fallback).
- **Headings**: Light/ultra-light font weights (`font-light` / `font-extralight`) combined with bold accents:
  ```html
  <h1 className="text-4xl font-light text-[var(--ivory)]">
    Chanakya <strong className="font-semibold text-transparent bg-clip-text bg-gradient-to-r ...">Assistant</strong>
  </h1>
  ```
- **Category Tags**: Small uppercase with wide tracking (`text-[10px] tracking-widest uppercase font-semibold text-[var(--silver)]`).
