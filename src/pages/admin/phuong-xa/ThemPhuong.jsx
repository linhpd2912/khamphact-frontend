import { useEffect, useState } from "react";
import { X, Save, MapPin, AlertCircle } from "lucide-react";


import "./ThemPhuong.css";
import API from "../../../Api";

function docLoi(data, fallback) {
  if (!data) return fallback;

  return data.detail || data.message || data.error || fallback;
}

export default function ThemPhuong({
  tinhThanhList = [],
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    tenPhuongXa: "",
    maPhuongXa: "",
    duongDanSeo: "",
    tinhThanhId: "",
    hoatDong: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Khóa cuộn trang khi modal mở
  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading, onClose]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  }

  function handleStatusChange(event) {
    setForm((prev) => ({
      ...prev,
      hoatDong: event.target.value === "true",
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const tenPhuongXa = form.tenPhuongXa.trim();
    const maPhuongXa = form.maPhuongXa.trim();
    const duongDanSeo = form.duongDanSeo.trim();

    if (!tenPhuongXa) {
      setError("Vui lòng nhập tên phường/xã.");
      return;
    }

    if (!maPhuongXa) {
      setError("Vui lòng nhập mã phường/xã.");
      return;
    }

    if (!form.tinhThanhId) {
      setError("Vui lòng chọn tỉnh/thành.");
      return;
    }

    if (
      duongDanSeo &&
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(duongDanSeo)
    ) {
      setError(
        "Đường dẫn SEO chỉ được chứa chữ thường, số và dấu gạch ngang."
      );
      return;
    }

    const payload = {
      tenPhuongXa,
      maPhuongXa,
      duongDanSeo: duongDanSeo || null,
      tinhThanhId: Number(form.tinhThanhId),
      hoatDong: form.hoatDong,
    };

    setLoading(true);

    try {
      const response = await fetch(API.PHUONG_XA, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          docLoi(data, "Không thể thêm phường/xã. Vui lòng thử lại.")
        );
      }

      onSuccess();
    } catch (err) {
      setError(
        err.message ||
          "Không thể kết nối máy chủ. Vui lòng kiểm tra backend."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="them-phuong-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        className="them-phuong-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="them-phuong-title"
      >
        <div className="them-phuong-header">
          <div className="them-phuong-header-icon">
            <MapPin size={23} />
          </div>

          <div className="them-phuong-header-text">
            <h2 id="them-phuong-title">Thêm phường/xã</h2>
            <p>Nhập thông tin địa chỉ hành chính mới.</p>
          </div>

          <button
            type="button"
            className="them-phuong-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Đóng"
          >
            <X size={21} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="them-phuong-body">
            {error && (
              <div className="them-phuong-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="them-phuong-field">
              <label htmlFor="them-ten-phuong">
                Tên phường/xã <span>*</span>
              </label>

              <input
                id="them-ten-phuong"
                name="tenPhuongXa"
                type="text"
                value={form.tenPhuongXa}
                onChange={handleChange}
                maxLength={255}
                placeholder="Ví dụ: Phường Ninh Kiều"
                autoFocus
                required
              />
            </div>

            <div className="them-phuong-field">
              <label htmlFor="them-ma-phuong">
                Mã phường/xã <span>*</span>
              </label>

              <input
                id="them-ma-phuong"
                name="maPhuongXa"
                type="text"
                value={form.maPhuongXa}
                onChange={handleChange}
                maxLength={50}
                placeholder="Ví dụ: PHUONG_NINH_KIEU"
                required
              />

              <small>
                Mã phải duy nhất trong danh sách phường/xã.
              </small>
            </div>

            <div className="them-phuong-field">
              <label htmlFor="them-tinh-thanh">
                Tỉnh/thành <span>*</span>
              </label>

              <select
                id="them-tinh-thanh"
                name="tinhThanhId"
                value={form.tinhThanhId}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn tỉnh/thành --</option>

                {tinhThanhList.map((tinh) => (
                  <option key={tinh.id} value={tinh.id}>
                    {tinh.tenTinhThanh}
                  </option>
                ))}
              </select>

              {tinhThanhList.length === 0 && (
                <small className="them-phuong-help-error">
                  Chưa có tỉnh/thành. Hãy tạo tỉnh/thành trước.
                </small>
              )}
            </div>

            <div className="them-phuong-field">
              <label htmlFor="them-slug-phuong">
                Đường dẫn SEO
              </label>

              <input
                id="them-slug-phuong"
                name="duongDanSeo"
                type="text"
                value={form.duongDanSeo}
                onChange={handleChange}
                maxLength={255}
                placeholder="Ví dụ: phuong-ninh-kieu"
              />

              <small>
                Để trống nếu muốn backend tự tạo đường dẫn từ tên.
              </small>
            </div>

            <div className="them-phuong-field">
              <label htmlFor="them-trang-thai-phuong">
                Trạng thái
              </label>

              <select
                id="them-trang-thai-phuong"
                value={String(form.hoatDong)}
                onChange={handleStatusChange}
              >
                <option value="true">Đang hoạt động</option>
                <option value="false">Ngừng hoạt động</option>
              </select>
            </div>
          </div>

          <div className="them-phuong-footer">
            <button
              type="button"
              className="them-phuong-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="them-phuong-btn-save"
              disabled={loading || tinhThanhList.length === 0}
            >
              <Save size={17} />
              {loading ? "Đang lưu..." : "Lưu phường/xã"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}