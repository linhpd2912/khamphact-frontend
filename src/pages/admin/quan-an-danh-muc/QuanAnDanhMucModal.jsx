import { useCallback, useEffect, useMemo, useState } from "react";
import {
  X,
  Tags,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";

import quanAnDanhMucService from "../../../services/admin/QuanAnDanhMucService";
import "./QuanAnDanhMucModal.css";
import API from "../../../Api";

const API_DANH_MUC = API.DANH_MUC;

// Chuẩn hóa dữ liệu trả về từ API
function layDanhSach(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;

  return [];
}

// Lấy tên danh mục theo các tên thuộc tính thường gặp
function layTenDanhMuc(danhMuc) {
  return (
    danhMuc.tenDanhMuc ||
    danhMuc.ten ||
    danhMuc.tenLoai ||
    "Danh mục chưa có tên"
  );
}

export default function QuanAnDanhMucModal({ quanAn, onClose }) {
  const [danhMucHeThong, setDanhMucHeThong] = useState([]);
  const [danhSachDaGan, setDanhSachDaGan] = useState([]);

  const [tuKhoa, setTuKhoa] = useState("");
  const [danhMucCanThem, setDanhMucCanThem] = useState("");

  const [dangTai, setDangTai] = useState(true);
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState("");
  const [thongBao, setThongBao] = useState(null);

  const quanNgungHoatDong = quanAn.hoatDong === false;

  // Tải toàn bộ danh mục trong hệ thống
  const taiDanhMucHeThong = useCallback(async () => {
    const response = await fetch(API_DANH_MUC);

    if (!response.ok) {
      throw new Error("Không thể tải danh sách danh mục hệ thống.");
    }

    const data = await response.json();
    setDanhMucHeThong(layDanhSach(data));
  }, []);

  // Tải các danh mục đã gán cho quán đang chọn
  const taiDanhMucCuaQuan = useCallback(async () => {
    const data = await quanAnDanhMucService.layTheoQuanAn(quanAn.id);
    setDanhSachDaGan(layDanhSach(data));
  }, [quanAn.id]);

  // Tải dữ liệu ban đầu
  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    setLoi("");

    try {
      await Promise.all([
        taiDanhMucHeThong(),
        taiDanhMucCuaQuan(),
      ]);
    } catch (error) {
      setLoi(error.message || "Không thể tải dữ liệu danh mục.");
    } finally {
      setDangTai(false);
    }
  }, [taiDanhMucHeThong, taiDanhMucCuaQuan]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  // ID danh mục đã được gán
  const cacDanhMucDaGan = useMemo(
    () => new Set(danhSachDaGan.map((item) => Number(item.danhMucId))),
    [danhSachDaGan]
  );

  // Danh mục chưa gán và phù hợp từ khóa tìm kiếm
  const danhSachChuaGan = useMemo(() => {
    const tuKhoaChuanHoa = tuKhoa.trim().toLowerCase();

    return danhMucHeThong.filter((danhMuc) => {
      const id = Number(danhMuc.id);

      const chuaGan = !cacDanhMucDaGan.has(id);

      const ten = layTenDanhMuc(danhMuc).toLowerCase();

      const khopTuKhoa =
        !tuKhoaChuanHoa || ten.includes(tuKhoaChuanHoa);

      // Nếu backend có trường hoatDong thì chỉ hiển thị danh mục hoạt động
      const dangHoatDong =
        danhMuc.hoatDong === undefined ||
        danhMuc.hoatDong === true;

      return chuaGan && khopTuKhoa && dangHoatDong;
    });
  }, [danhMucHeThong, cacDanhMucDaGan, tuKhoa]);

  // Thêm danh mục vào quán
  const xuLyThem = async () => {
    if (quanNgungHoatDong) {
      setThongBao({
        loai: "error",
        noiDung:
          "Quán đã ngưng hoạt động. Không thể thêm danh mục mới.",
      });
      return;
    }
    if (!danhMucCanThem) {
      setThongBao({
        loai: "error",
        noiDung: "Vui lòng chọn danh mục muốn thêm.",
      });
      return;
    }

    setDangXuLy(true);
    setThongBao(null);

    try {
      await quanAnDanhMucService.them({
        quanAnId: Number(quanAn.id),
        danhMucId: Number(danhMucCanThem),
      });

      await taiDuLieu();

      setDanhMucCanThem("");
      setThongBao({
        loai: "success",
        noiDung: "Đã thêm danh mục cho quán thành công.",
      });
    } catch (error) {
      setThongBao({
        loai: "error",
        noiDung: error.message || "Không thể thêm danh mục.",
      });
    } finally {
      setDangXuLy(false);
    }
  };

  // Xóa liên kết danh mục khỏi quán
  const xuLyXoa = async (lienKet) => {
    const danhMuc = danhMucHeThong.find(
      (item) => Number(item.id) === Number(lienKet.danhMucId)
    );

    const tenDanhMuc = danhMuc
      ? layTenDanhMuc(danhMuc)
      : "danh mục này";

    const dongY = window.confirm(
      `Bạn có chắc muốn bỏ "${tenDanhMuc}" khỏi quán "${quanAn.tenQuan}" không?`
    );

    if (!dongY) return;

    setDangXuLy(true);
    setThongBao(null);

    try {
      await quanAnDanhMucService.xoa(lienKet.id);
      await taiDuLieu();

      setThongBao({
        loai: "success",
        noiDung: "Đã bỏ danh mục khỏi quán.",
      });
    } catch (error) {
      setThongBao({
        loai: "error",
        noiDung: error.message || "Không thể xóa liên kết.",
      });
    } finally {
      setDangXuLy(false);
    }
  };

  return (
    <div className="qadm-overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !dangXuLy) {
        onClose();
      }
    }}>
      <section
        className="qadm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qadm-title"
      >
        {/* Tiêu đề */}
        <header className="qadm-header">
          <div className="qadm-heading-icon">
            <Tags size={23} />
          </div>

          <div className="qadm-heading-text">
            <h2 id="qadm-title">Quản lý danh mục quán</h2>
            <p>{quanAn.tenQuan}</p>
          </div>

          <button
            type="button"
            className="qadm-close"
            onClick={onClose}
            disabled={dangXuLy}
            aria-label="Đóng cửa sổ"
          >
            <X size={21} />
          </button>
        </header>

        <div className="qadm-content">
          {/* Thông báo */}
          {thongBao && (
            <div className={`qadm-alert qadm-alert-${thongBao.loai}`}>
              {thongBao.loai === "success" && (
                <CheckCircle2 size={17} />
              )}
              <span>{thongBao.noiDung}</span>
              <button
                type="button"
                onClick={() => setThongBao(null)}
                aria-label="Đóng thông báo"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Thêm danh mục */}
          <section className="qadm-add-section">
            <div className="qadm-section-title">
              <div>
                <h3>Thêm danh mục</h3>
                <p>Chọn danh mục phù hợp với quán ăn.</p>
              </div>
              <span className="qadm-count">
                {danhSachChuaGan.length} chưa gán
              </span>
            </div>

            <div className="qadm-add-form">
              <select
                value={danhMucCanThem}
                onChange={(event) => setDanhMucCanThem(event.target.value)}
                disabled={dangTai || dangXuLy || danhSachChuaGan.length === 0}
              >
                <option value="">-- Chọn danh mục --</option>

                {danhSachChuaGan.map((danhMuc) => (
                  <option key={danhMuc.id} value={danhMuc.id}>
                    {layTenDanhMuc(danhMuc)}
                  </option>
                ))}
              </select>

              {/* <button
                type="button"
                className="qadm-btn-add"
                onClick={xuLyThem}
                disabled={
                  dangTai ||
                  dangXuLy ||
                  !danhMucCanThem ||
                  quanNgungHoatDong
                }
              >
                {dangXuLy ? (
                  <RefreshCw size={16} className="qadm-spin" />
                ) : (
                  <Plus size={17} />
                )}
                Thêm danh mục
              </button> */}

              {quanNgungHoatDong && (
                <div className="qadm-alert qadm-alert-error">
                  <span>
                    Quán đã ngưng hoạt động. Bạn không thể thêm danh mục mới.
                  </span>
                </div>
              )}
              <button
                type="button"
                className="qadm-btn-add"
                onClick={xuLyThem}
                disabled={
                  dangTai ||
                  dangXuLy ||
                  !danhMucCanThem ||
                  quanNgungHoatDong
                }
                title={
                  quanNgungHoatDong
                    ? "Quán đã ngưng hoạt động, không thể thêm danh mục."
                    : "Thêm danh mục cho quán"
                }
              >
                <Plus size={17} />
                Thêm danh mục
              </button>
            </div>
          </section>

          {/* Danh sách danh mục đã gán */}
          <section className="qadm-list-section">
            <div className="qadm-section-title">
              <div>
                <h3>Danh mục của quán</h3>
                <p>Các danh mục đang liên kết với địa điểm này.</p>
              </div>

              <span className="qadm-count qadm-count-active">
                {danhSachDaGan.length} danh mục
              </span>
            </div>

            <div className="qadm-search">
              <Search size={17} />
              <input
                type="text"
                value={tuKhoa}
                onChange={(event) => setTuKhoa(event.target.value)}
                placeholder="Tìm danh mục chưa gán..."
              />
              {tuKhoa && (
                <button
                  type="button"
                  onClick={() => setTuKhoa("")}
                  aria-label="Xóa từ khóa"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {dangTai ? (
              <div className="qadm-state">
                <RefreshCw size={23} className="qadm-spin" />
                <p>Đang tải danh mục...</p>
              </div>
            ) : loi ? (
              <div className="qadm-state qadm-state-error">
                <p>{loi}</p>
                <button
                  type="button"
                  className="qadm-btn-retry"
                  onClick={taiDuLieu}
                >
                  <RefreshCw size={15} />
                  Thử lại
                </button>
              </div>
            ) : danhSachDaGan.length === 0 ? (
              <div className="qadm-empty">
                <FolderOpen size={34} />
                <h4>Quán chưa có danh mục</h4>
                <p>Chọn danh mục ở phía trên để bắt đầu.</p>
              </div>
            ) : (
              <div className="qadm-grid">
                {danhSachDaGan
                  .filter((lienKet) => {
                    const danhMuc = danhMucHeThong.find(
                      (item) =>
                        Number(item.id) === Number(lienKet.danhMucId)
                    );

                    const ten = danhMuc
                      ? layTenDanhMuc(danhMuc)
                      : `Danh mục #${lienKet.danhMucId}`;

                    return ten.toLowerCase().includes(tuKhoa.trim().toLowerCase());
                  })
                  .map((lienKet) => {
                    const danhMuc = danhMucHeThong.find(
                      (item) =>
                        Number(item.id) === Number(lienKet.danhMucId)
                    );

                    return (
                      <article className="qadm-card" key={lienKet.id}>
                        <div className="qadm-card-icon">
                          <Tags size={20} />
                        </div>

                        <div className="qadm-card-info">
                          <h4>
                            {danhMuc
                              ? layTenDanhMuc(danhMuc)
                              : `Danh mục #${lienKet.danhMucId}`}
                          </h4>
                          <span>Đang áp dụng cho quán</span>
                        </div>

                        <button
                          type="button"
                          className="qadm-btn-remove"
                          onClick={() => xuLyXoa(lienKet)}
                          disabled={dangXuLy}
                          title="Bỏ danh mục khỏi quán"
                          aria-label="Bỏ danh mục khỏi quán"
                        >
                          <Trash2 size={17} />
                        </button>
                      </article>
                    );
                  })}
              </div>
            )}
          </section>
        </div>

        <footer className="qadm-footer">
          <span>
            Tổng cộng <strong>{danhSachDaGan.length}</strong> danh mục được gán
          </span>

          <button
            type="button"
            className="qadm-btn-close"
            onClick={onClose}
            disabled={dangXuLy}
          >
            Đóng
          </button>
        </footer>
      </section>
    </div>
  );
}