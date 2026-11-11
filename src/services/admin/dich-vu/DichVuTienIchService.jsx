import API from "../../../Api";

const API_DICH_VU_TIEN_ICH = API.DICH_VU_TIEN_ICH;
const API_TIEN_ICH = API.TIEN_ICH;

async function xuLyPhanHoi(response) {
  if (response.status === 204) return null;

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
          "Không thể xử lý tiện ích dịch vụ.";

    throw new Error(message);
  }

  return data;
}

export function chuanHoaDanhSachTienIch(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  return [];
}

// Lấy tiện ích đã gán cho dịch vụ
export async function layTienIchCuaDichVu(dichVuId) {
  const response = await fetch(
    `${API_DICH_VU_TIEN_ICH}/dich-vu/${dichVuId}`
  );

  return xuLyPhanHoi(response);
}

// Lấy danh sách tiện ích đang hoạt động
export async function layDanhSachTienIchHoatDong() {
  const response = await fetch(`${API_TIEN_ICH}/dang-hoat-dong`);

  return xuLyPhanHoi(response);
}

// Gán tiện ích cho dịch vụ
export async function themTienIchChoDichVu(dichVuId, tienIchId) {
  const response = await fetch(API_DICH_VU_TIEN_ICH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dichVuId: Number(dichVuId),
      tienIchId: Number(tienIchId),
    }),
  });

  return xuLyPhanHoi(response);
}

// Gỡ tiện ích khỏi dịch vụ
export async function xoaTienIchKhoiDichVu(dichVuId, tienIchId) {
  const response = await fetch(
    `${API_DICH_VU_TIEN_ICH}/dich-vu/${dichVuId}/tien-ich/${tienIchId}`,
    {
      method: "DELETE",
    }
  );

  return xuLyPhanHoi(response);
}