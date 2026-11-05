import API from "../../Api";

// API hình ảnh bài viết
const API_URL = API.HINH_ANH_BAI_VIET;

// =====================================================
// XỬ LÝ RESPONSE
// =====================================================

async function xuLyResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      data?.error ||
      `Lỗi HTTP: ${response.status}`
    );
  }

  return data;
}

// =====================================================
// TẠO URL API THEO ID BÀI VIẾT
// =====================================================

function taoUrl(baiVietId) {
  return `${API_URL}/${baiVietId}/hinh-anh`;
}

// =====================================================
// CHUYỂN URL ẢNH THÀNH URL HIỂN THỊ ĐẦY ĐỦ
// =====================================================

export function getImageUrl(urlAnh) {
  if (!urlAnh) return "";

  // Nếu ảnh đã có URL đầy đủ thì giữ nguyên
  if (urlAnh.startsWith("http://") || urlAnh.startsWith("https://")) {
    return urlAnh;
  }

  return `${API.BACKEND}${urlAnh.startsWith("/") ? "" : "/"}${urlAnh}`;
}

// =====================================================
// LẤY DANH SÁCH ẢNH CỦA BÀI VIẾT
// GET /api/bai-viet/{baiVietId}/hinh-anh
// =====================================================

export async function getByBaiViet(baiVietId) {
  const response = await fetch(taoUrl(baiVietId));

  return xuLyResponse(response);
}

// =====================================================
// UPLOAD MỘT HOẶC NHIỀU ẢNH
// POST /api/bai-viet/{baiVietId}/hinh-anh/upload
// =====================================================

export async function upload(baiVietId, files) {
  const formData = new FormData();

  // Backend nhận List<MultipartFile> với tên trường là "files"
  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${taoUrl(baiVietId)}/upload`, {
    method: "POST",
    body: formData,
  });

  return xuLyResponse(response);
}

// =====================================================
// CẬP NHẬT ALT, CHÚ THÍCH, THỨ TỰ
// PUT /api/bai-viet/{baiVietId}/hinh-anh/{hinhAnhId}
// =====================================================

export async function update(baiVietId, hinhAnhId, data) {
  const response = await fetch(
    `${taoUrl(baiVietId)}/${hinhAnhId}`,
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

// =====================================================
// CẬP NHẬT THỨ TỰ NHIỀU ẢNH
// PUT /api/bai-viet/{baiVietId}/hinh-anh/thu-tu
// =====================================================

export async function updateOrder(baiVietId, danhSach) {
  const response = await fetch(`${taoUrl(baiVietId)}/thu-tu`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(danhSach),
  });

  return xuLyResponse(response);
}

// =====================================================
// XÓA ẢNH
// DELETE /api/bai-viet/{baiVietId}/hinh-anh/{hinhAnhId}
// =====================================================

export async function remove(baiVietId, hinhAnhId) {
  const response = await fetch(
    `${taoUrl(baiVietId)}/${hinhAnhId}`,
    {
      method: "DELETE",
    }
  );

  return xuLyResponse(response);
}

// =====================================================
// ĐẶT ẢNH LÀM ẢNH ĐẠI DIỆN
// PATCH /api/bai-viet/{baiVietId}/hinh-anh/{hinhAnhId}/anh-dai-dien
// =====================================================

export async function setFeatured(baiVietId, hinhAnhId) {
  const response = await fetch(
    `${taoUrl(baiVietId)}/${hinhAnhId}/anh-dai-dien`,
    {
      method: "PATCH",
    }
  );

  return xuLyResponse(response);
}