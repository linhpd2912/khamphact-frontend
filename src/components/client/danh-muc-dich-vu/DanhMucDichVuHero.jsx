import {
  Search,
  ArrowRight,
  MapPin,
  Sparkles,
  Utensils,
} from "lucide-react";

function DanhMucDichVuHero({
  keyword,
  onKeywordChange,
  onSearch,
}) {

  const handleSubmit = (e) => {
    e.preventDefault();

    if (onSearch) {
      onSearch();
    }
  };

  return (
    <section className="danh-muc-hero">
      <div className="danh-muc-hero-container">

        {/* Nội dung bên trái */}
        <div className="danh-muc-hero-content">

          <div className="danh-muc-hero-badge">
            <Sparkles size={15} />
            <span>KHÁM PHÁ DỊCH VỤ CẦN THƠ</span>
          </div>

          <h1>
            Khám phá những
            <span> dịch vụ </span>
            giữa lòng Cần Thơ!
          </h1>

          <p className="danh-muc-hero-description">
            Khám phá thế giới dịch vụ đa dạng từ làm đẹp đến thời trang và nhiều tiện ích khác. Dễ dàng tìm kiếm địa điểm yêu thích, trải nghiệm dịch vụ chất lượng và lựa chọn phù hợp với nhu cầu của bạn.
          </p>

          {/* Thanh tìm kiếm */}
          <form
            className="danh-muc-search"
            onSubmit={handleSubmit}
          >
            <div className="danh-muc-search-icon">
              <Search size={21} />
            </div>

            <input
              type="text"
              placeholder="Bạn đang muốn tìm dịch vụ gì?"
              value={keyword}
              onChange={(e) =>
                onKeywordChange?.(e.target.value)
              }
            />

            <button type="submit">
              Tìm kiếm
              <ArrowRight size={17} />
            </button>
          </form>

          {/* Thông tin bên dưới */}
          <div className="danh-muc-hero-note">
            <MapPin size={17} />

            <span>
              Khám phá những địa điểm dịch vụ tại Cần Thơ
            </span>
          </div>
        </div>

        {/* Hình minh họa bên phải */}
        <div className="danh-muc-hero-visual">

          <div className="danh-muc-hero-circle danh-muc-circle-one"></div>
          <div className="danh-muc-hero-circle danh-muc-circle-two"></div>

          <div className="danh-muc-food-main">
            <div className="danh-muc-food-main-top">
              <span>KHÁM PHÁ DỊCH VỤ</span>
              <Sparkles size={18} />
            </div>

            <div className="danh-muc-food-illustration">
              <span>🏬</span>
            </div>

            <div className="danh-muc-food-caption">
              <h3>Dịch vụ Cần Thơ</h3>

              <p>
                Chăm chút từng trải nghiệm, Tận tâm trong từng dịch vụ
              </p>
            </div>
          </div>

          {/* Nhãn trang trí */}
          <div className="danh-muc-floating-card danh-muc-floating-top">
            <span className="danh-muc-floating-icon">✨</span>

            <div>
              <strong>Tiện ích mỗi ngày</strong>
              <small>Khám phá trải nghiệm mới</small>
            </div>
          </div>

          <div className="danh-muc-floating-card danh-muc-floating-bottom">
            <span className="danh-muc-floating-icon">🛍️</span>

            <div>
              <strong>Không gian yêu thích</strong>
              <small>Chọn nơi bạn muốn đến</small>
            </div>
          </div>

          <div className="danh-muc-hero-decoration">
            <span className="danh-muc-floating-icon">👠</span>
          </div>

        </div>
      </div>
    </section>
  );
}
export default DanhMucDichVuHero