import { useEffect, useMemo, useState } from "react";
import {
  Search, ArrowRight, Sparkles, Newspaper, Calendar, Eye,
  ChevronLeft, ChevronRight, Tag, Clock, FileText,
} from "lucide-react";

// ===> SỬA ĐƯỜNG DẪN CHO ĐÚNG DỰ ÁN <===
import * as baiVietService from "../../../services/admin/BaiVietService";
import * as danhMucService from "../../../services/admin/DanhMucBaiVietService";
import * as hinhAnhService from "../../../services/admin/HinhAnhBaiVietService";

import ChiTietBaiViet from "./ChiTietBaiViet";
import "./tin-tuc.css";
import Footer from "../../../components/client/Footer";
import Header from "../../../components/client/Header";

function dinhDangNgay(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const layUrlAnh = (url) => hinhAnhService.getImageUrl?.(url) || url || "";

export default function TinTucPage({ onSelectSlug }) {
  const [danhMucList, setDanhMucList] = useState([]);
  const [danhMucActive, setDanhMucActive] = useState(null); // null = Tất cả
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const [page, setPage] = useState(0);
  const [size] = useState(9);
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0, number: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slugDangChon, setSlugDangChon] = useState(null);

  // Load danh mục bài viết (cho bộ lọc)
  useEffect(() => {
    danhMucService
      .getActive()
      .then((ds) => setDanhMucList(Array.isArray(ds) ? ds : []))
      .catch(() => setDanhMucList([]));
  }, []);

  // Load danh sách bài viết theo bộ lọc
  useEffect(() => {
    let huy = false;
    setLoading(true);
    setError(null);

    const params = { page, size, hoatDong: true };
    if (danhMucActive) params.danhMucId = danhMucActive;
    if (keyword) params.keyword = keyword;

    baiVietService
      .getAll(params)
      .then((res) => {
        if (!huy) setData(res || { content: [], totalPages: 0 });
      })
      .catch((e) => !huy && setError(e?.message || "Không thể tải bài viết"))
      .finally(() => !huy && setLoading(false));

    return () => { huy = true; };
  }, [danhMucActive, keyword, page, size]);

  // Bài viết nổi bật (chỉ hiển thị ở trang 1)
  const baiVietNoiBat = useMemo(() => {
    if (page !== 0 || !data.content?.length) return null;
    return data.content.find((b) => b.noiBat) || data.content[0];
  }, [data, page]);

  const dsHienThi = useMemo(() => {
    if (!baiVietNoiBat) return data.content || [];
    return data.content.filter((b) => b.id !== baiVietNoiBat.id);
  }, [data, baiVietNoiBat]);

  const chonBaiViet = (slug) => {
    if (!slug) return;
    if (onSelectSlug) {
      onSelectSlug(slug);   // điều hướng qua route
      return;
    }
    setSlugDangChon(slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(searchInput.trim());
    setPage(0);
  };

  const chonDanhMuc = (id) => {
    setDanhMucActive(id);
    setPage(0);
  };

  // ==== Xem chi tiết bài viết ====
  if (slugDangChon) {
    return (
      <ChiTietBaiViet
        slug={slugDangChon}
        onBack={() => setSlugDangChon(null)}
        onSelectSlug={(s) => chonBaiViet(s)}
      />
    );
  }

  return (
    <div>

      <Header />

      <section className="tin-tuc-page">
      {/* ============ HERO ============ */}
      <section className="tt-hero">
        <div className="tt-hero-container">
          <div className="tt-hero-content">
            <div className="tt-badge">
              <Newspaper size={15} />
              <span>TIN TỨC ẨM THỰC CẦN THƠ</span>
            </div>

            <h1>
              Cập nhật những <span>tin tức & mẹo</span> ăn ngon mỗi ngày
            </h1>

            <p className="tt-mo-ta">
              Khám phá các bài viết chia sẻ kinh nghiệm ăn uống, review quán ngon,
              mẹo nấu ăn và những câu chuyện ẩm thực miền Tây sông nước.
            </p>

            <form className="tt-search" onSubmit={handleSearch}>
              <Search size={20} className="tt-search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết, món ăn, quán ngon..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit">
                Tìm kiếm <ArrowRight size={16} />
              </button>
            </form>

            <div className="tt-hero-note">
              <Sparkles size={15} />
              <span>Hơn {data.totalElements || 0} bài viết về ẩm thực Cần Thơ</span>
            </div>
          </div>

          {/* Trang trí bên phải */}
          <div className="tt-hero-visual">
            <div className="tt-circle tt-circle-1" />
            <div className="tt-circle tt-circle-2" />
            <div className="tt-card-main">
              <FileText size={46} />
              <strong>Blog Ẩm Thực</strong>
              <span>Đọc mỗi ngày — ngon mỗi ngày</span>
            </div>
            <div className="tt-float tt-float-top">
              <Tag size={16} />
              <div>
                <strong>Review quán ngon</strong>
                <small>Đánh giá chân thực</small>
              </div>
            </div>
            <div className="tt-float tt-float-bottom">
              <Clock size={16} />
              <div>
                <strong>Cập nhật liên tục</strong>
                <small>Bài mới mỗi ngày</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BỘ LỌC THEO DANH MỤC ============ */}
      <section className="tt-loc">
        <div className="tt-container">
          <div className="tt-bo-loc">
            <button
              className={`tt-pill ${danhMucActive === null ? "active" : ""}`}
              onClick={() => chonDanhMuc(null)}
            >
              Tất cả
            </button>
            {danhMucList.map((dm) => (
              <button
                key={dm.id}
                className={`tt-pill ${danhMucActive === dm.id ? "active" : ""}`}
                onClick={() => chonDanhMuc(dm.id)}
              >
                {dm.tenDanhMuc}
              </button>
            ))}
          </div>

          {keyword && (
            <div className="tt-ket-qua">
              Kết quả tìm kiếm cho <strong>“{keyword}”</strong>
              <button onClick={() => { setKeyword(""); setSearchInput(""); setPage(0); }}>
                × Xóa
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============ DANH SÁCH BÀI VIẾT ============ */}
      <section className="tt-danh-sach">
        <div className="tt-container">
          {loading ? (
            <div className="tt-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="tt-card tt-skeleton">
                  <div className="tt-skeleton-img" />
                  <div className="tt-skeleton-line w-40" />
                  <div className="tt-skeleton-line w-90" />
                  <div className="tt-skeleton-line w-70" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="tt-error">
              <p>Đã có lỗi: {error}</p>
              <button onClick={() => setPage((p) => p)}>Thử lại</button>
            </div>
          ) : !data.content?.length ? (
            <div className="tt-empty">
              <FileText size={42} />
              <p>Chưa có bài viết nào phù hợp.</p>
            </div>
          ) : (
            <>
              {/* Bài nổi bật to */}
              {baiVietNoiBat && (
                <article className="tt-noi-bat" onClick={() => chonBaiViet(baiVietNoiBat.duongDanSeo)}>
                  <div className="tt-noi-bat-anh">
                    {baiVietNoiBat.hinhDaiDien ? (
                      <img src={layUrlAnh(baiVietNoiBat.hinhDaiDien)} alt={baiVietNoiBat.hinhDaiDienAlt || baiVietNoiBat.tieuDe} />
                    ) : (
                      <span className="tt-no-image"><FileText size={40} /></span>
                    )}
                    <span className="tt-noi-bat-label"><Sparkles size={13} /> Nổi bật</span>
                  </div>
                  <div className="tt-noi-bat-content">
                    <span className="tt-danh-muc-badge">{baiVietNoiBat.tenDanhMuc || "Tin tức"}</span>
                    <h2>{baiVietNoiBat.tieuDe}</h2>
                    <p>{baiVietNoiBat.tomTat}</p>
                    <div className="tt-card-meta">
                      <span><Calendar size={14} /> {dinhDangNgay(baiVietNoiBat.ngayDang)}</span>
                      <span><Eye size={14} /> {baiVietNoiBat.luotXem || 0} lượt xem</span>
                    </div>
                    <button className="tt-doc-tiep">
                      Đọc tiếp <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              )}

              {/* Grid bài viết */}
              <div className="tt-grid">
                {dsHienThi.map((bv, idx) => (
                  <article
                    key={bv.id}
                    className="tt-card"
                    style={{ animationDelay: `${0.05 * idx}s` }}
                    onClick={() => chonBaiViet(bv.duongDanSeo)}
                  >
                    <div className="tt-card-anh">
                      {bv.hinhDaiDien ? (
                        <img src={layUrlAnh(bv.hinhDaiDien)} alt={bv.hinhDaiDienAlt || bv.tieuDe} loading="lazy" />
                      ) : (
                        <span className="tt-no-image"><FileText size={32} /></span>
                      )}
                      {bv.noiBat && <span className="tt-card-hot"><Sparkles size={12} /> Hot</span>}
                    </div>

                    <div className="tt-card-body">
                      <div className="tt-card-top">
                        <span className="tt-danh-muc-badge">{bv.tenDanhMuc || "Tin tức"}</span>
                        <span className="tt-card-ngay"><Calendar size={12} /> {dinhDangNgay(bv.ngayDang)}</span>
                      </div>

                      <h3>{bv.tieuDe}</h3>
                      <p className="tt-card-tomtat">{bv.tomTat}</p>

                      <div className="tt-card-footer">
                        <span className="tt-card-views"><Eye size={13} /> {bv.luotXem || 0}</span>
                        <span className="tt-card-xem">Đọc tiếp <ArrowRight size={13} /></span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Phân trang */}
              {data.totalPages > 1 && (
                <div className="tt-phan-trang">
                  <button disabled={page === 0} onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 400, behavior: "smooth" }); }}>
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: data.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      className={i === page ? "active" : ""}
                      onClick={() => { setPage(i); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={page >= data.totalPages - 1}
                    onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </section>

    <Footer />
    </div>
  );
}
