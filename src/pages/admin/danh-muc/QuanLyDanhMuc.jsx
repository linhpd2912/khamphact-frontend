import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import "./QuanLyDanhMuc.css";
import {
  capNhatNoiBatDanhMuc,
  capNhatTrangThaiDanhMuc,
  layDanhSachDanhMuc,
  suaDanhMuc,
  themDanhMuc,
  timKiemDanhMuc,
  xoaDanhMuc
} from "../../../services/admin/DanhMucService";

const FORM_MAC_DINH = {
  tenDanhMuc: "",
  duongDanSeo: "",
  moTa: "",
  icon: "",
  thuTuHienThi: 0,
  noiBat: false,
  hoatDong: true,
};

function taoSlug(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function QuanLyDanhMuc() {
  const [danhSach, setDanhSach] = useState([]);

  const [tuKhoa, setTuKhoa] = useState("");
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");

  const [trangHienTai, setTrangHienTai] = useState(0);
  const [tongSoTrang, setTongSoTrang] = useState(0);
  const [tongSoDanhMuc, setTongSoDanhMuc] = useState(0);

  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);

  const [moForm, setMoForm] = useState(false);
  const [danhMucDangSua, setDanhMucDangSua] = useState(null);
  const [formData, setFormData] = useState(FORM_MAC_DINH);

  const [loi, setLoi] = useState("");
  const [thongBao, setThongBao] = useState("");

  const kichThuocTrang = 10;

  // Tải danh sách từ Backend
  const taiDanhSach = useCallback(async () => {
    setDangTai(true);
    setLoi("");

    try {
      const data = tuKhoaTimKiem.trim()
        ? await timKiemDanhMuc(
          tuKhoaTimKiem,
          trangHienTai,
          kichThuocTrang
        )
        : await layDanhSachDanhMuc(
          trangHienTai,
          kichThuocTrang
        );

      setDanhSach(data?.content ?? []);
      setTongSoTrang(data?.totalPages ?? 0);
      setTongSoDanhMuc(data?.totalElements ?? 0);
    } catch (error) {
      setDanhSach([]);
      setTongSoTrang(0);
      setTongSoDanhMuc(0);
      setLoi(error.message || "Không thể tải danh sách danh mục.");
    } finally {
      setDangTai(false);
    }
  }, [tuKhoaTimKiem, trangHienTai]);

  useEffect(() => {
    taiDanhSach();
  }, [taiDanhSach]);

  // Tự ẩn thông báo sau một khoảng thời gian
  useEffect(() => {
    if (!thongBao) return;

    const timer = setTimeout(() => {
      setThongBao("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [thongBao]);

  // Tìm kiếm
  function xuLyTimKiem(event) {
    event.preventDefault();

    setTrangHienTai(0);
    setTuKhoaTimKiem(tuKhoa.trim());
  }

  // Mở form thêm mới
  function moFormThem() {
    setDanhMucDangSua(null);
    setFormData({ ...FORM_MAC_DINH });
    setMoForm(true);
    setLoi("");
  }

  // Mở form sửa
  function moFormSua(danhMuc) {
    setDanhMucDangSua(danhMuc);

    setFormData({
      tenDanhMuc: danhMuc.tenDanhMuc ?? "",
      duongDanSeo: danhMuc.duongDanSeo ?? "",
      moTa: danhMuc.moTa ?? "",
      icon: danhMuc.icon ?? "",
      thuTuHienThi: danhMuc.thuTuHienThi ?? 0,
      noiBat: danhMuc.noiBat ?? false,
      hoatDong: danhMuc.hoatDong ?? true,
    });

    setMoForm(true);
    setLoi("");
  }

  // Thay đổi giá trị input
  function xuLyThayDoi(event) {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "thuTuHienThi"
            ? value
            : value,
    }));
  }

  // Lưu danh mục
  async function xuLyLuu(event) {
    event.preventDefault();
    setLoi("");

    const tenDanhMuc = formData.tenDanhMuc.trim();

    if (!tenDanhMuc) {
      setLoi("Vui lòng nhập tên danh mục.");
      return;
    }

    const thuTu = Number(formData.thuTuHienThi);

    if (!Number.isInteger(thuTu) || thuTu < 0) {
      setLoi("Thứ tự hiển thị phải là số nguyên không âm.");
      return;
    }

    const duongDanSeoNhap = formData.duongDanSeo.trim();

    const dataGuiDi = {
      tenDanhMuc,
      duongDanSeo: duongDanSeoNhap
        ? taoSlug(duongDanSeoNhap)
        : "",
      moTa: formData.moTa.trim(),
      icon: formData.icon.trim(),
      thuTuHienThi: thuTu,
      noiBat: Boolean(formData.noiBat),
      hoatDong: Boolean(formData.hoatDong),
    };

    setDangLuu(true);

    try {
      if (danhMucDangSua) {
        await suaDanhMuc(danhMucDangSua.id, dataGuiDi);
        setThongBao("Cập nhật danh mục thành công.");
      } else {
        await themDanhMuc(dataGuiDi);
        setThongBao("Thêm danh mục thành công.");
      }

      setMoForm(false);
      setFormData({ ...FORM_MAC_DINH });
      setDanhMucDangSua(null);

      // Trở về trang đầu để thấy dữ liệu mới
      setTrangHienTai(0);

      // Nếu đang ở trang đầu, useEffect sẽ không chạy lại
      // nên cần tải lại dữ liệu trực tiếp trong trường hợp này.
      if (trangHienTai === 0) {
        await taiDanhSach();
      }
    } catch (error) {
      setLoi(error.message || "Không thể lưu danh mục.");
    } finally {
      setDangLuu(false);
    }
  }

  // Xóa danh mục
  async function xuLyXoa(danhMuc) {
    const dongY = window.confirm(
      `Bạn có chắc chắn muốn xóa danh mục "${danhMuc.tenDanhMuc}" không?`
    );

    if (!dongY) return;

    setLoi("");

    try {
      await xoaDanhMuc(danhMuc.id);

      setThongBao("Xóa danh mục thành công.");

      // Nếu xóa dòng cuối cùng của trang, quay lại trang trước
      if (danhSach.length === 1 && trangHienTai > 0) {
        setTrangHienTai((prev) => prev - 1);
      } else {
        await taiDanhSach();
      }
    } catch (error) {
      setLoi(
        error.message ||
        "Không thể xóa danh mục. Danh mục có thể đang được sử dụng."
      );
    }
  }

  // Bật hoặc tắt trạng thái hoạt động
  async function xuLyTrangThai(danhMuc) {
    try {
      await capNhatTrangThaiDanhMuc(
        danhMuc.id,
        !danhMuc.hoatDong
      );

      setThongBao(
        danhMuc.hoatDong
          ? "Đã tắt hoạt động danh mục."
          : "Đã bật hoạt động danh mục."
      );

      await taiDanhSach();
    } catch (error) {
      setLoi(error.message || "Không thể cập nhật trạng thái.");
    }
  }

  // Bật hoặc tắt nổi bật
  async function xuLyNoiBat(danhMuc) {
    try {
      await capNhatNoiBatDanhMuc(
        danhMuc.id,
        !danhMuc.noiBat
      );

      setThongBao(
        danhMuc.noiBat
          ? "Đã bỏ đánh dấu nổi bật."
          : "Đã đánh dấu danh mục nổi bật."
      );

      await taiDanhSach();
    } catch (error) {
      setLoi(error.message || "Không thể cập nhật danh mục nổi bật.");
    }
  }

  return (
    <div className="dm-page">
      {/* Tiêu đề */}
      <div className="dm-heading">
        <div className="dm-heading-text">
          <span className="dm-eyebrow">QUẢN LÝ NỘI DUNG</span>

          <h1>Danh mục</h1>

          <p>
            Quản lý các danh mục địa điểm ăn uống trên website.
          </p>
        </div>

        <button
          type="button"
          className="dm-button dm-button-primary"
          onClick={moFormThem}
        >
          <Plus size={18} />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* Thông báo */}
      {thongBao && (
        <div className="dm-notice dm-notice-success">
          <CheckCircle2 size={18} />
          <span>{thongBao}</span>

          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={() => setThongBao("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {loi && !moForm && (
        <div className="dm-notice dm-notice-error">
          <AlertCircle size={18} />
          <span>{loi}</span>

          <button
            type="button"
            aria-label="Đóng thông báo lỗi"
            onClick={() => setLoi("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Thanh tìm kiếm và thống kê */}
      <div className="dm-toolbar">
        <form className="dm-search" onSubmit={xuLyTimKiem}>
          <Search size={19} />

          <input
            type="search"
            placeholder="Tìm tên, mô tả hoặc đường dẫn SEO..."
            value={tuKhoa}
            onChange={(event) => setTuKhoa(event.target.value)}
          />

          {tuKhoa && (
            <button
              type="button"
              className="dm-search-clear"
              aria-label="Xóa từ khóa"
              onClick={() => {
                setTuKhoa("");
                setTuKhoaTimKiem("");
                setTrangHienTai(0);
              }}
            >
              <X size={16} />
            </button>
          )}

          <button type="submit" className="dm-search-button">
            Tìm kiếm
          </button>
        </form>

        <div className="dm-total">
          <FolderOpen size={19} />

          <span>
            Tổng số: <strong>{tongSoDanhMuc}</strong> danh mục
          </span>
        </div>
      </div>

      {/* Danh sách dạng dòng, không dùng table hoặc card */}
      <section className="dm-list-section">
        <div className="dm-list-heading">
          <div>
            <h2>Danh sách danh mục</h2>
            <p>Thông tin và thao tác quản lý từng danh mục.</p>
          </div>

          <button
            type="button"
            className="dm-refresh-button"
            onClick={taiDanhSach}
            disabled={dangTai}
            title="Tải lại danh sách"
          >
            <RefreshCw
              size={17}
              className={dangTai ? "dm-spinning" : ""}
            />
            <span>Làm mới</span>
          </button>
        </div>

        {dangTai ? (
          <div className="dm-state">
            <RefreshCw className="dm-spinning" size={25} />
            <p>Đang tải danh sách danh mục...</p>
          </div>
        ) : loi && danhSach.length === 0 ? (
          <div className="dm-state dm-state-error">
            <AlertCircle size={28} />
            <p>Không tải được danh sách danh mục.</p>
            <button
              type="button"
              className="dm-button dm-button-outline"
              onClick={taiDanhSach}
            >
              Thử lại
            </button>
          </div>
        ) : danhSach.length === 0 ? (
          <div className="dm-state">
            <FolderOpen size={32} />
            <h3>Chưa có danh mục nào</h3>
            <p>
              {tuKhoaTimKiem
                ? "Không tìm thấy danh mục phù hợp với từ khóa."
                : "Hãy thêm danh mục đầu tiên cho website."}
            </p>

            {!tuKhoaTimKiem && (
              <button
                type="button"
                className="dm-button dm-button-primary"
                onClick={moFormThem}
              >
                <Plus size={17} />
                Thêm danh mục
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="dm-list">
              {danhSach.map((danhMuc, index) => (
                <div className="dm-row" key={danhMuc.id}>
                  <div className="dm-row-number">
                    {(trangHienTai * kichThuocTrang) + index + 1}
                  </div>

                  <div className="dm-row-icon">
                    {danhMuc.icon ? (
                      <span>{danhMuc.icon}</span>
                    ) : (
                      <FolderOpen size={21} />
                    )}
                  </div>

                  <div className="dm-row-main">
                    <div className="dm-row-title">
                      <h3>{danhMuc.tenDanhMuc}</h3>

                      {danhMuc.noiBat && (
                        <span className="dm-badge dm-badge-featured">
                          <Star size={12} fill="currentColor" />
                          Nổi bật
                        </span>
                      )}
                    </div>

                    <div className="dm-row-slug">
                      /{danhMuc.duongDanSeo || "chua-co-duong-dan"}
                    </div>

                    {danhMuc.moTa && (
                      <p className="dm-row-description">
                        {danhMuc.moTa}
                      </p>
                    )}
                  </div>

                  <div className="dm-row-order">
                    <span>Thứ tự</span>
                    <strong>{danhMuc.thuTuHienThi ?? 0}</strong>
                  </div>

                  <div className="dm-row-status">
                    <span
                      className={`dm-badge ${danhMuc.hoatDong
                        ? "dm-badge-active"
                        : "dm-badge-inactive"
                        }`}
                    >
                      {danhMuc.hoatDong
                        ? "Đang hoạt động"
                        : "Đã tắt"}
                    </span>
                  </div>

                  <div className="dm-row-actions">
                    <button
                      type="button"
                      className={`dm-icon-button ${danhMuc.noiBat ? "is-featured" : ""
                        }`}
                      title={
                        danhMuc.noiBat
                          ? "Bỏ đánh dấu nổi bật"
                          : "Đánh dấu nổi bật"
                      }
                      aria-label={
                        danhMuc.noiBat
                          ? "Bỏ đánh dấu nổi bật"
                          : "Đánh dấu nổi bật"
                      }
                      onClick={() => xuLyNoiBat(danhMuc)}
                    >
                      <Star
                        size={17}
                        fill={
                          danhMuc.noiBat ? "currentColor" : "none"
                        }
                      />
                    </button>

                    <button
                      type="button"
                      className="dm-icon-button"
                      title={
                        danhMuc.hoatDong
                          ? "Tắt hoạt động"
                          : "Bật hoạt động"
                      }
                      aria-label={
                        danhMuc.hoatDong
                          ? "Tắt hoạt động"
                          : "Bật hoạt động"
                      }
                      onClick={() => xuLyTrangThai(danhMuc)}
                    >
                      {danhMuc.hoatDong ? (
                        <Eye size={17} />
                      ) : (
                        <EyeOff size={17} />
                      )}
                    </button>

                    <button
                      type="button"
                      className="dm-icon-button"
                      title="Sửa danh mục"
                      aria-label="Sửa danh mục"
                      onClick={() => moFormSua(danhMuc)}
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      className="dm-icon-button dm-icon-danger"
                      title="Xóa danh mục"
                      aria-label="Xóa danh mục"
                      onClick={() => xuLyXoa(danhMuc)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Phân trang */}
            <div className="dm-pagination">
              <span>
                Trang {tongSoTrang === 0 ? 0 : trangHienTai + 1}
                {" / "}
                {tongSoTrang}
              </span>

              <div className="dm-pagination-actions">
                <button
                  type="button"
                  disabled={trangHienTai <= 0 || dangTai}
                  onClick={() =>
                    setTrangHienTai((prev) => Math.max(0, prev - 1))
                  }
                >
                  Trang trước
                </button>

                <button
                  type="button"
                  disabled={
                    trangHienTai >= tongSoTrang - 1 || dangTai
                  }
                  onClick={() =>
                    setTrangHienTai((prev) => prev + 1)
                  }
                >
                  Trang sau
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Form thêm / sửa */}
      {moForm && (
        <div
          className="dm-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !dangLuu) {
              setMoForm(false);
              setLoi("");
            }
          }}
        >
          <section
            className="dm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dm-modal-title"
          >
            <div className="dm-modal-header">
              <div>
                <span className="dm-eyebrow">
                  QUẢN LÝ DANH MỤC
                </span>

                <h2 id="dm-modal-title">
                  {danhMucDangSua
                    ? "Cập nhật danh mục"
                    : "Thêm danh mục mới"}
                </h2>

                <p>
                  Nhập các thông tin cần thiết bên dưới.
                </p>
              </div>

              <button
                type="button"
                className="dm-modal-close"
                aria-label="Đóng"
                disabled={dangLuu}
                onClick={() => {
                  setMoForm(false);
                  setLoi("");
                }}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={xuLyLuu}>
              <div className="dm-form-body">
                {loi && (
                  <div className="dm-notice dm-notice-error">
                    <AlertCircle size={18} />
                    <span>{loi}</span>
                  </div>
                )}

                <div className="dm-form-group">
                  <label htmlFor="tenDanhMuc">
                    Tên danh mục <span>*</span>
                  </label>

                  <input
                    id="tenDanhMuc"
                    name="tenDanhMuc"
                    value={formData.tenDanhMuc}
                    onChange={xuLyThayDoi}
                    maxLength={255}
                    placeholder="Ví dụ: Quán cà phê"
                    required
                    autoFocus
                  />
                </div>

                <div className="dm-form-group">
                  <label htmlFor="duongDanSeo">
                    Đường dẫn SEO
                  </label>

                  <input
                    id="duongDanSeo"
                    name="duongDanSeo"
                    value={formData.duongDanSeo}
                    onChange={xuLyThayDoi}
                    maxLength={255}
                    placeholder="Ví dụ: quan-ca-phe"
                  />

                  <small>
                    Có thể để trống để Backend tự tạo đường dẫn từ tên.
                  </small>
                </div>

                <div className="dm-form-group">
                  <label htmlFor="moTa">Mô tả</label>

                  <textarea
                    id="moTa"
                    name="moTa"
                    value={formData.moTa}
                    onChange={xuLyThayDoi}
                    maxLength={1000}
                    rows={3}
                    placeholder="Nhập mô tả cho danh mục..."
                  />
                </div>

                <div className="dm-form-grid">
                  <div className="dm-form-group">
                    <label htmlFor="icon">Icon</label>

                    <input
                      id="icon"
                      name="icon"
                      value={formData.icon}
                      onChange={xuLyThayDoi}
                      maxLength={100}
                      placeholder="Ví dụ: Coffee"
                    />

                    <small>
                      Nhập tên hoặc ký hiệu icon theo quy ước dự án.
                    </small>
                  </div>

                  <div className="dm-form-group">
                    <label htmlFor="thuTuHienThi">
                      Thứ tự hiển thị
                    </label>

                    <input
                      id="thuTuHienThi"
                      name="thuTuHienThi"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.thuTuHienThi}
                      onChange={xuLyThayDoi}
                      required
                    />
                  </div>
                </div>

                <div className="dm-form-options">
                  <label className="dm-checkbox">
                    <input
                      type="checkbox"
                      name="noiBat"
                      checked={formData.noiBat}
                      onChange={xuLyThayDoi}
                    />

                    <span>
                      <strong>Danh mục nổi bật</strong>
                      <small>Đánh dấu để dễ nhận biết.</small>
                    </span>
                  </label>

                  <label className="dm-checkbox">
                    <input
                      type="checkbox"
                      name="hoatDong"
                      checked={formData.hoatDong}
                      onChange={xuLyThayDoi}
                    />

                    <span>
                      <strong>Đang hoạt động</strong>
                      <small>
                        Cho phép danh mục xuất hiện ở nơi sử dụng.
                      </small>
                    </span>
                  </label>
                </div>
              </div>

              <div className="dm-modal-footer">
                <button
                  type="button"
                  className="dm-button dm-button-outline"
                  disabled={dangLuu}
                  onClick={() => {
                    setMoForm(false);
                    setLoi("");
                  }}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="dm-button dm-button-primary"
                  disabled={dangLuu}
                >
                  {dangLuu ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="dm-spinning"
                      />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      {danhMucDangSua
                        ? "Lưu thay đổi"
                        : "Thêm danh mục"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}