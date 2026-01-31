# tree.je - Simple, Private File Conversion

A browser-based file conversion website built with Next.js. All file conversions happen locally in the browser - no uploads, no tracking, complete privacy.

## 🎨 Design Philosophy

- **Minimal & Classy**: Clean, premium design inspired by tpot.cc and lnk.ad
- **Green Theme**: Professional soft green color palette (#2d5f3f)
- **Typography**: 
  - **Headings**: Instrument Serif (elegant, professional)
  - **Body**: Inter (clean, modern)
- **No Gradients**: Clean white/light gray backgrounds
- **Generous Spacing**: Breathing room for content
- **Subtle Animations**: Smooth hover effects only
- **Fully Responsive**: Optimized for mobile, tablet, laptop (1024px+), and large desktop (1440px+)
  - Mobile-first approach with progressive enhancement
  - 1-column grid on mobile
  - 2-column grid on tablets (768px+)
  - 3-column grid on laptops (1024px+)
  - Enhanced spacing and typography scaling on large desktops (1440px+)

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules (no Tailwind)
- **Fonts**: Google Fonts (Inter + Instrument Serif)

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles & design tokens
│   ├── layout.tsx            # Root layout with fonts
│   ├── page.tsx              # Homepage
│   ├── page.module.css       # Homepage styles
│   └── tools/
│       └── pdf-to-image/     # Sample tool page
│           ├── page.tsx
│           └── page.module.css
```

## 🎯 Features

### Homepage
1. **Header**: Simple text logo "tree.je"
2. **Hero Section**: 
   - Tagline: "Simple, private file conversion."
   - Subtext about browser-based & privacy
   - Primary CTA: "Choose file"
3. **Tools Grid**: Clean grid of conversion tools
   - PDF converters (PDF to Image, TXT to PDF, HTML to PDF, Image to PDF)
   - Image converters (JPG/PNG, WEBP, SVG, etc.)
4. **Privacy Line**: Reinforces local processing
5. **Minimal Footer**: Copyright info

### Tool Pages
- Consistent design with homepage
- Back navigation
- Upload area with drag & drop UI
- Options (format, quality)
- Convert button
- Same typography and green theme

## 🎨 Design Tokens

```css
/* Colors */
--color-primary: #2d5f3f          /* Main green */
--color-primary-light: #3d7a52    /* Hover green */
--color-primary-lighter: #e8f5e9  /* Light green bg */

/* Typography */
--font-heading: 'Instrument Serif'
--font-body: 'Inter'

/* Spacing */
--spacing-sm: 1rem
--spacing-md: 1.5rem
--spacing-lg: 2rem
--spacing-xl: 3rem

/* Border Radius */
--radius-md: 12px
--radius-lg: 16px
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## 📝 Brand Tone

- Quiet confidence
- Professional & modern
- No marketing fluff
- Focus on trust and simplicity

## 🔒 Privacy First

All file conversions happen locally in the browser using JavaScript. Your files never leave your device, ensuring complete privacy and security.

---

**tree.je** — Simple, private file conversion.
