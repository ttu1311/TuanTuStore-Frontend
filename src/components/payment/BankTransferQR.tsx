"use client";

import { create } from "qrcode";
import { useMemo, useState } from "react";
import { bankAccount } from "@/data/payment";
import { formatVND } from "@/lib/format";
import { vietQrPayload } from "@/lib/vietqr";

const QUIET_ZONE = 4; // lề trắng quanh mã (ô), theo chuẩn QR

// Mã QR chuyển khoản cho MỘT đơn: số tiền và nội dung (mã đơn) có sẵn trong mã.
// TẠM THỜI: sau khi khách chuyển, Admin xác nhận thủ công ("Xác nhận đã nhận tiền" ở /admin/don-hang).
// Khi có backend: webhook PayOS sẽ tự chuyển đơn sang "Đã thanh toán" (xem src/data/payment.ts).
export default function BankTransferQR({ orderCode, amount }: { orderCode: string; amount: number }) {
  const payload = vietQrPayload({ bin: bankAccount.bin, accountNo: bankAccount.accountNo, amount, message: orderCode });

  // Vẽ mã thành một <path> SVG: mỗi ô đen là một hình vuông 1x1
  const qr = useMemo(() => {
    const { modules } = create(payload, { errorCorrectionLevel: "M" });
    let path = "";
    for (let row = 0; row < modules.size; row++) {
      for (let col = 0; col < modules.size; col++) {
        if (modules.get(row, col)) path += `M${col + QUIET_ZONE} ${row + QUIET_ZONE}h1v1h-1z`;
      }
    }
    return { path, size: modules.size + QUIET_ZONE * 2 };
  }, [payload]);

  const rows: { label: string; value: string; copy?: string; strong?: boolean }[] = [
    { label: "Ngân hàng", value: bankAccount.bankName },
    { label: "Số tài khoản", value: bankAccount.accountNo, copy: bankAccount.accountNo },
    { label: "Chủ tài khoản", value: bankAccount.accountName },
    { label: "Số tiền", value: formatVND(amount), copy: String(amount), strong: true },
    { label: "Nội dung", value: orderCode, copy: orderCode, strong: true },
  ];

  return (
    <section aria-label={`Chuyển khoản cho đơn ${orderCode}`} className="rounded-xl border border-line bg-white p-5 text-left">
      <h3 className="font-display text-xl font-semibold text-ink">Quét mã QR để chuyển khoản</h3>
      <p className="mt-1 text-sm text-ink-muted">
        Mở ứng dụng ngân hàng, quét mã: số tiền và nội dung đã được điền sẵn.
      </p>

      {bankAccount.isSample && (
        <p role="note" className="mt-3 rounded-lg bg-sale/10 px-4 py-3 text-sm font-medium text-sale">
          Đây là tài khoản MẪU để thử giao diện. Vui lòng không chuyển tiền thật.
        </p>
      )}

      <div className="mt-4 grid items-center gap-5 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <svg
          viewBox={`0 0 ${qr.size} ${qr.size}`}
          role="img"
          aria-label={`Mã QR chuyển ${formatVND(amount)} tới ${bankAccount.bankName}, nội dung ${orderCode}`}
          shapeRendering="crispEdges"
          className="mx-auto h-48 w-48 rounded-lg border border-line"
        >
          <rect width={qr.size} height={qr.size} fill="#fff" />
          <path d={qr.path} fill="#000" />
        </svg>

        <dl className="min-w-0 space-y-2 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <dt className="w-28 shrink-0 text-ink-muted">{row.label}</dt>
              <dd className={`min-w-0 break-all ${row.strong ? "font-bold text-primary" : "font-medium text-ink"}`}>
                {row.value}
              </dd>
              {row.copy && <CopyButton text={row.copy} label={row.label} />}
            </div>
          ))}
        </dl>
      </div>

      <p className="mt-4 text-sm text-ink-muted">
        Giữ nguyên nội dung <span className="font-semibold text-ink">{orderCode}</span> để cửa hàng đối chiếu đúng đơn của bạn.
      </p>
      <p className="mt-2 rounded-lg bg-gold-soft px-4 py-3 text-sm text-gold-ink">
        Đơn đang ở trạng thái “Chờ thanh toán”. Cửa hàng sẽ xác nhận sau khi nhận được tiền, đơn chuyển sang “Đã thanh toán”.
      </p>
    </section>
  );
}

// Nút "Sao chép" nhỏ cạnh số tài khoản, số tiền và nội dung
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Trình duyệt chặn bộ nhớ tạm: khách vẫn tự chép được chữ đang hiện
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Sao chép ${label.toLowerCase()}`}
      className="inline-flex min-h-8 items-center rounded-md border border-line px-2 text-xs font-medium text-primary transition-colors duration-200 hover:bg-primary-soft"
    >
      {copied ? "Đã chép" : "Sao chép"}
    </button>
  );
}
