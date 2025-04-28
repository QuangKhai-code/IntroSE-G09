import React from "react";
import { useState } from "react";
import s from "./style.module.css";

export default function Navbtn(props) {
    const [isHover, setIsHover] = useState(false);

    function mouseOver() { 
        setIsHover(true);
    }
    
    function mouseOut() { 
        setIsHover(false);
    }

    return (
        <li onMouseOver={mouseOver} onMouseOut={mouseOut}>
            <a href={props.link} className={`${s.font_cus} ${isHover ? s.nav_active : s.nav}`}>
                {props.name}
            </a>
        </li>
    )
}