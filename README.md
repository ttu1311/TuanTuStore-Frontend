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
| `/` | Homepage: hero, 3 regions, featured products, best sellers |
| `/san-pham` | Product list: search, filter by region / brand / price, sort. Reads `?q=` and `?region=` |
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
| `tuantustore-products` | all products | the 8 specialties of `src/data/initialData.ts` |
| `tuantustore-users` | all accounts | the demo ADMIN account |
| `tuantustore-current-user` | id of the logged-in user | — (guest) |
| `tuantustore-cart` | cart: product id + quantity | `[]` |
| `tuantustore-orders` | all orders | `[]` |
| `tuantustore-order-seq` | last order number used | `0` |

- **First visit:** a key that does not exist yet is filled with its default value. A key that already has data is
  **never overwritten**, so refreshing the page keeps every change (new products, accounts, orders…).
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
│   └── initialData.ts   the 8 products and the demo ADMIN of the first visit
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

- Product brands are still the placeholder values of the original project ("Thương hiệu A" … "Thương hiệu D").
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

Photos: Wikimedia Commons (credited in the footer). Fonts: Phudu and Be Vietnam Pro (Google Fonts).
