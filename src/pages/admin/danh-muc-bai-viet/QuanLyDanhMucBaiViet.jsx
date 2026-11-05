import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FolderOpen,
  FolderCheck,
  FolderX,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  X,
  Save,
  RotateCcw,
  Link,
  FileText,
  GripVertical,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Eye,
} from "lucide-react";

import {
  getAll,
  create,
  update,
  updateStatus,
  updateOrder,
  checkSlug,
  remove,
} from "../../../services/admin/DanhMucBaiVietService";

import "./QuanLyDanhMucBaiViet.css";

// =====================================================
// FORM MẶC ĐỊNH
// =====================================================

const FORM_MAC_DINH = {
  tenDanhMuc: "",
  duongDanSeo: "",
  moTa: "",
  thuTu: 0,
  hoatDong: true,
};

// =====================================================
// HÀM TẠO SLUG TIẾNG VIỆT
// =====================================================

function taoSlug(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// =====================================================
// COMPONENT CHÍNH
// =====================================================

export default function QuanLyDanhMucBaiViet() {

  // Dữ liệu
  const [danhSach, setDanhSach] = useState([]);

  // Tìm kiếm và lọc
  const [tuKhoa, setTuKhoa] = useState("");
  const [trangThaiLoc, setTrangThaiLoc] = useState("tat-ca");

  // Phân trang
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [soLuongMoiTrang] = useState(8);

  // Modal
  const [moModal, setMoModal] = useState(false);
  const [dangChinhSua, setDangChinhSua] = useState(false);
  const [idDangChinhSua, setIdDangChinhSua] = useState(null);

  // Form
  const [form, setForm] = useState(FORM_MAC_DINH);

  // Slug
  const [tuDongSlug, setTuDongSlug] = useState(true);
  const [slugDaKiemTra, setSlugDaKiemTra] = useState(false);
  const [slugBiTrung, setSlugBiTrung] = useState(false);

  // Loading
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);

  // Thông báo
  const [thongBao, setThongBao] = useState(null);

  // Xác nhận xóa
  const [danhMucCanXoa, setDanhMucCanXoa] = useState(null);

  // ===================================================
  // THÔNG BÁO
  // ===================================================

  const hienThongBao = (noiDung, loai = "success") => {
    setThongBao({ noiDung, loai });

    setTimeout(() => {
      setThongBao(null);
    }, 3500);
  };

  // ===================================================
  // LẤY DANH SÁCH DANH MỤC
  // ===================================================

  const taiDanhSach = async () => {
    try {
      setDangTai(true);

      const data = await getAll();

      setDanhSach(Array.isArray(data) ? data : []);

    } catch (error) {
      hienThongBao(
        error.message || "Không thể tải danh sách danh mục",
        "error"
      );
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDanhSach();
  }, []);

  // ===================================================
  // THỐNG KÊ
  // ===================================================

  const tongDanhMuc = danhSach.length;

  const dangHoatDong = danhSach.filter(
    (item) => item.hoatDong
  ).length;

  const ngungHoatDong = danhSach.filter(
    (item) => !item.hoatDong
  ).length;

  // ===================================================
  // TÌM KIẾM VÀ LỌC
  // ===================================================

  const danhSachLoc = useMemo(() => {

    return danhSach.filter((item) => {

      const tuKhoaChuanHoa = tuKhoa
        .trim()
        .toLowerCase();

      const khopTuKhoa =
        item.tenDanhMuc?.toLowerCase().includes(tuKhoaChuanHoa) ||
        item.duongDanSeo?.toLowerCase().includes(tuKhoaChuanHoa);

      const khopTrangThai =
        trangThaiLoc === "tat-ca" ||
        (trangThaiLoc === "hoat-dong" && item.hoatDong) ||
        (trangThaiLoc === "ngung-hoat-dong" && !item.hoatDong);

      return khopTuKhoa && khopTrangThai;

    }).sort((a, b) => {

      return (
        (a.thuTu ?? 0) - (b.thuTu ?? 0) ||
        a.id - b.id
      );

    });

  }, [danhSach, tuKhoa, trangThaiLoc]);

  // ===================================================
  // PHÂN TRANG
  // ===================================================

  const tongTrang = Math.ceil(
    danhSachLoc.length / soLuongMoiTrang
  );

  const danhSachHienThi = danhSachLoc.slice(
    (trangHienTai - 1) * soLuongMoiTrang,
    trangHienTai * soLuongMoiTrang
  );

  useEffect(() => {
    setTrangHienTai(1);
  }, [tuKhoa, trangThaiLoc]);

  // ===================================================
  // MỞ MODAL THÊM
  // ===================================================

  const moModalThem = () => {

    setForm({
      ...FORM_MAC_DINH,
      thuTu: danhSach.length,
    });

    setDangChinhSua(false);
    setIdDangChinhSua(null);

    setTuDongSlug(true);
    setSlugDaKiemTra(false);
    setSlugBiTrung(false);

    setMoModal(true);
  };

  // ===================================================
  // MỞ MODAL CẬP NHẬT
  // ===================================================

  const moModalSua = (item) => {

    setForm({
      tenDanhMuc: item.tenDanhMuc || "",
      duongDanSeo: item.duongDanSeo || "",
      moTa: item.moTa || "",
      thuTu: item.thuTu ?? 0,
      hoatDong: item.hoatDong,
    });

    setDangChinhSua(true);
    setIdDangChinhSua(item.id);

    setTuDongSlug(false);
    setSlugDaKiemTra(false);
    setSlugBiTrung(false);

    setMoModal(true);
  };

  // ===================================================
  // ĐÓNG MODAL
  // ===================================================

  const dongModal = () => {

    if (dangLuu) return;

    setMoModal(false);
    setForm(FORM_MAC_DINH);

    setDangChinhSua(false);
    setIdDangChinhSua(null);
  };

  // ===================================================
  // XỬ LÝ THAY ĐỔI FORM
  // ===================================================

  const xuLyThayDoi = (e) => {

    const { name, value, type, checked } = e.target;

    if (name === "tenDanhMuc") {

      setForm((prev) => ({
        ...prev,
        tenDanhMuc: value,
        ...(tuDongSlug
          ? { duongDanSeo: taoSlug(value) }
          : {}),
      }));

      setSlugDaKiemTra(false);
      setSlugBiTrung(false);

      return;
    }

    if (name === "duongDanSeo") {

      setTuDongSlug(false);
      setSlugDaKiemTra(false);
      setSlugBiTrung(false);

      setForm((prev) => ({
        ...prev,
        duongDanSeo: taoSlug(value),
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? Number(value)
            : value,
    }));
  };

  // ===================================================
  // KIỂM TRA SLUG
  // ===================================================

  const xuLyKiemTraSlug = async () => {

    if (!form.duongDanSeo.trim()) {
      hienThongBao("Vui lòng nhập đường dẫn SEO", "error");
      return;
    }

    try {

      const data = await checkSlug(
        form.duongDanSeo.trim(),
        dangChinhSua ? idDangChinhSua : null
      );

      setSlugDaKiemTra(true);
      setSlugBiTrung(data.daTonTai);

      if (data.daTonTai) {
        hienThongBao("Đường dẫn SEO đã tồn tại", "error");
      } else {
        hienThongBao("Đường dẫn SEO có thể sử dụng");
      }

    } catch (error) {
      hienThongBao(error.message, "error");
    }
  };

  // ===================================================
  // LƯU DANH MỤC
  // ===================================================

  const xuLyLuu = async (e) => {

    e.preventDefault();

    if (!form.tenDanhMuc.trim()) {
      hienThongBao("Vui lòng nhập tên danh mục", "error");
      return;
    }

    if (!form.duongDanSeo.trim()) {
      hienThongBao("Vui lòng nhập đường dẫn SEO", "error");
      return;
    }

    if (form.thuTu < 0 || !Number.isInteger(form.thuTu)) {
      hienThongBao("Thứ tự phải là số nguyên không âm", "error");
      return;
    }

    try {

      setDangLuu(true);

      // Kiểm tra slug trực tiếp với backend trước khi lưu
      const slugResult = await checkSlug(
        form.duongDanSeo.trim(),
        dangChinhSua ? idDangChinhSua : null
      );

      if (slugResult.daTonTai) {
        setSlugDaKiemTra(true);
        setSlugBiTrung(true);

        hienThongBao("Đường dẫn SEO đã tồn tại", "error");
        return;
      }

      const payload = {
        tenDanhMuc: form.tenDanhMuc.trim(),
        duongDanSeo: form.duongDanSeo.trim(),
        moTa: form.moTa.trim(),
        thuTu: form.thuTu,
        hoatDong: form.hoatDong,
      };

      if (dangChinhSua) {

        await update(idDangChinhSua, payload);

        hienThongBao("Cập nhật danh mục thành công");

      } else {

        await create(payload);

        hienThongBao("Thêm danh mục thành công");
      }

      setMoModal(false);

      await taiDanhSach();

    } catch (error) {

      hienThongBao(
        error.message || "Không thể lưu danh mục",
        "error"
      );

    } finally {
      setDangLuu(false);
    }
  };

  // ===================================================
  // BẬT / TẮT TRẠNG THÁI
  // ===================================================

  const xuLyTrangThai = async (item) => {

    try {

      await updateStatus(item.id, !item.hoatDong);

      hienThongBao(
        !item.hoatDong
          ? "Đã kích hoạt danh mục"
          : "Đã ngừng hoạt động danh mục"
      );

      await taiDanhSach();

    } catch (error) {
      hienThongBao(error.message, "error");
    }
  };

  // ===================================================
  // XÓA DANH MỤC
  // ===================================================

  const xuLyXoa = async () => {

    if (!danhMucCanXoa) return;

    try {

      await remove(danhMucCanXoa.id);

      hienThongBao("Xóa danh mục thành công");

      setDanhMucCanXoa(null);

      await taiDanhSach();

    } catch (error) {

      hienThongBao(
        error.message || "Không thể xóa danh mục",
        "error"
      );
    }
  };

  // ===================================================
  // SẮP XẾP THỨ TỰ
  // ===================================================

  const xuLySapXep = async (index, huong) => {

    const danhSachMoi = [...danhSachLoc];

    const viTriMoi = index + huong;

    if (
      viTriMoi < 0 ||
      viTriMoi >= danhSachMoi.length
    ) {
      return;
    }

    const [item] = danhSachMoi.splice(index, 1);

    danhSachMoi.splice(viTriMoi, 0, item);

    const payload = danhSachMoi.map((item, index) => ({
      id: item.id,
      thuTu: index,
    }));

    try {

      await updateOrder(payload);

      hienThongBao("Cập nhật thứ tự thành công");

      await taiDanhSach();

    } catch (error) {
      hienThongBao(error.message, "error");
    }
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="ql-dmbv">

      {/* TIÊU ĐỀ */}

      <div className="ql-dmbv-header">

        <div className="ql-dmbv-heading">

          <div className="ql-dmbv-heading-icon">
            <FolderOpen size={25} />
          </div>

          <div>
            <h1>Danh mục bài viết</h1>
            <p>
              Quản lý và sắp xếp các danh mục tin tức trên website.
            </p>
          </div>

        </div>

        <button
          className="ql-dmbv-btn-primary"
          onClick={moModalThem}
        >
          <Plus size={19} />
          Thêm danh mục
        </button>

      </div>

      {/* THỐNG KÊ */}

      <div className="ql-dmbv-stats">

        <div className="ql-dmbv-stat-item">

          <div className="ql-dmbv-stat-icon purple">
            <FolderOpen size={22} />
          </div>

          <div>
            <span>Tổng danh mục</span>
            <strong>{tongDanhMuc}</strong>
          </div>

        </div>

        <div className="ql-dmbv-stat-item">

          <div className="ql-dmbv-stat-icon green">
            <FolderCheck size={22} />
          </div>

          <div>
            <span>Đang hoạt động</span>
            <strong>{dangHoatDong}</strong>
          </div>

        </div>

        <div className="ql-dmbv-stat-item">

          <div className="ql-dmbv-stat-icon orange">
            <FolderX size={22} />
          </div>

          <div>
            <span>Ngừng hoạt động</span>
            <strong>{ngungHoatDong}</strong>
          </div>

        </div>

      </div>

      {/* DANH SÁCH */}

      <div className="ql-dmbv-content">

        <div className="ql-dmbv-toolbar">

          <div className="ql-dmbv-search">

            <Search size={19} />

            <input
              type="text"
              placeholder="Tìm kiếm tên danh mục, đường dẫn SEO..."
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
            />

            {tuKhoa && (
              <button
                type="button"
                onClick={() => setTuKhoa("")}
                title="Xóa tìm kiếm"
              >
                <X size={16} />
              </button>
            )}

          </div>

          <select
            value={trangThaiLoc}
            onChange={(e) => setTrangThaiLoc(e.target.value)}
            className="ql-dmbv-filter"
          >
            <option value="tat-ca">Tất cả trạng thái</option>
            <option value="hoat-dong">Đang hoạt động</option>
            <option value="ngung-hoat-dong">Ngừng hoạt động</option>
          </select>

          <button
            className="ql-dmbv-btn-refresh"
            onClick={taiDanhSach}
            title="Tải lại danh sách"
          >
            <RotateCcw size={18} />
          </button>

        </div>

        <div className="ql-dmbv-list-heading">

          <div>
            <h3>Danh sách danh mục</h3>
            <p>
              Tìm thấy {danhSachLoc.length} danh mục
            </p>
          </div>

          <span className="ql-dmbv-sort-note">
            <GripVertical size={15} />
            Sắp xếp bằng nút lên / xuống
          </span>

        </div>

        {dangTai ? (

          <div className="ql-dmbv-loading">
            <LoaderCircle className="ql-dmbv-spinner" size={30} />
            <span>Đang tải dữ liệu...</span>
          </div>

        ) : danhSachHienThi.length === 0 ? (

          <div className="ql-dmbv-empty">

            <FolderOpen size={45} />

            <h3>Không tìm thấy danh mục</h3>

            <p>
              Chưa có dữ liệu phù hợp với điều kiện tìm kiếm.
            </p>

            {tuKhoa === "" && (
              <button
                className="ql-dmbv-btn-primary"
                onClick={moModalThem}
              >
                <Plus size={18} />
                Thêm danh mục đầu tiên
              </button>
            )}

          </div>

        ) : (

          <div className="ql-dmbv-list">

            {danhSachHienThi.map((item, index) => {

              const viTri = (trangHienTai - 1) * soLuongMoiTrang + index;

              return (

                <div
                  className="ql-dmbv-row"
                  key={item.id}
                >

                  {/* ICON */}

                  <div className="ql-dmbv-row-icon">
                    <FileText size={23} />
                  </div>

                  {/* THÔNG TIN */}

                  <div className="ql-dmbv-info">

                    <div className="ql-dmbv-name-line">

                      <h4>{item.tenDanhMuc}</h4>

                      <span
                        className={`ql-dmbv-badge ${
                          item.hoatDong ? "active" : "inactive"
                        }`}
                      >
                        <span className="ql-dmbv-badge-dot" />

                        {item.hoatDong
                          ? "Đang hoạt động"
                          : "Ngừng hoạt động"}
                      </span>

                    </div>

                    <div className="ql-dmbv-slug">
                      <Link size={13} />
                      <span>{item.duongDanSeo}</span>
                    </div>

                    <p className="ql-dmbv-description">
                      {item.moTa || "Chưa có mô tả cho danh mục này."}
                    </p>

                  </div>

                  {/* THỨ TỰ */}

                  <div className="ql-dmbv-order">

                    <span>Thứ tự</span>

                    <strong>{item.thuTu}</strong>

                    <div className="ql-dmbv-order-actions">

                      <button
                        type="button"
                        title="Đưa lên"
                        disabled={viTri === 0}
                        onClick={() => xuLySapXep(viTri, -1)}
                      >
                        <ArrowUp size={14} />
                      </button>

                      <button
                        type="button"
                        title="Đưa xuống"
                        disabled={viTri === danhSachLoc.length - 1}
                        onClick={() => xuLySapXep(viTri, 1)}
                      >
                        <ArrowDown size={14} />
                      </button>

                    </div>

                  </div>

                  {/* THAO TÁC */}

                  <div className="ql-dmbv-actions">

                    <button
                      type="button"
                      className="edit"
                      title="Chỉnh sửa"
                      onClick={() => moModalSua(item)}
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      className="status"
                      title={
                        item.hoatDong
                          ? "Ngừng hoạt động"
                          : "Kích hoạt"
                      }
                      onClick={() => xuLyTrangThai(item)}
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      type="button"
                      className="delete"
                      title="Xóa danh mục"
                      onClick={() => setDanhMucCanXoa(item)}
                    >
                      <Trash2 size={17} />
                    </button>

                  </div>

                </div>

              );

            })}

          </div>

        )}

        {/* PHÂN TRANG */}

        {!dangTai && danhSachLoc.length > 0 && (

          <div className="ql-dmbv-pagination">

            <span>
              Hiển thị{" "}
              {(trangHienTai - 1) * soLuongMoiTrang + 1}
              {" – "}
              {Math.min(
                trangHienTai * soLuongMoiTrang,
                danhSachLoc.length
              )}
              {" / "}
              {danhSachLoc.length} danh mục
            </span>

            <div>

              <button
                disabled={trangHienTai <= 1}
                onClick={() => setTrangHienTai((prev) => prev - 1)}
              >
                <ChevronLeft size={18} />
              </button>

              <span>
                {trangHienTai} / {tongTrang}
              </span>

              <button
                disabled={trangHienTai >= tongTrang}
                onClick={() => setTrangHienTai((prev) => prev + 1)}
              >
                <ChevronRight size={18} />
              </button>

            </div>

          </div>

        )}

      </div>

      {/* =================================================
          MODAL THÊM / CẬP NHẬT
      ================================================= */}

      {moModal && (

        <div
          className="ql-dmbv-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) dongModal();
          }}
        >

          <div className="ql-dmbv-modal">

            <div className="ql-dmbv-modal-header">

              <div>
                <h2>
                  {dangChinhSua
                    ? "Cập nhật danh mục"
                    : "Thêm danh mục mới"}
                </h2>

                <p>
                  Nhập thông tin danh mục bài viết.
                </p>
              </div>

              <button
                type="button"
                onClick={dongModal}
                disabled={dangLuu}
              >
                <X size={21} />
              </button>

            </div>

            <form onSubmit={xuLyLuu}>

              <div className="ql-dmbv-modal-body">

                {/* TÊN DANH MỤC */}

                <div className="ql-dmbv-form-group">

                  <label>
                    Tên danh mục <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="tenDanhMuc"
                    value={form.tenDanhMuc}
                    onChange={xuLyThayDoi}
                    placeholder="Ví dụ: Tin tức ẩm thực"
                    maxLength={255}
                    required
                  />

                  <small>
                    Tối đa 255 ký tự.
                  </small>

                </div>

                {/* SLUG */}

                <div className="ql-dmbv-form-group">

                  <label>
                    Đường dẫn SEO <span>*</span>
                  </label>

                  <div className="ql-dmbv-slug-input">

                    <input
                      type="text"
                      name="duongDanSeo"
                      value={form.duongDanSeo}
                      onChange={xuLyThayDoi}
                      placeholder="tin-tuc-am-thuc"
                      maxLength={255}
                      required
                    />

                    <button
                      type="button"
                      onClick={xuLyKiemTraSlug}
                    >
                      Kiểm tra
                    </button>

                  </div>

                  <small>
                    Đường dẫn: /tin-tuc/{form.duongDanSeo || "..."}
                  </small>

                  {slugDaKiemTra && (

                    <div
                      className={`ql-dmbv-slug-result ${
                        slugBiTrung ? "error" : "success"
                      }`}
                    >

                      {slugBiTrung
                        ? <AlertCircle size={15} />
                        : <CheckCircle2 size={15} />}

                      {slugBiTrung
                        ? "Đường dẫn SEO đã tồn tại"
                        : "Đường dẫn SEO có thể sử dụng"}

                    </div>

                  )}

                </div>

                {/* MÔ TẢ */}

                <div className="ql-dmbv-form-group">

                  <label>Mô tả danh mục</label>

                  <textarea
                    name="moTa"
                    value={form.moTa}
                    onChange={xuLyThayDoi}
                    placeholder="Nhập mô tả ngắn cho danh mục..."
                    rows={4}
                    maxLength={1000}
                  />

                  <small>
                    {form.moTa.length}/1000 ký tự.
                  </small>

                </div>

                {/* THỨ TỰ */}

                <div className="ql-dmbv-form-group">

                  <label>Thứ tự hiển thị</label>

                  <input
                    type="number"
                    name="thuTu"
                    value={form.thuTu}
                    onChange={xuLyThayDoi}
                    min="0"
                    step="1"
                  />

                  <small>
                    Số nhỏ hơn sẽ được ưu tiên hiển thị trước.
                  </small>

                </div>

                {/* TRẠNG THÁI */}

                <div className="ql-dmbv-form-group">

                  <label>Trạng thái</label>

                  <label className="ql-dmbv-switch-row">

                    <span>
                      {form.hoatDong
                        ? "Đang hoạt động"
                        : "Ngừng hoạt động"}
                    </span>

                    <input
                      type="checkbox"
                      name="hoatDong"
                      checked={form.hoatDong}
                      onChange={xuLyThayDoi}
                    />

                    <span className="ql-dmbv-switch" />

                  </label>

                </div>

              </div>

              {/* FOOTER */}

              <div className="ql-dmbv-modal-footer">

                <button
                  type="button"
                  className="ql-dmbv-btn-cancel"
                  onClick={dongModal}
                  disabled={dangLuu}
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  className="ql-dmbv-btn-save"
                  disabled={dangLuu}
                >

                  {dangLuu ? (
                    <LoaderCircle
                      size={17}
                      className="ql-dmbv-spinner"
                    />
                  ) : (
                    <Save size={17} />
                  )}

                  {dangLuu
                    ? "Đang lưu..."
                    : dangChinhSua
                      ? "Lưu thay đổi"
                      : "Thêm danh mục"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =================================================
          MODAL XÁC NHẬN XÓA
      ================================================= */}

      {danhMucCanXoa && (

        <div className="ql-dmbv-modal-overlay">

          <div className="ql-dmbv-confirm">

            <div className="ql-dmbv-confirm-icon">
              <Trash2 size={25} />
            </div>

            <h3>Xóa danh mục?</h3>

            <p>
              Bạn có chắc chắn muốn xóa danh mục{" "}
              <strong>{danhMucCanXoa.tenDanhMuc}</strong>?
              <br />
              Hành động này không thể hoàn tác.
            </p>

            <div className="ql-dmbv-confirm-actions">

              <button
                className="ql-dmbv-btn-cancel"
                onClick={() => setDanhMucCanXoa(null)}
              >
                Hủy bỏ
              </button>

              <button
                className="ql-dmbv-btn-delete"
                onClick={xuLyXoa}
              >
                <Trash2 size={16} />
                Xác nhận xóa
              </button>

            </div>

          </div>

        </div>

      )}

      {/* THÔNG BÁO */}

      {thongBao && (

        <div className={`ql-dmbv-toast ${thongBao.loai}`}>

          {thongBao.loai === "success"
            ? <CheckCircle2 size={19} />
            : <AlertCircle size={19} />}

          <span>{thongBao.noiDung}</span>

          <button onClick={() => setThongBao(null)}>
            <X size={16} />
          </button>

        </div>

      )}

    </div>
  );
}