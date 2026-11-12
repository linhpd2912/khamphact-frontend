import API from "../../../Api";

const DICH_VU_API = API.DICH_VU;

async function request(url) {
  let response;

  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      "Không thể kết nối backend. Hãy kiểm tra Spring Boot và địa chỉ API."
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

const dichVuService = {
  getById(id) {
    return request(`${DICH_VU_API}/${encodeURIComponent(id)}`);
  },

  getBySlug(slug) {
    return request(`${DICH_VU_API}/slug/${encodeURIComponent(slug)}`);
  },

  timKiem(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    });

    return request(
      query.toString()
        ? `${DICH_VU_API}?${query.toString()}`
        : DICH_VU_API
    );
  },
};

export default dichVuService;