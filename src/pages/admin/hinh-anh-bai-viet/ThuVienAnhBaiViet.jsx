import { useEffect, useRef, useState } from "react";
import {
  Upload,
  ImagePlus,
  Trash2,
  Star,
  Check,
  LoaderCircle,
  Image as ImageIcon,
  X,
} from "lucide-react";

import * as hinhAnhService from "../../../services/admin/HinhAnhBaiVietService";

import "./ThuVienAnhBaiViet.css";

const MAX_FILES = 10;
const MAX_SIZE = 5 * 1024 * 1024;

const DINH_DANG_CHO_PHEP = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function ThuVienAnhBaiViet({
  baiVietId,
  anhDaiDien = "",
  onChonAnh,
  onDatAnhDaiDien,
}) {
  const inputRef = useRef(null);

  const [danhSachAnh, setDanhSachAnh] = useState([]);
  const [danhSachFile, setDanhSachFile] = useState([]);
  const [dangTaiAnh, setDangTaiAnh] = useState(false);
  const [dangTaiDanhSach, setDangTaiDanhSach] = useState(false);
  const [anhDangXuLy, setAnhDangXuLy] = useState(null);
  const [thongBao, setThongBao] = useState(null);

  // =====================================================
  // HIỂN THỊ THÔNG BÁO
  // =====================================================

  const hienThongBao = (noiDung, loai = "success") => {
    setThongBao({ noiDung, loai });

    window.setTimeout(() => {
      setThongBao(null);
    }, 3500);
  };

  // =====================================================
  // LẤY DANH SÁCH ẢNH
  // =====================================================

  const taiDanhSachAnh = async () => {
    if (!baiVietId) return;

    try {
      setDangTaiDanhSach(true);

      const data = await hinhAnhService.getByBaiViet(baiVietId);

      setDanhSachAnh(Array.isArray(data) ? data : []);
    } catch (error) {
      hienThongBao(
        error.message || "Không thể tải danh sách hình ảnh",
        "error"
      );
    } finally {
      setDangTaiDanhSach(false);
    }
  };

  useEffect(() => {
    taiDanhSachAnh();
  }, [baiVietId]);

  // =====================================================
  // CHỌN FILE TỪ MÁY TÍNH
  // =====================================================

  const xuLyChonFile = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    if (files.length > MAX_FILES) {
      hienThongBao("Mỗi lần chỉ được chọn tối đa 10 ảnh", "error");
      event.target.value = "";
      return;
    }

    const fileKhongHopLe = files.find(
      (file) => !DINH_DANG_CHO_PHEP.includes(file.type)
    );

    if (fileKhongHopLe) {
      hienThongBao(
        `Ảnh "${fileKhongHopLe.name}" không đúng định dạng hỗ trợ`,
        "error"
      );
      event.target.value = "";
      return;
    }

    const fileQuaLon = files.find((file) => file.size > MAX_SIZE);

    if (fileQuaLon) {
      hienThongBao(
        `Ảnh "${fileQuaLon.name}" vượt quá dung lượng 5 MB`,
        "error"
      );
      event.target.value = "";
      return;
    }

    setDanhSachFile(files);
  };

  // =====================================================
  // XÓA FILE KHỎI DANH SÁCH CHỜ UPLOAD
  // =====================================================

  const xoaFileChoUpload = (index) => {
    setDanhSachFile((prev) => prev.filter((_, i) => i !== index));
  };

  // =====================================================
  // UPLOAD ẢNH
  // =====================================================

  const xuLyUpload = async () => {
    if (!baiVietId) {
      hienThongBao("Vui lòng lưu bài viết trước khi upload ảnh", "error");
      return;
    }

    if (danhSachFile.length === 0) {
      hienThongBao("Vui lòng chọn ảnh cần tải lên", "error");
      return;
    }

    try {
      setDangTaiAnh(true);

      const data = await hinhAnhService.upload(
        baiVietId,
        danhSachFile
      );

      setDanhSachFile([]);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      await taiDanhSachAnh();

      hienThongBao(
        `Đã tải lên thành công ${data?.length || 0} hình ảnh`
      );
    } catch (error) {
      hienThongBao(
        error.message || "Upload hình ảnh thất bại",
        "error"
      );
    } finally {
      setDangTaiAnh(false);
    }
  };

  // =====================================================
  // CHỌN ẢNH ĐỂ CHÈN VÀO NỘI DUNG
  // =====================================================

  const xuLyChonAnh = (anh) => {
    const urlAnh = hinhAnhService.getImageUrl(anh.urlAnh);

    onChonAnh?.({
      ...anh,
      urlHienThi: urlAnh,
    });

    hienThongBao("Đã chọn ảnh");
  };

  // =====================================================
  // ĐẶT LÀM ẢNH ĐẠI DIỆN
  // =====================================================

  const xuLyDatAnhDaiDien = async (anh) => {
    try {
      setAnhDangXuLy(anh.id);

      await hinhAnhService.setFeatured(baiVietId, anh.id);

      const urlAnh = hinhAnhService.getImageUrl(anh.urlAnh);

      onDatAnhDaiDien?.({
        ...anh,
        urlHienThi: urlAnh,
      });

      hienThongBao("Đã cập nhật ảnh đại diện bài viết");
    } catch (error) {
      hienThongBao(
        error.message || "Không thể đặt ảnh đại diện",
        "error"
      );
    } finally {
      setAnhDangXuLy(null);
    }
  };

  // =====================================================
  // XÓA ẢNH
  // =====================================================

  const xuLyXoaAnh = async (anh) => {
    const laAnhDaiDien =
      anhDaiDien &&
      (anhDaiDien === anh.urlAnh ||
        anhDaiDien === hinhAnhService.getImageUrl(anh.urlAnh));

    if (laAnhDaiDien) {
      hienThongBao(
        "Đây là ảnh đại diện hiện tại. Hãy chọn ảnh khác trước khi xóa.",
        "error"
      );
      return;
    }

    const xacNhan = window.confirm(
      "Bạn có chắc chắn muốn xóa hình ảnh này không?"
    );

    if (!xacNhan) return;

    try {
      setAnhDangXuLy(anh.id);

      await hinhAnhService.remove(baiVietId, anh.id);

      setDanhSachAnh((prev) =>
        prev.filter((item) => item.id !== anh.id)
      );

      hienThongBao("Đã xóa hình ảnh");
    } catch (error) {
      hienThongBao(
        error.message || "Không thể xóa hình ảnh",
        "error"
      );
    } finally {
      setAnhDangXuLy(null);
    }
  };

  // =====================================================
  // GIAO DIỆN
  // =====================================================

  return (
    <div className="qlbv-thuvien">

      {/* Tiêu đề */}
      <div className="qlbv-thuvien-header">
        <div>
          <h3>
            <ImageIcon size={19} />
            Thư viện hình ảnh
          </h3>

          <p>
            Quản lý ảnh đại diện và ảnh sử dụng trong nội dung bài viết.
          </p>
        </div>

        <span className="qlbv-thuvien-count">
          {danhSachAnh.length} hình ảnh
        </span>
      </div>

      {/* Khu vực chọn ảnh */}
      <div className="qlbv-thuvien-upload">

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          onChange={xuLyChonFile}
        />

        <div className="qlbv-thuvien-upload-icon">
          <ImagePlus size={30} />
        </div>

        <h4>Chọn hình ảnh từ máy tính</h4>

        <p>
          Hỗ trợ JPG, JPEG, PNG, WEBP, GIF.
          <br />
          Tối đa 10 ảnh mỗi lần, mỗi ảnh không quá 5 MB.
        </p>

        <button
          type="button"
          className="qlbv-thuvien-select-btn"
          onClick={() => inputRef.current?.click()}
          disabled={dangTaiAnh}
        >
          <Upload size={16} />
          Chọn hình ảnh
        </button>
      </div>

      {/* Danh sách file chờ upload */}
      {danhSachFile.length > 0 && (
        <div className="qlbv-thuvien-preview">

          <div className="qlbv-thuvien-preview-heading">
            <strong>
              Ảnh đang chờ tải lên ({danhSachFile.length})
            </strong>

            <button
              type="button"
              onClick={() => setDanhSachFile([])}
            >
              Xóa tất cả
            </button>
          </div>

          <div className="qlbv-thuvien-grid">
            {danhSachFile.map((file, index) => (
              <div
                className="qlbv-thuvien-card qlbv-thuvien-card-preview"
                key={`${file.name}-${index}`}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                />

                <button
                  type="button"
                  className="qlbv-thuvien-remove-preview"
                  title="Bỏ ảnh này"
                  onClick={() => xoaFileChoUpload(index)}
                >
                  <X size={15} />
                </button>

                <div className="qlbv-thuvien-file-name">
                  {file.name}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="qlbv-thuvien-upload-btn"
            onClick={xuLyUpload}
            disabled={dangTaiAnh}
          >
            {dangTaiAnh ? (
              <>
                <LoaderCircle size={17} className="qlbv-spin" />
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

      {/* Danh sách ảnh đã upload */}
      <div className="qlbv-thuvien-gallery-heading">
        <h4>Ảnh đã tải lên</h4>
      </div>

      {dangTaiDanhSach ? (
        <div className="qlbv-thuvien-empty">
          <LoaderCircle size={24} className="qlbv-spin" />
          <span>Đang tải danh sách ảnh...</span>
        </div>
      ) : danhSachAnh.length === 0 ? (
        <div className="qlbv-thuvien-empty">
          <ImageIcon size={32} />
          <span>Chưa có hình ảnh nào được tải lên.</span>
        </div>
      ) : (
        <div className="qlbv-thuvien-grid">
          {danhSachAnh.map((anh) => {
            const urlAnh = hinhAnhService.getImageUrl(anh.urlAnh);

            const laAnhDaiDien =
              anhDaiDien &&
              (anhDaiDien === anh.urlAnh ||
                anhDaiDien === urlAnh);

            return (
              <div
                className={`qlbv-thuvien-card ${
                  laAnhDaiDien ? "is-featured" : ""
                }`}
                key={anh.id}
              >
                <div className="qlbv-thuvien-image">
                  <img
                    src={urlAnh}
                    alt={anh.altText || "Hình ảnh bài viết"}
                  />

                  {laAnhDaiDien && (
                    <span className="qlbv-thuvien-featured-label">
                      <Star size={13} fill="currentColor" />
                      Ảnh đại diện
                    </span>
                  )}
                </div>

                <div className="qlbv-thuvien-card-actions">
                  <button
                    type="button"
                    title="Chèn vào nội dung"
                    onClick={() => xuLyChonAnh(anh)}
                  >
                    <ImagePlus size={15} />
                    Chèn ảnh
                  </button>

                  <button
                    type="button"
                    title="Đặt làm ảnh đại diện"
                    className={laAnhDaiDien ? "active" : ""}
                    disabled={anhDangXuLy === anh.id || laAnhDaiDien}
                    onClick={() => xuLyDatAnhDaiDien(anh)}
                  >
                    {anhDangXuLy === anh.id ? (
                      <LoaderCircle size={15} className="qlbv-spin" />
                    ) : (
                      <Star size={15} />
                    )}
                    Đại diện
                  </button>

                  <button
                    type="button"
                    title="Xóa ảnh"
                    className="delete"
                    disabled={anhDangXuLy === anh.id}
                    onClick={() => xuLyXoaAnh(anh)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="qlbv-thuvien-image-info">
                  <span>Ảnh #{anh.thuTu + 1}</span>
                  {anh.altText && <span>{anh.altText}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Thông báo */}
      {thongBao && (
        <div
          className={`qlbv-thuvien-toast ${thongBao.loai}`}
          role="status"
        >
          {thongBao.loai === "success" ? (
            <Check size={17} />
          ) : (
            <X size={17} />
          )}

          {thongBao.noiDung}
        </div>
      )}
    </div>
  );
}

export default ThuVienAnhBaiViet;