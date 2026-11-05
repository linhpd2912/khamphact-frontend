import { useEffect, useState } from "react";
import { X, Save, Pencil } from "lucide-react";

import "./SuaTinh.css";
import API from "../../../Api";


export default function SuaTinh({ tinh, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    tenTinhThanh: "",
    maTinhThanh: "",
    duongDanSeo: "",
    hoatDong: true,
  });

  const [errors, setErrors] = useState({});
  const [errorServer, setErrorServer] = useState("");
  const [loading, setLoading] = useState(false);

  // Nạp dữ liệu tỉnh được chọn vào form
  useEffect(() => {
    if (!tinh) {
      return;
    }

    setFormData({
      tenTinhThanh: tinh.tenTinhThanh ?? "",
      maTinhThanh: tinh.maTinhThanh ?? "",
      duongDanSeo: tinh.duongDanSeo ?? "",
      hoatDong: tinh.hoatDong ?? false,
    });

    setErrors({});
    setErrorServer("");
  }, [tinh]);

  // Cập nhật dữ liệu form
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

  // Kiểm tra dữ liệu
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

  // Đọc thông báo lỗi backend
  const readErrorMessage = async (response) => {
    const text = await response.text();

    if (!text) {
      return `Không thể cập nhật tỉnh thành (${response.status})`;
    }

    try {
      const data = JSON.parse(text);

      return (
        data.message ||
        data.detail ||
        data.error ||
        `Không thể cập nhật tỉnh thành (${response.status})`
      );
    } catch {
      return text;
    }
  };

  // Gửi yêu cầu cập nhật
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

      const response = await fetch(
        `${API.TINH_THANH}/${tinh.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      onSuccess();
    } catch (error) {
      console.error("Lỗi cập nhật tỉnh thành:", error);

      setErrorServer(
        error.message ||
          "Có lỗi xảy ra khi cập nhật tỉnh thành"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!tinh) {
    return null;
  }

  return (
    <div
      className="sua-tinh-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <section
        className="sua-tinh-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sua-tinh-title"
      >
        <div className="sua-tinh-header">
          <div className="sua-tinh-title-group">
            <div className="sua-tinh-icon">
              <Pencil size={22} />
            </div>

            <div>
              <h2 id="sua-tinh-title">Chỉnh sửa tỉnh thành</h2>

              <p>
                Cập nhật thông tin tỉnh thành #{tinh.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="sua-tinh-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="sua-tinh-body">
            {errorServer && (
              <div className="sua-tinh-server-error">
                {errorServer}
              </div>
            )}

            <div className="sua-tinh-field">
              <label htmlFor="sua-ten-tinh">
                Tên tỉnh thành <span>*</span>
              </label>

              <input
                id="sua-ten-tinh"
                name="tenTinhThanh"
                type="text"
                value={formData.tenTinhThanh}
                onChange={handleChange}
                maxLength={255}
                disabled={loading}
              />

              {errors.tenTinhThanh && (
                <small>{errors.tenTinhThanh}</small>
              )}
            </div>

            <div className="sua-tinh-field">
              <label htmlFor="sua-ma-tinh">
                Mã tỉnh thành <span>*</span>
              </label>

              <input
                id="sua-ma-tinh"
                name="maTinhThanh"
                type="text"
                value={formData.maTinhThanh}
                onChange={handleChange}
                maxLength={50}
                disabled={loading}
              />

              {errors.maTinhThanh && (
                <small>{errors.maTinhThanh}</small>
              )}
            </div>

            <div className="sua-tinh-field">
              <label htmlFor="sua-seo-tinh">
                Đường dẫn SEO
              </label>

              <input
                id="sua-seo-tinh"
                name="duongDanSeo"
                type="text"
                value={formData.duongDanSeo}
                onChange={handleChange}
                disabled={loading}
              />

              <span className="sua-tinh-hint">
                Đường dẫn nên viết thường, không dấu và dùng dấu gạch ngang.
              </span>

              {errors.duongDanSeo && (
                <small>{errors.duongDanSeo}</small>
              )}
            </div>

            <label className="sua-tinh-toggle">
              <input
                type="checkbox"
                name="hoatDong"
                checked={formData.hoatDong}
                onChange={handleChange}
                disabled={loading}
              />

              <span className="sua-tinh-toggle-track" />

              <span className="sua-tinh-toggle-content">
                <strong>Kích hoạt tỉnh thành</strong>

                <small>
                  Bật để tỉnh thành ở trạng thái hoạt động.
                </small>
              </span>
            </label>
          </div>

          <div className="sua-tinh-footer">
            <button
              type="button"
              className="sua-tinh-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="sua-tinh-btn-submit"
              disabled={loading}
            >
              <Save size={17} />

              {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}