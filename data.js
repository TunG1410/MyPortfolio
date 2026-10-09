/* =====================================================================
   ★ SỬA THÔNG TIN CỦA BẠN Ở ĐÂY — DÙNG CHUNG CHO TẤT CẢ CÁC TRANG ★
   Chỉ cần thay chữ trong dấu ngoặc kép "...". Không cần đụng các file khác.
   - Để trống "" nếu không dùng (ví dụ chưa có trailer).
   - Ảnh: đặt vào thư mục "images" rồi ghi đường dẫn, ví dụ "images/game1.jpg".
     Nếu để trống, trang sẽ tự vẽ ảnh minh họa "hoàng hôn neon" theo màu "color" của game.
     Gợi ý màu hợp giao diện: "#FFC65C" vàng, "#FF4F9A" hồng, "#5EF0C8" bạc hà, "#FF7A45" cam, "#A68BFF" tím, "#62B6FF" xanh.
   ===================================================================== */
const PROFILE = {
  name: "Nguyễn Văn A",
  role: "Indie Game Developer",
  tagline: "Mình làm những game nhỏ mà chơi lâu — tự tay lo từ ý tưởng, code, hình ảnh đến âm thanh.",
  avatar: "",            // ví dụ "images/avatar.jpg" — để trống sẽ tự tạo ảnh chân dung
  cvFile: "cv.pdf",      // file CV để người xem tải về — để trống "" nếu không có
  level: 3,              // số năm kinh nghiệm
  className: "Lập trình viên gameplay",
  status: "Sẵn sàng nhận dự án",   // trạng thái hiện trên thẻ hồ sơ

  about: "Mình bắt đầu làm game từ những bản mod nhỏ thời sinh viên, sau đó tham gia game jam và làm việc tại một studio mobile. Hiện mình phát triển game indie toàn thời gian, thích nhất là thiết kế cơ chế chơi gọn gàng và cảm giác điều khiển mượt.",

  // level từ 1 đến 10 — nên giữ 5 đến 8 kỹ năng để biểu đồ đẹp
  skills: [
    { name: "Unity / C#",     level: 8 },
    { name: "Godot",          level: 7 },
    { name: "Game design",    level: 8 },
    { name: "Pixel art & 2D", level: 6 },
    { name: "Âm thanh",       level: 5 },
    { name: "Làm việc nhóm",  level: 7 }
  ],
  // Công cụ, xếp từ dùng nhiều nhất
  tools: ["Unity", "Godot", "Aseprite", "Blender", "FMOD", "Git", "Trello", "Photoshop"],

  // status: "released" = Đã phát hành, "dev" = Đang phát triển
  // featured: true = game nổi bật trên trang chủ (chỉ chọn 1 game)
  // trailer: dán link YouTube để hiện video ngay trên trang chi tiết game
  // features: các điểm nổi bật của game (không bắt buộc)
  // screenshots: ảnh chụp màn hình, ví dụ ["images/g1-1.jpg", "images/g1-2.jpg"] (không bắt buộc)
  games: [
    {
      title: "Đèn Lồng Cuối Cùng",
      featured: true,
      status: "released",
      year: 2025,
      engine: "Unity",
      platform: "PC, Web",
      genres: ["Platformer", "Giải đố"],
      desc: "Một chú đom đóm nhỏ dẫn đường qua khu rừng tắt đèn. Mỗi màn chơi là một câu đố về ánh sáng và bóng tối, kèm nhạc nền tự sáng tác.",
      features: ["24 màn chơi giải đố ánh sáng", "Nhạc nền tự sáng tác", "Hỗ trợ tay cầm"],
      highlight: "Top 10 tại một game jam 48 giờ",
      itch: "https://itch.io",
      trailer: "",
      image: "",
      screenshots: [],
      color: "#FFC65C"
    },
    {
      title: "Neon Drift",
      status: "released",
      year: 2024,
      engine: "Godot",
      platform: "Web",
      genres: ["Đua xe", "Arcade"],
      desc: "Game đua xe một nút bấm: drift qua thành phố neon, ăn combo để tăng tốc. Chơi được ngay trên trình duyệt.",
      features: ["Điều khiển một nút", "Bảng xếp hạng online", "10 đường đua"],
      highlight: "",
      itch: "https://itch.io",
      trailer: "",
      image: "",
      screenshots: [],
      color: "#FF4F9A"
    },
    {
      title: "Quán Trọ Ma",
      status: "dev",
      year: 2026,
      engine: "Godot",
      platform: "PC",
      genres: ["Quản lý", "Cozy"],
      desc: "Mở quán trọ cho những hồn ma lạc đường. Nấu món ăn, nghe chuyện của họ và giúp họ siêu thoát.",
      features: ["Hơn 30 hồn ma với câu chuyện riêng", "Hệ thống nấu ăn", "Nâng cấp quán trọ"],
      highlight: "",
      itch: "",
      trailer: "",
      image: "",
      screenshots: [],
      color: "#5EF0C8"
    },
    {
      title: "Bão Cát",
      status: "released",
      year: 2023,
      engine: "Unity",
      platform: "PC",
      genres: ["Sinh tồn", "Hành động"],
      desc: "Sống sót qua những cơn bão cát trên sa mạc hoang. Game làm trong 72 giờ cho một game jam.",
      features: ["Làm trong 72 giờ", "Thế giới tạo ngẫu nhiên"],
      highlight: "",
      itch: "https://itch.io",
      trailer: "",
      image: "",
      screenshots: [],
      color: "#FF7A45"
    }
  ],

  // Kinh nghiệm & học vấn, mới nhất ở trên. done: false = đang làm
  quests: [
    { time: "2025 – nay",  title: "Nhà phát triển game indie",   place: "Tự do",                   desc: "Thiết kế, lập trình và phát hành game trên itch.io và Steam.", done: false },
    { time: "2022 – 2024", title: "Lập trình viên Unity",        place: "Công ty ABC Games",       desc: "Làm gameplay và UI cho 2 game mobile, hơn 500.000 lượt tải.", done: true },
    { time: "2023",        title: "Global Game Jam",             place: "Thành viên nhóm 4 người", desc: "Phụ trách lập trình và level design trong 48 giờ.", done: true },
    { time: "2018 – 2022", title: "Cử nhân Công nghệ thông tin", place: "Trường Đại học XYZ",      desc: "Đồ án tốt nghiệp: game giải đố 2D trên Unity.", done: true }
  ],

  contacts: [
    { label: "Email",    value: "email.cua.ban@gmail.com", url: "mailto:email.cua.ban@gmail.com" },
    { label: "itch.io",  value: "tenban.itch.io",          url: "https://itch.io" },
    { label: "GitHub",   value: "github.com/tenban",       url: "https://github.com" },
    { label: "LinkedIn", value: "linkedin.com/in/tenban",  url: "https://linkedin.com" }
  ]
};
