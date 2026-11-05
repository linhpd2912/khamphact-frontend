import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  MapPinned,
  Pencil,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Map,
  CheckCircle2,
  CircleOff,
  Link as LinkIcon,
} from "lucide-react";



import "./QuanLyTinh.css";
import API from "../../../Api";
import ThemTinh from "./ThemTinh";
import SuaTinh from "./SuaTinh";
import XoaTinh from "./XoaTinh";

const PAGE_SIZE = 12;

export default function QuanLyTinh() {
  // Danh sách tỉnh lấy từ backend
  const [danhSachTinh, setDanhSachTinh] = useState([]);

  // Trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);

  // Thông báo lỗi
  const [error, setError] = useState("");

  // Từ khóa tìm kiếm
  const [tuKhoa, setTuKhoa] = useState("");

  // Bộ lọc trạng thái
  const [trangThai, setTrangThai] = useState("tat-ca");

  // Trang hiện tại
  const [trangHienTai, setTrangHienTai] = useState(1);

  // Điều khiển modal
  const [modalThem, setModalThem] = useState(false);
  const [tinhCanSua, setTinhCanSua] = useState(null);
  const [tinhCanXoa, setTinhCanXoa] = useState(null);

  // Hàm lấy danh sách tỉnh thành
  const layDanhSachTinh = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API.TINH_THANH);

      if (!response.ok) {
        throw new Error(
          `Không thể lấy danh sách tỉnh thành (${response.status})`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu tỉnh thành trả về không hợp lệ");
      }

      setDanhSachTinh(data);
    } catch (err) {
      console.error("Lỗi lấy danh sách tỉnh thành:", err);

      setError(
        err.message ||
          "Không thể tải danh sách tỉnh thành. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Gọi API khi component được hiển thị lần đầu
  useEffect(() => {
    layDanhSachTinh();
  }, [layDanhSachTinh]);

  // Chuẩn hóa dữ liệu tìm kiếm để không phân biệt dấu tiếng Việt
  const chuanHoaChuoi = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();

  // Lọc danh sách theo từ khóa và trạng thái
  const danhSachDaLoc = useMemo(() => {
    const tuKhoaChuanHoa = chuanHoaChuoi(tuKhoa);

    return danhSachTinh.filter((tinh) => {
      const tenTinh = chuanHoaChuoi(tinh.tenTinhThanh);
      const maTinh = chuanHoaChuoi(tinh.maTinhThanh);
      const duongDan = chuanHoaChuoi(tinh.duongDanSeo);

      const khopTuKhoa =
        tenTinh.includes(tuKhoaChuanHoa) ||
        maTinh.includes(tuKhoaChuanHoa) ||
        duongDan.includes(tuKhoaChuanHoa);

      const khopTrangThai =
        trangThai === "tat-ca" ||
        (trangThai === "hoat-dong" && tinh.hoatDong === true) ||
        (trangThai === "ngung-hoat-dong" && tinh.hoatDong === false);

      return khopTuKhoa && khopTrangThai;
    });
  }, [danhSachTinh, tuKhoa, trangThai]);

  // Thống kê
  const tongSoTinh = danhSachTinh.length;

  const soTinhHoatDong = danhSachTinh.filter(
    (tinh) => tinh.hoatDong === true
  ).length;

  const soTinhNgungHoatDong = danhSachTinh.filter(
    (tinh) => tinh.hoatDong === false
  ).length;

  // Tính số trang
  const tongSoTrang = Math.max(
    1,
    Math.ceil(danhSachDaLoc.length / PAGE_SIZE)
  );

  // Danh sách tỉnh của trang hiện tại
  const danhSachHienThi = useMemo(() => {
    const viTriBatDau = (trangHienTai - 1) * PAGE_SIZE;

    return danhSachDaLoc.slice(
      viTriBatDau,
      viTriBatDau + PAGE_SIZE
    );
  }, [danhSachDaLoc, trangHienTai]);

  // Khi thay đổi bộ lọc, quay về trang đầu
  useEffect(() => {
    setTrangHienTai(1);
  }, [tuKhoa, trangThai]);

  // Nếu danh sách giảm, không để trang hiện tại vượt quá tổng số trang
  useEffect(() => {
    if (trangHienTai > tongSoTrang) {
      setTrangHienTai(tongSoTrang);
    }
  }, [trangHienTai, tongSoTrang]);

  // Đóng modal thêm và tải lại danh sách sau khi thêm thành công
  const xuLyThemThanhCong = () => {
    setModalThem(false);
    layDanhSachTinh();
  };

  // Đóng modal sửa và tải lại danh sách sau khi sửa thành công
  const xuLySuaThanhCong = () => {
    setTinhCanSua(null);
    layDanhSachTinh();
  };

  // Đóng modal xóa và tải lại danh sách sau khi xóa thành công
  const xuLyXoaThanhCong = () => {
    setTinhCanXoa(null);
    layDanhSachTinh();
  };

  return (
    <div className="qlt-page">
      {/* Phần tiêu đề */}
      <div className="qlt-heading">
        <div className="qlt-heading-info">
          <div className="qlt-heading-icon">
            <MapPinned size={25} />
          </div>

          <div>
            <h2>Quản lý tỉnh thành</h2>
            <p>
              Quản lý danh sách tỉnh thành và thông tin địa chỉ
              của website.
            </p>
          </div>
        </div>

        <div className="qlt-heading-actions">
          <button
            type="button"
            className="qlt-btn qlt-btn-secondary"
            onClick={layDanhSachTinh}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Làm mới
          </button>

          <button
            type="button"
            className="qlt-btn qlt-btn-primary"
            onClick={() => setModalThem(true)}
          >
            <Plus size={18} />
            Thêm tỉnh thành
          </button>
        </div>
      </div>

      {/* Các thẻ thống kê */}
      <div className="qlt-stats">
        <div className="qlt-stat-card">
          <div className="qlt-stat-icon qlt-stat-icon-purple">
            <MapPinned size={21} />
          </div>

          <div className="qlt-stat-content">
            <span>Tổng số tỉnh thành</span>
            <strong>{tongSoTinh}</strong>
            <small>Tổng số bản ghi hiện có</small>
          </div>
        </div>

        <div className="qlt-stat-card">
          <div className="qlt-stat-icon qlt-stat-icon-green">
            <CheckCircle2 size={21} />
          </div>

          <div className="qlt-stat-content">
            <span>Đang hoạt động</span>
            <strong>{soTinhHoatDong}</strong>
            <small>Tỉnh thành đang được kích hoạt</small>
          </div>
        </div>

        <div className="qlt-stat-card">
          <div className="qlt-stat-icon qlt-stat-icon-orange">
            <CircleOff size={21} />
          </div>

          <div className="qlt-stat-content">
            <span>Ngừng hoạt động</span>
            <strong>{soTinhNgungHoatDong}</strong>
            <small>Tỉnh thành đang bị tắt</small>
          </div>
        </div>
      </div>

      {/* Khu vực tìm kiếm */}
      <div className="qlt-toolbar">
        <div className="qlt-search">
          <Search size={18} />

          <input
            type="text"
            value={tuKhoa}
            onChange={(event) => setTuKhoa(event.target.value)}
            placeholder="Tìm theo tên, mã hoặc đường dẫn SEO..."
            aria-label="Tìm kiếm tỉnh thành"
          />

          {tuKhoa && (
            <button
              type="button"
              className="qlt-search-clear"
              onClick={() => setTuKhoa("")}
              aria-label="Xóa từ khóa tìm kiếm"
            >
              ×
            </button>
          )}
        </div>

        <div className="qlt-filter">
          <label htmlFor="qlt-trang-thai">
            Trạng thái:
          </label>

          <select
            id="qlt-trang-thai"
            value={trangThai}
            onChange={(event) => setTrangThai(event.target.value)}
          >
            <option value="tat-ca">Tất cả</option>
            <option value="hoat-dong">Đang hoạt động</option>
            <option value="ngung-hoat-dong">
              Ngừng hoạt động
            </option>
          </select>
        </div>
      </div>

      {/* Thông tin số lượng */}
      <div className="qlt-list-heading">
        <div>
          <h3>Danh sách tỉnh thành</h3>
          <p>
            Tìm thấy{" "}
            <strong>{danhSachDaLoc.length}</strong> tỉnh thành
          </p>
        </div>

        <span className="qlt-result-count">
          Trang {trangHienTai}/{tongSoTrang}
        </span>
      </div>

      {/* Đang tải dữ liệu */}
      {loading && (
        <div className="qlt-state">
          <span className="qlt-spinner" />
          <p>Đang tải danh sách tỉnh thành...</p>
        </div>
      )}

      {/* Hiển thị lỗi */}
      {!loading && error && (
        <div className="qlt-error">
          <p>{error}</p>

          <button
            type="button"
            className="qlt-btn qlt-btn-secondary"
            onClick={layDanhSachTinh}
          >
            <RefreshCw size={16} />
            Thử lại
          </button>
        </div>
      )}

      {/* Danh sách card */}
      {!loading && !error && danhSachHienThi.length > 0 && (
        <div className="qlt-grid">
          {danhSachHienThi.map((tinh) => (
            <article className="qlt-card" key={tinh.id}>
              <div className="qlt-card-top">
                <div className="qlt-card-icon">
                  <MapPinned size={23} />
                </div>

                <span
                  className={`qlt-status ${
                    tinh.hoatDong === true
                      ? "qlt-status-active"
                      : tinh.hoatDong === false
                      ? "qlt-status-inactive"
                      : "qlt-status-unknown"
                  }`}
                >
                  <span className="qlt-status-dot" />

                  {tinh.hoatDong === true
                    ? "Đang hoạt động"
                    : tinh.hoatDong === false
                    ? "Ngừng hoạt động"
                    : "Chưa xác định"}
                </span>
              </div>

              <div className="qlt-card-body">
                <span className="qlt-card-label">
                  TỈNH THÀNH #{tinh.id}
                </span>

                <h4>{tinh.tenTinhThanh}</h4>

                <div className="qlt-card-info">
                  <div>
                    <span>Mã tỉnh thành</span>
                    <strong>{tinh.maTinhThanh || "Chưa có"}</strong>
                  </div>

                  <div>
                    <span>Đường dẫn SEO</span>

                    <strong className="qlt-seo-value">
                      <LinkIcon size={14} />

                      {tinh.duongDanSeo || "Chưa thiết lập"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="qlt-card-actions">
                <button
                  type="button"
                  className="qlt-btn-edit"
                  onClick={() => setTinhCanSua(tinh)}
                >
                  <Pencil size={15} />
                  Chỉnh sửa
                </button>

                <button
                  type="button"
                  className="qlt-btn-delete"
                  onClick={() => setTinhCanXoa(tinh)}
                >
                  <Trash2 size={15} />
                  Xóa
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Không có dữ liệu */}
      {!loading && !error && danhSachDaLoc.length === 0 && (
        <div className="qlt-empty">
          <div className="qlt-empty-icon">
            <Map size={32} />
          </div>

          <h3>Không tìm thấy tỉnh thành</h3>

          <p>
            {tuKhoa || trangThai !== "tat-ca"
              ? "Thử thay đổi từ khóa hoặc bộ lọc của bạn."
              : "Bạn chưa có tỉnh thành nào trong hệ thống."}
          </p>

          {tuKhoa && (
            <button
              type="button"
              className="qlt-btn qlt-btn-secondary"
              onClick={() => setTuKhoa("")}
            >
              Xóa từ khóa
            </button>
          )}
        </div>
      )}

      {/* Phân trang */}
      {!loading && !error && danhSachDaLoc.length > 0 && (
        <div className="qlt-pagination">
          <span>
            Hiển thị{" "}
            {(trangHienTai - 1) * PAGE_SIZE + 1}
            {" – "}
            {Math.min(
              trangHienTai * PAGE_SIZE,
              danhSachDaLoc.length
            )}{" "}
            trong tổng số {danhSachDaLoc.length} tỉnh thành
          </span>

          <div className="qlt-pagination-buttons">
            <button
              type="button"
              className="qlt-page-button"
              disabled={trangHienTai === 1}
              onClick={() =>
                setTrangHienTai((page) => page - 1)
              }
              aria-label="Trang trước"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from(
              { length: tongSoTrang },
              (_, index) => index + 1
            ).map((page) => (
              <button
                type="button"
                key={page}
                className={`qlt-page-button ${
                  trangHienTai === page ? "active" : ""
                }`}
                onClick={() => setTrangHienTai(page)}
                aria-label={`Trang ${page}`}
                aria-current={
                  trangHienTai === page ? "page" : undefined
                }
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className="qlt-page-button"
              disabled={trangHienTai === tongSoTrang}
              onClick={() =>
                setTrangHienTai((page) => page + 1)
              }
              aria-label="Trang sau"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modal thêm tỉnh thành */}
      {modalThem && (
        <ThemTinh
          onClose={() => setModalThem(false)}
          onSuccess={xuLyThemThanhCong}
        />
      )}

      {/* Modal sửa tỉnh thành */}
      {tinhCanSua && (
        <SuaTinh
          tinh={tinhCanSua}
          onClose={() => setTinhCanSua(null)}
          onSuccess={xuLySuaThanhCong}
        />
      )}

      {/* Modal xác nhận xóa */}
      {tinhCanXoa && (
        <XoaTinh
          tinh={tinhCanXoa}
          onClose={() => setTinhCanXoa(null)}
          onSuccess={xuLyXoaThanhCong}
        />
      )}
    </div>
  );
}