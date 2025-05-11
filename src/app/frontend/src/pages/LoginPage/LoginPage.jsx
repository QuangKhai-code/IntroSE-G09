import React from "react";
import s from "./style.module.css";
import LoginForm from "../../components/LoginForm/LoginForm";
import HomeButton from "../../components/HomeButton/HomeButton";

export default function LoginPage() {
  return (
    <div className={`${s.login_page}`}>
      <div className={`${s.container}`}>
        <div className={`${s.home_button}`}>
          <HomeButton />
        </div>
        <h1 className={`${s.text_font}`}>Đăng nhập</h1>
        <LoginForm />
      </div>
    </div>
  );
}
