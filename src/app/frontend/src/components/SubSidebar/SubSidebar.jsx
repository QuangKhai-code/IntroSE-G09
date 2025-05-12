import React from "react";
import s from "./style.module.css";
import { useNavigate } from "react-router-dom";
import backIconSrc from "/assets/arrow-left.png";

export default function SubSidebar({ subItems, onBack, currentPath }) {
  const navigate = useNavigate();

  return (
    <div className={s.subSidebar}>


      {subItems.map((subItem, index) => (
        <div
          key={index}
          className={`${s.subItem} ${s.navText} ${currentPath === subItem.route ? s.active : ''}`}
          onClick={() => navigate(subItem.route)}
        >
          {subItem.text}
        </div>
      ))}

    </div>
  );
}


