import { useState } from "react";
import { Outlet } from "react-router-dom";

import "./AdminLayout.css";
import Sidebar from "../components/admin/Siderbar";
import Header from "../components/admin/Header";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar
       open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Đóng menu" onClick={() => setSidebarOpen(false)} />}
      <div className="admin-main">
        <Header onMenuClick={() => setSidebarOpen((value) => !value)} />
        <main className="admin-content">
          <Outlet />
        </main>
        <footer className="admin-footer">
          <span>© {new Date().getFullYear()} Địa điểm ăn uống Cửu Long</span>
          <span>Trang quản trị nội bộ</span>
        </footer>
      </div>
    </div>
  );
}