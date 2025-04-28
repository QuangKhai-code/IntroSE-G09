import React from "react";
import s from "./style.module.css";
import Header from "../Header/Header";

export default function Banner() {
  return (
    <div className={`${s.banner}`}>
      <Header />
      <div className={s.overlay}>
        <h1 className={s.title}>GIẢI VÔ ĐỊCH BÓNG ĐÁ QUỐC GIA</h1>
        <hr className={s.line} />
      </div>
    </div>
  );
}
