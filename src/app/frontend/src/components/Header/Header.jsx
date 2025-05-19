import React from "react";
import s from "./style.module.css";
import Navbtn from "../Navbtn/Navbtn";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/auth/auth-slice";
import { AuthAPI } from "../../api/auth";

export default function Header() { 
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.authSlice.auth);

  const handleLogout = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      await AuthAPI.logout();
      dispatch(logout());
      navigate("/");
    }
  };

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
            route="/"
            />
          <Navbtn
            name="Cầu thủ"
            route="/players"
            />
          <Navbtn
            name="Lịch thi đấu"
            route="/schedule"
            />
        </ul>
      </div>
      <div className={`${s.auth_buttons}`}>
        {user ? (
          <>
            <button 
              type="button" 
              className={`${s.btn_active} ${s.logo_font} ${s.admin_btn}`}
              onClick={() => navigate("/admin")}
            >
              Admin
            </button>
            <button 
              type="button" 
              className={`${s.btn_active} ${s.logo_font} ${s.logout_btn}`}
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <button 
            type="button" 
            className={`${s.btn_active} ${s.logo_font}`}
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </button>
        )}
      </div>
    </header>
  )
}