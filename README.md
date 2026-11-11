# The Grandeur Design — Website Revamp

Premium static website for **The Grandeur Design**, an architecture, building-planning
and interior-design studio in R.S. Puram, Coimbatore.

## Tech Stack

- HTML5 · CSS3 · Bootstrap 5 · JavaScript (ES6) · jQuery
- No React / Vue / Tailwind / server framework — fully static front-end

## Project Structure

```
grandeur-design/
├── index.html              # Home
├── about.html              # About, founder, mission & vision
├── services.html           # All 8 service areas (anchored sections)
├── projects.html           # Filterable portfolio
├── project.html?id=<id>    # Reusable project detail template
├── process.html            # Five-step workflow
├── contact.html            # Contact info + enquiry form (n8n webhook)
├── privacy-policy.html     # Editable placeholder — needs legal review
├── components/
│   ├── header.html         # Reusable navbar (injected via jQuery)
│   └── footer.html         # Reusable footer (injected via jQuery)
├── assets/
│   ├── css/style.css       # Full design system (white + light green)
│   ├── js/main.js          # Nav, filters, lightbox, form → webhook
│   ├── js/jquery-custom.js # Includes, counters, FAQ, smooth scroll
│   ├── js/projects-data.js # EDIT THIS to add/update projects
│   └── images/             # Local SVG placeholders — replace with photos
├── docs/
│   ├── n8n-automation-setup.md
│   └── client-content-checklist.md
├── robots.txt
└── sitemap.xml
```

## Local Setup

The header/footer are injected with jQuery `$.get()`, which browsers block on
`file://`. Always serve over HTTP:

```bash
# any one of these, from the project folder:
npx serve .
python3 -m http.server 8000
php -S localhost:8000
```

Then open `http://localhost:8000`. Upload the folder contents to any static
host (cPanel, Netlify, Vercel static, GitHub Pages) for deployment.

## Configuration (edit before launch)

1. **n8n webhook URL** — `assets/js/main.js`, top of file: `GD_CONFIG.n8nWebhookUrl`
2. **Phone / WhatsApp / email** — same `GD_CONFIG` block
3. **Logo** — replace `.gd-brand-mark` in `components/header.html` with `<img>`
4. **Social links** — footer placeholder `gd-social` blocks; add URLs only after client verification
5. **Google Maps embed** — `contact.html` placeholder box
6. **Statistics** — all numbers on `index.html` are marked `*` pending client verification
7. **Testimonials / team photos / project photos** — placeholders, await client approval
8. **Address PIN** — confirm 641002 vs 641005

## Portfolio Management

Edit `assets/js/projects-data.js`. Each project:

```js
{ id: "unique-slug", name: "Project Name", category: "Residence|Office|Cafe|Hospital|Hotel|Commercial|Industrial",
  location: "City (only if verified — else '')", scope: "…",
  description: "Approved description", images: ["photo-1.jpg", …] }
```

Drop photos into `assets/images/projects/` — cards, filters and detail pages
update automatically. Do not invent locations or descriptions.

## Enquiry Automation (n8n)

The form POSTs JSON to your n8n webhook. Full setup — webhook → email to
business → customer acknowledgement → WhatsApp Cloud API business alert →
opt-in-only customer confirmation → Google Sheets row — is documented in
`docs/n8n-automation-setup.md`. All credentials stay inside n8n; nothing
secret exists in this front-end. Success/error messages reflect the real
server response; nothing is faked.

## Image Inventory (what photos to request from the client)

| Placeholder | Needed photo |
|---|---|
| `assets/images/hero.svg` | Wide architectural hero shot (interior or façade), 2000px+, landscape |
| `assets/images/studio.svg` | Studio/team at work or finished interior, portrait crop |
| `assets/images/projects/keerthi-chips-1.svg` | Keerthi Chips interior wide shot |
| `assets/images/projects/belgium-street-1.svg` | Belgium Street outdoor seating wide shot |
| `assets/images/projects/vsv-dhanapal-1.svg` | Double-height living room shot |
| `assets/images/projects/placeholder-project.svg` | 2–4 photos per remaining approved project, landscape 4:3 |
| Founder portrait | Gowri Shankar, portrait 3:4 |
| Team photos | 3–6 headshots 3:4 |

Export as WebP/JPEG, compressed (< 300 KB each), 1600px wide.
