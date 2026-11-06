// Hiển thị trong lúc dữ liệu đang được đọc từ localStorage (mất một khoảnh khắc sau khi mở trang).
// Server và lần render đầu tiên ở trình duyệt đều hiển thị nó, nên không có lỗi hydration.
export default function LoadingState({ text = "Đang tải…" }: { text?: string }) {
  return (
    <p role="status" className="py-16 text-ink-muted">
      {text}
    </p>
  );
}
