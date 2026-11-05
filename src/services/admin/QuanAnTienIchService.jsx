import API from "../../Api";

const API_QUAN_AN_TIEN_ICH = API.QUAN_AN_TIEN_ICH;

const API_TIEN_ICH = API.TIEN_ICH;

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
        "Không thể xử lý tiện ích của quán.";

    throw new Error(message);
  }

  return data;
}

// Chuẩn hóa dữ liệu danh sách
export function chuanHoaDanhSachTienIch(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;

  return [];
}

// Lấy các tiện ích đã gán cho một quán
export async function layTienIchCuaQuan(quanAnId) {
  const response = await fetch(
    `${API_QUAN_AN_TIEN_ICH}/quan/${quanAnId}`
  );

  return xuLyPhanHoi(response);
}

// Lấy danh sách tiện ích để chọn
export async function layDanhSachTienIch() {
  const response = await fetch(API_TIEN_ICH);

  return xuLyPhanHoi(response);
}

// Gán tiện ích vào quán
export async function themTienIchChoQuan(quanAnId, tienIchId) {
  const response = await fetch(API_QUAN_AN_TIEN_ICH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quanAnId,
      tienIchId,
    }),
  });

  return xuLyPhanHoi(response);
}

// Gỡ tiện ích khỏi quán
// DELETE /api/quan-an-tien-ich/quan/{quanAnId}/tien-ich/{tienIchId}
export async function xoaTienIchKhoiQuan(quanAnId, tienIchId) {
  const response = await fetch(
    `${API_QUAN_AN_TIEN_ICH}/quan/${quanAnId}/tien-ich/${tienIchId}`,
    {
      method: "DELETE",
    }
  );

  return xuLyPhanHoi(response);
}