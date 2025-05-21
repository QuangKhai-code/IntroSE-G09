import React from "react";
import { useNavigate } from "react-router-dom";
import s from "./style.module.css";
import SidebarItem from "../SidebarItem/SidebarItem";

export default function Sidebar({ navList, currentPath }) {
  const navigate = useNavigate();
  const handleClick = (route) => {
    // Check if there are unsaved changes in the team form
    const hasUnsavedChanges = window.hasUnsavedTeamChanges;
    
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời đi?');
      if (confirmed) {
        // Clear form data if user confirms
        window.dispatchEvent(new CustomEvent('clearTeamForm'));
        navigate(route);
      }
    } else {
      navigate(route);
    }
  };

  return (
    <div className={s.sidebar}>
      {navList.map((item, index) => {
        let isActive = false;
        if (item.subItems) {
          const route = item.route.split("/").slice(0, -1).join("/");
          isActive = currentPath.startsWith(route);
        }
        else{
          isActive = currentPath === item.route;
        }
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