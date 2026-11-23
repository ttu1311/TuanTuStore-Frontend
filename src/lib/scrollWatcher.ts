// Theo dõi việc người dùng TỰ CUỘN trang (lăn chuột, chạm, bấm phím cuộn, bấm chuột kể cả kéo thanh cuộn), cho ScrollToHash.
// Đoạn mã nhỏ này được chèn thẳng vào HTML (src/app/layout.tsx) để chạy ngay khi trình duyệt đọc trang, SỚM HƠN React: người
// dùng cuộn lúc trang còn "Đang tải…" thì ScrollToHash về sau biết và không kéo họ về chỗ cũ.
// Cờ nằm ở window vì đoạn mã chạy ngoài React; ScrollToHash đọc và đặt lại bằng các hàm bên dưới.

// Phím làm trang cuộn
const SCROLL_KEYS = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"];
const FLAG = "__ttUserScrolled";

type FlagWindow = Window & { [FLAG]?: boolean };

export const SCROLL_WATCHER_SCRIPT = `(function(){var w=window,keys=${JSON.stringify(SCROLL_KEYS)};function mark(){w.${FLAG}=true}w.addEventListener("wheel",mark,{passive:true});w.addEventListener("touchstart",mark,{passive:true});w.addEventListener("pointerdown",mark);w.addEventListener("keydown",function(e){if(keys.indexOf(e.key)>-1)mark()})})();`;

// Người dùng đã tự cuộn kể từ lần đặt lại gần nhất (hoặc từ lúc mở trang) chưa
export function hasUserScrolled() {
  return (window as FlagWindow)[FLAG] === true;
}

// Bắt đầu tính lại: gọi khi chuyển sang trang khác
export function resetUserScrolled() {
  (window as FlagWindow)[FLAG] = false;
}
