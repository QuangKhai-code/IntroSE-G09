import React from "react";
import s from "./style.module.css";

export default function SidebarItem({ iconSrc, text, isActive }) {
  return (
    <div className={`${s.container}`}>
      <div className={`${s.icon_container}`}>
        <img src={iconSrc} alt="icon" className={`${s.icon}`} />
      </div>
      <div className={`${s.navText}`}>
        {text}
      </div>
    </div>
  );
}
