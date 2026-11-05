import { useCallback, useEffect, useState } from "react";

import {
  Search,
  RefreshCw,
  Eye,
  Phone,
  Mail,
  MapPin,
  Store,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  MessageCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  LoaderCircle,
  Handshake,
  ClipboardList,
  UserRound,
  Filter,
  AlertCircle,
} from "lucide-react";

import {
  layTatCaDangKyHopTac,
  layChiTietDangKyHopTac,
  capNhatTrangThaiHopTac,
  capNhatGhiChuHopTac,
} from "../../../services/admin/DangKyHopTacService";

import "./QuanLyDangKyHopTac.css";

const KICH_THUOC_TRANG = 8;

const TRANG_THAI = {
  CHO_XU_LY: {
    ten: "Chờ xử lý",
    className: "hop-tac-status-pending",
  },
  DANG_LIEN_HE: {
    ten: "Đang liên hệ",
    className: "hop-tac-status-contact",
  },
  DA_DUYET: {
    ten: "Đã duyệt",
    className: "hop-tac-status-approved",
  },
  TU_CHOI: {
    ten: "Từ chối",
    className: "hop-tac-status-rejected",
  },
};

const CAC_TRANG_THAI = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "CHO_XU_LY", label: "Chờ xử lý" },
  { value: "DANG_LIEN_HE", label: "Đang liên hệ" },
  { value: "DA_DUYET", label: "Đã duyệt" },
  { value: "TU_CHOI", label: "Từ chối" },
];

const dinhDangNgay = (giaTri) => {
  if (!giaTri) return "Chưa có thông tin";

  const ngay = new Date(giaTri);

  if (Number.isNaN(ngay.getTime())) return giaTri;

  return ngay.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const layTenTrangThai = (trangThai) => {
  return TRANG_THAI[trangThai]?.ten || trangThai || "Chưa xác định";
};

function QuanLyDangKyHopTac() {
  const [danhSach, setDanhSach] = useState([]);
  const [tuKhoa, setTuKhoa] = useState("");
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [trangThaiLoc, setTrangThaiLoc] = useState("");

  const [trangHienTai, setTrangHienTai] = useState(0);
  const [tongSoTrang, setTongSoTrang] = useState(0);
  const [tongSoDangKy, setTongSoDangKy] = useState(0);

  const [thongKe, setThongKe] = useState({
    choXuLy: 0,
    dangLienHe: 0,
    daDuyet: 0,
    tuChoi: 0,
  });

  const [dangTai, setDangTai] = useState(true);
  const [dangTaiThongKe, setDangTaiThongKe] = useState(true);
  const [loi, setLoi] = useState("");

  // Chi tiết đăng ký
  const [dangMoChiTiet, setDangMoChiTiet] = useState(false);
  const [chiTiet, setChiTiet] = useState(null);
  const [dangTaiChiTiet, setDangTaiChiTiet] = useState(false);

  // Cập nhật trạng thái
  const [trangThaiMoi, setTrangThaiMoi] = useState("");
  const [dangCapNhatTrangThai, setDangCapNhatTrangThai] =
    useState(false);

  // Ghi chú quản trị
  const [ghiChu, setGhiChu] = useState("");
  const [dangLuuGhiChu, setDangLuuGhiChu] = useState(false);

  const [thongBao, setThongBao] = useState(null);

  // ================================
  // THÔNG BÁO
  // ================================

  const hienThongBao = (noiDung, loai = "success") => {
    setThongBao({ noiDung, loai });

    window.setTimeout(() => {
      setThongBao(null);
    }, 3500);
  };

  // ================================
  // LẤY DANH SÁCH
  // ================================

  const taiDanhSach = useCallback(async () => {
    try {
      setDangTai(true);
      setLoi("");

      const response = await layTatCaDangKyHopTac({
        keyword: tuKhoaTimKiem,
        trangThai: trangThaiLoc,
        page: trangHienTai,
        size: KICH_THUOC_TRANG,
      });

      setDanhSach(response.content || []);
      setTongSoTrang(response.totalPages || 0);
      setTongSoDangKy(response.totalElements || 0);
    } catch (error) {
      setLoi(error.message || "Không thể tải danh sách đăng ký hợp tác.");
      setDanhSach([]);
    } finally {
      setDangTai(false);
    }
  }, [tuKhoaTimKiem, trangThaiLoc, trangHienTai]);

  // ================================
  // LẤY THỐNG KÊ
  // ================================

  const taiThongKe = useCallback(async () => {
    try {
      setDangTaiThongKe(true);

      const cacKetQua = await Promise.all(
        [
          "",
          "CHO_XU_LY",
          "DANG_LIEN_HE",
          "DA_DUYET",
          "TU_CHOI",
        ].map((trangThai) =>
          layTatCaDangKyHopTac({
            keyword: "",
            trangThai,
            page: 0,
            size: 1,
          })
        )
      );

      setThongKe({
        tong: cacKetQua[0]?.totalElements || 0,
        choXuLy: cacKetQua[1]?.totalElements || 0,
        dangLienHe: cacKetQua[2]?.totalElements || 0,
        daDuyet: cacKetQua[3]?.totalElements || 0,
        tuChoi: cacKetQua[4]?.totalElements || 0,
      });
    } catch (error) {
      console.error("Lỗi tải thống kê:", error);
    } finally {
      setDangTaiThongKe(false);
    }
  }, []);

  useEffect(() => {
    taiDanhSach();
  }, [taiDanhSach]);

  useEffect(() => {
    taiThongKe();
  }, [taiThongKe]);

  // ================================
  // TÌM KIẾM
  // ================================

  const handleTimKiem = (e) => {
    e.preventDefault();
    setTrangHienTai(0);
    setTuKhoaTimKiem(tuKhoa.trim());
  };

  const handleLocTrangThai = (e) => {
    setTrangThaiLoc(e.target.value);
    setTrangHienTai(0);
  };

  const handleLamMoi = () => {
    setTuKhoa("");
    setTuKhoaTimKiem("");
    setTrangThaiLoc("");
    setTrangHienTai(0);
    taiThongKe();
  };

  // ================================
  // XEM CHI TIẾT
  // ================================

  const moChiTiet = async (id) => {
    try {
      setDangMoChiTiet(true);
      setDangTaiChiTiet(true);
      setChiTiet(null);

      const response = await layChiTietDangKyHopTac(id);

      setChiTiet(response);
      setTrangThaiMoi(response.trangThai || "CHO_XU_LY");
      setGhiChu(response.ghiChuQuanTri || "");
    } catch (error) {
      hienThongBao(
        error.message || "Không thể tải thông tin chi tiết.",
        "error"
      );
      setDangMoChiTiet(false);
    } finally {
      setDangTaiChiTiet(false);
    }
  };

  const dongChiTiet = () => {
    setDangMoChiTiet(false);
    setChiTiet(null);
    setTrangThaiMoi("");
    setGhiChu("");
  };

  // ================================
  // CẬP NHẬT TRẠNG THÁI
  // ================================

  const handleCapNhatTrangThai = async () => {
    if (!chiTiet?.id || !trangThaiMoi) return;

    if (trangThaiMoi === chiTiet.trangThai) {
      hienThongBao("Trạng thái chưa có thay đổi.", "error");
      return;
    }

    try {
      setDangCapNhatTrangThai(true);

      await capNhatTrangThaiHopTac(
        chiTiet.id,
        trangThaiMoi
      );

      const response = await layChiTietDangKyHopTac(chiTiet.id);

      setChiTiet(response);
      setTrangThaiMoi(response.trangThai);

      await Promise.all([taiDanhSach(), taiThongKe()]);

      hienThongBao("Cập nhật trạng thái thành công.");
    } catch (error) {
      hienThongBao(
        error.message || "Không thể cập nhật trạng thái.",
        "error"
      );
    } finally {
      setDangCapNhatTrangThai(false);
    }
  };

  // ================================
  // LƯU GHI CHÚ
  // ================================

  const handleLuuGhiChu = async () => {
    if (!chiTiet?.id) return;

    try {
      setDangLuuGhiChu(true);

      await capNhatGhiChuHopTac(
        chiTiet.id,
        ghiChu
      );

      const response = await layChiTietDangKyHopTac(chiTiet.id);

      setChiTiet(response);
      setGhiChu(response.ghiChuQuanTri || "");

      hienThongBao("Đã lưu ghi chú quản trị.");
    } catch (error) {
      hienThongBao(
        error.message || "Không thể lưu ghi chú.",
        "error"
      );
    } finally {
      setDangLuuGhiChu(false);
    }
  };

  // ================================
  // RENDER TRẠNG THÁI
  // ================================

  const renderTrangThai = (trangThai) => {
    const thongTin = TRANG_THAI[trangThai];

    return (
      <span
        className={`hop-tac-status ${
          thongTin?.className || ""
        }`}
      >
        <span className="status-dot"></span>
        {layTenTrangThai(trangThai)}
      </span>
    );
  };

  // ================================
  // GIAO DIỆN
  // ================================

  return (
    <div className="ql-hop-tac">
      {/* Tiêu đề */}
      <div className="ql-hop-tac-heading">
        <div>
          <div className="ql-hop-tac-breadcrumb">
            <span>Quản lý</span>
            <span>/</span>
            <strong>Đăng ký hợp tác</strong>
          </div>

          <h1>Đăng ký hợp tác</h1>

          <p>
            Quản lý thông tin các đối tác gửi yêu cầu hợp tác
            với Địa điểm ăn uống Cần Thơ.
          </p>
        </div>

        <button
          type="button"
          className="ql-hop-tac-refresh"
          onClick={handleLamMoi}
          disabled={dangTai}
        >
          <RefreshCw
            size={17}
            className={dangTai ? "refresh-spinning" : ""}
          />
          Làm mới
        </button>
      </div>

      {/* Thống kê */}
      <div className="ql-hop-tac-stats">
        <div className="hop-tac-stat-card stat-total">
          <div className="hop-tac-stat-top">
            <div className="hop-tac-stat-icon">
              <ClipboardList size={21} />
            </div>
            <span>Tổng đăng ký</span>
          </div>

          <strong>
            {dangTaiThongKe ? "..." : thongKe.tong}
          </strong>

          <small>Tất cả yêu cầu hợp tác</small>
        </div>

        <div className="hop-tac-stat-card stat-pending">
          <div className="hop-tac-stat-top">
            <div className="hop-tac-stat-icon">
              <Clock3 size={21} />
            </div>
            <span>Chờ xử lý</span>
          </div>

          <strong>
            {dangTaiThongKe ? "..." : thongKe.choXuLy}
          </strong>

          <small>Yêu cầu chưa được tiếp nhận</small>
        </div>

        <div className="hop-tac-stat-card stat-contact">
          <div className="hop-tac-stat-top">
            <div className="hop-tac-stat-icon">
              <Phone size={21} />
            </div>
            <span>Đang liên hệ</span>
          </div>

          <strong>
            {dangTaiThongKe ? "..." : thongKe.dangLienHe}
          </strong>

          <small>Đang trao đổi với đối tác</small>
        </div>

        <div className="hop-tac-stat-card stat-approved">
          <div className="hop-tac-stat-top">
            <div className="hop-tac-stat-icon">
              <CheckCircle2 size={21} />
            </div>
            <span>Đã duyệt</span>
          </div>

          <strong>
            {dangTaiThongKe ? "..." : thongKe.daDuyet}
          </strong>

          <small>Yêu cầu đã được chấp thuận</small>
        </div>

        <div className="hop-tac-stat-card stat-rejected">
          <div className="hop-tac-stat-top">
            <div className="hop-tac-stat-icon">
              <XCircle size={21} />
            </div>
            <span>Từ chối</span>
          </div>

          <strong>
            {dangTaiThongKe ? "..." : thongKe.tuChoi}
          </strong>

          <small>Yêu cầu không được chấp thuận</small>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="ql-hop-tac-toolbar">
        <form
          className="ql-hop-tac-search"
          onSubmit={handleTimKiem}
        >
          <Search size={19} />

          <input
            type="text"
            placeholder="Tìm tên, số điện thoại, email hoặc tên quán..."
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
          />

          {tuKhoa && (
            <button
              type="button"
              className="search-clear"
              onClick={() => {
                setTuKhoa("");
                setTuKhoaTimKiem("");
                setTrangHienTai(0);
              }}
            >
              <X size={16} />
            </button>
          )}

          <button type="submit" className="search-submit">
            Tìm kiếm
          </button>
        </form>

        <div className="ql-hop-tac-filter">
          <Filter size={17} />

          <select
            value={trangThaiLoc}
            onChange={handleLocTrangThai}
          >
            {CAC_TRANG_THAI.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Danh sách */}
      <div className="ql-hop-tac-list-card">
        <div className="ql-hop-tac-list-heading">
          <div>
            <h2>Danh sách yêu cầu</h2>
            <p>
              Có <strong>{tongSoDangKy}</strong> yêu cầu phù hợp
            </p>
          </div>

          <span className="list-heading-icon">
            <Handshake size={21} />
          </span>
        </div>

        {dangTai ? (
          <div className="hop-tac-loading">
            <LoaderCircle size={30} />
            <span>Đang tải danh sách đăng ký...</span>
          </div>
        ) : loi ? (
          <div className="hop-tac-empty hop-tac-error-state">
            <AlertCircle size={35} />
            <h3>Không thể tải dữ liệu</h3>
            <p>{loi}</p>
            <button onClick={taiDanhSach}>
              Thử tải lại
            </button>
          </div>
        ) : danhSach.length === 0 ? (
          <div className="hop-tac-empty">
            <div className="empty-icon">
              <FileText size={35} />
            </div>
            <h3>Chưa có yêu cầu đăng ký</h3>
            <p>
              Không tìm thấy yêu cầu hợp tác nào phù hợp với điều kiện
              tìm kiếm hiện tại.
            </p>
          </div>
        ) : (
          <>
            <div className="ql-hop-tac-table-wrap">
              <table className="ql-hop-tac-table">
                <thead>
                  <tr>
                    <th>KHÁCH HÀNG</th>
                    <th>THÔNG TIN QUÁN</th>
                    <th>NGÀY ĐĂNG KÝ</th>
                    <th>TRẠNG THÁI</th>
                    <th>THAO TÁC</th>
                  </tr>
                </thead>

                <tbody>
                  {danhSach.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {(item.hoTen || "K")
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="customer-info">
                            <strong>{item.hoTen}</strong>
                            <span>
                              <Phone size={12} />
                              {item.soDienThoai}
                            </span>
                            <span>
                              <Mail size={12} />
                              {item.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="shop-cell">
                          <strong>
                            <Store size={15} />
                            {item.tenQuan}
                          </strong>
                          <span>
                            <MapPin size={13} />
                            {item.diaChiQuan}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="date-cell">
                          <CalendarDays size={15} />
                          <span>{dinhDangNgay(item.ngayTao)}</span>
                        </div>
                      </td>

                      <td>{renderTrangThai(item.trangThai)}</td>

                      <td>
                        <button
                          type="button"
                          className="hop-tac-detail-button"
                          onClick={() => moChiTiet(item.id)}
                        >
                          <Eye size={16} />
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            <div className="ql-hop-tac-pagination">
              <span>
                Trang <strong>{trangHienTai + 1}</strong>
                {" / "}
                <strong>{Math.max(tongSoTrang, 1)}</strong>
              </span>

              <div>
                <button
                  type="button"
                  disabled={trangHienTai <= 0}
                  onClick={() =>
                    setTrangHienTai((prev) => Math.max(prev - 1, 0))
                  }
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  disabled={
                    tongSoTrang === 0 ||
                    trangHienTai >= tongSoTrang - 1
                  }
                  onClick={() =>
                    setTrangHienTai((prev) =>
                      Math.min(prev + 1, tongSoTrang - 1)
                    )
                  }
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal chi tiết */}
      {dangMoChiTiet && (
        <div
          className="hop-tac-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) dongChiTiet();
          }}
        >
          <div className="hop-tac-detail-modal">
            <div className="hop-tac-modal-header">
              <div>
                <span>PARTNER REQUEST</span>
                <h2>Chi tiết đăng ký hợp tác</h2>
              </div>

              <button
                type="button"
                onClick={dongChiTiet}
                aria-label="Đóng"
              >
                <X size={21} />
              </button>
            </div>

            {dangTaiChiTiet ? (
              <div className="hop-tac-loading modal-loading">
                <LoaderCircle size={30} />
                <span>Đang tải thông tin...</span>
              </div>
            ) : chiTiet ? (
              <div className="hop-tac-modal-body">
                {/* Thông tin khách hàng */}
                <section className="detail-section">
                  <div className="detail-section-title">
                    <UserRound size={18} />
                    <h3>Thông tin người liên hệ</h3>
                  </div>

                  <div className="detail-info-grid">
                    <div className="detail-info-item">
                      <span>Họ và tên</span>
                      <strong>{chiTiet.hoTen}</strong>
                    </div>

                    <div className="detail-info-item">
                      <span>Số điện thoại</span>
                      <strong>{chiTiet.soDienThoai}</strong>
                    </div>

                    <div className="detail-info-item detail-full">
                      <span>Email</span>
                      <strong>{chiTiet.email}</strong>
                    </div>
                  </div>
                </section>

                {/* Thông tin quán */}
                <section className="detail-section">
                  <div className="detail-section-title">
                    <Store size={18} />
                    <h3>Thông tin quán / thương hiệu</h3>
                  </div>

                  <div className="detail-info-grid">
                    <div className="detail-info-item detail-full">
                      <span>Tên quán</span>
                      <strong>{chiTiet.tenQuan}</strong>
                    </div>

                    <div className="detail-info-item detail-full">
                      <span>Địa chỉ quán</span>
                      <strong>{chiTiet.diaChiQuan}</strong>
                    </div>
                  </div>
                </section>

                {/* Nội dung */}
                <section className="detail-section">
                  <div className="detail-section-title">
                    <MessageCircle size={18} />
                    <h3>Nội dung khách hàng gửi</h3>
                  </div>

                  <div className="detail-message">
                    {chiTiet.noiDung?.trim()
                      ? chiTiet.noiDung
                      : "Khách hàng không để lại nội dung trao đổi."}
                  </div>
                </section>

                <div className="detail-created-date">
                  <CalendarDays size={16} />
                  Ngày đăng ký: {dinhDangNgay(chiTiet.ngayTao)}
                </div>

                {/* Trạng thái */}
                <section className="detail-section">
                  <div className="detail-section-title">
                    <CheckCircle2 size={18} />
                    <h3>Xử lý yêu cầu</h3>
                  </div>

                  <div className="detail-status-control">
                    <select
                      value={trangThaiMoi}
                      onChange={(e) => setTrangThaiMoi(e.target.value)}
                    >
                      {CAC_TRANG_THAI.filter(
                        (item) => item.value !== ""
                      ).map((item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleCapNhatTrangThai}
                      disabled={
                        dangCapNhatTrangThai ||
                        trangThaiMoi === chiTiet.trangThai
                      }
                    >
                      {dangCapNhatTrangThai ? (
                        <LoaderCircle
                          size={16}
                          className="refresh-spinning"
                        />
                      ) : (
                        <Save size={16} />
                      )}
                      Cập nhật
                    </button>
                  </div>

                  <div className="detail-current-status">
                    Trạng thái hiện tại:
                    {renderTrangThai(chiTiet.trangThai)}
                  </div>
                </section>

                {/* Ghi chú */}
                <section className="detail-section">
                  <div className="detail-section-title">
                    <FileText size={18} />
                    <h3>Ghi chú nội bộ</h3>
                  </div>

                  <textarea
                    className="detail-note-input"
                    rows="4"
                    maxLength={2000}
                    placeholder="Nhập nội dung trao đổi, lịch hẹn hoặc ghi chú dành cho quản trị viên..."
                    value={ghiChu}
                    onChange={(e) => setGhiChu(e.target.value)}
                  />

                  <div className="detail-note-footer">
                    <span>{ghiChu.length}/2000 ký tự</span>

                    <button
                      type="button"
                      onClick={handleLuuGhiChu}
                      disabled={dangLuuGhiChu}
                    >
                      {dangLuuGhiChu ? (
                        <LoaderCircle
                          size={16}
                          className="refresh-spinning"
                        />
                      ) : (
                        <Save size={16} />
                      )}
                      Lưu ghi chú
                    </button>
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Toast */}
      {thongBao && (
        <div className={`hop-tac-toast toast-${thongBao.loai}`}>
          {thongBao.loai === "success" ? (
            <CheckCircle2 size={19} />
          ) : (
            <AlertCircle size={19} />
          )}
          <span>{thongBao.noiDung}</span>

          <button
            type="button"
            onClick={() => setThongBao(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default QuanLyDangKyHopTac;