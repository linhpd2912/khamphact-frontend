import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  MapPin,
  Star,
  Utensils,
  Store,
  Newspaper,
  LoaderCircle,
  ImageOff,
} from "lucide-react";

import Header from "../components/client/Header";
import Footer from "../components/client/Footer";

import {
  layDanhMucHoatDong,
  layQuanNoiBat,
  layHinhAnhQuan,
  layDanhMucCuaQuan,
  layTinTucMoiNhat,
} from "../services/client/TrangChuService";

import "./TrangChu.css";
import API from "../Api";

const API_IMAGE_URL = API.BACKEND;

const xuLyUrlAnh = (url) => {
  if (!url) return "";

  if (url.startsWith("http")) {
    return url;
  }

  return `${API_IMAGE_URL}${url}`;
};

const layDanhSachTuPage = (data) => {
  if (Array.isArray(data)) return data;

  return data?.content || [];
};

const dinhDangNgay = (ngay) => {
  if (!ngay) return "Đang cập nhật";

  const date = new Date(ngay);

  if (Number.isNaN(date.getTime())) {
    return "Đang cập nhật";
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function TrangChu() {
  const [danhSachDanhMuc, setDanhSachDanhMuc] = useState([]);
  const [danhSachQuan, setDanhSachQuan] = useState([]);
  const [danhSachTinTuc, setDanhSachTinTuc] = useState([]);
  const [cauHinhWebsite, setCauHinhWebsite] = useState(null);

  const [dangTai, setDangTai] = useState(true);
  const [loiTaiDuLieu, setLoiTaiDuLieu] = useState("");

  useEffect(() => {
    const taiDuLieuTrangChu = async () => {
      setDangTai(true);
      setLoiTaiDuLieu("");

      try {
        const [
          danhMucData,
          quanData,
          tinTucData,
          cauHinhData,
        ] = await Promise.all([
          layDanhMucHoatDong(),
          layQuanNoiBat(),
          layTinTucMoiNhat(),

          // Nếu tải cấu hình lỗi thì các dữ liệu khác vẫn hiển thị bình thường
          fetch(API.CAU_HINH_WEBSITE)
            .then((response) => {
              if (!response.ok) {
                throw new Error("Không thể tải cấu hình website");
              }
              return response.json();
            })
            .catch((error) => {
              console.error("Lỗi tải cấu hình website:", error);
              return null;
            }),
        ]);

        setCauHinhWebsite(cauHinhData);

        setDanhSachDanhMuc(
          layDanhSachTuPage(danhMucData)
        );

        setDanhSachTinTuc(
          layDanhSachTuPage(tinTucData)
            .filter((item) => item.hoatDong === true)
            .slice(0, 4)
        );

        const danhSachQuanGoc = layDanhSachTuPage(quanData)
          .filter(
            (quan) =>
              quan.noiBat === true &&
              quan.hoatDong === true
          )
          .slice(0, 5);

        // Lấy hình ảnh và danh mục cho từng quán
        const danhSachQuanDayDu = await Promise.all(
          danhSachQuanGoc.map(async (quan) => {
            try {
              const [
                hinhAnhData,
                danhMucQuanData,
              ] = await Promise.all([
                layHinhAnhQuan(quan.id),
                layDanhMucCuaQuan(quan.id),
              ]);

              const danhSachHinhAnh = Array.isArray(hinhAnhData)
                ? hinhAnhData
                : [];

              const anhDaiDien =
                danhSachHinhAnh.find(
                  (anh) => anh.anhDaiDien === true
                ) ||
                [...danhSachHinhAnh].sort(
                  (a, b) => (a.thuTu || 0) - (b.thuTu || 0)
                )[0];

              const danhSachLienKet = Array.isArray(danhMucQuanData)
                ? danhMucQuanData
                : [];

              return {
                ...quan,
                anhDaiDien: anhDaiDien?.urlAnh || "",
                danhSachDanhMucId: danhSachLienKet.map(
                  (item) => item.danhMucId
                ),
              };
            } catch (error) {
              console.error(
                `Không thể tải thông tin quán ${quan.id}:`,
                error
              );

              return {
                ...quan,
                anhDaiDien: "",
                danhSachDanhMucId: [],
              };
            }
          })
        );

        setDanhSachQuan(danhSachQuanDayDu);

      } catch (error) {
        console.error("Lỗi tải dữ liệu trang chủ:", error);
        setLoiTaiDuLieu(error.message);
      } finally {
        setDangTai(false);
      }
    };

    taiDuLieuTrangChu();
  }, []);

  // Tìm tên danh mục dựa vào danhMucId
  const layTenDanhMucQuan = (danhMucId) => {
    const danhMuc = danhSachDanhMuc.find(
      (item) => item.id === danhMucId
    );

    return danhMuc?.tenDanhMuc || "";
  };

  return (
    <div className="client-home">

      {/* HEADER */}
      <Header />

      <main>

        {/* =================================
            BANNER TRANG CHỦ
        ================================= */}
        {cauHinhWebsite?.hienThiBanner &&
          cauHinhWebsite?.bannerTrangChu && (
            <section className="home-main-banner">
              {cauHinhWebsite.bannerLink ? (
                <a
                  href={cauHinhWebsite.bannerLink}
                  className="home-main-banner-link"
                  aria-label={
                    cauHinhWebsite.bannerTieuDe || "Khám phá ẩm thực Cần Thơ"
                  }
                >
                  <img
                    src={xuLyUrlAnh(cauHinhWebsite.bannerTrangChu)}
                    alt={
                      cauHinhWebsite.bannerAlt ||
                      cauHinhWebsite.bannerTieuDe ||
                      "Banner trang chủ"
                    }
                  />
                </a>
              ) : (
                <img
                  src={xuLyUrlAnh(cauHinhWebsite.bannerTrangChu)}
                  alt={
                    cauHinhWebsite.bannerAlt ||
                    cauHinhWebsite.bannerTieuDe ||
                    "Banner trang chủ"
                  }
                />
              )}

              {(cauHinhWebsite.bannerTieuDe ||
                cauHinhWebsite.bannerMoTa) && (
                  <div className="home-main-banner-content">
                    {cauHinhWebsite.bannerTieuDe && (
                      <h1>{cauHinhWebsite.bannerTieuDe}</h1>
                    )}

                    {cauHinhWebsite.bannerMoTa && (
                      <p>{cauHinhWebsite.bannerMoTa}</p>
                    )}
                  </div>
                )}
            </section>
          )}

        {/* =================================
            DANH MỤC
        ================================= */}
        <section className="home-category-section">

          <div className="home-container">

            <div className="home-section-heading">
              <div>
                <span className="home-section-subtitle">
                  KHÁM PHÁ ẨM THỰC
                </span>

                <h2>Bạn đang tìm gì hôm nay?</h2>

                <p>
                  Khám phá những địa điểm ăn uống phù hợp với bạn.
                </p>
              </div>

              <Link
                to="/danh-muc"
                className="home-view-all"
              >
                Xem tất cả
                <ArrowRight size={16} />
              </Link>
            </div>

            {dangTai ? (
              <div className="home-loading">
                <LoaderCircle className="loading-icon" />
                <span>Đang tải danh mục...</span>
              </div>
            ) : (
              <div className="home-category-list">

                {danhSachDanhMuc.map((danhMuc, index) => (
                  <Link
                    to={`/danh-muc?danhMuc=${encodeURIComponent(danhMuc.duongDanSeo)}`}
                    key={danhMuc.id}
                    className={`home-category-item category-color-${index % 8}`}
                  >
                    <div className="home-category-icon">
                      {danhMuc.icon || "🍽️"}
                    </div>

                    <span className="home-category-name">
                      {danhMuc.tenDanhMuc}
                    </span>
                  </Link>
                ))}

                {danhSachDanhMuc.length === 0 && (
                  <div className="home-empty">
                    Chưa có danh mục để hiển thị.
                  </div>
                )}

              </div>
            )}

          </div>

        </section>

        {/* =================================
            QUÁN NỔI BẬT
        ================================= */}
        <section className="home-restaurant-section">

          <div className="home-container">

            <div className="home-section-heading">

              <div className="home-heading-title">
                <div className="home-heading-icon restaurant-heading-icon">
                  <Star size={23} fill="currentColor" />
                </div>

                <div>
                  <h2>Quán nổi bật</h2>
                  <p>
                    Những địa điểm được giới thiệu tại Cửu Long.
                  </p>
                </div>
              </div>

              <Link
                to="/quan-an"
                className="home-view-all"
              >
                Xem tất cả
                <ArrowRight size={16} />
              </Link>

            </div>

            {dangTai ? (
              <div className="home-loading">
                <LoaderCircle className="loading-icon" />
                <span>Đang tải quán nổi bật...</span>
              </div>
            ) : (
              <div className="home-restaurant-grid">

                {danhSachQuan.map((quan) => {
                  const danhMucCuaQuan =
                    quan.danhSachDanhMucId
                      .map((id) => layTenDanhMucQuan(id))
                      .filter(Boolean);

                  return (
                    <Link
                      to={`/quan-an/${quan.duongDanSeo}`}
                      className="home-restaurant-card"
                      key={quan.id}
                    >

                      {/* ẢNH QUÁN */}
                      <div className="home-restaurant-image">

                        {quan.anhDaiDien ? (
                          <img
                            src={xuLyUrlAnh(quan.anhDaiDien)}
                            alt={quan.tenQuan}
                            loading="lazy"
                          />
                        ) : (
                          <div className="home-no-image">
                            <ImageOff size={32} />
                            <span>Chưa có hình ảnh</span>
                          </div>
                        )}

                        <span className="home-featured-label">
                          <Star size={12} fill="currentColor" />
                          Nổi bật
                        </span>

                      </div>

                      {/* THÔNG TIN QUÁN */}
                      <div className="home-restaurant-content">

                        <h3>{quan.tenQuan}</h3>

                        <div className="home-restaurant-rating">

                          <Star
                            size={15}
                            fill="#f6b817"
                            color="#f6b817"
                          />

                          <strong>
                            {quan.diemDanhGiaGoogle != null
                              ? Number(quan.diemDanhGiaGoogle).toFixed(1)
                              : "Chưa có"}
                          </strong>

                          <span>
                            ({quan.tongDanhGiaGoogle || 0} đánh giá)
                          </span>

                        </div>

                        <div className="home-restaurant-address">
                          <MapPin size={14} />

                          <span>
                            {[quan.tenPhuongXa, quan.tenTinhThanh]
                              .filter(Boolean)
                              .join(", ") || quan.diaChi || "Chưa cập nhật địa chỉ"}
                          </span>
                        </div>

                        <div className="home-restaurant-categories">

                          {danhMucCuaQuan.length > 0 ? (
                            danhMucCuaQuan.slice(0, 3).map(
                              (tenDanhMuc, index) => (
                                <span key={`${tenDanhMuc}-${index}`}>
                                  {tenDanhMuc}
                                </span>
                              )
                            )
                          ) : (
                            <span>Địa điểm ăn uống</span>
                          )}

                        </div>

                      </div>

                    </Link>
                  );
                })}

                {danhSachQuan.length === 0 && (
                  <div className="home-empty">
                    Hiện chưa có quán nổi bật.
                  </div>
                )}

              </div>
            )}

          </div>

        </section>

        {/* =================================
            BANNER HỢP TÁC
        ================================= */}
        <section className="home-partner-section">

          <div className="home-container">

            <div className="home-partner-banner">

              <div className="home-partner-content">

                <div className="home-partner-icon">
                  <Store size={40} />
                </div>

                <div className="home-partner-text">

                  <span className="home-partner-label">
                    DÀNH CHO CHỦ CỬA HÀNG
                  </span>

                  <h2>Bạn là chủ quán?</h2>

                  <h3>
                    Đưa cửa hàng của bạn lên Cửu Long
                  </h3>

                  <ul>
                    <li>Tiếp cận nhiều khách hàng tiềm năng hơn</li>
                    <li>Tăng độ nhận diện thương hiệu</li>
                    <li>Quảng bá địa điểm ăn uống của bạn</li>
                  </ul>

                  <Link
                    to="/lien-he"
                    className="home-partner-button"
                  >
                    Đăng ký ngay
                    <ArrowRight size={17} />
                  </Link>

                </div>

              </div>

              <div className="home-partner-decoration">
                <Utensils size={125} />
                <span>Lan tỏa<br />hương vị Việt!</span>
              </div>

            </div>

          </div>

        </section>

        {/* =================================
            TIN TỨC
        ================================= */}
        <section className="home-news-section">

          <div className="home-container">

            <div className="home-section-heading">

              <div className="home-heading-title">

                <div className="home-heading-icon news-heading-icon">
                  <Newspaper size={23} />
                </div>

                <div>
                  <h2>Tin tức & Sự kiện</h2>
                  <p>
                    Cập nhật xu hướng, kinh nghiệm và khám phá ẩm thực.
                  </p>
                </div>

              </div>

              <Link
                to="/tin-tuc"
                className="home-view-all"
              >
                Xem tất cả
                <ArrowRight size={16} />
              </Link>

            </div>

            {dangTai ? (
              <div className="home-loading">
                <LoaderCircle className="loading-icon" />
                <span>Đang tải tin tức...</span>
              </div>
            ) : (
              <div className="home-news-grid">

                {danhSachTinTuc.map((baiViet) => (
                  <Link
                    to={`/tin-tuc/${baiViet.duongDanSeo}`}
                    className="home-news-card"
                    key={baiViet.id}
                  >

                    <div className="home-news-image">

                      {baiViet.hinhDaiDien ? (
                        <img
                          src={xuLyUrlAnh(baiViet.hinhDaiDien)}
                          alt={
                            baiViet.hinhDaiDienAlt ||
                            baiViet.tieuDe
                          }
                          loading="lazy"
                        />
                      ) : (
                        <div className="home-no-image">
                          <ImageOff size={30} />
                        </div>
                      )}

                      <span className="home-news-category">
                        {baiViet.tenDanhMuc || "Tin tức"}
                      </span>

                    </div>

                    <div className="home-news-content">

                      <h3>{baiViet.tieuDe}</h3>

                      <span className="home-news-date">
                        {dinhDangNgay(baiViet.ngayDang)}
                      </span>

                    </div>

                  </Link>
                ))}

                {danhSachTinTuc.length === 0 && (
                  <div className="home-empty">
                    Hiện chưa có bài viết nào.
                  </div>
                )}

              </div>
            )}

          </div>

        </section>

        {loiTaiDuLieu && (
          <div className="home-error-message">
            Không thể tải một số dữ liệu: {loiTaiDuLieu}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}

export default TrangChu;