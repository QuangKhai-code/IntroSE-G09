import React from "react";
import s from "./style.module.css";
import Sidebar from "../../components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

export default function Admin() {
    return (
        <div className={`${s.container}`}>
            <div className={s.sidebar}>
                <Sidebar />
            </div>
            <div className={s.content}>
                <Outlet />
            </div>
        </div>
    );

}