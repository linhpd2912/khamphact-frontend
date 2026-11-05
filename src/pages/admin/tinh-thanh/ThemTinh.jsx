import { useState } from "react";
import { X, Save, MapPinned } from "lucide-react";


import "./ThemTinh.css";
import API from "../../../Api";

export default function ThemTinh({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    tenTinhThanh: "",
    maTinhThanh: "",
    duongDanSeo: "",
    hoatDong: true,
  });

  const [errors, setErrors] = useState({});
  const [errorServer, setErrorServer] = useState("");
  const [loading, setLoading] = useState(false);

  // Cập nhật dữ liệu khi người dùng nhập
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setErrorServer("");
  };

  // Kiểm tra dữ liệu trước khi gửi
  const validateForm = () => {
    const newErrors = {};

    if (!formData.tenTinhThanh.trim()) {
      newErrors.tenTinhThanh = "Vui lòng nhập tên tỉnh thành";
    }

    if (!formData.maTinhThanh.trim()) {
      newErrors.maTinhThanh = "Vui lòng nhập mã tỉnh thành";
    }

    if (
      formData.duongDanSeo.trim() &&
      /\s/.test(formData.duongDanSeo.trim())
    ) {
      newErrors.duongDanSeo =
        "Đường dẫn SEO không được chứa khoảng trắng";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Đọc thông báo lỗi từ backend
  const readErrorMessage = async (response) => {
    const text = await response.text();

    if (!text) {
      return `Không thể thêm tỉnh thành (${response.status})`;
    }

    try {
      const data = JSON.parse(text);

      return (
        data.message ||
        data.detail ||
        data.error ||
        `Không thể thêm tỉnh thành (${response.status})`
      );
    } catch {
      return text;
    }
  };

  // Gửi dữ liệu lên backend
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrorServer("");

      const payload = {
        tenTinhThanh: formData.tenTinhThanh.trim(),
        maTinhThanh: formData.maTinhThanh.trim(),
        duongDanSeo: formData.duongDanSeo.trim() || null,
        hoatDong: formData.hoatDong,
      };

      const response = await fetch(API.TINH_THANH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      // Thông báo component cha tải lại danh sách
      onSuccess();
    } catch (error) {
      console.error("Lỗi thêm tỉnh thành:", error);

      setErrorServer(
        error.message ||
          "Có lỗi xảy ra khi thêm tỉnh thành"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="them-tinh-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <section
        className="them-tinh-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="them-tinh-title"
      >
        <div className="them-tinh-header">
          <div className="them-tinh-title-group">
            <div className="them-tinh-icon">
              <MapPinned size={23} />
            </div>

            <div>
              <h2 id="them-tinh-title">Thêm tỉnh thành</h2>
              <p>Nhập thông tin tỉnh thành mới</p>
            </div>
          </div>

          <button
            type="button"
            className="them-tinh-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="them-tinh-body">
            {errorServer && (
              <div className="them-tinh-server-error">
                {errorServer}
              </div>
            )}

            <div className="them-tinh-field">
              <label htmlFor="them-ten-tinh">
                Tên tỉnh thành <span>*</span>
              </label>

              <input
                id="them-ten-tinh"
                name="tenTinhThanh"
                type="text"
                value={formData.tenTinhThanh}
                onChange={handleChange}
                placeholder="Ví dụ: Cần Thơ"
                maxLength={255}
                autoFocus
                disabled={loading}
              />

              {errors.tenTinhThanh && (
                <small>{errors.tenTinhThanh}</small>
              )}
            </div>

            <div className="them-tinh-field">
              <label htmlFor="them-ma-tinh">
                Mã tỉnh thành <span>*</span>
              </label>

              <input
                id="them-ma-tinh"
                name="maTinhThanh"
                type="text"
                value={formData.maTinhThanh}
                onChange={handleChange}
                placeholder="Ví dụ: CT"
                maxLength={50}
                disabled={loading}
              />

              {errors.maTinhThanh && (
                <small>{errors.maTinhThanh}</small>
              )}
            </div>

            <div className="them-tinh-field">
              <label htmlFor="them-seo-tinh">
                Đường dẫn SEO
              </label>

              <input
                id="them-seo-tinh"
                name="duongDanSeo"
                type="text"
                value={formData.duongDanSeo}
                onChange={handleChange}
                placeholder="Ví dụ: can-tho"
                disabled={loading}
              />

              <span className="them-tinh-hint">
                Nên dùng chữ thường, không dấu và nối từ bằng dấu gạch ngang.
              </span>

              {errors.duongDanSeo && (
                <small>{errors.duongDanSeo}</small>
              )}
            </div>

            <label className="them-tinh-toggle">
              <input
                type="checkbox"
                name="hoatDong"
                checked={formData.hoatDong}
                onChange={handleChange}
                disabled={loading}
              />

              <span className="them-tinh-toggle-track" />

              <span className="them-tinh-toggle-content">
                <strong>Kích hoạt tỉnh thành</strong>
                <small>
                  Cho phép tỉnh thành được sử dụng trong hệ thống.
                </small>
              </span>
            </label>
          </div>

          <div className="them-tinh-footer">
            <button
              type="button"
              className="them-tinh-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="them-tinh-btn-submit"
              disabled={loading}
            >
              <Save size={17} />

              {loading ? "Đang lưu..." : "Lưu tỉnh thành"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}