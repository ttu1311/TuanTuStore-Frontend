"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// Tìm kiếm bằng giọng nói: Web Speech API có sẵn của trình duyệt (Chrome, Edge, Safari; Firefox chưa có).
// Lưu ý: Chrome gửi âm thanh tới máy chủ nhận dạng giọng nói của Google để đổi thành chữ (xem README).

// Kiểu tối thiểu: TypeScript (lib "dom") chưa khai báo SpeechRecognition
type SpeechResult = { isFinal: boolean; 0: { transcript: string } };
type SpeechResultEvent = Event & { resultIndex: number; results: { length: number; [index: number]: SpeechResult } };
type SpeechErrorEvent = Event & { error: string };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function recognitionConstructor(): SpeechRecognitionConstructor | undefined {
  const w = window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const noSubscribe = () => () => {};

// Câu báo lỗi cho khách (null = không báo, ví dụ khi chính mình hủy)
function errorMessage(code: string): string | null {
  if (code === "not-allowed" || code === "service-not-allowed") return "Bạn chưa cho phép dùng micro";
  if (code === "no-speech") return "Không nghe rõ, bạn thử nói lại";
  if (code === "network") return "Lỗi mạng, chưa nhận được giọng nói";
  if (code === "audio-capture") return "Không tìm thấy micro";
  if (code === "aborted") return null;
  return "Chưa nhận được giọng nói, bạn thử lại";
}

const ERROR_SHOWN_MS = 4000;

type Handlers = {
  onInterim: (text: string) => void; // chữ đang nghe được (chưa chốt), hiện dần vào ô
  onFinal: (text: string) => void; // nói xong: chữ cuối cùng
};

export function useVoiceSearch(handlers: Handlers) {
  // Trên server và ở lần vẽ đầu: false (không có nút), trình duyệt cập nhật ngay sau đó
  const supported = useSyncExternalStore(noSubscribe, () => Boolean(recognitionConstructor()), () => false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const stoppedByUserRef = useRef(false); // khách tự dừng: không báo "không nghe rõ"
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  // Dừng hẳn, bỏ mọi sự kiện, không điền gì vào ô (khi chuyển trang hoặc component bị gỡ)
  const cancel = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognitionRef.current = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.abort();
    setListening(false);
  }, []);

  // Dừng nghe nhưng vẫn lấy chữ đã nghe được (bấm lại nút, nhấn Esc)
  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    stoppedByUserRef.current = true;
    recognitionRef.current.stop();
  }, []);

  const start = useCallback(() => {
    const Recognition = recognitionConstructor();
    if (!Recognition || recognitionRef.current) return;
    const recognition = new Recognition();
    recognition.lang = "vi-VN";
    recognition.interimResults = true;
    recognition.continuous = false; // im lặng sau khi nói là tự dừng
    recognition.maxAlternatives = 1;

    let finalText = "";
    let latest = "";
    let failed = false;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interim += result[0].transcript;
      }
      latest = (finalText + interim).trim();
      handlersRef.current.onInterim(latest);
    };
    recognition.onerror = (event) => {
      const message = errorMessage(event.error);
      if (message === null) return;
      failed = true;
      setError(message);
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      const text = finalText.trim() || latest;
      if (text) handlersRef.current.onFinal(text);
      else if (!failed && !stoppedByUserRef.current) setError("Không nghe rõ, bạn thử nói lại");
    };

    recognitionRef.current = recognition;
    stoppedByUserRef.current = false;
    setError("");
    setListening(true);
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setError("Chưa bật được micro, bạn thử lại");
    }
  }, []);

  // Esc ở bất cứ đâu khi đang nghe: dừng nghe (và không để Esc làm việc khác như xóa chữ trong ô)
  useEffect(() => {
    if (!listening) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      stop();
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [listening, stop]);

  // Thông báo lỗi tự ẩn
  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(""), ERROR_SHOWN_MS);
    return () => window.clearTimeout(timer);
  }, [error]);

  // Component bị gỡ: dừng nhận giọng nói
  useEffect(() => cancel, [cancel]);

  return { supported, listening, error, start, stop, cancel };
}
