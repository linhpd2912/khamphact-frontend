import API from "../../Api";

const HINH_ANH_QUAN_API = API.HINH_ANH_QUAN_API;

const xuLyPhanHoi = async (response) => {
  if (!response.ok) {
    let message = "Có lỗi xảy ra khi xử lý hình ảnh.";

    try {
      const data = await response.json();
      message = data.message || data.error || message;
    } catch {
      // Phản hồi không có JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const HinhAnhQuanService = {
  // Lấy tất cả hình ảnh của một quán.
  getByQuanAn: async (quanAnId) => {
    const response = await fetch(
      `${HINH_ANH_QUAN_API}?quanAnId=${encodeURIComponent(quanAnId)}`
    );

    return xuLyPhanHoi(response);
  },

  // Tải một hoặc nhiều hình ảnh.
  upload: async (quanAnId, files) => {
    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(
      `${HINH_ANH_QUAN_API}/upload?quanAnId=${encodeURIComponent(quanAnId)}`,
      {
        method: "POST",
        body: formData,
      }
    );

    return xuLyPhanHoi(response);
  },

  // Chọn ảnh đại diện.
  datAnhDaiDien: async (id) => {
    const response = await fetch(
      `${HINH_ANH_QUAN_API}/${id}/anh-dai-dien`,
      {
        method: "PATCH",
      }
    );

    return xuLyPhanHoi(response);
  },

  // Cập nhật thứ tự hiển thị.
  capNhatThuTu: async (id, thuTu) => {
    const response = await fetch(
      `${HINH_ANH_QUAN_API}/${id}/thu-tu`,
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

  // Xóa hình ảnh.
  xoa: async (id) => {
    const response = await fetch(`${HINH_ANH_QUAN_API}/${id}`, {
      method: "DELETE",
    });

    return xuLyPhanHoi(response);
  },
};

export default HinhAnhQuanService; 