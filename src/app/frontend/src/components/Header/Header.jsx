import React from "react";
import s from "./style.module.css";
import Navbtn from "../Navbtn/Navbtn";
import { useNavigate } from "react-router-dom";

export default function Header() { 
  const navigate = useNavigate();
  return (
    <header>
      <div className={`d-flex ${s.logo}`}>
        <a href="/" className="">
          <img src="/assets/logo.svg" alt="Website Logo" width="200" />
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
            link="/"
            />
          <Navbtn
            name="Lịch sử đấu"
            link="/"
            />
        </ul>
      </div>
      <div className= {`${s.login_btn}`} onClick={() => navigate("/login")}>
        <button type="button" className={`${s.btn_active} ${s.logo_font}`}>Log in</button>
      </div>
    </header>
  )
}