"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { formatDate } from "@/lib/format";
import { buildPassport, type ProvinceStamp } from "@/lib/passport";
import { regionKeys, regions } from "@/lib/regions";
import { MAP_HEIGHT, MAP_WIDTH, islandGroups, outlinePath, provinceDot, regionBands, toMapX, toMapY } from "@/lib/vietnamMap";
import type { Region } from "@/types";

const fillClass: Record<Region, string> = { bac: "fill-che", trung: "fill-brown", nam: "fill-gold" };
const borderClass: Record<Region, string> = { bac: "border-che text-che", trung: "border-brown text-brown", nam: "border-gold text-gold-ink" };
// Mỗi con dấu nghiêng một chút, như được đóng bằng tay
const tilts = ["-rotate-6", "rotate-3", "-rotate-2", "rotate-6", "-rotate-3", "rotate-2"];

// "Hộ chiếu đặc sản" trong trang tài khoản: mỗi tỉnh khách đã nhận hàng được đóng một con dấu,
// trên bản đồ ba miền và trong cuốn hộ chiếu bên dưới. Mọi con số đếm từ đơn hàng thật của khách.
export default function PassportSection({ userId }: { userId: string }) {
  const { products, orders } = useStore();
  const stamps = buildPassport(products, orders, userId);
  const stamped = stamps.filter((stamp) => stamp.state === "stamped");
  const regionsDone = regionKeys.filter((key) => stamped.some((stamp) => stamp.region === key));
  // Đã đóng dấu lên trước (theo ngày), rồi đang trên đường, rồi chưa đặt
  const order = { stamped: 0, "on-the-way": 1, none: 2 };
  const sorted = [...stamps].sort(
    (a, b) => order[a.state] - order[b.state] || (a.stampedAt ?? "").localeCompare(b.stampedAt ?? "") || a.province.localeCompare(b.province, "vi")
  );

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-ink">Hộ chiếu đặc sản</h2>
      <p className="mt-2 text-ink-muted">
        Mỗi tỉnh bạn đã nhận được đặc sản sẽ được đóng một con dấu. Hãy sưu tập đủ dấu của cả ba miền!
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
        <div
          role="progressbar"
          aria-label="Số tỉnh đã đóng dấu"
          aria-valuemin={0}
          aria-valuemax={stamps.length}
          aria-valuenow={stamped.length}
          className="mt-3 h-2 overflow-hidden rounded-full bg-white"
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${stamps.length ? (stamped.length / stamps.length) * 100 : 0}%` }} />
        </div>
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

      <div className="mt-6 grid items-start gap-6 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
        <PassportMap stamps={stamps} />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sorted.map((stamp, index) => (
            <StampCard key={stamp.province} stamp={stamp} tilt={tilts[index % tilts.length]} />
          ))}
        </ul>
      </div>
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

// Bản đồ nhỏ: tỉnh đã đóng dấu là chấm màu của miền có viền trắng, tỉnh đang chờ là vòng nét đứt, tỉnh chưa đặt là chấm xám
function PassportMap({ stamps }: { stamps: ProvinceStamp[] }) {
  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      role="img"
      aria-label={`Bản đồ hộ chiếu: ${stamps.filter((s) => s.state === "stamped").map((s) => s.province).join(", ") || "chưa có tỉnh nào"} đã được đóng dấu`}
      className="mx-auto h-[300px] w-auto max-w-full md:h-auto md:w-full"
    >
      <defs>
        <clipPath id="passport-map-clip">
          <path d={outlinePath} />
        </clipPath>
      </defs>
      <g clipPath="url(#passport-map-clip)">
        {regionKeys.map((key) => (
          <rect key={key} x={0} y={regionBands[key].top} width={MAP_WIDTH} height={regionBands[key].height} className={fillClass[key]} fillOpacity={0.22} />
        ))}
      </g>
      <path d={outlinePath} fill="none" className="stroke-ink/40" strokeWidth={1} strokeLinejoin="round" />
      {islandGroups.map((group) =>
        group.islands.map(([lon, lat], index) => (
          <circle key={`${group.name}-${index}`} cx={toMapX(lon)} cy={toMapY(lat)} r={1.6} className="fill-brown/40" />
        ))
      )}
      {stamps.map((stamp) => {
        const dot = provinceDot(stamp.province);
        if (!dot) return null;
        if (stamp.state === "stamped") {
          return <circle key={stamp.province} cx={dot.x} cy={dot.y} r={7} className={`${fillClass[stamp.region]} stroke-white`} strokeWidth={2} />;
        }
        if (stamp.state === "on-the-way") {
          return <circle key={stamp.province} cx={dot.x} cy={dot.y} r={6} fill="white" className="stroke-gold-ink" strokeWidth={1.5} strokeDasharray="2 2" />;
        }
        return <circle key={stamp.province} cx={dot.x} cy={dot.y} r={3.5} className="fill-line stroke-ink/30" strokeWidth={0.75} />;
      })}
    </svg>
  );
}
