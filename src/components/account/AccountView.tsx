"use client";

import { useState } from "react";
import OrdersSection from "@/components/account/OrdersSection";
import PasswordSection from "@/components/account/PasswordSection";
import ProfileSection from "@/components/account/ProfileSection";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";

const sections = [
  { id: "profile", label: "Thông tin cá nhân" },
  { id: "orders", label: "Đơn hàng của tôi" },
  { id: "password", label: "Đổi mật khẩu" },
  { id: "logout", label: "Đăng xuất" },
] as const;

type SectionId = (typeof sections)[number]["id"];

// The account page. It is always inside <RequireLogin>, so a user is logged in here.
export default function AccountView({ initialSection = "profile" }: { initialSection?: SectionId }) {
  const { currentUser, logout } = useStore();
  const [active, setActive] = useState<SectionId>(initialSection);

  if (!currentUser) return null;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[260px_1fr]">
      <nav aria-label="Tài khoản" className="min-w-0 rounded-xl border border-line bg-white p-3">
        <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {sections.map((section) => {
            const isActive = section.id === active;
            return (
              <li key={section.id} className="shrink-0">
                <button
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setActive(section.id)}
                  className={`flex min-h-11 w-full items-center whitespace-nowrap rounded-lg px-4 text-left transition-colors duration-200 ${
                    isActive
                      ? "bg-primary-soft font-semibold text-primary"
                      : "font-medium text-ink-muted hover:bg-surface hover:text-ink"
                  }`}
                >
                  {section.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <section className="min-w-0 rounded-xl border border-line bg-white p-6 md:p-8">
        {/* key: the form starts again from the saved values when the user changes */}
        {active === "profile" && <ProfileSection key={currentUser.id} user={currentUser} />}
        {active === "orders" && <OrdersSection userId={currentUser.id} />}
        {active === "password" && <PasswordSection />}
        {active === "logout" && (
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">Đăng xuất</h2>
            <p className="mt-4 text-ink-muted">Bạn có chắc muốn đăng xuất khỏi tài khoản?</p>
            {/* Forgets the logged-in user; RequireLogin then opens /dang-nhap */}
            <button type="button" onClick={logout} className={`${btnBase} ${btnPrimary} mt-6`}>
              Đăng xuất
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
