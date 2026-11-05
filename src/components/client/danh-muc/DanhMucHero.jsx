import {
  Search,
  ArrowRight,
  MapPin,
  Sparkles,
  Utensils,
} from "lucide-react";



function DanhMucHero({
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
            <span>KHÁM PHÁ ẨM THỰC CẦN THƠ</span>
          </div>

          <h1>
            Khám phá những
            <span> hương vị đặc sắc </span>
            giữa lòng Cần Thơ!
          </h1>

          <p className="danh-muc-hero-description">
            Từ những món ăn dân dã miền Tây đến các quán ăn
            nổi tiếng, cùng khám phá những địa điểm ẩm thực
            hấp dẫn và tìm cho mình hương vị yêu thích.
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
              placeholder="Bạn đang muốn tìm món gì?"
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
              Khám phá những địa điểm ăn uống tại Cần Thơ
            </span>
          </div>
        </div>

        {/* Hình minh họa bên phải */}
        <div className="danh-muc-hero-visual">

          <div className="danh-muc-hero-circle danh-muc-circle-one"></div>
          <div className="danh-muc-hero-circle danh-muc-circle-two"></div>

          <div className="danh-muc-food-main">
            <div className="danh-muc-food-main-top">
              <span>HƯƠNG VỊ MIỀN TÂY</span>
              <Sparkles size={18} />
            </div>

            <div className="danh-muc-food-illustration">
              <span>🍜</span>
            </div>

            <div className="danh-muc-food-caption">
              <h3>Ẩm thực Cần Thơ</h3>

              <p>
                Đậm đà hương vị, trọn vẹn yêu thương
              </p>
            </div>
          </div>

          {/* Nhãn trang trí */}
          <div className="danh-muc-floating-card danh-muc-floating-top">
            <span className="danh-muc-floating-icon">🍲</span>

            <div>
              <strong>Món ngon mỗi ngày</strong>
              <small>Khám phá hương vị mới</small>
            </div>
          </div>

          <div className="danh-muc-floating-card danh-muc-floating-bottom">
            <span className="danh-muc-floating-icon">☕</span>

            <div>
              <strong>Không gian yêu thích</strong>
              <small>Chọn nơi bạn muốn đến</small>
            </div>
          </div>

          <div className="danh-muc-hero-decoration">
            <Utensils size={23} />
          </div>

        </div>
      </div>
    </section>
  );
}

export default DanhMucHero;