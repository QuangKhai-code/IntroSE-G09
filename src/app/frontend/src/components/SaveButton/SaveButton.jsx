import React from "react";
import s from "./style.module.css";

export default function SaveButton({ onClick }) {
    return (
        <div className={s.submit_container}>
            <button type="submit" onClick={onClick}>Save</button>
        </div>
    );
}