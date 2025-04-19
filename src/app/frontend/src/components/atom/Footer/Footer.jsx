import React from "react";
import s from "./style.module.css";

export default function Footer() {
    return (
        <footer>
          <ul className={`nav justify-content-center border-bottom pb-3 mb-3 ${s.footer_list}`}>
            <li className="nav-item">
              <a href="#" className={`${s.font_cus}`}>
                Home
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className={`${s.font_cus}`}>
                FAQs
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className={`${s.font_cus}`}>
                About
              </a>
            </li>
          </ul>
          <p className={`text-center text-body-secondary ${s.green_theme}`}>© 2025 Company, Inc</p>
        </footer>
    );


}