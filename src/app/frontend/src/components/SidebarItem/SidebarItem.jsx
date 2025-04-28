import React from "react";
import s from "./style.module.css";

export default function SidebarItem({ icon, text, isActive }) {
  return (
    <div className={`nav-item ${isActive ? "active" : ""}`}>
      <span className="icon">{icon}</span>
      <span className="text">{text}</span>
    </div>
  );
}
