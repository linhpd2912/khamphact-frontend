import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Search,
  Plus,
  MapPin,
  Phone,
  Star,
  Pencil,
  Trash2,
  Eye,
  Clock,
  Images,
  Tags,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  RefreshCw,
  Globe,
  Mail,
} from "lucide-react";

import "./QuanLyDichVu.css";
import API from "../../../Api";

const FORM_MAC_DINH = {
  tenDichVu: "",
  duongDanSeo: "",
  diaChi: "",
  tinhThanhId: "",
  phuongXaId: "",
  soDienThoai: "",
  email: "",
  website: "",
  urlFacebook: "",
  urlTiktok: "",
  urlGoogleMap: "",
  viDo: "",
  kinhDo: "",
  moTaNgan: "",
  moTaChiTiet: "",
  giaTu: "",
  giaDen: "",
  diemDanhGiaGoogle: "",
  tongDanhGiaGoogle: "0",
  noiBat: false,
  hoatDong: true,
  tieuDeSeo: "",
  moTaSeo: "",
  tuKhoaSeo: "",
};

function layDanhSach(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  return [];
}

function dinhDangTien(value) {
  if (value === null || value === undefined || value === "") return "Chưa cập nhật";
  return `${new Intl.NumberFormat("vi-VN").format(Number(value))}đ`;
}

function taoQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  return query.toString();
}

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Không thể kết nối Backend. Hãy kiểm tra máy chủ Spring Boot.");
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof data === "string"
      ? data
      : data?.message || data?.detail || data?.error;
    throw new Error(message || `Yêu cầu thất bại (HTTP ${response.status}).`);
  }
  return data;
}

function dichVuApi(params = {}) {
  const query = taoQuery(params);
  return request(query ? `${API.DICH_VU}?${query}` : API.DICH_VU);
}

function QuanLyDichVu() {
  const [danhSachDichVu, setDanhSachDichVu] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");

  const [tuKhoa, setTuKhoa] = useState("");
  const [locHoatDong, setLocHoatDong] = useState("");
  const [locNoiBat, setLocNoiBat] = useState("");

  const [trang, setTrang] = useState(0);
  const kichThuocTrang = 9;
  const [tongSoTrang, setTongSoTrang] = useState(0);
  const [tongSoDichVu, setTongSoDichVu] = useState(0);

  const [modalForm, setModalForm] = useState(false);
  const [modalChiTiet, setModalChiTiet] = useState(false);
  const [dichVuDangChon, setDichVuDangChon] = useState(null);
  const [dichVuCanXoa, setDichVuCanXoa] = useState(null);
  const [cheDoForm, setCheDoForm] = useState("them");
  const [form, setForm] = useState({ ...FORM_MAC_DINH });

  const [danhSachTinh, setDanhSachTinh] = useState([]);
  const [danhSachPhuong, setDanhSachPhuong] = useState([]);
  const [dangTaiPhuong, setDangTaiPhuong] = useState(false);

  const [thongBao, setThongBao] = useState(null);

  const hienThongBao = (noiDung, loai = "success") => {
    setThongBao({ noiDung, loai });
    window.setTimeout(() => setThongBao(null), 3500);
  };

  const taiDanhSachDichVu = useCallback(async () => {
    setDangTai(true);
    setLoi("");
    try {
      const data = await dichVuApi({
        keyword: tuKhoa.trim() || undefined,
        hoatDong: locHoatDong === "" ? undefined : locHoatDong === "true",
        noiBat: locNoiBat === "" ? undefined : locNoiBat === "true",
        page: trang,
        size: kichThuocTrang,
      });
      const danhSach = layDanhSach(data);
      setDanhSachDichVu(danhSach);
      setTongSoDichVu(Number(data?.totalElements ?? data?.data?.totalElements ?? danhSach.length));
      setTongSoTrang(Number(data?.totalPages ?? data?.data?.totalPages ?? 1));
    } catch (error) {
      setLoi(error.message || "Không thể tải danh sách dịch vụ.");
      setDanhSachDichVu([]);
      setTongSoDichVu(0);
      setTongSoTrang(0);
    } finally {
      setDangTai(false);
    }
  }, [tuKhoa, locHoatDong, locNoiBat, trang]);

  useEffect(() => {
    const timer = window.setTimeout(taiDanhSachDichVu, 250);
    return () => window.clearTimeout(timer);
  }, [taiDanhSachDichVu]);

  useEffect(() => {
    async function taiTinhThanh() {
      try {
        const data = await request(API.TINH_THANH);
        setDanhSachTinh(layDanhSach(data));
      } catch (error) {
        console.error("Lỗi tải tỉnh/thành:", error);
      }
    }
    taiTinhThanh();
  }, []);

  useEffect(() => {
    if (!thongBao) return undefined;
    const timer = window.setTimeout(() => setThongBao(null), 3500);
    return () => window.clearTimeout(timer);
  }, [thongBao]);

  const taiPhuongXa = async (tinhThanhId) => {
    setDanhSachPhuong([]);
    if (!tinhThanhId) return;
    setDangTaiPhuong(true);
    try {
      const data = await request(`${API.PHUONG_XA}/tinh-thanh/${tinhThanhId}`);
      setDanhSachPhuong(layDanhSach(data));
    } catch (error) {
      hienThongBao(error.message || "Không tải được danh sách phường/xã.", "error");
    } finally {
      setDangTaiPhuong(false);
    }
  };

  const thongKe = useMemo(() => ({
    tong: tongSoDichVu,
    hoatDong: danhSachDichVu.filter((item) => item.hoatDong).length,
    noiBat: danhSachDichVu.filter((item) => item.noiBat).length,
  }), [danhSachDichVu, tongSoDichVu]);

  const moFormThem = () => {
    setCheDoForm("them");
    setDichVuDangChon(null);
    setForm({ ...FORM_MAC_DINH });
    setDanhSachPhuong([]);
    setModalForm(true);
  };

  const moFormSua = async (dichVu) => {
    setCheDoForm("sua");
    setDichVuDangChon(dichVu);
    setForm({
      ...FORM_MAC_DINH,
      ...dichVu,
      tinhThanhId: dichVu.tinhThanhId ?? "",
      phuongXaId: dichVu.phuongXaId ?? "",
      viDo: dichVu.viDo ?? "",
      kinhDo: dichVu.kinhDo ?? "",
      giaTu: dichVu.giaTu ?? "",
      giaDen: dichVu.giaDen ?? "",
      diemDanhGiaGoogle: dichVu.diemDanhGiaGoogle ?? "",
      tongDanhGiaGoogle: dichVu.tongDanhGiaGoogle ?? 0,
      noiBat: Boolean(dichVu.noiBat),
      hoatDong: Boolean(dichVu.hoatDong),
    });
    setModalForm(true);
    if (dichVu.tinhThanhId) await taiPhuongXa(dichVu.tinhThanhId);
  };

  const thayDoiForm = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const thayDoiTinh = async (event) => {
    const tinhThanhId = event.target.value;
    setForm((prev) => ({ ...prev, tinhThanhId, phuongXaId: "" }));
    await taiPhuongXa(tinhThanhId);
  };

  const luuDichVu = async (event) => {
    event.preventDefault();
    setDangLuu(true);
    try {
      if (!form.tenDichVu.trim()) throw new Error("Vui lòng nhập tên dịch vụ.");
      if (!form.tinhThanhId || !form.phuongXaId) {
        throw new Error("Vui lòng chọn tỉnh/thành và phường/xã.");
      }

      const giaTu = form.giaTu === "" ? null : Number(form.giaTu);
      const giaDen = form.giaDen === "" ? null : Number(form.giaDen);
      if (giaTu !== null && giaDen !== null && giaTu > giaDen) {
        throw new Error("Giá từ không được lớn hơn giá đến.");
      }

      const payload = {
        ...form,
        tenDichVu: form.tenDichVu.trim(),
        duongDanSeo: form.duongDanSeo.trim(),
        tinhThanhId: Number(form.tinhThanhId),
        phuongXaId: Number(form.phuongXaId),
        viDo: form.viDo === "" ? null : Number(form.viDo),
        kinhDo: form.kinhDo === "" ? null : Number(form.kinhDo),
        giaTu,
        giaDen,
        diemDanhGiaGoogle: form.diemDanhGiaGoogle === "" ? null : Number(form.diemDanhGiaGoogle),
        tongDanhGiaGoogle: Number(form.tongDanhGiaGoogle || 0),
        noiBat: Boolean(form.noiBat),
        hoatDong: Boolean(form.hoatDong),
      };

      if (cheDoForm === "them") {
        await request(API.DICH_VU, { method: "POST", body: JSON.stringify(payload) });
        hienThongBao("Thêm dịch vụ thành công.");
      } else {
        await request(`${API.DICH_VU}/${dichVuDangChon.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        hienThongBao("Cập nhật dịch vụ thành công.");
      }
      setModalForm(false);
      await taiDanhSachDichVu();
    } catch (error) {
      hienThongBao(error.message || "Không thể lưu dịch vụ.", "error");
    } finally {
      setDangLuu(false);
    }
  };

  const xemChiTiet = async (dichVu) => {
    try {
      const data = await request(`${API.DICH_VU}/${dichVu.id}`);
      setDichVuDangChon(data);
      setModalChiTiet(true);
    } catch (error) {
      hienThongBao(error.message || "Không thể tải chi tiết dịch vụ.", "error");
    }
  };

  const capNhatTrangThai = async (dichVu) => {
    try {
      await request(`${API.DICH_VU}/${dichVu.id}/trang-thai`, {
        method: "PATCH",
        body: JSON.stringify({ giaTri: !dichVu.hoatDong }),
      });
      hienThongBao(dichVu.hoatDong ? "Đã ngừng hoạt động dịch vụ." : "Đã kích hoạt dịch vụ.");
      await taiDanhSachDichVu();
    } catch (error) {
      hienThongBao(error.message || "Không thể cập nhật trạng thái.", "error");
    }
  };

  const capNhatNoiBat = async (dichVu) => {
    try {
      await request(`${API.DICH_VU}/${dichVu.id}/noi-bat`, {
        method: "PATCH",
        body: JSON.stringify({ giaTri: !dichVu.noiBat }),
      });
      hienThongBao(dichVu.noiBat ? "Đã bỏ đánh dấu nổi bật." : "Đã đánh dấu nổi bật.");
      await taiDanhSachDichVu();
    } catch (error) {
      hienThongBao(error.message || "Không thể cập nhật nổi bật.", "error");
    }
  };

  const xacNhanXoa = async () => {
    if (!dichVuCanXoa) return;
    try {
      await request(`${API.DICH_VU}/${dichVuCanXoa.id}`, { method: "DELETE" });
      hienThongBao("Đã chuyển dịch vụ sang trạng thái ngừng hoạt động.");
      setDichVuCanXoa(null);
      await taiDanhSachDichVu();
    } catch (error) {
      hienThongBao(error.message || "Không thể xóa dịch vụ.", "error");
    }
  };

  const khoiPhucDichVu = async (dichVu) => {
    try {
      await request(`${API.DICH_VU}/${dichVu.id}/khoi-phuc`, { method: "POST" });
      hienThongBao("Khôi phục dịch vụ thành công.");
      await taiDanhSachDichVu();
    } catch (error) {
      hienThongBao(error.message || "Không thể khôi phục dịch vụ.", "error");
    }
  };

  const hienThiKhoangGia = (item) => {
    if (item.giaTu == null && item.giaDen == null) return "Chưa cập nhật";
    if (item.giaTu != null && item.giaDen != null) {
      return `${dinhDangTien(item.giaTu)} – ${dinhDangTien(item.giaDen)}`;
    }
    return item.giaTu != null ? `Từ ${dinhDangTien(item.giaTu)}` : `Đến ${dinhDangTien(item.giaDen)}`;
  };

  return (
    <div className="qldv-page">
      <div className="qldv-header">
        <div className="qldv-title">
          <div className="qldv-title-icon"><BriefcaseBusiness size={25} /></div>
          <div>
            <h1>Quản lý dịch vụ</h1>
            <p>Quản lý thông tin các địa điểm và đơn vị cung cấp dịch vụ trên hệ thống.</p>
          </div>
        </div>
        <div className="qldv-header-actions">
          <button className="qldv-btn qldv-btn-secondary" onClick={taiDanhSachDichVu} disabled={dangTai}>
            <RefreshCw size={17} /> Làm mới
          </button>
          <button className="qldv-btn qldv-btn-primary" onClick={moFormThem}>
            <Plus size={18} /> Thêm dịch vụ
          </button>
        </div>
      </div>

      <div className="qldv-stats">
        <div className="qldv-stat">
          <span className="qldv-stat-icon qldv-purple"><BriefcaseBusiness size={21} /></span>
          <div><p>Tổng số dịch vụ</p><strong>{thongKe.tong}</strong></div>
        </div>
        <div className="qldv-stat">
          <span className="qldv-stat-icon qldv-green"><BriefcaseBusiness size={21} /></span>
          <div><p>Đang hoạt động</p><strong>{thongKe.hoatDong}</strong><small>Trong trang hiện tại</small></div>
        </div>
        <div className="qldv-stat">
          <span className="qldv-stat-icon qldv-orange"><Star size={21} /></span>
          <div><p>Dịch vụ nổi bật</p><strong>{thongKe.noiBat}</strong><small>Trong trang hiện tại</small></div>
        </div>
      </div>

      <div className="qldv-filters">
        <div className="qldv-search">
          <Search size={19} />
          <input
            value={tuKhoa}
            onChange={(event) => { setTuKhoa(event.target.value); setTrang(0); }}
            placeholder="Tìm tên dịch vụ, địa chỉ..."
          />
          {tuKhoa && <button onClick={() => setTuKhoa("")} title="Xóa tìm kiếm"><X size={16} /></button>}
        </div>
        <select value={locHoatDong} onChange={(event) => { setLocHoatDong(event.target.value); setTrang(0); }}>
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Ngừng hoạt động</option>
        </select>
        <select value={locNoiBat} onChange={(event) => { setLocNoiBat(event.target.value); setTrang(0); }}>
          <option value="">Tất cả dịch vụ</option>
          <option value="true">Dịch vụ nổi bật</option>
          <option value="false">Không nổi bật</option>
        </select>
      </div>

      <div className="qldv-list-heading">
        <div><h2>Danh sách dịch vụ</h2><p>{tongSoDichVu} dịch vụ trong hệ thống</p></div>
        <span className="qldv-view-label">Hiển thị dạng thẻ</span>
      </div>

      {loi && (
        <div className="qldv-error">
          <strong>Không thể tải danh sách.</strong><p>{loi}</p>
          <button className="qldv-btn qldv-btn-secondary" onClick={taiDanhSachDichVu}>Thử lại</button>
        </div>
      )}

      {dangTai ? (
        <div className="qldv-loading"><RefreshCw size={24} className="qldv-spin" /><p>Đang tải danh sách dịch vụ...</p></div>
      ) : !loi && danhSachDichVu.length === 0 ? (
        <div className="qldv-empty">
          <BriefcaseBusiness size={38} /><h3>Chưa tìm thấy dịch vụ</h3>
          <p>Hãy thử thay đổi điều kiện tìm kiếm hoặc thêm dịch vụ mới.</p>
          <button className="qldv-btn qldv-btn-primary" onClick={moFormThem}><Plus size={17} /> Thêm dịch vụ</button>
        </div>
      ) : (
        <div className="qldv-grid">
          {danhSachDichVu.map((item) => (
            <article className="qldv-card" key={item.id}>
              <div className="qldv-card-head">
                <div className="qldv-card-avatar"><BriefcaseBusiness size={25} /></div>
                <div className="qldv-card-badges">
                  {item.noiBat && <span className="qldv-badge qldv-badge-featured"><Star size={12} fill="currentColor" /> Nổi bật</span>}
                  <span className={`qldv-badge ${item.hoatDong ? "qldv-badge-active" : "qldv-badge-inactive"}`}>
                    {item.hoatDong ? "Đang hoạt động" : "Ngừng hoạt động"}
                  </span>
                </div>
              </div>
              <div className="qldv-card-body">
                <h3>{item.tenDichVu}</h3>
                <p className="qldv-info"><MapPin size={15} /><span>{item.diaChi || "Chưa cập nhật địa chỉ"}</span></p>
                <p className="qldv-location">{item.tenPhuongXa || "Chưa cập nhật phường/xã"}{item.tenTinhThanh ? `, ${item.tenTinhThanh}` : ""}</p>
                <p className="qldv-info"><Phone size={15} /><span>{item.soDienThoai || "Chưa cập nhật số điện thoại"}</span></p>
                <div className="qldv-card-meta">
                  <div><small>Khoảng giá</small><strong>{hienThiKhoangGia(item)}</strong></div>
                  <div className="qldv-rating"><small>Đánh giá Google</small><strong><Star size={14} fill="currentColor" /> {item.diemDanhGiaGoogle ?? "—"}</strong><small>{item.tongDanhGiaGoogle ?? 0} đánh giá</small></div>
                </div>
                <div className="qldv-counts">
                  <span><Clock size={14} /> {item.soGioMoCua ?? 0} giờ</span>
                  <span><Images size={14} /> {item.soHinhAnh ?? 0} ảnh</span>
                  <span><Tags size={14} /> {item.soDanhMuc ?? 0} danh mục</span>
                  <span><Sparkles size={14} /> {item.soTienIch ?? 0} tiện ích</span>
                </div>
              </div>
              <div className="qldv-related">
                <p>QUẢN LÝ THÔNG TIN LIÊN KẾT</p>
                <div className="qldv-related-grid">
                  <button type="button" onClick={() => hienThongBao("Phần giờ mở cửa dùng chung sẽ được kết nối ở bước tiếp theo.", "info")}><Clock size={15} /> Giờ mở cửa</button>
                  <button type="button" onClick={() => hienThongBao("Phần hình ảnh dùng chung sẽ được kết nối ở bước tiếp theo.", "info")}><Images size={15} /> Hình ảnh</button>
                  <button type="button" onClick={() => hienThongBao("Phần gán danh mục dịch vụ sẽ được triển khai ở bước tiếp theo.", "info")}><Tags size={15} /> Danh mục</button>
                  <button type="button" onClick={() => hienThongBao("Phần tiện ích dịch vụ sẽ được triển khai ở bước tiếp theo.", "info")}><Sparkles size={15} /> Tiện ích</button>
                </div>
              </div>
              <div className="qldv-card-actions">
                <button className="qldv-action-view" onClick={() => xemChiTiet(item)} title="Xem chi tiết"><Eye size={16} /> Xem</button>
                <button className="qldv-action-edit" onClick={() => moFormSua(item)} title="Sửa dịch vụ"><Pencil size={16} /> Sửa</button>
                {item.hoatDong ? (
                  <button className="qldv-action-delete" onClick={() => setDichVuCanXoa(item)} title="Xóa dịch vụ"><Trash2 size={16} /> Xóa</button>
                ) : (
                  <button className="qldv-action-restore" onClick={() => khoiPhucDichVu(item)} title="Khôi phục dịch vụ"><RotateCcw size={16} /> Khôi phục</button>
                )}
              </div>
              <div className="qldv-card-footer">
                <button onClick={() => capNhatTrangThai(item)}>{item.hoatDong ? "Chuyển sang ngừng hoạt động" : "Kích hoạt dịch vụ"}</button>
                <button onClick={() => capNhatNoiBat(item)} disabled={!item.hoatDong}>{item.noiBat ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!dangTai && !loi && tongSoDichVu > 0 && (
        <div className="qldv-pagination">
          <span>Trang <strong>{trang + 1}</strong> / {Math.max(tongSoTrang, 1)}</span>
          <div>
            <button disabled={trang <= 0} onClick={() => setTrang((current) => Math.max(0, current - 1))} aria-label="Trang trước"><ChevronLeft size={18} /></button>
            <button disabled={trang + 1 >= tongSoTrang} onClick={() => setTrang((current) => Math.min(Math.max(tongSoTrang - 1, 0), current + 1))} aria-label="Trang tiếp"><ChevronRight size={18} /></button>
          </div>
        </div>
      )}

      {modalForm && (
        <div className="qldv-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !dangLuu) setModalForm(false); }}>
          <form className="qldv-modal qldv-form-modal" onSubmit={luuDichVu}>
            <div className="qldv-modal-head">
              <div><h2>{cheDoForm === "them" ? "Thêm dịch vụ" : "Cập nhật dịch vụ"}</h2><p>Nhập thông tin cơ bản của dịch vụ.</p></div>
              <button type="button" onClick={() => setModalForm(false)} disabled={dangLuu}><X size={20} /></button>
            </div>
            <div className="qldv-form-content">
              <section>
                <h3>Thông tin cơ bản</h3>
                <div className="qldv-form-grid">
                  <label className="qldv-field qldv-field-full">Tên dịch vụ *
                    <input name="tenDichVu" value={form.tenDichVu} onChange={thayDoiForm} maxLength={255} required placeholder="Nhập tên dịch vụ" />
                  </label>
                  <label className="qldv-field qldv-field-full">Đường dẫn SEO
                    <input name="duongDanSeo" value={form.duongDanSeo} onChange={thayDoiForm} maxLength={255} placeholder="duong-dan-dich-vu" />
                  </label>
                  <label className="qldv-field qldv-field-full">Địa chỉ
                    <input name="diaChi" value={form.diaChi} onChange={thayDoiForm} maxLength={500} placeholder="Nhập địa chỉ" />
                  </label>
                  <label className="qldv-field">Tỉnh/thành *
                    <select name="tinhThanhId" value={form.tinhThanhId} onChange={thayDoiTinh} required>
                      <option value="">Chọn tỉnh/thành</option>
                      {danhSachTinh.map((tinh) => <option key={tinh.id} value={tinh.id}>{tinh.tenTinhThanh || tinh.tenTinh || tinh.ten}</option>)}
                    </select>
                  </label>
                  <label className="qldv-field">Phường/xã *
                    <select name="phuongXaId" value={form.phuongXaId} onChange={thayDoiForm} required disabled={!form.tinhThanhId || dangTaiPhuong}>
                      <option value="">{dangTaiPhuong ? "Đang tải..." : "Chọn phường/xã"}</option>
                      {danhSachPhuong.map((phuong) => <option key={phuong.id} value={phuong.id}>{phuong.tenPhuongXa || phuong.tenPhuong || phuong.ten}</option>)}
                    </select>
                  </label>
                  <label className="qldv-field">Số điện thoại
                    <input name="soDienThoai" value={form.soDienThoai} onChange={thayDoiForm} maxLength={20} placeholder="Số điện thoại liên hệ" />
                  </label>
                  <label className="qldv-field">Email
                    <input type="email" name="email" value={form.email} onChange={thayDoiForm} maxLength={254} placeholder="email@example.com" />
                  </label>
                </div>
              </section>
              <section>
                <h3>Liên kết và vị trí</h3>
                <div className="qldv-form-grid">
                  <label className="qldv-field qldv-field-full">Website
                    <input type="url" name="website" value={form.website} onChange={thayDoiForm} placeholder="https://" />
                  </label>
                  <label className="qldv-field">Facebook
                    <input type="url" name="urlFacebook" value={form.urlFacebook} onChange={thayDoiForm} placeholder="https://facebook.com/..." />
                  </label>
                  <label className="qldv-field">TikTok
                    <input type="url" name="urlTiktok" value={form.urlTiktok} onChange={thayDoiForm} placeholder="https://tiktok.com/..." />
                  </label>
                  <label className="qldv-field qldv-field-full">Google Maps
                    <input type="url" name="urlGoogleMap" value={form.urlGoogleMap} onChange={thayDoiForm} placeholder="Liên kết Google Maps" />
                  </label>
                  <label className="qldv-field">Vĩ độ
                    <input type="number" step="any" min="-90" max="90" name="viDo" value={form.viDo} onChange={thayDoiForm} placeholder="10.0452" />
                  </label>
                  <label className="qldv-field">Kinh độ
                    <input type="number" step="any" min="-180" max="180" name="kinhDo" value={form.kinhDo} onChange={thayDoiForm} placeholder="105.7469" />
                  </label>
                </div>
              </section>
              <section>
                <h3>Mô tả dịch vụ</h3>
                <div className="qldv-form-grid">
                  <label className="qldv-field qldv-field-full">Mô tả ngắn
                    <textarea name="moTaNgan" value={form.moTaNgan} onChange={thayDoiForm} maxLength={500} rows={3} placeholder="Giới thiệu ngắn về dịch vụ..." />
                  </label>
                  <label className="qldv-field qldv-field-full">Mô tả chi tiết
                    <textarea name="moTaChiTiet" value={form.moTaChiTiet} onChange={thayDoiForm} rows={5} placeholder="Nội dung mô tả chi tiết..." />
                  </label>
                </div>
              </section>
              <section>
                <h3>Giá, đánh giá và SEO</h3>
                <div className="qldv-form-grid">
                  <label className="qldv-field">Giá từ (VNĐ)
                    <input type="number" min="0" step="1000" name="giaTu" value={form.giaTu} onChange={thayDoiForm} placeholder="0" />
                  </label>
                  <label className="qldv-field">Giá đến (VNĐ)
                    <input type="number" min="0" step="1000" name="giaDen" value={form.giaDen} onChange={thayDoiForm} placeholder="0" />
                  </label>
                  <label className="qldv-field">Điểm đánh giá Google
                    <input type="number" min="0" max="5" step="0.1" name="diemDanhGiaGoogle" value={form.diemDanhGiaGoogle} onChange={thayDoiForm} placeholder="0 - 5" />
                  </label>
                  <label className="qldv-field">Tổng lượt đánh giá Google
                    <input type="number" min="0" step="1" name="tongDanhGiaGoogle" value={form.tongDanhGiaGoogle} onChange={thayDoiForm} />
                  </label>
                  <label className="qldv-field qldv-field-full">Tiêu đề SEO
                    <input name="tieuDeSeo" value={form.tieuDeSeo} onChange={thayDoiForm} maxLength={255} />
                  </label>
                  <label className="qldv-field qldv-field-full">Mô tả SEO
                    <textarea name="moTaSeo" value={form.moTaSeo} onChange={thayDoiForm} maxLength={320} rows={3} />
                  </label>
                  <label className="qldv-field qldv-field-full">Từ khóa SEO
                    <input name="tuKhoaSeo" value={form.tuKhoaSeo} onChange={thayDoiForm} maxLength={1000} placeholder="Các từ khóa, cách nhau bởi dấu phẩy" />
                  </label>
                  <div className="qldv-toggle-row qldv-field-full">
                    <label><input type="checkbox" name="hoatDong" checked={Boolean(form.hoatDong)} onChange={thayDoiForm} /> Đang hoạt động</label>
                    <label><input type="checkbox" name="noiBat" checked={Boolean(form.noiBat)} onChange={thayDoiForm} /> Dịch vụ nổi bật</label>
                  </div>
                </div>
              </section>
            </div>
            <div className="qldv-modal-foot">
              <button type="button" className="qldv-btn qldv-btn-secondary" onClick={() => setModalForm(false)} disabled={dangLuu}>Hủy</button>
              <button type="submit" className="qldv-btn qldv-btn-primary" disabled={dangLuu}>
                {dangLuu ? <><RefreshCw size={16} className="qldv-spin" /> Đang lưu...</> : <><Plus size={17} /> {cheDoForm === "them" ? "Thêm dịch vụ" : "Lưu thay đổi"}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {modalChiTiet && dichVuDangChon && (
        <div className="qldv-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalChiTiet(false); }}>
          <div className="qldv-modal qldv-detail-modal">
            <div className="qldv-modal-head">
              <div><h2>Chi tiết dịch vụ</h2><p>Thông tin đầy đủ của địa điểm cung cấp dịch vụ.</p></div>
              <button onClick={() => setModalChiTiet(false)}><X size={20} /></button>
            </div>
            <div className="qldv-detail-content">
              <div className="qldv-detail-title"><span><BriefcaseBusiness size={24} /></span><div><h3>{dichVuDangChon.tenDichVu}</h3><p>{dichVuDangChon.duongDanSeo || "Chưa có đường dẫn SEO"}</p></div></div>
              <div className="qldv-detail-grid">
                <div><small>Địa chỉ</small><strong>{dichVuDangChon.diaChi || "Chưa cập nhật"}</strong></div>
                <div><small>Khu vực</small><strong>{[dichVuDangChon.tenPhuongXa, dichVuDangChon.tenTinhThanh].filter(Boolean).join(", ") || "Chưa cập nhật"}</strong></div>
                <div><small>Điện thoại</small><strong>{dichVuDangChon.soDienThoai || "Chưa cập nhật"}</strong></div>
                <div><small>Email</small><strong>{dichVuDangChon.email || "Chưa cập nhật"}</strong></div>
                <div><small>Website</small><strong>{dichVuDangChon.website || "Chưa cập nhật"}</strong></div>
                <div><small>Khoảng giá</small><strong>{hienThiKhoangGia(dichVuDangChon)}</strong></div>
                <div><small>Đánh giá Google</small><strong>{dichVuDangChon.diemDanhGiaGoogle ?? "—"} ({dichVuDangChon.tongDanhGiaGoogle ?? 0} lượt)</strong></div>
                <div><small>Lượt xem</small><strong>{dichVuDangChon.luotXem ?? 0}</strong></div>
                <div className="qldv-detail-full"><small>Mô tả ngắn</small><p>{dichVuDangChon.moTaNgan || "Chưa cập nhật"}</p></div>
                <div className="qldv-detail-full"><small>Mô tả chi tiết</small><p className="qldv-preserve">{dichVuDangChon.moTaChiTiet || "Chưa cập nhật"}</p></div>
                <div className="qldv-detail-full"><small>SEO</small><p>{dichVuDangChon.tieuDeSeo || "Chưa có tiêu đề SEO"} · {dichVuDangChon.moTaSeo || "Chưa có mô tả SEO"}</p></div>
              </div>
            </div>
            <div className="qldv-modal-foot"><button className="qldv-btn qldv-btn-secondary" onClick={() => setModalChiTiet(false)}>Đóng</button><button className="qldv-btn qldv-btn-primary" onClick={() => { setModalChiTiet(false); moFormSua(dichVuDangChon); }}><Pencil size={16} /> Chỉnh sửa</button></div>
          </div>
        </div>
      )}

      {dichVuCanXoa && (
        <div className="qldv-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setDichVuCanXoa(null); }}>
          <div className="qldv-confirm-modal">
            <span className="qldv-confirm-icon"><Trash2 size={25} /></span>
            <h2>Xác nhận xóa dịch vụ</h2>
            <p>Bạn có chắc muốn chuyển <strong>{dichVuCanXoa.tenDichVu}</strong> sang trạng thái ngừng hoạt động?</p>
            <div><button className="qldv-btn qldv-btn-secondary" onClick={() => setDichVuCanXoa(null)}>Hủy</button><button className="qldv-btn qldv-btn-danger" onClick={xacNhanXoa}><Trash2 size={16} /> Xác nhận xóa</button></div>
          </div>
        </div>
      )}

      {thongBao && (
        <div className={`qldv-toast qldv-toast-${thongBao.loai}`}>
          <span>{thongBao.noiDung}</span>
          <button onClick={() => setThongBao(null)} aria-label="Đóng thông báo"><X size={16} /></button>
        </div>
      )}
    </div>
  );
}

export default QuanLyDichVu;
