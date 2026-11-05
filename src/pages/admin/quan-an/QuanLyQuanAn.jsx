import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Store,
  Search,
  Plus,
  MapPin,
  Phone,
  Star,
  Pencil,
  Trash2,
  Eye,
  Clock,
  Images,
  Tags,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  RefreshCw,
  Clock3,
} from "lucide-react";

import "./QuanLyQuanAn.css";
import "../../../services/admin/QuanAnService";
import quanAnService from "../../../services/admin/QuanAnService";
import GioMoCuaModal from "../gio-mo-cua/GioMoCuaModal";
import QuanAnDanhMucModal from "../quan-an-danh-muc/QuanAnDanhMucModal";
import HinhAnhQuanModal from "../hinh-anh-quan/HinhAnhQuanModal";
import QuanAnTienIchModal from "../quan-an-tien-ich/QuanAnTienIchModal";


const TRANG_THAI_MAC_DINH = {
  keyword: "",
  hoatDong: "",
  noiBat: "",
};

const FORM_MAC_DINH = {
  tenQuan: "",
  duongDanSeo: "",
  diaChi: "",
  tinhThanhId: "",
  phuongXaId: "",
  soDienThoai: "",
  email: "",
  website: "",
  urlFacebook: "",
  urlTiktok: "",
  urlGoogleMap: "",
  viDo: "",
  kinhDo: "",
  moTaNgan: "",
  moTaChiTiet: "",
  giaTu: "",
  giaDen: "",
  diemDanhGiaGoogle: "",
  tongDanhGiaGoogle: "0",
  noiBat: false,
  hoatDong: true,
  tieuDeSeo: "",
  moTaSeo: "",
  tuKhoaSeo: "",
};

const DINH_DANG_TIEN = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Chưa cập nhật";
  }

  return (
    new Intl.NumberFormat("vi-VN").format(Number(value)) + "đ"
  );
};

function layDanhSach(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;

  return [];
}

function QuanLyQuanAn() {
  const [danhSachQuan, setDanhSachQuan] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");

  const [tuKhoa, setTuKhoa] = useState("");
  const [locHoatDong, setLocHoatDong] = useState("");
  const [locNoiBat, setLocNoiBat] = useState("");

  const [trang, setTrang] = useState(0);
  const [kichThuocTrang] = useState(9);
  const [tongSoTrang, setTongSoTrang] = useState(0);
  const [tongSoQuan, setTongSoQuan] = useState(0);

  const [modalForm, setModalForm] = useState(false);
  const [modalChiTiet, setModalChiTiet] = useState(false);
  const [quanDangChon, setQuanDangChon] = useState(null);
  const [quanCanXoa, setQuanCanXoa] = useState(null);

  const [cheDoForm, setCheDoForm] = useState("them");
  const [form, setForm] = useState(FORM_MAC_DINH);

  const [danhSachTinh, setDanhSachTinh] = useState([]);
  const [danhSachPhuong, setDanhSachPhuong] = useState([]);
  const [dangTaiPhuong, setDangTaiPhuong] = useState(false);

  const [thongBao, setThongBao] = useState(null);

  const [quanAnDangMoGio, setQuanAnDangMoGio] = useState(null);
  const [quanAnDangMoDanhMuc, setQuanAnDangMoDanhMuc] = useState(null);
  const [quanAnDangMoHinhAnh, setQuanAnDangMoHinhAnh] = useState(null);
  const [quanAnDangMoTienIch, setQuanAnDangMoTienIch] = useState(null);

  const hienThongBao = (noiDung, loai = "success") => {
    setThongBao({ noiDung, loai });

    window.setTimeout(() => {
      setThongBao(null);
    }, 3500);
  };

  // ==========================================
  // TẢI DANH SÁCH QUÁN TỪ BACKEND
  // ==========================================

  const taiDanhSachQuan = useCallback(async () => {
    setDangTai(true);
    setLoi("");

    try {
      const params = {
        keyword: tuKhoa.trim() || undefined,
        hoatDong:
          locHoatDong === "" ? undefined : locHoatDong === "true",
        noiBat:
          locNoiBat === "" ? undefined : locNoiBat === "true",
        page: trang,
        size: kichThuocTrang,
      };

      const data = await quanAnService.getAll(params);
      const danhSach = layDanhSach(data);

      setDanhSachQuan(danhSach);
      setTongSoQuan(
        Number(data?.totalElements ?? data?.data?.totalElements ?? danhSach.length)
      );
      setTongSoTrang(
        Number(data?.totalPages ?? data?.data?.totalPages ?? 1)
      );
    } catch (error) {
      setLoi(error.message || "Không thể tải danh sách quán ăn.");
      setDanhSachQuan([]);
    } finally {
      setDangTai(false);
    }
  }, [tuKhoa, locHoatDong, locNoiBat, trang, kichThuocTrang]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      taiDanhSachQuan();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [taiDanhSachQuan]);

  // ==========================================
  // TẢI TỈNH/THÀNH CHO FORM
  // ==========================================

  useEffect(() => {
    async function taiTinhThanh() {
      try {
        const response = await fetch(
          "http://localhost:8080/api/tinh-thanh"
        );

        if (!response.ok) {
          throw new Error("Không tải được danh sách tỉnh/thành.");
        }

        const data = await response.json();
        setDanhSachTinh(layDanhSach(data));
      } catch (error) {
        console.error("Lỗi tải tỉnh/thành:", error);
      }
    }

    taiTinhThanh();
  }, []);

  // ==========================================
  // TẢI PHƯỜNG/XÃ THEO TỈNH
  // ==========================================

  const taiPhuongXa = async (tinhThanhId) => {
    setDanhSachPhuong([]);

    if (!tinhThanhId) return;

    setDangTaiPhuong(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/phuong-xa/tinh-thanh/${tinhThanhId}`
      );

      if (!response.ok) {
        throw new Error("Không tải được danh sách phường/xã.");
      }

      const data = await response.json();
      setDanhSachPhuong(layDanhSach(data));
    } catch (error) {
      console.error("Lỗi tải phường/xã:", error);
      hienThongBao(
        "Không tải được danh sách phường/xã. Hãy kiểm tra endpoint backend.",
        "error"
      );
    } finally {
      setDangTaiPhuong(false);
    }
  };

  // ==========================================
  // THỐNG KÊ TRÊN TRANG HIỆN TẠI
  // ==========================================

  const thongKe = useMemo(() => ({
    tong: tongSoQuan,
    hoatDong: danhSachQuan.filter((quan) => quan.hoatDong).length,
    noiBat: danhSachQuan.filter((quan) => quan.noiBat).length,
  }), [danhSachQuan, tongSoQuan]);

  // ==========================================
  // MỞ FORM THÊM
  // ==========================================

  const moFormThem = () => {
    setCheDoForm("them");
    setQuanDangChon(null);
    setForm({ ...FORM_MAC_DINH });
    setDanhSachPhuong([]);
    setModalForm(true);
  };

  // ==========================================
  // MỞ FORM SỬA
  // ==========================================

  const moFormSua = async (quan) => {
    setCheDoForm("sua");
    setQuanDangChon(quan);

    const duLieuForm = {
      ...FORM_MAC_DINH,
      ...quan,
      tinhThanhId: quan.tinhThanhId ?? "",
      phuongXaId: quan.phuongXaId ?? "",
      viDo: quan.viDo ?? "",
      kinhDo: quan.kinhDo ?? "",
      giaTu: quan.giaTu ?? "",
      giaDen: quan.giaDen ?? "",
      diemDanhGiaGoogle: quan.diemDanhGiaGoogle ?? "",
      tongDanhGiaGoogle: quan.tongDanhGiaGoogle ?? 0,
      noiBat: Boolean(quan.noiBat),
      hoatDong: Boolean(quan.hoatDong),
    };

    setForm(duLieuForm);
    setModalForm(true);

    if (quan.tinhThanhId) {
      await taiPhuongXa(quan.tinhThanhId);
    }
  };

  // ==========================================
  // THAY ĐỔI FORM
  // ==========================================

  const thayDoiForm = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((formCu) => ({
      ...formCu,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const thayDoiTinh = async (event) => {
    const tinhThanhId = event.target.value;

    setForm((formCu) => ({
      ...formCu,
      tinhThanhId,
      phuongXaId: "",
    }));

    await taiPhuongXa(tinhThanhId);
  };

  // ==========================================
  // LƯU THÊM / SỬA
  // ==========================================

  const luuQuanAn = async (event) => {
    event.preventDefault();
    setDangLuu(true);

    try {
      if (!form.tenQuan.trim()) {
        throw new Error("Vui lòng nhập tên quán.");
      }

      if (!form.tinhThanhId || !form.phuongXaId) {
        throw new Error("Vui lòng chọn tỉnh/thành và phường/xã.");
      }

      const giaTu = form.giaTu === "" ? null : Number(form.giaTu);
      const giaDen = form.giaDen === "" ? null : Number(form.giaDen);

      if (giaTu !== null && giaDen !== null && giaTu > giaDen) {
        throw new Error("Giá từ không được lớn hơn giá đến.");
      }

      const payload = {
        ...form,
        tenQuan: form.tenQuan.trim(),
        duongDanSeo: form.duongDanSeo.trim(),
        tinhThanhId: Number(form.tinhThanhId),
        phuongXaId: Number(form.phuongXaId),
        viDo: form.viDo === "" ? null : Number(form.viDo),
        kinhDo: form.kinhDo === "" ? null : Number(form.kinhDo),
        giaTu,
        giaDen,
        diemDanhGiaGoogle:
          form.diemDanhGiaGoogle === ""
            ? null
            : Number(form.diemDanhGiaGoogle),
        tongDanhGiaGoogle: Number(form.tongDanhGiaGoogle || 0),
        noiBat: Boolean(form.noiBat),
        hoatDong: Boolean(form.hoatDong),
      };

      if (cheDoForm === "them") {
        await quanAnService.create(payload);
        hienThongBao("Thêm quán ăn thành công.");
      } else {
        await quanAnService.update(quanDangChon.id, payload);
        hienThongBao("Cập nhật quán ăn thành công.");
      }

      setModalForm(false);
      await taiDanhSachQuan();
    } catch (error) {
      hienThongBao(error.message || "Không thể lưu quán ăn.", "error");
    } finally {
      setDangLuu(false);
    }
  };

  // ==========================================
  // XEM CHI TIẾT
  // ==========================================

  const xemChiTiet = async (quan) => {
    try {
      const data = await quanAnService.getById(quan.id);
      setQuanDangChon(data);
      setModalChiTiet(true);
    } catch (error) {
      hienThongBao(error.message || "Không thể tải chi tiết quán.", "error");
    }
  };

  // ==========================================
  // CẬP NHẬT TRẠNG THÁI
  // ==========================================

  const capNhatTrangThai = async (quan) => {
    try {
      await quanAnService.capNhatTrangThai(quan.id, !quan.hoatDong);
      hienThongBao(
        quan.hoatDong
          ? "Đã chuyển quán sang ngừng hoạt động."
          : "Đã kích hoạt quán."
      );
      await taiDanhSachQuan();
    } catch (error) {
      hienThongBao(error.message || "Không thể cập nhật trạng thái.", "error");
    }
  };

  // ==========================================
  // ĐÁNH DẤU NỔI BẬT
  // ==========================================

  const capNhatNoiBat = async (quan) => {
    try {
      await quanAnService.capNhatNoiBat(quan.id, !quan.noiBat);
      hienThongBao(
        quan.noiBat
          ? "Đã bỏ đánh dấu nổi bật."
          : "Đã đánh dấu quán nổi bật."
      );
      await taiDanhSachQuan();
    } catch (error) {
      hienThongBao(error.message || "Không thể cập nhật nổi bật.", "error");
    }
  };

  // ==========================================
  // XÓA MỀM
  // ==========================================

  const xacNhanXoa = async () => {
    if (!quanCanXoa) return;

    try {
      await quanAnService.xoaMem(quanCanXoa.id);
      hienThongBao("Đã chuyển quán sang trạng thái ngừng hoạt động.");
      setQuanCanXoa(null);
      await taiDanhSachQuan();
    } catch (error) {
      hienThongBao(error.message || "Không thể xóa quán.", "error");
    }
  };

  // ==========================================
  // KHÔI PHỤC
  // ==========================================

  const khoiPhucQuan = async (quan) => {
    try {
      await quanAnService.khoiPhuc(quan.id);
      hienThongBao("Khôi phục quán thành công.");
      await taiDanhSachQuan();
    } catch (error) {
      hienThongBao(error.message || "Không thể khôi phục quán.", "error");
    }
  };

  return (
    <div className="qlqa-page">
      <div className="qlqa-header">
        <div className="qlqa-title">
          <div className="qlqa-title-icon">
            <Store size={25} />
          </div>

          <div>
            <h1>Quản lý quán ăn</h1>
            <p>Quản lý thông tin địa điểm ăn uống trên hệ thống.</p>
          </div>
        </div>

        <div className="qlqa-header-actions">
          <button
            className="qlqa-btn qlqa-btn-secondary"
            onClick={taiDanhSachQuan}
            disabled={dangTai}
          >
            <RefreshCw size={17} />
            Làm mới
          </button>

          <button
            className="qlqa-btn qlqa-btn-primary"
            onClick={moFormThem}
          >
            <Plus size={18} />
            Thêm quán ăn
          </button>
        </div>
      </div>

      {/* THỐNG KÊ */}
      <div className="qlqa-stats">
        <div className="qlqa-stat">
          <span className="qlqa-stat-icon qlqa-purple">
            <Store size={21} />
          </span>
          <div>
            <p>Tổng số quán</p>
            <strong>{thongKe.tong}</strong>
          </div>
        </div>

        <div className="qlqa-stat">
          <span className="qlqa-stat-icon qlqa-green">
            <Store size={21} />
          </span>
          <div>
            <p>Đang hoạt động</p>
            <strong>{thongKe.hoatDong}</strong>
            <small>Trong trang hiện tại</small>
          </div>
        </div>

        <div className="qlqa-stat">
          <span className="qlqa-stat-icon qlqa-orange">
            <Star size={21} />
          </span>
          <div>
            <p>Quán nổi bật</p>
            <strong>{thongKe.noiBat}</strong>
            <small>Trong trang hiện tại</small>
          </div>
        </div>
      </div>

      {/* TÌM KIẾM VÀ LỌC */}
      <div className="qlqa-filters">
        <div className="qlqa-search">
          <Search size={19} />
          <input
            value={tuKhoa}
            onChange={(event) => {
              setTuKhoa(event.target.value);
              setTrang(0);
            }}
            placeholder="Tìm tên quán, địa chỉ..."
          />

          {tuKhoa && (
            <button onClick={() => setTuKhoa("")} title="Xóa tìm kiếm">
              <X size={16} />
            </button>
          )}
        </div>

        <select
          value={locHoatDong}
          onChange={(event) => {
            setLocHoatDong(event.target.value);
            setTrang(0);
          }}
          aria-label="Lọc trạng thái hoạt động"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Ngừng hoạt động</option>
        </select>

        <select
          value={locNoiBat}
          onChange={(event) => {
            setLocNoiBat(event.target.value);
            setTrang(0);
          }}
          aria-label="Lọc nổi bật"
        >
          <option value="">Tất cả quán</option>
          <option value="true">Quán nổi bật</option>
          <option value="false">Không nổi bật</option>
        </select>
      </div>

      <div className="qlqa-list-heading">
        <div>
          <h2>Danh sách quán ăn</h2>
          <p>{tongSoQuan} địa điểm trong hệ thống</p>
        </div>
        <span className="qlqa-view-label">Hiển thị dạng thẻ</span>
      </div>

      {loi && (
        <div className="qlqa-error">
          <strong>Không thể tải danh sách.</strong>
          <p>{loi}</p>
          <button
            className="qlqa-btn qlqa-btn-secondary"
            onClick={taiDanhSachQuan}
          >
            Thử lại
          </button>
        </div>
      )}

      {dangTai ? (
        <div className="qlqa-loading">
          <RefreshCw size={24} className="qlqa-spin" />
          <p>Đang tải danh sách quán ăn...</p>
        </div>
      ) : !loi && danhSachQuan.length === 0 ? (
        <div className="qlqa-empty">
          <Store size={38} />
          <h3>Chưa tìm thấy quán ăn</h3>
          <p>Hãy thử thay đổi điều kiện tìm kiếm hoặc thêm quán mới.</p>
          <button className="qlqa-btn qlqa-btn-primary" onClick={moFormThem}>
            <Plus size={17} />
            Thêm quán ăn
          </button>
        </div>
      ) : (
        <div className="qlqa-grid">
          {danhSachQuan.map((quan) => (
            <article className="qlqa-card" key={quan.id}>
              <div className="qlqa-card-head">
                <div className="qlqa-card-avatar">
                  <Store size={25} />
                </div>

                <div className="qlqa-card-badges">
                  {quan.noiBat && (
                    <span className="qlqa-badge qlqa-badge-featured">
                      <Star size={12} fill="currentColor" />
                      Nổi bật
                    </span>
                  )}

                  <span
                    className={`qlqa-badge ${quan.hoatDong
                      ? "qlqa-badge-active"
                      : "qlqa-badge-inactive"
                      }`}
                  >
                    {quan.hoatDong ? "Đang hoạt động" : "Ngừng hoạt động"}
                  </span>
                </div>
              </div>

              <div className="qlqa-card-body">
                <h3>{quan.tenQuan}</h3>

                <p className="qlqa-info">
                  <MapPin size={15} />
                  <span>{quan.diaChi || "Chưa cập nhật địa chỉ"}</span>
                </p>

                <p className="qlqa-location">
                  {quan.tenPhuongXa || "Chưa cập nhật phường/xã"}
                  {quan.tenTinhThanh ? `, ${quan.tenTinhThanh}` : ""}
                </p>

                <p className="qlqa-info">
                  <Phone size={15} />
                  <span>{quan.soDienThoai || "Chưa cập nhật số điện thoại"}</span>
                </p>

                <div className="qlqa-card-meta">
                  <div>
                    <small>Khoảng giá</small>
                    <strong>
                      {quan.giaTu != null && quan.giaDen != null
                        ? `${DINH_DANG_TIEN(quan.giaTu)} - ${DINH_DANG_TIEN(
                          quan.giaDen
                        )}`
                        : "Chưa cập nhật"}
                    </strong>
                  </div>

                  <div className="qlqa-rating">
                    <small>Đánh giá Google</small>
                    <strong>
                      <Star size={14} fill="currentColor" />
                      {quan.diemDanhGiaGoogle ?? "—"}
                    </strong>
                    <small>{quan.tongDanhGiaGoogle ?? 0} đánh giá</small>
                  </div>
                </div>
              </div>

              {/* BỐN NÚT CHỜ BACKEND */}
              <div className="qlqa-related">
                <p>QUẢN LÝ THÔNG TIN LIÊN KẾT</p>

                <div className="qlqa-related-grid">
                  <button
                    type="button"
                    onClick={() => setQuanAnDangMoGio(quan)}
                    title={`Quản lý giờ mở cửa của ${quan.tenQuan}`}
                  >
                    <Clock size={15} /> Giờ mở cửa
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuanAnDangMoHinhAnh(quan)}
                    title={`Quản lý hình ảnh của ${quan.tenQuan}`}
                  >
                    <Images size={15} /> Hình ảnh
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuanAnDangMoDanhMuc(quan)}
                    title={`Quản lý danh mục của ${quan.tenQuan}`}
                  >
                    <Tags size={15} /> Danh mục
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuanAnDangMoTienIch(quan)}
                  >
                    <Sparkles size={15} /> Tiện ích
                  </button>
                </div>
              </div>

              {/* CÁC THAO TÁC ĐÃ KẾT NỐI */}
              <div className="qlqa-card-actions">
                <button
                  className="qlqa-action-view"
                  onClick={() => xemChiTiet(quan)}
                  title="Xem chi tiết"
                >
                  <Eye size={16} />
                  Xem
                </button>

                <button
                  className="qlqa-action-edit"
                  onClick={() => moFormSua(quan)}
                  title="Sửa quán"
                >
                  <Pencil size={16} />
                  Sửa
                </button>

                {quan.hoatDong ? (
                  <button
                    className="qlqa-action-delete"
                    onClick={() => setQuanCanXoa(quan)}
                    title="Xóa mềm quán"
                  >
                    <Trash2 size={16} />
                    Xóa
                  </button>
                ) : (
                  <button
                    className="qlqa-action-restore"
                    onClick={() => khoiPhucQuan(quan)}
                    title="Khôi phục quán"
                  >
                    <RotateCcw size={16} />
                    Khôi phục
                  </button>
                )}
              </div>

              <div className="qlqa-card-footer">
                <button
                  onClick={() => capNhatTrangThai(quan)}
                  disabled={!quan.hoatDong && false}
                >
                  {quan.hoatDong ? "Chuyển sang ngừng hoạt động" : "Trạng thái"}
                </button>

                <button onClick={() => capNhatNoiBat(quan)} disabled={!quan.hoatDong}>
                  {quan.noiBat ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* PHÂN TRANG */}
      {!dangTai && !loi && tongSoQuan > 0 && (
        <div className="qlqa-pagination">
          <span>
            Trang <strong>{trang + 1}</strong> / {Math.max(tongSoTrang, 1)}
          </span>

          <div>
            <button
              disabled={trang <= 0}
              onClick={() => setTrang((current) => Math.max(0, current - 1))}
              aria-label="Trang trước"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              disabled={trang + 1 >= tongSoTrang}
              onClick={() =>
                setTrang((current) =>
                  Math.min(Math.max(tongSoTrang - 1, 0), current + 1)
                )
              }
              aria-label="Trang tiếp"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA */}
      {modalForm && (
        <div
          className="qlqa-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalForm(false);
            }
          }}
        >
          <form className="qlqa-modal qlqa-form-modal" onSubmit={luuQuanAn}>
            <div className="qlqa-modal-head">
              <div>
                <h2>{cheDoForm === "them" ? "Thêm quán ăn" : "Cập nhật quán ăn"}</h2>
                <p>Nhập thông tin cơ bản của địa điểm.</p>
              </div>
              <button type="button" onClick={() => setModalForm(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="qlqa-form-content">
              <h3>Thông tin cơ bản</h3>

              <div className="qlqa-form-grid">
                <label className="qlqa-field qlqa-field-full">
                  Tên quán <b>*</b>
                  <input
                    name="tenQuan"
                    value={form.tenQuan}
                    onChange={thayDoiForm}
                    maxLength={255}
                    required
                  />
                </label>

                <label className="qlqa-field qlqa-field-full">
                  Đường dẫn SEO
                  <input
                    name="duongDanSeo"
                    value={form.duongDanSeo}
                    onChange={thayDoiForm}
                    placeholder="Để trống nếu muốn backend tự tạo"
                    maxLength={255}
                  />
                </label>

                <label className="qlqa-field qlqa-field-full">
                  Địa chỉ
                  <input
                    name="diaChi"
                    value={form.diaChi}
                    onChange={thayDoiForm}
                    maxLength={500}
                  />
                </label>

                <label className="qlqa-field">
                  Tỉnh/thành <b>*</b>
                  <select
                    name="tinhThanhId"
                    value={form.tinhThanhId}
                    onChange={thayDoiTinh}
                    required
                  >
                    <option value="">Chọn tỉnh/thành</option>
                    {danhSachTinh.map((tinh) => (
                      <option key={tinh.id} value={tinh.id}>
                        {tinh.tenTinhThanh || tinh.tenTinh || tinh.ten}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="qlqa-field">
                  Phường/xã <b>*</b>
                  <select
                    name="phuongXaId"
                    value={form.phuongXaId}
                    onChange={thayDoiForm}
                    disabled={!form.tinhThanhId || dangTaiPhuong}
                    required
                  >
                    <option value="">
                      {dangTaiPhuong ? "Đang tải..." : "Chọn phường/xã"}
                    </option>
                    {danhSachPhuong.map((phuong) => (
                      <option key={phuong.id} value={phuong.id}>
                        {phuong.tenPhuongXa || phuong.tenPhuong || phuong.ten}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="qlqa-field">
                  Số điện thoại
                  <input
                    name="soDienThoai"
                    value={form.soDienThoai}
                    onChange={thayDoiForm}
                    maxLength={20}
                  />
                </label>

                <label className="qlqa-field">
                  Email
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={thayDoiForm}
                    maxLength={254}
                  />
                </label>

                <label className="qlqa-field">
                  Giá từ (VNĐ)
                  <input
                    name="giaTu"
                    type="number"
                    min="0"
                    value={form.giaTu}
                    onChange={thayDoiForm}
                  />
                </label>

                <label className="qlqa-field">
                  Giá đến (VNĐ)
                  <input
                    name="giaDen"
                    type="number"
                    min="0"
                    value={form.giaDen}
                    onChange={thayDoiForm}
                  />
                </label>
              </div>

              <h3>Liên kết và vị trí</h3>

              <div className="qlqa-form-grid">
                <label className="qlqa-field qlqa-field-full">
                  Website
                  <input
                    name="website"
                    value={form.website}
                    onChange={thayDoiForm}
                    maxLength={2048}
                  />
                </label>

                <label className="qlqa-field qlqa-field-full">
                  Facebook
                  <input
                    name="urlFacebook"
                    value={form.urlFacebook}
                    onChange={thayDoiForm}
                    maxLength={2048}
                  />
                </label>

                <label className="qlqa-field qlqa-field-full">
                  TikTok
                  <input
                    name="urlTiktok"
                    value={form.urlTiktok}
                    onChange={thayDoiForm}
                    maxLength={2048}
                  />
                </label>

                <label className="qlqa-field qlqa-field-full">
                  Google Maps
                  <input
                    name="urlGoogleMap"
                    value={form.urlGoogleMap}
                    onChange={thayDoiForm}
                    maxLength={2048}
                  />
                </label>

                <label className="qlqa-field">
                  Vĩ độ
                  <input
                    name="viDo"
                    type="number"
                    min="-90"
                    max="90"
                    step="any"
                    value={form.viDo}
                    onChange={thayDoiForm}
                  />
                </label>

                <label className="qlqa-field">
                  Kinh độ
                  <input
                    name="kinhDo"
                    type="number"
                    min="-180"
                    max="180"
                    step="any"
                    value={form.kinhDo}
                    onChange={thayDoiForm}
                  />
                </label>
              </div>

              <h3>Mô tả</h3>

              <div className="qlqa-form-grid">
                <label className="qlqa-field qlqa-field-full">
                  Mô tả ngắn
                  <textarea
                    name="moTaNgan"
                    rows="2"
                    value={form.moTaNgan}
                    onChange={thayDoiForm}
                    maxLength={500}
                  />
                </label>

                <label className="qlqa-field qlqa-field-full">
                  Mô tả chi tiết
                  <textarea
                    name="moTaChiTiet"
                    rows="4"
                    value={form.moTaChiTiet}
                    onChange={thayDoiForm}
                  />
                </label>
              </div>

              <h3>Đánh giá và SEO</h3>

              <div className="qlqa-form-grid">
                <label className="qlqa-field">
                  Điểm Google
                  <input
                    name="diemDanhGiaGoogle"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.diemDanhGiaGoogle}
                    onChange={thayDoiForm}
                  />
                </label>

                <label className="qlqa-field">
                  Tổng lượt đánh giá Google
                  <input
                    name="tongDanhGiaGoogle"
                    type="number"
                    min="0"
                    value={form.tongDanhGiaGoogle}
                    onChange={thayDoiForm}
                  />
                </label>

                <label className="qlqa-field qlqa-field-full">
                  Tiêu đề SEO
                  <input
                    name="tieuDeSeo"
                    value={form.tieuDeSeo}
                    onChange={thayDoiForm}
                    maxLength={255}
                  />
                </label>

                <label className="qlqa-field qlqa-field-full">
                  Mô tả SEO
                  <textarea
                    name="moTaSeo"
                    rows="2"
                    value={form.moTaSeo}
                    onChange={thayDoiForm}
                    maxLength={320}
                  />
                </label>

                <label className="qlqa-field qlqa-field-full">
                  Từ khóa SEO
                  <input
                    name="tuKhoaSeo"
                    value={form.tuKhoaSeo}
                    onChange={thayDoiForm}
                    maxLength={1000}
                  />
                </label>
              </div>

              <div className="qlqa-checkboxes">
                <label>
                  <input
                    name="hoatDong"
                    type="checkbox"
                    checked={Boolean(form.hoatDong)}
                    onChange={thayDoiForm}
                  />
                  Đang hoạt động
                </label>

                <label>
                  <input
                    name="noiBat"
                    type="checkbox"
                    checked={Boolean(form.noiBat)}
                    onChange={thayDoiForm}
                  />
                  Đánh dấu nổi bật
                </label>
              </div>
            </div>

            <div className="qlqa-modal-foot">
              <button
                type="button"
                className="qlqa-btn qlqa-btn-secondary"
                onClick={() => setModalForm(false)}
                disabled={dangLuu}
              >
                Hủy
              </button>

              <button
                type="submit"
                className="qlqa-btn qlqa-btn-primary"
                disabled={dangLuu}
              >
                {dangLuu ? "Đang lưu..." : "Lưu thông tin"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CHI TIẾT */}
      {modalChiTiet && quanDangChon && (
        <div
          className="qlqa-overlay"
          onClick={() => setModalChiTiet(false)}
        >
          <div
            className="qlqa-modal qlqa-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="qlqa-modal-head">
              <div>
                <h2>Chi tiết quán ăn</h2>
                <p>Thông tin lấy trực tiếp từ backend.</p>
              </div>
              <button onClick={() => setModalChiTiet(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="qlqa-detail-content">
              <h3>{quanDangChon.tenQuan}</h3>

              <p><strong>Địa chỉ:</strong> {quanDangChon.diaChi || "Chưa cập nhật"}</p>
              <p><strong>Tỉnh/thành:</strong> {quanDangChon.tenTinhThanh || "Chưa cập nhật"}</p>
              <p><strong>Phường/xã:</strong> {quanDangChon.tenPhuongXa || "Chưa cập nhật"}</p>
              <p><strong>Điện thoại:</strong> {quanDangChon.soDienThoai || "Chưa cập nhật"}</p>
              <p><strong>Email:</strong> {quanDangChon.email || "Chưa cập nhật"}</p>
              <p><strong>Giá từ:</strong> {DINH_DANG_TIEN(quanDangChon.giaTu)}</p>
              <p><strong>Giá đến:</strong> {DINH_DANG_TIEN(quanDangChon.giaDen)}</p>
              <p><strong>Mô tả ngắn:</strong> {quanDangChon.moTaNgan || "Chưa cập nhật"}</p>
              <p><strong>Mô tả chi tiết:</strong> {quanDangChon.moTaChiTiet || "Chưa cập nhật"}</p>
              <p><strong>Trạng thái:</strong> {quanDangChon.hoatDong ? "Đang hoạt động" : "Ngừng hoạt động"}</p>
              <p><strong>Nổi bật:</strong> {quanDangChon.noiBat ? "Có" : "Không"}</p>
            </div>

            <div className="qlqa-modal-foot">
              <button
                className="qlqa-btn qlqa-btn-secondary"
                onClick={() => setModalChiTiet(false)}
              >
                Đóng
              </button>

              <button
                className="qlqa-btn qlqa-btn-primary"
                onClick={() => {
                  setModalChiTiet(false);
                  moFormSua(quanDangChon);
                }}
              >
                <Pencil size={16} />
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {quanCanXoa && (
        <div
          className="qlqa-overlay"
          onClick={() => setQuanCanXoa(null)}
        >
          <div
            className="qlqa-modal qlqa-confirm-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="qlqa-confirm-icon">
              <Trash2 size={25} />
            </div>

            <h2>Ngừng hoạt động quán?</h2>
            <p>
              Bạn đang chọn <strong>{quanCanXoa.tenQuan}</strong>.
              Quán sẽ được chuyển sang trạng thái ngừng hoạt động.
            </p>
            <p className="qlqa-warning">
              Đây là xóa mềm. Các dữ liệu giờ mở cửa, hình ảnh, danh mục
              và tiện ích liên quan không bị xóa vật lý.
            </p>

            <div className="qlqa-confirm-actions">
              <button
                className="qlqa-btn qlqa-btn-secondary"
                onClick={() => setQuanCanXoa(null)}
              >
                Hủy
              </button>

              <button
                className="qlqa-btn qlqa-btn-danger"
                onClick={xacNhanXoa}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THÔNG BÁO */}
      {thongBao && (
        <div className={`qlqa-toast qlqa-toast-${thongBao.loai}`}>
          <span>{thongBao.noiDung}</span>
          <button onClick={() => setThongBao(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* MODAL QUẢN LÝ GIỜ MỞ CỬA */}
      {quanAnDangMoGio && (
        <GioMoCuaModal
          quanAn={quanAnDangMoGio}
          onClose={() => setQuanAnDangMoGio(null)}
        />
      )}

      {/* MODAL QUẢN LÝ DANH MỤC QUÁN */}
      {quanAnDangMoDanhMuc && (
        <QuanAnDanhMucModal
          quanAn={quanAnDangMoDanhMuc}
          onClose={() => setQuanAnDangMoDanhMuc(null)}
        />
      )}

      {/* MODAL QUẢN LÝ HÌNH ẢNH QUÁN */}
      {quanAnDangMoHinhAnh && (
        <HinhAnhQuanModal
          quanAn={quanAnDangMoHinhAnh}
          onClose={() => setQuanAnDangMoHinhAnh(null)}
          onThongBao={hienThongBao}
        />
      )}

      {quanAnDangMoTienIch && (
        <QuanAnTienIchModal
          quanAn={quanAnDangMoTienIch}
          onClose={() => setQuanAnDangMoTienIch(null)}
        />
      )}
    </div>
  );
}

export default QuanLyQuanAn;