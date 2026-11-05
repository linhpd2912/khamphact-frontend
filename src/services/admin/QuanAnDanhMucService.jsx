
import API from "../../Api";

const QUAN_AN_DANH_MUC_API = API.QUAN_AN_DANH_MUC;

// Hàm gọi API dùng chung
async function request(url, options = {}) {
  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Không thể kết nối backend. Hãy kiểm tra Spring Boot."
    );
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.detail ||
      `Yêu cầu thất bại: HTTP ${response.status}`
    );
  }

  return data;
}

const quanAnDanhMucService = {
  // Lấy danh sách liên kết của một quán
  layTheoQuanAn(quanAnId) {
    return request(`${QUAN_AN_DANH_MUC_API}/quan-an/${quanAnId}`);
  },

  // Lấy danh sách liên kết của một danh mục
  layTheoDanhMuc(danhMucId) {
    return request(
      `${QUAN_AN_DANH_MUC_API}/danh-muc/${danhMucId}`
    );
  },

  // Thêm danh mục cho quán
  them(payload) {
    return request(QUAN_AN_DANH_MUC_API, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Cập nhật liên kết
  capNhat(id, payload) {
    return request(`${QUAN_AN_DANH_MUC_API}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // Xóa liên kết quán - danh mục
  xoa(id) {
    return request(`${QUAN_AN_DANH_MUC_API}/${id}`, {
      method: "DELETE",
    });
  },
};

export default quanAnDanhMucService;