import API from "../../Api";

const API_URL = API.TIEN_ICH;

async function xuLyPhanHoi(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message ||
          data?.detail ||
          data?.error ||
          "Đã xảy ra lỗi khi xử lý tiện ích.";

    throw new Error(message);
  }

  return data;
}

// Lấy tất cả tiện ích
export async function layTatCaTienIch() {
  const response = await fetch(API_URL);
  return xuLyPhanHoi(response);
}

// Thêm tiện ích
export async function themTienIch(duLieu) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(duLieu),
  });

  return xuLyPhanHoi(response);
}

// Cập nhật tiện ích
export async function capNhatTienIch(id, duLieu) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(duLieu),
  });

  return xuLyPhanHoi(response);
}

// Bật hoặc tắt tiện ích
export async function doiTrangThaiTienIch(id) {
  const response = await fetch(`${API_URL}/${id}/trang-thai`, {
    method: "PATCH",
  });

  return xuLyPhanHoi(response);
}

// Xóa tiện ích
export async function xoaTienIch(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  return xuLyPhanHoi(response);
}