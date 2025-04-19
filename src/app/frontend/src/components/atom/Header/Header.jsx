import React from "react";
import s from "./style.module.css";
import Navbtn from "../Navbtn/Navbtn";

export default function Header() { 
  return (
    <header>
      <div className={`d-flex ${s.logo}`}>
        <a href="/" className="">
          <img src="./src/assets/logo.svg" alt="Sportify Logo" width="200" />
        </a>
      </div>
      <div className={`${s.nav_bar}`}>
        <ul className={`${s.nav_list} `}>
          <Navbtn
            name="Bảng xếp hạng"
            link="#ranking"
            />
          <Navbtn
            name="Tra cứu"
            link="/contact"
            />
          <Navbtn
            name="Lịch sử đấu"
            link="/login"
            />
        </ul>
      </div>
      <div className= {`${s.login_btn} `}>
        <button type="button" className={`${s.btn_active} ${s.logo_font}`}>Log in</button>
      </div>
    </header>
  )
}