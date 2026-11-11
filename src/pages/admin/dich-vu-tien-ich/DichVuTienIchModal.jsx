import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Search,
  X,
  Check,
  RefreshCw,
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
  SlidersHorizontal,
  CircleAlert,
} from "lucide-react";

import {
  layTienIchCuaDichVu,
  layDanhSachTienIchHoatDong,
  themTienIchChoDichVu,
  xoaTienIchKhoiDichVu,
  chuanHoaDanhSachTienIch,
} from "../../../services/admin/dich-vu/DichVuTienIchService";

import "./DichVuTienIchModal.css";

const DANH_SACH_ICON = {
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
};

function layIcon(icon) {
  return DANH_SACH_ICON[icon] || SlidersHorizontal;
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

function layIdTienIch(item) {
  return item.tienIchId ?? item.tienIch?.id ?? item.idTienIch;
}

function layThongTinTienIch(item) {
  const tienIch = item.tienIch || item;

  return {
    id:
      item.tienIchId ??
      item.tienIch?.id ??
      item.idTienIch ??
      (item.tienIch ? undefined : item.id),

    tenTienIch:
      item.tenTienIch ??
      tienIch.tenTienIch ??
      "",

    icon:
      item.icon ??
      tienIch.icon ??
      "",
  };
}

export default function DichVuTienIchModal({ dichVu, onClose }) {
  const dichVuId = dichVu?.id;

  const [danhSachDaGan, setDanhSachDaGan] = useState([]);
  const [danhSachCoTheThem, setDanhSachCoTheThem] = useState([]);

  const [tuKhoa, setTuKhoa] = useState("");
  const [dangTai, setDangTai] = useState(true);
  const [dangThemId, setDangThemId] = useState(null);
  const [dangXoaId, setDangXoaId] = useState(null);

  const [tab, setTab] = useState("da-gan");
  const [thongBao, setThongBao] = useState(null);

  const dichVuNgungHoatDong = dichVu?.hoatDong === false;

  const hienThongBao = useCallback((noiDung, loai = "success") => {
    setThongBao({ noiDung, loai });

    window.setTimeout(() => {
      setThongBao(null);
    }, 3000);
  }, []);

  const taiDuLieu = useCallback(async () => {
    if (!dichVuId) {
      setDangTai(false);
      return;
    }

    setDangTai(true);

    try {
      const [dataDaGan, dataTatCa] = await Promise.all([
        layTienIchCuaDichVu(dichVuId),
        layDanhSachTienIchHoatDong(),
      ]);

      const daGan = chuanHoaDanhSachTienIch(dataDaGan);
      const tatCa = chuanHoaDanhSachTienIch(dataTatCa);

      setDanhSachDaGan(daGan);

      const idDaGan = new Set(
        daGan
          .map(layIdTienIch)
          .filter((id) => id != null)
          .map(String)
      );

      setDanhSachCoTheThem(
        tatCa.filter(
          (item) => !idDaGan.has(String(item.id))
        )
      );
    } catch (error) {
      hienThongBao(
        error.message || "Không thể tải danh sách tiện ích.",
        "error"
      );
    } finally {
      setDangTai(false);
    }
  }, [dichVuId, hienThongBao]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  // Lọc tiện ích theo tên hoặc tên icon
  const danhSachHienThi = useMemo(() => {
    const tuKhoaChuan = chuanHoaChuoi(tuKhoa);

    const nguon =
      tab === "da-gan"
        ? danhSachDaGan
        : danhSachCoTheThem;

    return nguon.filter((item) => {
      const tienIch = layThongTinTienIch(item);

      return (
        chuanHoaChuoi(tienIch.tenTienIch).includes(tuKhoaChuan) ||
        chuanHoaChuoi(tienIch.icon).includes(tuKhoaChuan)
      );
    });
  }, [danhSachDaGan, danhSachCoTheThem, tuKhoa, tab]);

  // Gán tiện ích vào dịch vụ
  const xuLyThem = async (tienIch) => {
    if (!dichVuId || !tienIch?.id) {
      hienThongBao("Không tìm thấy ID dịch vụ hoặc tiện ích.", "error");
      return;
    }

    if (dichVuNgungHoatDong) {
      hienThongBao(
        "Dịch vụ đã ngừng hoạt động, không thể thêm tiện ích.",
        "error"
      );
      return;
    }

    setDangThemId(tienIch.id);

    try {
      await themTienIchChoDichVu(dichVuId, tienIch.id);

      hienThongBao(
        `Đã thêm "${tienIch.tenTienIch}" vào dịch vụ.`
      );

      await taiDuLieu();
    } catch (error) {
      hienThongBao(
        error.message || "Không thể thêm tiện ích vào dịch vụ.",
        "error"
      );
    } finally {
      setDangThemId(null);
    }
  };

  // Gỡ tiện ích khỏi dịch vụ
  const xuLyXoa = async (item) => {
    const thongTin = layThongTinTienIch(item);
    const tienIchId = thongTin.id;

    if (!dichVuId || !tienIchId) {
      hienThongBao(
        "Không tìm thấy ID dịch vụ hoặc ID tiện ích.",
        "error"
      );
      return;
    }

    const dongY = window.confirm(
      `Bạn muốn gỡ tiện ích "${thongTin.tenTienIch}" khỏi dịch vụ "${dichVu.tenDichVu}"?`
    );

    if (!dongY) return;

    setDangXoaId(tienIchId);

    try {
      await xoaTienIchKhoiDichVu(dichVuId, tienIchId);

      hienThongBao(
        `Đã gỡ "${thongTin.tenTienIch}" khỏi dịch vụ.`
      );

      await taiDuLieu();
    } catch (error) {
      hienThongBao(
        error.message || "Không thể gỡ tiện ích khỏi dịch vụ.",
        "error"
      );
    } finally {
      setDangXoaId(null);
    }
  };

  if (!dichVu) return null;

  return (
    <div
      className="qdti-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        className="qdti-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qdti-title"
      >
        {/* Header */}
        <header className="qdti-header">
          <div className="qdti-header-main">
            <div className="qdti-eyebrow">
              QUẢN LÝ DỊCH VỤ
            </div>

            <h2 id="qdti-title">Tiện ích của dịch vụ</h2>

            <p className="qdti-dich-vu-name">
              {dichVu.tenDichVu}
            </p>
          </div>

          <button
            type="button"
            className="qdti-close"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        </header>

        {/* Thống kê */}
        <div className="qdti-summary">
          <div>
            <strong>{danhSachDaGan.length}</strong>
            <span>Tiện ích đang có</span>
          </div>

          <div>
            <strong>{danhSachCoTheThem.length}</strong>
            <span>Có thể thêm</span>
          </div>
        </div>

        {/* Thông báo dịch vụ ngừng hoạt động */}
        {dichVuNgungHoatDong && (
          <div className="qdti-inactive">
            Dịch vụ đã ngừng hoạt động. Bạn chỉ có thể xem hoặc gỡ tiện ích.
          </div>
        )}

        {/* Tab */}
        <div className="qdti-toolbar">
          <div className="qdti-tabs">
            <button
              type="button"
              className={tab === "da-gan" ? "active" : ""}
              onClick={() => {
                setTab("da-gan");
                setTuKhoa("");
              }}
            >
              Đang sử dụng
              <span>{danhSachDaGan.length}</span>
            </button>

            <button
              type="button"
              className={tab === "co-the-them" ? "active" : ""}
              onClick={() => {
                setTab("co-the-them");
                setTuKhoa("");
              }}
              disabled={dichVuNgungHoatDong}
              title={
                dichVuNgungHoatDong
                  ? "Dịch vụ đã ngừng hoạt động"
                  : "Thêm tiện ích"
              }
            >
              <Plus size={15} />
              Thêm tiện ích
              <span>{danhSachCoTheThem.length}</span>
            </button>
          </div>

          <label className="qdti-search">
            <Search size={16} />

            <input
              type="text"
              value={tuKhoa}
              onChange={(event) => setTuKhoa(event.target.value)}
              placeholder="Tìm tiện ích..."
            />

            {tuKhoa && (
              <button
                type="button"
                onClick={() => setTuKhoa("")}
                aria-label="Xóa từ khóa"
              >
                <X size={14} />
              </button>
            )}
          </label>
        </div>

        {/* Danh sách */}
        <div className="qdti-content">
          {dangTai ? (
            <div className="qdti-state">
              <RefreshCw className="qdti-spin" size={21} />
              <span>Đang tải tiện ích...</span>
            </div>
          ) : danhSachHienThi.length === 0 ? (
            <div className="qdti-empty">
              <div className="qdti-empty-icon">
                {tab === "da-gan" ? (
                  <SlidersHorizontal size={23} />
                ) : (
                  <Plus size={23} />
                )}
              </div>

              <h3>
                {tuKhoa
                  ? "Không tìm thấy tiện ích"
                  : tab === "da-gan"
                    ? "Dịch vụ chưa có tiện ích"
                    : "Không còn tiện ích để thêm"}
              </h3>

              <p>
                {tuKhoa
                  ? "Hãy thử tìm với từ khóa khác."
                  : tab === "da-gan"
                    ? "Chuyển sang mục Thêm tiện ích để lựa chọn."
                    : "Bạn đã thêm tất cả tiện ích đang hoạt động."}
              </p>
            </div>
          ) : (
            <div className="qdti-list">
              {danhSachHienThi.map((item) => {
                const tienIch = layThongTinTienIch(item);
                const Icon = layIcon(tienIch.icon);

                const dangXuLy =
                  dangThemId === tienIch.id ||
                  dangXoaId === tienIch.id;

                return (
                  <div
                    className="qdti-row"
                    key={`${tab}-${tienIch.id}`}
                  >
                    <div className="qdti-item-icon">
                      <Icon size={19} />
                    </div>

                    <div className="qdti-item-info">
                      <strong>{tienIch.tenTienIch}</strong>
                      <span>
                        {tienIch.icon || "Chưa chọn icon"}
                      </span>
                    </div>

                    {tab === "da-gan" ? (
                      <button
                        type="button"
                        className="qdti-remove"
                        onClick={() => xuLyXoa(item)}
                        disabled={dangXuLy}
                        title="Gỡ tiện ích khỏi dịch vụ"
                      >
                        {dangXuLy ? (
                          <RefreshCw
                            size={15}
                            className="qdti-spin"
                          />
                        ) : (
                          <>
                            <Trash2 size={15} />
                            <span>Gỡ</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="qdti-add"
                        onClick={() => xuLyThem(tienIch)}
                        disabled={dangXuLy || dichVuNgungHoatDong}
                        title="Thêm tiện ích vào dịch vụ"
                      >
                        {dangXuLy ? (
                          <RefreshCw
                            size={15}
                            className="qdti-spin"
                          />
                        ) : (
                          <>
                            <Plus size={15} />
                            <span>Thêm</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="qdti-footer">
          <span>
            <Check size={15} />
            Thay đổi được áp dụng cho riêng dịch vụ này.
          </span>

          <button
            type="button"
            className="qdti-done"
            onClick={onClose}
          >
            Hoàn tất
          </button>
        </footer>

        {/* Thông báo */}
        {thongBao && (
          <div
            className={`qdti-toast ${
              thongBao.loai === "error"
                ? "qdti-toast-error"
                : "qdti-toast-success"
            }`}
            role="status"
          >
            {thongBao.loai === "error" ? (
              <CircleAlert size={17} />
            ) : (
              <Check size={17} />
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
      </section>
    </div>
  );
}