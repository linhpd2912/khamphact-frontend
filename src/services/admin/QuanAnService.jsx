import API from "../../Api";

const QUAN_AN_API = API.QUAN_AN;

async function request(url, options = {}) {
  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Không thể kết nối backend. Hãy kiểm tra Spring Boot và địa chỉ API."
    );
  }

  if (!response.ok) {
    let message = `Yêu cầu thất bại (${response.status}).`;

    try {
      const data = await response.json();
      message =
        data.message ||
        data.detail ||
        data.error ||
        message;
    } catch {
      // Giữ thông báo mặc định nếu response không phải JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function taoQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

const quanAnService = {
  // Lấy danh sách, tìm kiếm, lọc và phân trang.
  getAll(params = {}) {
    const query = taoQuery(params);

    return request(
      query ? `${QUAN_AN_API}?${query}` : QUAN_AN_API
    );
  },

  // Lấy danh sách quán đang hoạt động.
  getHoatDong(params = {}) {
    const query = taoQuery(params);

    return request(
      query
        ? `${QUAN_AN_API}/hoat-dong?${query}`
        : `${QUAN_AN_API}/hoat-dong`
    );
  },

  // Xem chi tiết một quán.
  getById(id) {
    return request(`${QUAN_AN_API}/${id}`);
  },

  // Xem quán theo slug.
  getBySlug(slug) {
    return request(
      `${QUAN_AN_API}/slug/${encodeURIComponent(slug)}`
    );
  },

  // Thêm quán.
  create(data) {
    return request(QUAN_AN_API, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Cập nhật thông tin quán.
  update(id, data) {
    return request(`${QUAN_AN_API}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Cập nhật trạng thái hoạt động.
  capNhatTrangThai(id, giaTri) {
    return request(`${QUAN_AN_API}/${id}/trang-thai`, {
      method: "PATCH",
      body: JSON.stringify({ giaTri }),
    });
  },

  // Cập nhật trạng thái nổi bật.
  capNhatNoiBat(id, giaTri) {
    return request(`${QUAN_AN_API}/${id}/noi-bat`, {
      method: "PATCH",
      body: JSON.stringify({ giaTri }),
    });
  },

  // Xóa mềm quán.
  xoaMem(id) {
    return request(`${QUAN_AN_API}/${id}`, {
      method: "DELETE",
    });
  },

  // Khôi phục quán đã ngừng hoạt động.
  khoiPhuc(id) {
    return request(`${QUAN_AN_API}/${id}/khoi-phuc`, {
      method: "POST",
    });
  },
};

export default quanAnService;