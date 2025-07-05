import React from "react";
import { useState } from "react";
import s from "./style.module.css";
import { useNavigate } from "react-router-dom";

export default function Navbtn(props) {
    const [isHover, setIsHover] = useState(false);
    const navigate = useNavigate();

    function mouseOver() { 
        setIsHover(true);
    }
    
    function mouseOut() { 
        setIsHover(false);
    }

    const handleClick = (e) => {
        if (props.name === "Bảng xếp hạng") {
            e.preventDefault();
            navigate('/', { replace: false });
            setTimeout(() => {
                const el = document.getElementById('ranking');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } else if (props.route) {
            e.preventDefault();
            navigate(props.route);
        }
    };

    return (
        <li onMouseOver={mouseOver} onMouseOut={mouseOut}>
            <a 
                href={props.link || props.route} 
                className={`${s.font_cus} ${isHover ? s.nav_active : s.nav}`}
                onClick={handleClick}
            >
                {props.name}
            </a>
        </li>
    )
}