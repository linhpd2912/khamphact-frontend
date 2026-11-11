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

import dichVuDanhMucService from "../../../services/admin/dich-vu/DichVuDanhMucService";
import API from "../../../Api";
import "./DichVuDanhMucModal.css";

function layDanhSach(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  return [];
}

function layTenDanhMuc(danhMuc) {
  return danhMuc.tenDanhMuc || danhMuc.ten || "Danh mục chưa có tên";
}

export default function DichVuDanhMucModal({ dichVu, onClose }) {
  const [danhMucHeThong, setDanhMucHeThong] = useState([]);
  const [danhSachDaGan, setDanhSachDaGan] = useState([]);
  const [tuKhoa, setTuKhoa] = useState("");
  const [danhMucCanThem, setDanhMucCanThem] = useState("");
  const [dangTai, setDangTai] = useState(true);
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState("");
  const [thongBao, setThongBao] = useState(null);

  const dichVuNgungHoatDong = dichVu.hoatDong === false;

  // Tải danh sách danh mục đang hoạt động
  const taiDanhMucHeThong = useCallback(async () => {
    const response = await fetch(`${API.DANH_MUC_DICH_VU}/hoat-dong`);

    if (!response.ok) {
      throw new Error("Không thể tải danh sách danh mục dịch vụ.");
    }

    const data = await response.json();
    setDanhMucHeThong(layDanhSach(data));
  }, []);

  // Tải những danh mục đã gán cho dịch vụ hiện tại
  const taiDanhMucCuaDichVu = useCallback(async () => {
    const data = await dichVuDanhMucService.layTheoDichVu(dichVu.id);
    setDanhSachDaGan(layDanhSach(data));
  }, [dichVu.id]);

  // Tải đồng thời hai danh sách
  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    setLoi("");

    try {
      await Promise.all([
        taiDanhMucHeThong(),
        taiDanhMucCuaDichVu(),
      ]);
    } catch (error) {
      setLoi(error.message || "Không thể tải dữ liệu danh mục dịch vụ.");
    } finally {
      setDangTai(false);
    }
  }, [taiDanhMucHeThong, taiDanhMucCuaDichVu]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  // Danh sách ID danh mục đã được gán
  const cacDanhMucDaGan = useMemo(
    () =>
      new Set(
        danhSachDaGan.map((item) => Number(item.danhMucDichVuId))
      ),
    [danhSachDaGan]
  );

  // Lọc danh mục chưa gán và đang hoạt động
  const danhSachChuaGan = useMemo(() => {
    const tuKhoaChuanHoa = tuKhoa.trim().toLowerCase();

    return danhMucHeThong.filter((danhMuc) => {
      const chuaGan = !cacDanhMucDaGan.has(Number(danhMuc.id));

      const khopTuKhoa = layTenDanhMuc(danhMuc)
        .toLowerCase()
        .includes(tuKhoaChuanHoa);

      const dangHoatDong =
        danhMuc.hoatDong === undefined || danhMuc.hoatDong === true;

      return chuaGan && khopTuKhoa && dangHoatDong;
    });
  }, [danhMucHeThong, cacDanhMucDaGan, tuKhoa]);

  // Thêm danh mục vào dịch vụ
  const xuLyThem = async () => {
    if (dichVuNgungHoatDong) {
      setThongBao({
        loai: "error",
        noiDung: "Dịch vụ đã ngừng hoạt động. Không thể thêm danh mục mới.",
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
      await dichVuDanhMucService.them({
        dichVuId: Number(dichVu.id),
        danhMucDichVuId: Number(danhMucCanThem),
      });

      await taiDuLieu();
      setDanhMucCanThem("");

      setThongBao({
        loai: "success",
        noiDung: "Đã gán danh mục cho dịch vụ thành công.",
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

  // Bỏ danh mục khỏi dịch vụ
  const xuLyXoa = async (lienKet) => {
    const danhMuc = danhMucHeThong.find(
      (item) =>
        Number(item.id) === Number(lienKet.danhMucDichVuId)
    );

    const tenDanhMuc = danhMuc
      ? layTenDanhMuc(danhMuc)
      : "danh mục này";

    const dongY = window.confirm(
      `Bạn có chắc muốn bỏ "${tenDanhMuc}" khỏi dịch vụ "${dichVu.tenDichVu}" không?`
    );

    if (!dongY) return;

    setDangXuLy(true);
    setThongBao(null);

    try {
      await dichVuDanhMucService.xoa(lienKet.id);
      await taiDuLieu();

      setThongBao({
        loai: "success",
        noiDung: "Đã bỏ danh mục khỏi dịch vụ.",
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

  const layDanhMucTuLienKet = (lienKet) =>
    danhMucHeThong.find(
      (item) =>
        Number(item.id) === Number(lienKet.danhMucDichVuId)
    );

  return (
    <div
      className="qddv-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !dangXuLy
        ) {
          onClose();
        }
      }}
    >
      <section
        className="qddv-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qddv-title"
      >
        {/* Tiêu đề */}
        <header className="qddv-header">
          <div className="qddv-heading-icon">
            <Tags size={23} />
          </div>

          <div className="qddv-heading-text">
            <h2 id="qddv-title">Quản lý danh mục dịch vụ</h2>
            <p>{dichVu.tenDichVu}</p>
          </div>

          <button
            type="button"
            className="qddv-close"
            onClick={onClose}
            disabled={dangXuLy}
            aria-label="Đóng cửa sổ"
          >
            <X size={21} />
          </button>
        </header>

        <div className="qddv-content">
          {/* Thông báo */}
          {thongBao && (
            <div className={`qddv-alert qddv-alert-${thongBao.loai}`}>
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
          <section className="qddv-add-section">
            <div className="qddv-section-title">
              <div>
                <h3>Thêm danh mục</h3>
                <p>Chọn danh mục phù hợp với dịch vụ này.</p>
              </div>

              <span className="qddv-count">
                {danhSachChuaGan.length} chưa gán
              </span>
            </div>

            <div className="qddv-add-form">
              <select
                value={danhMucCanThem}
                onChange={(event) =>
                  setDanhMucCanThem(event.target.value)
                }
                disabled={
                  dangTai ||
                  dangXuLy ||
                  danhSachChuaGan.length === 0 ||
                  dichVuNgungHoatDong
                }
              >
                <option value="">-- Chọn danh mục dịch vụ --</option>

                {danhSachChuaGan.map((danhMuc) => (
                  <option key={danhMuc.id} value={danhMuc.id}>
                    {layTenDanhMuc(danhMuc)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="qddv-btn-add"
                onClick={xuLyThem}
                disabled={
                  dangTai ||
                  dangXuLy ||
                  !danhMucCanThem ||
                  dichVuNgungHoatDong
                }
                title={
                  dichVuNgungHoatDong
                    ? "Dịch vụ đã ngừng hoạt động, không thể thêm danh mục."
                    : "Gán danh mục cho dịch vụ"
                }
              >
                {dangXuLy ? (
                  <RefreshCw size={16} className="qddv-spin" />
                ) : (
                  <Plus size={17} />
                )}
                Thêm danh mục
              </button>
            </div>

            {dichVuNgungHoatDong && (
              <div className="qddv-alert qddv-alert-error qddv-inactive-note">
                <span>
                  Dịch vụ đã ngừng hoạt động. Bạn không thể thêm danh mục mới.
                </span>
              </div>
            )}
          </section>

          {/* Danh sách danh mục đã gán */}
          <section className="qddv-list-section">
            <div className="qddv-section-title">
              <div>
                <h3>Danh mục của dịch vụ</h3>
                <p>
                  Các danh mục đang được liên kết với dịch vụ này.
                </p>
              </div>

              <span className="qddv-count qddv-count-active">
                {danhSachDaGan.length} danh mục
              </span>
            </div>

            {/* Tìm kiếm */}
            <div className="qddv-search">
              <Search size={17} />

              <input
                type="text"
                value={tuKhoa}
                onChange={(event) => setTuKhoa(event.target.value)}
                placeholder="Tìm danh mục..."
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
              <div className="qddv-state">
                <RefreshCw size={23} className="qddv-spin" />
                <p>Đang tải danh mục...</p>
              </div>
            ) : loi ? (
              <div className="qddv-state qddv-state-error">
                <p>{loi}</p>

                <button
                  type="button"
                  className="qddv-btn-retry"
                  onClick={taiDuLieu}
                >
                  <RefreshCw size={15} />
                  Thử lại
                </button>
              </div>
            ) : danhSachDaGan.length === 0 ? (
              <div className="qddv-empty">
                <FolderOpen size={34} />
                <h4>Dịch vụ chưa có danh mục</h4>
                <p>Chọn danh mục ở phía trên để bắt đầu.</p>
              </div>
            ) : (
              <div className="qddv-grid">
                {danhSachDaGan
                  .filter((lienKet) => {
                    const danhMuc = layDanhMucTuLienKet(lienKet);

                    const ten = danhMuc
                      ? layTenDanhMuc(danhMuc)
                      : `Danh mục #${lienKet.danhMucDichVuId}`;

                    return ten
                      .toLowerCase()
                      .includes(tuKhoa.trim().toLowerCase());
                  })
                  .map((lienKet) => {
                    const danhMuc = layDanhMucTuLienKet(lienKet);

                    return (
                      <article
                        className="qddv-card"
                        key={lienKet.id}
                      >
                        <div className="qddv-card-icon">
                          <Tags size={20} />
                        </div>

                        <div className="qddv-card-info">
                          <h4>
                            {danhMuc
                              ? layTenDanhMuc(danhMuc)
                              : `Danh mục #${lienKet.danhMucDichVuId}`}
                          </h4>

                          <span>Đang áp dụng cho dịch vụ</span>
                        </div>

                        <button
                          type="button"
                          className="qddv-btn-remove"
                          onClick={() => xuLyXoa(lienKet)}
                          disabled={dangXuLy}
                          title="Bỏ danh mục khỏi dịch vụ"
                          aria-label="Bỏ danh mục khỏi dịch vụ"
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

        {/* Chân modal */}
        <footer className="qddv-footer">
          <span>
            Tổng cộng <strong>{danhSachDaGan.length}</strong> danh mục được gán
          </span>

          <button
            type="button"
            className="qddv-btn-close"
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