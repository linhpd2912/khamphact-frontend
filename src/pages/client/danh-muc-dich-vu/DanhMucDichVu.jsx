import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Header from "../../../components/client/Header";
import Footer from "../../../components/client/Footer";



import danhMucDichVuService from "../../../services/client/DanhMucDichVuService";
import dichVuService from "../../../services/admin/dich-vu/DichVuService";
import dichVuDanhMucService from "../../../services/admin/dich-vu/DichVuDanhMucService";
import HinhAnhDichVuService from "../../../services/admin/dich-vu/HinhAnhDichVuService";

import "../danh-muc/DanhMuc.css";
import DanhMucDichVuHero from "../../../components/client/danh-muc-dich-vu/DanhMucDichVuHero";
import DanhMucDichVuList from "../../../components/client/danh-muc-dich-vu/DanhMucDichVuList";
import DichVuTheoDanhMuc from "../../../components/client/danh-muc-dich-vu/DichVuTheoDanhMuc";
import DanhMucDichVuBanner from "../../../components/client/danh-muc-dich-vu/DanhMucDichVuBanner";

const SO_DICH_VU_HIEN_THI = 12;

function layDanhSach(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  return [];
}

function chuanHoaDanhSachAnh(data) {
  return layDanhSach(data)
    .filter((anh) => anh && (anh.urlAnh || anh.duongDanAnh || anh.url))
    .sort((a, b) => (a.thuTu ?? 999) - (b.thuTu ?? 999));
}

function sapXepDanhMuc(danhMucs) {
  return [...danhMucs].sort((a, b) => {
    const noiBatA = Boolean(a.noiBat);
    const noiBatB = Boolean(b.noiBat);

    if (noiBatA !== noiBatB) return Number(noiBatB) - Number(noiBatA);

    return (a.thuTuHienThi ?? 999) - (b.thuTuHienThi ?? 999);
  });
}

function layIdDanhMucTuURL(danhSach) {
  const slug = new URLSearchParams(window.location.search).get("danhMuc");
  if (!slug) return null;

  const danhMuc = danhSach.find((item) => item.duongDanSeo === slug);
  return danhMuc?.id ?? null;
}

function DanhMucDichVu() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const slugTuURL = searchParams.get("danhMuc");

  const [danhMucs, setDanhMucs] = useState([]);
  const [danhMucDangChon, setDanhMucDangChon] = useState(null);
  const [keyword, setKeyword] = useState("");

  const [loadingDanhMuc, setLoadingDanhMuc] = useState(true);
  const [errorDanhMuc, setErrorDanhMuc] = useState("");

  const [dichVus, setDichVus] = useState([]);
  const [loadingDichVu, setLoadingDichVu] = useState(false);
  const [errorDichVu, setErrorDichVu] = useState("");

  // 1. Tải danh mục dịch vụ đang hoạt động
  const taiDanhMuc = useCallback(async () => {
    try {
      setLoadingDanhMuc(true);
      setErrorDanhMuc("");

      const response = await danhMucDichVuService.getHoatDong();
      const danhSach = sapXepDanhMuc(
        layDanhSach(response).filter((item) => item && item.hoatDong !== false)
      );

      setDanhMucs(danhSach);
      setDanhMucDangChon((current) => {
        const idTuURL = layIdDanhMucTuURL(danhSach);
        if (idTuURL !== null) return idTuURL;

        if (current && danhSach.some((item) => Number(item.id) === Number(current))) {
          return current;
        }

        return danhSach[0]?.id ?? null;
      });
    } catch (error) {
      console.error("Lỗi tải danh mục dịch vụ:", error);
      setErrorDanhMuc(error.message || "Không thể tải danh sách danh mục dịch vụ.");
    } finally {
      setLoadingDanhMuc(false);
    }
  }, []);

  useEffect(() => {
    taiDanhMuc();
  }, [taiDanhMuc]);

  // 2. Đồng bộ danh mục đang chọn khi URL thay đổi
  useEffect(() => {
    if (!danhMucs.length || !slugTuURL) return;

    const danhMuc = danhMucs.find((item) => item.duongDanSeo === slugTuURL);
    if (danhMuc && Number(danhMuc.id) !== Number(danhMucDangChon)) {
      setDanhMucDangChon(danhMuc.id);
      document.getElementById("danh-muc-dich-vu-list")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [slugTuURL, danhMucs, danhMucDangChon]);

  // 3. Tìm kiếm danh mục dịch vụ
  const xuLyTimKiem = async () => {
    const tuKhoa = keyword.trim();

    try {
      setLoadingDanhMuc(true);
      setErrorDanhMuc("");

      const response = tuKhoa
        ? await danhMucDichVuService.timKiem({
            keyword: tuKhoa,
            page: 0,
            size: 100,
          })
        : await danhMucDichVuService.getHoatDong();

      const danhSach = sapXepDanhMuc(
        layDanhSach(response).filter((item) => item && item.hoatDong !== false)
      );

      setDanhMucs(danhSach);
      setDanhMucDangChon((current) => {
        const idTuURL = layIdDanhMucTuURL(danhSach);
        if (idTuURL !== null) return idTuURL;

        if (current && danhSach.some((item) => Number(item.id) === Number(current))) {
          return current;
        }

        return danhSach[0]?.id ?? null;
      });
    } catch (error) {
      console.error("Lỗi tìm kiếm danh mục dịch vụ:", error);
      setErrorDanhMuc(error.message || "Không thể tìm kiếm danh mục dịch vụ.");
    } finally {
      setLoadingDanhMuc(false);
    }
  };

  // 4. Tải các dịch vụ được gán vào danh mục đang chọn
  useEffect(() => {
    let cancelled = false;

    const taiDichVuTheoDanhMuc = async () => {
      if (!danhMucDangChon) {
        setDichVus([]);
        setErrorDichVu("");
        setLoadingDichVu(false);
        return;
      }

      try {
        setLoadingDichVu(true);
        setErrorDichVu("");
        setDichVus([]);

        const responseLienKet =
          await dichVuDanhMucService.layTheoDanhMuc(danhMucDangChon);
        const danhSachLienKet = layDanhSach(responseLienKet);

        const danhSachDichVuId = [
          ...new Set(
            danhSachLienKet
              .map((item) => item.dichVuId ?? item.dichVu?.id)
              .filter((id) => id !== null && id !== undefined)
              .map(Number)
              .filter(Number.isFinite)
          ),
        ];

        if (cancelled) return;

        if (!danhSachDichVuId.length) {
          setDichVus([]);
          return;
        }

        const ketQuaDichVu = await Promise.all(
          danhSachDichVuId.slice(0, SO_DICH_VU_HIEN_THI).map(async (dichVuId) => {
            try {
              const dichVu = await dichVuService.getById(dichVuId);
              if (!dichVu || dichVu.hoatDong === false) return null;
              return dichVu;
            } catch (error) {
              console.error(`Lỗi lấy thông tin dịch vụ ${dichVuId}:`, error);
              return null;
            }
          })
        );

        if (cancelled) return;

        const danhSachDichVu = ketQuaDichVu.filter(Boolean);

        const danhSachDichVuCoAnh = await Promise.all(
          danhSachDichVu.map(async (dichVu) => {
            try {
              const responseAnh = await HinhAnhDichVuService.getByDichVu(dichVu.id);
              return {
                ...dichVu,
                danhSachAnh: chuanHoaDanhSachAnh(responseAnh),
              };
            } catch (error) {
              console.error(`Lỗi lấy hình ảnh dịch vụ ${dichVu.id}:`, error);
              return { ...dichVu, danhSachAnh: [] };
            }
          })
        );

        if (!cancelled) setDichVus(danhSachDichVuCoAnh);
      } catch (error) {
        console.error("Lỗi tải dịch vụ theo danh mục:", error);
        if (!cancelled) {
          setErrorDichVu(error.message || "Không thể tải danh sách dịch vụ.");
        }
      } finally {
        if (!cancelled) setLoadingDichVu(false);
      }
    };

    taiDichVuTheoDanhMuc();

    return () => {
      cancelled = true;
    };
  }, [danhMucDangChon]);

  const danhMucHienTai =
    danhMucs.find((item) => Number(item.id) === Number(danhMucDangChon)) || null;

  // 5. Chọn danh mục và cập nhật query string
  const chonDanhMuc = (danhMuc) => {
    setDanhMucDangChon(danhMuc.id);

    setSearchParams(
      (prev) => {
        if (danhMuc?.duongDanSeo) {
          prev.set("danhMuc", danhMuc.duongDanSeo);
        } else {
          prev.delete("danhMuc");
        }
        return prev;
      },
      { replace: false }
    );

    document.getElementById("danh-muc-dich-vu-list")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const xemChiTietDichVu = (dichVu) => {
    if (dichVu?.duongDanSeo) {
      navigate(`/dich-vu/${dichVu.duongDanSeo}`);
    }
  };

  const cuonDenDanhMuc = () => {
    document.getElementById("danh-muc-dich-vu-list")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="client-home danh-muc-page">
      <Header />

      <main>
        <DanhMucDichVuHero
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSearch={xuLyTimKiem}
        />

        <div id="danh-muc-dich-vu-list">
          {errorDanhMuc ? (
            <section className="danh-muc-container">
              <div className="danh-muc-error">{errorDanhMuc}</div>
            </section>
          ) : (
            <DanhMucDichVuList
              danhMucs={danhMucs}
              danhMucDangChon={danhMucDangChon}
              onSelect={chonDanhMuc}
              loading={loadingDanhMuc}
            />
          )}
        </div>

        <DichVuTheoDanhMuc
          danhMuc={danhMucHienTai}
          dichVus={dichVus}
          loading={loadingDichVu}
          error={errorDichVu}
          onViewDetail={xemChiTietDichVu}
        />

        <DanhMucDichVuBanner onExplore={cuonDenDanhMuc} />
      </main>

      <Footer />
    </div>
  );
}

export default DanhMucDichVu;