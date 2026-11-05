import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import "./Header.css";

const pageTitles = {
  "/admin/dashboard": [
    "Dashboard",
    "Tổng quan hoạt động website"
  ],
  "/admin/quan-an": [
    "Danh sách quán",
    "Quản lý thông tin địa điểm ăn uống"
  ],
  "/admin/danh-muc-quan": [
    "Danh mục quán",
    "Phân loại địa điểm ăn uống"
  ],
  "/admin/tien-ich": [
    "Tiện ích",
    "Quản lý tiện ích của quán"
  ],
  "/admin/tinh-thanh": [
    "Tỉnh / thành",
    "Quản lý tỉnh và thành phố"
  ],
  "/admin/phuong-xa": [
    "Phường / xã",
    "Quản lý đơn vị hành chính"
  ],
  "/admin/bai-viet": [
    "Danh sách bài viết",
    "Quản lý nội dung và tin tức"
  ],
  "/admin/danh-muc-bai-viet": [
    "Danh mục bài viết",
    "Phân loại nội dung"
  ],
  "/admin/hop-tac": [
    "Hợp tác",
    "Tiếp nhận đăng ký hợp tác"
  ],
  "/admin/danh-gia": [
    "Đánh giá",
    "Theo dõi phản hồi của người dùng"
  ],
  "/admin/banner": [
    "Banner",
    "Quản lý hình ảnh hiển thị"
  ],
  "/admin/faq": [
    "FAQ",
    "Câu hỏi thường gặp"
  ],
  "/admin/cau-hinh": [
    "Cấu hình website",
    "Thiết lập thông tin website"
  ]
};

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation();
  const [title, subtitle] = pageTitles[pathname] || [
  "Trang quản trị",
  "Chào mừng đến với hệ thống quản trị Cửu Long",
];
  return (
    <header className="admin-header">
      <div className="header-page">
        <button className="mobile-menu-button" onClick={onMenuClick} aria-label="Mở menu"><Menu size={21} /></button>
        <div><div className="breadcrumbs">QUẢN TRỊ <span>/</span> <b>{title.toLocaleUpperCase("vi-VN")}</b></div><h1>{title}</h1><p>{subtitle}</p></div>
      </div>
      <div className="header-actions">
        <label className="header-search"><Search size={17} /><input aria-label="Tìm kiếm" placeholder="Tìm nhanh..." /><kbd>⌘ K</kbd></label>
        <button className="icon-button notification-button" aria-label="Thông báo"><Bell size={18} /><i /></button>
        <button className="header-user"><span className="header-avatar">AD</span><span className="header-user-copy"><strong>Admin</strong><small>Quản trị viên</small></span><ChevronDown size={15} /></button>
      </div>
    </header>
  );
}