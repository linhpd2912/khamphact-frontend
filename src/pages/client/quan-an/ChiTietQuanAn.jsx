import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, MapPin, Phone, Link as LinkIcon, Star, Clock, Globe,
  Utensils, Wallet, Images, Info, ExternalLink, MapPinned, ChevronRight,
  CarFront, CreditCard, Snowflake, Armchair, Wifi, ParkingCircle,
  Banknote, Wind, Coffee, Accessibility, Bike, Baby, Cigarette,
  Music, Tv, AirVent, ShieldCheck, Camera, Dog, X, ChevronLeft,
} from "lucide-react";
import Header from "../../../components/client/Header";
import Footer from "../../../components/client/Footer";
import quanAnService from "../../../services/admin/QuanAnService";
import gioMoCuaService from "../../../services/admin/GioMoCuaService";
import HinhAnhQuanService from "../../../services/admin/HinhAnhQuanService";
import quanAnDanhMucService from "../../../services/admin/QuanAnDanhMucService";
import { layTienIchCuaQuan } from "../../../services/admin/QuanAnTienIchService";
import danhMucService from "../../../services/client/DanhMucService";
import API from "../../../Api";
import "./ChiTietQuanAn.css";

const ngayTrongTuan = {
  1: "Thứ 2", 2: "Thứ 3", 3: "Thứ 4", 4: "Thứ 5",
  5: "Thứ 6", 6: "Thứ 7", 7: "Chủ nhật",
};

// Ánh xạ tên icon từ backend sang icon Lucide
const iconTienIch = {
  CarFront,
  CreditCard,
  Snowflake,
  Armchair,
  Wifi,
  ParkingCircle,
  Banknote,
  Wind,
  Coffee,
  Accessibility,
  Bike,
  Baby,
  Cigarette,
  Music,
  Tv,
  AirVent,
  ShieldCheck,
  Camera,
  Dog,

  // Hỗ trợ một số tên viết thường
  car: CarFront,
  creditcard: CreditCard,
  snowflake: Snowflake,
  armchair: Armchair,
  wifi: Wifi,
};

// Lấy component icon tương ứng
const layIconTienIch = (tenIcon) => {
  if (!tenIcon) return null;

  const ten = String(tenIcon).trim();

  return iconTienIch[ten] ||
    iconTienIch[ten.toLowerCase()] ||
    null;
};

const layDanhSach = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

const urlAnh = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API.BACKEND}${url.startsWith("/") ? "" : "/"}${url}`;
};

const dinhDangTien = (gia) =>
  gia === null || gia === undefined || gia === ""
    ? null
    : `${Number(gia).toLocaleString("vi-VN")}đ`;

const hienThiGia = (quan) => {
  const tu = dinhDangTien(quan?.giaTu);
  const den = dinhDangTien(quan?.giaDen);
  if (tu && den) return `${tu} – ${den}`;
  if (tu) return `Từ ${tu}`;
  if (den) return `Đến ${den}`;
  return "Đang cập nhật";
};

const gio = (value) => value ? String(value).slice(0, 5) : "";

function ChiTietQuanAn() {
  const { slug } = useParams();
  const [quan, setQuan] = useState(null);
  const [gioMoCua, setGioMoCua] = useState([]);
  const [hinhAnh, setHinhAnh] = useState([]);
  const [danhMuc, setDanhMuc] = useState([]);
  const [tienIch, setTienIch] = useState([]);
  const [anhDangChon, setAnhDangChon] = useState(0);
  const [moAnhLon, setMoAnhLon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let huy = false;
    const taiDuLieu = async () => {
      setLoading(true);
      setError("");
      setQuan(null);
      try {
        const dataQuan = await quanAnService.getBySlug(slug);
        if (huy) return;
        setQuan(dataQuan);

        const [gioData, anhData, danhMucData, tienIchData] = await Promise.allSettled([
          gioMoCuaService.layTheoQuanAn(dataQuan.id),
          HinhAnhQuanService.getByQuanAn(dataQuan.id),
          quanAnDanhMucService.layTheoQuanAn(dataQuan.id),
          layTienIchCuaQuan(dataQuan.id),
        ]);
        if (huy) return;

        if (gioData.status === "fulfilled") setGioMoCua(layDanhSach(gioData.value));
        if (anhData.status === "fulfilled") {
          const dsAnh = layDanhSach(anhData.value).filter((a) => a?.urlAnh);
          dsAnh.sort((a, b) =>
            Number(b.anhDaiDien) - Number(a.anhDaiDien) || (a.thuTu ?? 999) - (b.thuTu ?? 999));
          setHinhAnh(dsAnh);
        }
        if (danhMucData.status === "fulfilled") {
          const links = layDanhSach(danhMucData.value);
          const dsDanhMuc = await Promise.allSettled(
            links.map((item) => danhMucService.getById(item.danhMucId))
          );
          if (!huy) setDanhMuc(dsDanhMuc.filter((x) => x.status === "fulfilled").map((x) => x.value));
        }
        if (tienIchData.status === "fulfilled") setTienIch(layDanhSach(tienIchData.value).filter((x) => x?.hoatDong !== false));
      } catch (e) {
        if (!huy) setError(e.message || "Không thể tải thông tin quán ăn.");
      } finally {
        if (!huy) setLoading(false);
      }
    };
    if (slug) taiDuLieu();
    return () => { huy = true; };
  }, [slug]);

  const anhChinh = useMemo(() => hinhAnh[anhDangChon] || hinhAnh[0], [hinhAnh, anhDangChon]);
  // Chuyển đến ảnh tiếp theo
  const chuyenAnhTiep = (e) => {
    e.stopPropagation();

    setAnhDangChon((current) =>
      (current + 1) % hinhAnh.length
    );
  };

  // Quay lại ảnh trước
  const chuyenAnhTruoc = (e) => {
    e.stopPropagation();

    setAnhDangChon((current) =>
      (current - 1 + hinhAnh.length) % hinhAnh.length
    );
  };
  const diaChi = [quan?.diaChi, quan?.tenPhuongXa, quan?.tenTinhThanh].filter(Boolean).join(", ");
  const linkBanDo = quan?.urlGoogleMap ||
    (quan?.viDo && quan?.kinhDo ? `https://www.google.com/maps?q=${quan.viDo},${quan.kinhDo}` : "");

  if (loading) return
  <div className="chi-tiet-quan-page">
    <Header />
    <main className="ctq-container ctq-state">Đang tải thông tin quán ăn...</main>
    <Footer />
  </div>;
  if (error || !quan) return
  <div className="chi-tiet-quan-page">
    <Header />
    <main className="ctq-container ctq-state">
      <Info size={28} />
      <h2>Không tìm thấy quán ăn</h2>
      <p>{error || "Địa điểm này không tồn tại hoặc đã được gỡ khỏi hệ thống."}</p>
      <Link className="ctq-back" to="/danh-muc">
        <ArrowLeft size={17} /> Quay lại khám phá
      </Link>
    </main>
    <Footer />
  </div>;

  return (
    <div className="chi-tiet-quan-page">
      <Header />
      <main className="ctq-main">
        <div className="ctq-container">
          <div className="ctq-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <ChevronRight size={14} />
            <Link to="/danh-muc">Khám phá quán</Link>
            <ChevronRight size={14} />
            <span>{quan.tenQuan}</span>
          </div>

          <section className="ctq-heading">
            <div>
              <span className="ctq-eyebrow"><Utensils size={15} /> KHÁM PHÁ ẨM THỰC</span>
              <h1>{quan.tenQuan}</h1>
              <p className="ctq-address">
                <MapPin size={17} />{diaChi || "Chưa cập nhật địa chỉ"}
              </p>
              <div className="ctq-tags">
                {danhMuc.map((dm) => <span key={dm.id}>{dm.tenDanhMuc}</span>)}
                <span className="ctq-price">
                  <Wallet size={14} />{hienThiGia(quan)}
                </span>
              </div>
            </div>
            <div className="ctq-rating">
              <div className="ctq-rating-stars">
                <Star size={20} fill="currentColor" />
                <strong>{quan.diemDanhGiaGoogle ?? "—"}</strong>
                <small>/ 5</small>
              </div>
              <span>{quan.tongDanhGiaGoogle ?? 0} lượt đánh giá Google</span>
            </div>
          </section>

          <section className="ctq-gallery" aria-label="Hình ảnh quán ăn">
            <div className="ctq-gallery-main">
              {anhChinh ? (
                <button
                  type="button"
                  className="ctq-main-image-button"
                  onClick={() => setMoAnhLon(true)}
                  aria-label="Xem ảnh kích thước lớn"
                >
                  <img
                    src={urlAnh(anhChinh.urlAnh)}
                    alt={anhChinh.chuThich || quan.tenQuan}
                  />
                  <span className="ctq-zoom-hint">
                    Nhấn để xem ảnh lớn
                  </span>
                </button>
              ) : (
                <div className="ctq-no-image">
                  <Images size={48} />
                  <span>Quán chưa cập nhật hình ảnh</span>
                </div>
              )}

              {anhChinh?.chuThich && (
                <span className="ctq-image-caption">
                  {anhChinh.chuThich}
                </span>
              )}
            </div>
            {hinhAnh.length > 1 && <div className="ctq-thumbnails">
              {hinhAnh.map((anh, index) =>
                <button
                  key={anh.id}
                  type="button"
                  className={index === anhDangChon ? "active" : ""}
                  onClick={() => setAnhDangChon(index)}
                  aria-label={`Xem hình ${index + 1}`}>
                  <img src={urlAnh(anh.urlAnh)} alt={anh.chuThich || `Hình ${index + 1}`} />
                </button>)}
            </div>}
          </section>

          {moAnhLon && anhChinh && (
            <div
              className="ctq-lightbox"
              onClick={() => setMoAnhLon(false)}
            >
              {/* Nút đóng */}
              <button
                type="button"
                className="ctq-lightbox-close"
                onClick={() => setMoAnhLon(false)}
                aria-label="Đóng ảnh"
              >
                <X size={26} />
              </button>

              {/* Nút ảnh trước */}
              {hinhAnh.length > 1 && (
                <button
                  type="button"
                  className="ctq-lightbox-prev"
                  onClick={chuyenAnhTruoc}
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft size={32} />
                </button>
              )}

              {/* Ảnh đang xem */}
              <img
                key={anhChinh.id || anhDangChon}
                src={urlAnh(anhChinh.urlAnh)}
                alt={anhChinh.chuThich || quan.tenQuan}
                className="ctq-lightbox-image"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Nút ảnh tiếp theo */}
              {hinhAnh.length > 1 && (
                <button
                  type="button"
                  className="ctq-lightbox-next"
                  onClick={chuyenAnhTiep}
                  aria-label="Ảnh tiếp theo"
                >
                  <ChevronRight size={32} />
                </button>
              )}

              {/* Số thứ tự ảnh */}
              {hinhAnh.length > 1 && (
                <div className="ctq-lightbox-counter">
                  {anhDangChon + 1} / {hinhAnh.length}
                </div>
              )}

              {/* Chú thích */}
              {anhChinh.chuThich && (
                <div className="ctq-lightbox-caption">
                  {anhChinh.chuThich}
                </div>
              )}
            </div>
          )}

          <div className="ctq-layout">
            <div className="ctq-content">
              <section className="ctq-card ctq-intro">
                <div className="ctq-section-title">
                  <span><Info size={18} /></span>
                  <div>
                    <h2>Giới thiệu về quán</h2>
                    <p>Đôi nét về địa điểm này</p>
                  </div>
                </div>
                <p className="ctq-description">{quan.moTaChiTiet || quan.moTaNgan || "Thông tin giới thiệu của quán đang được cập nhật."}</p>
              </section>

              <section className="ctq-card">
                <div className="ctq-section-title">
                  <span><Clock size={18} /></span>
                  <div>
                    <h2>Giờ mở cửa</h2>
                    <p>Thời gian phục vụ trong tuần</p>
                  </div>
                </div>
                {gioMoCua.length ?
                  <div className="ctq-hours">{[...gioMoCua].sort((a, b) => a.thu - b.thu).map((item) =>
                    <div className="ctq-hour-row" key={item.id || item.thu}>
                      <strong>{ngayTrongTuan[item.thu] || `Ngày ${item.thu}`}</strong>
                      <span className={item.nghi ? "closed" : ""}>{item.nghi ? "Đóng cửa" : `${gio(item.gioMo) || "--:--"} – ${gio(item.gioDong) || "--:--"}`}</span>
                      {item.ghiChu && <small>{item.ghiChu}</small>}
                    </div>)}
                  </div> :
                  <p className="ctq-muted">Chưa cập nhật giờ mở cửa.</p>
                }
              </section>

              <section className="ctq-card">
                <div className="ctq-section-title">
                  <span><Utensils size={18} /></span>
                  <div>
                    <h2>Tiện ích của quán</h2>
                    <p>Các dịch vụ và tiện nghi hiện có</p>
                  </div>
                </div>
                {tienIch.length ? (
                  <div className="ctq-amenities">
                    {tienIch.map((item) => {
                      const IconTienIch = layIconTienIch(item.icon);

                      return (
                        <div
                          className="ctq-amenity"
                          key={item.id || item.tienIchId || item.tenTienIch}
                        >
                          <span className="ctq-amenity-icon">
                            {IconTienIch ? (
                              <IconTienIch size={17} strokeWidth={2.2} />
                            ) : (
                              <Utensils size={16} strokeWidth={2.2} />
                            )}
                          </span>

                          <span className="ctq-amenity-name">
                            {item.tenTienIch}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="ctq-muted">
                    Quán chưa cập nhật tiện ích.
                  </p>
                )}
              </section>
            </div>

            <aside className="ctq-sidebar">
              <section className="ctq-card ctq-contact">
                <div className="ctq-section-title">
                  <span><Info size={18} /></span>
                  <div>
                    <h2>Thông tin quán</h2>
                    <p>Liên hệ và tìm đường</p>
                  </div>
                </div>
                <div className="ctq-contact-list">
                  <div>
                    <MapPin size={18} />
                    <p>
                      <small>Địa chỉ</small>
                      <strong>{diaChi || "Chưa cập nhật"}</strong>
                    </p>
                  </div>
                  <div>
                    <Wallet size={18} />
                    <p>
                      <small>Mức giá tham khảo</small>
                      <strong>{hienThiGia(quan)}</strong>
                    </p>
                  </div>
                  {quan.soDienThoai &&
                    <a href={`tel:${quan.soDienThoai}`}>
                      <Phone size={18} />
                      <p>
                        <small>Điện thoại</small>
                        <strong>{quan.soDienThoai}</strong>
                      </p>
                    </a>}
                  {quan.urlFacebook &&
                    <a href={quan.urlFacebook} target="_blank" rel="noreferrer">
                      <LinkIcon size={18} />
                      <p>
                        <small>Facebook</small>
                        <strong>Trang Facebook của quán</strong>
                      </p>
                      <ExternalLink size={14} />
                    </a>}
                  {quan.website &&
                    <a href={quan.website} target="_blank" rel="noreferrer">
                      <Globe size={18} />
                      <p>
                        <small>Website</small>
                        <strong>Truy cập website</strong>
                      </p>
                      <ExternalLink size={14} />
                    </a>}
                </div>
                {linkBanDo &&
                  <a className="ctq-map-button" href={linkBanDo} target="_blank" rel="noreferrer">
                    <MapPinned size={17} /> Xem đường đi trên Google Maps
                    <ExternalLink size={14} />
                  </a>}
              </section>
              <section className="ctq-card ctq-area">
                <div className="ctq-section-title">
                  <span>
                    <MapPinned size={18} /></span>
                  <div>
                    <h2>Khu vực</h2>
                    <p>Vị trí của quán</p>
                  </div>
                </div>
                <strong>{quan.tenPhuongXa || "Chưa cập nhật phường/xã"}</strong>
                <span>{quan.tenTinhThanh || ""}</span>
              </section>
            </aside>
          </div>
          <Link className="ctq-back-bottom" to="/danh-muc">
            <ArrowLeft size={17} /> Quay lại danh sách quán
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ChiTietQuanAn;
