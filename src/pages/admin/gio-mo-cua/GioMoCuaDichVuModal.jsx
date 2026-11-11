import { useCallback, useEffect, useState } from "react";
import {
  X,
  Clock3,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

import gioMoCuaDichVuService from "../../../services/admin/dich-vu/GioMoCuaDichVuService";
import "./GioMoCuaModal.css";

const CAC_THU = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 7, label: "Chủ nhật" },
];

const taoFormMacDinh = (dichVuId, thu = 1) => ({
  dichVuId,
  thu,
  gioMo: "07:00",
  gioDong: "21:00",
  nghi: false,
  ghiChu: "",
});

function chuanHoaGio(gio) {
  if (!gio) return "";
  return String(gio).slice(0, 5);
}

function hienThiKhungGio(item) {
  if (item.nghi) {
    return "Nghỉ cả ngày";
  }

  const gioMo = chuanHoaGio(item.gioMo);
  const gioDong = chuanHoaGio(item.gioDong);

  if (!gioMo || !gioDong) {
    return "Chưa đủ thông tin giờ";
  }

  if (gioDong < gioMo) {
    return `${gioMo} – ${gioDong} (qua đêm)`;
  }

  return `${gioMo} – ${gioDong}`;
}

function GioMoCuaDichVuModal({ dichVu, onClose }) {
  const [danhSach, setDanhSach] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");
  const [thongBao, setThongBao] = useState("");

  const [dangSua, setDangSua] = useState(null);
  const [hienForm, setHienForm] = useState(false);

  const [form, setForm] = useState(
    taoFormMacDinh(dichVu.id)
  );

  const dichVuNgungHoatDong = dichVu.hoatDong === false;

  // Tải giờ mở cửa của dịch vụ
  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    setLoi("");
    setThongBao("");

    try {
      const data =
        await gioMoCuaDichVuService.layTheoDichVu(dichVu.id);

      setDanhSach(Array.isArray(data) ? data : []);
    } catch (error) {
      setLoi(error.message || "Không tải được giờ mở cửa.");
    } finally {
      setDangTai(false);
    }
  }, [dichVu.id]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  // Đóng bằng phím Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !dangLuu) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, dangLuu]);

  // Tìm bản ghi theo thứ
  const timBanGhiTheoThu = (thu) => {
    return danhSach.find(
      (item) => Number(item.thu) === Number(thu)
    );
  };

  // Mở form thêm
  const moFormThem = (thu) => {
    if (dichVuNgungHoatDong) return;

    setDangSua(null);
    setForm(taoFormMacDinh(dichVu.id, thu));
    setLoi("");
    setThongBao("");
    setHienForm(true);
  };

  // Mở form sửa
  const moFormSua = (item) => {
    if (dichVuNgungHoatDong) return;

    setDangSua(item.id);

    setForm({
      dichVuId: dichVu.id,
      thu: Number(item.thu),
      gioMo: chuanHoaGio(item.gioMo) || "07:00",
      gioDong: chuanHoaGio(item.gioDong) || "21:00",
      nghi: Boolean(item.nghi),
      ghiChu: item.ghiChu || "",
    });

    setLoi("");
    setThongBao("");
    setHienForm(true);
  };

  // Đóng form
  const dongForm = () => {
    if (dangLuu) return;

    setHienForm(false);
    setDangSua(null);
    setForm(taoFormMacDinh(dichVu.id));
    setLoi("");
  };

  // Thay đổi dữ liệu form
  const capNhatForm = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Kiểm tra dữ liệu
  const kiemTraForm = () => {
    if (!form.thu || form.thu < 1 || form.thu > 7) {
      return "Vui lòng chọn thứ trong tuần.";
    }

    if (!form.nghi) {
      if (!form.gioMo || !form.gioDong) {
        return "Vui lòng nhập cả giờ mở và giờ đóng.";
      }

      if (form.gioMo === form.gioDong) {
        return "Giờ mở không được trùng giờ đóng.";
      }
    }

    if (form.ghiChu.length > 500) {
      return "Ghi chú không được vượt quá 500 ký tự.";
    }

    return "";
  };

  // Thêm hoặc cập nhật giờ mở cửa
  const xuLyLuu = async (event) => {
    event.preventDefault();

    setLoi("");
    setThongBao("");

    if (dichVuNgungHoatDong) {
      setLoi(
        "Dịch vụ đã ngừng hoạt động. Không thể thêm hoặc sửa giờ mở cửa."
      );
      return;
    }

    const loiForm = kiemTraForm();

    if (loiForm) {
      setLoi(loiForm);
      return;
    }

    const payload = {
      dichVuId: Number(dichVu.id),
      thu: Number(form.thu),

      gioMo: form.nghi
        ? null
        : `${form.gioMo}:00`,

      gioDong: form.nghi
        ? null
        : `${form.gioDong}:00`,

      nghi: Boolean(form.nghi),
      ghiChu: form.ghiChu.trim() || null,
    };

    setDangLuu(true);

    try {
      if (dangSua !== null) {
        await gioMoCuaDichVuService.capNhat(
          dangSua,
          payload
        );

        setThongBao("Cập nhật giờ mở cửa thành công.");
      } else {
        await gioMoCuaDichVuService.them(payload);

        setThongBao("Thêm giờ mở cửa thành công.");
      }

      setHienForm(false);
      setDangSua(null);

      await taiDuLieu();
    } catch (error) {
      setLoi(error.message || "Không thể lưu giờ mở cửa.");
    } finally {
      setDangLuu(false);
    }
  };

  // Xóa giờ mở cửa
  const xuLyXoa = async (item) => {
    const tenThu =
      CAC_THU.find(
        (thu) => thu.value === Number(item.thu)
      )?.label || `Thứ ${item.thu}`;

    const dongY = window.confirm(
      `Bạn có chắc muốn xóa giờ mở cửa ${tenThu} của dịch vụ "${dichVu.tenDichVu}" không?`
    );

    if (!dongY) return;

    setLoi("");
    setThongBao("");
    setDangLuu(true);

    try {
      await gioMoCuaDichVuService.xoa(item.id);

      setDanhSach((prev) =>
        prev.filter((gio) => gio.id !== item.id)
      );

      setThongBao("Xóa giờ mở cửa thành công.");

      if (dangSua === item.id) {
        setHienForm(false);
        setDangSua(null);
      }
    } catch (error) {
      setLoi(error.message || "Không thể xóa giờ mở cửa.");
    } finally {
      setDangLuu(false);
    }
  };

  const soNgayDaThietLap = danhSach.length;
  const soNgayHoatDong = danhSach.filter(
    (item) => !item.nghi
  ).length;
  const soNgayNghi = danhSach.filter(
    (item) => item.nghi
  ).length;

  return (
    <div
      className="gio-mo-cua-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !dangLuu
        ) {
          onClose();
        }
      }}
    >
      <section
        className="gio-mo-cua-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gio-mo-cua-title"
      >
        {/* Header */}
        <div className="gio-mo-cua-header">
          <div className="gio-mo-cua-header-icon">
            <Clock3 size={24} />
          </div>

          <div className="gio-mo-cua-header-content">
            <h2 id="gio-mo-cua-title">
              Giờ mở cửa dịch vụ
            </h2>

            <p>{dichVu.tenDichVu}</p>
          </div>

          <button
            type="button"
            className="gio-mo-cua-icon-button"
            onClick={onClose}
            disabled={dangLuu}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className="gio-mo-cua-body">
          {/* Thống kê */}
          <div className="gio-mo-cua-summary">
            <div className="gio-mo-cua-summary-icon">
              <CalendarDays size={22} />
            </div>

            <div>
              <strong>{soNgayDaThietLap}/7</strong>
              <span>Ngày đã thiết lập</span>
            </div>

            <div>
              <strong>{soNgayHoatDong}</strong>
              <span>Ngày hoạt động</span>
            </div>

            <div>
              <strong>{soNgayNghi}</strong>
              <span>Ngày nghỉ</span>
            </div>

            <button
              type="button"
              className="gio-mo-cua-refresh"
              onClick={taiDuLieu}
              disabled={dangTai || dangLuu}
              title="Tải lại dữ liệu"
            >
              <RefreshCw
                size={17}
                className={dangTai ? "gio-mo-cua-spin" : ""}
              />
            </button>
          </div>

          {dichVuNgungHoatDong && (
            <div className="gio-mo-cua-alert gio-mo-cua-alert-error">
              Dịch vụ đã ngừng hoạt động. Bạn chỉ có thể xem hoặc xóa giờ mở cửa.
            </div>
          )}

          {loi && (
            <div
              className="gio-mo-cua-alert gio-mo-cua-alert-error"
              role="alert"
            >
              {loi}
            </div>
          )}

          {thongBao && (
            <div
              className="gio-mo-cua-alert gio-mo-cua-alert-success"
              role="status"
            >
              {thongBao}
            </div>
          )}

          {/* Danh sách 7 ngày */}
          {dangTai ? (
            <div className="gio-mo-cua-loading">
              <span className="gio-mo-cua-loader" />
              <p>Đang tải lịch hoạt động...</p>
            </div>
          ) : (
            <div className="gio-mo-cua-days">
              {CAC_THU.map((thu) => {
                const item = timBanGhiTheoThu(thu.value);

                return (
                  <article
                    className={`gio-mo-cua-day ${
                      item
                        ? item.nghi
                          ? "is-closed"
                          : "is-open"
                        : "is-empty"
                    }`}
                    key={thu.value}
                  >
                    <div className="gio-mo-cua-day-main">
                      <div className="gio-mo-cua-day-name">
                        <span className="gio-mo-cua-day-dot" />
                        <strong>{thu.label}</strong>
                      </div>

                      <div className="gio-mo-cua-day-time">
                        {item
                          ? hienThiKhungGio(item)
                          : "Chưa thiết lập giờ"}
                      </div>

                      <span className="gio-mo-cua-status">
                        {!item
                          ? "Chưa thiết lập"
                          : item.nghi
                            ? "Nghỉ cả ngày"
                            : "Đang hoạt động"}
                      </span>

                      {item?.ghiChu && (
                        <p className="gio-mo-cua-note">
                          {item.ghiChu}
                        </p>
                      )}
                    </div>

                    <div className="gio-mo-cua-day-actions">
                      {item ? (
                        <>
                          <button
                            type="button"
                            className="gio-mo-cua-action-edit"
                            onClick={() => moFormSua(item)}
                            title={`Sửa ${thu.label}`}
                            disabled={dangLuu || dichVuNgungHoatDong}
                          >
                            <Pencil size={16} />
                            <span>Sửa</span>
                          </button>

                          <button
                            type="button"
                            className="gio-mo-cua-action-delete"
                            onClick={() => xuLyXoa(item)}
                            title={`Xóa ${thu.label}`}
                            disabled={dangLuu}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="gio-mo-cua-action-add"
                          onClick={() => moFormThem(thu.value)}
                          disabled={dangLuu || dichVuNgungHoatDong}
                        >
                          <Plus size={16} />
                          Thêm
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Form thêm / sửa */}
          {hienForm && (
            <div className="gio-mo-cua-form-wrap">
              <div className="gio-mo-cua-form-heading">
                <div>
                  <h3>
                    {dangSua !== null
                      ? "Cập nhật giờ mở cửa"
                      : "Thêm giờ mở cửa"}
                  </h3>

                  <p>
                    Chọn ngày và thiết lập thời gian hoạt động.
                  </p>
                </div>

                <button
                  type="button"
                  className="gio-mo-cua-icon-button"
                  onClick={dongForm}
                  disabled={dangLuu}
                  aria-label="Đóng biểu mẫu"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={xuLyLuu}>
                <div className="gio-mo-cua-form-grid">
                  <label className="gio-mo-cua-field">
                    <span>Thứ trong tuần *</span>

                    <select
                      name="thu"
                      value={form.thu}
                      onChange={capNhatForm}
                      required
                    >
                      {CAC_THU.map((thu) => (
                        <option
                          value={thu.value}
                          key={thu.value}
                        >
                          {thu.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="gio-mo-cua-field">
                    <span>Giờ mở cửa *</span>

                    <input
                      type="time"
                      name="gioMo"
                      value={form.gioMo}
                      onChange={capNhatForm}
                      disabled={form.nghi}
                      required={!form.nghi}
                    />
                  </label>

                  <label className="gio-mo-cua-field">
                    <span>Giờ đóng cửa *</span>

                    <input
                      type="time"
                      name="gioDong"
                      value={form.gioDong}
                      onChange={capNhatForm}
                      disabled={form.nghi}
                      required={!form.nghi}
                    />
                  </label>
                </div>

                <label className="gio-mo-cua-closed-option">
                  <input
                    type="checkbox"
                    name="nghi"
                    checked={form.nghi}
                    onChange={capNhatForm}
                  />

                  <span>
                    <strong>Nghỉ cả ngày</strong>
                    <small>
                      Không cần nhập giờ mở và giờ đóng.
                    </small>
                  </span>
                </label>

                <label className="gio-mo-cua-field">
                  <span>Ghi chú</span>

                  <textarea
                    name="ghiChu"
                    value={form.ghiChu}
                    onChange={capNhatForm}
                    maxLength={500}
                    rows={3}
                    placeholder="Ví dụ: Chỉ phục vụ buổi tối..."
                  />

                  <small className="gio-mo-cua-char-count">
                    {form.ghiChu.length}/500 ký tự
                  </small>
                </label>

                <div className="gio-mo-cua-form-footer">
                  <button
                    type="button"
                    className="gio-mo-cua-btn-cancel"
                    onClick={dongForm}
                    disabled={dangLuu}
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    className="gio-mo-cua-btn-save"
                    disabled={dangLuu}
                  >
                    {dangLuu
                      ? "Đang lưu..."
                      : dangSua !== null
                        ? "Lưu thay đổi"
                        : "Thêm giờ mở cửa"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <footer className="gio-mo-cua-footer">
          <span>
            <span className="gio-mo-cua-footer-dot" />
            Dữ liệu giờ mở cửa được lưu riêng cho dịch vụ
          </span>

          <button
            type="button"
            onClick={onClose}
            disabled={dangLuu}
          >
            Đóng
          </button>
        </footer>
      </section>
    </div>
  );
}

export default GioMoCuaDichVuModal;