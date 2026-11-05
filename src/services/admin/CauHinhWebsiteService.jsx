import API from "../../Api";

const API_URL = API.CAU_HINH_WEBSITE;

// Xử lý kết quả API
async function xuLyResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || data?.detail || "Có lỗi xảy ra khi xử lý dữ liệu"
    );
  }

  return data;
}

// Lấy cấu hình website
export async function layCauHinhWebsite() {
  const response = await fetch(API_URL);
  return xuLyResponse(response);
}

// Cập nhật cấu hình website
export async function capNhatCauHinhWebsite(data) {
  const response = await fetch(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return xuLyResponse(response);
}

// Upload logo
export async function uploadLogo(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload/logo`, {
    method: "POST",
    body: formData,
  });

  return xuLyResponse(response);
}

// Upload favicon
export async function uploadFavicon(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload/favicon`, {
    method: "POST",
    body: formData,
  });

  return xuLyResponse(response);
}

// Upload banner trang chủ
export async function uploadBanner(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload/banner`, {
    method: "POST",
    body: formData,
  });

  return xuLyResponse(response);
}