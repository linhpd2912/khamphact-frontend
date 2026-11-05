import {
  MapPin,
  Star,
  ArrowUpRight,
  Eye,
  Utensils,
} from "lucide-react";

// ==========================================
// CẤU HÌNH ĐƯỜNG DẪN ẢNH
// ==========================================

// Nếu backend chạy cổng khác 8080 thì thay đổi tại đây.
const API_UPLOAD_URL = "http://localhost:8080";

// ==========================================
// ĐỊNH DẠNG GIÁ
// ==========================================

function dinhDangGia(gia) {
  if (gia === null || gia === undefined) {
    return null;
  }

  return Number(gia).toLocaleString("vi-VN") + "đ";
}

function hienThiKhoangGia(giaTu, giaDen) {
  const tu = dinhDangGia(giaTu);
  const den = dinhDangGia(giaDen);

  if (tu && den) {
    return `${tu} - ${den}`;
  }

  if (tu) {
    return `Từ ${tu}`;
  }

  if (den) {
    return `Đến ${den}`;
  }

  return "Đang cập nhật";
}

// ==========================================
// LẤY ĐỊA CHỈ
// ==========================================

function layDiaChi(quan) {
  return [
    quan.diaChi,
    quan.tenPhuongXa,
    quan.tenTinhThanh,
  ]
    .filter(Boolean)
    .join(", ");
}

// ==========================================
// LẤY ẢNH ĐẠI DIỆN
// ==========================================

function layAnhDaiDien(quan) {
  const danhSachAnh = Array.isArray(quan.danhSachAnh)
    ? quan.danhSachAnh
    : [];

  if (danhSachAnh.length === 0) {
    return null;
  }

  // Ưu tiên ảnh được đánh dấu là ảnh đại diện.
  const anhDaiDien = danhSachAnh.find(
    (anh) =>
      anh.anhDaiDien === true ||
      anh.laAnhDaiDien === true
  );

  // Nếu không có ảnh đại diện thì lấy ảnh đầu tiên.
  const anh = anhDaiDien || danhSachAnh[0];

  const duongDanAnh =
    anh.urlAnh ||
    anh.duongDanAnh ||
    anh.duongDan ||
    anh.url ||
    anh.imageUrl ||
    anh.path;

  if (!duongDanAnh) {
    return null;
  }

  return taoUrlAnh(duongDanAnh);
}

// ==========================================
// TẠO URL HÌNH ẢNH
// ==========================================

function taoUrlAnh(duongDan) {
  if (!duongDan) {
    return null;
  }

  // Nếu là URL đầy đủ thì giữ nguyên.
  if (
    duongDan.startsWith("http://") ||
    duongDan.startsWith("https://")
  ) {
    return duongDan;
  }

  // Nếu là đường dẫn tương đối thì nối với backend.
  return `${API_UPLOAD_URL}${duongDan.startsWith("/") ? "" : "/"}${duongDan}`;
}

// ==========================================
// COMPONENT QUÁN ĂN THEO DANH MỤC
// ==========================================

function QuanAnTheoDanhMuc({
  danhMuc,
  quanAns = [],
  loading = false,
  error = "",
  onViewDetail,
}) {
  return (
    <section className="danh-muc-quan-section">
      <div className="danh-muc-container">

        {/* Tiêu đề */}
        <div className="danh-muc-quan-heading">
          <div>
            <span className="danh-muc-section-label">
              ĐỊA ĐIỂM DÀNH CHO BẠN
            </span>

            <h2>
              {danhMuc
                ? `Khám phá ${danhMuc.tenDanhMuc}`
                : "Những địa điểm ăn uống nổi bật"}
            </h2>

            <p>
              Những địa điểm được tuyển chọn để bạn
              dễ dàng tìm thấy nơi phù hợp.
            </p>
          </div>

          <div className="danh-muc-quan-count">
            <Utensils size={17} />

            <span>
              {quanAns.length} địa điểm
            </span>
          </div>
        </div>

        {/* Đang tải */}
        {loading && (
          <div className="danh-muc-loading">
            Đang tìm kiếm địa điểm ăn uống...
          </div>
        )}

        {/* Lỗi */}
        {!loading && error && (
          <div className="danh-muc-error">
            {error}
          </div>
        )}

        {/* Danh sách quán */}
        {!loading && !error && quanAns.length > 0 && (
          <div className="danh-muc-quan-grid">

            {quanAns.map((quan) => {
              const anh = layAnhDaiDien(quan);

              return (
                <article
                  className="danh-muc-quan-card"
                  key={quan.id}
                >

                  {/* Hình ảnh */}
                  <div className="danh-muc-quan-image">

                    {anh && (
                      <img
                        src={anh}
                        alt={quan.tenQuan || "Hình ảnh quán ăn"}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";

                          const placeholder =
                            e.currentTarget.parentElement.querySelector(
                              ".danh-muc-quan-no-image"
                            );

                          if (placeholder) {
                            placeholder.style.display = "flex";
                          }
                        }}
                      />
                    )}

                    <div
                      className="danh-muc-quan-no-image"
                      style={{
                        display: anh ? "none" : "flex",
                      }}
                    >
                      <Utensils size={40} />

                      <span>
                        Chưa có hình ảnh
                      </span>
                    </div>

                    {/* Nhãn nổi bật */}
                    {Boolean(quan.noiBat) && (
                      <span className="danh-muc-quan-featured">
                        <Star
                          size={13}
                          fill="currentColor"
                        />

                        Nổi bật
                      </span>
                    )}

                  </div>

                  {/* Nội dung */}
                  <div className="danh-muc-quan-content">

                    <h3>
                      {quan.tenQuan}
                    </h3>

                    {/* Địa chỉ */}
                    <div className="danh-muc-quan-address">
                      <MapPin size={15} />

                      <span>
                        {layDiaChi(quan) ||
                          "Chưa cập nhật địa chỉ"}
                      </span>
                    </div>

                    {/* Đánh giá */}
                    <div className="danh-muc-quan-rating">
                      <div>
                        <Star
                          size={16}
                          fill="currentColor"
                        />

                        <strong>
                          {quan.diemDanhGiaGoogle ??
                            "Chưa có đánh giá"}
                        </strong>

                        {quan.diemDanhGiaGoogle !== null &&
                          quan.diemDanhGiaGoogle !== undefined && (
                            <span>
                              ({quan.tongDanhGiaGoogle || 0} đánh giá)
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Giá và lượt xem */}
                    <div className="danh-muc-quan-meta">

                      <span className="danh-muc-quan-price">
                        {hienThiKhoangGia(
                          quan.giaTu,
                          quan.giaDen
                        )}
                      </span>

                      <span className="danh-muc-quan-views">
                        <Eye size={14} />

                        {quan.luotXem || 0}
                      </span>

                    </div>

                    {/* Nút chi tiết */}
                    <button
                      type="button"
                      className="danh-muc-quan-button"
                      onClick={() =>
                        onViewDetail?.(quan)
                      }
                    >
                      Xem chi tiết

                      <ArrowUpRight size={17} />
                    </button>

                  </div>

                </article>
              );
            })}

          </div>
        )}

        {/* Không có dữ liệu */}
        {!loading && !error && quanAns.length === 0 && (
          <div className="danh-muc-empty">

            <Utensils size={38} />

            <h3>
              Chưa tìm thấy địa điểm phù hợp
            </h3>

            <p>
              Danh mục này hiện chưa có quán ăn nào
              đang hoạt động.
            </p>

          </div>
        )}

      </div>
    </section>
  );
}

export default QuanAnTheoDanhMuc;