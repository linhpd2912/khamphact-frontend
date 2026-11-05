import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Map,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

import "./QuanLyPhuong.css";
import API from "../../../Api";
import ThemPhuong from "./ThemPhuong";
import SuaPhuong from "./SuaPhuong";
import XoaPhuong from "./XoaPhuong";

const PAGE_SIZE = 12;

function docThongBaoLoi(data, fallback) {
  if (!data) return fallback;

  return (
    data.detail ||
    data.message ||
    data.error ||
    fallback
  );
}

export default function QuanLyPhuong() {
  // Danh sách phường/xã hiện tại
  const [phuongXaList, setPhuongXaList] = useState([]);

  // Danh sách tỉnh/thành cho bộ lọc
  const [tinhThanhList, setTinhThanhList] = useState([]);

  // Trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);
  const [loadingTinh, setLoadingTinh] = useState(true);

  // Lỗi khi tải dữ liệu
  const [error, setError] = useState("");
  const [errorTinh, setErrorTinh] = useState("");

  // Tìm kiếm và bộ lọc
  const [keyword, setKeyword] = useState("");
  const [tinhThanhId, setTinhThanhId] = useState("");
  const [hoatDong, setHoatDong] = useState("");

  // Phân trang
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Dùng để tải lại dữ liệu sau khi thêm/sửa/xóa
  const [reload, setReload] = useState(0);

  // Hộp thoại đang mở
  const [modal, setModal] = useState(null);

  // Phường/xã được chọn để sửa hoặc xóa
  const [selectedPhuong, setSelectedPhuong] = useState(null);

  // Thông báo thao tác thành công
  const [successMessage, setSuccessMessage] = useState("");

  // =====================================================
  // 1. TẢI DANH SÁCH TỈNH/THÀNH
  // =====================================================
  useEffect(() => {
    const controller = new AbortController();

    async function fetchTinhThanh() {
      setLoadingTinh(true);
      setErrorTinh("");

      try {
        const response = await fetch(API.TINH_THANH, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Không thể tải danh sách tỉnh/thành.");
        }

        const data = await response.json();

        setTinhThanhList(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setErrorTinh(
            err.message || "Đã xảy ra lỗi khi tải tỉnh/thành."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingTinh(false);
        }
      }
    }

    fetchTinhThanh();

    return () => controller.abort();
  }, []);

  // =====================================================
  // 2. TẢI DANH SÁCH PHƯỜNG/XÃ
  // =====================================================
  const fetchPhuongXa = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("size", String(PAGE_SIZE));
        params.set("sortBy", "tenPhuongXa");
        params.set("sortDir", "asc");

        if (keyword.trim()) {
          params.set("keyword", keyword.trim());
        }

        if (tinhThanhId) {
          params.set("tinhThanhId", tinhThanhId);
        }

        if (hoatDong !== "") {
          params.set("hoatDong", hoatDong);
        }

        const response = await fetch(
          `${API.PHUONG_XA}?${params.toString()}`,
          { signal }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            docThongBaoLoi(
              data,
              "Không thể tải danh sách phường/xã."
            )
          );
        }

        // Backend trả Page<PhuongXaResponseDTO>
        setPhuongXaList(
          Array.isArray(data?.content) ? data.content : []
        );

        setTotalPages(data?.totalPages ?? 0);
        setTotalElements(data?.totalElements ?? 0);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Đã xảy ra lỗi khi tải phường/xã."
          );
          setPhuongXaList([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [keyword, tinhThanhId, hoatDong, page]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchPhuongXa(controller.signal);

    return () => controller.abort();
  }, [fetchPhuongXa, reload]);

  // =====================================================
  // 3. THAY ĐỔI BỘ LỌC
  // =====================================================
  function handleKeywordChange(event) {
    setKeyword(event.target.value);
    setPage(0);
  }

  function handleTinhThanhChange(event) {
    setTinhThanhId(event.target.value);
    setPage(0);
  }

  function handleTrangThaiChange(event) {
    setHoatDong(event.target.value);
    setPage(0);
  }

  // =====================================================
  // 4. LÀM MỚI DỮ LIỆU
  // =====================================================
  function handleRefresh() {
    setReload((value) => value + 1);
    setSuccessMessage("");
  }

  // =====================================================
  // 5. MỞ MODAL
  // =====================================================
  function handleOpenAdd() {
    setSelectedPhuong(null);
    setModal("add");
  }

  function handleOpenEdit(phuong) {
    setSelectedPhuong(phuong);
    setModal("edit");
  }

  function handleOpenDelete(phuong) {
    setSelectedPhuong(phuong);
    setModal("delete");
  }

  function handleCloseModal() {
    setModal(null);
    setSelectedPhuong(null);
  }

  // =====================================================
  // 6. SAU KHI THAO TÁC THÀNH CÔNG
  // =====================================================
  function handleSuccess(message) {
    setModal(null);
    setSelectedPhuong(null);
    setSuccessMessage(message || "Thao tác thành công.");

    // Nếu đang ở trang sau mà xóa hết dữ liệu trang đó,
    // quay về trang trước để tránh trang trống.
    if (
      modal === "delete" &&
      phuongXaList.length === 1 &&
      page > 0
    ) {
      setPage((currentPage) => currentPage - 1);
    } else {
      setReload((value) => value + 1);
    }
  }

  // Tự ẩn thông báo thành công sau vài giây
  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  // =====================================================
  // 7. TÊN TỈNH/THÀNH ĐƯỢC CHỌN
  // =====================================================
  const selectedTinhName = useMemo(() => {
    if (!tinhThanhId) return "";

    const tinh = tinhThanhList.find(
      (item) => String(item.id) === String(tinhThanhId)
    );

    return tinh?.tenTinhThanh || "";
  }, [tinhThanhId, tinhThanhList]);

  // =====================================================
  // 8. GIAO DIỆN
  // =====================================================
  return (
    <div className="phuong-page">
      {/* Tiêu đề */}
      <div className="phuong-page-header">
        <div className="phuong-page-heading">
          <div className="phuong-heading-icon">
            <MapPin size={25} />
          </div>

          <div>
            <h1>Quản lý Phường/Xã</h1>
            <p>
              Quản lý địa chỉ hành chính và phân loại theo tỉnh/thành.
            </p>
          </div>
        </div>

        <div className="phuong-header-actions">
          <button
            type="button"
            className="phuong-btn phuong-btn-outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={loading ? "phuong-spin" : ""}
            />
            Làm mới
          </button>

          <button
            type="button"
            className="phuong-btn phuong-btn-primary"
            onClick={handleOpenAdd}
          >
            <Plus size={18} />
            Thêm phường/xã
          </button>
        </div>
      </div>

      {/* Thống kê */}
      <div className="phuong-stats">
        <div className="phuong-stat-card">
          <div className="phuong-stat-icon phuong-stat-purple">
            <Map size={22} />
          </div>

          <div>
            <span>Tổng phường/xã</span>
            <strong>{totalElements}</strong>
          </div>
        </div>

        <div className="phuong-stat-card">
          <div className="phuong-stat-icon phuong-stat-green">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Đang hiển thị</span>
            <strong>{phuongXaList.length}</strong>
          </div>
        </div>

        <div className="phuong-stat-card">
          <div className="phuong-stat-icon phuong-stat-orange">
            <MapPin size={22} />
          </div>

          <div>
            <span>Tỉnh/thành đang lọc</span>
            <strong className="phuong-stat-text">
              {selectedTinhName || "Tất cả"}
            </strong>
          </div>
        </div>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="phuong-toolbar">
        <div className="phuong-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Tìm tên, mã hoặc đường dẫn SEO..."
            value={keyword}
            onChange={handleKeywordChange}
          />

          {keyword && (
            <button
              type="button"
              className="phuong-search-clear"
              aria-label="Xóa từ khóa"
              onClick={() => {
                setKeyword("");
                setPage(0);
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="phuong-filter-group">
          <select
            value={tinhThanhId}
            onChange={handleTinhThanhChange}
            disabled={loadingTinh}
            aria-label="Lọc theo tỉnh thành"
          >
            <option value="">Tất cả tỉnh/thành</option>

            {tinhThanhList.map((tinh) => (
              <option key={tinh.id} value={tinh.id}>
                {tinh.tenTinhThanh}
              </option>
            ))}
          </select>

          <select
            value={hoatDong}
            onChange={handleTrangThaiChange}
            aria-label="Lọc theo trạng thái"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Ngừng hoạt động</option>
          </select>
        </div>
      </div>

      {errorTinh && (
        <div className="phuong-alert phuong-alert-error">
          <AlertCircle size={19} />
          <span>{errorTinh}</span>
        </div>
      )}

      {/* Thông báo thành công */}
      {successMessage && (
        <div className="phuong-alert phuong-alert-success">
          <CheckCircle2 size={19} />
          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Đóng thông báo"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Lỗi tải danh sách */}
      {error && (
        <div className="phuong-error-box">
          <AlertCircle size={22} />

          <div>
            <strong>Không thể tải danh sách phường/xã</strong>
            <p>{error}</p>

            <button
              type="button"
              onClick={handleRefresh}
              className="phuong-btn phuong-btn-outline"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Danh sách card */}
      {!error && (
        <>
          <div className="phuong-list-heading">
            <div>
              <h2>Danh sách phường/xã</h2>

              <p>
                {loading
                  ? "Đang tải dữ liệu..."
                  : `Hiển thị ${phuongXaList.length} / ${totalElements} phường/xã`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="phuong-loading">
              <div className="phuong-spinner" />
              <span>Đang tải danh sách...</span>
            </div>
          ) : phuongXaList.length === 0 ? (
            <div className="phuong-empty">
              <div className="phuong-empty-icon">
                <MapPin size={34} />
              </div>

              <h3>Chưa tìm thấy phường/xã</h3>

              <p>
                Thử thay đổi từ khóa hoặc bộ lọc, hoặc thêm phường/xã mới.
              </p>

              <button
                type="button"
                className="phuong-btn phuong-btn-primary"
                onClick={handleOpenAdd}
              >
                <Plus size={18} />
                Thêm phường/xã
              </button>
            </div>
          ) : (
            <div className="phuong-card-grid">
              {phuongXaList.map((phuong) => (
                <article
                  className="phuong-card"
                  key={phuong.id}
                >
                  <div className="phuong-card-top">
                    <div className="phuong-card-icon">
                      <MapPin size={23} />
                    </div>

                    <span
                      className={`phuong-status ${
                        phuong.hoatDong
                          ? "phuong-status-active"
                          : "phuong-status-inactive"
                      }`}
                    >
                      {phuong.hoatDong ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}

                      {phuong.hoatDong
                        ? "Hoạt động"
                        : "Ngừng hoạt động"}
                    </span>
                  </div>

                  <div className="phuong-card-content">
                    <span className="phuong-card-id">
                      MÃ ĐỊA CHỈ #{phuong.id}
                    </span>

                    <h3 title={phuong.tenPhuongXa}>
                      {phuong.tenPhuongXa}
                    </h3>

                    <div className="phuong-card-info">
                      <span>Mã phường/xã</span>
                      <strong>{phuong.maPhuongXa || "Chưa có"}</strong>
                    </div>

                    <div className="phuong-card-info">
                      <span>Tỉnh/thành</span>
                      <strong>
                        {phuong.tenTinhThanh || "Chưa xác định"}
                      </strong>
                    </div>

                    <div className="phuong-card-slug">
                      <span>Đường dẫn SEO</span>
                      <p title={phuong.duongDanSeo || ""}>
                        {phuong.duongDanSeo || "Chưa thiết lập"}
                      </p>
                    </div>
                  </div>

                  <div className="phuong-card-actions">
                    <button
                      type="button"
                      className="phuong-card-edit"
                      onClick={() => handleOpenEdit(phuong)}
                    >
                      <Pencil size={16} />
                      Chỉnh sửa
                    </button>

                    <button
                      type="button"
                      className="phuong-card-delete"
                      onClick={() => handleOpenDelete(phuong)}
                      aria-label={`Xóa ${phuong.tenPhuongXa}`}
                      title="Xóa phường/xã"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Phân trang */}
          {!loading && totalPages > 1 && (
            <div className="phuong-pagination">
              <span>
                Trang <strong>{page + 1}</strong> / {totalPages}
              </span>

              <div className="phuong-pagination-buttons">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page <= 0}
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={19} />
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index
                )
                  .filter(
                    (index) =>
                      index === 0 ||
                      index === totalPages - 1 ||
                      Math.abs(index - page) <= 1
                  )
                  .reduce((result, index, position, array) => {
                    if (
                      position > 0 &&
                      index - array[position - 1] > 1
                    ) {
                      result.push("ellipsis-" + index);
                    }

                    result.push(index);
                    return result;
                  }, [])
                  .map((item) =>
                    typeof item === "string" ? (
                      <span
                        key={item}
                        className="phuong-pagination-dots"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        type="button"
                        key={item}
                        className={
                          page === item ? "active" : ""
                        }
                        onClick={() => setPage(item)}
                      >
                        {item + 1}
                      </button>
                    )
                  )}

                <button
                  type="button"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                  aria-label="Trang sau"
                >
                  <ChevronRight size={19} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal thêm */}
      {modal === "add" && (
        <ThemPhuong
          tinhThanhList={tinhThanhList}
          onClose={handleCloseModal}
          onSuccess={() => handleSuccess("Thêm phường/xã thành công.")}
        />
      )}

      {/* Modal sửa */}
      {modal === "edit" && selectedPhuong && (
        <SuaPhuong
          phuong={selectedPhuong}
          tinhThanhList={tinhThanhList}
          onClose={handleCloseModal}
          onSuccess={() => handleSuccess("Cập nhật phường/xã thành công.")}
        />
      )}

      {/* Modal xóa */}
      {modal === "delete" && selectedPhuong && (
        <XoaPhuong
          phuong={selectedPhuong}
          onClose={handleCloseModal}
          onSuccess={() => handleSuccess("Xóa phường/xã thành công.")}
        />
      )}
    </div>
  );
}