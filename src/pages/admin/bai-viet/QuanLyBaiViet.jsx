import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Eye,
  Trash2,
  Star,
  FileText,
  Eye as EyeIcon,
  CheckCircle,
  XCircle,
  CalendarDays,
  FolderOpen,
  X,
  Save,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

import * as baiVietService from "../../../services/admin/BaiVietService";
import * as danhMucBaiVietService from "../../../services/admin/DanhMucBaiVietService";
import * as hinhAnhService from "../../../services/admin/HinhAnhBaiVietService"

import "./QuanLyBaiViet.css";
import TrinhSoanThao from "../../../components/admin/bai-viet/TrinhSoanThao";
import ThuVienAnhBaiViet from "../../admin/hinh-anh-bai-viet/ThuVienAnhBaiViet";

// ==========================================
// GIÁ TRỊ MẶC ĐỊNH
// ==========================================

const SO_LUONG_MOI_TRANG = 9;

const FORM_MAC_DINH = {
  danhMucBaiVietId: "",
  tieuDe: "",
  duongDanSeo: "",
  tomTat: "",
  noiDung: "",
  hinhDaiDien: "",
  hinhDaiDienAlt: "",
  tuKhoaChinh: "",
  tieuDeSeo: "",
  moTaSeo: "",
  tuKhoaSeo: "",
  hoatDong: true,
  noiBat: false,
};

// ==========================================
// HÀM HỖ TRỢ
// ==========================================

// Lấy danh sách từ nhiều dạng response
function layDanhSach(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;

  return [];
}

// Lấy dữ liệu từ response
function layDuLieu(data) {
  return data?.data ?? data;
}

// Chuyển chuỗi thành slug
function taoSlug(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Định dạng ngày tháng
function dinhDangNgay(ngay) {
  if (!ngay) return "Chưa xuất bản";

  const date = new Date(ngay);

  if (Number.isNaN(date.getTime())) return "Không xác định";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Lấy thông báo lỗi
function layThongBaoLoi(error) {
  return error?.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
}

// ==========================================
// COMPONENT CHÍNH
// ==========================================

function QuanLyBaiViet() {
  // ------------------------------------------
  // STATE DỮ LIỆU
  // ------------------------------------------

  const [danhSachBaiViet, setDanhSachBaiViet] = useState([]);
  const [danhSachDanhMuc, setDanhSachDanhMuc] = useState([]);

  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);

  const [loi, setLoi] = useState("");

  // ------------------------------------------
  // STATE TÌM KIẾM VÀ LỌC
  // ------------------------------------------

  const [tuKhoa, setTuKhoa] = useState("");
  const [tuKhoaDebounce, setTuKhoaDebounce] = useState("");

  const [locDanhMuc, setLocDanhMuc] = useState("");
  const [locTrangThai, setLocTrangThai] = useState("");
  const [locNoiBat, setLocNoiBat] = useState("");

  // ------------------------------------------
  // STATE PHÂN TRANG
  // ------------------------------------------

  const [trangHienTai, setTrangHienTai] = useState(0);
  const [tongTrang, setTongTrang] = useState(0);
  const [tongBaiViet, setTongBaiViet] = useState(0);

  // ------------------------------------------
  // STATE MODAL
  // ------------------------------------------

  const [modalForm, setModalForm] = useState(false);
  const [modalChiTiet, setModalChiTiet] = useState(false);
  const [modalXoa, setModalXoa] = useState(false);

  const [cheDoForm, setCheDoForm] = useState("create");

  const [baiVietDangChon, setBaiVietDangChon] = useState(null);

  const [form, setForm] = useState(FORM_MAC_DINH);
  const [loiForm, setLoiForm] = useState("");

  const [tuDongTaoSlug, setTuDongTaoSlug] = useState(true);

  // ------------------------------------------
  // STATE THÔNG BÁO
  // ------------------------------------------

  const [thongBao, setThongBao] = useState(null);


  const [moThuVienAnh, setMoThuVienAnh] = useState(false);
  const [anhCanChen, setAnhCanChen] = useState(null);

  // ==========================================
  // THÔNG BÁO
  // ==========================================


  const xuLyMoThuVienAnh = () => {
    if (!baiVietDangChon?.id) {
      hienThongBao(
        "Vui lòng lưu bài viết trước khi sử dụng thư viện ảnh.",
        "error"
      );
      return;
    }

    setMoThuVienAnh(true);
  };

  const hienThongBao = useCallback((noiDung, loai = "success") => {
    setThongBao({ noiDung, loai });

    setTimeout(() => {
      setThongBao(null);
    }, 3500);
  }, []);

  // ==========================================
  // TẢI DANH SÁCH BÀI VIẾT
  // ==========================================

  const taiDanhSachBaiViet = useCallback(async () => {
    try {
      setDangTai(true);
      setLoi("");

      const params = {
        keyword: tuKhoaDebounce,
        danhMucId: locDanhMuc || undefined,
        hoatDong:
          locTrangThai === ""
            ? undefined
            : locTrangThai === "true",
        noiBat:
          locNoiBat === ""
            ? undefined
            : locNoiBat === "true",
        page: trangHienTai,
        size: SO_LUONG_MOI_TRANG,
      };

      const response = await baiVietService.getAll(params);

      const data = layDuLieu(response);

      setDanhSachBaiViet(layDanhSach(data));

      setTongBaiViet(data?.totalElements ?? 0);
      setTongTrang(data?.totalPages ?? 0);
    } catch (error) {
      console.error("Lỗi tải danh sách bài viết:", error);

      setLoi(layThongBaoLoi(error));
      setDanhSachBaiViet([]);
      setTongBaiViet(0);
      setTongTrang(0);
    } finally {
      setDangTai(false);
    }
  }, [
    tuKhoaDebounce,
    locDanhMuc,
    locTrangThai,
    locNoiBat,
    trangHienTai,
  ]);

  // ==========================================
  // TẢI DANH MỤC BÀI VIẾT
  // ==========================================

  const taiDanhSachDanhMuc = useCallback(async () => {
    try {
      const response = await danhMucBaiVietService.getActive();

      setDanhSachDanhMuc(layDanhSach(layDuLieu(response)));
    } catch (error) {
      console.error("Lỗi tải danh mục bài viết:", error);
    }
  }, []);

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    taiDanhSachDanhMuc();
  }, [taiDanhSachDanhMuc]);

  // Debounce tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setTuKhoaDebounce(tuKhoa);
      setTrangHienTai(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [tuKhoa]);

  // Tải bài viết khi bộ lọc hoặc trang thay đổi
  useEffect(() => {
    taiDanhSachBaiViet();
  }, [taiDanhSachBaiViet]);

  // ==========================================
  // THỐNG KÊ BÀI VIẾT TRÊN TRANG HIỆN TẠI
  // ==========================================

  const thongKe = useMemo(() => {
    return {
      tong: tongBaiViet,

      dangHoatDong: danhSachBaiViet.filter(
        (item) => item.hoatDong === true
      ).length,

      noiBat: danhSachBaiViet.filter(
        (item) => item.noiBat === true
      ).length,

      tongLuotXem: danhSachBaiViet.reduce(
        (total, item) => total + (item.luotXem || 0),
        0
      ),
    };
  }, [danhSachBaiViet, tongBaiViet]);

  // ==========================================
  // MỞ FORM THÊM BÀI VIẾT
  // ==========================================

  const moFormThem = () => {
    setCheDoForm("create");

    setBaiVietDangChon(null);
    setAnhCanChen(null);
    setMoThuVienAnh(false);

    setForm({
      ...FORM_MAC_DINH,
      danhMucBaiVietId: danhSachDanhMuc[0]?.id?.toString() || "",
    });

    setTuDongTaoSlug(true);
    setLoiForm("");
    setModalForm(true);
  };

  // ==========================================
  // MỞ FORM CHỈNH SỬA
  // ==========================================

  const moFormSua = async (baiViet) => {
    try {
      setDangLuu(true);

      const response = await baiVietService.getById(baiViet.id);
      const data = layDuLieu(response);

      setCheDoForm("update");

      setForm({
        danhMucBaiVietId:
          data.danhMucBaiVietId?.toString() || "",

        tieuDe: data.tieuDe || "",
        duongDanSeo: data.duongDanSeo || "",
        tomTat: data.tomTat || "",
        noiDung: data.noiDung || "",
        hinhDaiDien: data.hinhDaiDien || "",
        hinhDaiDienAlt: data.hinhDaiDienAlt || "",
        tuKhoaChinh: data.tuKhoaChinh || "",
        tieuDeSeo: data.tieuDeSeo || "",
        moTaSeo: data.moTaSeo || "",
        tuKhoaSeo: data.tuKhoaSeo || "",
        hoatDong: data.hoatDong ?? true,
        noiBat: data.noiBat ?? false,
      });

      setTuDongTaoSlug(false);
      setBaiVietDangChon(data);
      setLoiForm("");
      setModalForm(true);
    } catch (error) {
      hienThongBao(layThongBaoLoi(error), "error");
    } finally {
      setDangLuu(false);
    }
  };

  // ==========================================
  // THAY ĐỔI DỮ LIỆU FORM
  // ==========================================

  const xuLyThayDoiForm = (event) => {
    const { name, value, type, checked } = event.target;

    const giaTri = type === "checkbox" ? checked : value;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: giaTri,
      };

      // Tự tạo slug khi nhập tiêu đề
      if (name === "tieuDe" && tuDongTaoSlug) {
        next.duongDanSeo = taoSlug(value);
      }

      return next;
    });
  };

  // ==========================================
  // THAY ĐỔI SLUG THỦ CÔNG
  // ==========================================

  const xuLyThayDoiSlug = (event) => {
    setTuDongTaoSlug(false);

    setForm((prev) => ({
      ...prev,
      duongDanSeo: taoSlug(event.target.value),
    }));
  };

  // ==========================================
  // KIỂM TRA SLUG
  // ==========================================

  const kiemTraSlug = async () => {
    const slug = form.duongDanSeo.trim();

    if (!slug) {
      throw new Error("Vui lòng nhập đường dẫn SEO.");
    }

    const response = await baiVietService.checkSlug(
      slug,
      cheDoForm === "update" ? baiVietDangChon?.id : null
    );

    const data = layDuLieu(response);

    if (data?.hopLe === false || data?.daTonTai === true) {
      throw new Error("Đường dẫn SEO đã tồn tại hoặc không hợp lệ.");
    }
  };

  // ==========================================
  // KIỂM TRA VÀ LƯU BÀI VIẾT
  // ==========================================

  const xuLyLuuBaiViet = async (event) => {
    event.preventDefault();

    try {
      setDangLuu(true);
      setLoiForm("");

      if (!form.danhMucBaiVietId) {
        throw new Error("Vui lòng chọn danh mục bài viết.");
      }

      if (!form.tieuDe.trim()) {
        throw new Error("Vui lòng nhập tiêu đề bài viết.");
      }

      if (!form.duongDanSeo.trim()) {
        throw new Error("Vui lòng nhập đường dẫn SEO.");
      }

      await kiemTraSlug();

      const payload = {
        danhMucBaiVietId: Number(form.danhMucBaiVietId),
        tieuDe: form.tieuDe.trim(),
        duongDanSeo: form.duongDanSeo.trim(),
        tomTat: form.tomTat.trim(),
        noiDung: form.noiDung,
        hinhDaiDien: form.hinhDaiDien.trim(),
        hinhDaiDienAlt: form.hinhDaiDienAlt.trim(),
        tuKhoaChinh: form.tuKhoaChinh.trim(),
        tieuDeSeo: form.tieuDeSeo.trim(),
        moTaSeo: form.moTaSeo.trim(),
        tuKhoaSeo: form.tuKhoaSeo.trim(),
        hoatDong: form.hoatDong,
        noiBat: form.noiBat,
      };

      if (cheDoForm === "create") {
        const response = await baiVietService.create(payload);
        const data = layDuLieu(response);

        // Lấy ID bài viết vừa tạo
        const baiVietId = data?.id;

        if (!baiVietId) {
          throw new Error(
            "Bài viết đã được gửi nhưng không nhận được ID trả về từ API."
          );
        }

        setBaiVietDangChon(data);
        setCheDoForm("update");

        hienThongBao("Thêm bài viết thành công! Bạn có thể quản lý thư viện ảnh.");
      } else {
        await baiVietService.update(baiVietDangChon.id, payload);

        hienThongBao("Cập nhật bài viết thành công!");
      }

      setTrangHienTai(0);

      await taiDanhSachBaiViet();
    } catch (error) {
      console.error("Lỗi lưu bài viết:", error);

      setLoiForm(layThongBaoLoi(error));
    } finally {
      setDangLuu(false);
    }
  };

  // ==========================================
  // XEM CHI TIẾT BÀI VIẾT
  // ==========================================

  const moChiTiet = async (baiViet) => {
    try {
      setDangLuu(true);

      const response = await baiVietService.getById(baiViet.id);

      setBaiVietDangChon(layDuLieu(response));
      setModalChiTiet(true);
    } catch (error) {
      hienThongBao(layThongBaoLoi(error), "error");
    } finally {
      setDangLuu(false);
    }
  };

  // ==========================================
  // BẬT / TẮT TRẠNG THÁI
  // ==========================================

  const xuLyTrangThai = async (baiViet) => {
    try {
      await baiVietService.updateStatus(
        baiViet.id,
        !baiViet.hoatDong
      );

      hienThongBao(
        baiViet.hoatDong
          ? "Đã ngưng hoạt động bài viết."
          : "Đã kích hoạt bài viết."
      );

      await taiDanhSachBaiViet();
    } catch (error) {
      hienThongBao(layThongBaoLoi(error), "error");
    }
  };

  // ==========================================
  // BẬT / TẮT NỔI BẬT
  // ==========================================

  const xuLyNoiBat = async (baiViet) => {
    try {
      const payload = {
        danhMucBaiVietId: baiViet.danhMucBaiVietId,
        tieuDe: baiViet.tieuDe,
        duongDanSeo: baiViet.duongDanSeo,
        tomTat: baiViet.tomTat || "",
        noiDung: baiViet.noiDung || "",
        hinhDaiDien: baiViet.hinhDaiDien || "",
        hinhDaiDienAlt: baiViet.hinhDaiDienAlt || "",
        tuKhoaChinh: baiViet.tuKhoaChinh || "",
        tieuDeSeo: baiViet.tieuDeSeo || "",
        moTaSeo: baiViet.moTaSeo || "",
        tuKhoaSeo: baiViet.tuKhoaSeo || "",
        hoatDong: baiViet.hoatDong,
        noiBat: !baiViet.noiBat,
      };

      await baiVietService.update(baiViet.id, payload);

      hienThongBao(
        baiViet.noiBat
          ? "Đã bỏ đánh dấu nổi bật."
          : "Đã đánh dấu bài viết nổi bật."
      );

      await taiDanhSachBaiViet();
    } catch (error) {
      hienThongBao(layThongBaoLoi(error), "error");
    }
  };

  // ==========================================
  // MỞ XÁC NHẬN XÓA
  // ==========================================

  const moXacNhanXoa = (baiViet) => {
    setBaiVietDangChon(baiViet);
    setModalXoa(true);
  };

  // ==========================================
  // XÓA MỀM BÀI VIẾT
  // ==========================================

  const xuLyXoaBaiViet = async () => {
    if (!baiVietDangChon) return;

    try {
      setDangLuu(true);

      await baiVietService.remove(baiVietDangChon.id);

      hienThongBao("Đã ngưng hoạt động bài viết.");

      setModalXoa(false);
      setBaiVietDangChon(null);

      // Nếu trang hiện tại chỉ còn một bài viết,
      // chuyển về trang trước để tránh trang trống.
      if (danhSachBaiViet.length === 1 && trangHienTai > 0) {
        setTrangHienTai((prev) => prev - 1);
      } else {
        await taiDanhSachBaiViet();
      }
    } catch (error) {
      hienThongBao(layThongBaoLoi(error), "error");
    } finally {
      setDangLuu(false);
    }
  };

  // ==========================================
  // ĐẶT LẠI BỘ LỌC
  // ==========================================

  const datLaiBoLoc = () => {
    setTuKhoa("");
    setTuKhoaDebounce("");
    setLocDanhMuc("");
    setLocTrangThai("");
    setLocNoiBat("");
    setTrangHienTai(0);
  };

  // ==========================================
  // ĐÓNG MODAL
  // ==========================================

  const dongModalForm = () => {
    if (dangLuu) return;

    setModalForm(false);
    setLoiForm("");
    setBaiVietDangChon(null);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="qlbv-container">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="qlbv-header">
        <div className="qlbv-header-content">
          <div className="qlbv-header-icon">
            <FileText size={25} />
          </div>

          <div>
            <h1>Quản lý bài viết</h1>

            <p>
              Quản lý nội dung, danh mục và trạng thái bài viết trên website.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="qlbv-btn-primary"
          onClick={moFormThem}
        >
          <Plus size={18} />
          <span>Thêm bài viết</span>
        </button>
      </div>

      {/* ======================================
          THỐNG KÊ
      ====================================== */}

      <div className="qlbv-stats">

        <div className="qlbv-stat-card">
          <div className="qlbv-stat-icon qlbv-stat-purple">
            <FileText size={22} />
          </div>

          <div className="qlbv-stat-info">
            <span>Tổng bài viết</span>
            <strong>{thongKe.tong}</strong>
          </div>
        </div>

        <div className="qlbv-stat-card">
          <div className="qlbv-stat-icon qlbv-stat-green">
            <CheckCircle size={22} />
          </div>

          <div className="qlbv-stat-info">
            <span>Đang hoạt động</span>
            <strong>{thongKe.dangHoatDong}</strong>
            <small>Trong trang hiện tại</small>
          </div>
        </div>

        <div className="qlbv-stat-card">
          <div className="qlbv-stat-icon qlbv-stat-orange">
            <Star size={22} />
          </div>

          <div className="qlbv-stat-info">
            <span>Bài viết nổi bật</span>
            <strong>{thongKe.noiBat}</strong>
            <small>Trong trang hiện tại</small>
          </div>
        </div>

        <div className="qlbv-stat-card">
          <div className="qlbv-stat-icon qlbv-stat-blue">
            <EyeIcon size={22} />
          </div>

          <div className="qlbv-stat-info">
            <span>Lượt xem</span>
            <strong>
              {thongKe.tongLuotXem.toLocaleString("vi-VN")}
            </strong>
            <small>Trong trang hiện tại</small>
          </div>
        </div>

      </div>

      {/* ======================================
          BỘ LỌC
      ====================================== */}

      <div className="qlbv-filter">

        <div className="qlbv-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề bài viết..."
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
          />

          {tuKhoa && (
            <button
              type="button"
              onClick={() => setTuKhoa("")}
              title="Xóa từ khóa"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <select
          value={locDanhMuc}
          onChange={(e) => {
            setLocDanhMuc(e.target.value);
            setTrangHienTai(0);
          }}
        >
          <option value="">Tất cả danh mục</option>

          {danhSachDanhMuc.map((item) => (
            <option key={item.id} value={item.id}>
              {item.tenDanhMuc}
            </option>
          ))}
        </select>

        <select
          value={locTrangThai}
          onChange={(e) => {
            setLocTrangThai(e.target.value);
            setTrangHienTai(0);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Ngưng hoạt động</option>
        </select>

        <select
          value={locNoiBat}
          onChange={(e) => {
            setLocNoiBat(e.target.value);
            setTrangHienTai(0);
          }}
        >
          <option value="">Tất cả bài viết</option>
          <option value="true">Bài viết nổi bật</option>
          <option value="false">Không nổi bật</option>
        </select>

        <button
          type="button"
          className="qlbv-btn-reset"
          onClick={datLaiBoLoc}
          title="Đặt lại bộ lọc"
        >
          <RotateCcw size={17} />
          <span>Đặt lại</span>
        </button>

      </div>

      {/* ======================================
          TIÊU ĐỀ DANH SÁCH
      ====================================== */}

      <div className="qlbv-list-header">
        <div>
          <h2>Danh sách bài viết</h2>

          <p>
            Tìm thấy <strong>{tongBaiViet}</strong> bài viết
          </p>
        </div>

        <button
          type="button"
          className="qlbv-btn-refresh"
          onClick={taiDanhSachBaiViet}
          disabled={dangTai}
          title="Tải lại danh sách"
        >
          <RefreshCw
            size={17}
            className={dangTai ? "qlbv-spin" : ""}
          />
          <span>Làm mới</span>
        </button>
      </div>

      {/* ======================================
          THÔNG BÁO LỖI
      ====================================== */}

      {loi && (
        <div className="qlbv-error">
          <XCircle size={19} />

          <span>{loi}</span>

          <button
            type="button"
            onClick={taiDanhSachBaiViet}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ======================================
          DANH SÁCH CARD
      ====================================== */}

      {dangTai ? (
        <div className="qlbv-loading">
          <RefreshCw size={30} className="qlbv-spin" />
          <span>Đang tải danh sách bài viết...</span>
        </div>
      ) : danhSachBaiViet.length === 0 ? (
        <div className="qlbv-empty">
          <div className="qlbv-empty-icon">
            <FolderOpen size={42} />
          </div>

          <h3>Chưa có bài viết nào</h3>

          <p>
            Không tìm thấy bài viết phù hợp hoặc bạn chưa tạo bài viết.
          </p>

          <button
            type="button"
            className="qlbv-btn-primary"
            onClick={moFormThem}
          >
            <Plus size={18} />
            Thêm bài viết đầu tiên
          </button>
        </div>
      ) : (
        <div className="qlbv-grid">

          {danhSachBaiViet.map((item) => (
            <article className="qlbv-card" key={item.id}>

              {/* ẢNH ĐẠI DIỆN */}

              <div className="qlbv-card-image">
                {item.hinhDaiDien ? (
                  <img
                    src={hinhAnhService.getImageUrl(item.hinhDaiDien)}
                    alt={item.hinhDaiDienAlt || item.tieuDe}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="qlbv-image-placeholder">
                    <ImageIcon size={38} />
                    <span>Chưa có ảnh đại diện</span>
                  </div>
                )}

                <div className="qlbv-card-badges">
                  {item.noiBat && (
                    <span className="qlbv-badge-featured">
                      <Star size={13} fill="currentColor" />
                      Nổi bật
                    </span>
                  )}

                  <span
                    className={
                      item.hoatDong
                        ? "qlbv-badge-active"
                        : "qlbv-badge-inactive"
                    }
                  >
                    {item.hoatDong
                      ? "Đang hoạt động"
                      : "Ngưng hoạt động"}
                  </span>
                </div>
              </div>

              {/* NỘI DUNG CARD */}

              <div className="qlbv-card-body">

                <div className="qlbv-card-category">
                  <FolderOpen size={14} />
                  <span>
                    {item.tenDanhMuc || "Chưa phân loại"}
                  </span>
                </div>

                <h3 title={item.tieuDe}>
                  {item.tieuDe}
                </h3>

                <p className="qlbv-card-summary">
                  {item.tomTat || "Bài viết chưa có phần tóm tắt."}
                </p>

                <div className="qlbv-card-meta">

                  <span>
                    <EyeIcon size={15} />
                    {(item.luotXem || 0).toLocaleString("vi-VN")} lượt xem
                  </span>

                  <span>
                    <CalendarDays size={15} />
                    {dinhDangNgay(item.ngayDang || item.ngayTao)}
                  </span>

                </div>

                {/* NÚT CHỨC NĂNG */}

                <div className="qlbv-card-actions">

                  <button
                    type="button"
                    className="qlbv-action-view"
                    onClick={() => moChiTiet(item)}
                    title="Xem chi tiết"
                  >
                    <Eye size={16} />
                    <span>Chi tiết</span>
                  </button>

                  <button
                    type="button"
                    className="qlbv-action-edit"
                    onClick={() => moFormSua(item)}
                    title="Chỉnh sửa"
                  >
                    <Edit size={16} />
                    <span>Sửa</span>
                  </button>

                  <button
                    type="button"
                    className={
                      item.noiBat
                        ? "qlbv-action-featured active"
                        : "qlbv-action-featured"
                    }
                    onClick={() => xuLyNoiBat(item)}
                    title={
                      item.noiBat
                        ? "Bỏ nổi bật"
                        : "Đánh dấu nổi bật"
                    }
                  >
                    <Star
                      size={16}
                      fill={item.noiBat ? "currentColor" : "none"}
                    />
                  </button>

                  <button
                    type="button"
                    className={
                      item.hoatDong
                        ? "qlbv-action-status"
                        : "qlbv-action-status inactive"
                    }
                    onClick={() => xuLyTrangThai(item)}
                    title={
                      item.hoatDong
                        ? "Ngưng hoạt động"
                        : "Kích hoạt"
                    }
                  >
                    {item.hoatDong ? (
                      <XCircle size={16} />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                  </button>

                  <button
                    type="button"
                    className="qlbv-action-delete"
                    onClick={() => moXacNhanXoa(item)}
                    title="Xóa bài viết"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              </div>

            </article>
          ))}

        </div>
      )}

      {/* ======================================
          PHÂN TRANG
      ====================================== */}

      {!dangTai && danhSachBaiViet.length > 0 && (
        <div className="qlbv-pagination">

          <span>
            Trang <strong>{trangHienTai + 1}</strong>
            {" / "}
            <strong>{Math.max(tongTrang, 1)}</strong>
          </span>

          <div className="qlbv-pagination-actions">

            <button
              type="button"
              disabled={trangHienTai <= 0}
              onClick={() => setTrangHienTai((prev) => prev - 1)}
              title="Trang trước"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from(
              { length: tongTrang },
              (_, index) => index
            )
              .filter(
                (page) =>
                  page === 0 ||
                  page === tongTrang - 1 ||
                  Math.abs(page - trangHienTai) <= 1
              )
              .map((page, index, arr) => {
                const hienThiCham =
                  index > 0 && page - arr[index - 1] > 1;

                return (
                  <span key={page} className="qlbv-page-item">
                    {hienThiCham && <span>...</span>}

                    <button
                      type="button"
                      className={
                        trangHienTai === page ? "active" : ""
                      }
                      onClick={() => setTrangHienTai(page)}
                    >
                      {page + 1}
                    </button>
                  </span>
                );
              })}

            <button
              type="button"
              disabled={
                tongTrang === 0 || trangHienTai >= tongTrang - 1
              }
              onClick={() => setTrangHienTai((prev) => prev + 1)}
              title="Trang sau"
            >
              <ChevronRight size={18} />
            </button>

          </div>

        </div>
      )}

      {/* ======================================
          MODAL THÊM / CHỈNH SỬA
      ====================================== */}

      {modalForm && (
        <div
          className="qlbv-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              dongModalForm();
            }
          }}
        >
          <div className="qlbv-modal qlbv-modal-form">

            <div className="qlbv-modal-header">
              <div>
                <h2>
                  {cheDoForm === "create"
                    ? "Thêm bài viết mới"
                    : "Chỉnh sửa bài viết"}
                </h2>

                <p>
                  Nhập nội dung và thông tin SEO cho bài viết.
                </p>
              </div>

              <button
                type="button"
                onClick={dongModalForm}
                disabled={dangLuu}
              >
                <X size={21} />
              </button>
            </div>

            <form
              className="qlbv-form"
              onSubmit={xuLyLuuBaiViet}
            >

              <div className="qlbv-form-section">
                <h3>Thông tin bài viết</h3>

                <div className="qlbv-form-group">
                  <label>
                    Danh mục bài viết <span>*</span>
                  </label>

                  <select
                    name="danhMucBaiVietId"
                    value={form.danhMucBaiVietId}
                    onChange={xuLyThayDoiForm}
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>

                    {danhSachDanhMuc.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.tenDanhMuc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="qlbv-form-group">
                  <label>
                    Tiêu đề bài viết <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="tieuDe"
                    value={form.tieuDe}
                    onChange={xuLyThayDoiForm}
                    maxLength={500}
                    placeholder="Nhập tiêu đề bài viết..."
                    required
                  />
                </div>

                <div className="qlbv-form-group">
                  <label>
                    Đường dẫn SEO (Slug) <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="duongDanSeo"
                    value={form.duongDanSeo}
                    onChange={xuLyThayDoiSlug}
                    maxLength={255}
                    placeholder="duong-dan-bai-viet"
                    required
                  />

                  <small>
                    Đường dẫn tự động tạo từ tiêu đề. Bạn có thể chỉnh sửa.
                  </small>
                </div>

                <div className="qlbv-form-group">
                  <label>Tóm tắt</label>

                  <textarea
                    name="tomTat"
                    value={form.tomTat}
                    onChange={xuLyThayDoiForm}
                    maxLength={1000}
                    rows={3}
                    placeholder="Nhập phần tóm tắt bài viết..."
                  />

                  <small>{form.tomTat.length}/1000 ký tự</small>
                </div>

                <div className="qlbv-form-group qlbv-form-full">
                  <label>
                    Nội dung bài viết <span className="required">*</span>
                  </label>

                  <TrinhSoanThao
                    value={form.noiDung || ""}
                    onChange={(noiDung) =>
                      setForm((prev) => ({
                        ...prev,
                        noiDung,
                      }))
                    }
                    onMoThuVienAnh={xuLyMoThuVienAnh}
                    anhCanChen={anhCanChen}
                    placeholder="Bắt đầu viết nội dung bài viết..."
                  />
                </div>
              </div>



              <div className="qlbv-form-section">
                <h3>Hình ảnh đại diện</h3>

                <div className="qlbv-form-group">
                  <label>Đường dẫn hình ảnh</label>

                  <input
                    type="text"
                    name="hinhDaiDien"
                    value={form.hinhDaiDien}
                    onChange={xuLyThayDoiForm}
                    maxLength={2048}
                    placeholder="https://..."
                  />

                  <small>
                    Phần upload ảnh và quản lý thư viện ảnh sẽ được triển khai riêng.
                  </small>
                </div>

                <div className="qlbv-form-group">
                  <label>Văn bản thay thế ảnh (Alt)</label>

                  <input
                    type="text"
                    name="hinhDaiDienAlt"
                    value={form.hinhDaiDienAlt}
                    onChange={xuLyThayDoiForm}
                    maxLength={500}
                    placeholder="Mô tả nội dung hình ảnh..."
                  />
                </div>

                {form.hinhDaiDien && (
                  <div className="qlbv-form-image-preview">
                    <img
                      src={form.hinhDaiDien}
                      alt={form.hinhDaiDienAlt || "Ảnh đại diện"}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="qlbv-form-section">
                <h3>Tối ưu SEO</h3>

                <div className="qlbv-form-group">
                  <label>Từ khóa chính</label>

                  <input
                    type="text"
                    name="tuKhoaChinh"
                    value={form.tuKhoaChinh}
                    onChange={xuLyThayDoiForm}
                    maxLength={255}
                    placeholder="Nhập từ khóa chính..."
                  />
                </div>

                <div className="qlbv-form-group">
                  <label>Tiêu đề SEO</label>

                  <input
                    type="text"
                    name="tieuDeSeo"
                    value={form.tieuDeSeo}
                    onChange={xuLyThayDoiForm}
                    maxLength={255}
                    placeholder="Nhập tiêu đề SEO..."
                  />
                </div>

                <div className="qlbv-form-group">
                  <label>Mô tả SEO</label>

                  <textarea
                    name="moTaSeo"
                    value={form.moTaSeo}
                    onChange={xuLyThayDoiForm}
                    maxLength={320}
                    rows={3}
                    placeholder="Nhập mô tả SEO..."
                  />

                  <small>{form.moTaSeo.length}/320 ký tự</small>
                </div>

                <div className="qlbv-form-group">
                  <label>Từ khóa SEO</label>

                  <textarea
                    name="tuKhoaSeo"
                    value={form.tuKhoaSeo}
                    onChange={xuLyThayDoiForm}
                    maxLength={1000}
                    rows={2}
                    placeholder="Các từ khóa, cách nhau bằng dấu phẩy..."
                  />
                </div>
              </div>

              <div className="qlbv-form-section">
                <h3>Trạng thái bài viết</h3>

                <label className="qlbv-checkbox">
                  <input
                    type="checkbox"
                    name="hoatDong"
                    checked={form.hoatDong}
                    onChange={xuLyThayDoiForm}
                  />

                  <span>Cho phép hoạt động</span>
                </label>

                <label className="qlbv-checkbox">
                  <input
                    type="checkbox"
                    name="noiBat"
                    checked={form.noiBat}
                    onChange={xuLyThayDoiForm}
                  />

                  <span>Đánh dấu bài viết nổi bật</span>
                </label>
              </div>

              {loiForm && (
                <div className="qlbv-form-error">
                  <XCircle size={17} />
                  {loiForm}
                </div>
              )}

              <div className="qlbv-modal-footer">
                <button
                  type="button"
                  className="qlbv-btn-cancel"
                  onClick={dongModalForm}
                  disabled={dangLuu}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="qlbv-btn-primary"
                  disabled={dangLuu}
                >
                  {dangLuu ? (
                    <>
                      <RefreshCw size={17} className="qlbv-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      {cheDoForm === "create"
                        ? "Thêm bài viết"
                        : "Lưu thay đổi"}
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================
          MODAL CHI TIẾT
      ====================================== */}

      {modalChiTiet && baiVietDangChon && (
        <div
          className="qlbv-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setModalChiTiet(false);
              setBaiVietDangChon(null);
            }
          }}
        >
          <div className="qlbv-modal qlbv-modal-detail">

            <div className="qlbv-modal-header">
              <div>
                <h2>Chi tiết bài viết</h2>
                <p>Thông tin đầy đủ của bài viết.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalChiTiet(false);
                  setBaiVietDangChon(null);
                }}
              >
                <X size={21} />
              </button>
            </div>

            <div className="qlbv-detail-content">

              {baiVietDangChon.hinhDaiDien && (
                <div className="qlbv-detail-image">
                  <img
                    src={baiVietDangChon.hinhDaiDien}
                    alt={
                      baiVietDangChon.hinhDaiDienAlt ||
                      baiVietDangChon.tieuDe
                    }
                  />
                </div>
              )}

              <div className="qlbv-detail-badges">
                <span className="qlbv-badge-category">
                  {baiVietDangChon.tenDanhMuc || "Chưa phân loại"}
                </span>

                <span
                  className={
                    baiVietDangChon.hoatDong
                      ? "qlbv-badge-active"
                      : "qlbv-badge-inactive"
                  }
                >
                  {baiVietDangChon.hoatDong
                    ? "Đang hoạt động"
                    : "Ngưng hoạt động"}
                </span>

                {baiVietDangChon.noiBat && (
                  <span className="qlbv-badge-featured">
                    <Star size={13} fill="currentColor" />
                    Nổi bật
                  </span>
                )}
              </div>

              <h2 className="qlbv-detail-title">
                {baiVietDangChon.tieuDe}
              </h2>

              <div className="qlbv-detail-meta">
                <span>
                  <Eye size={15} />
                  {(baiVietDangChon.luotXem || 0).toLocaleString("vi-VN")} lượt xem
                </span>

                <span>
                  <CalendarDays size={15} />
                  {dinhDangNgay(
                    baiVietDangChon.ngayDang ||
                    baiVietDangChon.ngayTao
                  )}
                </span>
              </div>

              <div className="qlbv-detail-section">
                <h3>Tóm tắt</h3>
                <p>
                  {baiVietDangChon.tomTat || "Chưa có tóm tắt."}
                </p>
              </div>

              <div className="qlbv-detail-section">
                <h3>Nội dung</h3>

                <div className="qlbv-detail-text">
                  {baiVietDangChon.noiDung || "Chưa có nội dung."}
                </div>
              </div>

              <div className="qlbv-detail-section">
                <h3>Thông tin SEO</h3>

                <div className="qlbv-detail-info">
                  <span>Slug</span>
                  <strong>{baiVietDangChon.duongDanSeo || "—"}</strong>
                </div>

                <div className="qlbv-detail-info">
                  <span>Từ khóa chính</span>
                  <strong>{baiVietDangChon.tuKhoaChinh || "—"}</strong>
                </div>

                <div className="qlbv-detail-info">
                  <span>Tiêu đề SEO</span>
                  <strong>{baiVietDangChon.tieuDeSeo || "—"}</strong>
                </div>

                <div className="qlbv-detail-info">
                  <span>Mô tả SEO</span>
                  <strong>{baiVietDangChon.moTaSeo || "—"}</strong>
                </div>

                <div className="qlbv-detail-info">
                  <span>Từ khóa SEO</span>
                  <strong>{baiVietDangChon.tuKhoaSeo || "—"}</strong>
                </div>
              </div>

              <div className="qlbv-detail-section">
                <h3>Thời gian</h3>

                <div className="qlbv-detail-info">
                  <span>Ngày tạo</span>
                  <strong>{dinhDangNgay(baiVietDangChon.ngayTao)}</strong>
                </div>

                <div className="qlbv-detail-info">
                  <span>Ngày cập nhật</span>
                  <strong>{dinhDangNgay(baiVietDangChon.ngayCapNhat)}</strong>
                </div>

                <div className="qlbv-detail-info">
                  <span>Ngày đăng</span>
                  <strong>{dinhDangNgay(baiVietDangChon.ngayDang)}</strong>
                </div>
              </div>

            </div>

            <div className="qlbv-modal-footer">
              <button
                type="button"
                className="qlbv-btn-cancel"
                onClick={() => {
                  setModalChiTiet(false);
                  setBaiVietDangChon(null);
                }}
              >
                Đóng
              </button>

              <button
                type="button"
                className="qlbv-btn-primary"
                onClick={() => {
                  const baiViet = baiVietDangChon;

                  setModalChiTiet(false);
                  moFormSua(baiViet);
                }}
              >
                <Edit size={17} />
                Chỉnh sửa
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================
          MODAL XÁC NHẬN XÓA
      ====================================== */}

      {modalXoa && baiVietDangChon && (
        <div className="qlbv-modal-overlay">
          <div className="qlbv-modal qlbv-modal-confirm">

            <div className="qlbv-confirm-icon">
              <Trash2 size={28} />
            </div>

            <h2>Ngưng hoạt động bài viết?</h2>

            <p>
              Bạn có chắc muốn ngưng hoạt động bài viết
              {" "}
              <strong>{baiVietDangChon.tieuDe}</strong>?
            </p>

            <p className="qlbv-confirm-note">
              Bài viết sẽ không bị xóa khỏi cơ sở dữ liệu.
            </p>

            <div className="qlbv-modal-footer">
              <button
                type="button"
                className="qlbv-btn-cancel"
                onClick={() => {
                  setModalXoa(false);
                  setBaiVietDangChon(null);
                }}
                disabled={dangLuu}
              >
                Hủy
              </button>

              <button
                type="button"
                className="qlbv-btn-danger"
                onClick={xuLyXoaBaiViet}
                disabled={dangLuu}
              >
                {dangLuu ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================
          TOAST THÔNG BÁO
      ====================================== */}

      {thongBao && (
        <div
          className={`qlbv-toast ${thongBao.loai === "error"
            ? "qlbv-toast-error"
            : "qlbv-toast-success"
            }`}
        >
          {thongBao.loai === "error" ? (
            <XCircle size={19} />
          ) : (
            <CheckCircle size={19} />
          )}

          <span>{thongBao.noiDung}</span>

          <button
            type="button"
            onClick={() => setThongBao(null)}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {moThuVienAnh && (
        <div className="qlbv-thuvien-modal-overlay">
          <div className="qlbv-thuvien-modal">
            <div className="qlbv-thuvien-modal-header">
              <h3>Thư viện ảnh bài viết</h3>

              <button
                type="button"
                onClick={() => setMoThuVienAnh(false)}
              >
                <X size={20} />
              </button>
            </div>

            <ThuVienAnhBaiViet
              baiVietId={baiVietDangChon?.id}
              anhDaiDien={form.hinhDaiDien}
              onChonAnh={(anh) => {
                setAnhCanChen(anh);
                setMoThuVienAnh(false);
              }}
              onDatAnhDaiDien={(anh) => {
                setForm((prev) => ({
                  ...prev,
                  hinhDaiDien: anh.urlAnh,
                  hinhDaiDienAlt: anh.altText || "",
                }));
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default QuanLyBaiViet;