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
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import HinhAnhQuanService from "../../../services/admin/HinhAnhQuanService";

import "./HinhAnhQuanModal.css";
import API from "../../../Api";


function layDanhSach(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;

  return [];
}

// Chuyển URL tương đối thành URL có thể hiển thị trong trình duyệt.
function layUrlAnh(url) {
  if (!url) return "";

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${API.BACKEND}${url.startsWith("/") ? "" : "/"}${url}`;
}

function HinhAnhQuanModal({ quanAn, onClose, onThongBao }) {
  const [danhSachAnh, setDanhSachAnh] = useState([]);
  const [danhSachFile, setDanhSachFile] = useState([]);

  const [dangTai, setDangTai] = useState(true);
  const [dangUpload, setDangUpload] = useState(false);
  const [dangXuLyId, setDangXuLyId] = useState(null);

  const [loi, setLoi] = useState("");
  const [thongBaoNoiBo, setThongBaoNoiBo] = useState("");

  const [anhDangXem, setAnhDangXem] = useState(null);

  // Tải hình ảnh theo quán đang chọn.
  const taiDanhSachAnh = useCallback(async () => {
    if (!quanAn?.id) return;

    setDangTai(true);
    setLoi("");

    try {
      const data = await HinhAnhQuanService.getByQuanAn(quanAn.id);

      setDanhSachAnh(layDanhSach(data));
    } catch (error) {
      setLoi(error.message || "Không thể tải hình ảnh của quán.");
    } finally {
      setDangTai(false);
    }
  }, [quanAn?.id]);

  useEffect(() => {
    taiDanhSachAnh();
  }, [taiDanhSachAnh]);

  // Chọn file ảnh từ máy tính.
  const chonFile = (event) => {
    const files = Array.from(event.target.files || []);

    const fileHopLe = [];
    const fileKhongHopLe = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        fileKhongHopLe.push(file.name);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        fileKhongHopLe.push(`${file.name} (lớn hơn 10 MB)`);
        return;
      }

      fileHopLe.push(file);
    });

    setDanhSachFile((danhSachCu) => {
      const daChon = new Set(
        danhSachCu.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
      );

      const fileMoi = fileHopLe.filter(
        (file) =>
          !daChon.has(`${file.name}-${file.size}-${file.lastModified}`)
      );

      return [...danhSachCu, ...fileMoi];
    });

    if (fileKhongHopLe.length > 0) {
      setThongBaoNoiBo(
        `Đã bỏ qua ${fileKhongHopLe.length} file không hợp lệ hoặc vượt quá 10 MB.`
      );
    } else {
      setThongBaoNoiBo("");
    }

    // Cho phép chọn lại cùng một file.
    event.target.value = "";
  };

  // Bỏ một file khỏi danh sách chờ upload.
  const boFileCho = (indexCanXoa) => {
    setDanhSachFile((danhSachCu) =>
      danhSachCu.filter((_, index) => index !== indexCanXoa)
    );
  };

  // Tải ảnh lên backend.
  const taiAnhLen = async () => {
    if (!quanAn?.id) {
      setLoi("Không xác định được quán ăn.");
      return;
    }

    if (danhSachFile.length === 0) {
      setLoi("Vui lòng chọn ít nhất một hình ảnh.");
      return;
    }

    setDangUpload(true);
    setLoi("");

    try {
      await HinhAnhQuanService.upload(quanAn.id, danhSachFile);

      setDanhSachFile([]);
      setThongBaoNoiBo("Tải hình ảnh thành công.");

      await taiDanhSachAnh();

      onThongBao?.("Tải hình ảnh lên thành công.", "success");
    } catch (error) {
      setLoi(error.message || "Không thể tải hình ảnh lên.");
    } finally {
      setDangUpload(false);
    }
  };

  // Đặt ảnh đại diện.
  const datAnhDaiDien = async (anh) => {
    if (anh.anhDaiDien) return;

    setDangXuLyId(anh.id);
    setLoi("");

    try {
      await HinhAnhQuanService.datAnhDaiDien(anh.id);

      await taiDanhSachAnh();

      onThongBao?.("Đã cập nhật ảnh đại diện.", "success");
    } catch (error) {
      setLoi(error.message || "Không thể cập nhật ảnh đại diện.");
    } finally {
      setDangXuLyId(null);
    }
  };

  // Đổi thứ tự lên hoặc xuống.
  const doiThuTu = async (anh, buoc) => {
    const index = danhSachAnh.findIndex((item) => item.id === anh.id);
    const indexMoi = index + buoc;

    if (
      index < 0 ||
      indexMoi < 0 ||
      indexMoi >= danhSachAnh.length
    ) {
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
      // Gán thứ tự mới cho hai ảnh bị đổi vị trí.
      await HinhAnhQuanService.capNhatThuTu(
        danhSachMoi[index].id,
        index
      );

      await HinhAnhQuanService.capNhatThuTu(
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

  // Xóa ảnh.
  const xoaAnh = async (anh) => {
    const dongY = window.confirm(
      `Bạn có chắc muốn xóa hình ảnh này của quán "${quanAn.tenQuan}" không?`
    );

    if (!dongY) return;

    setDangXuLyId(anh.id);
    setLoi("");

    try {
      await HinhAnhQuanService.xoa(anh.id);

      setDanhSachAnh((danhSachCu) =>
        danhSachCu.filter((item) => item.id !== anh.id)
      );

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
        aria-labelledby="haq-title"
      >
        {/* HEADER */}
        <header className="haq-header">
          <div className="haq-header-icon">
            <Images size={25} />
          </div>

          <div className="haq-header-title">
            <h2 id="haq-title">Quản lý hình ảnh</h2>

            <p>
              Quán: <strong>{quanAn?.tenQuan}</strong>
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

        {/* THỐNG KÊ */}
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

        {/* THÔNG BÁO LỖI */}
        {loi && (
          <div className="haq-alert haq-alert-error">
            <AlertCircle size={18} />
            <span>{loi}</span>
            <button
              type="button"
              onClick={() => setLoi("")}
              aria-label="Đóng thông báo"
            >
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
              aria-label="Đóng thông báo"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* KHU VỰC TẢI ẢNH */}
        <div className="haq-upload-section">
          <div className="haq-section-heading">
            <div>
              <h3>Thêm hình ảnh mới</h3>
              <p>Chọn ảnh JPG, PNG hoặc WebP, tối đa 10 MB mỗi ảnh.</p>
            </div>
          </div>

          <label className="haq-upload-zone">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={chonFile}
              disabled={dangUpload}
            />

            <span className="haq-upload-icon">
              <ImagePlus size={29} />
            </span>

            <strong>Chọn hình ảnh từ máy tính</strong>

            <span>
              Bạn có thể chọn nhiều hình ảnh cùng lúc.
            </span>

            <span className="haq-upload-button">
              <Upload size={16} />
              Chọn ảnh
            </span>
          </label>

          {/* DANH SÁCH FILE CHỜ UPLOAD */}
          {danhSachFile.length > 0 && (
            <div className="haq-pending">
              <div className="haq-pending-heading">
                <strong>
                  Đã chọn {danhSachFile.length} hình ảnh
                </strong>

                <button
                  type="button"
                  onClick={() => setDanhSachFile([])}
                  disabled={dangUpload}
                >
                  Bỏ chọn tất cả
                </button>
              </div>

              <div className="haq-pending-grid">
                {danhSachFile.map((file, index) => (
                  <div
                    className="haq-pending-item"
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                    />

                    <div className="haq-pending-info">
                      <span title={file.name}>{file.name}</span>
                      <small>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={() => boFileCho(index)}
                      disabled={dangUpload}
                      aria-label={`Bỏ ${file.name}`}
                    >
                      <X size={15} />
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
                    <RefreshCw size={17} className="haq-spin" />
                    Đang tải ảnh lên...
                  </>
                ) : (
                  <>
                    <Upload size={17} />
                    Tải lên {danhSachFile.length} ảnh
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* DANH SÁCH ẢNH ĐÃ TẢI */}
        <div className="haq-gallery-section">
          <div className="haq-section-heading haq-gallery-heading">
            <div>
              <h3>Thư viện hình ảnh</h3>
              <p>
                Các ảnh đang được lưu cho quán {quanAn?.tenQuan}.
              </p>
            </div>

            <button
              type="button"
              className="haq-btn haq-btn-secondary"
              onClick={taiDanhSachAnh}
              disabled={dangTai}
            >
              <RefreshCw
                size={16}
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
                <ImageIcon size={35} />
              </span>
              <h4>Quán chưa có hình ảnh</h4>
              <p>Hãy chọn ảnh từ máy tính để bắt đầu xây dựng thư viện.</p>
            </div>
          ) : (
            <div className="haq-gallery">
              {danhSachAnh.map((anh, index) => (
                <article className="haq-image-card" key={anh.id}>
                  <div className="haq-image-wrapper">
                    <img
                      src={layUrlAnh(anh.urlAnh)}
                      alt={anh.chuThich || quanAn?.tenQuan || "Hình ảnh quán"}
                      loading="lazy"
                      onClick={() => setAnhDangXem(anh)}
                      onError={(event) => {
                        event.currentTarget.style.opacity = "0.25";
                      }}
                    />

                    {anh.anhDaiDien && (
                      <span className="haq-cover-badge">
                        <Star size={13} fill="currentColor" />
                        Ảnh đại diện
                      </span>
                    )}

                    <button
                      type="button"
                      className="haq-preview-button"
                      onClick={() => setAnhDangXem(anh)}
                      title="Xem ảnh lớn"
                    >
                      <ImageIcon size={17} />
                    </button>
                  </div>

                  <div className="haq-image-info">
                    <span className="haq-image-order">
                      Ảnh #{anh.thuTu ?? index}
                    </span>

                    <p title={anh.chuThich || ""}>
                      {anh.chuThich || "Chưa có chú thích"}
                    </p>

                    <div className="haq-image-actions">
                      <button
                        type="button"
                        className={
                          anh.anhDaiDien
                            ? "haq-icon-button haq-is-cover"
                            : "haq-icon-button"
                        }
                        onClick={() => datAnhDaiDien(anh)}
                        disabled={
                          anh.anhDaiDien || dangXuLyId === anh.id
                        }
                        title={
                          anh.anhDaiDien
                            ? "Đang là ảnh đại diện"
                            : "Đặt làm ảnh đại diện"
                        }
                      >
                        <Star size={16} />
                      </button>

                      <button
                        type="button"
                        className="haq-icon-button"
                        onClick={() => doiThuTu(anh, -1)}
                        disabled={index === 0 || dangXuLyId !== null}
                        title="Chuyển lên trước"
                      >
                        <ArrowUp size={16} />
                      </button>

                      <button
                        type="button"
                        className="haq-icon-button"
                        onClick={() => doiThuTu(anh, 1)}
                        disabled={
                          index === danhSachAnh.length - 1 ||
                          dangXuLyId !== null
                        }
                        title="Chuyển xuống sau"
                      >
                        <ArrowDown size={16} />
                      </button>

                      <button
                        type="button"
                        className="haq-icon-button haq-icon-delete"
                        onClick={() => xoaAnh(anh)}
                        disabled={dangXuLyId === anh.id}
                        title="Xóa hình ảnh"
                      >
                        {dangXuLyId === anh.id ? (
                          <RefreshCw size={16} className="haq-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="haq-footer">
          <span>
            <Images size={16} />
            {danhSachAnh.length} hình ảnh
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

      {/* XEM ẢNH LỚN */}
      {anhDangXem && (
        <div
          className="haq-lightbox"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setAnhDangXem(null);
            }
          }}
        >
          <button
            type="button"
            className="haq-lightbox-close"
            onClick={() => setAnhDangXem(null)}
            aria-label="Đóng ảnh"
          >
            <X size={23} />
          </button>

          <img
            src={layUrlAnh(anhDangXem.urlAnh)}
            alt={anhDangXem.chuThich || quanAn?.tenQuan || "Hình ảnh quán"}
          />

          <p>
            {anhDangXem.chuThich || quanAn?.tenQuan}
          </p>
        </div>
      )}
    </div>
  );
}

export default HinhAnhQuanModal;