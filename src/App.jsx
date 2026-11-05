import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import QuanLyTinh from "./pages/admin/tinh-thanh/QuanLyTinh";
import QuanLyPhuong from "./pages/admin/phuong-xa/QuanLyPhuong";
import QuanLyDanhMuc from "./pages/admin/danh-muc/QuanLyDanhMuc";
import QuanLyQuanAn from "./pages/admin/quan-an/QuanLyQuanAn";
import QuanLyTienIch from "./pages/admin/tien-ich/QuanLyTienIch";
import QuanLyDanhMucBaiViet from "./pages/admin/danh-muc-bai-viet/QuanLyDanhMucBaiViet";
import QuanLyBaiViet from "./pages/admin/bai-viet/QuanLyBaiViet";
import DangKyHopTac from "./pages/client/dang-ky-hop-tac/DangKyHopTac";
import QuanLyDangKyHopTac from "./pages/admin/dang-ky-hop-tac/QuanLyDangKyHopTac";
import CauHinhWebsite from "./pages/admin/CauHinhWebsite";
import TrangChu from "./layouts/TrangChu";
import DanhMuc from "./pages/client/danh-muc/DanhMuc";
import ChiTietBaiViet from "./pages/client/tin-tuc/ChiTietBaiViet";
import TinTucPage from "./pages/client/tin-tuc/TinTucPage";


// Component bao bọc: lấy slug từ URL + truyền callback điều hướng
function ChiTietBaiVietRoute() {
  const { slug } = useParams();
  const navigate = useNavigate();

  return (
    <ChiTietBaiViet
      slug={slug}
      onBack={() => navigate("/tin-tuc")}
      onSelectSlug={(s) => navigate(`/tin-tuc/${encodeURIComponent(s)}`)}
    />
  );
}

export default function App() {

  const navigate = useNavigate();
  return (
    <Routes>
      {/* Chuyển trang chủ sang khu vực quản trị */}
      {/* <Route
        path="/"
        element={<Navigate to="/admin" replace />}
      /> */}

      {/* Khung giao dien client */}
      <Route path="/" element={<TrangChu />} />
      <Route path="/lien-he" element={<DangKyHopTac />} />
      <Route path="/danh-muc" element={<DanhMuc />} />
      <Route
        path="/tin-tuc"
        element={
          <TinTucPage
            onSelectSlug={(s) => navigate(`/tin-tuc/${encodeURIComponent(s)}`)}
          />
        }
      />
      <Route path="/tin-tuc/:slug" element={<ChiTietBaiVietRoute />} />



      {/* Khung giao diện quản trị */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="tinh-thanh" element={<QuanLyTinh />} />
        <Route path="phuong-xa" element={<QuanLyPhuong />} />
        <Route path="danh-muc-quan" element={<QuanLyDanhMuc />} />
        <Route path="quan-an" element={<QuanLyQuanAn />} />
        <Route path="tien-ich" element={<QuanLyTienIch />} />
        <Route path="danh-muc-bai-viet" element={<QuanLyDanhMucBaiViet />} />
        <Route path="bai-viet" element={<QuanLyBaiViet />} />
        <Route path="hop-tac" element={<QuanLyDangKyHopTac />} />
        <Route path="cau-hinh" element={<CauHinhWebsite />} />

      </Route>
    </Routes>
  );
}