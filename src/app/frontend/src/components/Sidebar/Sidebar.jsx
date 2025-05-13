import React from "react";
import { useNavigate } from "react-router-dom";
import s from "./style.module.css";
import SidebarItem from "../SidebarItem/SidebarItem";

export default function Sidebar({ navList, currentPath }) {
  const navigate = useNavigate();

  const handleClick = (route) => {
    navigate(route);
  };

  return (
    <div className={s.sidebar}>
      {navList.map((item, index) => {
        const isActive = item.subItems
          ? currentPath.startsWith(item.route)
          : currentPath === item.route;
        return (
          <SidebarItem
            key={index}
            info={item}
            onClick={() => handleClick(item.route)}
            isActive={isActive}
          />
        );
      })}
    </div>
  );
}