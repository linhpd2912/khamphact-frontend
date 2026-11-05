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
  layTienIchCuaQuan,
  layDanhSachTienIch,
  themTienIchChoQuan,
  xoaTienIchKhoiQuan,
  chuanHoaDanhSachTienIch,
} from "../../../services/admin/QuanAnTienIchService";

import "./QuanAnTienIchModal.css";

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
  // Hỗ trợ cả DTO trả về tienIchId lẫn object lồng tienIch.
  return item.tienIchId ?? item.tienIch?.id ?? item.idTienIch;
}

function layIdBanGhi(item) {
  // ID của bản ghi trong bảng quan_an_tien_ich.
  return item.quanAnTienIchId ?? item.idQuanAnTienIch ?? item.id;
}

function layThongTinTienIch(item) {
  // API quan hệ có thể trả dữ liệu DTO hoặc object lồng nhau.
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

export default function QuanAnTienIchModal({ quanAn, onClose }) {
  const quanAnId = quanAn?.id;

  const [danhSachDaGan, setDanhSachDaGan] = useState([]);
  const [danhSachCoTheThem, setDanhSachCoTheThem] = useState([]);

  const [tuKhoa, setTuKhoa] = useState("");
  const [dangTai, setDangTai] = useState(true);
  const [dangThemId, setDangThemId] = useState(null);
  const [dangXoaId, setDangXoaId] = useState(null);

  const [tab, setTab] = useState("da-gan");
  const [thongBao, setThongBao] = useState(null);

  const hienThongBao = useCallback((noiDung, loai = "success") => {
    setThongBao({ noiDung, loai });

    window.setTimeout(() => {
      setThongBao(null);
    }, 3000);
  }, []);

  const taiDuLieu = useCallback(async () => {
    if (!quanAnId) {
      setDangTai(false);
      return;
    }

    setDangTai(true);

    try {
      const [dataDaGan, dataTatCa] = await Promise.all([
        layTienIchCuaQuan(quanAnId),
        layDanhSachTienIch(),
      ]);

      const daGan = chuanHoaDanhSachTienIch(dataDaGan);
      const tatCa = chuanHoaDanhSachTienIch(dataTatCa);

      // Chỉ cho phép chọn tiện ích đang hoạt động.
      const dangHoatDong = tatCa.filter(
        (item) => item.hoatDong === true
      );

      setDanhSachDaGan(daGan);

      const idDaGan = new Set(
        daGan.map(layIdTienIch).filter((id) => id != null).map(String)
      );

      setDanhSachCoTheThem(
        dangHoatDong.filter(
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
  }, [quanAnId, hienThongBao]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  // Danh sách tiện ích được lọc theo từ khóa.
  const danhSachHienThi = useMemo(() => {
    const tuKhoaChuan = chuanHoaChuoi(tuKhoa);

    const nguon =
      tab === "da-gan" ? danhSachDaGan : danhSachCoTheThem;

    return nguon.filter((item) => {
      const tienIch = layThongTinTienIch(item);

      return (
        chuanHoaChuoi(tienIch.tenTienIch).includes(tuKhoaChuan) ||
        chuanHoaChuoi(tienIch.icon).includes(tuKhoaChuan)
      );
    });
  }, [danhSachDaGan, danhSachCoTheThem, tuKhoa, tab]);

  // Thêm tiện ích vào quán.
  const xuLyThem = async (tienIch) => {
    if (!quanAnId) {
      hienThongBao("Không tìm thấy ID của quán ăn.", "error");
      return;
    }

    if (!tienIch?.id) {
      console.error("Không tìm thấy ID tiện ích:", tienIch);

      hienThongBao(
        "Không tìm thấy ID tiện ích. Vui lòng kiểm tra dữ liệu API.",
        "error"
      );

      return;
    }

    setDangThemId(tienIch.id);

    try {
      await themTienIchChoQuan(quanAnId, tienIch.id);

      hienThongBao(
        `Đã thêm "${tienIch.tenTienIch}" vào quán.`
      );

      await taiDuLieu();
    } catch (error) {
      hienThongBao(
        error.message || "Không thể thêm tiện ích vào quán.",
        "error"
      );
    } finally {
      setDangThemId(null);
    }
  };

  // Gỡ tiện ích khỏi quán, không xóa tiện ích gốc.
  const xuLyXoa = async (item) => {
    const thongTin = layThongTinTienIch(item);
    const tienIchId = thongTin.id;

    if (!quanAnId || !tienIchId) {
      hienThongBao(
        "Không tìm thấy ID quán ăn hoặc ID tiện ích.",
        "error"
      );
      return;
    }

    const dongY = window.confirm(
      `Bạn muốn gỡ tiện ích "${thongTin.tenTienIch}" khỏi quán "${quanAn.tenQuan}"?`
    );

    if (!dongY) return;

    setDangXoaId(tienIchId);

    try {
      await xoaTienIchKhoiQuan(quanAnId, thongTin.id);

      hienThongBao(
        `Đã gỡ "${thongTin.tenTienIch}" khỏi quán.`
      );

      await taiDuLieu();
    } catch (error) {
      hienThongBao(
        error.message || "Không thể gỡ tiện ích khỏi quán.",
        "error"
      );
    } finally {
      setDangXoaId(null);
    }
  };

  if (!quanAn) return null;

  return (
    <div
      className="qati-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        className="qati-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qati-title"
      >
        {/* Header */}
        <header className="qati-header">
          <div className="qati-header-main">
            <div className="qati-eyebrow">
              QUẢN LÝ QUÁN ĂN
            </div>

            <h2 id="qati-title">Tiện ích của quán</h2>

            <p className="qati-quan-name">
              {quanAn.tenQuan}
            </p>
          </div>

          <button
            type="button"
            className="qati-close"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        </header>

        {/* Thống kê nhanh */}
        <div className="qati-summary">
          <div>
            <strong>{danhSachDaGan.length}</strong>
            <span>Tiện ích đang có</span>
          </div>

          <div>
            <strong>{danhSachCoTheThem.length}</strong>
            <span>Có thể thêm</span>
          </div>
        </div>

        {/* Tab */}
        <div className="qati-toolbar">
          <div className="qati-tabs">
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
            >
              <Plus size={15} />
              Thêm tiện ích
              <span>{danhSachCoTheThem.length}</span>
            </button>
          </div>

          <label className="qati-search">
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
        <div className="qati-content">
          {dangTai ? (
            <div className="qati-state">
              <RefreshCw className="qati-spin" size={21} />
              <span>Đang tải tiện ích...</span>
            </div>
          ) : danhSachHienThi.length === 0 ? (
            <div className="qati-empty">
              <div className="qati-empty-icon">
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
                    ? "Quán chưa có tiện ích"
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
            <div className="qati-list">
              {danhSachHienThi.map((item) => {
                const tienIch = layThongTinTienIch(item);
                const Icon = layIcon(tienIch.icon);
                const idBanGhi = layIdBanGhi(item);

                const dangXuLy =
                  dangThemId === tienIch.id ||
                  dangXoaId === idBanGhi;

                return (
                  <div
                    className="qati-row"
                    key={`${tab}-${idBanGhi ?? tienIch.id ?? `${tienIch.tenTienIch}-${tienIch.icon}`}`}
                  >
                    <div className="qati-item-icon">
                      <Icon size={19} />
                    </div>

                    <div className="qati-item-info">
                      <strong>{tienIch.tenTienIch}</strong>
                      <span>
                        {tienIch.icon || "Chưa chọn icon"}
                      </span>
                    </div>

                    {tab === "da-gan" ? (
                      <button
                        type="button"
                        className="qati-remove"
                        onClick={() => xuLyXoa(item)}
                        disabled={dangXuLy}
                        title="Gỡ tiện ích khỏi quán"
                      >
                        {dangXuLy ? (
                          <RefreshCw
                            size={15}
                            className="qati-spin"
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
                        className="qati-add"
                        onClick={() => xuLyThem(tienIch)}
                        disabled={dangXuLy}
                        title="Thêm tiện ích vào quán"
                      >
                        {dangXuLy ? (
                          <RefreshCw
                            size={15}
                            className="qati-spin"
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
        <footer className="qati-footer">
          <span>
            <Check size={15} />
            Thay đổi được áp dụng cho riêng quán này.
          </span>

          <button
            type="button"
            className="qati-done"
            onClick={onClose}
          >
            Hoàn tất
          </button>
        </footer>

        {/* Thông báo */}
        {thongBao && (
          <div
            className={`qati-toast ${thongBao.loai === "error"
              ? "qati-toast-error"
              : "qati-toast-success"
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