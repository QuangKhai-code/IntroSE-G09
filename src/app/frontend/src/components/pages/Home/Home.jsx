import React from "react";
import s from "./style.module.css";
import Banner from "../../molecule/Banner/Banner";
import Footer from "../../atom/Footer/Footer";

export default function Home() {
  return (
    <>
      <section id="home">
        <Banner />
      </section>

      <section id="ranking">
        <div className="ranking_container" style={{ height: "500px" }}>
          <h1 className={s.title}>BẢNG XẾP HẠNG</h1>
          <hr className={s.line} />
        </div>
      </section>

      <section>
        <Footer />
      </section>

    </>
  );
}