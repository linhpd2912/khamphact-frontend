import API from "../../Api";

const API_URL = API.DANH_MUC_BAI_VIET;

// Xử lý response từ backend
async function xuLyResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      data?.error ||
      `Lỗi HTTP: ${response.status}`
    );
  }

  return data;
}

// Lấy tất cả danh mục
export async function getAll() {
  const response = await fetch(API_URL);
  return xuLyResponse(response);
}

// Lấy danh mục đang hoạt động
export async function getActive() {
  const response = await fetch(`${API_URL}/hoat-dong`);
  return xuLyResponse(response);
}

// Lấy chi tiết theo ID
export async function getById(id) {
  const response = await fetch(`${API_URL}/${id}`);
  return xuLyResponse(response);
}

// Lấy danh mục theo slug
export async function getBySlug(slug) {
  const response = await fetch(
    `${API_URL}/slug/${encodeURIComponent(slug)}`
  );
  return xuLyResponse(response);
}

// Kiểm tra slug đã tồn tại hay chưa
export async function checkSlug(slug, id = null) {
  const params = new URLSearchParams({ slug });

  if (id !== null) {
    params.append("id", id);
  }

  const response = await fetch(
    `${API_URL}/kiem-tra-slug?${params.toString()}`
  );

  return xuLyResponse(response);
}

// Thêm danh mục
export async function create(data) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return xuLyResponse(response);
}

// Cập nhật danh mục
export async function update(id, data) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return xuLyResponse(response);
}

// Cập nhật trạng thái
export async function updateStatus(id, hoatDong) {
  const response = await fetch(`${API_URL}/${id}/trang-thai`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ hoatDong }),
  });

  return xuLyResponse(response);
}

// Cập nhật thứ tự nhiều danh mục
export async function updateOrder(danhSach) {
  const response = await fetch(`${API_URL}/cap-nhat-thu-tu`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ danhSach }),
  });

  return xuLyResponse(response);
}

// Xóa danh mục
export async function remove(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  return xuLyResponse(response);
}