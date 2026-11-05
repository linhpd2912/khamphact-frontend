import { useEffect, useState } from "react";

import {
  Globe,
  Building2,
  Share2,
  Search,
  FileText,
  Save,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Mail,
  Phone,
  MapPin,
  // Facebook,
  // Instagram,
  // Youtube,
  Music2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
  Palette,
  Link,
  Code2,
  Eye,
} from "lucide-react";

import {
  layCauHinhWebsite,
  capNhatCauHinhWebsite,
  uploadLogo,
  uploadFavicon,
  uploadBanner,
} from "../../services/admin/CauHinhWebsiteService";

import "./CauHinhWebsite.css";
import API from "../../Api";

// ==========================================
// DỮ LIỆU MẶC ĐỊNH
// ==========================================

const FORM_MAC_DINH = {
  tenWebsite: "Địa điểm ăn uống Cần Thơ",
  slogan: "",
  logo: "",
  favicon: "",

  // Banner trang chủ
  bannerTrangChu: "",
  bannerAlt: "",
  bannerTieuDe: "",
  bannerMoTa: "",
  bannerLink: "",
  hienThiBanner: true,

  email: "",
  soDienThoai: "",
  diaChi: "",

  facebook: "",
  zalo: "",
  youtube: "",
  instagram: "",
  tiktok: "",

  maGoogleAnalytics: "",
  maGoogleSearchConsole: "",
  maFacebookPixel: "",

  tieuDeSeoTrangChu: "",
  moTaSeoTrangChu: "",
  tuKhoaSeoTrangChu: "",

  chanTrangWebsite: "",
};

// ==========================================
// COMPONENT TRANG CẤU HÌNH
// ==========================================

export default function CauHinhWebsite() {
  const [form, setForm] = useState(FORM_MAC_DINH);

  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [dangUploadLogo, setDangUploadLogo] = useState(false);
  const [dangUploadFavicon, setDangUploadFavicon] = useState(false);
  const [dangUploadBanner, setDangUploadBanner] = useState(false);



  const [daCoCauHinh, setDaCoCauHinh] = useState(false);

  const [thongBao, setThongBao] = useState({
    loai: "",
    noiDung: "",
  });

  const [tabHienTai, setTabHienTai] = useState("thuong-hieu");

  // ==========================================
  // TẢI CẤU HÌNH
  // ==========================================

  useEffect(() => {
    taiCauHinh();
  }, []);

  async function taiCauHinh() {
    setDangTai(true);

    try {
      const data = await layCauHinhWebsite();

      setForm({
        ...FORM_MAC_DINH,
        ...data,
      });

      setDaCoCauHinh(true);

    } catch (error) {

      if (error.message === "Chưa có cấu hình website") {
        setForm(FORM_MAC_DINH);
        setDaCoCauHinh(false);
      } else {
        hienThongBao("error", error.message);
      }

    } finally {
      setDangTai(false);
    }
  }

  // ==========================================
  // THÔNG BÁO
  // ==========================================

  function hienThongBao(loai, noiDung) {
    setThongBao({
      loai,
      noiDung,
    });

    window.clearTimeout(window.__cauHinhTimeout);

    window.__cauHinhTimeout = window.setTimeout(() => {
      setThongBao({
        loai: "",
        noiDung: "",
      });
    }, 3500);
  }

  // ==========================================
  // THAY ĐỔI DỮ LIỆU FORM
  // ==========================================

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // ==========================================
  // CẬP NHẬT CẤU HÌNH
  // ==========================================

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.tenWebsite.trim()) {
      hienThongBao("error", "Vui lòng nhập tên website");
      return;
    }

    setDangLuu(true);

    try {
      const {
        logo,
        favicon,
        ...duLieuCapNhat
      } = form;

      const data = await capNhatCauHinhWebsite(duLieuCapNhat);

      setForm((prev) => ({
        ...prev,
        ...data,
      }));

      setDaCoCauHinh(true);

      hienThongBao(
        "success",
        "Cập nhật cấu hình website thành công!"
      );

    } catch (error) {
      hienThongBao("error", error.message);

    } finally {
      setDangLuu(false);
    }
  }

  // ==========================================
  // UPLOAD LOGO
  // ==========================================

  async function handleUploadLogo(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const duoiFile = file.name.split(".").pop().toLowerCase();

    if (!["jpg", "jpeg", "png", "webp"].includes(duoiFile)) {
      hienThongBao(
        "error",
        "Logo chỉ hỗ trợ JPG, PNG hoặc WEBP"
      );
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      hienThongBao("error", "Dung lượng logo tối đa 5MB");
      e.target.value = "";
      return;
    }

    setDangUploadLogo(true);

    try {
      const data = await uploadLogo(file);

      setForm((prev) => ({
        ...prev,
        logo: data.logo,
      }));

      setDaCoCauHinh(true);

      hienThongBao("success", "Upload logo thành công!");

    } catch (error) {
      hienThongBao("error", error.message);

    } finally {
      setDangUploadLogo(false);
      e.target.value = "";
    }
  }

  // ==========================================
  // UPLOAD FAVICON
  // ==========================================

  async function handleUploadFavicon(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const duoiFile = file.name.split(".").pop().toLowerCase();

    if (!["ico", "png", "jpg", "jpeg", "webp"].includes(duoiFile)) {
      hienThongBao(
        "error",
        "Favicon chỉ hỗ trợ ICO, PNG, JPG hoặc WEBP"
      );
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      hienThongBao("error", "Dung lượng favicon tối đa 5MB");
      e.target.value = "";
      return;
    }

    setDangUploadFavicon(true);

    try {
      const data = await uploadFavicon(file);

      setForm((prev) => ({
        ...prev,
        favicon: data.favicon,
      }));

      setDaCoCauHinh(true);

      hienThongBao("success", "Upload favicon thành công!");

    } catch (error) {
      hienThongBao("error", error.message);

    } finally {
      setDangUploadFavicon(false);
      e.target.value = "";
    }
  }

  // ==========================================
  // UPLOAD BANNER TRANG CHỦ
  // ==========================================

  async function handleUploadBanner(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const duoiFile = file.name.split(".").pop().toLowerCase();

    if (!["jpg", "jpeg", "png", "webp", "gif"].includes(duoiFile)) {
      hienThongBao(
        "error",
        "Banner chỉ hỗ trợ JPG, PNG, WEBP hoặc GIF"
      );

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      hienThongBao("error", "Dung lượng banner tối đa 5MB");

      e.target.value = "";
      return;
    }

    setDangUploadBanner(true);

    try {
      const data = await uploadBanner(file);

      setForm((prev) => ({
        ...prev,
        bannerTrangChu: data.bannerTrangChu,
      }));

      setDaCoCauHinh(true);

      hienThongBao("success", "Upload banner thành công!");

    } catch (error) {
      hienThongBao("error", error.message);

    } finally {
      setDangUploadBanner(false);
      e.target.value = "";
    }
  }

  // ==========================================
  // TẠO URL HÌNH ẢNH
  // ==========================================

  function getImageUrl(url) {
    if (!url) return "";

    if (url.startsWith("http")) return url;

    return `${API.BACKEND}${url}`;
  }

  // ==========================================
  // TRẠNG THÁI LOADING
  // ==========================================

  if (dangTai) {
    return (
      <div className="cauhinh-loading">
        <LoaderCircle size={35} className="spin" />
        <p>Đang tải cấu hình website...</p>
      </div>
    );
  }

  // ==========================================
  // CÁC TAB
  // ==========================================

  const danhSachTab = [
    {
      id: "thuong-hieu",
      label: "Thương hiệu",
      icon: <Globe size={18} />,
    },
    {
      id: "lien-he",
      label: "Thông tin liên hệ",
      icon: <Building2 size={18} />,
    },
    {
      id: "mang-xa-hoi",
      label: "Mạng xã hội",
      icon: <Share2 size={18} />,
    },
    {
      id: "seo",
      label: "SEO & Marketing",
      icon: <Search size={18} />,
    },
    {
      id: "chan-trang",
      label: "Chân trang",
      icon: <FileText size={18} />,
    },
  ];

  // ==========================================
  // COMPONENT INPUT
  // ==========================================

  function renderInput({
    label,
    name,
    placeholder,
    description,
    icon,
    type = "text",
    maxLength,
  }) {
    return (
      <div className="cauhinh-field">
        <label htmlFor={name}>{label}</label>

        <div className="cauhinh-input-wrap">
          {icon && (
            <span className="cauhinh-input-icon">
              {icon}
            </span>
          )}

          <input
            id={name}
            type={type}
            name={name}
            value={form[name] || ""}
            onChange={handleChange}
            placeholder={placeholder}
            maxLength={maxLength}
          />
        </div>

        {description && (
          <small>{description}</small>
        )}

        {maxLength && (
          <div className="cauhinh-counter">
            {(form[name] || "").length}/{maxLength} ký tự
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="cauhinh-page">

      {/* HEADER */}

      <div className="cauhinh-header">

        <div className="cauhinh-header-left">

          <div className="cauhinh-header-icon">
            <Palette size={25} />
          </div>

          <div>
            <div className="cauhinh-breadcrumb">
              QUẢN TRỊ WEBSITE / CẤU HÌNH
            </div>

            <h1>Cấu hình website</h1>

            <p>
              Quản lý thương hiệu, thông tin liên hệ
              và các thiết lập hiển thị trên website.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="cauhinh-refresh-btn"
          onClick={taiCauHinh}
        >
          <RefreshCw size={16} />
          Làm mới
        </button>

      </div>

      {/* THÔNG BÁO */}

      {thongBao.noiDung && (
        <div className={`cauhinh-toast ${thongBao.loai}`}>
          {thongBao.loai === "success" ? (
            <CheckCircle size={19} />
          ) : (
            <AlertCircle size={19} />
          )}

          {thongBao.noiDung}
        </div>
      )}

      {/* TRẠNG THÁI */}

      <div className="cauhinh-status">

        <div className="cauhinh-status-dot" />

        <span>
          {daCoCauHinh
            ? "Cấu hình đã được khởi tạo"
            : "Website chưa có cấu hình – Hãy thiết lập thông tin ban đầu"}
        </span>

      </div>

      <form onSubmit={handleSubmit}>

        <div className="cauhinh-layout">

          {/* SIDEBAR TAB */}

          <aside className="cauhinh-tabs">

            <div className="cauhinh-tabs-title">
              DANH MỤC CẤU HÌNH
            </div>

            {danhSachTab.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={
                  tabHienTai === tab.id
                    ? "cauhinh-tab active"
                    : "cauhinh-tab"
                }
                onClick={() => setTabHienTai(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}

            <div className="cauhinh-tabs-note">
              <Eye size={18} />

              <div>
                <strong>Lưu ý</strong>
                <p>
                  Những thông tin này sẽ được sử dụng
                  để hiển thị trên website dành cho khách hàng.
                </p>
              </div>
            </div>

          </aside>

          {/* NỘI DUNG */}

          <main className="cauhinh-content">

            {/* ================================= */}
            {/* TAB 1: THƯƠNG HIỆU */}
            {/* ================================= */}

            {tabHienTai === "thuong-hieu" && (

              <>

                <div className="cauhinh-section-heading">
                  <div className="cauhinh-section-icon purple">
                    <Globe size={21} />
                  </div>

                  <div>
                    <h2>Thông tin thương hiệu</h2>
                    <p>
                      Thiết lập tên gọi và hình ảnh nhận diện website.
                    </p>
                  </div>
                </div>

                <div className="cauhinh-card">

                  <div className="cauhinh-grid">

                    {renderInput({
                      label: "Tên website *",
                      name: "tenWebsite",
                      placeholder: "Ví dụ: Địa điểm ăn uống Cần Thơ",
                      description: "Tên thương hiệu xuất hiện trên website.",
                      maxLength: 200,
                    })}

                    {renderInput({
                      label: "Slogan",
                      name: "slogan",
                      placeholder: "Khám phá tinh hoa ẩm thực miền Tây",
                      description: "Một câu ngắn giới thiệu thông điệp thương hiệu.",
                      maxLength: 255,
                    })}

                  </div>

                </div>

                <div className="cauhinh-section-heading">
                  <div className="cauhinh-section-icon orange">
                    <ImageIcon size={21} />
                  </div>

                  <div>
                    <h2>Logo & Favicon</h2>
                    <p>
                      Tải lên hình ảnh đại diện cho website.
                    </p>
                  </div>
                </div>

                <div className="cauhinh-card">

                  <div className="cauhinh-upload-grid">

                    {/* LOGO */}

                    <div className="cauhinh-upload-item">

                      <div className="cauhinh-upload-label">
                        <strong>Logo website</strong>
                        <span>Hình ảnh xuất hiện trên thanh đầu trang.</span>
                      </div>

                      <div className="cauhinh-image-preview logo-preview">

                        {form.logo ? (
                          <img
                            src={getImageUrl(form.logo)}
                            alt="Logo website"
                          />
                        ) : (
                          <div className="cauhinh-image-empty">
                            <ImageIcon size={32} />
                            <span>Chưa có logo</span>
                          </div>
                        )}

                      </div>

                      <label className="cauhinh-upload-btn">

                        {dangUploadLogo ? (
                          <LoaderCircle size={17} className="spin" />
                        ) : (
                          <Upload size={17} />
                        )}

                        {dangUploadLogo ? "Đang tải..." : "Chọn logo"}

                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          hidden
                          disabled={dangUploadLogo}
                          onChange={handleUploadLogo}
                        />

                      </label>

                      <small>JPG, PNG, WEBP – Tối đa 5MB.</small>

                    </div>

                    {/* FAVICON */}

                    <div className="cauhinh-upload-item">

                      <div className="cauhinh-upload-label">
                        <strong>Favicon</strong>
                        <span>Biểu tượng nhỏ trên tab trình duyệt.</span>
                      </div>

                      <div className="cauhinh-image-preview favicon-preview">

                        {form.favicon ? (
                          <img
                            src={getImageUrl(form.favicon)}
                            alt="Favicon website"
                          />
                        ) : (
                          <div className="cauhinh-image-empty">
                            <Globe size={28} />
                            <span>Chưa có favicon</span>
                          </div>
                        )}

                      </div>

                      <label className="cauhinh-upload-btn">

                        {dangUploadFavicon ? (
                          <LoaderCircle size={17} className="spin" />
                        ) : (
                          <Upload size={17} />
                        )}

                        {dangUploadFavicon ? "Đang tải..." : "Chọn favicon"}

                        <input
                          type="file"
                          accept=".ico,.png,.jpg,.jpeg,.webp"
                          hidden
                          disabled={dangUploadFavicon}
                          onChange={handleUploadFavicon}
                        />

                      </label>

                      <small>ICO, PNG, JPG, WEBP – Tối đa 5MB.</small>

                    </div>

                  </div>

                </div>

                {/* ================================= */}
                {/* BANNER TRANG CHỦ */}
                {/* ================================= */}

                <div className="cauhinh-section-heading">
                  <div className="cauhinh-section-icon pink">
                    <ImageIcon size={21} />
                  </div>

                  <div>
                    <h2>Banner trang chủ</h2>
                    <p>
                      Quản lý hình ảnh banner hiển thị ở đầu trang chủ.
                    </p>
                  </div>
                </div>

                <div className="cauhinh-card">

                  {/* HÌNH ẢNH BANNER */}

                  <div className="cauhinh-banner-upload">

                    <div className="cauhinh-upload-label">
                      <strong>Hình ảnh banner</strong>

                      <span>
                        Chọn ảnh ngang có chất lượng tốt để hiển thị
                        ở khu vực đầu trang chủ.
                      </span>
                    </div>

                    <div className="cauhinh-banner-preview">

                      {form.bannerTrangChu ? (
                        <img
                          src={getImageUrl(form.bannerTrangChu)}
                          alt={form.bannerAlt || "Banner trang chủ"}
                        />
                      ) : (
                        <div className="cauhinh-image-empty">
                          <ImageIcon size={38} />
                          <span>Chưa có hình ảnh banner</span>
                        </div>
                      )}

                    </div>

                    <label
                      className={`cauhinh-upload-btn ${dangUploadBanner ? "disabled" : ""
                        }`}
                    >

                      {dangUploadBanner ? (
                        <LoaderCircle size={17} className="spin" />
                      ) : (
                        <Upload size={17} />
                      )}

                      {dangUploadBanner
                        ? "Đang tải banner..."
                        : "Chọn hình ảnh banner"}

                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.gif"
                        hidden
                        disabled={dangUploadBanner}
                        onChange={handleUploadBanner}
                      />

                    </label>

                    <small>
                      JPG, JPEG, PNG, WEBP, GIF – Tối đa 5MB.
                    </small>

                  </div>

                  {/* THÔNG TIN BANNER */}

                  <div className="cauhinh-grid cauhinh-banner-fields">

                    <div className="cauhinh-field full">

                      <label htmlFor="bannerAlt">
                        Alt hình ảnh
                      </label>

                      <input
                        id="bannerAlt"
                        name="bannerAlt"
                        value={form.bannerAlt || ""}
                        onChange={handleChange}
                        placeholder="Ví dụ: Khám phá địa điểm ăn uống Cần Thơ"
                        maxLength={500}
                      />

                      <small>
                        Mô tả nội dung hình ảnh, hỗ trợ SEO và khả năng
                        tiếp cận.
                      </small>

                    </div>

                    <div className="cauhinh-field full">

                      <label htmlFor="bannerTieuDe">
                        Tiêu đề banner
                      </label>

                      <input
                        id="bannerTieuDe"
                        name="bannerTieuDe"
                        value={form.bannerTieuDe || ""}
                        onChange={handleChange}
                        placeholder="Khám phá ẩm thực Cần Thơ"
                        maxLength={255}
                      />

                      <div className="cauhinh-counter">
                        {(form.bannerTieuDe || "").length}/255 ký tự
                      </div>

                    </div>

                    <div className="cauhinh-field full">

                      <label htmlFor="bannerMoTa">
                        Mô tả banner
                      </label>

                      <textarea
                        id="bannerMoTa"
                        name="bannerMoTa"
                        value={form.bannerMoTa || ""}
                        onChange={handleChange}
                        placeholder="Tìm kiếm và khám phá những địa điểm ăn uống hấp dẫn tại Cần Thơ..."
                        rows={3}
                        maxLength={1000}
                      />

                      <div className="cauhinh-counter">
                        {(form.bannerMoTa || "").length}/1000 ký tự
                      </div>

                    </div>

                    <div className="cauhinh-field full">

                      <label htmlFor="bannerLink">
                        Liên kết khi nhấn vào banner
                      </label>

                      <div className="cauhinh-input-wrap">

                        <span className="cauhinh-input-icon">
                          <Link size={17} />
                        </span>

                        <input
                          id="bannerLink"
                          name="bannerLink"
                          value={form.bannerLink || ""}
                          onChange={handleChange}
                          placeholder="/kham-pha"
                          maxLength={2048}
                        />

                      </div>

                      <small>
                        Ví dụ: /kham-pha hoặc đường dẫn đầy đủ đến một trang khác.
                      </small>

                    </div>

                  </div>

                  {/* BẬT TẮT BANNER */}

                  <div className="cauhinh-banner-toggle">

                    <div>
                      <strong>Hiển thị banner trên trang chủ</strong>

                      <p>
                        Bật để khách truy cập nhìn thấy banner.
                        Tắt nếu muốn tạm ẩn banner.
                      </p>
                    </div>

                    <label className="cauhinh-switch">

                      <input
                        type="checkbox"
                        checked={Boolean(form.hienThiBanner)}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            hienThiBanner: e.target.checked,
                          }))
                        }
                      />

                      <span className="cauhinh-switch-slider" />

                    </label>

                  </div>

                </div>

              </>

            )}

            {/* ================================= */}
            {/* TAB 2: LIÊN HỆ */}
            {/* ================================= */}

            {tabHienTai === "lien-he" && (

              <>

                <div className="cauhinh-section-heading">
                  <div className="cauhinh-section-icon blue">
                    <Building2 size={21} />
                  </div>

                  <div>
                    <h2>Thông tin liên hệ</h2>
                    <p>
                      Cung cấp thông tin để khách hàng liên hệ với đơn vị quản lý.
                    </p>
                  </div>
                </div>

                <div className="cauhinh-card">

                  <div className="cauhinh-grid">

                    {renderInput({
                      label: "Email liên hệ",
                      name: "email",
                      placeholder: "lienhe@example.com",
                      description: "Email khách hàng có thể sử dụng để liên hệ.",
                      icon: <Mail size={17} />,
                      type: "email",
                    })}

                    {renderInput({
                      label: "Số điện thoại",
                      name: "soDienThoai",
                      placeholder: "0901234567",
                      description: "Số hotline hoặc số điện thoại quản lý.",
                      icon: <Phone size={17} />,
                    })}

                    <div className="cauhinh-field full">
                      <label htmlFor="diaChi">Địa chỉ</label>

                      <div className="cauhinh-input-wrap">
                        <span className="cauhinh-input-icon">
                          <MapPin size={17} />
                        </span>

                        <input
                          id="diaChi"
                          name="diaChi"
                          value={form.diaChi || ""}
                          onChange={handleChange}
                          placeholder="Nhập địa chỉ đơn vị quản lý website"
                        />
                      </div>

                      <small>
                        Địa chỉ sẽ được sử dụng trong khu vực thông tin liên hệ.
                      </small>
                    </div>

                  </div>

                </div>

              </>

            )}

            {/* ================================= */}
            {/* TAB 3: MẠNG XÃ HỘI */}
            {/* ================================= */}

            {tabHienTai === "mang-xa-hoi" && (

              <>

                <div className="cauhinh-section-heading">
                  <div className="cauhinh-section-icon pink">
                    <Share2 size={21} />
                  </div>

                  <div>
                    <h2>Kết nối mạng xã hội</h2>
                    <p>
                      Nhập đường dẫn các trang mạng xã hội chính thức của bạn.
                    </p>
                  </div>
                </div>

                <div className="cauhinh-card">

                  <div className="cauhinh-social-list">

                    <div className="cauhinh-social-item facebook">
                      <Link size={23} />

                      {renderInput({
                        label: "Facebook",
                        name: "facebook",
                        placeholder: "https://facebook.com/tenfanpage",
                        description: "Đường dẫn Fanpage Facebook.",
                      })}
                    </div>

                    <div className="cauhinh-social-item zalo">
                      <MessageCircleIcon />

                      {renderInput({
                        label: "Zalo",
                        name: "zalo",
                        placeholder: "https://zalo.me/...",
                        description: "Đường dẫn Zalo hoặc trang liên hệ Zalo.",
                      })}
                    </div>

                    <div className="cauhinh-social-item youtube">
                      <Link size={23} />

                      {renderInput({
                        label: "YouTube",
                        name: "youtube",
                        placeholder: "https://youtube.com/@tenkenh",
                        description: "Đường dẫn kênh YouTube.",
                      })}
                    </div>

                    <div className="cauhinh-social-item instagram">
                      <Link size={23} />

                      {renderInput({
                        label: "Instagram",
                        name: "instagram",
                        placeholder: "https://instagram.com/...",
                        description: "Đường dẫn tài khoản Instagram.",
                      })}
                    </div>

                    <div className="cauhinh-social-item tiktok">
                      <Music2 size={23} />

                      {renderInput({
                        label: "TikTok",
                        name: "tiktok",
                        placeholder: "https://tiktok.com/@...",
                        description: "Đường dẫn tài khoản TikTok.",
                      })}
                    </div>

                  </div>

                </div>

                <div className="cauhinh-info-box">
                  <ExternalLink size={18} />

                  <p>
                    Hãy nhập đường dẫn đầy đủ của trang mạng xã hội.
                    Ví dụ: https://facebook.com/tenfanpage.
                    Các liên kết này sẽ được sử dụng để tạo nút truy cập
                    trên website.
                  </p>
                </div>

              </>

            )}

            {/* ================================= */}
            {/* TAB 4: SEO */}
            {/* ================================= */}

            {tabHienTai === "seo" && (

              <>

                <div className="cauhinh-section-heading">
                  <div className="cauhinh-section-icon green">
                    <Search size={21} />
                  </div>

                  <div>
                    <h2>SEO & Marketing</h2>
                    <p>
                      Cấu hình thông tin giúp website hiển thị tốt hơn
                      trên công cụ tìm kiếm.
                    </p>
                  </div>
                </div>

                <div className="cauhinh-card">

                  <div className="cauhinh-subtitle">
                    <Search size={18} />
                    Thông tin SEO trang chủ
                  </div>

                  <div className="cauhinh-grid">

                    <div className="cauhinh-field full">

                      <label>Tiêu đề SEO trang chủ</label>

                      <input
                        name="tieuDeSeoTrangChu"
                        value={form.tieuDeSeoTrangChu || ""}
                        onChange={handleChange}
                        placeholder="Địa điểm ăn uống Cần Thơ | Khám phá ẩm thực miền Tây"
                        maxLength={255}
                      />

                      <div className="cauhinh-counter">
                        {(form.tieuDeSeoTrangChu || "").length}/255 ký tự
                      </div>

                      <small>
                        Tiêu đề có thể xuất hiện trên kết quả tìm kiếm Google.
                      </small>

                    </div>

                    <div className="cauhinh-field full">

                      <label>Mô tả SEO trang chủ</label>

                      <textarea
                        name="moTaSeoTrangChu"
                        value={form.moTaSeoTrangChu || ""}
                        onChange={handleChange}
                        placeholder="Viết mô tả ngắn giới thiệu website..."
                        maxLength={320}
                        rows={4}
                      />

                      <div className="cauhinh-counter">
                        {(form.moTaSeoTrangChu || "").length}/320 ký tự
                      </div>

                      <small>
                        Giới thiệu nội dung website để người dùng hiểu
                        trang của bạn cung cấp thông tin gì.
                      </small>

                    </div>

                    <div className="cauhinh-field full">

                      <label>Từ khóa SEO trang chủ</label>

                      <textarea
                        name="tuKhoaSeoTrangChu"
                        value={form.tuKhoaSeoTrangChu || ""}
                        onChange={handleChange}
                        placeholder="quán ăn Cần Thơ, địa điểm ăn uống Cần Thơ..."
                        rows={3}
                        maxLength={1000}
                      />

                      <small>
                        Nhập các từ khóa, phân cách bằng dấu phẩy.
                      </small>

                    </div>

                  </div>

                </div>

                <div className="cauhinh-card">

                  <div className="cauhinh-subtitle">
                    <Code2 size={18} />
                    Mã tích hợp theo dõi
                  </div>

                  <div className="cauhinh-grid">

                    {renderInput({
                      label: "Google Analytics",
                      name: "maGoogleAnalytics",
                      placeholder: "G-XXXXXXXXXX",
                      description: "Mã đo lường lượt truy cập website.",
                    })}

                    {renderInput({
                      label: "Facebook Pixel",
                      name: "maFacebookPixel",
                      placeholder: "Nhập mã Pixel",
                      description: "Mã theo dõi hoạt động phục vụ quảng cáo Facebook.",
                    })}

                    <div className="cauhinh-field full">

                      <label>Google Search Console</label>

                      <textarea
                        name="maGoogleSearchConsole"
                        value={form.maGoogleSearchConsole || ""}
                        onChange={handleChange}
                        placeholder="Nhập mã xác minh Google Search Console"
                        rows={3}
                        maxLength={500}
                      />

                      <small>
                        Mã xác minh website với Google Search Console.
                      </small>

                    </div>

                  </div>

                </div>

                <div className="cauhinh-info-box">
                  <AlertCircle size={18} />

                  <p>
                    Các mã trên chỉ là thông tin cấu hình.
                    Chúng chưa tự động hoạt động cho đến khi được tích hợp
                    vào phần HTML của website.
                  </p>
                </div>

              </>

            )}

            {/* ================================= */}
            {/* TAB 5: FOOTER */}
            {/* ================================= */}

            {tabHienTai === "chan-trang" && (

              <>

                <div className="cauhinh-section-heading">
                  <div className="cauhinh-section-icon orange">
                    <FileText size={21} />
                  </div>

                  <div>
                    <h2>Nội dung chân trang</h2>
                    <p>
                      Quản lý nội dung giới thiệu hiển thị ở cuối website.
                    </p>
                  </div>
                </div>

                <div className="cauhinh-card">

                  <div className="cauhinh-field full">

                    <label>Nội dung Footer</label>

                    <textarea
                      name="chanTrangWebsite"
                      value={form.chanTrangWebsite || ""}
                      onChange={handleChange}
                      placeholder="Nhập nội dung giới thiệu về website, đơn vị quản lý, thông tin bản quyền..."
                      rows={12}
                    />

                    <small>
                      Bạn có thể nhập nội dung giới thiệu, thông tin
                      bản quyền hoặc các thông tin cần hiển thị ở chân trang.
                    </small>

                  </div>

                </div>

                <div className="cauhinh-info-box">
                  <FileText size={18} />

                  <p>
                    Hiện tại nội dung được lưu dưới dạng văn bản.
                    Chức năng soạn thảo nâng cao và liên kết nội dung
                    với các trang khác có thể bổ sung ở giai đoạn sau.
                  </p>

                </div>

              </>

            )}

          </main>

        </div>

        {/* FOOTER BUTTON */}

        <div className="cauhinh-save-bar">

          <div className="cauhinh-save-note">
            <CheckCircle size={17} />

            <span>
              Nhớ lưu thay đổi trước khi rời khỏi trang.
            </span>
          </div>

          <button
            type="submit"
            className="cauhinh-save-btn"
            disabled={dangLuu || dangUploadLogo || dangUploadFavicon}
          >

            {dangLuu ? (
              <LoaderCircle size={18} className="spin" />
            ) : (
              <Save size={18} />
            )}

            {dangLuu ? "Đang lưu..." : "Lưu cấu hình"}

          </button>

        </div>

      </form>

    </div>
  );
}

// Icon Zalo tạm thời sử dụng biểu tượng liên kết

function MessageCircleIcon() {
  return <Link size={23} />;
}