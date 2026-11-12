import {
  ArrowRight,
  MapPin,
  Sparkles,
} from "lucide-react";


function DanhMucDichVuBanner({ onExplore }) {
  return (
    <section className="danh-muc-banner-section">
      <div className="danh-muc-container">

        <div className="danh-muc-banner">

          <div className="danh-muc-banner-decoration">
            🌸
          </div>

          <div className="danh-muc-banner-content">

            <div className="danh-muc-banner-label">
              <Sparkles size={15} />
              <span>HÀNH TRÌNH TRẢI NGHIỆM</span>
            </div>

            <h2>
              Cần Thơ còn rất nhiều
              <span> dịch vụ  chờ bạn khám phá!</span>
            </h2>

            <p>
              Cùng khám phá những địa điểm dịch vụ hấp dẫn, trải nghiệm không gian làm đẹp, mua sắm và tận hưởng những tiện ích chất lượng. Tìm kiếm địa điểm yêu thích và lưu lại những trải nghiệm đáng nhớ.
            </p>

            <button
              type="button"
              onClick={onExplore}
            >
              Khám phá ngay
              <ArrowRight size={18} />
            </button>

          </div>

          <div className="danh-muc-banner-icon">
            <div>
              <MapPin size={35} />
            </div>

            <span>Cần Thơ</span>
          </div>

        </div>

      </div>
    </section>
  );
}

export default DanhMucDichVuBanner;