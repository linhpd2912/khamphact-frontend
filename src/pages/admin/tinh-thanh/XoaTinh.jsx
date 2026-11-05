import { useState } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";


import "./XoaTinh.css";
import API from "../../../Api";

export default function XoaTinh({ tinh, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [errorServer, setErrorServer] = useState("");

  // Đọc lỗi từ backend
  const readErrorMessage = async (response) => {
    const text = await response.text();

    if (!text) {
      return `Không thể xóa tỉnh thành (${response.status})`;
    }

    try {
      const data = JSON.parse(text);

      return (
        data.message ||
        data.detail ||
        data.error ||
        `Không thể xóa tỉnh thành (${response.status})`
      );
    } catch {
      return text;
    }
  };

  // Xác nhận xóa
  const handleDelete = async () => {
    if (!tinh?.id) {
      setErrorServer("Không xác định được tỉnh thành cần xóa");
      return;
    }

    try {
      setLoading(true);
      setErrorServer("");

      const response = await fetch(
        `${API.TINH_THANH}/${tinh.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      // Báo cho component cha biết đã xóa thành công
      onSuccess();
    } catch (error) {
      console.error("Lỗi xóa tỉnh thành:", error);

      setErrorServer(
        error.message ||
          "Có lỗi xảy ra khi xóa tỉnh thành"
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
      className="xoa-tinh-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <section
        className="xoa-tinh-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="xoa-tinh-title"
        aria-describedby="xoa-tinh-description"
      >
        <div className="xoa-tinh-header">
          <button
            type="button"
            className="xoa-tinh-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Đóng"
          >
            <X size={19} />
          </button>
        </div>

        <div className="xoa-tinh-body">
          <div className="xoa-tinh-warning-icon">
            <AlertTriangle size={29} />
          </div>

          <h2 id="xoa-tinh-title">
            Xác nhận xóa tỉnh thành
          </h2>

          <p id="xoa-tinh-description">
            Bạn có chắc chắn muốn xóa tỉnh thành này khỏi hệ thống?
            Hãy kiểm tra thông tin trước khi tiếp tục.
          </p>

          <div className="xoa-tinh-info">
            <div className="xoa-tinh-info-icon">
              <Trash2 size={20} />
            </div>

            <div className="xoa-tinh-info-content">
              <strong>{tinh.tenTinhThanh}</strong>

              <span>
                Mã tỉnh thành: {tinh.maTinhThanh || "Chưa có"}
              </span>

              <span>ID: {tinh.id}</span>
            </div>
          </div>

          {errorServer && (
            <div className="xoa-tinh-error">
              {errorServer}
            </div>
          )}

          <div className="xoa-tinh-notice">
            <AlertTriangle size={16} />

            <span>
              Không thể xóa nếu tỉnh thành đang được dữ liệu
              khác tham chiếu và cơ sở dữ liệu có ràng buộc
              khóa ngoại tương ứng.
            </span>
          </div>
        </div>

        <div className="xoa-tinh-footer">
          <button
            type="button"
            className="xoa-tinh-btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            className="xoa-tinh-btn-confirm"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 size={17} />

            {loading ? "Đang xóa..." : "Xóa tỉnh thành"}
          </button>
        </div>
      </section>
    </div>
  );
}