import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Wifi,
  Snowflake,
  CarFront,
  CreditCard,
  Utensils,
  Coffee,
  Tv,
  Music,
  Armchair,
  Plug,
  Waves,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  MoreHorizontal,
  CircleAlert,
} from "lucide-react";

import {
  layTatCaTienIch,
  themTienIch,
  capNhatTienIch,
  doiTrangThaiTienIch,
  xoaTienIch,
} from "../../../services/admin/TienIchService";

import "./QuanLyTienIch.css";

// Các icon được hỗ trợ
const DANH_SACH_ICON = [
  { ten: "Wifi", Icon: Wifi },
  { ten: "Snowflake", Icon: Snowflake },
  { ten: "CarFront", Icon: CarFront },
  { ten: "CreditCard", Icon: CreditCard },
  { ten: "Utensils", Icon: Utensils },
  { ten: "Coffee", Icon: Coffee },
  { ten: "Tv", Icon: Tv },
  { ten: "Music", Icon: Music },
  { ten: "Armchair", Icon: Armchair },
  { ten: "Plug", Icon: Plug },
  { ten: "Waves", Icon: Waves },
];

const SO_LUONG_MOI_TRANG = 8;

const FORM_MAC_DINH = {
  tenTienIch: "",
  icon: "Wifi",
  hoatDong: true,
};

function layDanhSach(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  return [];
}

function layIcon(icon) {
  const ketQua = DANH_SACH_ICON.find((item) => item.ten === icon);
  return ketQua?.Icon || SlidersHorizontal;
}

function chuanHoaChuoi(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export default function QuanLyTienIch() {
  const [danhSach, setDanhSach] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);

  const [tuKhoa, setTuKhoa] = useState("");
  const [boLoc, setBoLoc] = useState("tat-ca");
  const [trangHienTai, setTrangHienTai] = useState(1);

  const [modalMo, setModalMo] = useState(false);
  const [tienIchDangSua, setTienIchDangSua] = useState(null);
  const [form, setForm] = useState(FORM_MAC_DINH);

  const [thongBao, setThongBao] = useState(null);
  const [loiForm, setLoiForm] = useState("");

  const hienThongBao = useCallback((noiDung, loai = "success") => {
    setThongBao({ noiDung, loai });

    window.setTimeout(() => {
      setThongBao(null);
    }, 3500);
  }, []);

  // Tải danh sách tiện ích
  const taiDanhSach = useCallback(async () => {
    setDangTai(true);

    try {
      const data = await layTatCaTienIch();
      setDanhSach(layDanhSach(data));
    } catch (error) {
      hienThongBao(
        error.message || "Không thể tải danh sách tiện ích.",
        "error"
      );
    } finally {
      setDangTai(false);
    }
  }, [hienThongBao]);

  useEffect(() => {
    taiDanhSach();
  }, [taiDanhSach]);

  // Thống kê
  const thongKe = useMemo(() => {
    const dangHoatDong = danhSach.filter(
      (item) => item.hoatDong === true
    ).length;

    return {
      tong: danhSach.length,
      dangHoatDong,
      ngungHoatDong: danhSach.length - dangHoatDong,
    };
  }, [danhSach]);

  // Tìm kiếm và lọc
  const danhSachLoc = useMemo(() => {
    const tuKhoaChuan = chuanHoaChuoi(tuKhoa);

    return danhSach.filter((item) => {
      const khopTuKhoa =
        chuanHoaChuoi(item.tenTienIch).includes(tuKhoaChuan) ||
        chuanHoaChuoi(item.icon).includes(tuKhoaChuan);

      const khopTrangThai =
        boLoc === "tat-ca" ||
        (boLoc === "hoat-dong" && item.hoatDong === true) ||
        (boLoc === "ngung-hoat-dong" && item.hoatDong !== true);

      return khopTuKhoa && khopTrangThai;
    });
  }, [danhSach, tuKhoa, boLoc]);

  const tongSoTrang = Math.max(
    1,
    Math.ceil(danhSachLoc.length / SO_LUONG_MOI_TRANG)
  );

  const danhSachHienThi = danhSachLoc.slice(
    (trangHienTai - 1) * SO_LUONG_MOI_TRANG,
    trangHienTai * SO_LUONG_MOI_TRANG
  );

  useEffect(() => {
    setTrangHienTai((trang) => Math.min(trang, tongSoTrang));
  }, [tongSoTrang]);

  // Mở form thêm mới
  const moFormThem = () => {
    setTienIchDangSua(null);
    setForm({ ...FORM_MAC_DINH });
    setLoiForm("");
    setModalMo(true);
  };

  // Mở form chỉnh sửa
  const moFormSua = (item) => {
    setTienIchDangSua(item);

    setForm({
      tenTienIch: item.tenTienIch || "",
      icon: item.icon || "Wifi",
      hoatDong: item.hoatDong ?? true,
    });

    setLoiForm("");
    setModalMo(true);
  };

  const dongModal = () => {
    if (dangLuu) return;

    setModalMo(false);
    setTienIchDangSua(null);
    setForm({ ...FORM_MAC_DINH });
    setLoiForm("");
  };

  const capNhatForm = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Thêm hoặc cập nhật
  const xuLyLuu = async (event) => {
    event.preventDefault();
    setLoiForm("");

    const tenTienIch = form.tenTienIch.trim();

    if (!tenTienIch) {
      setLoiForm("Vui lòng nhập tên tiện ích.");
      return;
    }

    if (tenTienIch.length > 255) {
      setLoiForm("Tên tiện ích không được vượt quá 255 ký tự.");
      return;
    }

    if (form.icon && form.icon.length > 100) {
      setLoiForm("Tên icon không được vượt quá 100 ký tự.");
      return;
    }

    const duLieu = {
      tenTienIch,
      icon: form.icon || null,
      hoatDong: Boolean(form.hoatDong),
    };

    setDangLuu(true);

    try {
      if (tienIchDangSua) {
        await capNhatTienIch(tienIchDangSua.id, duLieu);
        hienThongBao("Cập nhật tiện ích thành công.");
      } else {
        await themTienIch(duLieu);
        hienThongBao("Thêm tiện ích thành công.");
      }

      setModalMo(false);
      setTienIchDangSua(null);
      setForm({ ...FORM_MAC_DINH });

      await taiDanhSach();
    } catch (error) {
      setLoiForm(error.message || "Không thể lưu tiện ích.");
    } finally {
      setDangLuu(false);
    }
  };

  // Bật hoặc tắt trạng thái
  const xuLyDoiTrangThai = async (item) => {
    const trangThaiCu = item.hoatDong === true;

    const dongY = window.confirm(
      `Bạn có muốn ${trangThaiCu ? "ngừng hoạt động" : "kích hoạt"} tiện ích "${item.tenTienIch}" không?`
    );

    if (!dongY) return;

    try {
      await doiTrangThaiTienIch(item.id);
      hienThongBao(
        trangThaiCu
          ? "Đã ngừng hoạt động tiện ích."
          : "Đã kích hoạt tiện ích."
      );

      await taiDanhSach();
    } catch (error) {
      hienThongBao(
        error.message || "Không thể thay đổi trạng thái.",
        "error"
      );
    }
  };

  // Xóa tiện ích
  const xuLyXoa = async (item) => {
    const dongY = window.confirm(
      `Bạn có chắc muốn xóa tiện ích "${item.tenTienIch}" không?`
    );

    if (!dongY) return;

    try {
      await xoaTienIch(item.id);
      hienThongBao("Xóa tiện ích thành công.");
      await taiDanhSach();
    } catch (error) {
      hienThongBao(
        error.message ||
          "Không thể xóa tiện ích. Có thể tiện ích đang được quán sử dụng.",
        "error"
      );
    }
  };

  const IconDangChon = layIcon(form.icon);

  return (
    <div className="qti-page">
      {/* Tiêu đề */}
      <div className="qti-heading">
        <div className="qti-heading-content">
          <div className="qti-eyebrow">QUẢN LÝ DỮ LIỆU</div>

          <h1>Tiện ích</h1>

          <p>
            Quản lý những tiện ích mà các địa điểm ăn uống đang cung cấp.
          </p>
        </div>

        <button className="qti-add-button" onClick={moFormThem}>
          <Plus size={18} strokeWidth={2.4} />
          <span>Thêm tiện ích</span>
        </button>
      </div>

      {/* Thống kê dạng chữ, không dùng card */}
      <div className="qti-overview">
        <div className="qti-overview-item">
          <span className="qti-overview-label">Tổng tiện ích</span>
          <strong>{thongKe.tong}</strong>
        </div>

        <div className="qti-overview-item qti-overview-active">
          <span className="qti-overview-label">Đang hoạt động</span>
          <strong>{thongKe.dangHoatDong}</strong>
        </div>

        <div className="qti-overview-item qti-overview-inactive">
          <span className="qti-overview-label">Ngừng hoạt động</span>
          <strong>{thongKe.ngungHoatDong}</strong>
        </div>
      </div>

      {/* Thanh công cụ */}
      <div className="qti-toolbar">
        <div className="qti-search">
          <Search size={18} />

          <input
            type="text"
            value={tuKhoa}
            placeholder="Tìm theo tên tiện ích hoặc icon..."
            onChange={(event) => {
              setTuKhoa(event.target.value);
              setTrangHienTai(1);
            }}
          />

          {tuKhoa && (
            <button
              type="button"
              className="qti-clear-search"
              aria-label="Xóa từ khóa"
              onClick={() => setTuKhoa("")}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="qti-filter">
          <SlidersHorizontal size={16} />

          <select
            value={boLoc}
            onChange={(event) => {
              setBoLoc(event.target.value);
              setTrangHienTai(1);
            }}
            aria-label="Lọc trạng thái tiện ích"
          >
            <option value="tat-ca">Tất cả trạng thái</option>
            <option value="hoat-dong">Đang hoạt động</option>
            <option value="ngung-hoat-dong">Ngừng hoạt động</option>
          </select>
        </div>

        <button
          type="button"
          className="qti-refresh-button"
          onClick={taiDanhSach}
          disabled={dangTai}
          title="Tải lại danh sách"
        >
          <RefreshCw
            size={17}
            className={dangTai ? "qti-spinning" : ""}
          />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Danh sách dòng, không phải bảng hoặc card */}
      <div className="qti-list">
        <div className="qti-list-heading">
          <span>TIỆN ÍCH</span>
          <span>TRẠNG THÁI</span>
          <span className="qti-action-heading">THAO TÁC</span>
        </div>

        {dangTai ? (
          <div className="qti-state">
            <RefreshCw className="qti-spinning" size={22} />
            <span>Đang tải danh sách tiện ích...</span>
          </div>
        ) : danhSachHienThi.length === 0 ? (
          <div className="qti-empty">
            <div className="qti-empty-icon">
              <CircleAlert size={25} />
            </div>

            <h3>
              {tuKhoa || boLoc !== "tat-ca"
                ? "Không tìm thấy tiện ích"
                : "Chưa có tiện ích nào"}
            </h3>

            <p>
              {tuKhoa || boLoc !== "tat-ca"
                ? "Hãy thử từ khóa khác hoặc thay đổi bộ lọc."
                : "Thêm tiện ích đầu tiên để bắt đầu quản lý."}
            </p>

            {!tuKhoa && boLoc === "tat-ca" && (
              <button
                type="button"
                className="qti-empty-button"
                onClick={moFormThem}
              >
                <Plus size={16} />
                Thêm tiện ích
              </button>
            )}
          </div>
        ) : (
          danhSachHienThi.map((item, index) => {
            const Icon = layIcon(item.icon);
            const dangHoatDong = item.hoatDong === true;

            return (
              <div
                className="qti-row"
                key={item.id}
                style={{ "--qti-row-index": index }}
              >
                <div className="qti-main-info">
                  <div className="qti-icon">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>

                  <div className="qti-name-group">
                    <span className="qti-name">
                      {item.tenTienIch}
                    </span>

                    <span className="qti-subtitle">
                      {item.icon || "Chưa chọn icon"}
                      <span className="qti-dot">·</span>
                      ID {item.id}
                    </span>
                  </div>
                </div>

                <div className="qti-status-area">
                  <button
                    type="button"
                    className={`qti-status ${dangHoatDong ? "is-active" : "is-inactive"}`}
                    onClick={() => xuLyDoiTrangThai(item)}
                    title="Nhấn để thay đổi trạng thái"
                  >
                    <span className="qti-status-dot" />
                    {dangHoatDong
                      ? "Đang hoạt động"
                      : "Ngừng hoạt động"}
                  </button>
                </div>

                <div className="qti-actions">
                  <button
                    type="button"
                    className="qti-icon-button qti-edit"
                    title="Chỉnh sửa"
                    aria-label={`Sửa ${item.tenTienIch}`}
                    onClick={() => moFormSua(item)}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    className="qti-icon-button qti-delete"
                    title="Xóa tiện ích"
                    aria-label={`Xóa ${item.tenTienIch}`}
                    onClick={() => xuLyXoa(item)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Phân trang */}
      {!dangTai && danhSachLoc.length > 0 && (
        <div className="qti-pagination">
          <span className="qti-pagination-info">
            Hiển thị{" "}
            <strong>
              {(trangHienTai - 1) * SO_LUONG_MOI_TRANG + 1}
            </strong>
            {" – "}
            <strong>
              {Math.min(
                trangHienTai * SO_LUONG_MOI_TRANG,
                danhSachLoc.length
              )}
            </strong>
            {" trong "}
            <strong>{danhSachLoc.length}</strong> tiện ích
          </span>

          <div className="qti-pagination-controls">
            <button
              type="button"
              disabled={trangHienTai <= 1}
              onClick={() =>
                setTrangHienTai((trang) => Math.max(1, trang - 1))
              }
              aria-label="Trang trước"
            >
              <ChevronLeft size={17} />
            </button>

            <span>
              {trangHienTai} / {tongSoTrang}
            </span>

            <button
              type="button"
              disabled={trangHienTai >= tongSoTrang}
              onClick={() =>
                setTrangHienTai((trang) =>
                  Math.min(tongSoTrang, trang + 1)
                )
              }
              aria-label="Trang tiếp theo"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}

      {/* Modal thêm / sửa */}
      {modalMo && (
        <div
          className="qti-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              dongModal();
            }
          }}
        >
          <div
            className="qti-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qti-modal-title"
          >
            <div className="qti-modal-header">
              <div>
                <span className="qti-modal-eyebrow">
                  THIẾT LẬP TIỆN ÍCH
                </span>

                <h2 id="qti-modal-title">
                  {tienIchDangSua
                    ? "Chỉnh sửa tiện ích"
                    : "Thêm tiện ích mới"}
                </h2>

                <p>
                  Nhập thông tin và chọn icon phù hợp.
                </p>
              </div>

              <button
                type="button"
                className="qti-modal-close"
                onClick={dongModal}
                disabled={dangLuu}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={xuLyLuu}>
              <div className="qti-modal-body">
                <label className="qti-field-label" htmlFor="qti-ten">
                  Tên tiện ích <span>*</span>
                </label>

                <input
                  id="qti-ten"
                  name="tenTienIch"
                  type="text"
                  className="qti-text-input"
                  placeholder="Ví dụ: Wi-Fi miễn phí"
                  value={form.tenTienIch}
                  onChange={capNhatForm}
                  maxLength={255}
                  autoFocus
                  required
                />

                <div className="qti-field-meta">
                  <span>Tên hiển thị trên thông tin quán.</span>
                  <span>{form.tenTienIch.length}/255</span>
                </div>

                <label className="qti-field-label qti-icon-label">
                  Chọn biểu tượng
                </label>

                <div className="qti-icon-preview">
                  <div className="qti-icon-preview-symbol">
                    <IconDangChon size={24} />
                  </div>

                  <div>
                    <strong>{form.icon}</strong>
                    <span>Biểu tượng đại diện cho tiện ích</span>
                  </div>
                </div>

                <div className="qti-icon-picker">
                  {DANH_SACH_ICON.map(({ ten, Icon }) => (
                    <button
                      key={ten}
                      type="button"
                      className={`qti-icon-option ${form.icon === ten ? "selected" : ""}`}
                      onClick={() =>
                        setForm((prev) => ({ ...prev, icon: ten }))
                      }
                      title={ten}
                      aria-label={`Chọn icon ${ten}`}
                      aria-pressed={form.icon === ten}
                    >
                      <Icon size={21} />
                      <span>{ten}</span>
                      {form.icon === ten && (
                        <Check className="qti-icon-check" size={13} />
                      )}
                    </button>
                  ))}
                </div>

                <label className="qti-field-label qti-status-label">
                  Trạng thái
                </label>

                <label className="qti-toggle-line">
                  <span className="qti-toggle-copy">
                    <strong>
                      {form.hoatDong
                        ? "Đang hoạt động"
                        : "Ngừng hoạt động"}
                    </strong>

                    <span>
                      {form.hoatDong
                        ? "Có thể sử dụng để gán cho quán."
                        : "Không thể gán mới cho quán."}
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={Boolean(form.hoatDong)}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        hoatDong: event.target.checked,
                      }))
                    }
                  />

                  <span className="qti-toggle-slider" />
                </label>

                {loiForm && (
                  <div className="qti-form-error">
                    <CircleAlert size={16} />
                    <span>{loiForm}</span>
                  </div>
                )}
              </div>

              <div className="qti-modal-footer">
                <button
                  type="button"
                  className="qti-cancel-button"
                  onClick={dongModal}
                  disabled={dangLuu}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="qti-save-button"
                  disabled={dangLuu}
                >
                  {dangLuu ? (
                    <>
                      <RefreshCw className="qti-spinning" size={16} />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Check size={17} />
                      {tienIchDangSua
                        ? "Lưu thay đổi"
                        : "Tạo tiện ích"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thông báo */}
      {thongBao && (
        <div
          className={`qti-toast ${thongBao.loai === "error" ? "qti-toast-error" : "qti-toast-success"}`}
          role="status"
        >
          {thongBao.loai === "error" ? (
            <CircleAlert size={18} />
          ) : (
            <Check size={18} />
          )}

          <span>{thongBao.noiDung}</span>

          <button
            type="button"
            onClick={() => setThongBao(null)}
            aria-label="Đóng thông báo"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}