# TuanTuStore — Front-end

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

No other libraries: no state manager, no UI kit, no authentication library.

## Run the project

Requirements: Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open the address printed in the terminal (usually http://localhost:3000).

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
| `/` | Homepage: hero, 3 regions, featured products. Sidebar: best sellers, new arrivals, a clickable map of the three regions (regions and provinces), recently viewed |
| `/san-pham` | Product list: search, filter by region / province / brand / price, sort. Reads `?q=`, `?region=`, `?province=` and `?brand=` |
| `/san-pham/[id]` | Product detail: price, description, information, quantity, "Thêm vào giỏ hàng", "Mua ngay", related products |
| `/gio-hang` | Cart: change quantity, remove, totals |
| `/thanh-toan` | Checkout: delivery form, COD or bank transfer (simulated), creates an order |
| `/dang-nhap` | Login (customers and Admin use the same page) |
| `/dang-ky` | Registration |
| `/tai-khoan` | My account: profile, my orders, change password, logout |
| `/admin` | Admin dashboard: numbers and recent orders |
| `/admin/san-pham` | Admin: product list, delete |
| `/admin/san-pham/them` | Admin: add a product |
| `/admin/san-pham/[id]/sua` | Admin: edit a product |
| `/admin/don-hang` | Admin: orders — details, change status, delete |
| `/admin/nguoi-dung` | Admin: users — change role (USER / ADMIN), delete |

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
  **collective trademark of the place** (e.g. "Mật ong U Minh Hạ"), not one company. TuanTuStore is a student project, **not** a
  dealer of these brands, and the prices and packs are sample values. Admin can only choose a brand from this list.
- Prices and packs are sample values for this project, not checked market prices.
- The province is part of the "Xuất xứ" text (e.g. "Năm Căn, Cà Mau"). There is no separate province field: the
  province is the last part of "Xuất xứ", and it is used for the "Tỉnh / thành" filter (with the number of products). The search also
  looks in "Xuất xứ" ("Cà Mau" or "ca mau" finds them).
- The photo of "Mật ong rừng U Minh Hạ" shows a bottle of honey in general (no free photo of U Minh honey was found), and
  the photo of "Kẹo dừa" shows cocoa coconut candy from Bến Tre. Replace them in Admin → Sản phẩm when you have your own photos.
- "Khô cá bổi" is dried **cá bổi (cá sặc rằn)**, a freshwater fish farmed around U Minh, not a sea fish.
- Product photos must be files inside `public/images` (there is no upload). The Admin form checks that the photo exists.
- Passwords are plain text in `localStorage` (see the warning in "Demo accounts and passwords"). That simplicity is what lets
  login work on `localhost`, on plain `http://` LAN addresses and on `https://` alike.
- Because the data is only in the browser, an unknown product address shows the 404 message with HTTP status 200.
- Shipping fee (30.000₫) and discount (20.000₫) are fixed values, as in the original design.

## Troubleshooting

- **A phone cannot open the page:** check that both devices use the same Wi-Fi, that you typed the **current** Network address
  of the terminal, and that the computer's firewall allows Node.js. Some campus or public Wi-Fi networks stop devices from
  reaching each other — a phone hotspot or a home router usually works.
- **"Tài khoản này được tạo bằng phiên bản cũ…" when logging in:** that account was saved in this browser by an earlier version
  of the project, before passwords were kept as described above. Delete it in Admin → Người dùng and register again, or clear the
  `tuantustore-` keys (see "Start again from zero"). The demo ADMIN above is repaired automatically.

## Credits

Photos: Wikimedia Commons. The footer links to the page `/nguon-anh`, which lists the author and licence of each photo below (keep the two lists the same). Fonts: Phudu and Be Vietnam Pro (Google Fonts)

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
