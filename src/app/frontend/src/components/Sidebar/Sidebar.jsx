import React, { useState } from "react";
import s from "./style.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import SidebarItem from "../SidebarItem/SidebarItem";
import SubSidebar from "../SubSidebar/SubSidebar";
import homeIconSrc from "/assets/home.png";
import calendarIconSrc from "/assets/calendar.png";
import recordIconSrc from "/assets/record.png";
import ruleIconSrc from "/assets/rule.png";
import profileIconSrc from "/assets/profile.png";
import expandIconSrc from "/assets/arrows.png";


export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navList = [
    { iconSrc: homeIconSrc, text: "Trang chủ", route: "/" },
    {
      iconSrc: calendarIconSrc,
      text: "Quản lý lịch thi đấu",
      route: "/admin/matchsetup",
      subItems: [
        { text: "Lập lịch thủ công", route: "/admin/matchsetup/manual" },
        { text: "Lập lịch tự động", route: "/admin/matchsetup/auto" },
        { text: "Chỉnh sửa lịch thi đấu", route: "/admin/matchsetup/edit" },
      ],
    },
    {
      iconSrc: recordIconSrc,
      text: "Quản lý kết quả",
      route: "/admin/newrecord/add",
      subItems: [
        { text: "Ghi nhận kết quả", route: "/admin/newrecord/add" },
        { text: "Chỉnh sửa kết quả", route: "/admin/newrecord/edit" },
      ],
    },
    {
      iconSrc: profileIconSrc,
      text: "Quản lý hồ sơ",
      route: "/admin/newteam/add",
      subItems: [
        { text: "Thêm hồ sơ", route: "/admin/newteam/add" },
        { text: "Cập nhật hồ sơ đội bóng", route: "/admin/newteam/update" },
      ],
    },
    { iconSrc: ruleIconSrc, 
      text: "Thay đổi quy định", 
      route: "/admin/rules" ,
      subItems: [
        // { text: "", route: "/admin/rules" },
      ]
    }
  ];

  const [isShrunken, setIsShrunken] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const isActiveItem = (item) => {
    if (!item.subItems) {
      return currentPath === item.route;
    } else {
      return currentPath.startsWith(item.route);
    }
  };

  const handleItemClick = (item) => {
    setActiveItem(item);
    
    if (item.subItems) {
      navigate(item.route);
      setIsShrunken(true);
    } 
    else { 
      setIsShrunken(false);
    }
  };
  
  return (
    <div className={` ${isShrunken ? s.shrunkenContainer : s.sidebarContainer}`}>

      <div className={`${s.sidebar}`}>
        {navList.map((item, index) => (
          <SidebarItem
            key={index}
            info={item}
            isShrunken={isShrunken}
            isActive={activeItem ? activeItem.text === item.text : null}
            onClick={() => handleItemClick(item)} 
          />
        ))}
      </div>

      {isShrunken && activeItem && activeItem.iconSrc !== ruleIconSrc && (
        <SubSidebar
          subItems={activeItem.subItems}
          onBack={() => setIsShrunken(false)}
          currentPath={currentPath}
        />
      )}




      { isShrunken && (
        <div className={`${s.back_btn}`} onClick={() => setIsShrunken(false)}>
          <img src={expandIconSrc} alt="icon" className={s.icon} />
        </div>
      )}

    </div>
  );
}