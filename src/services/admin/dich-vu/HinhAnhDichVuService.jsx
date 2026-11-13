import API from "../../../Api";

const BASE_URL = API.HINH_ANH_QUAN_API;

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
        : data?.message || data?.error || data?.detail;

    throw new Error(message || "Có lỗi xảy ra khi xử lý hình ảnh.");
  }

  return data;
}

const HinhAnhDichVuService = {
  // Lấy danh sách ảnh của dịch vụ
  getByDichVu: async (dichVuId) => {
    const response = await fetch(
      `${BASE_URL}/dich-vu?dichVuId=${encodeURIComponent(dichVuId)}`
    );

    return xuLyPhanHoi(response);
  },

  // Upload nhiều ảnh
  upload: async (dichVuId, files) => {
    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(
      `${BASE_URL}/upload/dich-vu?dichVuId=${encodeURIComponent(dichVuId)}`,
      {
        method: "POST",
        body: formData,
      }
    );

    return xuLyPhanHoi(response);
  },

  // Đặt ảnh đại diện
  datAnhDaiDien: async (id) => {
    const response = await fetch(
      `${BASE_URL}/dich-vu/${id}/anh-dai-dien`,
      { method: "PATCH" }
    );

    return xuLyPhanHoi(response);
  },

  // Cập nhật thứ tự
  capNhatThuTu: async (id, thuTu) => {
    const response = await fetch(
      `${BASE_URL}/dich-vu/${id}/thu-tu`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ thuTu }),
      }
    );

    return xuLyPhanHoi(response);
  },

  // Xóa ảnh
  xoa: async (id) => {
    const response = await fetch(
      `${BASE_URL}/dich-vu/${id}`,
      { method: "DELETE" }
    );

    return xuLyPhanHoi(response);
  },
};

export default HinhAnhDichVuService;