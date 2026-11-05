import API from "../../Api";

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
      "Không thể kết nối đến máy chủ. Hãy kiểm tra backend có đang chạy không."
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
        `Yêu cầu thất bại (HTTP ${response.status}).`
    );
  }

  return data;
}

const gioMoCuaService = {
  // Lấy giờ mở cửa của một quán.
  layTheoQuanAn(quanAnId) {
    return request(`${GIO_MO_CUA_API}/quan-an/${quanAnId}`);
  },

  // Thêm giờ mở cửa.
  them(payload) {
    return request(GIO_MO_CUA_API, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Cập nhật giờ mở cửa.
  capNhat(id, payload) {
    return request(`${GIO_MO_CUA_API}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // Xóa giờ mở cửa.
  xoa(id) {
    return request(`${GIO_MO_CUA_API}/${id}`, {
      method: "DELETE",
    });
  },
};

export default gioMoCuaService;