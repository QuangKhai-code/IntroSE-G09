import React from "react";
import s from "./style.module.css";
import Banner from "../../components/Banner/Banner";
import Footer from "../../components/Footer/Footer";

export default function HomePage() {
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