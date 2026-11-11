import API from "../../../Api";

const DICH_VU_API = API.DICH_VU;

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
      "Không thể kết nối Backend. Hãy kiểm tra Spring Boot và địa chỉ API."
    );
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  let data;
  try {
    data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
  } catch {
    // Một số response lỗi không có body.
  }

  if (!response.ok) {
    const message = typeof data === "string"
      ? data
      : data?.message || data?.detail || data?.error;
    throw new Error(message || `Yêu cầu thất bại (${response.status}).`);
  }
  return data;
}

function taoQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  });
  return query.toString();
}

const dichVuService = {

  getAll(params = {}) {
    const query = taoQuery(params);
    return request(
      query ? `${DICH_VU_API}?${query}` : DICH_VU_API
    );
  },
  getById(id) {
    return request(
      `${DICH_VU_API}/${id}`
    );
  },
  getBySlug(slug) {
    return request(
      `${DICH_VU_API}/slug/${encodeURIComponent(slug)}`
    );
  },
  create(data) {
    return request(
      DICH_VU_API, {
      method: "POST",
      body: JSON.stringify(data)
    });
  },
  update(id, data) {
    return request(`${DICH_VU_API}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },
  capNhatTrangThai(id, giaTri) {
    return request(`${DICH_VU_API}/${id}/trang-thai`, {
      method: "PATCH",
      body: JSON.stringify({ giaTri }),
    });
  },
  capNhatNoiBat(id, giaTri) {
    return request(`${DICH_VU_API}/${id}/noi-bat`, {
      method: "PATCH",
      body: JSON.stringify({ giaTri }),
    });
  },
  xoaMem(id) {
    return request(
      `${DICH_VU_API}/${id}`, {
      method: "DELETE"
    });
  },
  khoiPhuc(id) {
    return request(
      `${DICH_VU_API}/${id}/khoi-phuc`, {
      method: "POST"
    });
  },
};

export default dichVuService;
