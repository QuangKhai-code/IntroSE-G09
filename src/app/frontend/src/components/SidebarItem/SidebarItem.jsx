import React from "react";
import s from "./style.module.css";

export default function SidebarItem({ info, isActive, onClick }) {
  return (
    <div className={`${isActive ? s.container_active : s.container}`} 
      onClick={onClick}
    >
      
      <div className={`${s.icon_container}`}>
        <img src={info.iconSrc} alt="icon" className={`${s.icon}`} />
      </div>

      <div className={`${s.navText}`}>
        {info.text}
      </div>
    
    </div>
  );
}