# Deployment Guide & Production Checklist

This guide walks through deploying the NutriAdd (Life Care) website to
production on Vercel, connecting a custom domain via Cloudflare, and the
pre-launch checklist.

---

## 1. Push to GitHub

The repository is already initialised locally with an initial commit.

```bash
# Create a new EMPTY repo on github.com (no README/license), then:
git remote add origin https://github.com/<your-username>/nutriadd.git
git push -u origin main
```

## 2. Import into Vercel

1. Go to https://vercel.com → **Add New → Project**.
2. Import the `nutriadd` GitHub repository.
3. Vercel auto-detects the settings from `package.json`:
   - **Framework preset:** Vite
   - **Build command:** `pnpm build` (runs the sitemap generator first)
   - **Output directory:** `dist`
   - **Install command:** `pnpm install`
4. Add environment variables (see step 3) **before** the first deploy.
5. Click **Deploy**.

## 3. Environment Variables (Vercel → Settings → Environment Variables)

| Variable             | Example                    | Notes                                               |
| -------------------- | -------------------------- | --------------------------------------------------- |
| `RESEND_API_KEY`     | `re_xxxxxxxx`              | From https://resend.com → API Keys                  |
| `CONTACT_TO_EMAIL`   | `info@lifecare.com`        | Where contact-form submissions are delivered        |
| `CONTACT_FROM_EMAIL` | `website@nutriadd.com`     | **Must be a verified sender/domain in Resend**      |
| `VITE_SITE_URL`      | `https://www.nutriadd.com` | Your final public URL (used by sitemap + canonical) |

> Set these for the **Production** (and Preview) environments, then redeploy so
> `VITE_SITE_URL` is baked into the build.

## 4. Resend Setup

1. Create an account at https://resend.com.
2. **Verify your sending domain** (add the DNS records Resend provides).
   Until the domain is verified, use `onboarding@resend.dev` as
   `CONTACT_FROM_EMAIL` for testing only.
3. Create an **API key** and add it to Vercel as `RESEND_API_KEY`.

## 5. Custom Domain + Cloudflare DNS

1. In Vercel → **Project → Settings → Domains**, add your domain
   (e.g. `www.nutriadd.com` and the apex `nutriadd.com`).
2. Vercel shows the required DNS records. In **Cloudflare → DNS**:
   - Apex `nutriadd.com`: add an **A** record → `76.76.21.21`
     (or the value Vercel shows).
   - `www`: add a **CNAME** → `cname.vercel-dns.com`.
   - Set both records' proxy status to **DNS only (grey cloud)** initially so
     Vercel can issue the SSL certificate. You can enable the orange-cloud
     proxy afterwards if desired.
3. Wait for DNS propagation; Vercel provisions **SSL (Let's Encrypt)**
   automatically.
4. Update `VITE_SITE_URL` to the final domain and redeploy.
5. Update `public/robots.txt` sitemap line and the default in
   `src/lib/site-config.ts` if the domain differs from `www.nutriadd.com`.

---

## Pre-Launch Checklist

### Content & assets

- [x] CEO **name** (Sajid M. Janjua) and **photo** added.
- [x] Official **NutriAdd logo** integrated into navbar and footer.
- [ ] Add the 9 real **principal/partner logos** (`principals-section.tsx`).
- [ ] Replace **placeholder testimonials** (`src/lib/data/testimonials.ts`).
- [ ] Replace **sample blog posts** (`src/lib/data/blog.ts`).
- [ ] Add the **product catalogue** (Products page currently "coming soon").
- [ ] Add a **1200×630 `og-image.png`** to `public/` for social sharing.
- [ ] Add real **social media links** (`src/components/layout/footer.tsx`).
- [ ] Have **Privacy Policy** and **Terms** reviewed by a professional.

### Technical

- [ ] All environment variables set on Vercel.
- [ ] Resend sending domain verified; test the contact form end-to-end.
- [ ] `VITE_SITE_URL` matches the production domain.
- [ ] Custom domain resolves with valid SSL.
- [ ] `robots.txt` and `sitemap.xml` reachable at the domain root.
- [ ] Run Lighthouse (Performance / Accessibility / SEO / Best Practices).
- [ ] Verify Open Graph preview (e.g. with a link-preview debugger).
- [ ] Submit the sitemap in **Google Search Console**.

### Nice to have

- [ ] Analytics (e.g. Vercel Analytics or Plausible).
- [ ] A favicon set beyond the current SVG (PNG/ICO fallbacks).
