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
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | the Cloudflare Turnstile CAPTCHA on `/dang-ky` | dev: Cloudflare's **test keys** (always pass). Production: registration is refused until real keys are set |

`.env.local` is ignored by git; never commit real keys.

| Command | What it does |
| --- | --- |
| `npm run dev` | development server |
| `npm run build` | production build |
| `npm run start` | runs the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

> `npm run dev` uses the webpack bundler (`next dev --webpack`) because the Turbopack dev server of
> Next.js 16.3 fails to load `next/font/google` fonts. The production build uses the default (Turbopack).

## Demo accounts and passwords

| Email | Password |
| --- | --- |
| `admin@tuantustore.vn` | `Admin@123` |

This ADMIN account is created automatically on the first visit (see "How the data works" below).
Customers create their own accounts on **/dang-ky** (always with the role USER).

> ⚠️ **The login is a front-end simulation. It is NOT secure and it is NOT real authentication.**
> Credentials are stored **only for front-end demonstration purposes**:
>
> - There is no server. Every account is a record in the browser's `localStorage`, and its **password is saved there as
>   plain text** (field `password`). "Logging in" only compares what you typed with that saved text (`src/lib/password.ts`).
> - Anyone who opens the browser developer tools can read every password and change any account or role.
> - It needs no special browser feature (no Web Crypto), so it works the same on `http://localhost`, on a plain
>   `http://192.168.x.x` address (a phone on the same Wi-Fi) and on `https://`.
> - The page guards (customer pages, Admin pages) only improve the user experience of the demo — they protect nothing.
> - **Never type a real password into this website.** A real store needs a server, a database and proper
>   authentication (hashed passwords, sessions).

## Show the demo on phones (same Wi-Fi)

1. Connect the computer and the phones to the **same Wi-Fi**.
2. Start the project on the computer: `npm run dev` (or `npm run build`, then `npm run start`).
3. In the phone's browser, open the **Network** address printed in the terminal, for example `http://192.168.1.20:3000`.
   (If the Wi-Fi changed after the server started, restart the server so the printed address is the current one.)

Login, registration and "change password" work over this plain `http://` address.

Remember that **every browser keeps its own data** (see below): an account registered, or an order placed, on a phone
exists only in that phone's browser. It does not appear in the Admin pages opened on the computer.

## Pages

| Route | Page |
| --- | --- |
| `/` | Homepage: banner, short introduction with the "Bắc vào Nam" route (one stop per **province**, north to south by latitude), featured products (purchases × 5 + views, top 8), the 3 regions, "Về Đặc sản 3 Miền" |
| `/san-pham` | Product list: search, filter by region / province / brand / price, sort. Reads `?q=`, `?region=`, `?province=`, `?brand=` and `?dip=` (occasion) |
| `/san-pham/[id]` | Product detail: price, stock left ("Hết hàng" disables buying), stars, description, information, quantity, "Thêm vào giỏ hàng", "Mua ngay", ♡ wishlist, related products |
| `/gio-hang` | Cart: change quantity (never above the stock), remove, clear all, totals, progress towards free shipping; checkout is blocked while a line exceeds the stock |
| `/thanh-toan` | Checkout: logged-in customers choose "Mua cho bản thân" (default address from the account, nothing to retype) or "Mua tặng người thân" (recipient form). 2-level address: province (34, after the 2025 merger) → ward typed by hand. COD or bank transfer with a **VietQR code** (amount and order code filled in). Optional free gift wrap |
| `/dang-nhap` | Login (customers and Admin use the same page). `?next=/path` returns to that page afterwards (only paths inside the site) |
| `/dang-ky` | Registration with a Cloudflare Turnstile CAPTCHA, verified on the server (`/api/captcha/verify`). Also reads `?next=` |
| `/tai-khoan` | My account: profile and **default delivery address**, my orders (QR code again for unpaid transfers), **Sản phẩm yêu thích**, "Hộ chiếu đặc sản", change password, logout. `?tab=orders` / `?tab=wishlist` / `?tab=passport` open those tabs |
| `/hop-qua` | "Hộp quà Ba Miền": pick one product from each region and add the whole box to the cart |
| `/tra-cuu-don-hang` | Order lookup without login: order code + phone number. Reads `?ma=` (the "Đặt hàng thành công" screen links here) |
| `/thong-tin/[slug]` | Help and policy pages (content in `src/data/infoPages.ts`): buying guide, payment, FAQ, shipping, returns, privacy, terms |
| `/ban-do` | Map of the three regions with one dot per province, and the provinces listed north to south with their latitude |
| `/lien-he` | Contact: call, Zalo and email links, and a "call me back" form (name, phone, topic, preferred time, message). Reads `?chu-de=` to pre-select the topic. Contact details live in `src/data/contact.ts` |
| `/nguon-anh` | Photo credits: author and licence of each photo |
| `/admin` | Admin dashboard: orders, revenue, average order, unpaid transfers, products, low stock, users, waiting call-backs; orders by status; low-stock list; top 5 sellers; recent orders |
| `/admin/san-pham` | Admin: product list with stock, delete |
| `/admin/san-pham/them` | Admin: add a product |
| `/admin/san-pham/[id]/sua` | Admin: edit a product |
| `/admin/don-hang` | Admin: orders — details, change status ("Đã hủy" returns the goods to stock), "Xác nhận đã nhận tiền" for bank transfers, delete |
| `/admin/thong-ke` | Admin: purchases per product — sold, orders, revenue, views, stock; click a column to sort |
| `/admin/nguoi-dung` | Admin: users — change role (USER / ADMIN), delete |
| `/admin/lien-he` | Admin: "call me back" requests — filter waiting / called, mark as called, delete |
| `/api/captcha/verify` | Route Handler (server): verifies a Turnstile token with Cloudflare `siteverify` using the secret key |

Unknown pages and unknown products show a Vietnamese "Lỗi 404" message.

## How the data works (localStorage)

| Key | Content | First visit |
| --- | --- | --- |
| `tuantustore-products` | all products | the 13 specialties of `src/data/initialData.ts` |
| `tuantustore-users` | all accounts | the demo ADMIN account |
| `tuantustore-current-user` | id of the logged-in user | — (guest) |
| `tuantustore-cart` | cart: product id + quantity | `[]` |
| `tuantustore-orders` | all orders | `[]` |
| `tuantustore-order-seq` | last order number used | `0` |
| `tuantustore-seed-batches` | groups of products added after the first version that this browser already received | `["ca-mau"]` |
| `tuantustore-reviews` | product reviews (stars + comment) | `[]` (no sample reviews) |
| `tuantustore-contact-requests` | "call me back" requests sent from `/lien-he` | `[]` |
| `tuantustore-wishlists` | wishlist per account: `{ userId: [productId, …] }` | — (created at the first ♡) |
| `tuantustore-product-views` | `{ productId: number of detail-page views }` in this browser (ranks "Sản phẩm nổi bật") | — (created at the first product view) |
| `tuantustore-recently-viewed` | ids of the products this browser opened last (shown in "Đã xem gần đây") | — (not created until a product is opened) |

- **First visit:** a key that does not exist yet is filled with its default value. A key that already has data is
  **never overwritten**, so refreshing the page keeps every change (new products, accounts, orders…).
- **Products added in a later version** (the 5 specialties of Cà Mau): a browser that already had a product list
  receives them **once**, added at the end of its list. Nothing it saved is changed, a product with the same id is not
  added twice, and a product the Admin deletes afterwards does not come back (see `addNewSeedBatches` in `src/lib/storage.ts`).
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
│   ├── initialData.ts   the 13 products and the demo ADMIN of the first visit
│   ├── brands.ts        what each brand is (kind, place, short introduction)
│   ├── provinces.ts     the 34 provinces after the 2025 merger: one latitude/longitude each, old names → new names
│   ├── contact.ts       the shop's phone, Zalo, email and opening hours
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
- Prices and packs are sample values for this project, not checked market prices.
- **Provinces after the 2025 merger.** "Xuất xứ" is one of the 34 provinces of `src/data/provinces.ts` (Admin picks it from a
  list); smaller places (Năm Căn, Rạch Gốc, U Minh…) are part of the product name, e.g. "Bánh pía Sóc Trăng" comes from "Cần Thơ".
  Old province names still typed somewhere ("Bến Tre", "Kiên Giang"…) are mapped to the new ones, so the route, the filter,
  the map and the passport group them correctly. Each province has **one** latitude (its administrative centre), used for the
  route column, the north-to-south order and the map dot. Browsers that saved the old origins get the new ones once.
- **Addresses** have 2 levels: province → ward ("Xã / Phường / Đặc khu", typed by hand: there is no verified list of the new wards
  yet; `wardOptions()` in `src/data/provinces.ts` turns the field into a list once one exists). Old orders keep their district.
- **Stock** starts at 50 for every product. Placing an order takes the goods out of stock; cancelling ("Đã hủy", only for orders
  not shipped yet) or deleting an order that was not shipped puts them back. A product at 0 shows "Hết hàng" and cannot be added
  to the cart. ⚠️ The stock lives in the browser like everything else: real stock needs a backend that updates it in a transaction.
- **Bank transfer (temporary):** the QR code follows the VietQR standard, so banking apps fill in the amount and the order code. The
  order stays "Chờ thanh toán" until an Admin presses "Xác nhận đã nhận tiền". Automatic confirmation needs a backend receiving a
  payment webhook (planned: PayOS — check the signature, match order code and amount, never confirm the same payment twice).
- **CAPTCHA limitation:** the Turnstile token is verified on the server, but the account itself is still created in `localStorage`,
  so a determined bot could skip the check. With a backend, the registration API must verify the token itself.
- **Wishlist** is saved per account (in this browser): a guest pressing ♡ is sent to the login page and back.
- The photo of "Mật ong rừng U Minh Hạ" shows a bottle of honey in general (no free photo of U Minh honey was found), and
  the photo of "Kẹo dừa" shows cocoa coconut candy from Bến Tre. Replace them in Admin → Sản phẩm when you have your own photos.
- "Khô cá bổi" is dried **cá bổi (cá sặc rằn)**, a freshwater fish farmed around U Minh, not a sea fish.
- Product photos must be files inside `public/images` (there is no upload). The Admin form checks that the photo exists.
- Passwords are plain text in `localStorage` (see the warning in "Demo accounts and passwords"). That simplicity is what lets
  login work on `localhost`, on plain `http://` LAN addresses and on `https://` alike.
- Because the data is only in the browser, an unknown product address shows the 404 message with HTTP status 200.
- Shipping fee is 30.000₫, free when the subtotal reaches 300.000₫; every order gets a fixed 20.000₫ discount. All three values are
  in `src/lib/cart.ts`; the announcement bar, cart, checkout and help pages read them from there. Each order stores its own
  shipping fee, so changing these values never changes an old order.
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
  orders not completed yet show as "Đang trên đường tới bạn".
- The help and policy pages are sample policies for this student project, and each page says so.

## Troubleshooting

- **A phone cannot open the page:** check that both devices use the same Wi-Fi, that you typed the **current** Network address
  of the terminal, and that the computer's firewall allows Node.js. Some campus or public Wi-Fi networks stop devices from
  reaching each other — a phone hotspot or a home router usually works.
- **"Tài khoản này được tạo bằng phiên bản cũ…" when logging in:** that account was saved in this browser by an earlier version
  of the project, before passwords were kept as described above. Delete it in Admin → Người dùng and register again, or clear the
  `tuantustore-` keys (see "Start again from zero"). The demo ADMIN above is repaired automatically.

## Name and logo

The shop is called **"Đặc sản 3 Miền"** (the repository, the npm package, the `tuantustore-…` localStorage keys and the demo
admin e-mail keep the old internal name, so saved data and logins keep working).

Logo: a cream round seal in which Vietnam's S-shaped land is drawn as the **number 3**, in three strokes = three regions
(north rice-green, centre red-orange, south sunny gold), with two small dot clusters for the Hoàng Sa and Trường Sa
archipelagos and a young leaf sprouting out of the seal. Wordmark: "ĐẶC SẢN" above "3 MIỀN".
The site uses the `Logo` / `LogoMark` components (`src/components/brand/Logo.tsx`; the wordmark is real text in the site font);
the favicon is `src/app/icon.svg`. Standalone files for use outside the site: `public/brand/logo-horizontal.svg`,
`logo-on-dark.svg` and `logo-mark.svg` (their text falls back to Arial Narrow / Arial where the Phudu font is not installed).

## Credits

Photos: Wikimedia Commons. The page `/nguon-anh` lists the author and licence of each photo below (keep the two lists the same). Fonts: Phudu and Be Vietnam Pro (Google Fonts)

Photos of the Cà Mau products (cropped and resized):

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
- Chỉ dẫn địa lý "Tân Cương": https://vov.vn/kinh-te/tang-cuong-bao-ve-thuong-hieu-che-tan-cuong-post1140083.vov
- Khải Hoàn: https://vinpearl.com/vi/tong-hop-cac-nha-thung-nuoc-mam-phu-quoc-noi-tieng-nhat
- Trung Nguyên: https://en.wikipedia.org/wiki/Trung_Nguy%C3%AAn
