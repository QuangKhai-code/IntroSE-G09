import React from "react";
import s from "./style.module.css";

import SidebarItem from "../SideBarItem/SideBarItem";
import homeIconSrc from "/assets/home.png";
import calendarIconSrc from "/assets/calendar.png";
import recordIconSrc from "/assets/record.png";
import ruleIconSrc from "/assets/rule.png";
import profileIconSrc from "/assets/profile.png";

export default function Sidebar() {
  const navList = [
    { iconSrc: homeIconSrc, text: "Trang chủ" },
    { iconSrc: calendarIconSrc, text: "Lập lịch thi đấu" },
    { iconSrc: recordIconSrc, text: "Ghi nhận kết quả" },
    { iconSrc: ruleIconSrc, text: "Thay đổi quy định" },
    { iconSrc: profileIconSrc, text: "Tiếp nhận hồ sơ"},
  ];


  return (
    <div className={s.sidebar}>
      {navList.map((item, index) => (
        <SidebarItem
          key={index}
          iconSrc={item.iconSrc}
          text={item.text}
          className={s.sidebar_item}
        />
      ))}
    </div>
  );
}
 