# Đặc sản 3 Miền — Front-end

University project: **"Thiết kế Front-end cho Website cửa hàng bán đặc sản"**.
An online store for Vietnamese specialties from the three regions — **Miền Bắc, Miền Trung, Miền Nam**.

> **Front-end only.** This project has **no backend, no database and no real authentication**.
> All data (products, accounts, cart, orders) is kept in the browser with `localStorage`,
> so the website can demonstrate a complete shopping and admin workflow without a server.

---

## Technology

| Tool | Version | Used for |
| --- | --- | --- |
| Next.js (App Router) | 16.3.8 | pages and routing |
| React | 19.3 | user interface |
| TypeScript | 5.9 | types |
| Tailwind CSS | 3.4 (LTS) | styling (design tokens in `tailwind.config.ts`) |

One extra library: `qrcode` 1.5.4, which draws the VietQR bank-transfer code in the browser.
No state manager, no UI kit, no authentication library.

## Run the project

Requirements: Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open the address printed in the terminal (usually http://localhost:3000).

**Environment variables (optional for `npm run dev`).** Copy `.env.example` to `.env.local` and fill it in:

| Variable | Used for | When empty |
| --- | --- | --- |
| `NEXT_PUBLIC_BANK_BIN`, `NEXT_PUBLIC_BANK_NAME`, `NEXT_PUBLIC_BANK_ACCOUNT_NO`, `NEXT_PUBLIC_BANK_ACCOUNT_NAME` | the account printed in the bank-transfer QR code | a **sample** account (`0000000000`) with a "do not transfer" warning |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | the Cloudflare Turnstile CAPTCHA on `/dang-ky` and `/dang-nhap-quan-tri` | dev: Cloudflare's **test keys** (always pass). Production: registration and admin login are refused until real keys are set |
| `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET` | the admin login (see "Admin login" below); create both with `npm run admin:hash` | admin login is refused **in every environment** and `/dang-nhap-quan-tri` names the missing variables |

`.env.local` is ignored by git; never commit real keys.

| Command | What it does |
| --- | --- |
| `npm run dev` | development server |
| `npm run build` | production build |
| `npm run start` | runs the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run admin:hash` | asks for an admin password in a hidden prompt and prints `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET` |

> `npm run dev` uses the webpack bundler (`next dev --webpack`) because the Turbopack dev server of
> Next.js 16.3 fails to load `next/font/google` fonts. The production build uses the default (Turbopack).

## Demo accounts and passwords

**Customers** create their own accounts on **/dang-ky**. There is no sample customer account.

**Admin:** the admin password is provided in the project report. It is not in this repository. The admin is not an account in
`localStorage`: open **`/dang-nhap-quan-tri`** (no link points to it from the shop) and type the admin password.

> ⚠️ **Customer login is a front-end simulation. It is NOT secure and it is NOT real authentication.**
> Customer credentials are stored **only for front-end demonstration purposes**:
>
> - Every customer account is a record in the browser's `localStorage`, and its **password is saved there as
>   plain text** (field `password`). "Logging in" only compares what you typed with that saved text (`src/lib/password.ts`).
> - Anyone who opens the browser developer tools can read every customer password and change any customer account.
> - It needs no special browser feature (no Web Crypto), so it works the same on `http://localhost`, on a plain
>   `http://192.168.x.x` address (a phone on the same Wi-Fi) and on `https://`.
> - The customer page guards only improve the user experience of the demo — they protect nothing.
> - **Never type a real password into this website.** A real store needs a server, a database and proper
>   authentication (hashed passwords, sessions).

## Admin login (protects the admin pages only)

**What it protects:** the **entrance to the admin interface** (every page under `/admin`).
**What it does NOT protect:** the shop data (products, orders, customer accounts, discount codes, reviews). That data still
lives in the `localStorage` of each browser, so anyone using that browser can read and change it with the developer tools,
admin login or not. Customer passwords are still plain text (see above).

How it works:

1. `/dang-nhap-quan-tri` sends the password and a Turnstile token to `POST /api/admin/login` (a Next.js Route Handler, runs on the
   server). The server checks the CAPTCHA, then compares the password with the **scrypt hash** in `ADMIN_PASSWORD_HASH`. The
   password itself is never stored anywhere; the hash is only in the server's environment variables, never in the code.
2. If it matches, the server sets a cookie `tt_admin`: a session that expires after **2 hours**, signed with HMAC-SHA256 using
   `ADMIN_SESSION_SECRET`, `httpOnly` (page JavaScript cannot read it), `SameSite=Strict`, and `Secure` when the request came over
   https (Vercel). Over plain `http://` (for example `npm run start` opened at `http://192.168.x.x` on the same Wi-Fi) it is sent
   without `Secure`, otherwise the browser would drop it. A second, readable cookie `tt_admin_hint` only tells the page to show
   the "Quản trị" link in the menu; it gives no permission.
3. `src/proxy.ts` runs on the server before every `/admin` page. Without a valid `tt_admin` cookie it redirects to
   `/dang-nhap-quan-tri` and the admin page is not sent. Editing `localStorage` no longer opens `/admin`.
4. "Đăng xuất" in the admin header calls `POST /api/admin/logout`, which deletes both cookies in that browser. Sessions are not
   stored on the server, so a session cookie copied elsewhere stays valid until it expires (at most 2 hours), unless
   `ADMIN_SESSION_SECRET` is changed (that ends every session).
5. **Guessing passwords:** besides Turnstile, every wrong password makes **that IP address** wait longer before the next try:
   1, 2, 4, 8 … seconds, at most 5 minutes; a correct password resets it. ⚠️ The counter lives in the **memory of one server
   instance**: on Vercel requests can reach different instances, which also stop when idle, so it slows guessing down but is not a
   hard limit. With the Cloudflare **test** keys the CAPTCHA always passes, so set real keys for it to count.
6. Missing `ADMIN_PASSWORD_HASH` or `ADMIN_SESSION_SECRET`: admin login is refused everywhere (there is no default password), and
   the login page lists the variables to set.

### Set it up on your computer

1. `cp .env.example .env.local`
2. `npm run admin:hash`, type the admin password twice (nothing is shown while typing; at least 12 characters). The script never
   accepts the password as a command-line argument or through a pipe.
3. Paste the two printed lines (`ADMIN_PASSWORD_HASH=…`, `ADMIN_SESSION_SECRET=…`) into `.env.local`, restart `npm run dev`
   (or `npm run build` + `npm run start`), then open `/dang-nhap-quan-tri`.

### Set it up on Vercel (before pushing this version)

1. On your computer run `npm run admin:hash` (step 2 above) and keep the two printed lines.
2. Vercel → your project → **Settings → Environment Variables** → add `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET` with those
   values. Tick **both Production and Preview** (Preview deployments of other branches need them too).
3. **Redeploy** (Deployments → … → Redeploy), because environment variables are read when a deployment starts.
4. Open `https://<your-site>/dang-nhap-quan-tri` to check. Changing `ADMIN_SESSION_SECRET` later logs every admin out.

### Real Turnstile keys (so the CAPTCHA really checks)

1. Sign in to the Cloudflare dashboard (free plan) → **Turnstile** → **Add widget**.
2. Name it, add your domains (for example `dac-san-3-mien.vercel.app`, and `localhost` if you want it locally), widget mode
   **Managed**, then create it.
3. Copy the **Site Key** to `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and the **Secret Key** to `TURNSTILE_SECRET_KEY` (Vercel:
   Production and Preview; locally: `.env.local`), then redeploy. The site key is public by design; never commit the secret key.

## Show the demo on phones (same Wi-Fi)

1. Connect the computer and the phones to the **same Wi-Fi**.
2. Start the project on the computer: `npm run dev` (or `npm run build`, then `npm run start`).
3. In the phone's browser, open the **Network** address printed in the terminal, for example `http://192.168.1.20:3000`.
   (If the Wi-Fi changed after the server started, restart the server so the printed address is the current one.)

Login, registration and "change password" work over this plain `http://` address. The admin login works there too when the
admin variables are set (the session cookie is sent without `Secure` over `http://`).

Remember that **every browser keeps its own data** (see below): an account registered, or an order placed, on a phone
exists only in that phone's browser. It does not appear in the Admin pages opened on the computer.

## Pages

| Route | Page |
| --- | --- |
| `/` | Homepage, top to bottom: banner (4 photo slides: ba miền, Miền Bắc, Miền Trung, Miền Nam; photos in `public/images/banner`), **"Sản phẩm đang khuyến mãi"** (section id `san-pham-khuyen-mai`) (every in-stock product that has an old price higher than its price, biggest discount first, up to 5 in ONE row that shows 4 at a time on a computer (2 on a tablet) with arrow buttons to see the rest, swipe on a phone; the block disappears when there is none: the Admin puts a product in or out by filling or clearing "Giá cũ" in the product form), **"Tất cả sản phẩm"** (tabs: Bán chạy · Tất cả · Miền Bắc · Miền Trung · Miền Nam; up to 8 products per tab, and a "Xem tất cả sản phẩm" button at the bottom that opens `/san-pham`, filtered by region on a region tab; **Bán chạy** = top 8 in-stock products by quantity sold, cancelled orders excluded, ties: views then newest; only customers' purchases decide the order, Admin cannot rank or pin a product; the "Top 1/2/3" badge on product cards is computed the same way and only products that have sold get one), **"Ghép hộp quà ba miền"** (2 questions: occasion, budget per item; then it opens `/hop-qua` with the box already filled) |
| `/san-pham` | Product list: filter by region / province / price, sort. The province list only shows the provinces of the ticked regions (all provinces when no region is ticked; `provinceOptionsFor` in `src/lib/products.ts`); a ticked province that falls out of the list is unticked and removed from the address. **The only search box is the one in the header** (instant suggestions, recent searches, `/` shortcut, voice search; logic in `src/lib/search.ts`). Keyword and filters live in the address (`?q=`, `?region=`, `?province=` (both repeatable), `?price=`, `?sort=`), so F5, Back and shared links keep them; applied conditions show as removable chips |
| `/san-pham/[id]` | Product detail: price, stock left ("Hết hàng" disables buying), stars, description, information, quantity, "Thêm vào giỏ hàng", "Mua ngay", ♡ wishlist, related products |
| `/gio-hang` | Cart with a **tick box per product** and "Chọn tất cả": only ticked products are priced and bought, the others stay in the cart. Change quantity (never above the stock), remove, clear all, progress towards free shipping, a short `CHAOBAN` reminder for guests and customers without an order; checkout is blocked while a *ticked* line exceeds the stock |
| `/thanh-toan` | Checkout, **login required** (a guest is sent to `/dang-nhap` and comes back here; the cart is kept; `placeOrder` refuses too). Only the ticked cart products; after the order only those leave the cart; "Mua ngay" on a product page ticks only that product. The customer chooses "Mua cho bản thân" (default address from the account, nothing to retype) or "Mua tặng người thân" (recipient form). 2-level address: province (34, after the 2025 merger) → ward typed by hand. COD or bank transfer with a **VietQR code** (amount and order code filled in). Optional free gift wrap. **Mã giảm giá** field (`CHAOBAN` for a first order, offered by a one-click "Áp dụng" line; the passport coupon; shop codes, see below) |
| `/dang-nhap` | Customer login. `?next=/path` returns to that page afterwards (only paths inside the site) |
| `/dang-nhap-quan-tri` | Admin login (see "Admin login"): password checked on the server, Turnstile, increasing wait after wrong passwords. No link points to it from the shop. `?next=` only accepts paths under `/admin` |
| `/dang-ky` | Registration with a Cloudflare Turnstile CAPTCHA, verified on the server (`/api/captcha/verify`). Also reads `?next=` |
| `/tai-khoan` | My account, **one page per section**, the page content uses the full page width like the other pages, in cards (`AccountCard`): purchase history, favourites and the passport are one full-width card, **Thông tin cá nhân** is two equal cards side by side from `lg` up (profile on the left, default delivery address on the right; stacked below `lg`), and **Đổi mật khẩu** is one narrow card (`max-w-xl`) centred on the page with a centred title. There is **no menu on the account pages**: when logged in, the name in the header is a button (click, not hover) that opens a drop-down with the 5 pages and "Đăng xuất" (`src/components/layout/AccountMenu.tsx`; the list of pages is `src/components/account/accountLinks.ts`), and the open page is highlighted there. Each page has a small line "Tài khoản của tôi" and a large title with the section name. "Đăng xuất" signs out at once and goes to `/` (no confirmation, never through `/dang-nhap`: `useSignOutToHome` + the flag in `src/lib/signOut.ts`). All pages need a login (a guest is sent to `/dang-nhap` and comes back to the same page). This page is **Thông tin cá nhân**: profile and **default delivery address**. Old links `?tab=orders` / `?tab=wishlist` / `?tab=passport` redirect to the pages below |
| `/tai-khoan/lich-su-mua-hang` | Purchase history: QR code again for unpaid transfers, cancel a pending order, star rating and comment for each product of a completed order |
| `/tai-khoan/yeu-thich` | **Sản phẩm yêu thích**: the products saved with ♡ (saved per account) |
| `/tai-khoan/ho-chieu` | "Hộ chiếu đặc sản": one stamp per province, the passport coupon |
| `/tai-khoan/doi-mat-khau` | Change password |
| `/hop-qua` | "Hộp quà Ba Miền": ask occasion and budget (optional; `?dip=` and `?ngan-sach=` pre-select them), the box is filled with **one in-stock product per region** (best match first, then best seller; if a region has nothing matching it says "món gần nhất"), change any slot, then add the whole box to the cart and go straight to it. Logic in `src/lib/giftBox.ts` |
| `/tra-cuu-don-hang` | Order lookup without login: order code + phone number. Reads `?ma=` (the "Đặt hàng thành công" screen links here) |
| `/thong-tin/[slug]` | Help and policy pages (content in `src/data/infoPages.ts`): buying guide, payment, FAQ, shipping, returns, privacy, terms |
| `/admin` | Admin dashboard: orders, revenue, unpaid transfers, products, users (5 stat tiles); **revenue chart** by day (30 days) / week (12) / quarter (8) / year (completed orders, by order date); orders by status; low-stock list; top 5 sellers; **top 10 by stock** (ties: slower sellers first); recent orders |
| `/admin/san-pham` | Admin: product list with stock, delete |
| `/admin/san-pham/them` | Admin: add a product |
| `/admin/san-pham/[id]/sua` | Admin: edit a product |
| `/admin/don-hang` | Admin: orders — details, change status ("Đã hủy" returns the goods to stock), "Xác nhận đã nhận tiền" for bank transfers, delete |
| `/admin/thong-ke` | Admin: purchases per product — sold, orders, revenue, views, stock; click a column to sort. **"Tỉnh bán chạy"**: completed orders in the selected period (7/30/90 days/all) grouped by the **product's province of origin** (not the buyer's), top 10 by revenue (goods only: price × quantity, without shipping or order discount; ties by quantity) with the region in small text, quantity and order count, plus "X/34 tỉnh đã có món bán ra". Products deleted from the shop go under "Không rõ xuất xứ" (orders do not store the origin). Logic: `provinceSales` in `src/lib/stats.ts` |
| `/admin/nguoi-dung` | Admin: customer accounts — view, delete (there are no roles any more) |
| `/admin/ma-giam-gia` | Admin: discount codes — create a code (percent with optional cap, fixed amount, or free shipping; optional minimum subtotal and total number of uses), see how many orders used it, turn off, delete. The system codes `HOCHIEU50` and `CHAOBAN` are listed read-only with their usage count and cannot be created again |
| `/api/captcha/verify` | Route Handler (server): verifies a Turnstile token with Cloudflare `siteverify` using the secret key |
| `/api/admin/login`, `/api/admin/logout`, `/api/admin/session` | Route Handlers (server): admin login, logout, and "is this browser's admin session valid?" |

Unknown pages and unknown products show a Vietnamese "Lỗi 404" message.

## How the data works (localStorage)

| Key | Content | First visit |
| --- | --- | --- |
| `tuantustore-products` | all products | the 60 specialties (20 per region) of `src/data/initialData.ts` and `src/data/moreProducts.ts` |
| `tuantustore-users` | customer accounts (no admin, no roles) | `[]` |
| `tuantustore-current-user` | id of the logged-in user | — (guest) |
| `tuantustore-cart` | cart: product id + quantity | `[]` |
| `tuantustore-orders` | all orders | `[]` |
| `tuantustore-order-seq` | last order number used | `0` |
| `tuantustore-seed-batches` | groups of products added after the first version that this browser already received | `["ca-mau", "ba-mien-60", "du-34-tinh"]` |
| `tuantustore-reviews` | product reviews (stars + comment) | `[]` (no sample reviews) |
| `tuantustore-wishlists` | wishlist per account: `{ userId: [productId, …] }` | — (created at the first ♡) |
| `tuantustore-product-views` | `{ productId: number of detail-page views }` in this browser (breaks ties in "Sản phẩm bán chạy" while nothing has been sold) | — (created at the first product view) |
| `tuantustore-recently-viewed` | ids of the products this browser opened last (shown in "Đã xem gần đây") | — (not created until a product is opened) |
| `tuantustore-migrations` | ids of the one-time clean-ups this browser already ran, e.g. `remove-legacy-admin` (removes the old sample admin account `admin@tuantustore.vn` and every `role` field) `remove-contact-requests` (deletes the old key `tuantustore-contact-requests` left by the removed Liên hệ page) and `replace-<id>` for the 5 replaced products (see below); see `runMigrations` in `src/lib/storage.ts` | written on the first visit |
| `tuantustore-recent-searches` | the last 5 keywords searched in the header search box, newest first (shown as "Tìm gần đây") | — (created at the first search) |
| `tuantustore-music` | background music: `{ trackId, currentTime, volume, muted }` (track saved by id, see `src/data/playlist.ts`) | — (created when the player is first used) |

- **First visit:** a key that does not exist yet is filled with its default value. A key that already has data is
  **never overwritten**, so refreshing the page keeps every change (new products, accounts, orders…).
- **Products added in a later version** (the 5 specialties of Cà Mau): a browser that already had a product list
  receives them **once**, added at the end of its list. Nothing it saved is changed, a product with the same id is not
  added twice, and a product the Admin deletes afterwards does not come back (see `addNewSeedBatches` in `src/lib/storage.ts`).
- **Replaced sample products (November 2026, so that all 34 provinces have a product, still 20 per region):** Nước mắm Cát Hải →
  Bánh gai Ninh Giang, Bánh cốm → Vải thiều sấy Lục Ngạn (Bắc Ninh), Trà sen Tây Hồ → Bưởi Đoan Hùng (Phú Thọ), Bánh đa nem làng
  Chều → Thảo quả Lai Châu (Lai Châu), Nước mắm Nam Ô → Cam Vinh (Nghệ An). A browser that saved the old list receives the new
  products once (seed batch `du-34-tinh`); the one-time steps `replace-<old id>` then remove an old product **only if the Admin
  never edited it** (name, price, photo and brand still the sample values) and take its id out of the cart, the wishlists,
  "recently viewed" and the view counts. An old product the Admin edited is kept (the shop then has 61 products). Old orders
  keep their own copy of the product. The new products keep the old ones' creation dates, so "Mới nhất" keeps its order.
  Bưởi Đoan Hùng and Cam Vinh are fresh seasonal fruit (the only exceptions to "dried or sealed, keeps at least 2 weeks at room
  temperature"); their storage text says so (oranges: about 1 week at room temperature, about 3 weeks in the fridge).
- **Updating the sample products later** (real brands, real photos, a corrected description): a browser that already saved
  the old sample values gets the new ones, but only for a field that **still equals the old sample value**. A field the Admin
  edited is never changed. The rules are listed in `src/data/seedUpdates.ts` and applied by `applySeedUpdates` in `src/lib/storage.ts`.
- **Start again from zero:** in the browser developer tools → Application → Local Storage, delete the keys that
  start with `tuantustore-`, then reload the page.
- **"Ghi nhớ đăng nhập"** ticked: the login is kept in `localStorage` (stays after closing the browser).
  Unticked: it is kept in `sessionStorage` (only for that browser tab).
- **Order codes** are `TT-000001`, `TT-000002`, … The sequence never goes back, so a deleted order's code is not reused.
- **Each order keeps a copy of the product name and price**, so editing or deleting a product later never changes an old order.
- The data belongs to **one browser**: another browser or device starts with its own default data.

### Code structure

```
src/
├── app/                 the pages (App Router). Each page.tsx is a small server component
├── components/          the user interface, grouped by page (home, products, cart, admin…)
├── context/
│   └── StoreContext.tsx the ONE place that holds the data and saves it to localStorage
├── data/
│   ├── initialData.ts   the first products, Cà Mau included (no sample accounts)
│   ├── moreProducts.ts  the products added in November 2026 (seed batch "ba-mien-60") and the 5 replacements (seed batch "du-34-tinh"), so each region has 20
│   ├── brands.ts        what each brand is (kind, place, short introduction)
│   ├── provinces.ts     the 34 provinces after the 2025 merger, old names → new names
│   ├── contact.ts       the shop's phone, Zalo, email and opening hours (shown in the footer, `id="lien-he"`, and on the order lookup and help pages). There is no contact page: `/lien-he` redirects to `/#lien-he`
│   ├── payment.ts       the bank account of the QR code (read from environment variables)
│   └── seedUpdates.ts   changes to sample products that were already saved in a browser
├── lib/                 small helper functions without React (validation, prices, order codes, storage…)
└── types/index.ts       the data types: Product, User, CartItem, Order…
```

How a change flows, e.g. "Thêm vào giỏ":

1. The button calls `addToCart()` from `useStore()`.
2. `StoreContext` builds the new cart, saves it to `localStorage`, then updates the React state.
3. Every component that shows the cart (header badge, cart page, checkout) re-renders with the new data.

Pages first render a short "Đang tải…" state (on the server and on the first browser render), then show the data
read from `localStorage`. This avoids hydration errors, because the server has no `localStorage`.

## Notes and limitations

- **Brands** are real brands / labels, written from public information (sources in "Credits"). `src/data/brands.ts` says what
  each one is; which products a brand makes comes from the product list. In the Cà Mau products the "brand" is the
  **collective trademark of the place** (e.g. "Mật ong U Minh Hạ"), not one company. Đặc sản 3 Miền is a student project, **not** a
  dealer of these brands, and the prices and packs are sample values. Admin can only choose a brand from this list.
  For the products added in November 2026 the "brand" is a **geographical indication** (14 products, each checked against
  public sources, see below), a **craft village / traditional trade** of the place, or **"Đặc sản địa phương"** (a known local
  product that is neither a craft village nor a checked geographical indication). No company names were made up.
- Prices and packs are sample values for this project, not checked market prices.
- **Provinces after the 2025 merger.** "Xuất xứ" is one of the 34 provinces of `src/data/provinces.ts` (Admin picks it from a
  list); smaller places (Năm Căn, Rạch Gốc, U Minh…) are part of the product name, e.g. "Bánh pía Sóc Trăng" comes from "Cần Thơ".
  Old province names still typed somewhere ("Bến Tre", "Kiên Giang"…) are mapped to the new ones, so the province filter
  and the passport group them correctly. Browsers that saved the old origins get the new ones once.
- **Addresses** have 2 levels: province → ward ("Xã / Phường / Đặc khu", typed by hand: there is no verified list of the new wards
  yet; `wardOptions()` in `src/data/provinces.ts` turns the field into a list once one exists). Old orders keep their district.
- **Stock** starts at 50 for every product. Placing an order takes the goods out of stock; cancelling ("Đã hủy", only for orders
  not shipped yet) or deleting an order that was not shipped puts them back. A product at 0 shows "Hết hàng" and cannot be added
  to the cart. ⚠️ The stock lives in the browser like everything else: real stock needs a backend that updates it in a transaction.
- **Customers cancel** their own order only while it is "Chờ xác nhận" (`customerCanCancel` in `src/lib/orders.ts`), from
  "Lịch sử mua hàng" or from the order lookup (code + phone). Once the shop confirms it, only the Admin can cancel it. The goods go
  back to stock, a coupon used on it can be used again, and the Admin sees "Khách tự hủy" (`Order.cancelledByCustomer`).
- **Bank transfer (temporary):** the QR code follows the VietQR standard, so banking apps fill in the amount and the order code. The
  order stays "Chờ thanh toán" until an Admin presses "Xác nhận đã nhận tiền". Automatic confirmation needs a backend receiving a
  payment webhook (planned: PayOS — check the signature, match order code and amount, never confirm the same payment twice).
  An order whose total is 0₫ has nothing to transfer: it is saved as "Đã thanh toán" and shows no QR code (`vietQrPayload`
  refuses an amount ≤ 0).
- **CAPTCHA limitation:** the Turnstile token is verified on the server, but the account itself is still created in `localStorage`,
  so a determined bot could skip the check. With a backend, the registration API must verify the token itself.
- **Voice search** (microphone button inside the header search box, `src/hooks/useVoiceSearch.ts`): uses the browser's own Web
  Speech API (`SpeechRecognition` / `webkitSpeechRecognition`, language `vi-VN`), no library. Works in Chrome, Edge and Safari; in
  browsers without it (Firefox) the button is not shown. The words appear in the box while the customer speaks; when they stop, the
  final text stays in the box and the suggestions open as if typed (no automatic page change; Enter shows all results). Pressing
  the button again, Esc, or silence stops listening; leaving the page cancels it. Short messages under the box: microphone not
  allowed, nothing heard, network error. **Privacy:** speech is not processed by this site, but Chrome sends the audio to Google's
  speech recognition servers to turn it into text (other browsers may use their vendor's servers too), and it needs microphone
  permission.
- **Wishlist** is saved per account (in this browser): a guest pressing ♡ is sent to the login page and back.
- The photo of "Mật ong rừng U Minh Hạ" shows a bottle of honey in general (no free photo of U Minh honey was found), and
  the photo of "Kẹo dừa" shows cocoa coconut candy from Bến Tre. Replace them in Admin → Sản phẩm when you have your own photos.
- "Khô cá bổi" is dried **cá bổi (cá sặc rằn)**, a freshwater fish farmed around U Minh, not a sea fish.
- Product photos must be files inside `public/images` (there is no upload). The Admin form checks that the photo exists.
- Passwords are plain text in `localStorage` (see the warning in "Demo accounts and passwords"). That simplicity is what lets
  login work on `localhost`, on plain `http://` LAN addresses and on `https://` alike.
- Because the data is only in the browser, an unknown product address shows the 404 message with HTTP status 200.
- Shipping fee is 30.000₫, free when the subtotal reaches 300.000₫. Both values are in `src/lib/cart.ts`; the banner, cart,
  checkout and help pages read them from there. Each order stores its own shipping fee and discount, so changing these values
  never changes an old order (orders saved when every order got a fixed 20.000₫ discount keep it). There is **no automatic
  discount**: without a discount code the order gets 0₫ off and no "Giảm giá" line. A discount never exceeds the subtotal
  (`calculateTotals` caps it and shows the amount actually taken off), so the total is never negative.
- **Buying requires an account.** Browsing and adding to the cart work for guests (the cart is saved in the browser and survives the login);
  `/thanh-toan` and `placeOrder` need a logged-in customer, so every new order has a `userId`. Orders saved before this rule
  (guest orders) and orders of deleted accounts have `userId: null` and show as "Khách vãng lai" in Admin.
- Order lookup only finds orders saved in the same browser (there is no server).
- **Reviews** can only be written by a logged-in customer who has a **completed** order containing that product (one review
  per customer per product; writing again replaces it). The author or an Admin can delete a review. There are no sample
  reviews: products show five empty stars and "Chưa có đánh giá" until someone reviews them. "Đã bán" counts the quantities in
  real orders, without cancelled orders.
- **Occasions** ("Dịp tặng": Quà Tết, Biếu ông bà/bố mẹ, Ăn vặt, Cho gian bếp) are listed in `src/data/occasions.ts`; each product
  has a list of them (`Product.occasions`). They are the shop's suggestions and can be changed in the Admin product form.
- **Câu chuyện sản phẩm** (how to enjoy, storage, best season) is `Product.story`. "Mùa ngon nhất" is only filled in for products
  with a well-known season; an empty field is not shown. Browsers that saved the products before these fields existed receive
  them once; a product the Admin has saved keeps what the Admin wrote (see `applySeedUpdates`).
- **Hộ chiếu đặc sản** stamps a province when one of the customer's orders containing a product from there is completed;
  orders not completed yet show as "Đang trên đường tới bạn". With **17 stamps** the customer unlocks the coupon `HOCHIEU50`
  (50% of the subtotal, at most 200.000₫, once per account; a cancelled order gives it back). `placeOrder` checks it again. Rules are in `src/lib/coupons.ts`; the order keeps `Order.coupon`.
- **Discount codes from the shop** (`/admin/ma-giam-gia`, stored under `tuantustore-coupons`, none by default) follow the same
  rules: the customer must be logged in, each customer uses each code once, a cancelled order gives it back. One order takes at
  most one discount code (the passport code and `CHAOBAN` count as one) plus one free-shipping code (`Order.shippingCoupon`).
- **`CHAOBAN`** (welcome code, defined in `src/lib/coupons.ts` like the passport code, not stored with the shop codes): 20.000₫ off
  (capped at the subtotal) for an account with no order except cancelled ones, so a cancelled first order gives it back. Checkout
  shows "Đơn đầu tiên của bạn? Dùng mã CHAOBAN giảm 20.000₫" with an "Áp dụng" button while the customer is eligible and has no
  discount code yet; `placeOrder` checks it again through `applyCodes`. The Admin cannot create a code named `CHAOBAN` or `HOCHIEU50`.
- **Background music** (round button at the bottom left of every shop page, not on `/admin`): it never starts by itself. One
  `<audio>` element lives in `MusicProvider` (`src/context/MusicContext.tsx`) inside the root layout, so the music keeps playing
  while the customer moves between pages. After a reload the track and position come back, paused ("Nghe tiếp «…»"). A file
  that cannot load is skipped with a short message; if every file fails the player stops and says "Chưa phát được nhạc nền".
  Two open tabs never play at the same time. The music files go in `public/audio` (see Credits).
- The help and policy pages are sample policies for this student project, and each page says so.

## Troubleshooting

- **A phone cannot open the page:** check that both devices use the same Wi-Fi, that you typed the **current** Network address
  of the terminal, and that the computer's firewall allows Node.js. Some campus or public Wi-Fi networks stop devices from
  reaching each other — a phone hotspot or a home router usually works.

## Name and logo

The shop is called **"Đặc sản 3 Miền"** (the repository, the npm package and the `tuantustore-…` localStorage keys
keep the old internal name, so saved data and logins keep working).

Logo (design supplied by the shop owner): a wine-red bowl whose steam curls into the number 3, a pair of chopsticks and a gold
conical hat. The symbol, with the background removed (a transparent picture in two colours, wine red and gold), is
`public/brand/mark.webp`; the favicon and the iOS icon are
`src/app/icon.png` and `src/app/apple-icon.png` (the symbol on a cream square). The words "ĐẶC SẢN 3 MIỀN" next to the symbol are
real text in the serif font Lora (loaded in `src/app/layout.tsx`), in the colours of the logo (wine red and gold), so they stay
sharp at any size. The footer adds the line "TINH HOA ẨM THỰC VIỆT". The site uses the `Logo` component
(`src/components/brand/Logo.tsx`). The pictures are bitmaps (not vectors): sharp up to about 3× the size shown on the site; for
print, ask the designer for a vector or a larger file.

## Credits

Photos: Wikimedia Commons (full list below). Fonts: the whole site is set in Arial (a system font, nothing to download); only the shop name in the logo uses Lora (Google Fonts)

Homepage banner photos (`public/images/banner`): supplied by the shop owner (illustrations; the dishes are not all products sold in the shop).

Background music (`public/audio`, listed in `src/data/playlist.ts`):

- `satie-gymnopedie-1.mp3`: "Gymnopédie No. 1" by Erik Satie, played by Robin Alciatore, **public domain** (MP3 version made by
  Wikimedia Commons from the original Ogg file) —
  https://commons.wikimedia.org/wiki/File:Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg
- `noi-nay-co-anh.mp3`: "Nơi này có anh" by Sơn Tùng M-TP. **Copyrighted**: used with the permission the project owner obtained
  for this site. Remove it if that permission ends.
- `thanh-do.mp3`: "Thành Đô" by GUrbane (label: ZuongZero Entertainment, from the file's own tags). **Copyrighted**: used with the
  permission the project owner obtained for this site. Remove it if that permission ends.

Photos of the products (Wikimedia Commons; each one cropped to a square and resized). **"Illustration"** means the photo shows
the same kind of product but was not made or photographed at the place in the product name (or the file page does not say
where). No two products use the same source photo.

Miền Bắc (20 products):


- `p-banh-cay-lang-nguyen.jpg`: "Bánh cáy" by Nguyễn Thanh Quang, CC BY-SA 4.0 (làng Nguyễn, Thái Bình cũ) —
  https://commons.wikimedia.org/wiki/File:B%C3%A1nh_c%C3%A1y.JPG
- `p-banh-dau-xanh-hai-duong.jpg`: "Bánh đậu xanh" by Hoangkid, CC BY-SA 4.0 (a Hải Dương brand) —
  https://commons.wikimedia.org/wiki/File:B%C3%A1nh_%C4%91%E1%BA%ADu_xanh.jpg
- `p-banh-gai-ninh-giang.jpg`: "Banh gai 3" by Phó Nháy, public domain — **illustration** (bánh gai of Nam Định; contrast and
  saturation raised slightly) — https://commons.wikimedia.org/wiki/File:Banh_gai_3.jpg
- `p-buoi-doan-hung.jpg`: "Pomelo fruit" by Ivar Leidus, CC BY-SA 4.0 — **illustration** (background extended at the top and
  bottom to make it square) — https://commons.wikimedia.org/wiki/File:Pomelo_fruit.jpg
- `p-cha-muc-ha-long.jpg`: "Chả mực" by Hoangkid (Đặng Thái Hoàng), CC BY-SA 4.0 (Hạ Long) —
  https://commons.wikimedia.org/wiki/File:Ch%E1%BA%A3_m%E1%BB%B1c.jpg
- `p-che-shan-tuyet-moc-chau.jpg`: "Che Shan tuyet" by VuThiAnh, public domain — **illustration** (Shan tuyết tea photographed
  in Hà Nội) — https://commons.wikimedia.org/wiki/File:Che_Shan_tuyet.JPG
- `p-com-chay-ninh-binh.jpg`: "Cơm cháy Ninh Bình" by Nguyễn Thanh Quang, CC BY-SA 3.0 —
  https://commons.wikimedia.org/wiki/File:C%C6%A1m_ch%C3%A1y_Ninh_B%C3%ACnh.JPG
- `p-gao-tam-dien-bien.jpg`: "JasmineRice" by Henningklevjer, CC BY-SA 2.5 — **illustration** —
  https://commons.wikimedia.org/wiki/File:JasmineRice.jpg
- `p-hat-de-trung-khanh-v2.jpg`: "Chestnuts roasted" by Achromatic, CC BY 3.0 — **illustration** (530 px, the largest usable
  size) — https://commons.wikimedia.org/wiki/File:Chestnuts_roasted.jpg
- `p-hoa-hoi-lang-son.jpg`: "Dried Star Anise Fruit Seeds" by Sanjay Acharya, CC BY-SA 4.0 — **illustration** —
  https://commons.wikimedia.org/wiki/File:Dried_Star_Anise_Fruit_Seeds.jpg
- `p-long-nhan-hung-yen.jpg`: "Seedless longan jerky" by Fumikas Sagisavas, CC0 — **illustration** (photographed in China) —
  https://commons.wikimedia.org/wiki/File:Seedless_longan_jerky.jpg
- `p-mat-ong-bac-ha-meo-vac-v2.jpg`: "Antiguan honey products at an exhibition in Saint Lucia" by the Government of Antigua and
  Barbuda, public domain — **illustration** —
  https://commons.wikimedia.org/wiki/File:Antiguan_honey_products_at_an_exhibition_in_Saint_Lucia.jpg
- `p-mien-dong-binh-lieu-v2.jpg`: "Dongfen" by Miuki (author assumed by Commons), CC BY-SA 3.0 — **illustration** (the photo
  shows mung-bean vermicelli; miến dong is made from canna starch) — https://commons.wikimedia.org/wiki/File:Dongfen.JPG
- `p-o-mai.jpg`: "O mai chanh com" by VuThiAnh, public domain — **illustration** (ô mai chanh cốm, a close kind of ô mai) —
  https://commons.wikimedia.org/wiki/File:O_mai_chanh_com.JPG
- `p-que-van-yen.jpg`: "Cassia bark - (2)" by trophygeek, CC BY 2.0 — **illustration** —
  https://commons.wikimedia.org/wiki/File:Cassia_bark_-_(2).jpg
- `p-thao-qua-lai-chau.jpg`: "Dried Yunnan grass fruit" by Fumikas Sagisavas, CC0 — **illustration** (photographed in China) —
  https://commons.wikimedia.org/wiki/File:Dried_Yunnan_grass_fruit.jpg
- `p-thit-trau-gac-bep.jpg`: "Thịt trâu gác bếp Tả Phìn Hồ" by GiangLy, CC BY-SA 4.0 — **illustration** (Tả Phìn Hồ, Hà Giang cũ,
  not Sơn La) — https://commons.wikimedia.org/wiki/File:Th%E1%BB%8Bt_tr%C3%A2u_g%C3%A1c_b%E1%BA%BFp_T%E1%BA%A3_Ph%C3%ACn_H%E1%BB%93.jpg
- `p-tra-thai-nguyen.jpg`: "Tra sen - Vietnamese Lotus Tea" by VuThiAnh, public domain — **illustration** (Vietnamese tea
  photographed in Hà Nội, not Tân Cương tea) — https://commons.wikimedia.org/wiki/File:Tra_sen_-_Vietnamese_Lotus_Tea.JPG
- `p-tuong-ban-v3.jpg`: "Chum ủ tương Bần, Hưng Yên, 2024" by Truyền hình Hưng Yên (HYTV), CC BY 3.0 —
  https://commons.wikimedia.org/wiki/File:Chum_%E1%BB%A7_t%C6%B0%C6%A1ng_B%E1%BA%A7n,_H%C6%B0ng_Y%C3%AAn,_2024.png
- `p-vai-thieu-say-luc-ngan.jpg`: "Dried lychee (1)" by Fumikas Sagisavas, CC0 — **illustration** (photographed in China) —
  https://commons.wikimedia.org/wiki/File:Dried_lychee_(1).jpg


Miền Trung (20 products):

- `p-nem-chua-thanh-hoa.jpg` (Nem chua Thanh Hóa): "Nem chua" by Ron Diggity, CC BY 2.0 — **illustration** (nem chua at a restaurant, not checked as Thanh Hóa) —
  https://commons.wikimedia.org/wiki/File:Nem_chua.jpg
- `p-keo-cu-do-ha-tinh.jpg` (Kẹo cu đơ Hà Tĩnh): "KeoCudo" by Lưu Ly at vi.wikipedia, public domain — **illustration** (place not stated) —
  https://commons.wikimedia.org/wiki/File:KeoCudo.JPG
- `p-khoai-deo-quang-binh.jpg` (Khoai deo Quảng Bình): "Đặc Sản Khoai Deo Quảng Bình" by Review Quang Binh, CC BY-SA 4.0 —
  https://commons.wikimedia.org/wiki/File:%C4%90%E1%BA%B7c_S%E1%BA%A3n_Khoai_Deo_Qu%E1%BA%A3ng_B%C3%ACnh.jpg
- `p-che-vang-quang-tri.jpg` (Chè vằng Quảng Trị): "Chè vằng" by Viethavvh, CC BY-SA 3.0 — **illustration** (place not stated) —
  https://commons.wikimedia.org/wiki/File:Ch%C3%A8_v%E1%BA%B1ng.jpg
- `p-me-xung-hue.jpg` (Mè xửng Huế): "Caramelo de mango con sésamo y maní · Vietnam" by Seba Della y Sole Bossio, CC BY 2.0 (sesame candy from Huế) —
  https://commons.wikimedia.org/wiki/File:Caramelo_de_mango_con_s%C3%A9samo_y_man%C3%AD_%C2%B7_Vietnam.jpg
- `p-banh-trang-dai-loc.jpg` (Bánh tráng Đại Lộc): "Handmade rice paper wrappers drying on bamboo mats" by Wanderingspoon, CC BY-SA 4.0 — **illustration** (place not stated) —
  https://commons.wikimedia.org/wiki/File:Handmade_rice_paper_wrappers_drying_on_bamboo_mats.jpg
- `p-toi-ly-son.jpg` (Tỏi Lý Sơn): "Rổ tỏi Lý Sơn ng5th2n2023" by Phương Huy, CC BY-SA 4.0 —
  https://commons.wikimedia.org/wiki/File:R%E1%BB%95_t%E1%BB%8Fi_L%C3%BD_S%C6%A1n_ng5th2n2023.jpg
- `p-ho-tieu-chu-se.jpg` (Hồ tiêu Chư Sê): "Black Peppercorns (4422070187)" by Ryan Snyder, CC BY 2.0 — **illustration** —
  https://commons.wikimedia.org/wiki/File:Black_Peppercorns_(4422070187).jpg
- `p-nho-say-ninh-thuan.jpg` (Nho sấy Ninh Thuận): "Giống nho NH01-125, Ninh Thuận" by Windrain, CC BY-SA 4.0 — **illustration** (fresh grapes of Ninh Thuận, not raisins) —
  https://commons.wikimedia.org/wiki/File:Gi%E1%BB%91ng_nho_NH01-125,_Ninh_Thu%E1%BA%ADn.jpg
- `p-muc-mot-nang-nha-trang.jpg` (Mực một nắng Nha Trang): "Phan Thiết ng25th7n2023 (mực một nắng Phan Thiết) (2)" by Phương Huy, CC0 — **illustration** (one-sun squid of Phan Thiết, not Nha Trang) —
  https://commons.wikimedia.org/wiki/File:Phan_Thi%E1%BA%BFt_ng25th7n2023_(m%E1%BB%B1c_m%E1%BB%99t_n%E1%BA%AFng_Phan_Thi%E1%BA%BFt)_(2).jpg
- `p-tra-atiso-da-lat.jpg` (Trà atiso Đà Lạt): "Atisô bán tại chợ Đà Lạt, Vietnam" by Hungda, CC BY-SA 3.0 — **illustration** (fresh artichokes at Đà Lạt market, not the tea) —
  https://commons.wikimedia.org/wiki/File:Atis%C3%B4_b%C3%A1n_t%E1%BA%A1i_ch%E1%BB%A3_%C4%90%C3%A0_L%E1%BA%A1t,_Vietnam.JPG
- `p-ca-phe-khe-sanh.jpg` (Cà phê Khe Sanh): "Cà phê Khe Sanh ở Đông Hà 20201110" by Phương Huy, CC BY-SA 4.0 (Khe Sanh coffee served in Đông Hà) —
  https://commons.wikimedia.org/wiki/File:C%C3%A0_ph%C3%AA_Khe_Sanh_%E1%BB%9F_%C4%90%C3%B4ng_H%C3%A0_20201110.jpg
- `p-yen-sao-khanh-hoa.jpg` (Yến sào Khánh Hòa): "Yến sào thô" by Yensaolocoi, CC0 — **illustration** (place not stated) —
  https://commons.wikimedia.org/wiki/File:Y%E1%BA%BFn_s%C3%A0o_th%C3%B4.jpg
- `p-duong-phen-quang-ngai.jpg` (Đường phèn Quảng Ngãi): "Đường phèn dạng hạt" by Southern Vietnam, CC BY-SA 4.0 — **illustration** (place not stated) —
  https://commons.wikimedia.org/wiki/File:%C4%90%C6%B0%E1%BB%9Dng_ph%C3%A8n_d%E1%BA%A1ng_h%E1%BA%A1t.jpg
- `p-banh-kho-me.jpg` (Bánh khô mè Cẩm Lệ): "Banh kho me" by Huỳnh Đức Sol, CC BY-SA 4.0 — **illustration** (place not stated) —
  https://commons.wikimedia.org/wiki/File:Banh_kho_me.jpg
- `p-ca-phe.jpg` (Cà phê hạt Buôn Ma Thuột): "Vietnam coffee beans VOA" by Daniel Schearf, public domain (coffee cherries at a farm in Buôn Ma Thuột) —
  https://commons.wikimedia.org/wiki/File:Vietnam_coffee_beans_VOA.jpg
- `p-cam-vinh.jpg` (Cam Vinh): "Cam Vinh - một loại cam đặc sản Nghệ An" by Hangphuong86, CC BY-SA 3.0 (cropped to leave out
  the traceability sticker) —
  https://commons.wikimedia.org/wiki/File:Cam_Vinh_-_m%E1%BB%99t_lo%E1%BA%A1i_cam_%C4%91%E1%BA%B7c_s%E1%BA%A3n_Ngh%E1%BB%87_An.JPG
- `p-mach-nha-thi-pho.jpg` (Mạch nha Thi Phổ), `p-bo-mot-nang-krong-pa.jpg` (Bò một nắng Krông Pa),
  `p-nuoc-mam-phan-thiet.jpg` (Nước mắm Phan Thiết): **source not traced yet**. They were taken from Wikimedia Commons in
  November 2026 but their file pages have not been found again; they will be credited or replaced in the Miền Trung photo review.


Miền Nam (20 products; the 5 Cà Mau photos and the coconut candy are listed below):

- `p-banh-trang-phoi-suong.jpg` (Bánh tráng phơi sương Trảng Bàng): "Bánh tráng cuốn thịt heo" by Lê Huỳnh Bộ, CC BY-SA 4.0 — **illustration** (place not stated) —
  https://commons.wikimedia.org/wiki/File:B%C3%A1nh_tr%C3%A1ng_cu%E1%BB%91n_th%E1%BB%8Bt_heo.jpg
- `p-hat-dieu-binh-phuoc.jpg` (Hạt điều Bình Phước): "Hạt điều Bình Phước, tháng 12 năm 2016 (1)" by Phương Huy, public domain —
  https://commons.wikimedia.org/wiki/File:H%E1%BA%A1t_%C4%91i%E1%BB%81u_B%C3%ACnh_Ph%C6%B0%E1%BB%9Bc,_th%C3%A1ng_12_n%C4%83m_2016_(1).jpg
- `p-kho-ca-dua-can-gio.jpg` (Khô cá dứa Cần Giờ): "Cà Mau ng24th2n2023 (đặc sản khô cá dứa) (2)" by Phương Huy, CC0 — **illustration** (dried fish of Cà Mau, not Cần Giờ) —
  https://commons.wikimedia.org/wiki/File:C%C3%A0_Mau_ng24th2n2023_(%C4%91%E1%BA%B7c_s%E1%BA%A3n_kh%C3%B4_c%C3%A1_d%E1%BB%A9a)_(2).jpg
- `p-nem-lai-vung.jpg` (Nem Lai Vung): "Nem chua Lai Vung" by TUIBAJAVE, CC BY-SA 4.0 —
  https://commons.wikimedia.org/wiki/File:Nem_chua_Lai_Vung.jpg
- `p-hat-sen-dong-thap.jpg` (Hạt sen sấy Đồng Tháp): "Hạt sen và táo tàu ng30th6n2022 (2)" by Phương Huy, CC0 — **illustration** (place not stated) —
  https://commons.wikimedia.org/wiki/File:H%E1%BA%A1t_sen_v%C3%A0_t%C3%A1o_t%C3%A0u_ng30th6n2022_(2).jpg
- `p-hu-tieu-my-tho.jpg` (Hủ tiếu khô Mỹ Tho): "Tô hủ tiếu Mỹ Tho, ng14th8n2022 (chén gan thêm) (1)" by Phương Huy, CC0 — **illustration** (a bowl of hủ tiếu Mỹ Tho, not the dried noodles) —
  https://commons.wikimedia.org/wiki/File:T%C3%B4_h%E1%BB%A7_ti%E1%BA%BFu_M%E1%BB%B9_Tho,_ng14th8n2022_(ch%C3%A9n_gan_th%C3%AAm)_(1).jpg
- `p-lap-xuong-soc-trang.jpg` (Lạp xưởng Sóc Trăng): "Lễ hội ẩm thực Cửa Việt th4n2023 đặc sản Hướng Hóa, lạp xưởng (1)" by Phương Huy, CC BY-SA 4.0 — **illustration** (lạp xưởng of Hướng Hóa, Quảng Trị, not Sóc Trăng) —
  https://commons.wikimedia.org/wiki/File:L%E1%BB%85_h%E1%BB%99i_%E1%BA%A9m_th%E1%BB%B1c_C%E1%BB%ADa_Vi%E1%BB%87t_th4n2023_%C4%91%E1%BA%B7c_s%E1%BA%A3n_H%C6%B0%E1%BB%9Bng_H%C3%B3a,_l%E1%BA%A1p_x%C6%B0%E1%BB%9Fng_(1).jpg
- `p-mam-chau-doc.jpg` (Mắm cá lóc Châu Đốc): "Mắm cá lóc" by Bùi Thụy Đào Nguyên, CC BY-SA 3.0 —
  https://commons.wikimedia.org/wiki/File:M%E1%BA%AFm_c%C3%A1_l%C3%B3c.JPG
- `p-duong-thot-not.jpg` (Đường thốt nốt An Giang): "Trái thốt nốt 2" by Bùi Thụy Đào Nguyên, CC BY-SA 3.0 — **illustration** (palmyra fruits sold in An Giang, not the sugar) —
  https://commons.wikimedia.org/wiki/File:Tr%C3%A1i_th%E1%BB%91t_n%E1%BB%91t_2.jpg
- `p-xoai-cat-hoa-loc.jpg` (Xoài cát Hòa Lộc): "Xoài cát Hòa Lộc" by Hungda, CC0 (Hòa Lộc mangoes at a market in Cần Thơ) —
  https://commons.wikimedia.org/wiki/File:Xo%C3%A0i_c%C3%A1t_H%C3%B2a_L%E1%BB%99c.JPG
- `p-dua-sap-cau-ke.jpg` (Dừa sáp Cầu Kè): "Dừa sáp Cầu Kè, Trà Vinh." by Dongson.vmvn, CC BY-SA 3.0 —
  https://commons.wikimedia.org/wiki/File:D%E1%BB%ABa_s%C3%A1p_C%E1%BA%A7u_K%C3%A8,_Tr%C3%A0_Vinh..jpg
- `p-banh-pia.jpg` (Bánh pía Sóc Trăng): "Bánh pía 01" by Nguyễn Thanh Quang, CC BY-SA 3.0 — **illustration** (place not stated) —
  https://commons.wikimedia.org/wiki/File:B%C3%A1nh_p%C3%ADa_01.JPG
- `p-nuoc-mam.jpg` (Nước mắm cá cơm Phú Quốc): "Vietnam - Fish sauce fermentation jars" by P. Hughes, CC BY 4.0 — **illustration** (fermentation jars in the Mekong delta, not Phú Quốc) —
  https://commons.wikimedia.org/wiki/File:Vietnam_-_Fish_sauce_fermentation_jars.jpg
- `p-muoi-tom-tay-ninh.jpg` (Muối tôm Tây Ninh): **source not traced yet** (same as above; Miền Nam photo review).

Photos of the Cà Mau products and the coconut candy (cropped and resized):

- `p-cua-bien-nam-can.jpg`: "Cua Cà Mau bán trên đường NS, ng30th7n2023 (3)" by Phương Huy, CC BY-SA 4.0 —
  https://commons.wikimedia.org/wiki/File:Cua_C%C3%A0_Mau_b%C3%A1n_tr%C3%AAn_%C4%91%C6%B0%E1%BB%9Dng_NS,_ng30th7n2023_(3).jpg
- `p-tom-kho-rach-goc.jpg`: "Đặc sản Tôm khô Cà Mau" by Dongson.vmvn, CC BY-SA 3.0 —
  https://commons.wikimedia.org/wiki/File:%C4%90%E1%BA%B7c_s%E1%BA%A3n_T%C3%B4m_kh%C3%B4_C%C3%A0_Mau.jpg
- `p-ba-khia-muoi.jpg`: "Ba khía muối" by Baoothersks, CC BY-SA 4.0 —
  https://commons.wikimedia.org/wiki/File:Ba_kh%C3%ADa_mu%E1%BB%91i.jpg
- `p-kho-ca-boi.jpg`: "Khô cá sặc rằn" by Bùi Thụy Đào Nguyên, CC BY-SA 3.0 (cropped; the fish were photographed at a market in Bạc Liêu) —
  https://commons.wikimedia.org/wiki/File:Kh%C3%B4_c%C3%A1_s%E1%BA%B7c_r%E1%BA%B1n.jpg
- `p-mat-ong-u-minh-ha.jpg`: "Honey Bottle" by JJ Harrison, CC BY-SA 3.0 (background extended to make it square) —
  https://commons.wikimedia.org/wiki/File:Honey_Bottle.jpg
- `p-keo-dua-ben-tre.jpg`: "Ben Tre Cocoa-coconut candy (1)" by Fumikas Sagisavas, CC0 (cropped) —
  https://commons.wikimedia.org/wiki/File:Ben_Tre_Cocoa-coconut_candy_(1).jpg

Sources for the brand introductions in `src/data/brands.ts` (public articles, checked in November 2026; they may change):

- Cà Mau collective trademarks (honey, dried bổi fish, dried shrimp, crab): Nhân Dân, "Cà Mau có 14 sản phẩm được bảo hộ" —
  https://nhandan.vn/ca-mau-co-14-san-pham-duoc-bao-ho-post731394.html
- Dried bổi fish ("Khô cá bổi U Minh", owner: Hội Nông dân huyện Trần Văn Thời): Thương hiệu & Công luận —
  https://thuonghieucongluan.com.vn/agribank-dong-hanh-ho-tro-phat-trien-dac-san-kho-ca-boi-tinh-ca-mau-a234654.html
- Ba khía (heritage decision 4612/QĐ-BVHTTDL, 20/12/2019): Báo Quốc tế —
  https://baoquocte.vn/muoi-ba-khia-ca-mau-tu-mon-an-dan-da-den-di-san-van-hoa-phi-vat-the-quoc-gia-322686.html
- Tân Huê Viên: https://tapchicongthuong.vn/banh-pia-tan-hue-vien---tinh-yeu-voi-que-me-soc-trang-66731.htm
- Bà Liễu Mẹ (OCOP Đà Nẵng): https://danangfantasticity.com/natural/banh-kho-me-ba-lieu-me-san-pham-ocop-da-nang
- Hồng Lam: https://mia.vn/cam-nang-du-lich/top-hang-banh-com-noi-tieng-18814
- Kẹo dừa Cô Hai Tỏ: https://mytour.vn/vi/blog/bai-viet/keo-dua-co-hai-to-mon-ngon-dac-san-hap-dan.html
- Geographical indications of the November 2026 products (Mộc Châu, Điện Biên, Mèo Vạc, Trùng Khánh, Lạng Sơn, Văn Yên,
  Hưng Yên, Hạ Long, Phan Thiết, Ninh Thuận, Bình Phước, Hòa Lộc): Wikipedia tiếng Việt, "Danh sách chỉ dẫn địa lý ở Việt Nam" —
  https://vi.wikipedia.org/wiki/Danh_s%C3%A1ch_ch%E1%BB%89_d%E1%BA%ABn_%C4%91%E1%BB%8Ba_l%C3%BD_%E1%BB%9F_Vi%E1%BB%87t_Nam
- Hạt tiêu Chư Sê: Bộ Công Thương — https://moit.gov.vn/tu-hao-hang-viet-nam/bao-ho-chi-dan-dia-ly-chu-se-cho-san-pham-hat-tieu.html
- Tỏi Lý Sơn (certificate no. 00081, 2020): VnExpress — https://vnexpress.net/toi-ly-son-co-chi-dan-dia-ly-4123238.html
- Chỉ dẫn địa lý "Tân Cương": https://vov.vn/kinh-te/tang-cuong-bao-ve-thuong-hieu-che-tan-cuong-post1140083.vov
- Khải Hoàn: https://vinpearl.com/vi/tong-hop-cac-nha-thung-nuoc-mam-phu-quoc-noi-tieng-nhat
- Trung Nguyên: https://en.wikipedia.org/wiki/Trung_Nguy%C3%AAn
- Bánh gai Ninh Giang: Báo Hải Phòng — https://news.baohaiphong.vn/print/155772.html; Vietnam+ —
  https://en.vietnamplus.vn/specialities-of-hai-duong-post196185.vnp
- Vải thiều Lục Ngạn (geographical indication 2008, protected in Japan 2021): Tuổi Trẻ —
  https://tuoitre.vn/vai-thieu-luc-ngan-duoc-nhat-ban-cap-bang-bao-ho-chi-dan-dia-ly-20210316202354705.htm
- Bưởi Đoan Hùng (geographical indication 2006): Bộ Công Thương —
  https://moit.gov.vn/tin-tuc/xuc-tien-thuong-mai/bao-ve-va-phat-trien-thuong-hieu-buoi-dac-san-doan-hung-.html
- Thảo quả Lai Châu: Báo Pháp luật —
  https://doanhnhan.baophapluat.vn/kham-pha-san-vat-mien-bac-viet-nam-mien-dong-binh-lu-hat-doi-rung-thao-qua-lai-chau-47291.html;
  Báo Lai Châu — https://baolaichau.vn/kinh-te/am-no-nho-thao-qua
- Cam Vinh (geographical indication no. 00012, 2007; area extended 2019): Nông nghiệp và Môi trường —
  https://nongnghiepmoitruong.vn/mo-rong-khu-vuc-dia-ly-trong-cam-vinh-d252262.html
