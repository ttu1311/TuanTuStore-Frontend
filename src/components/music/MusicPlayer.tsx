"use client";

import { useEffect, useId, useRef, useState } from "react";
import MusicProgress, { clock } from "@/components/music/MusicProgress";
import Icon from "@/components/ui/Icon";
import { ALL_FAILED_NOTICE, useMusic } from "@/context/MusicContext";

// Trình phát nhạc nền: nút tròn ở góc dưới bên TRÁI (góc phải là nút "Lên đầu trang"), bấm thì bung thẻ điều khiển LÊN TRÊN.
// Chỉ là giao diện: nhạc chạy trong MusicProvider (src/context/MusicContext.tsx), nên đóng thẻ hay chuyển trang nhạc vẫn chạy.
// Hiện trên mọi trang cửa hàng (render một lần trong SiteShell), không hiện ở /admin.
export default function MusicPlayer() {
  const music = useMusic();
  const { track, tracks, index, playing, muted, volume, notice, resumeFrom } = music;
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const cardId = useId();

  // Mở thẻ: đưa con trỏ bàn phím vào nút phát. Đóng bằng phím Escape (trả con trỏ về nút tròn) hoặc bấm ra ngoài.
  useEffect(() => {
    if (!open) return;
    playRef.current?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
    toggleRef.current?.focus();
  }

  // Chú thích khi rê chuột lên nút tròn (chỉ trên thiết bị có chuột)
  const hint =
    notice ?? (resumeFrom !== null ? `Nghe tiếp «${track.title}»` : playing ? `Đang phát: ${track.title}` : "Bật nhạc thư giãn");

  return (
    <div ref={wrapperRef} className="fixed bottom-4 left-4 z-40 sm:bottom-6 sm:left-6">
      {open && (
        <div
          id={cardId}
          role="dialog"
          aria-label="Trình phát nhạc nền"
          className="absolute bottom-full left-0 mb-3 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-white/95 p-4 shadow-card backdrop-blur-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="pt-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">Nhạc nền</p>
            <button
              type="button"
              onClick={close}
              aria-label="Đóng trình phát nhạc"
              className="-mr-2 -mt-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-muted transition-colors duration-200 hover:bg-surface hover:text-ink"
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          {/* Tên bài và nghệ sĩ (dài thì cắt bớt, rê chuột xem đủ) */}
          <p className="-mt-1 truncate font-semibold text-ink" title={track.title}>
            {track.title}
          </p>
          <p className="truncate text-sm text-ink-muted" title={track.artist}>
            {track.artist}
          </p>
          {resumeFrom !== null && <p className="mt-1 text-xs text-ink-muted">Nghe tiếp từ {clock(resumeFrom)}</p>}

          {/* Lỗi file nhạc: đọc cho người dùng trình đọc màn hình */}
          <p role="status" aria-live="polite" className="text-sm text-sale empty:hidden">
            {notice}
          </p>

          <MusicProgress />

          <div className="flex items-center justify-center gap-3">
            <button type="button" onClick={music.prev} aria-label="Bài trước" className={iconButton}>
              <Icon name="skip-back" size={20} />
            </button>
            <button
              ref={playRef}
              type="button"
              onClick={music.toggle}
              aria-label={playing ? "Tạm dừng" : resumeFrom !== null ? `Nghe tiếp ${track.title}` : `Phát ${track.title}`}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-card transition-colors duration-200 hover:bg-primary-dark"
            >
              <Icon name={playing ? "pause" : "play"} size={20} />
            </button>
            <button type="button" onClick={music.next} aria-label="Bài sau" className={iconButton}>
              <Icon name="skip-forward" size={20} />
            </button>
          </div>

          {/* Âm lượng. iOS / iPadOS không cho đổi âm lượng bằng JavaScript: chỉ còn nút tắt tiếng */}
          <div className="mt-1 flex items-center gap-1">
            <button
              type="button"
              onClick={music.toggleMute}
              aria-label={muted ? "Bật tiếng" : "Tắt tiếng"}
              aria-pressed={muted}
              className={iconButton}
            >
              <Icon name={muted || volume === 0 ? "volume-x" : "volume"} size={20} />
            </button>
            {music.volumeSupported && (
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(event) => music.setVolume(Number(event.target.value))}
                aria-label="Âm lượng"
                aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)}%`}
                className="block h-11 min-w-0 flex-1 cursor-pointer accent-primary"
              />
            )}
          </div>

          {/* Danh sách bài: bài đang chọn tô màu chủ đạo */}
          <ul aria-label="Danh sách bài" className="mt-2 border-t border-line pt-2">
            {tracks.map((item, itemIndex) => {
              const current = itemIndex === index;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => music.select(itemIndex)}
                    aria-current={current ? "true" : undefined}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm transition-colors duration-200 hover:bg-surface ${
                      current ? "font-semibold text-primary" : "text-ink"
                    }`}
                  >
                    <span className="flex w-5 shrink-0 justify-center tabular-nums text-xs text-ink-muted" aria-hidden="true">
                      {current && playing ? <Bars small /> : itemIndex + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate" title={item.title}>
                        {item.title}
                      </span>
                      <span className="block truncate text-xs font-normal text-ink-muted">{item.artist}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Nút tròn (cùng cỡ nút "Lên đầu trang"): nốt nhạc khi dừng, ba vạch sóng âm nhún khi đang phát */}
      <div className="group relative">
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Đóng trình phát nhạc" : "Mở trình phát nhạc"}
          aria-expanded={open}
          aria-controls={open ? cardId : undefined}
          className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-primary shadow-card transition-colors duration-200 hover:bg-primary-soft"
        >
          {playing ? <Bars /> : <Icon name="music" size={20} />}
          {notice === ALL_FAILED_NOTICE && (
            <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-sale ring-2 ring-white" aria-hidden="true" />
          )}
        </button>
        {!open && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-card transition-opacity duration-200 group-hover:opacity-100"
          >
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}

// Ba vạch sóng âm nhún nhẹ (CSS, không phân tích âm thanh). Người bật "giảm chuyển động": vạch đứng yên.
function Bars({ small = false }: { small?: boolean }) {
  return (
    <span className={`flex items-end gap-[3px] ${small ? "h-3" : "h-5"}`} aria-hidden="true">
      {["h-[60%] [animation-delay:-0.3s]", "h-full [animation-delay:-0.6s]", "h-[75%] [animation-delay:0s]"].map((bar) => (
        <span key={bar} className={`w-[3px] origin-bottom rounded-full bg-current motion-safe:animate-equalizer ${bar}`} />
      ))}
    </span>
  );
}

const iconButton =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-surface hover:text-primary";
