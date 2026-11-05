import API from "../../Api";

const DANH_MUC_API = API.DANH_MUC;

// Xử lý phản hồi từ Backend
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
        : data?.message || data?.detail || data?.error;

    throw new Error(
      message || `Yêu cầu thất bại. Mã lỗi: ${response.status}`
    );
  }

  return data;
}

// Lấy danh sách danh mục có phân trang
export async function layDanhSachDanhMuc(page = 0, size = 10) {
  const response = await fetch(
    `${DANH_MUC_API}?page=${page}&size=${size}`
  );

  return xuLyPhanHoi(response);
}

// Tìm kiếm danh mục
export async function timKiemDanhMuc(keyword, page = 0, size = 10) {
  const params = new URLSearchParams({
    keyword: keyword.trim(),
    page: String(page),
    size: String(size),
  });

  const response = await fetch(
    `${DANH_MUC_API}/tim-kiem?${params.toString()}`
  );

  return xuLyPhanHoi(response);
}

// Thêm danh mục
export async function themDanhMuc(data) {
  const response = await fetch(DANH_MUC_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return xuLyPhanHoi(response);
}

// Cập nhật danh mục
export async function suaDanhMuc(id, data) {
  const response = await fetch(`${DANH_MUC_API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return xuLyPhanHoi(response);
}

// Xóa danh mục
export async function xoaDanhMuc(id) {
  const response = await fetch(`${DANH_MUC_API}/${id}`, {
    method: "DELETE",
  });

  return xuLyPhanHoi(response);
}

// Bật hoặc tắt hoạt động
export async function capNhatTrangThaiDanhMuc(id, giaTri) {
  const response = await fetch(
    `${DANH_MUC_API}/${id}/trang-thai`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        giaTri,
      }),
    }
  );

  return xuLyPhanHoi(response);
}

// Bật hoặc tắt nổi bật
export async function capNhatNoiBatDanhMuc(id, giaTri) {
  const response = await fetch(
    `${DANH_MUC_API}/${id}/noi-bat`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        giaTri,
      }),
    }
  );

  return xuLyPhanHoi(response);
}