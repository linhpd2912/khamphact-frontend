import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Calendar, Eye, ChevronRight, FileText,
  X, Clock, Tag, Share2,
} from "lucide-react";

// ===> SỬA ĐƯỜNG DẪN <===
import * as baiVietService from "../../../services/admin/BaiVietService";
import * as hinhAnhService from "../../../services/admin/HinhAnhBaiVietService";
import API from "../../../Api";
import Header from "../../../components/client/Header";
import Footer from "../../../components/client/Footer";

function dinhDangNgay(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const layUrlAnh = (url) => hinhAnhService.getImageUrl?.(url) || url || "";

function giaiMaVaChuanHoaHTML(html) {
  if (!html) return "";
  let ketQua = String(html);

  // 1. Giải mã HTML entity (&lt; → <, &amp; → &, &#x3C; → < ...)
  //    Lặp tối đa 3 lần để xử lý double-encode
  for (let i = 0; i < 3; i++) {
    if (!/&[a-z]+;|&#\d+;|&#x[0-9a-f]+;/i.test(ketQua)) break;
    const txt = document.createElement("textarea");
    txt.innerHTML = ketQua;
    ketQua = txt.value;
  }

  // 2. Nối đường dẫn ảnh/link tương đối với backend
  //    src="/uploads/abc.jpg"  →  src="http://backend/uploads/abc.jpg"
  const backend = API?.BACKEND || "";
  if (backend) {
    ketQua = ketQua.replace(
      /(<img[^>]*?\ssrc=["'])(\/[^"']*?)(["'])/gi,
      (_, pre, src, post) => `${pre}${backend}${src}${post}`
    );
    ketQua = ketQua.replace(
      /(<a[^>]*?\shref=["'])(\/[^"']*?)(["'])/gi,
      (_, pre, href, post) => `${pre}${backend}${href}${post}`
    );
  }

  // 3. Link ngoài mở tab mới + bảo mật
  ketQua = ketQua.replace(
    /<a\s(?![^>]*target=)/gi,
    '<a target="_blank" rel="noopener noreferrer" '
  );

  // 4. Lọc XSS (chỉ chạy khi đã cài DOMPurify)
  if (typeof DOMPurify !== "undefined") {
    ketQua = DOMPurify.sanitize(ketQua, {
      ADD_ATTR: ["target", "rel", "style", "class", "allowfullscreen"],
      ADD_TAGS: ["iframe", "video", "source", "figure", "figcaption"],
    });
  }

  return ketQua;
}

export default function ChiTietBaiViet({ slug, onBack, onSelectSlug }) {
  const [baiViet, setBaiViet] = useState(null);
  const [hinhAnhList, setHinhAnhList] = useState([]);
  const [lienQuan, setLienQuan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [progress, setProgress] = useState(0);
  const daTangView = useRef(false);

  // Load bài viết + ảnh + bài liên quan + tăng lượt xem
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    let huy = false;
    daTangView.current = false;
    setLoading(true);
    setError(null);
    setBaiViet(null);
    setHinhAnhList([]);
    setLienQuan([]);

    baiVietService
      .getBySlug(slug)
      .then((bv) => {
        if (huy || !bv) return;
        setBaiViet(bv);

        // Tăng lượt xem (chỉ 1 lần)
        if (!daTangView.current) {
          daTangView.current = true;
          baiVietService.increaseViews(bv.id).catch(() => { });
        }

        return Promise.all([
          baiVietService.getImages(bv.id).catch(() => []),
          baiVietService.getRelated(bv.id, 3).then((p) => p?.content || []).catch(() => []),
        ]).then(([imgs, rel]) => {
          if (!huy) {
            setHinhAnhList(Array.isArray(imgs) ? imgs : []);
            setLienQuan(Array.isArray(rel) ? rel : []);
          }
        });
      })
      .catch((e) => !huy && setError(e?.message || "Không tìm thấy bài viết"))
      .finally(() => !huy && setLoading(false));

    return () => { huy = true; };
  }, [slug]);

  // Cập nhật SEO: title + meta description
  useEffect(() => {
    if (!baiViet) return;
    const oldTitle = document.title;
    document.title = `${baiViet.tieuDeSeo || baiViet.tieuDe} | Ẩm thực Cần Thơ`;

    let meta = document.querySelector('meta[name="description"]');
    const oldDesc = meta?.content;
    const desc = baiViet.moTaSeo || baiViet.tomTat;
    if (desc) {
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = desc;
    }
    return () => {
      document.title = oldTitle;
      if (meta && oldDesc !== undefined) meta.content = oldDesc;
    };
  }, [baiViet]);

  // Thanh tiến trình đọc
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const chieuCao = h.scrollHeight - h.clientHeight;
      setProgress(chieuCao > 0 ? (h.scrollTop / chieuCao) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  const chiaChiaSe = () => {
    if (navigator.share) {
      navigator.share({ title: baiViet?.tieuDe, url: window.location.href }).catch(() => { });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert("Đã sao chép liên kết bài viết!");
    }
  };

  return (
    <div>
      <Header />

      <section className="tin-tuc-page tt-chitiet">
        {/* Thanh tiến trình đọc */}
        <div className="tt-progress"><div className="tt-progress-bar" style={{ width: `${progress}%` }} /></div>

        <div className="tt-container tt-chitiet-inner">
          <button className="tt-quay-lai" onClick={onBack}>
            <ArrowLeft size={16} /> Quay lại tin tức
          </button>

          {loading ? (
            <div className="tt-skeleton-detail">
              <div className="tt-skeleton-line w-30" />
              <div className="tt-skeleton-line w-90" style={{ height: 32 }} />
              <div className="tt-skeleton-line w-50" />
              <div className="tt-skeleton-img" style={{ height: 320, marginTop: 20 }} />
              <div className="tt-skeleton-line w-100" />
              <div className="tt-skeleton-line w-100" />
              <div className="tt-skeleton-line w-80" />
            </div>
          ) : error ? (
            <div className="tt-error">
              <p>{error}</p>
              <button onClick={onBack}>Quay lại danh sách</button>
            </div>
          ) : (
            baiViet && (
              <article className="tt-baiviet">
                {/* Breadcrumb */}
                <div className="tt-breadcrumb">
                  <span onClick={onBack}>Tin tức</span>
                  <ChevronRight size={13} />
                  <span>{baiViet.tenDanhMuc || "Chung"}</span>
                  <ChevronRight size={13} />
                  <span className="tt-breadcrumb-active">{baiViet.tieuDe}</span>
                </div>

                {/* Header bài viết */}
                <header className="tt-baiviet-header">
                  <span className="tt-danh-muc-badge tt-baiviet-danhmuc">
                    <Tag size={12} /> {baiViet.tenDanhMuc || "Tin tức"}
                  </span>
                  <h1>{baiViet.tieuDe}</h1>
                  <div className="tt-baiviet-meta">
                    <span><Calendar size={14} /> {dinhDangNgay(baiViet.ngayDang)}</span>
                    <span><Eye size={14} /> {(baiViet.luotXem || 0) + 1} lượt xem</span>
                    <button className="tt-chia-se" onClick={chiaChiaSe}>
                      <Share2 size={14} /> Chia sẻ
                    </button>
                  </div>
                </header>

                {/* Ảnh đại diện */}
                {baiViet.hinhDaiDien && (
                  <div className="tt-baiviet-anh">
                    <img src={layUrlAnh(baiViet.hinhDaiDien)} alt={baiViet.hinhDaiDienAlt || baiViet.tieuDe} />
                    {baiViet.hinhDaiDienAlt && <span className="tt-anh-caption">{baiViet.hinhDaiDienAlt}</span>}
                  </div>
                )}

                {/* Tóm tắt */}
                {baiViet.tomTat && <p className="tt-baiviet-tomtat">{baiViet.tomTat}</p>}

                {/* Nội dung chính */}
                {/* Nội dung chính — luôn render HTML đã chuẩn hóa */}
                <div
                  className="tt-noi-dung"
                  dangerouslySetInnerHTML={{ __html: giaiMaVaChuanHoaHTML(baiViet.noiDung) }}
                />


                {/* Thư viện ảnh */}
                {hinhAnhList.length > 0 && (
                  <section className="tt-thu-vien">
                    <h3><Clock size={16} /> Hình ảnh chi tiết</h3>
                    <div className="tt-thu-vien-grid">
                      {hinhAnhList.map((h) => (
                        <img
                          key={h.id}
                          src={layUrlAnh(h.urlAnh)}
                          alt={h.altText || h.chuThich || ""}
                          title={h.chuThich || ""}
                          loading="lazy"
                          onClick={() => setLightbox(layUrlAnh(h.urlAnh))}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Từ khóa */}
                {baiViet.tuKhoaChinh && (
                  <div className="tt-tu-khoa">
                    <strong>Từ khóa:</strong>
                    {baiViet.tuKhoaChinh.split(",").map((k, i) => (
                      <span key={i}>#{k.trim()}</span>
                    ))}
                  </div>
                )}

                {/* Bài viết liên quan */}
                {lienQuan.length > 0 && (
                  <section className="tt-lien-quan">
                    <div className="tt-lien-quan-title">
                      <h3>Bài viết liên quan</h3>
                      <span />
                    </div>
                    <div className="tt-grid">
                      {lienQuan.map((bv, idx) => (
                        <article
                          key={bv.id}
                          className="tt-card"
                          style={{ animationDelay: `${0.08 * idx}s` }}
                          onClick={() => onSelectSlug?.(bv.duongDanSeo)}
                        >
                          <div className="tt-card-anh">
                            {bv.hinhDaiDien ? (
                              <img src={layUrlAnh(bv.hinhDaiDien)} alt={bv.hinhDaiDienAlt || bv.tieuDe} loading="lazy" />
                            ) : (
                              <span className="tt-no-image"><FileText size={32} /></span>
                            )}
                          </div>
                          <div className="tt-card-body">
                            <div className="tt-card-top">
                              <span className="tt-danh-muc-badge">{bv.tenDanhMuc || "Tin tức"}</span>
                              <span className="tt-card-ngay"><Calendar size={12} /> {dinhDangNgay(bv.ngayDang)}</span>
                            </div>
                            <h3>{bv.tieuDe}</h3>
                            <p className="tt-card-tomtat">{bv.tomTat}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
              </article>
            )
          )}
        </div>

        {/* Lightbox xem ảnh to */}
        {lightbox && (
          <div className="tt-lightbox" onClick={() => setLightbox(null)}>
            <button className="tt-lightbox-close"><X size={22} /></button>
            <img src={lightbox} alt="Xem lớn" />
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
