import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
} from "react-router-dom";

import {
  Search,
  MapPin,
  Menu,
  X,
  Utensils,
} from "lucide-react";

import { layCauHinhWebsite } from "../../services/client/TrangChuService";

import "./Header.css";
import API from "../../Api";

const API_IMAGE_URL = API.BACKEND;

const xuLyUrlAnh = (url) => {
  if (!url) return "";

  if (url.startsWith("http")) {
    return url;
  }

  return `${API_IMAGE_URL}${url}`;
};

function Header() {
  const [cauHinh, setCauHinh] = useState(null);
  const [menuMo, setMenuMo] = useState(false);

  useEffect(() => {
    const taiCauHinh = async () => {
      try {
        const data = await layCauHinhWebsite();
        setCauHinh(data);
      } catch (error) {
        console.error("Lỗi tải cấu hình Header:", error);
      }
    };

    taiCauHinh();
  }, []);

  const menuItems = [
    {
      label: "Trang chủ",
      path: "/",
    },
    {
      label: "Danh mục",
      path: "/danh-muc",
    },
    {
      label: "Dịch vụ",
      path: "/dich-vu",
    },
    {
      label: "Đăng ký đăng quán",
      path: "/lien-he",
    },
    {
      label: "Tin tức & Sự kiện",
      path: "/tin-tuc",
    },
  ];

  const dongMenu = () => setMenuMo(false);

  return (
    <header className="client-header">
      <div className="client-header-container">

        {/* LOGO */}
        <Link
          to="/"
          className="client-brand"
          onClick={dongMenu}
        >
          <div className="client-brand-logo">
            {cauHinh?.logo ? (
              <img
                src={xuLyUrlAnh(cauHinh.logo)}
                alt={cauHinh?.tenWebsite || "Logo website"}
              />
            ) : (
              <Utensils size={29} />
            )}
          </div>

          <div className="client-brand-info">
            <span className="client-brand-name">
              {cauHinh?.tenWebsite || "Cửu Long"}
            </span>

            <span className="client-brand-slogan">
              ĐỊA ĐIỂM ĂN UỐNG
            </span>
          </div>
        </Link>

        {/* MENU DESKTOP */}
        <nav className="client-navigation">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `client-nav-link ${isActive ? "active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* ACTION */}
        <div className="client-header-actions">

          <button
            className="client-search-button"
            type="button"
            aria-label="Tìm kiếm"
            onClick={() => {
              window.location.href = "/tim-kiem";
            }}
          >
            <Search size={19} />
          </button>

          <Link
            to="/khu-vuc"
            className="client-location-button"
          >
            <MapPin size={16} />
            <span>Cần Thơ</span>
          </Link>

          <Link
            to="/lien-he"
            className="client-header-cta"
          >
            Đăng quán ngay
          </Link>

        </div>

        {/* MOBILE BUTTON */}
        <button
          className="client-mobile-toggle"
          type="button"
          onClick={() => setMenuMo(!menuMo)}
          aria-label="Mở menu"
        >
          {menuMo ? <X size={25} /> : <Menu size={25} />}
        </button>

      </div>

      {/* MOBILE MENU */}
      <div
        className={`client-mobile-menu ${
          menuMo ? "show" : ""
        }`}
      >
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            onClick={dongMenu}
            className={({ isActive }) =>
              `client-mobile-link ${isActive ? "active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}

        <Link
          to="/lien-he"
          className="client-mobile-cta"
          onClick={dongMenu}
        >
          Đăng quán ngay
        </Link>
      </div>
    </header>
  );
}

export default Header;