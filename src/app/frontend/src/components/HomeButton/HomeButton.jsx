import React from "react";
import s from "./style.module.css";
import { useNavigate } from "react-router-dom";

export default function HomeButton() {
    const navigate = useNavigate();
    return (
      <div className={`${s.container}`} onClick={() => navigate("/")}>
        <button type="button" className={`${s.home_btn} `}>
          <img src="./src/assets/home.png" alt="home button" width ="100%"/>
        </button>
      </div>
    );
}



