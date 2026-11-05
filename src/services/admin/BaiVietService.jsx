import API from "../../Api";

const API_URL = API.BAI_VIET;

// ==========================================
// XỬ LÝ RESPONSE TỪ BACKEND
// ==========================================

async function xuLyResponse(response) {
  // API DELETE hoặc PATCH có thể trả về 204 No Content
  if (response.status === 204) {
    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }

    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      data?.error ||
      data?.errors?.[0]?.defaultMessage ||
      `Lỗi HTTP: ${response.status}`
    );
  }

  return data;
}

// ==========================================
// TẠO QUERY PARAMS
// ==========================================

function taoQueryParams(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  return query.toString();
}

// ==========================================
// 1. LẤY DANH SÁCH BÀI VIẾT
// ==========================================

export async function getAll(params = {}) {
  const query = taoQueryParams(params);

  const response = await fetch(
    query ? `${API_URL}?${query}` : API_URL
  );

  return xuLyResponse(response);
}

// ==========================================
// 2. LẤY CHI TIẾT BÀI VIẾT
// ==========================================

export async function getById(id) {
  const response = await fetch(`${API_URL}/${id}`);

  return xuLyResponse(response);
}

// ==========================================
// 3. THÊM BÀI VIẾT
// ==========================================

export async function create(data) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return xuLyResponse(response);
}

// ==========================================
// 4. CẬP NHẬT BÀI VIẾT
// ==========================================

export async function update(id, data) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return xuLyResponse(response);
}

// ==========================================
// 5. CẬP NHẬT TRẠNG THÁI
// ==========================================

export async function updateStatus(id, hoatDong) {
  const response = await fetch(`${API_URL}/${id}/trang-thai`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ hoatDong }),
  });

  return xuLyResponse(response);
}

// ==========================================
// 6. XÓA MỀM BÀI VIẾT
// ==========================================

export async function remove(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  return xuLyResponse(response);
}

// ==========================================
// 7. KIỂM TRA SLUG
// ==========================================

export async function checkSlug(slug, id = null) {
  const params = new URLSearchParams({ slug });

  if (id !== null && id !== undefined) {
    params.append("id", id);
  }

  const response = await fetch(
    `${API_URL}/kiem-tra-slug?${params.toString()}`
  );

  return xuLyResponse(response);
}

// ==========================================
// 8. LẤY BÀI VIẾT THEO SLUG
// ==========================================

export async function getBySlug(slug) {
  const response = await fetch(
    `${API_URL}/slug/${encodeURIComponent(slug)}`
  );

  return xuLyResponse(response);
}

// ==========================================
// 9. LẤY BÀI VIẾT THEO DANH MỤC
// ==========================================

export async function getByCategory(danhMucId, params = {}) {
  const query = taoQueryParams(params);

  const url = `${API_URL}/danh-muc/${danhMucId}`;

  const response = await fetch(
    query ? `${url}?${query}` : url
  );

  return xuLyResponse(response);
}

// ==========================================
// 10. LẤY BÀI VIẾT NỔI BẬT
// ==========================================

export async function getFeatured(params = {}) {
  const query = taoQueryParams(params);

  const response = await fetch(
    query
      ? `${API_URL}/noi-bat?${query}`
      : `${API_URL}/noi-bat`
  );

  return xuLyResponse(response);
}

// ==========================================
// 11. LẤY BÀI VIẾT MỚI NHẤT
// ==========================================

export async function getLatest(params = {}) {
  const query = taoQueryParams(params);

  const response = await fetch(
    query
      ? `${API_URL}/moi-nhat?${query}`
      : `${API_URL}/moi-nhat`
  );

  return xuLyResponse(response);
}

// ==========================================
// 12. TÌM KIẾM THEO TIÊU ĐỀ
// ==========================================

export async function search(keyword, params = {}) {
  const query = taoQueryParams({
    ...params,
    keyword,
  });

  const response = await fetch(
    `${API_URL}/tim-kiem?${query}`
  );

  return xuLyResponse(response);
}

// ==========================================
// 13. LẤY BÀI VIẾT LIÊN QUAN
// ==========================================

export async function getRelated(id, size = 5) {
  const params = taoQueryParams({ size });

  const response = await fetch(
    `${API_URL}/${id}/lien-quan?${params}`
  );

  return xuLyResponse(response);
}

// ==========================================
// 14. TĂNG LƯỢT XEM
// ==========================================

export async function increaseViews(id) {
  const response = await fetch(
    `${API_URL}/${id}/tang-luot-xem`,
    {
      method: "POST",
    }
  );

  return xuLyResponse(response);
}

// ==========================================
// 15. LẤY BÀI VIẾT THEO TRẠNG THÁI
// ==========================================

export async function getByStatus(hoatDong, params = {}) {
  const query = taoQueryParams(params);

  const url = `${API_URL}/trang-thai/${hoatDong}`;

  const response = await fetch(
    query ? `${url}?${query}` : url
  );

  return xuLyResponse(response);
}

// ==========================================
// 16. UPLOAD MỘT HOẶC NHIỀU HÌNH ẢNH
// ==========================================

export async function uploadImages(baiVietId, files) {
  const formData = new FormData();

  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(
    `${API.HINH_ANH_BAI_VIET}/${baiVietId}/hinh-anh/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  return xuLyResponse(response);
}

// ==========================================
// 17. LẤY DANH SÁCH HÌNH ẢNH
// ==========================================

export async function getImages(baiVietId) {
  const response = await fetch(
    `${API.HINH_ANH_BAI_VIET}/${baiVietId}/hinh-anh`
  );

  return xuLyResponse(response);
}

// ==========================================
// 18. CẬP NHẬT THÔNG TIN HÌNH ẢNH
// ==========================================

export async function updateImage(
  baiVietId,
  hinhAnhId,
  data
) {
  const response = await fetch(
    `${API.HINH_ANH_BAI_VIET}/${baiVietId}/hinh-anh/${hinhAnhId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return xuLyResponse(response);
}

// ==========================================
// 19. CẬP NHẬT THỨ TỰ NHIỀU HÌNH ẢNH
// ==========================================

export async function updateImageOrder(baiVietId, danhSach) {
  const response = await fetch(
    `${API.HINH_ANH_BAI_VIET}/${baiVietId}/hinh-anh/thu-tu`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(danhSach),
    }
  );

  return xuLyResponse(response);
}

// ==========================================
// 20. XÓA HÌNH ẢNH
// ==========================================

export async function deleteImage(baiVietId, hinhAnhId) {
  const response = await fetch(
    `${API.HINH_ANH_BAI_VIET}/${baiVietId}/hinh-anh/${hinhAnhId}`,
    {
      method: "DELETE",
    }
  );

  return xuLyResponse(response);
}

// ==========================================
// 21. ĐẶT HÌNH ẢNH LÀM ẢNH ĐẠI DIỆN
// ==========================================

export async function setCoverImage(baiVietId, hinhAnhId) {
  const response = await fetch(
    `${API.HINH_ANH_BAI_VIET}/${baiVietId}/hinh-anh/${hinhAnhId}/anh-dai-dien`,
    {
      method: "PATCH",
    }
  );

  return xuLyResponse(response);
}

// ==========================================
// 22. PHÂN TÍCH SEO
// ==========================================

export async function analyzeSEO(data) {
  const response = await fetch(
    `${API.SEO_BAI_VIET}/phan-tich`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return xuLyResponse(response);
}

// ==========================================
// 23. LẤY SCHEMA BÀI VIẾT
// ==========================================

export async function getSchema(slug, loai = "ARTICLE") {
  const params = taoQueryParams({ loai });

  const response = await fetch(
    `${API.SCHEMA_BAI_VIET}/${encodeURIComponent(slug)}?${params}`
  );

  return xuLyResponse(response);
}

// ==========================================
// 24. LẤY SCHEMA BREADCRUMB
// ==========================================

export async function getBreadcrumb(slug) {
  const response = await fetch(
    `${API.SCHEMA_BAI_VIET}/${encodeURIComponent(slug)}/breadcrumb`
  );

  return xuLyResponse(response);
}

// ==========================================
// EXPORT DEFAULT
// ==========================================

const baiVietService = {
  getAll,
  getById,
  create,
  update,
  updateStatus,
  remove,
  checkSlug,
  getBySlug,
  getByCategory,
  getFeatured,
  getLatest,
  search,
  getRelated,
  increaseViews,
  getByStatus,
  uploadImages,
  getImages,
  updateImage,
  updateImageOrder,
  deleteImage,
  setCoverImage,
  analyzeSEO,
  getSchema,
  getBreadcrumb,
};

export default baiVietService;