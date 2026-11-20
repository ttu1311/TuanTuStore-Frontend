// Danh sách nhạc nền (trình phát ở góc dưới bên trái mọi trang cửa hàng: src/components/music/MusicPlayer.tsx).
// File nhạc đặt trong public/audio/. Ghi nguồn (tác giả, giấy phép, đường dẫn) của từng bài vào mục "Credits" của README.
//
// - id: CỐ ĐỊNH, không đổi sau khi đã phát hành. Bài đang nghe được lưu theo id (khóa tuantustore-music),
//   nên thêm / bớt / đổi thứ tự bài không làm sai bài khách đã lưu.
// - Thiếu file hoặc sai tên: trình phát báo "Không tải được bài «…»" và tự sang bài kế, không làm hỏng trang.
export type Track = {
  id: string;
  title: string;
  artist: string;
  src: string; // đường dẫn trong public/, ví dụ "/audio/ten-file.mp3"
};

// - Gymnopédie No.1: phạm vi công cộng (Wikimedia Commons).
// - "Nơi này có anh": nhạc có bản quyền của Sơn Tùng M-TP, dùng theo sự cho phép mà chủ dự án đã xin.
// Nguồn và giấy phép của từng bài ghi ở README, mục Credits.
export const playlist: Track[] = [
  { id: "satie-gymnopedie-1", title: "Gymnopédie No.1", artist: "Erik Satie · Robin Alciatore (piano)", src: "/audio/satie-gymnopedie-1.mp3" },
  { id: "noi-nay-co-anh", title: "Nơi này có anh", artist: "Sơn Tùng M-TP", src: "/audio/noi-nay-co-anh.mp3" },
  { id: "thanh-do", title: "Thành Đô", artist: "GUrbane", src: "/audio/thanh-do.mp3" }
];
