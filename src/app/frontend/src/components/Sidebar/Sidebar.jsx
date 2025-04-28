import React from "react";
import s from "./style.module.css";
import SidebarItem from "../SideBarItem/SideBarItem";

export default function Sidebar() {
  return (
    <div className={s.sidebar}>
      <SidebarItem icon="🏠" text="Trang chủ" />
      <SidebarItem icon="📅" text="Lập lịch thi đấu" />
      <SidebarItem icon="📝" text="Ghi nhận kết quả" />
      <SidebarItem icon="⚙️" text="Thay đổi quy định" />
      <SidebarItem icon="📁" text="Tiếp nhận hồ sơ" isActive={true} />
    </div>
  );
}
