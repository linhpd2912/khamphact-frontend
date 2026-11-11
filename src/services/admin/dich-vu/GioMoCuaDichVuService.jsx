import API from "../../../Api";

const GIO_MO_CUA_API = API.GIO_MO_CUA;

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
      "Không thể kết nối đến máy chủ. Hãy kiểm tra Backend."
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
      data?.detail ||
        data?.message ||
        data?.title ||
        `Yêu cầu thất bại (HTTP ${response.status}).`
    );
  }

  return data;
}

const gioMoCuaDichVuService = {
  // Lấy giờ mở cửa theo dịch vụ
  layTheoDichVu(dichVuId) {
    return request(
      `${GIO_MO_CUA_API}/dich-vu/${dichVuId}`
    );
  },

  // Thêm giờ mở cửa dịch vụ
  them(payload) {
    return request(`${GIO_MO_CUA_API}/dich-vu`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Cập nhật giờ mở cửa dịch vụ
  capNhat(id, payload) {
    return request(`${GIO_MO_CUA_API}/dich-vu/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // Xóa giờ mở cửa dịch vụ
  xoa(id) {
    return request(`${GIO_MO_CUA_API}/dich-vu/${id}`, {
      method: "DELETE",
    });
  },
};

export default gioMoCuaDichVuService;