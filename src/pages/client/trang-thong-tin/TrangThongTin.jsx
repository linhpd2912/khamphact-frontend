import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import * as danhMucService from "../../../services/admin/bai-viet/DanhMucBaiVietService";
import * as baiVietService from "../../../services/admin/bai-viet/BaiVietService";
import Header from "../../../components/client/Header";
import Footer from "../../../components/client/Footer";
import "../tin-tuc/tin-tuc.css";
import ChiTietBaiViet from "../tin-tuc/ChiTietBaiViet";

const NOI_DUNG_TRANG = {
  "gioi-thieu": "Giới thiệu",
  "dieu-khoan-su-dung": "Điều khoản sử dụng",
  "chinh-sach-bao-mat": "Chính sách bảo mật",
  "huong-dan-su-dung": "Hướng dẫn sử dụng",
};

export default function TrangThongTin({ danhMucSlug }) {
  const navigate = useNavigate();
  const [baiVietSlug, setBaiVietSlug] = useState(null);
  const [tenTrang, setTenTrang] = useState(NOI_DUNG_TRANG[danhMucSlug] || "Thông tin");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let huy = false;
    setLoading(true);
    setError("");
    setBaiVietSlug(null);
    setTenTrang(NOI_DUNG_TRANG[danhMucSlug] || "Thông tin");

    async function taiDuLieu() {
      try {
        // Tìm danh mục bằng slug, không cần tạo bảng hoặc API mới.
        const danhMuc = await danhMucService.getBySlug(danhMucSlug);
        if (huy) return;
        if (!danhMuc || danhMuc.hoatDong === false) {
          setError("Trang này hiện chưa được kích hoạt. Vui lòng quay lại sau nhé!");
          return;
        }
        setTenTrang(danhMuc.tenDanhMuc || NOI_DUNG_TRANG[danhMucSlug] || "Thông tin");

        // API hiện tại chỉ trả về bài viết đang hoạt động.
        const ketQua = await baiVietService.getByCategory(danhMuc.id, {
          page: 0,
          size: 1,
        });
        if (huy) return;

        const baiViet = ketQua?.content?.[0];
        if (!baiViet?.duongDanSeo) {
          setError("Nội dung trang đang được cập nhật. Vui lòng quay lại sau nhé!");
          return;
        }
        setBaiVietSlug(baiViet.duongDanSeo);
      } catch (e) {
        if (!huy) {
          setError(
            e?.message || "Không thể tải nội dung trang. Vui lòng thử lại sau."
          );
        }
      } finally {
        if (!huy) setLoading(false);
      }
    }

    taiDuLieu();
    return () => { huy = true; };
  }, [danhMucSlug]);

  if (baiVietSlug) {
    return (
      <ChiTietBaiViet
        slug={baiVietSlug}
        onBack={() => navigate("/")}
        isInfoPage={true}
        tenTrang={tenTrang}
      />
    );
  }

  return (
    <div>
      <Header />
      <main className="tin-tuc-page tt-chitiet">
        <div className="tt-container tt-chitiet-inner">
          <div className="tt-empty" role="status" aria-live="polite">
            {loading ? (
              <>
                <FileText size={42} />
                <p>Đang tải {tenTrang.toLowerCase()}...</p>
              </>
            ) : (
              <>
                <FileText size={42} />
                <h2>{tenTrang}</h2>
                <p>{error || "Chưa có nội dung cho trang này."}</p>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}