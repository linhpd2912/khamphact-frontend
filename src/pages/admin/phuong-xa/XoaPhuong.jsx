import { useEffect, useState } from "react";
import {
  X,
  Trash2,
  AlertTriangle,
  LoaderCircle,
} from "lucide-react";


import "./XoaPhuong.css";
import API from "../../../Api";

function docLoi(data, fallback) {
  if (!data) return fallback;

  return data.detail || data.message || data.error || fallback;
}

export default function XoaPhuong({
  phuong,
  onClose,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  async function handleDelete() {
    if (!phuong?.id) {
      setError("Không xác định được phường/xã cần xóa.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API.PHUONG_XA}/${phuong.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          docLoi(
            data,
            response.status === 409
              ? "Không thể xóa vì phường/xã đang được dữ liệu khác sử dụng."
              : "Không thể xóa phường/xã. Vui lòng thử lại."
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
      className="xoa-phuong-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        className="xoa-phuong-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="xoa-phuong-title"
        aria-describedby="xoa-phuong-description"
      >
        <div className="xoa-phuong-header">
          <div className="xoa-phuong-icon">
            <Trash2 size={25} />
          </div>

          <button
            type="button"
            className="xoa-phuong-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className="xoa-phuong-body">
          <h2 id="xoa-phuong-title">Xóa phường/xã?</h2>

          <p id="xoa-phuong-description">
            Bạn có chắc chắn muốn xóa phường/xã này không? Hãy kiểm tra
            thông tin trước khi tiếp tục.
          </p>

          <div className="xoa-phuong-info">
            <div>
              <span>Tên phường/xã</span>
              <strong>{phuong?.tenPhuongXa || "Không xác định"}</strong>
            </div>

            <div>
              <span>Mã phường/xã</span>
              <strong>{phuong?.maPhuongXa || "Chưa có mã"}</strong>
            </div>

            <div>
              <span>Tỉnh/thành</span>
              <strong>{phuong?.tenTinhThanh || "Chưa xác định"}</strong>
            </div>
          </div>

          <div className="xoa-phuong-warning">
            <AlertTriangle size={18} />

            <span>
              Nếu phường/xã đang được quán ăn hoặc dữ liệu khác sử dụng,
              hệ thống có thể từ chối xóa để bảo vệ dữ liệu liên quan.
            </span>
          </div>

          {error && (
            <div className="xoa-phuong-error" role="alert">
              <AlertTriangle size={17} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="xoa-phuong-footer">
          <button
            type="button"
            className="xoa-phuong-btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>

          <button
            type="button"
            className="xoa-phuong-btn-delete"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <LoaderCircle
                size={17}
                className="xoa-phuong-spinner"
              />
            ) : (
              <Trash2 size={17} />
            )}

            {loading ? "Đang xóa..." : "Xóa phường/xã"}
          </button>
        </div>
      </div>
    </div>
  );
}