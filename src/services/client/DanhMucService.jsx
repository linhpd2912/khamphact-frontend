import API from "../../Api";

const DANH_MUC_API = API.DANH_MUC;

// Hàm gọi API dùng chung
async function request(url, options = {}) {
  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Không thể kết nối backend. Hãy kiểm tra Spring Boot và địa chỉ API."
    );
  }

  // Không có nội dung trả về
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  // Đọc dữ liệu JSON
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : null;
  }

  // Xử lý lỗi API
  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.detail ||
      data?.error ||
      `Yêu cầu thất bại: HTTP ${response.status}`
    );
  }

  return data;
}

// Tạo query params
function taoQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

const danhMucService = {
  // Lấy tất cả danh mục
  getAll() {
    return request(`${DANH_MUC_API}/all`);
  },

  // Lấy danh mục đang hoạt động
  getHoatDong() {
    return request(`${DANH_MUC_API}/hoat-dong`);
  },

  // Lấy danh mục nổi bật
  getNoiBat() {
    return request(`${DANH_MUC_API}/noi-bat`);
  },

  // Tìm kiếm danh mục
  timKiem(params = {}) {
    const query = taoQuery(params);

    return request(
      query
        ? `${DANH_MUC_API}/tim-kiem?${query}`
        : `${DANH_MUC_API}/tim-kiem`
    );
  },

  // Lấy danh mục theo slug
  getBySlug(slug) {
    return request(
      `${DANH_MUC_API}/slug/${encodeURIComponent(slug)}`
    );
  },

  // Lấy chi tiết danh mục theo ID
  getById(id) {
    return request(`${DANH_MUC_API}/${id}`);
  },
};

export default danhMucService;