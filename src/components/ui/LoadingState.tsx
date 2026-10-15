// Shown while the data is being read from localStorage (it takes a split second after the page opens).
// The server and the first browser render both show this, so there is no hydration error.
export default function LoadingState({ text = "Đang tải…" }: { text?: string }) {
  return (
    <p role="status" className="py-16 text-ink-muted">
      {text}
    </p>
  );
}
