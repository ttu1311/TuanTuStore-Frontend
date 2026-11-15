"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { formatDate } from "@/lib/format";
import { PASSPORT_COUPON, orderUsingCodeBy } from "@/lib/coupons";
import { formatVND } from "@/lib/format";
import { buildPassport, type ProvinceStamp } from "@/lib/passport";
import { regionKeys, regions } from "@/lib/regions";
import type { Region } from "@/types";

const borderClass: Record<Region, string> = { bac: "border-che text-che", trung: "border-brown text-brown", nam: "border-gold text-gold-ink" };
// Mỗi con dấu nghiêng một chút, như được đóng bằng tay
const tilts = ["-rotate-6", "rotate-3", "-rotate-2", "rotate-6", "-rotate-3", "rotate-2"];

// "Hộ chiếu đặc sản" trong trang tài khoản: mỗi tỉnh khách đã nhận hàng được đóng một con dấu,
// trong cuốn hộ chiếu bên dưới. Mọi con số đếm từ đơn hàng thật của khách.
export default function PassportSection({ userId }: { userId: string }) {
  const { products, orders } = useStore();
  const stamps = buildPassport(products, orders, userId);
  const stamped = stamps.filter((stamp) => stamp.state === "stamped");
  const regionsDone = regionKeys.filter((key) => stamped.some((stamp) => stamp.region === key));
  // Phần thưởng: đủ PASSPORT_COUPON.stampsNeeded dấu thì nhận mã giảm giá
  const goal = Math.min(PASSPORT_COUPON.stampsNeeded, stamps.length);
  const usedIn = orderUsingCodeBy(orders, userId, PASSPORT_COUPON.code);
  // Đã đóng dấu lên trước (theo ngày), rồi đang trên đường, rồi chưa đặt
  const order = { stamped: 0, "on-the-way": 1, none: 2 };
  const sorted = [...stamps].sort(
    (a, b) => order[a.state] - order[b.state] || (a.stampedAt ?? "").localeCompare(b.stampedAt ?? "") || a.province.localeCompare(b.province, "vi")
  );

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-ink">Hộ chiếu đặc sản</h2>
      <p className="mt-2 text-ink-muted">
        Mỗi tỉnh bạn đã nhận được đặc sản (đơn hàng hoàn thành) sẽ được đóng một con dấu. Đóng đủ{" "}
        <strong className="font-semibold text-ink">{PASSPORT_COUPON.stampsNeeded} dấu</strong> để nhận{" "}
        <strong className="font-semibold text-ink">mã giảm {PASSPORT_COUPON.percent}%</strong> (tối đa{" "}
        {formatVND(PASSPORT_COUPON.maxDiscount)}) cho một đơn hàng.
      </p>

      {/* Tiến độ: số tỉnh đã đóng dấu, và ba miền */}
      <div className="mt-6 rounded-xl bg-surface p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-ink">
            Đã đóng dấu <span className="font-display text-3xl font-bold text-primary">{stamped.length}</span>
            <span className="text-ink-muted">/{stamps.length} tỉnh</span>
          </p>
          {regionsDone.length === 3 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white">
              <Icon name="award" size={16} />
              Đã đi đủ ba miền
            </span>
          )}
        </div>
        {/* Thanh tiến độ, có vạch mốc nhận mã giảm giá */}
        <div className="relative mt-3">
          <div
            role="progressbar"
            aria-label="Số tỉnh đã đóng dấu"
            aria-valuemin={0}
            aria-valuemax={stamps.length}
            aria-valuenow={stamped.length}
            className="h-2 overflow-hidden rounded-full bg-white"
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${stamps.length ? (stamped.length / stamps.length) * 100 : 0}%` }} />
          </div>
          {stamps.length > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-1 h-4 w-1 -translate-x-1/2 rounded-full bg-gold"
              style={{ left: `${(goal / stamps.length) * 100}%` }}
            />
          )}
        </div>
        <p className="mt-2 text-sm text-ink-muted">
          {stamped.length < goal ? (
            <>
              Còn <span className="font-semibold text-ink">{goal - stamped.length} tỉnh</span> nữa để nhận mã giảm{" "}
              {PASSPORT_COUPON.percent}% (vạch vàng là mốc {goal} tỉnh).
            </>
          ) : (
            `Bạn đã đạt mốc ${goal} tỉnh.`
          )}
        </p>
        {stamped.length >= goal && stamps.length > 0 && <CouponReward usedIn={usedIn?.code} />}
        <ul className="mt-4 flex flex-wrap gap-2">
          {regionKeys.map((key) => {
            const done = regionsDone.includes(key);
            return (
              <li
                key={key}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
                  done ? "border-transparent bg-white font-semibold text-ink" : "border-line text-ink-muted"
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${done ? regions[key].dotClass : "bg-line"}`} aria-hidden="true" />
                {regions[key].label}
                {done ? <Icon name="check" size={14} className="text-che" /> : <span className="sr-only"> (chưa có dấu)</span>}
              </li>
            );
          })}
        </ul>
      </div>

      {stamped.length === 0 && stamps.every((stamp) => stamp.state === "none") && (
        <div className="mt-6 rounded-xl border border-dashed border-line px-6 py-8 text-center">
          <p className="font-semibold text-ink">Hộ chiếu của bạn còn trống</p>
          <p className="mt-1 text-ink-muted">Đặt món đầu tiên, nhận hàng, và con dấu đầu tiên sẽ xuất hiện ở đây.</p>
          <Link href="/hop-qua" className={`${btnBase} ${btnPrimary} mt-4`}>
            Bắt đầu với Hộp quà Ba Miền
          </Link>
        </div>
      )}

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {sorted.map((stamp, index) => (
          <StampCard key={stamp.province} stamp={stamp} tilt={tilts[index % tilts.length]} />
        ))}
      </ul>
    </div>
  );
}

function StampCard({ stamp, tilt }: { stamp: ProvinceStamp; tilt: string }) {
  if (stamp.state === "stamped") {
    return (
      <li className="flex flex-col items-center rounded-xl border border-line bg-white p-3 text-center">
        {/* Con dấu: viền đôi màu của miền, nghiêng nhẹ */}
        <div
          className={`flex h-20 w-20 flex-col items-center justify-center rounded-full border-[3px] border-double ${borderClass[stamp.region]} ${tilt}`}
        >
          <span className="px-1 font-display text-[0.8rem] font-bold uppercase leading-tight">{stamp.province}</span>
          <span className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-wider">Đã nếm</span>
        </div>
        <p className="mt-2 text-xs text-ink-muted">{stamp.stampedAt && formatDate(stamp.stampedAt)}</p>
        <p className="mt-1 text-sm text-ink">{stamp.tasted.join(", ")}</p>
      </li>
    );
  }

  return (
    <li className="flex flex-col items-center rounded-xl border border-dashed border-line p-3 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-line px-1">
        <span className="font-display text-[0.8rem] font-bold uppercase leading-tight text-ink-muted">{stamp.province}</span>
      </div>
      {stamp.state === "on-the-way" ? (
        <p className="mt-2 text-sm font-medium text-gold-ink">Đang trên đường tới bạn</p>
      ) : (
        <Link
          href={`/san-pham?province=${encodeURIComponent(stamp.province)}`}
          className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
        >
          Khám phá đặc sản
        </Link>
      )}
    </li>
  );
}

// Mã giảm giá đã mở khóa: hiện mã và nút chép, hoặc đơn đã dùng mã
function CouponReward({ usedIn }: { usedIn?: string }) {
  const [copied, setCopied] = useState(false);

  if (usedIn) {
    return (
      <p className="mt-4 rounded-lg bg-white px-4 py-3 text-sm text-ink-muted">
        Bạn đã dùng mã <span className="font-semibold text-ink">{PASSPORT_COUPON.code}</span> ở đơn {usedIn}. Cảm ơn bạn đã
        sưu tập đặc sản cùng chúng tôi!
      </p>
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(PASSPORT_COUPON.code);
      setCopied(true);
    } catch {
      // trình duyệt chặn bộ nhớ tạm: khách vẫn đọc và gõ mã được
    }
  }

  return (
    <div className="mt-4 rounded-lg border-2 border-dashed border-gold bg-white p-4">
      <p className="flex items-center gap-2 font-semibold text-ink">
        <Icon name="award" size={18} className="text-gold-ink" />
        Bạn nhận được mã giảm {PASSPORT_COUPON.percent}%!
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="rounded-md bg-surface px-3 py-1.5 font-display text-2xl font-bold tracking-wider text-primary">
          {PASSPORT_COUPON.code}
        </span>
        <button type="button" onClick={copy} className="min-h-11 text-sm font-medium text-primary underline underline-offset-4">
          {copied ? "Đã chép mã" : "Chép mã"}
        </button>
      </div>
      <p className="mt-2 text-sm text-ink-muted">
        Nhập mã ở bước thanh toán. Giảm {PASSPORT_COUPON.percent}% tạm tính, tối đa {formatVND(PASSPORT_COUPON.maxDiscount)}, dùng
        được một lần.
      </p>
    </div>
  );
}
