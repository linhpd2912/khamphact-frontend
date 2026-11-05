const API_BASE_URL = "http://localhost:8080/api";

// Đường dẫn API
const API_DANG_KY_HOP_TAC = `${API_BASE_URL}/dang-ky-hop-tac`;

const API_ADMIN_DANG_KY_HOP_TAC =
  `${API_BASE_URL}/admin/dang-ky-hop-tac`;

// ==========================================
// HÀM XỬ LÝ RESPONSE CHUNG
// ==========================================

async function xuLyResponse(response) {
  const contentType = response.headers.get("content-type");

  let data = null;

  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let message = "Có lỗi xảy ra khi xử lý yêu cầu";

    if (typeof data === "string" && data) {
      message = data;
    } else if (data?.message) {
      message = data.message;
    } else if (data?.detail) {
      message = data.detail;
    } else if (data?.errors) {
      message = Object.values(data.errors).join(", ");
    }

    throw new Error(message);
  }

  return data;
}

// ==========================================
// 1. KHÁCH HÀNG GỬI ĐĂNG KÝ
// POST /api/dang-ky-hop-tac
// ==========================================

export async function guiDangKyHopTac(data) {
  const response = await fetch(API_DANG_KY_HOP_TAC, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return xuLyResponse(response);
}

// ==========================================
// 2. LẤY TẤT CẢ ĐĂNG KÝ
// GET /api/admin/dang-ky-hop-tac
// ==========================================

export async function layTatCaDangKyHopTac(params = {}) {
  const queryParams = new URLSearchParams();

  if (params.keyword?.trim()) {
    queryParams.append("keyword", params.keyword.trim());
  }

  if (params.trangThai) {
    queryParams.append("trangThai", params.trangThai);
  }

  queryParams.append("page", params.page ?? 0);
  queryParams.append("size", params.size ?? 10);

  const response = await fetch(
    `${API_ADMIN_DANG_KY_HOP_TAC}?${queryParams.toString()}`
  );

  return xuLyResponse(response);
}

// ==========================================
// 3. LẤY DANH SÁCH CHỜ XỬ LÝ
// GET /api/admin/dang-ky-hop-tac/cho-xu-ly
// ==========================================

export async function layDanhSachChoXuLy(params = {}) {
  const queryParams = new URLSearchParams();

  queryParams.append("page", params.page ?? 0);
  queryParams.append("size", params.size ?? 10);

  const response = await fetch(
    `${API_ADMIN_DANG_KY_HOP_TAC}/cho-xu-ly?${queryParams.toString()}`
  );

  return xuLyResponse(response);
}

// ==========================================
// 4. LẤY DANH SÁCH ĐÃ DUYỆT
// GET /api/admin/dang-ky-hop-tac/da-duyet
// ==========================================

export async function layDanhSachDaDuyet(params = {}) {
  const queryParams = new URLSearchParams();

  queryParams.append("page", params.page ?? 0);
  queryParams.append("size", params.size ?? 10);

  const response = await fetch(
    `${API_ADMIN_DANG_KY_HOP_TAC}/da-duyet?${queryParams.toString()}`
  );

  return xuLyResponse(response);
}

// ==========================================
// 5. LẤY CHI TIẾT ĐĂNG KÝ
// GET /api/admin/dang-ky-hop-tac/{id}
// ==========================================

export async function layChiTietDangKyHopTac(id) {
  const response = await fetch(
    `${API_ADMIN_DANG_KY_HOP_TAC}/${id}`
  );

  return xuLyResponse(response);
}

// ==========================================
// 6. CẬP NHẬT TRẠNG THÁI
// PATCH /api/admin/dang-ky-hop-tac/{id}/trang-thai
// ==========================================

export async function capNhatTrangThaiHopTac(id, trangThai) {
  const response = await fetch(
    `${API_ADMIN_DANG_KY_HOP_TAC}/${id}/trang-thai`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trangThai,
      }),
    }
  );

  return xuLyResponse(response);
}

// ==========================================
// 7. CẬP NHẬT GHI CHÚ QUẢN TRỊ
// PATCH /api/admin/dang-ky-hop-tac/{id}/ghi-chu
// ==========================================

export async function capNhatGhiChuHopTac(id, ghiChuQuanTri) {
  const response = await fetch(
    `${API_ADMIN_DANG_KY_HOP_TAC}/${id}/ghi-chu`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ghiChuQuanTri,
      }),
    }
  );

  return xuLyResponse(response);
}

// ==========================================
// 8. ĐẾM SỐ ĐĂNG KÝ CHỜ XỬ LÝ
// GET /api/admin/dang-ky-hop-tac/thong-bao
// ==========================================

export async function demDangKyChoXuLy() {
  const response = await fetch(
    `${API_ADMIN_DANG_KY_HOP_TAC}/thong-bao`
  );

  return xuLyResponse(response);
}

// ==========================================
// 9. LẤY DANH SÁCH THÔNG BÁO MỚI
// GET /api/admin/dang-ky-hop-tac/thong-bao/moi
// ==========================================

export async function layThongBaoDangKyMoi(tuId = null) {
  const queryParams = new URLSearchParams();

  if (tuId !== null && tuId !== undefined) {
    queryParams.append("tuId", tuId);
  }

  const response = await fetch(
    `${API_ADMIN_DANG_KY_HOP_TAC}/thong-bao/moi?${queryParams.toString()}`
  );

  return xuLyResponse(response);
}