import {
  LayoutDashboard,
  Store,
  Tags,
  Sparkles,
  MapPinned,
  Map,
  Newspaper,
  Handshake,
  Star,
  Images,
  CircleHelp,
  Settings,
  Utensils,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import "./Sidebar.css"

const groups = [
  // dashboard
  {
    label: "TỔNG QUAN",
    items: [{
      label: "Dashboard",
      to: "/ad/dashboard",
      icon: LayoutDashboard
    }]
  },

  // quan an
  {
    label: "QUẢN LÝ QUÁN ĂN",
    items: [
      {
        label: "Danh sách quán",
        to: "/ad/quan-an",
        icon: Store
      },

      {
        label: "Danh mục quán",
        to: "/ad/danh-muc-quan",
        icon: Tags
      },

      {
        label: "Tiện ích",
        to: "/ad/tien-ich",
        icon: Sparkles
      }
    ]
  },

  // dia chi
  {
    label: "ĐỊA CHỈ",
    items: [
      {
        label: "Tỉnh / thành",
        to: "/ad/tinh-thanh",
        icon: MapPinned
      },
      {
        label: "Phường / xã",
        to: "/ad/phuong-xa",
        icon: Map
      }
    ]
  },

  // noi dung
  {
    label: "NỘI DUNG",
    items: [
      {
        label: "Danh sách bài viết",
        to: "/ad/bai-viet",
        icon: Newspaper
      },
      {
        label: "Danh mục bài viết",
        to: "/ad/danh-muc-bai-viet",
        icon: Tags
      }
    ]
  },

  // tuong tac
  {
    label: "TƯƠNG TÁC & HIỂN THỊ",
    items: [
      {
        label: "Hợp tác",
        to: "/ad/hop-tac",
        icon: Handshake
      },
      {
        label: "Đánh giá",
        to: "/ad/danh-gia",
        icon: Star
      },
      {
        label: "Banner",
        to: "/ad/banner",
        icon: Images
      },
      {
        label: "FAQ",
        to: "/ad/faq",
        icon: CircleHelp
      }
    ]
  },

  // he thong
  {
    label: "HỆ THỐNG",
    items: [{
      label: "Cấu hình website",
      to: "/ad/cau-hinh",
      icon: Settings
    }]
  }
]

export default function Sidebar({ open, onClose }) {
  return (
    <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>

      <div className="sidebar-brand">
        <div className="brand-mark"><Utensils size={21} /></div>

        <div className="brand-copy">
          <strong>CỬU LONG</strong>
          <span>ADMIN PANEL</span>
        </div>

        <button className="sidebar-close" onClick={onClose} aria-label="Đóng menu"><X size={19} /></button>
      </div>

      <div className="sidebar-profile">
        <div className="profile-avatar">AD</div>

        <div>
          <strong>Quản trị viên</strong>
          <span>Quyền truy cập đầy đủ</span>
        </div>

        <span className="online-dot" />
      </div>

      <nav className="sidebar-nav" aria-label="Menu quản trị">
        {groups.map((group) => (
          <section className="nav-group" key={group.label}>
            <p className="nav-group-title">{group.label}</p>

            {group.items.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end
                onClick={onClose}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                <Icon size={18} strokeWidth={1.9} />
                <span>{label}</span>
              </NavLink>
            ))}

          </section>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <span className="status-pulse" />Hệ thống đang hoạt động
      </div>
    </aside>
  );
}