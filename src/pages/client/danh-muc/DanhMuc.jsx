import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // ===> THÊM useSearchParams

import Header from "../../../components/client/Header";
import Footer from "../../../components/client/Footer";

import DanhMucHero from "../../../components/client/danh-muc/DanhMucHero";
import DanhMucList from "../../../components/client/danh-muc/DanhMucList";
import QuanAnTheoDanhMuc from "../../../components/client/danh-muc/QuanAnTheoDanhMuc";
import DanhMucBanner from "../../../components/client/danh-muc/DanhMucBanner";

import danhMucService from "../../../services/client/DanhMucService";
import quanAnService from "../../../services/admin/QuanAnService";
import quanAnDanhMucService from "../../../services/admin/QuanAnDanhMucService";
import HinhAnhQuanService from "../../../services/admin/HinhAnhQuanService";

import "./DanhMuc.css";

const SO_QUAN_HIEN_THI = 12;

function layDanhSach(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  return [];
}

function chuanHoaDanhSachAnh(data) {
  const danhSachAnh = layDanhSach(data);
  return danhSachAnh
    .filter((anh) => anh && anh.urlAnh)
    .sort((a, b) => (a.thuTu ?? 999) - (b.thuTu ?? 999));
}

function sapXepDanhMuc(danhMucs) {
  return [...danhMucs].sort((a, b) => {
    const noiBatA = Boolean(a.noiBat);
    const noiBatB = Boolean(b.noiBat);
    if (noiBatA !== noiBatB) return noiBatB - noiBatA;
    return (a.thuTuHienThi ?? 999) - (b.thuTuHienThi ?? 999);
  });
}

// ==========================================
// ===> THÊM: lấy id danh mục từ query string ?danhMuc=slug
// ==========================================
function layIdDanhMucTuURL(danhSach) {
  try {
    const slug = new URLSearchParams(window.location.search).get("danhMuc");
    if (!slug) return null;
    const dm = danhSach.find((item) => item.duongDanSeo === slug);
    return dm ? dm.id : null;
  } catch {
    return null;
  }
}

function DanhMuc() {
  const navigate = useNavigate();

  // ===> THÊM: đồng bộ với query string
  const [searchParams, setSearchParams] = useSearchParams();
  const slugTuURL = searchParams.get("danhMuc");

  const [danhMucs, setDanhMucs] = useState([]);
  const [danhMucDangChon, setDanhMucDangChon] = useState(null);
  const [keyword, setKeyword] = useState("");

  const [loadingDanhMuc, setLoadingDanhMuc] = useState(true);
  const [errorDanhMuc, setErrorDanhMuc] = useState("");

  const [quanAns, setQuanAns] = useState([]);
  const [loadingQuanAn, setLoadingQuanAn] = useState(false);
  const [errorQuanAn, setErrorQuanAn] = useState("");

  // ==========================================
  // 1. LẤY DANH SÁCH DANH MỤC
  // ==========================================
  const taiDanhMuc = useCallback(async () => {
    try {
      setLoadingDanhMuc(true);
      setErrorDanhMuc("");

      const response = await danhMucService.getHoatDong();
      const danhSach = layDanhSach(response).filter((item) => item.hoatDong !== false);
      const danhSachDaSapXep = sapXepDanhMuc(danhSach);

      setDanhMucs(danhSachDaSapXep);

      // ===> SỬA: ưu tiên chọn danh mục theo URL trước, rồi mới đến mặc định
      setDanhMucDangChon((current) => {
        const idTuURL = layIdDanhMucTuURL(danhSachDaSapXep);
        if (idTuURL) return idTuURL;

        if (current && danhSachDaSapXep.some((item) => Number(item.id) === Number(current))) {
          return current;
        }
        return danhSachDaSapXep[0]?.id ?? null;
      });
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
      setErrorDanhMuc(error.message || "Không thể tải danh sách danh mục.");
    } finally {
      setLoadingDanhMuc(false);
    }
  }, []);

  useEffect(() => {
    taiDanhMuc();
  }, [taiDanhMuc]);

  // ==========================================
  // ===> THÊM: đồng bộ khi URL đổi (bấm back/forward hoặc vào từ link có ?danhMuc=)
  // ==========================================
  useEffect(() => {
    if (danhMucs.length === 0) return;

    if (!slugTuURL) return; // không có query → giữ nguyên danh mục đang chọn

    const dm = danhMucs.find((item) => item.duongDanSeo === slugTuURL);
    if (dm && Number(dm.id) !== Number(danhMucDangChon)) {
      setDanhMucDangChon(dm.id);
      // cuộn xuống danh sách quán khi đổi danh mục qua URL
      document.getElementById("danh-muc-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugTuURL, danhMucs]);

  // ==========================================
  // 2. TÌM KIẾM DANH MỤC
  // ==========================================
  const xuLyTimKiem = async () => {
    const tuKhoa = keyword.trim();

    try {
      setLoadingDanhMuc(true);
      setErrorDanhMuc("");

      let response;
      if (!tuKhoa) {
        response = await danhMucService.getHoatDong();
      } else {
        response = await danhMucService.timKiem({ keyword: tuKhoa, page: 0, size: 100 });
      }

      const danhSach = layDanhSach(response).filter((item) => item.hoatDong !== false);
      const danhSachDaSapXep = sapXepDanhMuc(danhSach);

      setDanhMucs(danhSachDaSapXep);

      // ===> SỬA: tương tự, ưu tiên URL
      setDanhMucDangChon((current) => {
        const idTuURL = layIdDanhMucTuURL(danhSachDaSapXep);
        if (idTuURL) return idTuURL;

        if (current && danhSachDaSapXep.some((item) => Number(item.id) === Number(current))) {
          return current;
        }
        return danhSachDaSapXep[0]?.id ?? null;
      });
    } catch (error) {
      console.error("Lỗi tìm kiếm danh mục:", error);
      setErrorDanhMuc(error.message || "Không thể tìm kiếm danh mục.");
    } finally {
      setLoadingDanhMuc(false);
    }
  };

  // ==========================================
  // 3. LẤY QUÁN ĂN THEO DANH MỤC (giữ nguyên)
  // ==========================================
  useEffect(() => {
    let cancelled = false;

    const taiQuanAnTheoDanhMuc = async () => {
      if (!danhMucDangChon) {
        setQuanAns([]);
        setErrorQuanAn("");
        setLoadingQuanAn(false);
        return;
      }

      try {
        setLoadingQuanAn(true);
        setErrorQuanAn("");
        setQuanAns([]);

        const responseLienKet = await quanAnDanhMucService.layTheoDanhMuc(danhMucDangChon);
        const danhSachLienKet = layDanhSach(responseLienKet);

        const danhSachQuanAnId = [
          ...new Set(
            danhSachLienKet
              .map((item) => item.quanAnId ?? item.quanAn?.id)
              .filter((id) => id !== null && id !== undefined)
              .map(Number)
              .filter(Number.isFinite)
          ),
        ];

        if (cancelled) return;

        if (danhSachQuanAnId.length === 0) {
          setQuanAns([]);
          return;
        }

        const danhSachGioiHan = danhSachQuanAnId.slice(0, SO_QUAN_HIEN_THI);

        const ketQuaQuanAn = await Promise.all(
          danhSachGioiHan.map(async (quanAnId) => {
            try {
              const quan = await quanAnService.getById(quanAnId);
              if (!quan || quan.hoatDong === false) return null;
              return quan;
            } catch (error) {
              console.error(`Lỗi lấy thông tin quán ${quanAnId}:`, error);
              return null;
            }
          })
        );

        if (cancelled) return;

        const danhSachQuanAn = ketQuaQuanAn.filter(Boolean);

        const danhSachQuanCoAnh = await Promise.all(
          danhSachQuanAn.map(async (quan) => {
            try {
              const responseAnh = await HinhAnhQuanService.getByQuanAn(quan.id);
              const danhSachAnh = chuanHoaDanhSachAnh(responseAnh);
              return { ...quan, danhSachAnh };
            } catch (error) {
              console.error(`Lỗi lấy hình ảnh quán ${quan.id}:`, error);
              return { ...quan, danhSachAnh: [] };
            }
          })
        );

        if (cancelled) return;

        setQuanAns(danhSachQuanCoAnh);
      } catch (error) {
        console.error("Lỗi tải quán theo danh mục:", error);
        if (!cancelled) {
          setErrorQuanAn(error.message || "Không thể tải danh sách quán ăn.");
        }
      } finally {
        if (!cancelled) setLoadingQuanAn(false);
      }
    };

    taiQuanAnTheoDanhMuc();

    return () => {
      cancelled = true;
    };
  }, [danhMucDangChon]);

  const danhMucHienTai =
    danhMucs.find((item) => Number(item.id) === Number(danhMucDangChon)) || null;

  // ==========================================
  // 5. CHỌN DANH MỤC  ===> SỬA: cập nhật cả URL
  // ==========================================
  const chonDanhMuc = (danhMuc) => {
    setDanhMucDangChon(danhMuc.id);

    // Cập nhật query string ?danhMuc=slug (giữ nguyên path /danh-muc)
    if (danhMuc?.duongDanSeo) {
      setSearchParams(
        (prev) => {
          prev.set("danhMuc", danhMuc.duongDanSeo);
          return prev;
        },
        { replace: false }
      );
    } else {
      setSearchParams((prev) => {
        prev.delete("danhMuc");
        return prev;
      });
    }
  };

  const xemChiTietQuan = (quan) => {
    if (quan.duongDanSeo) {
      navigate(`/quan-an/${quan.duongDanSeo}`);
    }
  };

  const cuonDenDanhMuc = () => {
    document.getElementById("danh-muc-list")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="client-home danh-muc-page">
      <Header />

      <main>
        <DanhMucHero keyword={keyword} onKeywordChange={setKeyword} onSearch={xuLyTimKiem} />

        <div id="danh-muc-list">
          {errorDanhMuc ? (
            <section className="danh-muc-container">
              <div className="danh-muc-error">{errorDanhMuc}</div>
            </section>
          ) : (
            <DanhMucList
              danhMucs={danhMucs}
              danhMucDangChon={danhMucDangChon}
              onSelect={chonDanhMuc}
              loading={loadingDanhMuc}
            />
          )}
        </div>

        <QuanAnTheoDanhMuc
          danhMuc={danhMucHienTai}
          quanAns={quanAns}
          loading={loadingQuanAn}
          error={errorQuanAn}
          onViewDetail={xemChiTietQuan}
        />

        <DanhMucBanner onExplore={cuonDenDanhMuc} />
      </main>

      <Footer />
    </div>
  );
}

export default DanhMuc;
