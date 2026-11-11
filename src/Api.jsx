const BACKEND = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Nếu dùng Vite (React/Vue):
// const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
// Nếu dùng Create React App:
// const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";


const API = {
  BACKEND,

  TINH_THANH: `${BACKEND}/api/tinh-thanh`,

  PHUONG_XA: `${BACKEND}/api/phuong-xa`,

  DANH_MUC: `${BACKEND}/api/danh-muc`,

  QUAN_AN: `${BACKEND}/api/quan-an`,

  GIO_MO_CUA: `${BACKEND}/api/gio-mo-cua`,

  QUAN_AN_DANH_MUC: `${BACKEND}/api/quan-an-danh-muc`,

  HINH_ANH_QUAN_API: `${BACKEND}/api/hinh-anh-quan`,

  TIEN_ICH: `${BACKEND}/api/tien-ich`,

  QUAN_AN_TIEN_ICH: `${BACKEND}/api/quan-an-tien-ich`,

  DANH_MUC_BAI_VIET: `${BACKEND}/api/danh-muc-bai-viet`,

  BAI_VIET: `${BACKEND}/api/bai-viet`,

  HINH_ANH_BAI_VIET: `${BACKEND}/api/bai-viet`,

  SEO_BAI_VIET: `${BACKEND}/api/bai-viet/seo`,

  SCHEMA_BAI_VIET: `${BACKEND}/api/bai-viet/seo/schema`,

  CAU_HINH_WEBSITE: `${BACKEND}/api/cau-hinh-website`,

  DANH_MUC_DICH_VU: `${BACKEND}/api/danh-muc-dich-vu`,

  DICH_VU: `${BACKEND}/api/dich-vu`,
  
  DICH_VU_DANH_MUC: `${BACKEND}/api/dich-vu-danh-muc`,

  DICH_VU_TIEN_ICH: `${BACKEND}/api/dich-vu-tien-ich`,

}

export default API;