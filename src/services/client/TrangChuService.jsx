import API from "../../Api";

const API_BASE_URL = `${API.BACKEND}/api`;

const xuLyResponse = async (response) => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.detail ||
      "Không thể tải dữ liệu từ máy chủ."
    );
  }

  return data;
};

// ========================================
// LẤY CẤU HÌNH WEBSITE
// ========================================
export const layCauHinhWebsite = async () => {
  const response = await fetch(
    `${API_BASE_URL}/cau-hinh-website`
  );

  return xuLyResponse(response);
};

// ========================================
// LẤY DANH MỤC ĐANG HOẠT ĐỘNG
// ========================================
export const layDanhMucHoatDong = async () => {
  const response = await fetch(
    `${API_BASE_URL}/danh-muc/hoat-dong`
  );

  return xuLyResponse(response);
};

// ========================================
// LẤY QUÁN NỔI BẬT
// ========================================
export const layQuanNoiBat = async () => {
  const params = new URLSearchParams({
    noiBat: "true",
    hoatDong: "true",
    page: "0",
    size: "5",
  });

  const response = await fetch(
    `${API_BASE_URL}/quan-an?${params.toString()}`
  );

  return xuLyResponse(response);
};

// ========================================
// LẤY HÌNH ẢNH CỦA QUÁN
// ========================================
export const layHinhAnhQuan = async (quanAnId) => {
  const response = await fetch(
    `${API_BASE_URL}/hinh-anh-quan?quanAnId=${quanAnId}`
  );

  return xuLyResponse(response);
};

// ========================================
// LẤY DANH MỤC THUỘC QUÁN
// ========================================
export const layDanhMucCuaQuan = async (quanAnId) => {
  const response = await fetch(
    `${API_BASE_URL}/quan-an-danh-muc/quan-an/${quanAnId}`
  );

  return xuLyResponse(response);
};

// ========================================
// LẤY DANH SÁCH TIN TỨC MỚI NHẤT
// ========================================
export const layTinTucMoiNhat = async () => {
  const params = new URLSearchParams({
    page: "0",
    size: "4",
  });

  const response = await fetch(
    `${API_BASE_URL}/bai-viet/moi-nhat?${params.toString()}`
  );

  return xuLyResponse(response);
};