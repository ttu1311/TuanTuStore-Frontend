# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Đặc sản 3 Miền" (internal name TuanTuStore): a **front-end-only** university project, a Vietnamese-specialties shop built with Next.js 16 (App Router), React 19, TypeScript (strict) and Tailwind 3.4. There is **no backend, no database and no real auth**: all data lives in the browser's `localStorage`. Deployed on Vercel from `main`. `README.md` is detailed (pages, storage keys, business rules, credits); read it before changing behaviour.

## Commands

```bash
npm run dev         # next dev --webpack (NOT Turbopack: Turbopack dev fails to load next/font/google)
npm run build       # production build (Turbopack)
npm run start       # run the production build
npm run lint        # eslint . (eslint-config-next core-web-vitals + typescript)
npm run typecheck   # tsc --noEmit
```

There is no test suite. Verify changes with `npm run typecheck`, `npm run lint` and by exercising the page in the dev server. If `tsc` complains about a deleted route, clear stale generated types: `rm -rf .next/dev/types .next/types`.

Env vars (see `.env.example`, copy to `.env.local`): bank details for the VietQR code (`NEXT_PUBLIC_BANK_*`) and Cloudflare Turnstile keys (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`). Both are optional in dev (sample account / Cloudflare test keys). Production registration needs the Turnstile vars set in Vercel; do not delete them there.

## Architecture

**Single data store.** `src/context/StoreContext.tsx` (`useStore()`) is the one place that holds products, users, orders, cart, reviews, coupons, wishlist, etc. Components never touch `localStorage` directly. Every action follows the **persist pattern**: write the new value to storage first (`writeJSON` from `src/lib/storage.ts`), and only update React state if the write succeeded; otherwise return `{ ok: false, message }`. Actions return `ActionResult` / `PlaceOrderResult` rather than throwing. Multi-step actions (e.g. cancelling an order restocks products) must roll back if a later write fails.

**Hydration.** The server and the first browser render have `isReady === false` and empty lists, so pages show "Đang tải…"; a `useEffect` then seeds missing storage keys, loads everything and sets `isReady`. Anything that reads store data must handle `isReady === false`, or hydration errors appear.

**Server/client split.** Every `page.tsx` / `layout.tsx` is a small server component (it exports `metadata`) that renders `"use client"` components from `src/components/<area>/`. Server code is limited to the Turnstile check (`src/app/api/captcha/verify`, shared helper `src/lib/turnstile.ts`) and the admin login below. Route group `(shop)` is for organisation only and is not in URLs; `/admin/*` has its own layout.

**Admin login (protects the admin UI only).** The admin is NOT an account in localStorage and `User` has no role. `/dang-nhap-quan-tri` posts to `/api/admin/login`, which checks Turnstile, a per-IP increasing wait (`src/lib/adminLoginGuard.ts`, in-memory, one instance only) and an scrypt hash in `ADMIN_PASSWORD_HASH`, then sets an HMAC-signed httpOnly cookie (`ADMIN_SESSION_SECRET`, 2 h, `Secure` only on https requests) plus a readable hint cookie that only shows the "Quản trị" nav link. `src/proxy.ts` refuses `/admin/*` without a valid cookie; `StoreContext.isAdmin` comes from `/api/admin/session`. Missing env vars = login refused everywhere. Shop data stays in localStorage and is NOT protected; say so wherever this is described. One-time data clean-ups go in `runMigrations` (`src/lib/storage.ts`, key `tuantustore-migrations`).

**Logic lives in `src/lib/`** as plain, React-free functions shared by UI and `StoreContext`, so the UI preview and the final `placeOrder` can never disagree. Examples: `coupons.ts` (`applyCodes` is used by both checkout and `placeOrder`), `cart.ts` (`calculateTotals`, shipping/discount constants), `orders.ts`, `stats.ts` (revenue series, top-stock), `giftBox.ts`, `passport.ts`. Put new business rules there, not in components.

**Static data and migrations.** `src/data/` holds seed products (`initialData.ts`, `moreProducts.ts`), provinces, brands, info-page text. Browsers that already saved older data are upgraded without overwriting admin edits through `seedBatches` (`addNewSeedBatches`), `seedUpdates.ts` (`applySeedUpdates`, only changes a field still equal to the old sample value) and renamed-image maps in `src/lib/storage.ts`. Never rename a `tuantustore-*` storage key or change seed data without adding such a migration; real users' browsers hold the old data.

**Business rules worth knowing** (full detail in README): buying needs a logged-in customer (`/thanh-toan` is wrapped in `RequireLogin` and `placeOrder` refuses guests; guests can still browse and fill the cart); order totals = subtotal + shipping (30k, free from 300k) − discount (only from a discount code, never above the subtotal, so the total is never negative; no automatic discount); the system code `CHAOBAN` gives 20k off a customer's first order (no non-cancelled order yet); one discount code plus one free-shipping code per order, once per customer per code, a cancelled order returns the code; the passport code `HOCHIEU50` unlocks at 17 stamped provinces; customers can cancel only while an order is `PENDING`; revenue counts `COMPLETED` orders bucketed by order date in the Vietnam timezone.

## Conventions

- UI text, code comments and error messages are in **Vietnamese**; keep that. Identifiers are English.
- Styling: Tailwind with colour tokens as CSS variables `--c-*` in `src/app/globals.css` (mapped in `tailwind.config.ts`). The UI's primary colour is a turmeric orange (`--c-primary`); the logo and shop name keep the original wine red (hard-coded in `Logo.tsx`). Keep white text on `primary` at 4.5:1 contrast or better. `text-wrap: pretty` is the body default and `balance` is applied to headings, table cells, labels and buttons so no single word wraps alone; check long Vietnamese strings on mobile widths.
- Fonts: the whole site is set in **Arial** (system font, nothing to download); `font-sans` and `font-display` in `tailwind.config.ts` are the same Arial stack. Only the logo wordmark and the italic line of the homepage banner use **Lora** (`--font-brand`, loaded in `src/app/layout.tsx`). Headings are written in normal case with weight ≤ 700; only small kicker labels (e.g. "GIÁ TỐT") stay uppercase. Arial is wider than the old display font, so recheck headings and nowrap buttons at 360px.
- Path alias `@/*` → `src/*`. Product photos must be files in `public/images`.
- Charts are hand-written SVG (`src/components/admin/charts/`); there is no chart library.

## Working with this user

- Reply in Vietnamese.
- Do **not** commit or push unless asked; the user runs `git push` themselves (Vercel auto-deploys on push). Commits end with a `Co-Authored-By: Claude … <noreply@anthropic.com>` line naming the model that wrote them.
- This is coursework: keep every visible feature (e.g. the Turnstile CAPTCHA, view counting) even if it cannot truly work without a backend. In audits, do not propose deleting such features; deleting dead code and unused files is fine.
- Never type a password into the production site.
