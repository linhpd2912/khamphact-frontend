import { useEffect, useState } from "react";
import { X, Save, Pencil, AlertCircle } from "lucide-react";


import "./SuaPhuong.css";
import API from "../../../Api";

function docLoi(data, fallback) {
  if (!data) return fallback;

  return data.detail || data.message || data.error || fallback;
}

export default function SuaPhuong({
  phuong,
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

  // Đổ dữ liệu hiện tại vào form
  useEffect(() => {
    if (!phuong) return;

    setForm({
      tenPhuongXa: phuong.tenPhuongXa || "",
      maPhuongXa: phuong.maPhuongXa || "",
      duongDanSeo: phuong.duongDanSeo || "",
      tinhThanhId:
        phuong.tinhThanhId != null
          ? String(phuong.tinhThanhId)
          : "",
      hoatDong: phuong.hoatDong ?? true,
    });

    setError("");
  }, [phuong]);

  // Khóa cuộn trang khi mở modal
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

    if (!phuong?.id) {
      setError("Không xác định được phường/xã cần cập nhật.");
      return;
    }

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
      const response = await fetch(
        `${API.PHUONG_XA}/${phuong.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          docLoi(
            data,
            "Không thể cập nhật phường/xã. Vui lòng thử lại."
          )
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
      className="sua-phuong-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        className="sua-phuong-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sua-phuong-title"
      >
        <div className="sua-phuong-header">
          <div className="sua-phuong-header-icon">
            <Pencil size={22} />
          </div>

          <div className="sua-phuong-header-text">
            <h2 id="sua-phuong-title">Cập nhật phường/xã</h2>
            <p>
              Chỉnh sửa thông tin phường/xã #{phuong?.id}.
            </p>
          </div>

          <button
            type="button"
            className="sua-phuong-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Đóng"
          >
            <X size={21} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="sua-phuong-body">
            {error && (
              <div className="sua-phuong-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="sua-phuong-field">
              <label htmlFor="sua-ten-phuong">
                Tên phường/xã <span>*</span>
              </label>

              <input
                id="sua-ten-phuong"
                name="tenPhuongXa"
                type="text"
                value={form.tenPhuongXa}
                onChange={handleChange}
                maxLength={255}
                required
              />
            </div>

            <div className="sua-phuong-field">
              <label htmlFor="sua-ma-phuong">
                Mã phường/xã <span>*</span>
              </label>

              <input
                id="sua-ma-phuong"
                name="maPhuongXa"
                type="text"
                value={form.maPhuongXa}
                onChange={handleChange}
                maxLength={50}
                required
              />
            </div>

            <div className="sua-phuong-field">
              <label htmlFor="sua-tinh-thanh">
                Tỉnh/thành <span>*</span>
              </label>

              <select
                id="sua-tinh-thanh"
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
            </div>

            <div className="sua-phuong-field">
              <label htmlFor="sua-slug-phuong">
                Đường dẫn SEO
              </label>

              <input
                id="sua-slug-phuong"
                name="duongDanSeo"
                type="text"
                value={form.duongDanSeo}
                onChange={handleChange}
                maxLength={255}
                placeholder="Ví dụ: phuong-ninh-kieu"
              />

              <small>
                Đường dẫn SEO có thể thay đổi khi lưu. Nếu URL đã được
                Google lập chỉ mục, hãy cân nhắc giữ slug cũ.
              </small>
            </div>

            <div className="sua-phuong-field">
              <label htmlFor="sua-trang-thai-phuong">
                Trạng thái
              </label>

              <select
                id="sua-trang-thai-phuong"
                value={String(form.hoatDong)}
                onChange={handleStatusChange}
              >
                <option value="true">Đang hoạt động</option>
                <option value="false">Ngừng hoạt động</option>
              </select>
            </div>
          </div>

          <div className="sua-phuong-footer">
            <button
              type="button"
              className="sua-phuong-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="sua-phuong-btn-save"
              disabled={loading || tinhThanhList.length === 0}
            >
              <Save size={17} />
              {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}