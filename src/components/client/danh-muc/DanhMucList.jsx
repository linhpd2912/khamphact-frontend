import {
  ArrowUpRight,
  Utensils,
  Star,
} from "lucide-react";

// ==========================================
// LẤY EMOJI TỪ CƠ SỞ DỮ LIỆU
// ==========================================

function layIconDanhMuc(danhMuc) {
  return danhMuc.icon?.trim() || "🍽️";
}

// ==========================================
// COMPONENT DANH MỤC
// ==========================================

function DanhMucList({
  danhMucs = [],
  danhMucDangChon,
  onSelect,
  loading = false,
}) {
  if (loading) {
    return (
      <section className="danh-muc-section">
        <div className="danh-muc-container">
          <div className="danh-muc-section-heading">
            <span className="danh-muc-section-label">
              KHÁM PHÁ
            </span>

            <h2>Danh mục ẩm thực</h2>
          </div>

          <div className="danh-muc-loading">
            Đang tải danh mục...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="danh-muc-section">
      <div className="danh-muc-container">

        {/* Tiêu đề */}
        <div className="danh-muc-section-heading">
          <div>
            <span className="danh-muc-section-label">
              KHÁM PHÁ HƯƠNG VỊ
            </span>

            <h2>
              Bạn đang muốn thưởng thức gì?
            </h2>

            <p>
              Lựa chọn danh mục yêu thích và tìm kiếm
              những địa điểm phù hợp với bạn.
            </p>
          </div>

          <div className="danh-muc-heading-decoration">
            <Star size={19} />

            <span>Được chọn lọc dành cho bạn</span>
          </div>
        </div>

        {/* Danh sách danh mục */}
        {danhMucs.length > 0 ? (
          <div className="danh-muc-grid">

            {danhMucs.map((danhMuc, index) => {
              const icon = layIconDanhMuc(danhMuc);

              const dangChon =
                Number(danhMucDangChon) ===
                Number(danhMuc.id);

              return (
                <button
                  type="button"
                  key={danhMuc.id}
                  className={`danh-muc-item ${
                    dangChon ? "active" : ""
                  }`}
                  onClick={() => onSelect?.(danhMuc)}
                  style={{
                    "--danh-muc-index": index,
                  }}
                >
                  {/* Phần trên */}
                  <div className="danh-muc-item-top">

                    <div className="danh-muc-item-icon">
                      <span>{icon}</span>
                    </div>

                    {Boolean(danhMuc.noiBat) && (
                      <span className="danh-muc-item-featured">
                        <Star
                          size={12}
                          fill="currentColor"
                        />

                        Nổi bật
                      </span>
                    )}
                  </div>

                  {/* Nội dung */}
                  <div className="danh-muc-item-content">
                    <h3>
                      {danhMuc.tenDanhMuc}
                    </h3>

                    <p>
                      {danhMuc.moTa ||
                        "Khám phá những địa điểm hấp dẫn thuộc danh mục này."}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="danh-muc-item-footer">
                    <span>
                      {dangChon
                        ? "Đang khám phá"
                        : "Khám phá ngay"}
                    </span>

                    <ArrowUpRight size={18} />
                  </div>

                  {/* Icon trang trí */}
                  <div className="danh-muc-item-watermark">
                    <span>{icon}</span>
                  </div>

                </button>
              );
            })}

          </div>
        ) : (
          <div className="danh-muc-empty">
            <Utensils size={35} />

            <h3>Chưa có danh mục nào</h3>

            <p>
              Hiện tại chưa có danh mục ẩm thực phù hợp.
              Vui lòng quay lại sau nhé!
            </p>
          </div>
        )}

      </div>
    </section>
  );
}

export default DanhMucList;