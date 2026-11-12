import { useCallback, useEffect, useState } from "react";
import {
  Images,
  Upload,
  X,
  Star,
  Trash2,
  RefreshCw,
  ImagePlus,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import API from "../../../Api";
import HinhAnhDichVuService from "../../../services/admin/dich-vu/HinhAnhDichVuService";

// Dùng lại giao diện CSS quản lý hình ảnh quán ăn
import "./HinhAnhQuanModal.css";

function layUrlAnh(url) {
  if (!url) return "";

  if (/^https?:\/\//i.test(url)) return url;

  return `${API.BACKEND}${url.startsWith("/") ? "" : "/"}${url}`;
}

function HinhAnhDichVuModal({ dichVu, onClose, onThongBao }) {
  const [danhSachAnh, setDanhSachAnh] = useState([]);
  const [danhSachFile, setDanhSachFile] = useState([]);

  const [dangTai, setDangTai] = useState(true);
  const [dangUpload, setDangUpload] = useState(false);
  const [dangXuLyId, setDangXuLyId] = useState(null);

  const [loi, setLoi] = useState("");
  const [thongBaoNoiBo, setThongBaoNoiBo] = useState("");
  const [anhDangXem, setAnhDangXem] = useState(null);

  // Tải danh sách hình ảnh
  const taiDanhSachAnh = useCallback(async () => {
    if (!dichVu?.id) return;

    setDangTai(true);
    setLoi("");

    try {
      const data = await HinhAnhDichVuService.getByDichVu(dichVu.id);
      setDanhSachAnh(Array.isArray(data) ? data : []);
    } catch (error) {
      setLoi(error.message || "Không thể tải hình ảnh dịch vụ.");
    } finally {
      setDangTai(false);
    }
  }, [dichVu?.id]);

  useEffect(() => {
    taiDanhSachAnh();
  }, [taiDanhSachAnh]);

  // Chọn hình ảnh từ máy tính
  const chonFile = (event) => {
    const files = Array.from(event.target.files || []);
    const hopLe = [];
    const khongHopLe = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        khongHopLe.push(file.name);
      } else if (file.size > 10 * 1024 * 1024) {
        khongHopLe.push(`${file.name} (lớn hơn 10 MB)`);
      } else {
        hopLe.push(file);
      }
    });

    setDanhSachFile((cu) => {
      const daChon = new Set(
        cu.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
      );

      const moi = hopLe.filter(
        (file) =>
          !daChon.has(`${file.name}-${file.size}-${file.lastModified}`)
      );

      return [...cu, ...moi];
    });

    setThongBaoNoiBo(
      khongHopLe.length
        ? `Đã bỏ qua ${khongHopLe.length} file không hợp lệ hoặc vượt quá 10 MB.`
        : ""
    );

    event.target.value = "";
  };

  // Bỏ file khỏi danh sách chờ
  const boFileCho = (index) => {
    setDanhSachFile((cu) => cu.filter((_, i) => i !== index));
  };

  // Upload hình ảnh
  const taiAnhLen = async () => {
    if (!dichVu?.id) {
      setLoi("Không xác định được dịch vụ.");
      return;
    }

    if (!danhSachFile.length) {
      setLoi("Vui lòng chọn ít nhất một hình ảnh.");
      return;
    }

    setDangUpload(true);
    setLoi("");

    try {
      await HinhAnhDichVuService.upload(dichVu.id, danhSachFile);

      setDanhSachFile([]);
      setThongBaoNoiBo("Tải hình ảnh thành công.");

      await taiDanhSachAnh();
      onThongBao?.("Tải hình ảnh dịch vụ thành công.", "success");
    } catch (error) {
      setLoi(error.message || "Không thể tải hình ảnh lên.");
    } finally {
      setDangUpload(false);
    }
  };

  // Chọn ảnh đại diện
  const datAnhDaiDien = async (anh) => {
    if (anh.anhDaiDien) return;

    setDangXuLyId(anh.id);
    setLoi("");

    try {
      await HinhAnhDichVuService.datAnhDaiDien(anh.id);
      await taiDanhSachAnh();

      onThongBao?.("Đã cập nhật ảnh đại diện dịch vụ.", "success");
    } catch (error) {
      setLoi(error.message || "Không thể cập nhật ảnh đại diện.");
    } finally {
      setDangXuLyId(null);
    }
  };

  // Thay đổi thứ tự ảnh
  const doiThuTu = async (anh, buoc) => {
    const index = danhSachAnh.findIndex((item) => item.id === anh.id);
    const indexMoi = index + buoc;

    if (index < 0 || indexMoi < 0 || indexMoi >= danhSachAnh.length) {
      return;
    }

    const danhSachMoi = [...danhSachAnh];

    [danhSachMoi[index], danhSachMoi[indexMoi]] = [
      danhSachMoi[indexMoi],
      danhSachMoi[index],
    ];

    setDangXuLyId(anh.id);
    setLoi("");

    try {
      await HinhAnhDichVuService.capNhatThuTu(
        danhSachMoi[index].id,
        index
      );

      await HinhAnhDichVuService.capNhatThuTu(
        danhSachMoi[indexMoi].id,
        indexMoi
      );

      await taiDanhSachAnh();
    } catch (error) {
      setLoi(error.message || "Không thể thay đổi thứ tự hình ảnh.");
    } finally {
      setDangXuLyId(null);
    }
  };

  // Xóa hình ảnh
  const xoaAnh = async (anh) => {
    const dongY = window.confirm(
      `Bạn có chắc muốn xóa hình ảnh của dịch vụ "${dichVu.tenDichVu}" không?`
    );

    if (!dongY) return;

    setDangXuLyId(anh.id);
    setLoi("");

    try {
      await HinhAnhDichVuService.xoa(anh.id);

      setDanhSachAnh((cu) => cu.filter((item) => item.id !== anh.id));
      onThongBao?.("Đã xóa hình ảnh.", "success");
    } catch (error) {
      setLoi(error.message || "Không thể xóa hình ảnh.");
    } finally {
      setDangXuLyId(null);
    }
  };

  const soAnhDaiDien = danhSachAnh.filter(
    (anh) => anh.anhDaiDien
  ).length;

  return (
    <>
      <div
        className="haq-overlay"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !dangUpload) {
            onClose();
          }
        }}
      >
        <section
          className="haq-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="had-title"
        >
          <header className="haq-header">
            <div className="haq-header-icon">
              <Images size={25} />
            </div>

            <div className="haq-header-title">
              <h2 id="had-title">Quản lý hình ảnh dịch vụ</h2>
              <p>
                Dịch vụ: <strong>{dichVu?.tenDichVu}</strong>
              </p>
            </div>

            <button
              type="button"
              className="haq-close"
              onClick={onClose}
              disabled={dangUpload}
              aria-label="Đóng"
            >
              <X size={21} />
            </button>
          </header>

          {/* Thống kê */}
          <div className="haq-stats">
            <div className="haq-stat">
              <span className="haq-stat-icon">
                <Images size={20} />
              </span>
              <div>
                <span>Tổng hình ảnh</span>
                <strong>{danhSachAnh.length}</strong>
              </div>
            </div>

            <div className="haq-stat">
              <span className="haq-stat-icon haq-stat-star">
                <Star size={20} />
              </span>
              <div>
                <span>Ảnh đại diện</span>
                <strong>{soAnhDaiDien}</strong>
              </div>
            </div>

            <div className="haq-stat">
              <span className="haq-stat-icon haq-stat-upload">
                <Upload size={20} />
              </span>
              <div>
                <span>Đang chờ tải</span>
                <strong>{danhSachFile.length}</strong>
              </div>
            </div>
          </div>

          {/* Thông báo */}
          {loi && (
            <div className="haq-alert haq-alert-error">
              <AlertCircle size={18} />
              <span>{loi}</span>
              <button type="button" onClick={() => setLoi("")}>
                <X size={16} />
              </button>
            </div>
          )}

          {thongBaoNoiBo && (
            <div className="haq-alert haq-alert-info">
              <CheckCircle2 size={18} />
              <span>{thongBaoNoiBo}</span>
              <button
                type="button"
                onClick={() => setThongBaoNoiBo("")}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Khu vực upload */}
          <div className="haq-upload-section">
            <div className="haq-section-heading">
              <div>
                <h3>Tải hình ảnh lên</h3>
                <p>
                  Có thể chọn nhiều hình ảnh cùng lúc. Mỗi ảnh tối đa 10 MB.
                </p>
              </div>
            </div>

            <label className="haq-upload-zone">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={chonFile}
                disabled={dangUpload}
              />

              <span className="haq-upload-icon">
                <ImagePlus size={28} />
              </span>

              <strong>Chọn hình ảnh từ máy tính</strong>
              <span>Nhấn để chọn hoặc kéo hình ảnh vào đây</span>

              <span className="haq-upload-button">
                <Upload size={16} /> Chọn hình ảnh
              </span>
            </label>

            {danhSachFile.length > 0 && (
              <div className="haq-pending">
                <div className="haq-pending-heading">
                  <strong>{danhSachFile.length} hình ảnh đang chờ tải</strong>
                  <button
                    type="button"
                    onClick={() => setDanhSachFile([])}
                    disabled={dangUpload}
                  >
                    Xóa tất cả
                  </button>
                </div>

                <div className="haq-pending-grid">
                  {danhSachFile.map((file, index) => (
                    <div
                      className="haq-pending-item"
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                    >
                      <span className="haq-upload-icon">
                        <ImageIcon size={22} />
                      </span>

                      <div className="haq-pending-info">
                        <span>{file.name}</span>
                        <small>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </small>
                      </div>

                      <button
                        type="button"
                        onClick={() => boFileCho(index)}
                        disabled={dangUpload}
                        title="Bỏ hình ảnh"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="haq-btn haq-btn-primary haq-upload-submit"
                  onClick={taiAnhLen}
                  disabled={dangUpload}
                >
                  {dangUpload ? (
                    <>
                      <RefreshCw size={16} className="haq-spin" />
                      Đang tải lên...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Tải {danhSachFile.length} hình ảnh lên
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Danh sách ảnh */}
          <div className="haq-gallery-section">
            <div className="haq-section-heading haq-gallery-heading">
              <div>
                <h3>Thư viện hình ảnh</h3>
                <p>Chọn ảnh đại diện, sắp xếp hoặc xóa hình ảnh.</p>
              </div>

              <button
                type="button"
                className="haq-btn haq-btn-secondary"
                onClick={taiDanhSachAnh}
                disabled={dangTai}
              >
                <RefreshCw
                  size={15}
                  className={dangTai ? "haq-spin" : ""}
                />
                Làm mới
              </button>
            </div>

            {dangTai ? (
              <div className="haq-state">
                <RefreshCw size={25} className="haq-spin" />
                <p>Đang tải hình ảnh...</p>
              </div>
            ) : danhSachAnh.length === 0 ? (
              <div className="haq-empty">
                <span>
                  <Images size={30} />
                </span>
                <h4>Chưa có hình ảnh</h4>
                <p>Hãy tải hình ảnh đầu tiên cho dịch vụ này.</p>
              </div>
            ) : (
              <div className="haq-gallery">
                {danhSachAnh.map((anh, index) => (
                  <article className="haq-image-card" key={anh.id}>
                    <div className="haq-image-wrapper">
                      <img
                        src={layUrlAnh(anh.urlAnh)}
                        alt={anh.chuThich || dichVu?.tenDichVu || "Hình ảnh dịch vụ"}
                        onClick={() => setAnhDangXem(anh)}
                      />

                      {anh.anhDaiDien && (
                        <span className="haq-cover-badge">
                          <Star size={12} fill="currentColor" />
                          Ảnh đại diện
                        </span>
                      )}
                    </div>

                    <div className="haq-image-info">
                      <span className="haq-image-order">
                        Hình ảnh {index + 1}
                      </span>

                      <p>{anh.chuThich || "Chưa có chú thích"}</p>

                      <div className="haq-image-actions">
                        <button
                          type="button"
                          className={`haq-icon-button ${
                            anh.anhDaiDien ? "haq-is-cover" : ""
                          }`}
                          title="Đặt làm ảnh đại diện"
                          disabled={anh.anhDaiDien || dangXuLyId === anh.id}
                          onClick={() => datAnhDaiDien(anh)}
                        >
                          <Star size={15} />
                        </button>

                        <button
                          type="button"
                          className="haq-icon-button"
                          title="Đưa lên"
                          disabled={index === 0 || dangXuLyId === anh.id}
                          onClick={() => doiThuTu(anh, -1)}
                        >
                          <ArrowUp size={15} />
                        </button>

                        <button
                          type="button"
                          className="haq-icon-button"
                          title="Đưa xuống"
                          disabled={
                            index === danhSachAnh.length - 1 ||
                            dangXuLyId === anh.id
                          }
                          onClick={() => doiThuTu(anh, 1)}
                        >
                          <ArrowDown size={15} />
                        </button>

                        <button
                          type="button"
                          className="haq-icon-button haq-icon-delete"
                          title="Xóa hình ảnh"
                          disabled={dangXuLyId === anh.id}
                          onClick={() => xoaAnh(anh)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <footer className="haq-footer">
            <span>
              <Images size={15} />
              Tổng cộng {danhSachAnh.length} hình ảnh
            </span>

            <button
              type="button"
              className="haq-btn haq-btn-secondary"
              onClick={onClose}
              disabled={dangUpload}
            >
              Đóng
            </button>
          </footer>
        </section>
      </div>

      {/* Xem ảnh phóng to */}
      {anhDangXem && (
        <div
          className="haq-lightbox"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAnhDangXem(null);
          }}
        >
          <button
            type="button"
            className="haq-lightbox-close"
            onClick={() => setAnhDangXem(null)}
          >
            <X size={22} />
          </button>

          <img
            src={layUrlAnh(anhDangXem.urlAnh)}
            alt={anhDangXem.chuThich || "Hình ảnh dịch vụ"}
          />

          <p>{anhDangXem.chuThich || dichVu?.tenDichVu}</p>
        </div>
      )}
    </>
  );
}

export default HinhAnhDichVuModal;