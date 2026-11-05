import {
  ArrowRight,
  MapPin,
  Sparkles,
} from "lucide-react";


function DanhMucBanner({ onExplore }) {
  return (
    <section className="danh-muc-banner-section">
      <div className="danh-muc-container">

        <div className="danh-muc-banner">

          <div className="danh-muc-banner-decoration">
            🍜
          </div>

          <div className="danh-muc-banner-content">

            <div className="danh-muc-banner-label">
              <Sparkles size={15} />
              <span>HÀNH TRÌNH ẨM THỰC</span>
            </div>

            <h2>
              Cần Thơ còn rất nhiều
              <span> món ngon chờ bạn khám phá!</span>
            </h2>

            <p>
              Cùng tìm kiếm những địa điểm ăn uống thú vị,
              thưởng thức hương vị miền Tây và lưu lại
              những trải nghiệm đáng nhớ.
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

export default DanhMucBanner;