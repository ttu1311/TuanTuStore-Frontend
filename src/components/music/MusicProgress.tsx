"use client";

import { useMusic, useMusicTime } from "@/context/MusicContext";

// 3:10
export function clock(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

// "1 phút 20 giây" (cho trình đọc màn hình)
function spoken(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return minutes > 0 ? `${minutes} phút ${rest} giây` : `${rest} giây`;
}

// Thanh tiến trình tua được + thời gian (0:42 / 3:10). Là thành phần DUY NHẤT render lại theo thời gian phát.
export default function MusicProgress() {
  const { seek } = useMusic();
  const { currentTime, duration } = useMusicTime();
  const known = duration > 0; // chưa tải xong metadata thì chưa biết độ dài bài
  const value = known ? Math.min(currentTime, duration) : 0;

  return (
    <div>
      <input
        type="range"
        min={0}
        max={known ? duration : 1}
        step={1}
        value={value}
        disabled={!known}
        onChange={(event) => seek(Number(event.target.value))}
        aria-label="Tua bài hát"
        aria-valuetext={known ? `${spoken(value)} trên ${spoken(duration)}` : "Chưa tải xong bài hát"}
        className="block h-11 w-full cursor-pointer accent-primary disabled:cursor-default"
      />
      <p className="-mt-2 flex justify-between text-xs tabular-nums text-ink-muted">
        <span>{clock(known ? value : currentTime)}</span>
        <span>{known ? clock(duration) : "--:--"}</span>
      </p>
    </div>
  );
}
