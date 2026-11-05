import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  MapPin,
  // Facebook,
  // Instagram,
  // Youtube,
  Link as LinkIcon,
  Music2,
  Utensils,
} from "lucide-react";

import { layCauHinhWebsite } from "../../services/client/TrangChuService";

import "./Footer.css";
import API from "../../Api";

const API_IMAGE_URL = API.BACKEND;

const xuLyUrlAnh = (url) => {
  if (!url) return "";

  if (url.startsWith("http")) {
    return url;
  }

  return `${API_IMAGE_URL}${url}`;
};

function Footer() {
  const [cauHinh, setCauHinh] = useState(null);

  useEffect(() => {
    const taiCauHinh = async () => {
      try {
        const data = await layCauHinhWebsite();
        setCauHinh(data);
      } catch (error) {
        console.error("Lỗi tải cấu hình Footer:", error);
      }
    };

    taiCauHinh();
  }, []);

  const namHienTai = new Date().getFullYear();

  const mangXaHoi = [
    {
      ten: "Facebook",
      url: cauHinh?.facebook,
      // Icon: Facebook,
      Icon: LinkIcon,
    },
    {
      ten: "Instagram",
      url: cauHinh?.instagram,
      // Icon: Instagram,
      Icon: LinkIcon,
    },
    {
      ten: "YouTube",
      url: cauHinh?.youtube,
      // Icon: Youtube,
      Icon: LinkIcon,
    },
    {
      ten: "TikTok",
      url: cauHinh?.tiktok,
      Icon: Music2,
    },
  ];

  return (
    <footer className="client-footer">

      <div className="client-footer-container">

        {/* CỘT 1: THƯƠNG HIỆU */}
        <div className="client-footer-brand">

          <Link to="/" className="client-footer-logo">

            <div className="client-footer-logo-icon">
              {cauHinh?.logo ? (
                <img
                  src={xuLyUrlAnh(cauHinh.logo)}
                  alt="Logo"
                />
              ) : (
                <Utensils size={27} />
              )}
            </div>

            <div>
              <h3>
                {cauHinh?.tenWebsite || "Cửu Long"}
              </h3>

              <span>ĐỊA ĐIỂM ĂN UỐNG</span>
            </div>

          </Link>

          <p className="client-footer-slogan">
            {cauHinh?.slogan ||
              "Kết nối ẩm thực – Lan tỏa hương vị Việt."}
          </p>

          <p className="client-footer-description">
            Khám phá những địa điểm ăn uống hấp dẫn,
            trải nghiệm ẩm thực đặc sắc tại Cần Thơ
            và các vùng lân cận.
          </p>

        </div>

        {/* CỘT 2: VỀ CHÚNG TÔI */}
        <div className="client-footer-column">

          <h4>Về chúng tôi</h4>

          <Link to="/gioi-thieu">
            Giới thiệu
          </Link>

          <Link to="/dieu-khoan">
            Điều khoản sử dụng
          </Link>

          <Link to="/chinh-sach-bao-mat">
            Chính sách bảo mật
          </Link>

          <Link to="/lien-he">
            Liên hệ
          </Link>

        </div>

        {/* CỘT 3: HỖ TRỢ */}
        <div className="client-footer-column">

          <h4>Hỗ trợ</h4>

          <Link to="/lien-he">
            Đăng ký đối tác
          </Link>

          <Link to="/lien-he">
            Đăng quán ngay
          </Link>

          <Link to="/huong-dan">
            Hướng dẫn sử dụng
          </Link>

          <Link to="/cau-hoi-thuong-gap">
            Câu hỏi thường gặp
          </Link>

        </div>

        {/* CỘT 4: KẾT NỐI */}
        <div className="client-footer-column client-footer-connect">

          <h4>Kết nối với chúng tôi</h4>

          <div className="client-footer-socials">

            {mangXaHoi.map((item) => {
              if (!item.url) return null;

              const Icon = item.Icon;

              return (
                <a
                  key={item.ten}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.ten}
                  title={item.ten}
                >
                  <Icon size={19} />
                </a>
              );
            })}

          </div>

          {cauHinh?.zalo && (
            <a
              href={cauHinh.zalo}
              target="_blank"
              rel="noopener noreferrer"
              className="client-footer-zalo"
            >
              Kết nối Zalo
            </a>
          )}

          {cauHinh?.diaChi && (
            <div className="client-footer-address">
              <MapPin size={16} />
              <span>{cauHinh.diaChi}</span>
            </div>
          )}

          {cauHinh?.soDienThoai && (
            <p className="client-footer-contact">
              Điện thoại: {cauHinh.soDienThoai}
            </p>
          )}

          {cauHinh?.email && (
            <p className="client-footer-contact">
              Email: {cauHinh.email}
            </p>
          )}

        </div>

      </div>

      {/* BẢN QUYỀN */}
      <div className="client-footer-bottom">
        <div className="client-footer-bottom-container">
          <span>
            © {namHienTai} {cauHinh?.tenWebsite || "Cửu Long"}.
            Tất cả quyền được bảo lưu.
          </span>

          <span>
            Đồng hành cùng ẩm thực Việt Nam
          </span>
        </div>
      </div>

    </footer>
  );
}

export default Footer;