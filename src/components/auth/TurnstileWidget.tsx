"use client";

import Script from "next/script";
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";

// Khóa trang (site key) THỬ của Cloudflare (công khai trong tài liệu Turnstile): widget luôn cho qua.
// Chỉ dùng khi chạy dev mà chưa điền NEXT_PUBLIC_TURNSTILE_SITE_KEY (xem .env.example).
const TEST_SITE_KEY = "1x00000000000000000000AA";

export const turnstileSiteKey =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || (process.env.NODE_ENV === "production" ? "" : TEST_SITE_KEY);

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileHandle = { reset: () => void };

// Ô "Tôi không phải robot" của Cloudflare Turnstile. Khi khách vượt qua, onToken nhận token;
// token chỉ dùng được MỘT lần và được xác minh ở server (/api/captcha/verify).
// Hết hạn hoặc lỗi thì onToken("") để form biết phải làm lại. ref.reset() lấy token mới sau mỗi lần gửi.
export default function TurnstileWidget({
  action,
  onToken,
  ref,
}: {
  action: string; // tên form, server kiểm tra lại (ví dụ "register")
  onToken: (token: string) => void;
  ref?: Ref<TurnstileHandle>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  function renderWidget() {
    if (!containerRef.current || !window.turnstile || widgetId.current || !turnstileSiteKey) return;
    widgetId.current = window.turnstile.render(containerRef.current, {
      sitekey: turnstileSiteKey,
      action,
      size: "flexible",
      theme: "light",
      language: "auto",
      callback: (token: string) => onTokenRef.current(token),
      "expired-callback": () => onTokenRef.current(""),
      "error-callback": () => onTokenRef.current(""),
    });
  }

  useImperativeHandle(ref, () => ({
    reset() {
      onTokenRef.current("");
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  // Gỡ widget khi rời trang, để quay lại trang thì vẽ lại được
  useEffect(
    () => () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    },
    []
  );

  if (!turnstileSiteKey) {
    return (
      <p role="alert" className="text-sm text-sale">
        Website chưa cấu hình CAPTCHA (NEXT_PUBLIC_TURNSTILE_SITE_KEY), nên tạm thời chưa đăng ký được.
      </p>
    );
  }

  return (
    <div>
      {/* render=explicit: tự vẽ widget bằng renderWidget, chạy cả khi quay lại trang (script đã tải từ trước) */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={renderWidget}
        onError={() => setLoadError(true)}
      />
      <div ref={containerRef} className="min-h-[65px]" />
      {loadError && (
        <p role="alert" className="mt-1.5 text-sm text-sale">
          Không tải được CAPTCHA. Hãy kiểm tra kết nối mạng rồi tải lại trang.
        </p>
      )}
    </div>
  );
}
