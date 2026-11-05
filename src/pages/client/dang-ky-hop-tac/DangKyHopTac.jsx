import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Store,
  Utensils,
  Handshake,
  Sparkles,
  Clock3,
  ShieldCheck,
  Send,
  LoaderCircle,
  MessageCircle,
  // Instagram,
  // Facebook,
} from "lucide-react";

import { guiDangKyHopTac } from "../../../services/admin/DangKyHopTacService";

import "./DangKyHopTac.css";
import Header from "../../../components/client/Header";
import Footer from "../../../components/client/Footer";

const FORM_MAC_DINH = {
  hoTen: "",
  soDienThoai: "",
  email: "",
  tenQuan: "",
  diaChiQuan: "",
  noiDung: "",
};

function DangKyHopTac() {
  const [formData, setFormData] = useState(FORM_MAC_DINH);
  const [dangGui, setDangGui] = useState(false);
  const [guiThanhCong, setGuiThanhCong] = useState(false);
  const [thongBaoLoi, setThongBaoLoi] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setThongBaoLoi("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setThongBaoLoi("");

    const duLieuGui = {
      hoTen: formData.hoTen.trim(),
      soDienThoai: formData.soDienThoai.trim(),
      email: formData.email.trim(),
      tenQuan: formData.tenQuan.trim(),
      diaChiQuan: formData.diaChiQuan.trim(),
      noiDung: formData.noiDung.trim(),
    };

    const regexSoDienThoai = /^(0[35789])[0-9]{8}$/;

    if (!regexSoDienThoai.test(duLieuGui.soDienThoai)) {
      setThongBaoLoi(
        "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số."
      );
      return;
    }

    try {
      setDangGui(true);

      await guiDangKyHopTac(duLieuGui);

      setGuiThanhCong(true);
      setFormData(FORM_MAC_DINH);
    } catch (error) {
      setThongBaoLoi(
        error.message || "Có lỗi xảy ra. Vui lòng thử lại sau."
      );
    } finally {
      setDangGui(false);
    }
  };

  const handleDangKyMoi = () => {
    setGuiThanhCong(false);
    setThongBaoLoi("");
    setFormData(FORM_MAC_DINH);
  };

  return (
    
    <div className="client-home">

      <Header />

      <main className="hop-tac-page">
      {/* Background decoration */}
      <div className="hop-tac-bg-shape shape-one"></div>
      <div className="hop-tac-bg-shape shape-two"></div>
      <div className="hop-tac-bg-shape shape-three"></div>

      {/* Hero */}
      <section className="hop-tac-hero">
        <div className="hop-tac-hero-content">
          <div className="hop-tac-badge">
            <Sparkles size={16} />
            <span>KẾT NỐI CÙNG CHÚNG TÔI</span>
          </div>

          <h1>
            Cùng đưa hương vị
            <br />
            <span>ẩm thực Cần Thơ</span>
            <br />
            đến gần mọi người!
          </h1>

          <p className="hop-tac-hero-desc">
            Quán ăn, quán cà phê hay nhà hàng của bạn xứng đáng được
            nhiều người biết đến hơn. Hãy để chúng tôi đồng hành cùng
            bạn trên hành trình phát triển thương hiệu.
          </p>

          <div className="hop-tac-hero-note">
            <div className="hop-tac-note-icon">
              <Handshake size={25} />
            </div>

            <div>
              <strong>Bắt đầu hợp tác ngay hôm nay</strong>
              <p>Đăng ký thông tin hoàn toàn miễn phí.</p>
            </div>
          </div>

          <div className="hop-tac-benefits">
            <div className="hop-tac-benefit-item">
              <div className="benefit-icon">
                <Store size={21} />
              </div>
              <div>
                <strong>Quảng bá thương hiệu</strong>
                <span>Giúp khách hàng dễ dàng tìm thấy quán.</span>
              </div>
            </div>

            <div className="hop-tac-benefit-item">
              <div className="benefit-icon">
                <MapPin size={21} />
              </div>
              <div>
                <strong>Tăng khả năng tiếp cận</strong>
                <span>Hiển thị thông tin quán trên bản đồ và website.</span>
              </div>
            </div>

            <div className="hop-tac-benefit-item">
              <div className="benefit-icon">
                <Utensils size={21} />
              </div>
              <div>
                <strong>Tiếp cận khách hàng mới</strong>
                <span>Đưa địa điểm ăn uống đến gần thực khách.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative food card */}
        <div className="hop-tac-hero-visual">
          <div className="food-visual-circle circle-large"></div>
          <div className="food-visual-circle circle-small"></div>

          <div className="food-visual-card">
            <div className="food-visual-top">
              <span className="food-visual-dot"></span>
              <span>FOOD & DRINKS</span>
              <Sparkles size={17} />
            </div>

            <div className="food-visual-emoji">🍜</div>

            <h3>Hương vị địa phương</h3>
            <p>Nơi những trải nghiệm ẩm thực được kết nối.</p>

            <div className="food-visual-tags">
              <span>🍲 Món ngon</span>
              <span>☕ Cà phê</span>
              <span>🍰 Tráng miệng</span>
            </div>
          </div>

          <div className="floating-food floating-one">🍹</div>
          <div className="floating-food floating-two">🍕</div>
          <div className="floating-food floating-three">🥗</div>

          <div className="visual-caption">
            <div className="visual-caption-icon">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <strong>Kết nối dễ dàng</strong>
              <span>Đồng hành cùng quán của bạn</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form section */}
      <section className="hop-tac-form-section">
        <div className="hop-tac-form-intro">
          <span className="section-eyebrow">LET'S WORK TOGETHER</span>
          <h2>
            Đăng ký <span>hợp tác</span>
          </h2>
          <p>
            Điền thông tin bên dưới, đội ngũ của chúng tôi sẽ tiếp nhận
            và liên hệ với bạn trong thời gian sớm nhất.
          </p>
        </div>

        <div className="hop-tac-form-layout">
          {/* Contact information */}
          <div className="hop-tac-contact-card">
            <div className="contact-card-decoration"></div>

            <div className="contact-card-content">
              <span className="contact-card-label">THÔNG TIN KẾT NỐI</span>

              <h3>
                Chúng tôi luôn
                <br />
                sẵn sàng lắng nghe!
              </h3>

              <p>
                Bạn có thắc mắc về chương trình hợp tác? Hãy gửi thông tin
                để chúng tôi có thể hỗ trợ bạn.
              </p>

              <div className="contact-info-list">
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <Phone size={19} />
                  </div>
                  <div>
                    <span>Điện thoại</span>
                    <strong>Liên hệ qua số điện thoại đăng ký</strong>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <Mail size={19} />
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>Thông tin liên hệ của bạn</strong>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <MapPin size={19} />
                  </div>
                  <div>
                    <span>Khu vực hoạt động</span>
                    <strong>Thành phố Cần Thơ</strong>
                  </div>
                </div>
              </div>

              <div className="contact-card-bottom">
                <div className="contact-card-line"></div>
                <p>Địa điểm ăn uống Cần Thơ</p>
                <span>Kết nối thực khách – Lan tỏa món ngon.</span>
              </div>
            </div>
          </div>

          {/* Registration form */}
          <div className="hop-tac-form-card">
            {guiThanhCong ? (
              <div className="hop-tac-success">
                <div className="success-icon">
                  <CheckCircle2 size={55} />
                </div>

                <h3>Gửi đăng ký thành công!</h3>

                <p>
                  Cảm ơn bạn đã quan tâm và đăng ký hợp tác cùng
                  Địa điểm ăn uống Cần Thơ.
                </p>

                <div className="success-note">
                  <Clock3 size={19} />
                  <span>
                    Thông tin của bạn đã được gửi đến hệ thống.
                    Chúng tôi sẽ sớm liên hệ để trao đổi thêm.
                  </span>
                </div>

                <button
                  type="button"
                  className="success-button"
                  onClick={handleDangKyMoi}
                >
                  Gửi đăng ký khác
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <>
                <div className="form-heading">
                  <div>
                    <span className="form-heading-label">
                      PARTNER REGISTRATION
                    </span>
                    <h3>Thông tin đăng ký</h3>
                    <p>Các trường có dấu * là bắt buộc.</p>
                  </div>

                  <div className="form-heading-icon">
                    <Handshake size={27} />
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="hoTen">
                      Họ và tên người liên hệ <span>*</span>
                    </label>
                    <input
                      id="hoTen"
                      name="hoTen"
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn An"
                      value={formData.hoTen}
                      onChange={handleChange}
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="soDienThoai">
                        Số điện thoại <span>*</span>
                      </label>
                      <input
                        id="soDienThoai"
                        name="soDienThoai"
                        type="tel"
                        placeholder="09xxxxxxxx"
                        value={formData.soDienThoai}
                        onChange={handleChange}
                        maxLength={10}
                        pattern="0[35789][0-9]{8}"
                        title="Vui lòng nhập số điện thoại Việt Nam hợp lệ gồm 10 chữ số."
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">
                        Email <span>*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        maxLength={254}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tenQuan">
                      Tên quán / thương hiệu <span>*</span>
                    </label>
                    <input
                      id="tenQuan"
                      name="tenQuan"
                      type="text"
                      placeholder="Ví dụ: Nhà hàng, quán cà phê..."
                      value={formData.tenQuan}
                      onChange={handleChange}
                      maxLength={200}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="diaChiQuan">
                      Địa chỉ quán <span>*</span>
                    </label>
                    <div className="input-with-icon">
                      <MapPin size={18} />
                      <input
                        id="diaChiQuan"
                        name="diaChiQuan"
                        type="text"
                        placeholder="Số nhà, đường, phường/xã, Cần Thơ..."
                        value={formData.diaChiQuan}
                        onChange={handleChange}
                        maxLength={500}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="noiDung">
                      Nội dung cần trao đổi
                      <span className="optional-label">Không bắt buộc</span>
                    </label>
                    <textarea
                      id="noiDung"
                      name="noiDung"
                      rows="4"
                      placeholder="Chia sẻ thêm về quán, mô hình kinh doanh hoặc mong muốn hợp tác của bạn..."
                      value={formData.noiDung}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  {thongBaoLoi && (
                    <div className="hop-tac-error">
                      <MessageCircle size={18} />
                      <span>{thongBaoLoi}</span>
                    </div>
                  )}

                  <div className="form-privacy-note">
                    <ShieldCheck size={17} />
                    <span>
                      Thông tin của bạn được sử dụng để tiếp nhận và
                      xử lý yêu cầu hợp tác.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="hop-tac-submit"
                    disabled={dangGui}
                  >
                    {dangGui ? (
                      <>
                        <LoaderCircle className="submit-loading" size={19} />
                        Đang gửi thông tin...
                      </>
                    ) : (
                      <>
                        Gửi thông tin đăng ký
                        <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Bottom benefits */}
      <section className="hop-tac-bottom">
        <div>
          <div className="bottom-icon">
            <ShieldCheck size={23} />
          </div>
          <div>
            <strong>Thông tin minh bạch</strong>
            <span>Tiếp nhận thông tin rõ ràng.</span>
          </div>
        </div>

        <div>
          <div className="bottom-icon">
            <MessageCircle size={23} />
          </div>
          <div>
            <strong>Hỗ trợ tận tình</strong>
            <span>Đồng hành trong quá trình trao đổi.</span>
          </div>
        </div>

        <div>
          <div className="bottom-icon">
            <Handshake size={23} />
          </div>
          <div>
            <strong>Hợp tác lâu dài</strong>
            <span>Cùng phát triển cộng đồng F&B.</span>
          </div>
        </div>
      </section>
    </main>

    <Footer />

    </div>

    
  );
}

export default DangKyHopTac;