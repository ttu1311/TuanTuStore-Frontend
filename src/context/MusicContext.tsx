"use client";

// Nhạc nền của cửa hàng: MỘT phần tử <audio> duy nhất, nằm trong MusicProvider ở src/app/layout.tsx.
//
// Vì sao nhạc không bị ngắt khi chuyển trang:
// - Root layout của Next.js (App Router) không bị dựng lại khi khách chuyển trang bằng <Link> / router.push:
//   chỉ phần nội dung trang thay đổi. <audio> nằm trong layout này nên sống suốt phiên duyệt web.
// - Giao diện trình phát (src/components/music/MusicPlayer.tsx) nằm trong SiteShell. SiteShell có thể được dựng lại
//   (trang 404 tự dựng SiteShell riêng), nhưng giao diện chỉ ĐỌC trạng thái từ đây, nên nhạc vẫn chạy.
//
// Tách hai context: thời gian phát đổi vài lần mỗi giây, nên chỉ thanh tiến trình (useMusicTime) render lại theo nó;
// phần còn lại của trình phát (useMusic) chỉ render lại khi đổi bài, phát / dừng, âm lượng…
// Không gộp vào StoreContext: làm vậy cả cửa hàng sẽ render lại vài lần mỗi giây.
//
// Lưu trạng thái (khóa tuantustore-music, qua readJSON / writeJSON): { trackId, currentTime, volume, muted }.
// Không bao giờ tự phát: tải lại trang thì khôi phục bài và vị trí ở trạng thái DỪNG ("Nghe tiếp «tên bài»").
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { playlist, type Track } from "@/data/playlist";
import { STORAGE_KEYS, createId, readJSON, writeJSON } from "@/lib/storage";

const DEFAULT_VOLUME = 0.6;
const SAVE_EVERY_MS = 5000; // khi đang phát, ghi vị trí tối đa 5 giây một lần
const VOLUME_SAVE_DELAY_MS = 400; // kéo thanh âm lượng: chỉ ghi khi đã ngừng kéo
const NOTICE_MS = 5000; // thông báo "không tải được bài" tự ẩn sau 5 giây
const RESTART_AFTER_SECONDS = 3; // nút "Bài trước": đã nghe quá 3 giây thì về đầu bài
const CHANNEL_NAME = "tuantustore-music"; // hai tab: tab nào phát thì tab kia dừng
export const ALL_FAILED_NOTICE = "Chưa phát được nhạc nền";

type SavedMusic = { trackId: string; currentTime: number; volume: number; muted: boolean };

export type MusicControls = {
  isReady: boolean; // false cho tới khi đã đọc trạng thái đã lưu (server và lần render đầu)
  tracks: Track[];
  index: number;
  track: Track;
  playing: boolean;
  volume: number; // 0 – 1
  muted: boolean;
  volumeSupported: boolean; // iOS / iPadOS không cho JavaScript đổi âm lượng: khi đó chỉ có nút tắt tiếng
  resumeFrom: number | null; // sau khi tải lại trang: vị trí đã lưu, chưa phát lại
  notice: string | null; // thông báo lỗi file nhạc
  toggle: () => void;
  next: () => void;
  prev: () => void;
  select: (index: number) => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
};

export type MusicTime = { currentTime: number; duration: number };

const MusicControlsContext = createContext<MusicControls | null>(null);
const MusicTimeContext = createContext<MusicTime>({ currentTime: 0, duration: 0 });

// Đọc trạng thái đã lưu và kiểm tra từng trường. Bài không còn trong danh sách thì về bài đầu (và vị trí 0).
function readSavedMusic() {
  const saved = readJSON<Partial<SavedMusic>>(STORAGE_KEYS.music);
  const data: Partial<SavedMusic> = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  const found = playlist.findIndex((track) => track.id === data.trackId);
  const volume = typeof data.volume === "number" && data.volume >= 0 && data.volume <= 1 ? data.volume : DEFAULT_VOLUME;
  const time = typeof data.currentTime === "number" && Number.isFinite(data.currentTime) && data.currentTime > 0 ? data.currentTime : 0;
  return { index: found >= 0 ? found : 0, currentTime: found >= 0 ? time : 0, volume, muted: data.muted === true };
}

// Trình duyệt có cho đổi âm lượng không? Thử gán rồi đọc lại (iOS bỏ qua phép gán, volume luôn là 1).
function canChangeVolume(audio: HTMLAudioElement) {
  const before = audio.volume;
  audio.volume = 0.5;
  const supported = Math.abs(audio.volume - 0.5) < 0.01;
  audio.volume = before;
  return supported;
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isReady, setIsReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [muted, setMuted] = useState(false);
  const [volumeSupported, setVolumeSupported] = useState(true);
  const [resumeFrom, setResumeFrom] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [time, setTime] = useState<MusicTime>({ currentTime: 0, duration: 0 });

  // Giá trị mới nhất, cho các trình xử lý sự kiện (chúng chỉ được gắn một lần)
  const readyRef = useRef(false);
  const latest = useRef({ index: 0, volume: DEFAULT_VOLUME, muted: false });
  const pendingSeek = useRef<number | null>(null); // vị trí sẽ tua tới khi bài mới tải xong metadata
  const wantPlay = useRef(false); // khách đang muốn nghe: đổi bài xong thì phát tiếp
  const failures = useRef(0); // số bài lỗi liên tiếp; có bài phát được thì về 0
  const loadId = useRef(0); // tăng mỗi lần đổi bài
  const handledLoad = useRef(-1); // lần tải đã xử lý lỗi (sự kiện error và play() bị từ chối không được tính hai lần)
  const lastSave = useRef(0);
  const volumeTouched = useRef(false); // khách đã tự đổi âm lượng / tắt tiếng (chỉ khi đó mới ghi)
  const tabId = useRef("");
  const channel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    latest.current = { index, volume, muted };
  }, [index, volume, muted]);

  // Ghi { trackId, currentTime, volume, muted }. Bài vừa đổi hoặc chưa tải xong: dùng vị trí đang chờ tua.
  const save = useCallback(() => {
    if (!readyRef.current) return; // chưa đọc xong trạng thái cũ thì không ghi đè nó
    const audio = audioRef.current;
    const { index, volume, muted } = latest.current;
    const currentTime = pendingSeek.current ?? audio?.currentTime ?? 0;
    writeJSON(STORAGE_KEYS.music, {
      trackId: playlist[index].id,
      currentTime: Math.round(currentTime * 10) / 10,
      volume,
      muted,
    } satisfies SavedMusic);
    lastSave.current = Date.now();
  }, []);

  // Đổi sang bài khác. play: phát luôn sau khi đổi (đang nghe, hết bài, khách chọn bài)
  const changeTrack = useCallback(
    (nextIndex: number, play: boolean) => {
      const audio = audioRef.current;
      wantPlay.current = play;
      setResumeFrom(null);
      if (nextIndex === latest.current.index) {
        // Cùng một bài (ví dụ danh sách chỉ có một bài): phát lại từ đầu
        if (audio) audio.currentTime = 0;
        if (play) void audio?.play().catch(() => undefined);
        return;
      }
      pendingSeek.current = 0;
      latest.current = { ...latest.current, index: nextIndex };
      setTime({ currentTime: 0, duration: 0 });
      setIndex(nextIndex);
      save();
    },
    [save]
  );

  // Bài hiện tại không tải được. Chỉ xử lý khi khách đang muốn nghe; lỗi lúc chỉ tải metadata (khách chưa bấm phát)
  // thì để đó, tới khi khách bấm phát mới báo và chuyển bài.
  const handleTrackError = useCallback(() => {
    if (!wantPlay.current || handledLoad.current === loadId.current) return;
    handledLoad.current = loadId.current;
    failures.current += 1;
    const current = latest.current.index;
    if (failures.current >= playlist.length) {
      // Lỗi hết cả danh sách: dừng hẳn, không lặp vô hạn
      wantPlay.current = false;
      failures.current = 0;
      setPlaying(false);
      setNotice(ALL_FAILED_NOTICE);
      return;
    }
    setNotice(`Không tải được bài «${playlist[current].title}», chuyển sang bài kế`);
    changeTrack((current + 1) % playlist.length, true);
  }, [changeTrack]);

  // Mọi lần phát đều đi qua đây: không bao giờ để lỗi lọt ra console
  const playAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audio.getAttribute("src")) return;
    wantPlay.current = true;
    try {
      await audio.play();
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      if (name === "AbortError") return; // đổi bài liên tục: lần phát cũ bị hủy, không sao
      if (name === "NotSupportedError") {
        handleTrackError(); // file hỏng hoặc không tải được
        return;
      }
      // NotAllowedError: trình duyệt chặn phát khi khách chưa tương tác với trang
      wantPlay.current = false;
      setPlaying(false);
    }
  }, [handleTrackError]);

  const pauseAudio = useCallback(() => {
    wantPlay.current = false;
    audioRef.current?.pause();
  }, []);

  // ---------- Đọc trạng thái đã lưu (chỉ ở trình duyệt, sau lần render đầu: không lỗi hydration) ----------
  useEffect(() => {
    const audio = audioRef.current;
    function restore() {
      const saved = readSavedMusic();
      latest.current = { index: saved.index, volume: saved.volume, muted: saved.muted };
      pendingSeek.current = saved.currentTime > 0 ? saved.currentTime : null;
      tabId.current = createId("tab");
      setIndex(saved.index);
      setVolumeState(saved.volume);
      setMuted(saved.muted);
      setResumeFrom(saved.currentTime > 0 ? saved.currentTime : null);
      setTime({ currentTime: saved.currentTime, duration: 0 });
      setVolumeSupported(audio ? canChangeVolume(audio) : true);
      readyRef.current = true;
    }
    restore();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsReady(true);
  }, []);

  // Âm lượng và tắt tiếng: áp vào <audio> ngay; khách tự đổi thì ghi vào storage khi đã ngừng kéo
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isReady) return;
    audio.volume = volume;
    audio.muted = muted;
    if (!volumeTouched.current) return;
    const timer = setTimeout(save, VOLUME_SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [volume, muted, isReady, save]);

  // Đổi bài: <audio> đã nhận src mới. Khách đang nghe thì phát tiếp.
  useEffect(() => {
    if (!isReady) return;
    loadId.current += 1;
    if (wantPlay.current) void playAudio();
  }, [index, isReady, playAudio]);

  // Thông báo "không tải được bài" tự ẩn; thông báo lỗi hết danh sách thì giữ lại
  useEffect(() => {
    if (!notice || notice === ALL_FAILED_NOTICE) return;
    const timer = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  // ---------- Sự kiện của <audio>, cửa sổ và tab khác ----------
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setTime({ currentTime: pendingSeek.current ?? audio.currentTime, duration });
    };
    const onPlay = () => {
      setPlaying(true);
      setResumeFrom(null);
      channel.current?.postMessage({ type: "play", tab: tabId.current });
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
    };
    const onPlaying = () => {
      failures.current = 0; // có bài phát được: đếm lỗi lại từ đầu
    };
    const onPause = () => {
      setPlaying(false);
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
      save();
    };
    const onEnded = () => {
      // Hết bài: sang bài kế; hết danh sách thì quay lại bài đầu
      changeTrack((latest.current.index + 1) % playlist.length, true);
    };
    const onLoadedMetadata = () => {
      // Khôi phục vị trí đã lưu. Vị trí vượt quá độ dài bài (file đã đổi) thì về 0.
      const target = pendingSeek.current;
      pendingSeek.current = null;
      if (target !== null) {
        const valid = target >= 0 && target < audio.duration;
        audio.currentTime = valid ? target : 0;
        if (!valid) setResumeFrom(null);
      }
      updateTime();
    };
    const onTimeUpdate = () => {
      updateTime();
      if (!audio.paused && Date.now() - lastSave.current >= SAVE_EVERY_MS) save();
    };
    const onPageHide = () => save();
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") save();
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", handleTrackError);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", updateTime);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("seeked", updateTime);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Hai tab cùng mở web: tab nào bắt đầu phát thì tab kia tự dừng (trình duyệt không hỗ trợ thì bỏ qua)
    const onMessage = (event: MessageEvent<{ type: string; tab: string }>) => {
      if (event.data?.type === "play" && event.data.tab !== tabId.current) pauseAudio();
    };
    if (typeof BroadcastChannel !== "undefined") {
      channel.current = new BroadcastChannel(CHANNEL_NAME);
      channel.current.addEventListener("message", onMessage);
    }

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", handleTrackError);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", updateTime);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("seeked", updateTime);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      channel.current?.removeEventListener("message", onMessage);
      channel.current?.close();
      channel.current = null;
    };
  }, [save, changeTrack, handleTrackError, pauseAudio]);

  // ---------- Điều khiển ----------
  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      failures.current = 0;
      setNotice(null);
      void playAudio();
    } else {
      pauseAudio();
    }
  }, [playAudio, pauseAudio]);

  const next = useCallback(() => {
    const playNow = wantPlay.current || !audioRef.current?.paused;
    changeTrack((latest.current.index + 1) % playlist.length, playNow);
  }, [changeTrack]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > RESTART_AFTER_SECONDS) {
      audio.currentTime = 0;
      return;
    }
    const playNow = wantPlay.current || !audio?.paused;
    changeTrack((latest.current.index - 1 + playlist.length) % playlist.length, playNow);
  }, [changeTrack]);

  const select = useCallback(
    (nextIndex: number) => {
      setNotice(null);
      failures.current = 0;
      if (nextIndex === latest.current.index) {
        if (audioRef.current?.paused) void playAudio();
        return;
      }
      changeTrack(nextIndex, true);
    },
    [changeTrack, playAudio]
  );

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (pendingSeek.current !== null) pendingSeek.current = seconds; // bài chưa tải xong: tua khi tải xong
    else audio.currentTime = seconds;
    setTime((current) => ({ ...current, currentTime: seconds }));
  }, []);

  const setVolume = useCallback((value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    volumeTouched.current = true;
    setVolumeState(clamped);
    if (clamped > 0) setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    volumeTouched.current = true;
    setMuted((current) => !current);
  }, []);

  // Vào trang quản trị: tự tạm dừng (trình phát không hiện ở /admin)
  useEffect(() => {
    if (pathname?.startsWith("/admin")) pauseAudio();
  }, [pathname, pauseAudio]);

  // Media Session: tên bài và nút phát / dừng / chuyển bài trên màn hình khóa, tai nghe
  const track = playlist[index];
  useEffect(() => {
    if (!isReady || !("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: track.artist, album: "Đặc sản 3 Miền" });
  }, [isReady, track]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ["play", () => void playAudio()],
      ["pause", pauseAudio],
      ["nexttrack", next],
      ["previoustrack", prev],
    ];
    for (const [action, handler] of handlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // trình duyệt không hỗ trợ hành động này
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // như trên
        }
      }
    };
  }, [playAudio, pauseAudio, next, prev]);

  const controls = useMemo<MusicControls>(
    () => ({
      isReady,
      tracks: playlist,
      index,
      track,
      playing,
      volume,
      muted,
      volumeSupported,
      resumeFrom,
      notice,
      toggle,
      next,
      prev,
      select,
      seek,
      setVolume,
      toggleMute,
    }),
    [isReady, index, track, playing, volume, muted, volumeSupported, resumeFrom, notice, toggle, next, prev, select, seek, setVolume, toggleMute]
  );

  return (
    <MusicControlsContext.Provider value={controls}>
      <MusicTimeContext.Provider value={time}>
        {children}
        {/* Chỉ tải metadata (độ dài bài), không tải sẵn cả file. Chưa đọc xong trạng thái đã lưu thì chưa gán src. */}
        <audio ref={audioRef} preload="metadata" src={isReady ? track.src : undefined} />
      </MusicTimeContext.Provider>
    </MusicControlsContext.Provider>
  );
}

export function useMusic() {
  const value = useContext(MusicControlsContext);
  if (!value) throw new Error("useMusic phải được dùng bên trong <MusicProvider>");
  return value;
}

// Chỉ thanh tiến trình dùng hook này (nó đổi vài lần mỗi giây)
export function useMusicTime() {
  return useContext(MusicTimeContext);
}
