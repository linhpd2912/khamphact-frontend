import API from "../../../Api";

const DICH_VU_DANH_MUC_API = API.DICH_VU_DANH_MUC;

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
      "Không thể kết nối Backend. Hãy kiểm tra máy chủ Spring Boot."
    );
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || data?.detail || data?.error;

    throw new Error(message || `Yêu cầu thất bại: HTTP ${response.status}`);
  }

  return data;
}

const DichVuDanhMucService = {
  // Lấy tất cả liên kết dịch vụ - danh mục
  layTatCa() {
    return request(DICH_VU_DANH_MUC_API);
  },

  // Lấy danh mục đã gán cho một dịch vụ
  layTheoDichVu(dichVuId) {
    return request(`${DICH_VU_DANH_MUC_API}/dich-vu/${dichVuId}`);
  },

  // Lấy các dịch vụ thuộc một danh mục
  layTheoDanhMuc(danhMucDichVuId) {
    return request(`${DICH_VU_DANH_MUC_API}/danh-muc/${danhMucDichVuId}`);
  },

  // Gán danh mục vào dịch vụ
  them(payload) {
    return request(DICH_VU_DANH_MUC_API, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Cập nhật liên kết
  capNhat(id, payload) {
    return request(`${DICH_VU_DANH_MUC_API}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // Bỏ danh mục khỏi dịch vụ
  xoa(id) {
    return request(`${DICH_VU_DANH_MUC_API}/${id}`, {
      method: "DELETE",
    });
  },
};

export default DichVuDanhMucService;