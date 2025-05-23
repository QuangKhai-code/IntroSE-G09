import React from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import s from "./style.module.css";
import Sidebar from "../../components/Sidebar/Sidebar";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import homeIconSrc from "/assets/home.png";
import calendarIconSrc from "/assets/calendar.png";
import recordIconSrc from "/assets/record.png";
import ruleIconSrc from "/assets/rule.png";
import profileIconSrc from "/assets/profile.png";
import { withAuthRequired } from "../../hoc/withAuthRequired";

export function Admin() {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  
  const navList = [
    { iconSrc: homeIconSrc, text: "Trang chủ", route: "/" },
    { iconSrc: ruleIconSrc, text: "Thay đổi quy định", route: "/admin/rules" },
    {
      iconSrc: calendarIconSrc,
      text: "Quản lý lịch đấu",
      route: "/admin/schedule/manual",
      subItems: [
        { text: "Lập lịch thủ công", route: "/admin/schedule/manual" },
        { text: "Lập lịch tự động", route: "/admin/schedule/auto" },
        { text: "Chỉnh sửa lịch", route: "/admin/schedule/edit" },
      ],
    },
    {
      iconSrc: recordIconSrc,
      text: "Quản lý kết quả",
      route: "/admin/match-results/add",
      subItems: [
        { text: "Thêm kết quả", route: "/admin/match-results/add" },
        { text: "Chỉnh sửa kết quả", route: "/admin/match-results/edit" },
      ],
    },
    {
        iconSrc: profileIconSrc,
        text: "Quản lý hồ sơ",
        route: "/admin/teams/add",
        subItems: [
            { text: "Thêm mới hồ sơ", route: "/admin/teams/add" },
            { text: "Chỉnh sửa hồ sơ", route: "/admin/teams/edit" },
        ],
    },
  ];

  // Determine the active main item based on the current route
  const activeMainItem = navList.find((item) => {
    if (item.subItems) {
      const route = item.route.split("/").slice(0, -1).join("/");
      return currentPath.startsWith(route);
    } else {
      return currentPath === item.route;
    }
  });

  // Get sub-items of the active main item, if any
  const subItems = activeMainItem?.subItems || [];

  return (
    <div className={s.container}>
      <ToastContainer />
      <div className={s.sidebar}>
        <Sidebar navList={navList} currentPath={currentPath} />
      </div>

      <div className={s.content}>

        {subItems.length > 0 && (
          <div className={s.subItems}>
            {subItems.map((subItem, index) => (
              <div
                key={index}
                onClick={() => navigate(subItem.route)}
                className={currentPath === subItem.route ? s.subItem_active : s.subItem}
              >
                {subItem.text}
              </div>
            ))}
          </div>
        )}

        <Outlet />

      </div>
    </div>
  );
}

export const ProtectedAdmin = withAuthRequired(Admin);